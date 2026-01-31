// backend/controllers/course.controller.js
import { Course } from '../models/course.model.js';
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { Lecture } from '../models/lecture.model.js';

// CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({ message: "Course title and category is required." });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id
    });

    return res.status(201).json({ course, message: "Course created." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create course" });
  }
};

// SEARCH COURSES
export const searchCourse = async (req, res) => {
  try {
    // Accept query, categories, sortByPrice
    const query = req.query.query ?? "";
    let categories = [];
    if (req.query.categories) {
      // categories can be comma separated: "docker,js"
      categories = Array.isArray(req.query.categories)
        ? req.query.categories
        : String(req.query.categories).split(",").map(s => s.trim()).filter(Boolean);
    }
    const sortByPrice = req.query.sortByPrice ?? "";

    // Build search criteria
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subtitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    };

    // If category filter provided, apply $in
    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
      // remove the category regex from $or to avoid conflict (optional)
      searchCriteria.$or = [
        { courseTitle: { $regex: query, $options: "i" } },
        { subtitle: { $regex: query, $options: "i" } }
      ];
    }

    // Sorting
    const sortOptions = {};
    if (sortByPrice === "low") sortOptions.coursePrice = 1;
    if (sortByPrice === "high") sortOptions.coursePrice = -1;

    const courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);

    return res.status(200).json({ success: true, courses: courses || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to search course" });
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate({ path: "creator", select: "name photoUrl" });
    return res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get published course" });
  }
};

// GET CREATOR COURSES
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    return res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch courses" });
  }
};

// EDIT COURSE
export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { courseTitle, subtitle, description, category, courseLevel, coursePrice } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    const updateData = {
      courseTitle,
      subtitle,
      description,
      category,
      courseLevel,
      coursePrice,
      ...(courseThumbnail && { courseThumbnail: courseThumbnail?.secure_url })
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    return res.status(200).json({ course, message: "Course updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update course" });
  }
};

// GET COURSE BY ID
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate({ path: "creator", select: "name photoUrl" })
      .populate("lectures"); // ADD THIS LINE
    if (!course) return res.status(404).json({ message: "Course not found!" });
    return res.status(200).json({ course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get course by id" });
  }
};

// CREATE LECTURE
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({ message: "Lecture title and course ID are required" });
    }

    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.lectures.push(lecture._id);
    await course.save();

    return res.status(201).json({ lecture, message: "Lecture created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create lecture" });
  }
};

// GET LECTURES
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json({ lectures: course.lectures });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get lecture" });
  }
};

// EDIT LECTURE
export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, isPreviewFree, videoInfo } = req.body;
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!" });

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    if (typeof isPreviewFree === "boolean") lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(200).json({ lecture, message: "Lecture updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update lecture" });
  }
};

// REMOVE LECTURE
export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!" });

    if (lecture.publicId) {
      await deleteMediaFromCloudinary(lecture.publicId);
    }

    await Course.updateOne({ lectures: lectureId }, { $pull: { lectures: lectureId } });

    return res.status(200).json({ message: "Lecture removed successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove lecture" });
  }
};

// GET LECTURE BY ID
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!" });
    return res.status(200).json({ lecture });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get lecture by id" });
  }
};

// TOGGLE PUBLISH
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const publish = req.query.publish === "true";

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    if (publish) {
      const requiredFields = ['courseTitle', 'description', 'category', 'courseLevel'];
      const missingFields = requiredFields.filter(field => !course[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Cannot publish course. Missing required fields: ${missingFields.join(', ')}`,
          missingFields
        });
      }
      const validLevels = ["Beginner", "Intermediate", "Advance"];
      if (!validLevels.includes(course.courseLevel)) {
        return res.status(400).json({ message: `Invalid course level. Must be one of: ${validLevels.join(', ')}` });
      }
    }

    course.isPublished = publish;
    await course.save();

    return res.status(200).json({
      message: `Course ${course.isPublished ? "Published" : "Unpublished"} successfully`,
      isPublished: course.isPublished
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Failed to update status" });
  }
};
