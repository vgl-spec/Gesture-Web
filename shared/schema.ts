import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gestureSamples = pgTable("gesture_samples", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(), // e.g. "Open Palm", "Closed Fist"
  landmarks: jsonb("landmarks").notNull(), // Array of {x, y, z}
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGestureSampleSchema = createInsertSchema(gestureSamples).omit({ 
  id: true, 
  createdAt: true 
});

export type GestureSample = typeof gestureSamples.$inferSelect;
export type InsertGestureSample = z.infer<typeof insertGestureSampleSchema>;
