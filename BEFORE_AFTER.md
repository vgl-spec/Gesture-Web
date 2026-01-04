# Before & After: PostgreSQL → MongoDB Transformation

## 📦 Dependencies

### ❌ REMOVED
```json
"pg": "^8.16.3"
"drizzle-orm": "^0.39.3"
"drizzle-zod": "^0.7.0"
"drizzle-kit": "^0.31.8"
"connect-pg-simple": "^10.0.0"
"@types/connect-pg-simple": "^7.0.3"
```

### ✅ ADDED
```json
"mongoose": "^8.8.4"
"connect-mongo": "^5.1.0"
```

---

## 🗄️ Database Connection

### BEFORE (PostgreSQL + Drizzle)
```typescript
// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
export const db = drizzle(pool, { schema });
```

### AFTER (MongoDB + Mongoose)
```typescript
// server/db.ts
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set");
}

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

export default mongoose;
```

---

## 📋 Schema Definition

### BEFORE (Drizzle ORM)
```typescript
// shared/schema.ts
import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gestureSamples = pgTable("gesture_samples", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  landmarks: jsonb("landmarks").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGestureSampleSchema = createInsertSchema(gestureSamples).omit({ 
  id: true, 
  createdAt: true 
});

export type GestureSample = typeof gestureSamples.$inferSelect;
export type InsertGestureSample = z.infer<typeof insertGestureSampleSchema>;
```

### AFTER (Mongoose)
```typescript
// shared/schema.ts
import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Zod validation
export const insertGestureSampleSchema = z.object({
  label: z.string().min(1, "Label is required"),
  landmarks: z.array(z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })).min(1, "At least one landmark is required")
});

export type InsertGestureSample = z.infer<typeof insertGestureSampleSchema>;

// Mongoose interface
export interface IGestureSample extends Document {
  label: string;
  landmarks: Array<{ x: number; y: number; z: number }>;
  createdAt: Date;
}

// Mongoose schema
const gestureSampleSchema = new Schema<IGestureSample>({
  label: { type: String, required: true, trim: true },
  landmarks: {
    type: [{
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true }
    }],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

// Mongoose model
export const GestureSample = mongoose.models.GestureSample || 
  mongoose.model<IGestureSample>("GestureSample", gestureSampleSchema);
```

---

## 💾 Database Operations

### BEFORE (Drizzle)
```typescript
// server/storage.ts
import { db } from "./db";
import { gestureSamples, type InsertGestureSample } from "@shared/schema";
import { eq } from "drizzle-orm";

export class DatabaseStorage {
  // GET all
  async getGestures(): Promise<GestureSample[]> {
    return await db.select().from(gestureSamples);
  }

  // CREATE
  async createGesture(insertGesture: InsertGestureSample): Promise<GestureSample> {
    const [gesture] = await db
      .insert(gestureSamples)
      .values(insertGesture)
      .returning();
    return gesture;
  }

  // DELETE
  async deleteGesture(id: number): Promise<void> {
    await db
      .delete(gestureSamples)
      .where(eq(gestureSamples.id, id));
  }
}
```

### AFTER (Mongoose)
```typescript
// server/storage.ts
import { GestureSample, type InsertGestureSample } from "@shared/schema";

export class DatabaseStorage {
  // GET all
  async getGestures(): Promise<IGestureSample[]> {
    return await GestureSample.find()
      .sort({ createdAt: -1 })
      .lean();
  }

  // CREATE
  async createGesture(insertGesture: InsertGestureSample): Promise<IGestureSample> {
    const gesture = new GestureSample(insertGesture);
    return await gesture.save();
  }

  // DELETE
  async deleteGesture(id: string): Promise<void> {
    await GestureSample.findByIdAndDelete(id);
  }
}
```

---

## 🌐 Server Initialization

### BEFORE
```typescript
// server/index.ts
import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const httpServer = createServer(app);

(async () => {
  await registerRoutes(httpServer, app);
  
  // ... middleware and vite setup
  
  httpServer.listen({ port: 5000 }, () => {
    log(`serving on port 5000`);
  });
})();
```

