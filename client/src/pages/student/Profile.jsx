import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedIn } from "@/features/authSlice";
import { toast } from "react-hot-toast";

const Profile = () => {
  // ---------- STATE ----------
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Added dialog state

  // ---------- API CALLS ----------
  const { data, isLoading, error, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      isLoading: updateIsLoading,
      isSuccess,
      isError,
      error: updateError,
    },
  ] = useUpdateUserMutation();

  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((state) => state.auth);

  // ---------- EXTRACT USER ----------
  const user = data?.data || data?.user || data;

  // ---------- HOOKS ----------
  useEffect(() => {
    if (isSuccess) {
      toast.success("Profile updated successfully!");
      setIsDialogOpen(false);
      setName("");
      setProfilePhoto("");
      refetch();
    }
  }, [isSuccess, refetch]);

  useEffect(() => {
    if (isError) {
      toast.error(updateError?.data?.message || "Failed to update profile!");
    }
  }, [isError, updateError]);

  // ---------- HANDLERS ----------
  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    if (!name && !profilePhoto) {
      toast.error("Please enter name or select a photo to update!");
      return;
    }

    const formData = new FormData();
    if (name && name.trim() !== "") {
      formData.append("name", name);
    }
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }
    
    try {
      const result = await updateUser(formData).unwrap();
      console.log("Update result:", result); // Add this to debug
      
      // FIXED: Check the actual response structure
      if (result.user) {
        dispatch(userLoggedIn({ user: result.user }));
      } else if (result.data) {
        dispatch(userLoggedIn({ user: result.data }));
      } else {
        // If response structure is different, refetch user data
        refetch();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // ---------- RENDER ----------
  if (isLoading) {
    return <h1 className="text-center mt-10 text-gray-900 dark:text-white">Profile Loading...</h1>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 my-24">
      {error ? (
        <div className="text-center text-red-500">
          <h1 className="text-xl mb-2">Error loading profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
        </div>
      ) : !user ? (
        <div className="text-center">
          <h1 className="text-gray-900 dark:text-white">No user data found</h1>
          <p className="text-gray-600 dark:text-gray-400">Please make sure you are logged in.</p>
        </div>
      ) : (
        <>
          <h1 className="font-bold text-2xl text-center md:text-left text-gray-900 dark:text-white">PROFILE</h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
                <AvatarImage
                  src={
                    user?.photoUrl ||
                    user?.avatar ||
                    "https://github.com/shadcn.png"
                  }
                  alt="User"
                />
                <AvatarFallback className="text-gray-900 dark:text-white">
                  {user?.name?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div>
              <div className="mb-2">
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Name:
                  <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                    {user?.name || "Not available"}
                  </span>
                </h1>
              </div>

              <div className="mb-2">
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Email:
                  <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                    {user?.email || "Not available"}
                  </span>
                </h1>
              </div>

              <div className="mb-2">
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Role:
                  <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                    {user?.role?.toUpperCase() || "USER"}
                  </span>
                </h1>
              </div>

              {/* ---------- Edit Profile Dialog ---------- */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer mt-2 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-200"
                  >
                    Edit Profile
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Edit Profile</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-gray-900 dark:text-white">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={`Current: ${user?.name || ""}`}
                        className="col-span-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profilePhoto" className="text-gray-900 dark:text-white">Profile Photo</Label>
                      <Input
                        id="profilePhoto"
                        type="file"
                        onChange={onChangeHandler}
                        accept="image/*"
                        className="col-span-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-200"
                      disabled={updateIsLoading || (!name && !profilePhoto)}
                      onClick={updateUserHandler}
                    >
                      {updateIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin cursor-pointer" />
                          Please Wait
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ---------- Courses Section ---------- */}
          <div>
            <h1 className="font-medium text-lg text-gray-900 dark:text-white">
              Courses you are enrolled in
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5">
              {!user?.enrolledCourses ||
              user.enrolledCourses.length === 0 ? (
                <h1 className="text-gray-600 dark:text-gray-400">You haven't enrolled in any courses yet</h1>
              ) : (
                user.enrolledCourses.map((course) => (
                  <Course course={course} key={course._id} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;