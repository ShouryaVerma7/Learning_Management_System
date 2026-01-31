import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";

const Courses = () => {
  const{data,isLoading,isError} =useGetPublishedCourseQuery()
  
  if (isError) return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-center text-red-600 dark:text-red-400 font-semibold text-xl">
          Failed to load courses. Please try again later.
        </h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-bold text-3xl text-center mb-10 text-gray-900 dark:text-white">
          Our Featured Courses
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({length: 8}).map((_,index) => (
              <CourseSkeleton key={index}/>
            ))}
          </div>
        ) : data?.courses?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No courses available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.courses?.map((course,index) => (
              <Course key={course._id || index} course={course}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-800">
      <Skeleton className="w-full h-48 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4 dark:bg-gray-800" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full dark:bg-gray-800" />
            <Skeleton className="h-4 w-20 dark:bg-gray-800" />
          </div>
          <Skeleton className="h-4 w-16 dark:bg-gray-800" />
        </div>
        <Skeleton className="h-4 w-1/3 dark:bg-gray-800" />
      </div>
    </div>
  );
};

export default Courses;