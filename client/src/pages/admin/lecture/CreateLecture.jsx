import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetCourseLectureQuery } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Lecture from "./Lecture";
import { useCreateLectureMutation } from "@/features/api/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch
  } = useGetCourseLectureQuery(courseId);

  const createLectureHandler = async () => {
    if (!lectureTitle.trim()) {
      return toast.error("Lecture title is required");
    }
    await createLecture({ lectureTitle, courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Lecture created successfully");
      setLectureTitle("");
      refetch();
    }
    if (error) {
      console.error("Create lecture error:", error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  }, [isSuccess, error, refetch]);

  return (
    <div className="flex-1 mx-4 md:mx-6 lg:mx-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Lectures to Your Course
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Create engaging lectures for your students. Each lecture should have a clear title and content.
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">Lecture Title</Label>
              <Input
                type="text"
                onChange={(e) => setLectureTitle(e.target.value)}
                value={lectureTitle}
                placeholder="Enter lecture title (e.g., Introduction to JavaScript)"
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/courses/${courseId}`)}
                className="border-gray-300 dark:border-gray-700"
              >
                Back to Course
              </Button>

              <Button 
                disabled={isLoading} 
                onClick={createLectureHandler}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Lecture"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Current Lectures ({lectureData?.lectures?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lectureLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading lectures...</p>
            </div>
          ) : lectureError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Failed to load lectures.</p>
            </div>
          ) : lectureData?.lectures?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No lectures yet. Create your first lecture above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lectureData?.lectures?.map((lecture, index) => (
                <Lecture
                  key={lecture._id}
                  lecture={lecture}
                  courseId={courseId}
                  index={index}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLecture;