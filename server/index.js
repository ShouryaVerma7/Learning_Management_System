import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

dotenv.config();

// Connect DB
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

/* -------------------- MIDDLEWARES -------------------- */

// Cookie parser
app.use(cookieParser());

// ✅ FIXED CORS (NO TRAILING SLASH)
app.use(
  cors({
    origin: "https://learning-management-system-eight-livid.vercel.app",
    credentials: true,
  })
);

// Stripe webhook (must be before json)
app.use(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" })
);

// JSON parser
app.use(express.json());

/* -------------------- ROUTES -------------------- */

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

app.get("/home", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello i am coming from backend",
  });
});

/* -------------------- SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
