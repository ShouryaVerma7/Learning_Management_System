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
const PORT = process.env.PORT || 8080; // Changed to 8080 to match your .env

console.log("🔧 Environment: Local Development (CORS fixed)");

/* -------------------- MIDDLEWARES -------------------- */

// Cookie parser
app.use(cookieParser());

// ✅ SIMPLE CORS - Allow localhost:5173
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ REMOVED the problematic line: app.options('*', cors());

// Stripe webhook (must be before json)
app.use(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" })
);

// JSON parser
app.use(express.json());

/* -------------------- MANUAL PRE-FLIGHT HANDLER -------------------- */
// Handle OPTIONS requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

/* -------------------- TEST ROUTE -------------------- */
app.get("/api/v1/test", (req, res) => {
  console.log("✅ Test endpoint hit from:", req.headers.origin);
  res.status(200).json({
    success: true,
    message: "Backend is running on localhost!",
    backend: `http://localhost:${PORT}`,
    frontend: "http://localhost:5173",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

/* -------------------- ROUTES -------------------- */

app.get("/", (req, res) => {
  res.send(`
    <h1>✅ LMS Backend Running</h1>
    <p>Server: http://localhost:${PORT}</p>
    <p>Frontend: http://localhost:5173</p>
    <p><a href="/api/v1/test">Test API</a></p>
  `);
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

/* -------------------- SERVER -------------------- */

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/v1/test`);
  console.log(`✅ Frontend URL: http://localhost:5173`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("========================================");
});