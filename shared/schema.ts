import { z } from "zod";

// Zod validation schemas (safe for client-side use)
export const insertGestureSampleSchema = z.object({
  label: z.string().min(1, "Label is required"),
  landmarks: z.array(z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })).min(1, "At least one landmark is required")
});

export type InsertGestureSample = z.infer<typeof insertGestureSampleSchema>;

// TypeScript interface for gesture sample
export interface GestureSample {
  _id?: string;
  id: string; // Mapped from _id for frontend compatibility
  label: string;
  landmarks: Array<{ x: number; y: number; z: number }>;
  createdAt: Date;
}
