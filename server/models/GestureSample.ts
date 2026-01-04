import mongoose, { Schema, Document } from "mongoose";
import type { GestureSample as IGestureSample } from "@shared/schema";

// Mongoose document interface
export interface GestureSampleDocument extends Omit<IGestureSample, '_id'>, Document {}

// Mongoose schema
const gestureSampleSchema = new Schema<GestureSampleDocument>({
  label: {
    type: String,
    required: true,
    trim: true
  },
  landmarks: {
    type: [{
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true }
    }],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Mongoose model
export const GestureSampleModel = mongoose.models.GestureSample || 
  mongoose.model<GestureSampleDocument>("GestureSample", gestureSampleSchema);
