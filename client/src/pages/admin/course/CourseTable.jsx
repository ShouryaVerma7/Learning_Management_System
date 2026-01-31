import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTable = () => {
  const { data, isLoading, error } = useGetCreatorCourseQuery();
  const navigate = useNavigate();

  // Handle loading state
  if (isLoading) return <div className="flex justify-center items-center p-8"><h1>Loading...</h1></div>
  
  // Handle error state
  if (error) return (
    <div className="flex justify-center items-center p-8">
      <h1 className="text-red-500">Error loading courses</h1>
    </div>
  )

  // Handle no data state
  if (!data || !data.courses || data.courses.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={() => navigate(`create`)}>Create a new course</Button>
        <div className="text-center p-8 border rounded-lg">
          <p>No courses found. Create your first course!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button className="cursor-pointer mt-2 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-200" onClick={() => navigate(`create`)}>Create a new course</Button>
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.courses.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="font-medium">
                {course?.coursePrice ? `₹${course.coursePrice}` : "Free"}
              </TableCell>
              <TableCell>
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{course.courseTitle}</TableCell>
              <TableCell className="text-right">
                <Button 
                  size='sm' 
                  variant='ghost' 
                  onClick={() => navigate(`${course._id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseTable;