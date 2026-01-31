import React, { useEffect, useState } from 'react'
import Course from './Course';
import { useLoadUserQuery } from '@/features/api/authApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

const MyLearning = () => {
  const { data, isLoading, error, refetch } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [allCourses, setAllCourses] = useState([]);

  // Refetch when component mounts
  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  // Extract courses from API response
  useEffect(() => {
    if (data && !isLoading) {
      console.log("🔍 MyLearning - Full API Response:", data);
      
      let extractedCourses = [];
      
      // Try multiple possible structures
      const responseData = data?.data || data;
      
      // Structure 1: responseData.user.enrolledCourses
      if (responseData?.user?.enrolledCourses) {
        console.log("📦 Found in: responseData.user.enrolledCourses");
        extractedCourses = responseData.user.enrolledCourses;
      }
      // Structure 2: responseData.enrolledCourses
      else if (responseData?.enrolledCourses) {
        console.log("📦 Found in: responseData.enrolledCourses");
        extractedCourses = responseData.enrolledCourses;
      }
      // Structure 3: data.enrolledCourses (root level)
      else if (data?.enrolledCourses) {
        console.log("📦 Found in: data.enrolledCourses");
        extractedCourses = data.enrolledCourses;
      }
      // Structure 4: responseData.courses
      else if (responseData?.courses) {
        console.log("📦 Found in: responseData.courses");
        extractedCourses = responseData.courses;
      }
      // Structure 5: Check if user object exists with enrolledCourses
      else if (responseData?.enrolledCourses) {
        console.log("📦 Found in: responseData (direct)");
        extractedCourses = responseData.enrolledCourses;
      }
      // Structure 6: If data itself is an array
      else if (Array.isArray(responseData)) {
        console.log("📦 Found in: responseData (array)");
        extractedCourses = responseData;
      }
      
      console.log("✅ Extracted courses array:", extractedCourses);
      console.log("✅ Number of courses:", extractedCourses.length);
      
      // Process each course to ensure proper structure
      const processedCourses = extractedCourses.map((course, index) => {
        console.log(`📝 Processing course ${index}:`, course);
        
        let courseData = course;
        
        // If course is nested in a 'course' property
        if (course?.course && typeof course.course === 'object') {
          courseData = course.course;
        }
        
        // If we have minimal data, create a proper course object
        if (!courseData._id && (course.courseId || course._id)) {
          courseData = {
            _id: course.courseId || course._id,
            courseTitle: course.courseTitle || `Course ${course.courseId || course._id}`,
            coursePrice: course.coursePrice || 0,
            courseThumbnail: course.courseThumbnail || null,
            category: course.category || "General",
            courseLevel: course.courseLevel || "Beginner",
            creator: course.creator || { name: "Instructor" }
          };
        }
        
        console.log(`✅ Processed course ${index}:`, courseData);
        return courseData;
      });
      
      setAllCourses(processedCourses);
      
      // Also check localStorage for courses not yet in API response
      const localStorageCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
      console.log("💾 localStorage courses:", localStorageCourses);
      
      if (localStorageCourses.length > 0 && processedCourses.length === 0) {
        // toast.info(
        //   <div className="flex items-center gap-2">
        //     <AlertCircle className="h-4 w-4" />
        //     <span>Courses found in local storage but not in API. Please refresh.</span>
        //   </div>,
        //   { duration: 5000 }
        // );
      }
    }
  }, [data, isLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Courses refreshed successfully!');
    } catch (err) {
      toast.error('Failed to refresh courses');
    } finally {
      setRefreshing(false);
    }
  };

  const handleBrowseCourses = () => {
    navigate('/');
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course-detail/${courseId}`);
  };

  return (
    <div className='max-w-7xl mx-auto my-24 px-4 md:px-6'>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className='font-bold text-3xl text-white mb-2'>MY LEARNING</h1>
          <p className="text-gray-400">All your enrolled courses in one place</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="border-gray-700 hover:bg-gray-800 text-white"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={handleBrowseCourses}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Browse More Courses
          </Button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Debug Info: </span>
            <span className="text-white">{allCourses.length} courses found</span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              console.log("🔄 Current state:");
              console.log("- allCourses:", allCourses);
              console.log("- API data:", data);
              console.log("- localStorage:", JSON.parse(localStorage.getItem('purchasedCourses') || '[]'));
              toast.success("Debug info logged to console");
            }}
            className="text-xs text-gray-400 hover:text-white"
          >
            Show Debug
          </Button>
        </div>
      </div>

      <div className='my-8'>
        {isLoading || refreshing ? (
          <MyLearningSkeleton />
        ) : error ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <div className="h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-red-400">Error Loading Courses</h3>
            <p className="text-gray-400 mb-4">
              {error?.data?.message || error?.message || 'Please try again'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleRefresh} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white"
              >
                Browse Courses
              </Button>
            </div>
          </div>
        ) : allCourses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="h-20 w-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No Courses Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse our catalog and start learning today!
            </p>
            
            {/* Check localStorage for courses */}
            {(() => {
              const localStorageCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
              if (localStorageCourses.length > 0) {
                return (
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                      <p className="text-blue-300">Found {localStorageCourses.length} course(s) in local storage</p>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      These courses have been purchased but are not yet showing from the API.
                      This usually syncs automatically within a few minutes.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {localStorageCourses.slice(0, 3).map((courseId, idx) => (
                        <Badge key={idx} className="bg-blue-900/30 text-blue-300 border-blue-800">
                          Course {courseId.substring(0, 8)}...
                        </Badge>
                      ))}
                      {localStorageCourses.length > 3 && (
                        <Badge className="bg-gray-800 text-gray-400">
                          +{localStorageCourses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleBrowseCourses}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Browse Courses
              </Button>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white"
              >
                Check Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-gray-400">
                  Showing <span className="font-semibold text-white">{allCourses.length}</span> 
                  course{allCourses.length !== 1 ? 's' : ''}
                </p>
                {allCourses.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-400">
                  <span className="text-green-400 font-medium">
                    {allCourses.filter(c => c.progress > 0).length}
                  </span> in progress
                </div>
              </div>
            </div>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {allCourses.map((course, index) => {
                console.log(`🎯 Rendering course ${index}:`, course);
                
                if (!course || !course._id) {
                  console.warn(`⚠️ Invalid course data at index ${index}:`, course);
                  return null;
                }
                
                return (
                  <div key={course._id} className="relative group">
                    <Course course={course} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-gray-900/80 backdrop-blur-sm border border-gray-700"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewCourse(course._id);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

const MyLearningSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-48 bg-gray-800 mb-2" />
        <Skeleton className="h-4 w-64 bg-gray-800" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 bg-gray-800" />
        <Skeleton className="h-10 w-32 bg-gray-800" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <Skeleton className="w-full h-48 bg-gray-800" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-6 w-3/4 bg-gray-800" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
                <Skeleton className="h-4 w-20 bg-gray-800" />
              </div>
              <Skeleton className="h-4 w-16 bg-gray-800" />
            </div>
            <Skeleton className="h-4 w-1/3 bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Add Badge component if not imported
import { Badge } from "@/components/ui/badge";

export default MyLearning;