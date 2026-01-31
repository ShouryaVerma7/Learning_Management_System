// server/models/lecture.model.js
import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  videoUrl: {
    type: String,
    default: ""
  },
  publicId: {
    type: String,
    default: ""
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  thumbnail: {
    type: String,
    default: ""
  },
  isPreviewFree: {
    type: Boolean,
    default: false
  },
  position: {
    type: Number, // Order in course
    default: 0
  },
  resources: [{
    title: String,
    url: String,
    type: String // 'pdf', 'zip', 'link', etc.
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update updatedAt on save
lectureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Lecture = mongoose.model("Lecture", lectureSchema);