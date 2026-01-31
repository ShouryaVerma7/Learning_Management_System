import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

// Index for faster queries
coursePurchaseSchema.index({ paymentId: 1 });
coursePurchaseSchema.index({ userId: 1, courseId: 1 });
coursePurchaseSchema.index({ status: 1 });

export const CoursePurchase = mongoose.model('CoursePurchase', coursePurchaseSchema);