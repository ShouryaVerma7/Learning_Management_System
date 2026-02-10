import React, { useEffect, useState } from 'react'
import Course from './Course';
import { useLoadUserQuery } from '@/features/api/authApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen, ExternalLink, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { useSelector } from 'react-redux';

const MyLearning = () => {
  const { data, isLoading, error, refetch } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // Get user from Redux store
  const { user: reduxUser } = useSelector((state) => state.auth);

  // Refetch when component mounts
  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  // Function to fetch individual course details
  const fetchCourseDetails = async (courseId) => {
    try {
      console.log(`🔄 Fetching course: ${courseId}`);
      const response = await fetch(`http://localhost:8080/api/v1/courses/${courseId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`✅ Course ${courseId} response:`, result);
      
      // Your course API returns different structures
      let courseData = result.data || result.course || result;
      
      if (!courseData) {
        console.warn(`⚠️ No course data found for ${courseId}`);
        return null;
      }
      
      return {
        _id: courseData._id || courseData.id || courseId,
        courseTitle: courseData.courseTitle || courseData.title || `Course ${courseId.substring(0, 8)}...`,
        coursePrice: courseData.coursePrice || courseData.price || 0,
        courseThumbnail: courseData.courseThumbnail || courseData.thumbnail || null,
        category: courseData.category || "General",
        courseLevel: courseData.courseLevel || "Beginner",
        creator: courseData.creator || { name: "Instructor" },
        progress: 0,
        enrolledStudents: courseData.enrolledStudents || [],
        averageRating: courseData.averageRating || 4.5,
        totalDuration: courseData.totalDuration || "10h 0m",
        description: courseData.description || "",
        subtitle: courseData.subtitle || "",
        isPublished: courseData.isPublished || false
      };
      
    } catch (error) {
      console.error(`❌ Error fetching course ${courseId}:`, error);
      return null;
    }
  };

  // Main function to load and process courses
  useEffect(() => {
    const loadCourses = async () => {
      if (isLoading || refreshing) return;
      
      console.log("🔄 Starting course loading process...");
      setFetchingDetails(true);
      
      try {
        // STEP 1: Extract course IDs from all possible sources
        let courseIds = [];
        let source = "unknown";
        
        // Check API response first
        if (data) {
          console.log("📊 API Response Structure:", data);
          
          // Check different possible structures
          if (data?.data?.enrolledCourses) {
            courseIds = data.data.enrolledCourses;
            source = "api.data.enrolledCourses";
          } else if (data?.enrolledCourses) {
            courseIds = data.enrolledCourses;
            source = "api.enrolledCourses";
          } else if (data?.data?.user?.enrolledCourses) {
            courseIds = data.data.user.enrolledCourses;
            source = "api.data.user.enrolledCourses";
          }
        }
        
        // Check Redux store
        if (courseIds.length === 0 && reduxUser?.enrolledCourses) {
          courseIds = reduxUser.enrolledCourses;
          source = "redux.enrolledCourses";
        }
        
        // Check localStorage auth
        if (courseIds.length === 0) {
          try {
            const authData = JSON.parse(localStorage.getItem('auth') || '{}');
            if (authData?.user?.enrolledCourses) {
              courseIds = authData.user.enrolledCourses;
              source = "localStorage.auth";
            }
          } catch (e) {
            console.error("Error parsing localStorage auth:", e);
          }
        }
        
        // Check purchasedCourses as last resort
        if (courseIds.length === 0) {
          const localStorageCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
          if (localStorageCourses.length > 0) {
            courseIds = localStorageCourses;
            source = "localStorage.purchasedCourses";
          }
        }
        
        console.log(`📦 Found ${courseIds.length} course IDs from source: ${source}`);
        console.log("🔍 Course IDs:", courseIds);
        
        // STEP 2: Process course IDs to get actual IDs
        const processedIds = [];
        
        for (const item of courseIds) {
          if (typeof item === 'string') {
            // It's already a string ID
            processedIds.push(item);
          } else if (item && item._id) {
            // It's an object with _id
            processedIds.push(item._id);
          } else if (item && item.id) {
            // It's an object with id
            processedIds.push(item.id);
          } else {
            console.warn("⚠️ Skipping invalid course item:", item);
          }
        }
        
        console.log("✅ Processed IDs:", processedIds);
        
        // STEP 3: Fetch details for each course
        if (processedIds.length > 0) {
          const coursesWithDetails = [];
          let successCount = 0;
          let failCount = 0;
          
          // Show loading toast for multiple courses
          if (processedIds.length > 1) {
            toast.loading(`Loading ${processedIds.length} courses...`);
          }
          
          for (let i = 0; i < processedIds.length; i++) {
            const courseId = processedIds[i];
            
            try {
              const courseDetails = await fetchCourseDetails(courseId);
              
              if (courseDetails) {
                coursesWithDetails.push(courseDetails);
                successCount++;
                
                // Update progress for user feedback
                if (processedIds.length > 3) {
                  console.log(`📊 Progress: ${i + 1}/${processedIds.length} courses loaded`);
                }
              } else {
                // Create fallback course object
                coursesWithDetails.push({
                  _id: courseId,
                  courseTitle: `Course ${courseId.substring(0, 8)}...`,
                  coursePrice: 0,
                  courseThumbnail: null,
                  category: "General",
                  courseLevel: "Beginner",
                  creator: { name: "Instructor" },
                  progress: 0,
                  isFallback: true
                });
                failCount++;
              }
              
              // Small delay to avoid overwhelming the server
              if (i < processedIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
            } catch (error) {
              console.error(`❌ Failed to process course ${courseId}:`, error);
              failCount++;
            }
          }
          
          // Dismiss loading toast
          toast.dismiss();
          
          console.log(`🎯 Loaded ${successCount} courses successfully, ${failCount} failed`);
          console.log("📚 Final courses:", coursesWithDetails);
          
          setAllCourses(coursesWithDetails);
          
          // Show success message
          if (successCount > 0) {
            toast.success(`Loaded ${successCount} course${successCount > 1 ? 's' : ''}`);
          }
          if (failCount > 0) {
            toast.error(`${failCount} course${failCount > 1 ? 's' : ''} failed to load`);
          }
          
        } else {
          console.log("⚠️ No valid course IDs found");
          setAllCourses([]);
        }
        
      } catch (error) {
        console.error("❌ Error in loadCourses:", error);
        toast.error("Failed to load courses");
        setAllCourses([]);
      } finally {
        setFetchingDetails(false);
      }
    };
    
    // Only run if we have data or reduxUser
    if (data || reduxUser) {
      loadCourses();
    }
    
  }, [data, isLoading, reduxUser, refreshing]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Refreshing courses...');
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error('Failed to refresh');
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

  // Debug function
  const debugAPIResponse = () => {
    console.log("=== 🔍 DEBUG INFO ===");
    console.log("1. API Response:", data);
    console.log("2. Redux User:", reduxUser);
    console.log("3. All Courses State:", allCourses);
    console.log("4. Loading States:", { isLoading, refreshing, fetchingDetails });
    
    // Test a specific course fetch
    if (allCourses.length > 0) {
      const firstCourseId = allCourses[0]._id;
      console.log(`5. Testing fetch for course ${firstCourseId}:`);
      fetchCourseDetails(firstCourseId).then(result => {
        console.log("   Fetch result:", result);
      });
    }
    
    toast.success("Debug info logged to console");
  };

  // Test if backend population is working
  const testBackendPopulation = () => {
    console.log("=== 🧪 TESTING BACKEND ===");
    console.log("Checking if courses are populated in API response...");
    
    if (data?.data?.enrolledCourses?.[0]) {
      const firstCourse = data.data.enrolledCourses[0];
      console.log("First course in API response:", firstCourse);
      console.log("Has courseTitle?", !!firstCourse.courseTitle);
      console.log("Has courseThumbnail?", !!firstCourse.courseThumbnail);
      console.log("Type of item:", typeof firstCourse);
      
      if (typeof firstCourse === 'string') {
        console.log("❌ Courses are NOT populated - they're just IDs");
        toast.error("Backend is returning course IDs, not populated objects");
      } else if (firstCourse.courseTitle) {
        console.log("✅ Courses ARE populated properly");
        toast.success("Backend population is working");
      } else {
        console.log("⚠️ Unknown course structure");
        toast.warning("Unknown course structure in API");
      }
    } else {
      console.log("No courses in API response");
      toast.info("No courses found in API response");
    }
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
            disabled={refreshing || isLoading || fetchingDetails}
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

    

      <div className='my-8'>
        {isLoading || refreshing || fetchingDetails ? (
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
            
            {/* Debug info for developers */}
            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg text-left">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Information:</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div>API Data: {data ? "Loaded" : "Not loaded"}</div>
                <div>Redux User: {reduxUser ? "Exists" : "Not exists"}</div>
                <div>LocalStorage Purchased: {JSON.parse(localStorage.getItem('purchasedCourses') || '[]').length} items</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
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
                {allCourses.some(c => c.isFallback) && (
                  <p className="text-sm text-yellow-400 mt-1">
                    ⚠️ Some courses have limited details
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* <Button 
                  onClick={handleRefresh}
                  size="sm" 
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button> */}
              </div>
            </div>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {allCourses.map((course, index) => {
                if (!course || !course._id) {
                  return null;
                }
                
                return (
                  <div key={course._id} className="relative group">
                    {course.isFallback && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-red-900/80 text-red-300 border-red-700 text-xs">
                          Limited
                        </Badge>
                      </div>
                    )}
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
            
            {/* Tips section */}
            {allCourses.some(c => !c.courseThumbnail || c.isFallback) && (
              <div className="mt-8 p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">
                      Courses showing without images/details?
                    </p>
                    <p className="text-gray-400 text-xs">
                      This means the courses in your enrolled list are just IDs, not full course objects.
                      The system fetched details individually. For better performance, ask your backend developer
                      to fix the user profile endpoint to return populated course objects.
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                      onClick={testBackendPopulation}
                    >
                      Test Backend Population
                    </Button>
                  </div>
                </div>
              </div>
            )}
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

export default MyLearning;