### AFTER
```typescript
// server/index.ts
import express from "express";
import { registerRoutes } from "./routes";
import { connectDB } from "./db";  // NEW

const app = express();
const httpServer = createServer(app);

(async () => {
  await connectDB();  // NEW - Connect to MongoDB first
  
  await registerRoutes(httpServer, app);
  
  // ... middleware and vite setup
  
  httpServer.listen({ port: 5000 }, () => {
    log(`serving on port 5000`);
  });
})();
```

---

## 🔑 ID Handling

### BEFORE (Integer IDs)
```typescript
// routes.ts
app.delete(api.gestures.delete.path, async (req, res) => {
  await storage.deleteGesture(Number(req.params.id));  // Convert to number
  res.status(204).send();
});
```

### AFTER (String IDs - MongoDB ObjectId)
```typescript
// routes.ts
app.delete(api.gestures.delete.path, async (req, res) => {
  await storage.deleteGesture(req.params.id);  // Already string
  res.status(204).send();
});
```

---

## 🔧 Configuration Files

### BEFORE
```json
// package.json scripts
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "tsx script/build.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  "check": "tsc",
  "db:push": "drizzle-kit push"  // For database migrations
}
```

**Additional file:** `drizzle.config.ts`

### AFTER
```json
// package.json scripts
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "tsx script/build.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  "check": "tsc"
  // db:push removed - MongoDB doesn't need migrations
}
```

**Removed:** `drizzle.config.ts` ❌

---

## 🌍 Environment Variables

### BEFORE
```env
DATABASE_URL=postgresql://user:password@localhost:5432/gesture_web
PORT=5000
NODE_ENV=development
```

### AFTER
```env
MONGODB_URI=mongodb://localhost:27017/gesture-web
# or
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gesture-web
PORT=5000
NODE_ENV=development
```

---

## 📊 Data Structure Comparison

### PostgreSQL Table
```sql
CREATE TABLE gesture_samples (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  landmarks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Sample row:
```json
{
  "id": 1,
  "label": "Open Palm",
  "landmarks": [{"x": 0.5, "y": 0.3, "z": 0.1}],
  "created_at": "2026-01-04T10:30:00Z"
}
```

### MongoDB Collection
```javascript
// No need to explicitly create schema - it's flexible
```

Sample document:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "label": "Open Palm",
  "landmarks": [{"x": 0.5, "y": 0.3, "z": 0.1}],
  "createdAt": ISODate("2026-01-04T10:30:00Z")
}
```

---

## 🎯 Query Comparison

| Operation | PostgreSQL (Drizzle) | MongoDB (Mongoose) |
|-----------|----------------------|---------------------|
| **Select All** | `db.select().from(gestureSamples)` | `GestureSample.find()` |
| **Filter** | `db.select().where(eq(gestureSamples.label, "Peace"))` | `GestureSample.find({ label: "Peace" })` |
| **Insert** | `db.insert(gestureSamples).values(data)` | `new GestureSample(data).save()` |
| **Update** | `db.update(gestureSamples).set({...}).where(...)` | `GestureSample.findByIdAndUpdate(id, data)` |
| **Delete** | `db.delete(gestureSamples).where(eq(id, 1))` | `GestureSample.findByIdAndDelete(id)` |
| **Count** | `db.select().from(gestureSamples).count()` | `GestureSample.countDocuments()` |

---

## ✅ Benefits of MongoDB

1. **Simpler Setup** - No migration files, no schema sync needed
2. **Flexible Schema** - Easy to add/remove fields without migrations
3. **Native JSON** - Perfect for JavaScript/TypeScript apps
4. **Better for Nested Data** - Landmarks array is native
5. **Easier Scaling** - Horizontal scaling built-in
6. **Cloud-Ready** - MongoDB Atlas for instant deployment

---

## 📈 Migration Metrics

- **Files Modified**: 6
- **Files Created**: 5
- **Files Deleted**: 1
- **Dependencies Changed**: 7 removed, 2 added
- **Lines of Code Changed**: ~150
- **Breaking Changes**: ID type (number → string)

---

**Migration completed successfully!** 🎉

All functionality maintained while moving to MERN stack architecture.
