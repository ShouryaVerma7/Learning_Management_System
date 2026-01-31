import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useCompleteCourseMutation, useGetCourseProgressQuery, useInCompleteCourseMutation, useUpdateLectureProgressMutation } from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, PlayCircle, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useLoadUserQuery } from "@/features/api/authApi";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  // All hooks must be called unconditionally at the top level
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [hasShownToast, setHasShownToast] = useState({ completed: false, incomplete: false });
  
  const { data: progressData, isLoading, isError, refetch: refetchProgress } = useGetCourseProgressQuery(courseId, {
    refetchOnMountOrArgChange: true
  });
  
  // Also check user data to verify enrollment
  const { data: userData, refetch: refetchUser } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess, reset: resetComplete }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess, reset: resetIncomplete }] = useInCompleteCourseMutation();

  useEffect(() => {
    if (completedSuccess && !hasShownToast.completed) {
      refetchProgress();
      toast.success(markCompleteData?.message || "Course marked as completed!");
      setHasShownToast(prev => ({ ...prev, completed: true }));
      setTimeout(() => {
        resetComplete();
        setHasShownToast(prev => ({ ...prev, completed: false }));
      }, 100);
    }
    
    if (inCompletedSuccess && !hasShownToast.incomplete) {
      refetchProgress();
      toast.success(markInCompleteData?.message || "Course marked as incomplete!");
      setHasShownToast(prev => ({ ...prev, incomplete: true }));
      setTimeout(() => {
        resetIncomplete();
        setHasShownToast(prev => ({ ...prev, incomplete: false }));
      }, 100);
    }
  }, [completedSuccess, inCompletedSuccess, markCompleteData, markInCompleteData, refetchProgress, hasShownToast, resetComplete, resetIncomplete]);

  // Check if user is actually enrolled
  useEffect(() => {
    if (userData && progressData) {
      const user = userData?.data || userData?.user || userData;
      const enrolledCourses = user?.enrolledCourses || [];
      
      const isEnrolled = enrolledCourses.some(course => {
        const courseIdToCheck = course._id || course.course?._id || course.courseId;
        return courseIdToCheck === courseId;
      });
      
      // Check localStorage as backup
      const purchasedCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
      const purchasedFromStorage = purchasedCourses.includes(courseId);
      
      if (!isEnrolled && !purchasedFromStorage && !progressData?.data?.courseDetails) {
        console.log("User not enrolled, redirecting...");
        toast.error("You need to purchase this course first");
        setTimeout(() => {
          navigate(`/course-detail/${courseId}`);
        }, 1000);
      }
    }
  }, [userData, progressData, courseId, navigate]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading course content...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md p-8 bg-gray-900 rounded-xl border border-gray-800">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You need to purchase this course to access the content.
          </p>
          <Button 
            onClick={() => navigate(`/course-detail/${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Course Details
          </Button>
        </div>
      </div>
    );
  }

  // Check the data structure
  console.log("Progress Data:", progressData);
  
  // Extract data with multiple fallbacks
  const progressDataExtracted = progressData?.data || progressData;
  const courseDetails = progressDataExtracted?.courseDetails || progressDataExtracted?.course || {};
  const progress = progressDataExtracted?.progress || [];
  const completed = progressDataExtracted?.completed || false;
  
  const { courseTitle, lectures } = courseDetails;
  
  if (!courseTitle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md p-8 bg-gray-900 rounded-xl border border-gray-800">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-gray-400 mb-6">
            The course content is not available or you don't have access.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => navigate(`/course-detail/${courseId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go Back
            </Button>
            <Button 
              onClick={refetchProgress}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleLectureProgress = async (lectureId) => {
    try {
      await updateLectureProgress({ courseId, lectureId });
      refetchProgress();
    } catch (error) {
      console.error("Error updating lecture progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleLectureClick = (index, lecture) => {
    setCurrentLectureIndex(index);
    if (lecture?._id) {
      handleLectureProgress(lecture._id);
    }
  };

  const currentLectureData = lectures?.[currentLectureIndex];

  const isLectureCompleted = (lectureId) => {
    return progress?.some((prog) => prog.lectureId === lectureId && prog.viewed) || false;
  };

  const handleCompleteCourse = async () => {
    try {
      await completeCourse(courseId);
    } catch (error) {
      console.error("Error completing course:", error);
      toast.error("Failed to mark course as completed");
    }
  };

  const handleInCompleteCourse = async () => {
    try {
      await inCompleteCourse(courseId);
    } catch (error) {
      console.error("Error marking course as incomplete:", error);
      toast.error("Failed to mark course as incomplete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-16 px-4">
      {/* Display course name */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{courseTitle}</h1>
            <p className="text-gray-400 mt-2">
              {lectures?.length || 0} lectures • Continue your learning journey
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse} 
            variant={completed ? "outline" : "default"}
          >
            {completed ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Completed</span>
              </div>
            ) : (
              "Mark as completed"
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Video Section */}
        <div className="lg:flex-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            {/* React Player for video */}
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {currentLectureData?.videoUrl ? (
                <ReactPlayer
                  width="100%"
                  height="100%"
                  url={currentLectureData.videoUrl}
                  controls={true}
                  playing={false}
                  onPlay={() => handleLectureProgress(currentLectureData?._id)}
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload'
                      }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                  <PlayCircle size={64} className="text-gray-500 mb-4" />
                  <p className="text-gray-400 text-lg">No video available</p>
                  <p className="text-gray-500 text-sm mt-2">Video content coming soon</p>
                </div>
              )}
            </div>
            
            {/* Display current watching lecture title */}
            <div>
              <h3 className="font-medium text-xl text-white mb-2">
                {currentLectureData?.lectureTitle || "No lecture available"}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Lecture {currentLectureIndex + 1} of {lectures?.length || 0}
                </p>
                {currentLectureData?.duration && (
                  <Badge className="bg-gray-800 text-gray-400">
                    {currentLectureData.duration}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lecture sidebar */}
        <div className="lg:w-96">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="font-semibold text-xl text-white mb-4">Course Lectures</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {lectures?.length > 0 ? (
                lectures.map((lecture, idx) => {
                  const isCompleted = isLectureCompleted(lecture._id);
                  const isCurrent = currentLectureIndex === idx;
                  
                  return (
                    <div 
                      key={lecture._id || idx} 
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-blue-900/30 border border-blue-700' 
                          : 'hover:bg-gray-800 border border-transparent'
                      }`}
                      onClick={() => handleLectureClick(idx, lecture)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 size={20} className="text-green-500" />
                          ) : (
                            <CirclePlay size={20} className={isCurrent ? "text-blue-400" : "text-gray-500"} />
                          )}
                          <div>
                            <h4 className="font-medium text-white text-sm">
                              {lecture.lectureTitle || `Lecture ${idx + 1}`}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {lecture.duration || "Duration not specified"}
                            </p>
                          </div>
                        </div>
                        {isCompleted && (
                          <Badge className="bg-green-900/30 text-green-400 border-0">
                            Watched
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CirclePlay size={48} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No lectures available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className="mt-4 bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-semibold text-white mb-3">Your Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Lectures completed</span>
                <span className="text-white">
                  {progress.filter(p => p.viewed).length} of {lectures?.length || 0}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: lectures?.length 
                      ? `${(progress.filter(p => p.viewed).length / lectures.length) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Course status</span>
                <span className={completed ? "text-green-400" : "text-yellow-400"}>
                  {completed ? "Completed" : "In Progress"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;