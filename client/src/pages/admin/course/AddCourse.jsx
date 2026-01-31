import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, PlusCircle } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");
  const [createCourse, { data, error, isSuccess, isLoading }] = useCreateCourseMutation();
  const navigate = useNavigate();

  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    if (!courseTitle.trim()) {
      toast.error("Please enter a course title");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    try {
      await createCourse({ courseTitle, category });
    } catch (err) {
      toast.error("Failed to create course");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created successfully!");
      navigate("/admin/courses");
    }
    
    if (error) {
      toast.error(error?.data?.message || "Failed to create course");
    }
  }, [isSuccess, error, data, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/courses")}
            className="rounded-full hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Course
            </h1>
            <p className="text-gray-400 mt-2">
              Start your journey by creating a new course. You can add more details later.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b">
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-6 w-6 text-blue-600" />
                  Course Information
                </CardTitle>
                <CardDescription>
                  Fill in the basic details to get started with your course creation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="courseTitle" className="text-lg font-medium">
                      Course Title *
                    </Label>
                    <Input
                      id="courseTitle"
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Ex: Complete Web Development Bootcamp 2024"
                      className="h-12 text-lg border-2 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    <p className="text-sm text-gray-500">
                      Choose a compelling title that describes what students will learn
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-lg font-medium">
                      Category *
                    </Label>
                    <Select onValueChange={getSelectedCategory}>
                      <SelectTrigger className="h-12 border-2 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Next JS" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            Next JS
                          </div>
                        </SelectItem>
                        <SelectItem value="Data Science" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            Data Science
                          </div>
                        </SelectItem>
                        <SelectItem value="Frontend Development" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            Frontend Development
                          </div>
                        </SelectItem>
                        <SelectItem value="Fullstack Development" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            Fullstack Development
                          </div>
                        </SelectItem>
                        <SelectItem value="MERN Stack Development" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            MERN Stack Development
                          </div>
                        </SelectItem>
                        <SelectItem value="Javascript" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            Javascript
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Choose the most relevant category for your course
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin/courses")}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Courses
                    </Button>
                    <Button
                      disabled={isLoading || !courseTitle.trim() || !category}
                      onClick={createCourseHandler}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Course
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tips */}
          <div className="space-y-6">
            <Card className="border-blue-800 bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm">Keep your title clear and descriptive</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm">Choose the right category to reach your target audience</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm">You can add more details like description, price, and thumbnail after creation</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-800 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-lg">📝 Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                  <div className="h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Create Course</h4>
                    <p className="text-sm text-gray-400">Basic information</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Add Lectures</h4>
                    <p className="text-sm text-gray-500">Video content & materials</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Publish</h4>
                    <p className="text-sm text-gray-500">Make it live for students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;