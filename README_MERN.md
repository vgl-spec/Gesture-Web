# Gesture Recognition Web App - MERN Stack

This application has been successfully transformed to use the **MERN Stack** (MongoDB, Express, React, Node.js).

## 🎯 Tech Stack

- **M**ongoDB - NoSQL database with Mongoose ODM
- **E**xpress - Web application framework
- **R**eact - Frontend UI library (with TypeScript)
- **N**ode.js - JavaScript runtime

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or pnpm

### Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   
   - Update the `.env` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/gesture-web
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gesture-web?retryWrites=true&w=majority
   ```

4. **Start MongoDB** (if using local installation):
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongodb
   # or
   brew services start mongodb-community
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Open your browser and navigate to `http://localhost:5000`

## 📦 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── pages/         # Page components
│   └── index.html
├── server/                 # Express backend
│   ├── db.ts              # MongoDB connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── static.ts          # Static file serving
│   └── vite.ts            # Vite dev server setup
├── shared/                 # Shared code
│   ├── schema.ts          # Mongoose schemas & Zod validation
│   └── routes.ts          # API route definitions
└── package.json
```

## 🔌 API Endpoints

### Gestures

- **GET** `/api/gestures` - Get all gesture samples
- **POST** `/api/gestures` - Create a new gesture sample
  ```json
  {
    "label": "Open Palm",
    "landmarks": [
      { "x": 0.5, "y": 0.3, "z": 0.1 },
      ...
    ]
  }
  ```
- **DELETE** `/api/gestures/:id` - Delete a gesture sample by ID

## 🗄️ Database Schema

### GestureSample Collection

```typescript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  label: String,           // Gesture label (e.g., "Open Palm")
  landmarks: [             // Array of hand landmarks
    {
      x: Number,           // X coordinate
      y: Number,           // Y coordinate
      z: Number            // Z coordinate
    }
  ],
  createdAt: Date          // Timestamp (auto-generated)
}
```

## 🛠️ Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking

## 🔄 Migration from PostgreSQL

The application was migrated from PostgreSQL with Drizzle ORM to MongoDB with Mongoose:

### Key Changes:
- ✅ Replaced `pg` and `drizzle-orm` with `mongoose`
- ✅ Replaced `connect-pg-simple` with `connect-mongo` for sessions
- ✅ Updated database schemas from Drizzle to Mongoose
- ✅ Modified storage layer to use Mongoose queries
- ✅ Changed ID type from `number` to `string` (MongoDB ObjectId)
- ✅ Removed `drizzle.config.ts` and related scripts

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/gesture-web` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT
