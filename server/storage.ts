import { db } from "./db";
import {
  gestureSamples,
  type InsertGestureSample,
  type GestureSample
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getGestures(): Promise<GestureSample[]>;
  createGesture(gesture: InsertGestureSample): Promise<GestureSample>;
  deleteGesture(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getGestures(): Promise<GestureSample[]> {
    return await db.select().from(gestureSamples);
  }

  async createGesture(insertGesture: InsertGestureSample): Promise<GestureSample> {
    const [gesture] = await db.insert(gestureSamples).values(insertGesture).returning();
    return gesture;
  }

  async deleteGesture(id: number): Promise<void> {
    await db.delete(gestureSamples).where(eq(gestureSamples.id, id));
  }
}

export const storage = new DatabaseStorage();
