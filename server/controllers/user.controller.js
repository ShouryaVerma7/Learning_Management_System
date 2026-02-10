import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ FOR LOCAL DEVELOPMENT - ALWAYS USE DEVELOPMENT SETTINGS
const isProduction = false; // Force false for localhost
console.log(`🔧 Environment: Local Development (CORS fixed)`);

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    console.log("📝 Register request received from:", req.headers.origin);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // ✅ SIMPLIFIED COOKIE FOR LOCALHOST
    const cookieOptions = {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: "lax", // "lax" for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    console.log("🍪 Setting cookie for localhost");

    res.cookie("token", token, cookieOptions);

    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword,
      token: token // Also send token in response for testing
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    console.log("🔑 Login request from:", req.headers.origin);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful for:", user.email);

    // ✅ SIMPLIFIED COOKIE FOR LOCALHOST
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    console.log("🍪 Setting cookie for localhost");

    res.cookie("token", token, cookieOptions);

    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userWithoutPassword,
      token: token // Also send token in response
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

/* ================= LOGOUT ================= */
export const logout = (req, res) => {
  try {
    console.log("🚪 Logout request from:", req.headers.origin);

    // ✅ SIMPLIFIED COOKIE CLEARING FOR LOCALHOST
    const clearCookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };

    res.clearCookie("token", clearCookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

/* ================= GET PROFILE ================= */
export const getUserProfile = async (req, res) => {
  try {
    console.log("👤 Profile request from:", req.headers.origin);
    console.log("User ID from token:", req.id);

    if (!req.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required - No user ID found",
      });
    }

    // FIXED: Correct field names for populate (subtitle, description NOT subTitle, courseDescription)
    const user = await User.findById(req.id)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        // CORRECTED: Using actual field names from Course model
        select: "courseTitle subtitle description courseThumbnail creator category courseLevel coursePrice lectures enrolledStudents createdAt isPublished",
        populate: [
          {
            path: "creator",
            select: "name photoUrl email",
          },
          {
            path: "lectures",
            select: "lectureTitle videoUrl duration isPreviewFree",
          }
        ],
      });

    if (!user) {
      console.log("❌ User not found for ID:", req.id);
      
      // Clear invalid cookie for localhost
      const clearCookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      };
      
      res.clearCookie("token", clearCookieOptions);

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ Profile found for:", user.email);
    console.log("📚 Number of enrolled courses:", user.enrolledCourses?.length || 0);
    
    // Log first course details for debugging
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      console.log("📊 First enrolled course:", {
        id: user.enrolledCourses[0]._id,
        title: user.enrolledCourses[0].courseTitle,
        thumbnail: user.enrolledCourses[0].courseThumbnail ? "Exists" : "Missing",
        creator: user.enrolledCourses[0].creator?.name
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("❌ Get profile error:", error);
    console.error("🔍 Error details:", error.message);
    
    // Clear cookie on error for localhost
    const clearCookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };
    
    res.clearCookie("token", clearCookieOptions);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req, res) => {
  try {
    console.log("🔄 Update profile request");
    console.log("User ID:", req.id);

    if (!req.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name } = req.body;
    const userId = req.id;

    const updateData = {};
    if (name && name.trim() !== "") {
      updateData.name = name;
    }

    if (req.file) {
      try {
        const cloudinary = await import("../utils/cloudinary.js");
        const result = await cloudinary.default.uploader.upload(
          req.file.path,
          { folder: "user_profiles" }
        );
        updateData.photoUrl = result.secure_url;
        console.log("📸 Image uploaded to Cloudinary:", result.secure_url);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};