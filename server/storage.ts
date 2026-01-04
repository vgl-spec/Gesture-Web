import {
  type InsertGestureSample,
  type GestureSample
} from "@shared/schema";
import { GestureSampleModel } from "./models/GestureSample";

export interface IStorage {
  getGestures(): Promise<GestureSample[]>;
  createGesture(gesture: InsertGestureSample): Promise<GestureSample>;
  deleteGesture(id: string): Promise<void>;
}

// Helper to map MongoDB document to GestureSample with id field
function mapToGestureSample(doc: any): GestureSample {
  return {
    _id: doc._id?.toString(),
    id: doc._id?.toString(), // Map _id to id for frontend
    label: doc.label,
    landmarks: doc.landmarks,
    createdAt: doc.createdAt
  };
}

export class DatabaseStorage implements IStorage {
  async getGestures(): Promise<GestureSample[]> {
    const docs = await GestureSampleModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(mapToGestureSample);
  }

  async createGesture(insertGesture: InsertGestureSample): Promise<GestureSample> {
    const gesture = new GestureSampleModel(insertGesture);
    const saved = await gesture.save();
    return mapToGestureSample(saved.toObject());
  }

  async deleteGesture(id: string): Promise<void> {
    await GestureSampleModel.findByIdAndDelete(id);
  }
}

export const storage = new DatabaseStorage();