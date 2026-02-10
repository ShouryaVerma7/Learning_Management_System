import express from "express";
import { getUserProfile, login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

// ✅ ENHANCED Debug endpoint
router.get("/debug", (req, res) => {
  console.log("🔍 Debug - Cookies:", req.cookies);
  console.log("🔍 Debug - Headers:", req.headers);
  console.log("🔍 Debug - Origin:", req.headers.origin);
  
  res.status(200).json({
    success: true,
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ✅ HEALTH CHECK
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Existing routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;