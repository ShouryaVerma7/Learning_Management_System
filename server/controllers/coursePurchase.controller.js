import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===========================================================
//  CREATE CHECKOUT SESSION
// ===========================================================
export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;

    // Extract courseId safely from ANY type of frontend body
    const courseId =
      req.body.courseId?._id || req.body.courseId || req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID missing!" });
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found!" });

    // Create Stripe session FIRST
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              description: course.courseDescription,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-detail/${courseId}?purchase_success=true&session_id={CHECKOUT_SESSION_ID}&timestamp=${Date.now()}`,
      cancel_url: `http://localhost:5173/course-details/${courseId}`,
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
    });

    // Create purchase entry with paymentId (using session.id as paymentId)
    const newPurchase = await CoursePurchase.create({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      paymentId: session.id, // This is the required field
    });

    console.log('✅ Created purchase with paymentId:', session.id);
    console.log('📍 For testing, run: stripe listen --forward-to localhost:3000/api/v1/purchase/webhook');

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.log("❌ Checkout Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ===========================================================
//  STRIPE WEBHOOK
// ===========================================================
export const stripeWebHook = async (req, res) => {
  console.log('=== 🎯 WEBHOOK RECEIVED ===');
  
  let event;

  try {
    const payload = req.body;
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    console.log('🔑 Webhook secret exists:', !!secret);

    // Get the signature from the header
    const signature = req.headers['stripe-signature'];
    console.log('📝 Stripe signature found:', !!signature);

    if (!signature) {
      console.log('❌ No Stripe signature found in headers');
      return res.status(400).send('No Stripe signature found');
    }

    if (!secret) {
      console.log('❌ WEBHOOK_ENDPOINT_SECRET is missing in environment variables');
      return res.status(400).send('Webhook secret not configured');
    }

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );

    console.log('✅ Webhook verified successfully');
    console.log('📧 Event type:', event.type);
    console.log('🆔 Event ID:', event.id);

  } catch (error) {
    console.error("❌ Webhook Verification Error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle Stripe checkout completed
  if (event.type === "checkout.session.completed") {
    console.log('🎯 Processing checkout.session.completed event');
    
    try {
      const session = event.data.object;
      console.log('💳 Session ID:', session.id);
      console.log('📋 Session metadata:', session.metadata);
      console.log('💰 Payment status:', session.payment_status);
      console.log('💵 Amount total:', session.amount_total);

      // Find purchase by paymentId (which is the session ID)
      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate("courseId");

      if (!purchase) {
        console.log('❌ Purchase not found for paymentId:', session.id);
        
        // Debug: Check all purchases
        const allPurchases = await CoursePurchase.find({});
        console.log('📊 All purchases in DB:', allPurchases.map(p => ({ 
          id: p._id, 
          paymentId: p.paymentId, 
          status: p.status 
        })));
        
        return res.status(404).json({ message: "Purchase not found" });
      }

      console.log('✅ Found purchase:', purchase._id);
      console.log('📊 Current status:', purchase.status);

      // Update purchase details
      purchase.amount = session.amount_total / 100;
      purchase.status = "completed";
      await purchase.save();

      console.log('✅ Purchase status updated to completed for:', purchase._id);

      // Unlock course lectures
      if (purchase.courseId?.lectures?.length > 0) {
        const lectureUpdate = await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
        console.log('🔓 Lectures unlocked for course:', purchase.courseId._id);
        console.log('📈 Updated lectures count:', lectureUpdate.modifiedCount);
      }

      // Add course to user's enrolled courses
      const userUpdate = await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );
      console.log('👤 Course added to user:', purchase.userId);

      // Add user to course's enrolled students
      const courseUpdate = await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );
      console.log('📚 User added to course:', purchase.courseId._id);

      console.log('🎉 Webhook processing completed successfully!');

    } catch (error) {
      console.error("❌ Webhook Process Error:", error);
      console.error("🔍 Error stack:", error.stack);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    console.log('ℹ️ Other event type received:', event.type);
  }

  res.status(200).json({ received: true, eventType: event.type });
};

// ===========================================================
//  CHECK PAYMENT STATUS
// ===========================================================
export const checkPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.id;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Find purchase by paymentId (sessionId)
    const purchase = await CoursePurchase.findOne({
      paymentId: sessionId,
      userId: userId
    }).populate("courseId");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    return res.status(200).json({
      success: true,
      status: purchase.status,
      purchase: {
        id: purchase._id,
        courseId: purchase.courseId?._id,
        amount: purchase.amount,
        createdAt: purchase.createdAt
      }
    });

  } catch (error) {
    console.log("❌ Check Payment Status Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ===========================================================
//  TEST WEBHOOK ENDPOINT
// ===========================================================
export const testWebhook = async (req, res) => {
  console.log('✅ Test webhook endpoint reached');
  res.status(200).json({ 
    success: true,
    message: 'Webhook endpoint is working!',
    timestamp: new Date().toISOString()
  });
};  

// controllers/coursePurchase.controller.js - Only change this function slightly
// In backend/controllers/coursePurchase.controller.js
export const getCourseDetailWithPUrchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Get course
  // Get course with ALL lecture data including video URLs
const course = await Course.findById(courseId)
  .populate({ path: "creator", select: "name photoUrl" })
  .populate({
    path: "lectures",
    select: "lectureTitle videoUrl publicId isPreviewFree" // EXPLICITLY select videoUrl
  });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // SIMPLIFIED: Check ONLY purchase table
    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed"  // Only check for completed
    });

    console.log('🔍 Purchase check:');
    console.log('   User:', userId);
    console.log('   Course:', courseId);
    console.log('   Purchase found?', !!purchase);
    console.log('   Purchase status:', purchase?.status);

    return res.status(200).json({
      success: true,
      course,
      purchased: !!purchase  // True only if completed purchase exists
    });
  } catch (error) {
    console.log("❌ Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllPurchasedCourse =async (_,res)=>{
  try {
    const purchasedCourse  = await CoursePurchase.find({status:"completed"}).populate("courseId")

    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourses: [],
      })
    }
    return res.status(200).json({
      purchasedCourse,
    })
  } catch (error) {
    
  }
}