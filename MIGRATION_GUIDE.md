# Migration Guide: PostgreSQL to MongoDB

This document outlines the steps taken to migrate the Gesture-Web application from PostgreSQL to MongoDB (MERN Stack).

## Summary of Changes

### 1. Dependencies Updated

#### Removed:
- `pg` - PostgreSQL client
- `drizzle-orm` - Drizzle ORM
- `drizzle-zod` - Drizzle Zod integration
- `drizzle-kit` - Drizzle migration tools
- `connect-pg-simple` - PostgreSQL session store
- `@types/connect-pg-simple`

#### Added:
- `mongoose` - MongoDB ODM
- `connect-mongo` - MongoDB session store

### 2. File Changes

#### Modified Files:

**`package.json`**
- Removed Drizzle and PostgreSQL dependencies
- Added Mongoose
- Removed `db:push` script

**`server/db.ts`**
- Complete rewrite to use Mongoose
- Added connection handling and event listeners
- Changed from `DATABASE_URL` to `MONGODB_URI` environment variable

**`shared/schema.ts`**
- Converted from Drizzle schema to Mongoose schema
- Added TypeScript interfaces for type safety
- Kept Zod validation schemas for input validation
- Changed ID field from `serial` (auto-increment) to MongoDB ObjectId

**`server/storage.ts`**
- Updated all database queries to use Mongoose syntax
- Changed ID parameter type from `number` to `string`
- Updated methods:
  - `getGestures()` - Now uses `find()` with `sort()` and `lean()`
  - `createGesture()` - Now uses Mongoose model instantiation
  - `deleteGesture()` - Now uses `findByIdAndDelete()`

**`server/routes.ts`**
- Changed `Number(req.params.id)` to `req.params.id` for delete route

**`server/index.ts`**
- Added import for `connectDB`
- Added MongoDB connection initialization before server starts

#### New Files:

**`.env.example`**
- Template for environment variables
- Documents MongoDB connection string format

**`README_MERN.md`**
- Comprehensive documentation for the MERN stack version
- Setup instructions
- API documentation
- Project structure

#### Deleted Files:

**`drizzle.config.ts`**
- No longer needed as we're not using Drizzle ORM

## Database Schema Comparison

### PostgreSQL (Drizzle)
```typescript
export const gestureSamples = pgTable("gesture_samples", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  landmarks: jsonb("landmarks").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### MongoDB (Mongoose)
```typescript
const gestureSampleSchema = new Schema<IGestureSample>({
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
```

## Key Differences

### 1. ID Fields
- **PostgreSQL**: Auto-incrementing integer (`id: 1, 2, 3...`)
- **MongoDB**: ObjectId string (`_id: "507f1f77bcf86cd799439011"`)

### 2. Query Syntax

**PostgreSQL (Drizzle):**
```typescript
await db.select().from(gestureSamples);
await db.insert(gestureSamples).values(data).returning();
await db.delete(gestureSamples).where(eq(gestureSamples.id, id));
```

**MongoDB (Mongoose):**
```typescript
await GestureSample.find().lean();
await new GestureSample(data).save();
await GestureSample.findByIdAndDelete(id);
```

### 3. Connection Management

**PostgreSQL:**
```typescript
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**MongoDB:**
```typescript
await mongoose.connect(process.env.MONGODB_URI);
```

## Data Migration (If Needed)

If you have existing data in PostgreSQL that needs to be migrated to MongoDB:

### Option 1: Export/Import Script

```javascript
// migrate-data.js
import pg from 'pg';
import mongoose from 'mongoose';
import { GestureSample } from './shared/schema.js';

const { Client } = pg;

async function migrate() {
  // Connect to PostgreSQL
  const pgClient = new Client({
    connectionString: 'postgresql://...'
  });
  await pgClient.connect();

  // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/gesture-web');

  // Fetch all records from PostgreSQL
  const result = await pgClient.query('SELECT * FROM gesture_samples');

  // Insert into MongoDB
  for (const row of result.rows) {
    await GestureSample.create({
      label: row.label,
      landmarks: row.landmarks,
      createdAt: row.created_at
    });
  }

  console.log(`Migrated ${result.rows.length} records`);

  await pgClient.end();
  await mongoose.disconnect();
}

migrate().catch(console.error);
```

### Option 2: Manual Export/Import

1. Export from PostgreSQL:
   ```sql
   COPY gesture_samples TO '/tmp/gestures.csv' DELIMITER ',' CSV HEADER;
   ```

2. Convert CSV to JSON and import to MongoDB using `mongoimport`

## Setup Instructions for New Environment

1. **Install MongoDB**:
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow [official installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Application**:
   ```bash
   npm run dev
   ```

## Testing Checklist

- [ ] MongoDB connection established successfully
- [ ] GET `/api/gestures` returns empty array initially
- [ ] POST `/api/gestures` creates new gesture sample
- [ ] GET `/api/gestures` returns created gestures
- [ ] DELETE `/api/gestures/:id` removes gesture
- [ ] Frontend loads and displays gestures
- [ ] Camera integration works
- [ ] Hand landmark detection functional

## Rollback Plan

If you need to rollback to PostgreSQL:

1. Checkout previous commit before migration
2. Run `npm install` to restore old dependencies
3. Update `.env` with PostgreSQL connection string
4. Run `npm run db:push` to sync database schema

## Benefits of MongoDB for this Application

1. **Flexible Schema**: Perfect for storing nested landmarks data
2. **JSON-like Documents**: Natural fit for JavaScript/TypeScript
3. **Easier Development**: Less boilerplate code with Mongoose
4. **Horizontal Scaling**: Better for handling large amounts of gesture data
5. **Atlas Integration**: Easy cloud deployment with MongoDB Atlas

## Potential Gotchas

1. **ID Types**: Remember MongoDB uses string IDs, not integers
2. **Null vs Undefined**: Mongoose treats these differently than SQL
3. **Nested Objects**: MongoDB excels at nested data (landmarks array)
4. **Transactions**: If needed, require replica set configuration
5. **Indexing**: May need to add indexes for performance on large datasets

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MERN Stack Tutorial](https://www.mongodb.com/mern-stack)
