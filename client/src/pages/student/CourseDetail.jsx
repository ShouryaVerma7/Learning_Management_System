import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useLoadUserQuery } from "@/features/api/authApi";
import { 
  BadgeInfo, 
  Lock, 
  PlayCircle, 
  Users, 
  Clock, 
  Award, 
  CheckCircle,
  Star,
  FileText,
  Video,
  Download,
  Share2
} from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use both queries to ensure we have the most accurate data
  const { 
    data: courseStatusData, 
    isLoading: courseStatusLoading, 
    isError: courseStatusError, 
    refetch: refetchCourseStatus 
  } = useGetCourseDetailWithStatusQuery(courseId, {
    refetchOnMountOrArgChange: true
  });

  const { 
    data: userData, 
    isLoading: userLoading, 
    refetch: refetchUser 
  } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isPurchased, setIsPurchased] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check purchase status from multiple sources
  useEffect(() => {
    const checkPurchaseStatus = () => {
      setIsChecking(true);
      
      // Method 1: Check from course status API
      const purchasedFromCourseAPI = courseStatusData?.purchased || false;
      
      // Method 2: Check from user's enrolled courses
      let purchasedFromUser = false;
      if (userData) {
        const user = userData?.data || userData;
        const enrolledCourses = user?.enrolledCourses || [];
        
        // Check if course is in enrolled courses (handle both nested and flat structures)
        purchasedFromUser = enrolledCourses.some(course => {
          const courseIdToCheck = course._id || course.course?._id || course.courseId;
          return courseIdToCheck === courseId;
        });
      }
      
      // Method 3: Check localStorage as backup
      const purchasedCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
      const purchasedFromStorage = purchasedCourses.includes(courseId);
      
      setIsPurchased(purchasedFromCourseAPI || purchasedFromUser || purchasedFromStorage);
      setIsChecking(false);
    };
    
    if (!courseStatusLoading && !userLoading) {
      checkPurchaseStatus();
    }
  }, [courseStatusData, userData, courseId, courseStatusLoading, userLoading]);

  // Handle Stripe redirect and refresh data
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    
    if (sessionId || success === 'true') {
      console.log('Payment completed, refreshing data...');
      
      // Add to localStorage as immediate confirmation
      const purchasedCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
      if (!purchasedCourses.includes(courseId)) {
        purchasedCourses.push(courseId);
        localStorage.setItem('purchasedCourses', JSON.stringify(purchasedCourses));
      }
      
      // Show success message
      // toast.success("Purchase successful! Updating your courses...");
      
      // Refetch both data sources
      setTimeout(() => {
        refetchCourseStatus();
        refetchUser();
        
        // Clear URL parameters
        navigate(`/course-detail/${courseId}`, { replace: true });
      }, 1500);
    }
  }, [searchParams, courseId, navigate, refetchCourseStatus, refetchUser]);

  const handleContinueCourse = () => {
    if (isPurchased) {
      navigate(`/course-progress/${courseId}`);
    } else {
      toast.error("Please purchase the course first");
    }
  };

  const handleShareCourse = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Course link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalDuration = () => {
    if (!courseStatusData?.course?.lectures) return "0h 0m";
    const totalMinutes = courseStatusData.course.lectures.length * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  if (courseStatusLoading || userLoading || isChecking) {
    return <CourseDetailSkeleton />;
  }

  if (courseStatusError || !courseStatusData?.course) {
    return <CourseError />;
  }

  const { course } = courseStatusData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-24 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0 px-3 py-1">
                    {course.category}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 px-3 py-1">
                    {course.courseLevel}
                  </Badge>
                  {course.isPublished && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0 px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {course.courseTitle}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300">
                  {course.subTitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-white/20">
                    <AvatarImage src={course.creator?.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {course.creator?.name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.creator?.name || "Instructor"}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{calculateTotalDuration()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>{course.lectures?.length || 0} lectures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolledStudents?.length || 0} students</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-white">4.8</span>
                  <span className="text-gray-400">(1,234 reviews)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BadgeInfo className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">
                    Last updated {formatDate(course.updatedAt || course.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="sticky top-24">
              <Card className="overflow-hidden border-0 shadow-2xl bg-white/10 backdrop-blur-sm">
                {/* Thumbnail Display Section */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-purple-900">
                  {course?.courseThumbnail ? (
                    <>
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Course info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white text-sm font-medium">Course Preview</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center p-8">
                        <div className="bg-white/10 rounded-full p-6 inline-block mb-4">
                          <PlayCircle className="h-16 w-16 text-white/50" />
                        </div>
                        <p className="text-white/70 font-medium mb-2">No Thumbnail Available</p>
                        <p className="text-white/50 text-sm">Course preview image</p>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">
                      ₹{course.coursePrice}
                    </div>
                    {isPurchased && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 px-3 py-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Purchased
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isPurchased ? (
                      <>
                        <Button 
                          onClick={handleContinueCourse}
                          className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        >
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Continue Learning
                        </Button>
                        
                      
                      </>
                    ) : (
                      <BuyCourseButton 
                        courseId={courseId} 
                        onPurchaseSuccess={() => {
                          refetchCourseStatus();
                          refetchUser();
                          setIsPurchased(true);
                        }}
                      />
                    )}
                    
                    <Button 
                      // variant="outline" 
                      onClick={handleShareCourse}
                      className="w-full text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Course
                    </Button>
                  </div>

                  <div className="text-sm space-y-2">
                    {/* <div className="flex items-center justify-between">
                      <span className="text-gray-400">30-Day Money-Back Guarantee</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div> */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Full Lifetime Access</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Certificate of Completion</span>
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8">
            {["overview", "curriculum", "instructor", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">What you'll learn</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Build real-world applications",
                      "Master key concepts and best practices",
                      "Implement modern design patterns",
                      "Deploy and scale your projects",
                      "Troubleshoot and debug effectively",
                      "Prepare for technical interviews"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Course Description</h3>
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: course.description || "No description available" }}
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Basic programming knowledge</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Computer with internet connection</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Willingness to learn and practice</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="h-5 w-5" />
                      Course Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Duration</span>
                      <span className="font-semibold text-white">{calculateTotalDuration()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Lectures</span>
                      <span className="font-semibold text-white">{course.lectures?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Skill Level</span>
                      <Badge className="bg-blue-500/20 text-blue-400">{course.courseLevel}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Language</span>
                      <span className="font-semibold text-white">English</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Subtitles</span>
                      <span className="font-semibold text-white">English</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Course Curriculum</CardTitle>
                <CardDescription className="text-gray-400">
                  {course.lectures?.length || 0} lectures • {calculateTotalDuration()} total length
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.lectures?.length > 0 ? (
                    course.lectures.map((lecture, idx) => (
                      <div 
                        key={lecture._id || idx}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            isPurchased 
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-gray-800 text-gray-500'
                          }`}>
                            {isPurchased ? (
                              <PlayCircle className="h-5 w-5" />
                            ) : (
                              <Lock className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {lecture.lectureTitle}
                            </h4>
                            <p className="text-sm text-gray-400">
                              30 min • {isPurchased ? 'Available' : 'Locked'}
                            </p>
                          </div>
                        </div>
                        {isPurchased && lecture.resources?.length > 0 && (
                          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                            <Download className="h-4 w-4 mr-2" />
                            Resources
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No lectures added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "instructor" && course.creator && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">About the Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={course.creator.photoUrl} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {course.creator.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">{course.creator.name}</h3>
                    <p className="text-gray-400 mb-4">
                      Senior Developer & Instructor with 5+ years of experience
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">4.8</div>
                        <div className="text-sm text-gray-500">Instructor Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">50+</div>
                        <div className="text-sm text-gray-500">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">10K+</div>
                        <div className="text-sm text-gray-500">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">5+</div>
                        <div className="text-sm text-gray-500">Years Experience</div>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Passionate about teaching and helping students succeed in their careers. 
                      Focuses on practical, real-world skills that you can apply immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseDetailSkeleton = () => (
  <div className="min-h-screen pt-24 pb-16 px-4">
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="h-64 bg-gray-800 rounded-2xl animate-pulse"></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4 bg-gray-800" />
          <Skeleton className="h-4 w-full bg-gray-800" />
          <Skeleton className="h-4 w-full bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800" />
        </div>
        <Skeleton className="h-96 rounded-xl bg-gray-800" />
      </div>
    </div>
  </div>
);

const CourseError = () => (
  <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
    <div className="text-center">
      <div className="h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="h-8 w-8 bg-red-500 rounded-full"></div>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-white">Course Not Found</h2>
      <p className="text-gray-400 mb-6">
        The course you're looking for doesn't exist or has been removed.
      </p>
      <Button 
        onClick={() => window.history.back()} 
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Go Back
      </Button>
    </div>
  </div>
);

export default CourseDetail;