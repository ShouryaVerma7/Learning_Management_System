// backend/routes/course.routes.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCourse,
  editCourse,
  getCourseById,
  getCreatorCourses,
  createLecture,
  getCourseLecture,
  editLecture,
  removeLecture,
  getLectureById,
  togglePublishCourse,
  getPublishedCourse,
  searchCourse
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Public search & published listing
router.route("/search").get(searchCourse);
router.route("/published-courses").get(getPublishedCourse);

// Authenticated routes
router.route("/").post(isAuthenticated, createCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), editCourse);
router.route("/:courseId").get(getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(getLectureById);
router.route("/:courseId/publish").patch(isAuthenticated, togglePublishCourse);

export default router;
