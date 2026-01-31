import express from 'express'
import dotenv from 'dotenv';
import connectDB from "./database/db.js"
import userRoute from "./routes/user.route.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import courseRoute from './routes/course.route.js'
import mediaRoute from "./routes/media.route.js"
import purchaseRoute from "./routes/purchaseCourse.route.js"
import courseProgressRoute from "./routes/courseProgress.route.js"


dotenv.config({})

// call database connection here 
connectDB()
const app = express();

const PORT = process.env.PORT || 8080;

// Basic middleware that doesn't parse JSON for webhooks
app.use(cookieParser()); 
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Webhook route must come BEFORE express.json() - handle raw body for Stripe
app.use("/api/v1/purchase/webhook", express.raw({ type: "application/json" }));

// Now use express.json() for all other routes
app.use(express.json());

// api routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);


app.get("/home", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Hello i am coming from backend"
    })
})

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
})