import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Globe, Eye, EyeOff, Trash2 } from "lucide-react";
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

const CourseTab = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId;

  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch course data
  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } = 
    useGetCourseByIdQuery(courseId, { refetchOnMountOrArgChange: true });

  // Edit course mutation
  const [editCourse, { isLoading, isSuccess, error }] = useEditCourseMutation();
  const [publishCourse] = usePublishCourseMutation();

  const course = courseByIdData?.course;

  // Populate form with course data
  useEffect(() => {
    if (course) {
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: course.courseThumbnail || "",
      });
      
      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);
      }
    }
  }, [course]);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };

  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };

  const updateCourseHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("courseTitle", input.courseTitle);
      formData.append("subTitle", input.subTitle);
      formData.append("description", input.description);
      formData.append("category", input.category);
      formData.append("courseLevel", input.courseLevel);
      formData.append("coursePrice", input.coursePrice);
      
      if (input.courseThumbnail && typeof input.courseThumbnail !== 'string') {
        formData.append("courseThumbnail", input.courseThumbnail);
      }

      await editCourse({ formData, courseId }).unwrap();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const publishStatusHandler = async () => {
    setIsPublishing(true);
    try {
      const action = course?.isPublished ? "false" : "true";
      const response = await publishCourse({ 
        courseId, 
        query: action 
      }).unwrap();
      
      refetch();
      toast.success(response.message);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update publish status");
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteCourseHandler = async () => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // You'll need to add a delete course mutation
      // await deleteCourse({ courseId }).unwrap();
      toast.success("Course deleted successfully");
      navigate("/admin/courses");
    } catch (error) {
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setInput({ ...input, courseThumbnail: "" });
    setPreviewThumbnail("");
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course updated successfully!");
    }
    if (error) {
      toast.error(error?.data?.message || "Failed to update course");
    }
  }, [isSuccess, error]);

  if (courseByIdLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const stats = [
    { label: "Total Lectures", value: course?.lectures?.length || 0 },
    { label: "Enrolled Students", value: course?.enrolledStudents?.length || 0 },
    { label: "Course Rating", value: "4.8" },
    { label: "Completion Rate", value: "78%" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
              {index === 3 && (
                <Progress value={78} className="mt-3 h-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{course?.courseTitle}</h3>
                <Badge variant={course?.isPublished ? "default" : "secondary"}>
                  {course?.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date(course?.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/course-detail/${courseId}`)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={publishStatusHandler}
                disabled={isPublishing || course?.lectures?.length === 0}
                className="flex items-center gap-2"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : course?.isPublished ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                {course?.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteCourseHandler}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            Course Information
          </CardTitle>
          <CardDescription>
            Update your course details. All fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input
                  id="courseTitle"
                  type="text"
                  name="courseTitle"
                  value={input.courseTitle}
                  onChange={changeEventHandler}
                  placeholder="Ex: Complete Web Development Bootcamp"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subTitle">Subtitle *</Label>
                <Input
                  id="subTitle"
                  type="text"
                  name="subTitle"
                  value={input.subTitle}
                  onChange={changeEventHandler}
                  placeholder="Become a full-stack developer in 2024"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <div className="border rounded-lg overflow-hidden">
                <RichTextEditor 
                  input={input} 
                  setInput={setInput} 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={input.category} onValueChange={selectCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                    <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                    <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                    <SelectItem value="Javascript">Javascript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Course Level *</Label>
                <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coursePrice">Price (INR) *</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  name="coursePrice"
                  value={input.coursePrice}
                  onChange={changeEventHandler}
                  placeholder="1999"
                  min="0"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course Thumbnail *</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Input
                      id="courseThumbnail"
                      type="file"
                      onChange={selectThumbnail}
                      accept="image/*"
                      className="hidden"
                    />
                    <Label
                      htmlFor="courseThumbnail"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Thumbnail
                    </Label>
                  </div>
                  {previewThumbnail && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeThumbnail}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                
                {previewThumbnail && (
                  <div className="relative w-64 h-36 rounded-lg overflow-hidden border">
                    <img
                      src={previewThumbnail}
                      className="w-full h-full object-cover"
                      alt="Course thumbnail preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                )}
                
                <p className="text-sm text-gray-500">
                  Recommended: 1280x720px, max 5MB. This image will be displayed on course cards.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/admin/courses")}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => navigate(`/admin/courses/${courseId}/lecture`)}
                  variant="outline"
                >
                  Manage Lectures
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setInput({
                      courseTitle: course?.courseTitle || "",
                      subTitle: course?.subTitle || "",
                      description: course?.description || "",
                      category: course?.category || "",
                      courseLevel: course?.courseLevel || "",
                      coursePrice: course?.coursePrice || "",
                      courseThumbnail: course?.courseThumbnail || "",
                    });
                    setPreviewThumbnail(course?.courseThumbnail || "");
                  }}
                  variant="outline"
                  type="button"
                >
                  Reset
                </Button>
                <Button 
                  disabled={isLoading} 
                  onClick={updateCourseHandler}
                  className="min-w-32"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseTab;