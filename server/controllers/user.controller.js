import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register controller
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student"
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // REQUIRED for SameSite=None
  sameSite: "none",    // REQUIRED for cross-domain
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


    // Return response (without password)
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration"
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000
});


    // Return response (without password)
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout"
    });
  }
};

// Get user profile - FIXED VERSION
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "courseTitle subTitle courseThumbnail courseDescription creator category courseLevel coursePrice lectures enrolledStudents createdAt",
        populate: {
          path: "creator",
          select: "name photoUrl email"
        }
      });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Debug logging
    console.log(`User ${user._id} has ${user.enrolledCourses.length} enrolled courses`);
    
    // Log each enrolled course for debugging
    user.enrolledCourses.forEach((course, index) => {
      console.log(`Course ${index + 1}: ${course.courseTitle} (${course._id})`);
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update profile - FIXED VERSION
export const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { name } = req.body;
    const userId = req.id;

    const updateData = {};
    
    if (name && name.trim() !== "") {
      updateData.name = name;
    }
    
    // Handle file upload if file exists
    if (req.file) {
      try {
        // Import Cloudinary
        const cloudinary = await import('../utils/cloudinary.js');
        
        // Upload to Cloudinary
        const result = await cloudinary.default.uploader.upload(req.file.path, {
          folder: "user_profiles"
        });
        
        // Set the Cloudinary URL
        updateData.photoUrl = result.secure_url;
        console.log("Cloudinary upload successful:", result.secure_url);
        
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary"
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    console.log("Updated user:", updatedUser);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};