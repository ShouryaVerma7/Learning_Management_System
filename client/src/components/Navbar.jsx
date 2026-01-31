import React, { useEffect, useState } from "react";
import { Menu, School, Bell, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DarkMode } from "../DarkMode";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux"; // ADD useDispatch
import { userLoggedOut } from "@/features/authSlice"; // ADD THIS

const Navbar = () => {
  const authState = useSelector((state) => state.auth);
  const user = authState.user?.user || authState.user;
  const isAuthenticated = authState.isAuthenticated;
  const dispatch = useDispatch(); // ADD THIS
  
  const [logoutUser, { data, isSuccess, isLoading }] = useLogoutUserMutation(); // ADD isLoading
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logoutHandler = async () => {
    try {
      // Manually dispatch logout action FIRST to update UI immediately
      dispatch(userLoggedOut());
      
      // Then call the API
      await logoutUser().unwrap();
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Already handled in logoutHandler
    }
  }, [isSuccess, navigate]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800' 
        : 'bg-transparent'
    }`}>
      {/* Desktop Navbar */}
      <div className="max-w-7xl mx-auto hidden lg:flex items-center justify-between gap-6 h-20 px-6">
        <Link to="/" className="flex items-center gap-3 hover-lift">
          <div className="relative">
            <School size={32} className= " relative right-15 text-blue-600 dark:text-blue-400" />
            <div className="absolute -inset-1 bg-blue-500/20 blur-xl rounded-full"></div>
          </div>
          <div>
            <h1 className="relative right-15 position font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              E-Learning
            </h1>
            <p className="relative right-15 text-xs text-gray-500 dark:text-gray-400">Elevate your skills</p>
          </div>
        </Link>

        {/* Navigation Links - Add these for better UX */}
       

        

        <div className="flex items-center gap-4">
          {user && isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                    <Avatar className="h-9 w-9 border-2 border-blue-500/20">
                      <AvatarImage src={user?.photoUrl} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 animate-in slide-in-from-top-5" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/my-learning" className="cursor-pointer w-full">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          My Learning
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          Edit Profile
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    {user?.role === 'instructor' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/dashboard" className="cursor-pointer w-full">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              Instructor Dashboard
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logoutHandler}
                    disabled={isLoading} // ADD disabled state
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      {isLoading ? "Logging out..." : "Log out"}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Sign Up Free
              </Button>
            </div>
          )}
       
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex lg:hidden items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <School size={28} className="text-blue-600 dark:text-blue-400" />
          <h1 className="font-bold text-xl text-gradient">E-Learning</h1>
        </Link>
        
        <div className="flex items-center gap-3">
          <MobileNavbar 
            user={user} 
            isAuthenticated={isAuthenticated} 
            logoutHandler={logoutHandler}
            logoutLoading={isLoading} // PASS isLoading
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
          />
        </div>
      </div>
    </header>
  );
};

const MobileNavbar = ({ user, isAuthenticated, logoutHandler, logoutLoading, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <School className="h-6 w-6 text-blue-600" />
              <span className="text-gradient">E-Learning</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            {user && isAuthenticated ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <SheetClose asChild>
                    <Link 
                      to="/" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Home</span>
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link 
                      to="/course/search" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Browse Courses</span>
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link 
                      to="/my-learning" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span>My Learning</span>
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>Edit Profile</span>
                    </Link>
                  </SheetClose>
                  
                  {user?.role === 'instructor' && (
                    <SheetClose asChild>
                      <Link 
                        to="/admin/dashboard" 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        <span>Dashboard</span>
                      </Link>
                    </SheetClose>
                  )}
                  
                  <button
                    onClick={() => {
                      logoutHandler();
                      setIsOpen(false);
                    }}
                    disabled={logoutLoading}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 w-full text-left disabled:opacity-50"
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>{logoutLoading ? "Logging out..." : "Log out"}</span>
                  </button>
                </nav>
              </div>
            ) : (
              <div className="space-y-4">
                <SheetClose asChild>
                  <Link to="/">
                    <Button variant="ghost" className="w-full justify-start">
                      Home
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/course/search">
                    <Button variant="ghost" className="w-full justify-start">
                      Browse Courses
                    </Button>
                  </Link>
                </SheetClose>
                
                <div className="pt-4 border-t">
                  <SheetClose asChild>
                    <Link to="/login">
                      <Button className="w-full mb-3">Login</Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/login">
                      <Button variant="outline" className="w-full">Sign Up</Button>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            )}
          </div>
          
          <SheetFooter className="border-t p-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-sm text-gray-500">Theme</span>
              <DarkMode />
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;