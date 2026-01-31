import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/features/authSlice";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();

  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(signupInput.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!validatePassword(signupInput.password)) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (!signupInput.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await registerUser(signupInput);
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(loginInput.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!loginInput.password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      await loginUser(loginInput);
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Account created successfully!");
      const user = registerData?.data || registerData?.user || registerData;
      if (user) {
        dispatch(userLoggedIn(user));
      }
      setSignupInput({ name: "", email: "", password: "" });
      setActiveTab("login");
    }

    if (registerError) {
      const errorMessage = registerError?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
    }

    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Welcome back!");
      const user = loginData?.data || loginData?.user || loginData;
      if (user) {
        dispatch(userLoggedIn(user));
      }
      navigate("/");
    }

    if (loginError) {
      const errorMessage = loginError?.data?.message || "Invalid credentials. Please try again.";
      toast.error(errorMessage);
    }
  }, [
    loginIsSuccess,
    registerIsSuccess,
    loginData,
    registerData,
    loginError,
    registerError,
    navigate,
    dispatch,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            <div className="text-2xl font-bold text-white">LMS</div>
          </div> */}
          <h1 className="text-3xl font-bold text-white">
            Welcome to E-Learning
          </h1>
          <p className="text-gray-400 mt-1">
            Start your learning journey today
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full rounded-none rounded-t-lg p-0 h-12">
              <TabsTrigger 
                value="signup" 
                className="rounded-tl-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white h-full"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger 
                value="login" 
                className="rounded-tr-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white h-full"
              >
                Login
              </TabsTrigger>
            </TabsList>

            {/* Signup Tab */}
            <TabsContent value="signup" className="p-0">
              <form onSubmit={handleSignupSubmit}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Create Account</CardTitle>
                  <CardDescription>
                    Join thousands of learners already on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      value={signupInput.name}
                      onChange={(e) => changeInputHandler(e, "signup")}
                      placeholder="John Doe"
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      name="email"
                      value={signupInput.email}
                      onChange={(e) => changeInputHandler(e, "signup")}
                      placeholder="john@example.com"
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        name="password"
                        value={signupInput.password}
                        onChange={(e) => changeInputHandler(e, "signup")}
                        placeholder="••••••••"
                        required
                        className="h-12 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {signupInput.password && (
                      <div className={`flex items-center gap-2 text-sm ${
                        validatePassword(signupInput.password) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validatePassword(signupInput.password) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        At least 6 characters
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-2">
                    {/* <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Access to all courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Personalized learning path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Progress tracking</span>
                    </div> */}
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    type="submit" 
                    disabled={registerIsLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {registerIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  <p className="text-sm text-gray-400 text-center">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in here
                    </Button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Login Tab */}
            <TabsContent value="login" className="p-0">
              <form onSubmit={handleLoginSubmit}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      name="email"
                      value={loginInput.email}
                      onChange={(e) => changeInputHandler(e, "login")}
                      placeholder="john@example.com"
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => {/* Add forgot password functionality */}}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginInput.password}
                        onChange={(e) => changeInputHandler(e, "login")}
                        placeholder="••••••••"
                        required
                        className="h-12 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    type="submit" 
                    disabled={loginIsLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loginIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <p className="text-sm text-gray-400 text-center">
                    Don't have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setActiveTab("signup")}
                    >
                      Sign up here
                    </Button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            By continuing, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto">Terms</Button> and{" "}
            <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;