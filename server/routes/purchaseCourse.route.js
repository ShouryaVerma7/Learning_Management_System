import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCheckoutSession,
  stripeWebHook,
  checkPaymentStatus,
  getCourseDetailWithPUrchaseStatus,
  getAllPurchasedCourse,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

// Webhook endpoint (must be raw body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebHook
);

// Regular API endpoints (JSON body)
router.use(express.json());

router.post(
  "/checkout/create-checkout-session",
  isAuthenticated,
  createCheckoutSession
);

router.get("/check-payment-status", isAuthenticated, checkPaymentStatus);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithPUrchaseStatus)
router.route("/").get(isAuthenticated,getAllPurchasedCourse)

export default router;
