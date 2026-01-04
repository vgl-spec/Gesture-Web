# MERN Stack Architecture Diagram

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React Frontend (TypeScript + Vite)         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │ CameraView  │  │ GestureList  │  │   Home   │ │  │
│  │  │ Component   │  │  Component   │  │   Page   │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │   React Query (@tanstack/react-query)       │  │  │
│  │  │   - State management                         │  │  │
│  │  │   - API data caching                         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                   HTTP/REST
                  (fetch/axios)
                       │
┌──────────────────────▼──────────────────────────────────┐
│              SERVER (Node.js + Express)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Express Application                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Middleware Stack                            │  │  │
│  │  │  - express.json()                            │  │  │
│  │  │  - express.urlencoded()                      │  │  │
│  │  │  - Request logging                           │  │  │
│  │  │  - Error handling                            │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  API Routes (server/routes.ts)              │  │  │
│  │  │  - GET    /api/gestures                     │  │  │
│  │  │  - POST   /api/gestures                     │  │  │
│  │  │  - DELETE /api/gestures/:id                 │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Storage Layer (server/storage.ts)          │  │  │
│  │  │  - DatabaseStorage class                    │  │  │
│  │  │  - Business logic                           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Validation (Zod schemas)                   │  │  │
│  │  │  - insertGestureSampleSchema                │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                   Mongoose ODM
                  (MongoDB Driver)
                       │
┌──────────────────────▼──────────────────────────────────┐
│              DATABASE (MongoDB)                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         gesture-web Database                       │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  gesturesamples Collection                   │  │  │
│  │  │  {                                           │  │  │
│  │  │    _id: ObjectId("..."),                    │  │  │
│  │  │    label: "Open Palm",                      │  │  │
│  │  │    landmarks: [                             │  │  │
│  │  │      { x: 0.5, y: 0.3, z: 0.1 },           │  │  │
│  │  │      ...                                    │  │  │
│  │  │    ],                                       │  │  │
│  │  │    createdAt: ISODate("...")                │  │  │
│  │  │  }                                           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📂 File Structure & Responsibilities

```
Gesture-Web/
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── CameraView.tsx       # Camera & gesture capture
│   │   │   ├── GestureList.tsx      # Display gestures
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── hooks/
│   │   │   ├── use-gestures.ts      # Custom hook for API calls
│   │   │   └── use-toast.ts         # Toast notifications
│   │   ├── lib/
│   │   │   ├── queryClient.ts       # React Query setup
│   │   │   └── utils.ts             # Utility functions
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Main page
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   └── index.html                   # HTML template
│
├── server/                          # Backend (Express)
│   ├── db.ts                        # ⭐ MongoDB connection
│   ├── index.ts                     # ⭐ Server entry point
│   ├── routes.ts                    # ⭐ API route handlers
│   ├── storage.ts                   # ⭐ Database operations
│   ├── static.ts                    # Static file serving
│   └── vite.ts                      # Vite dev server
│
├── shared/                          # Shared code
│   ├── schema.ts                    # ⭐ Mongoose models & Zod
│   └── routes.ts                    # API route definitions
│
├── .env                             # ⭐ Environment variables (your config)
├── .env.example                     # ⭐ Environment template
├── package.json                     # ⭐ Dependencies (updated)
└── tsconfig.json                    # TypeScript config

⭐ = Modified/created for MERN stack
```

## 🔄 Request Flow

### Example: Creating a New Gesture

```
1. USER ACTION (Frontend)
   ↓
   User clicks "Save Gesture" button
   Component: CameraView.tsx
   ↓
   
2. REACT HOOK (Frontend)
   ↓
   useGestures hook called with gesture data
   File: client/src/hooks/use-gestures.ts
   ↓
   
3. HTTP REQUEST (Frontend → Backend)
   ↓
   POST http://localhost:5000/api/gestures
   Body: { label: "Peace", landmarks: [...] }
   ↓
   
4. EXPRESS MIDDLEWARE (Backend)
   ↓
   express.json() parses request body
   File: server/index.ts
   ↓
   
5. ROUTE HANDLER (Backend)
   ↓
   app.post(api.gestures.create.path, ...)
   File: server/routes.ts
   ↓
   
6. ZOD VALIDATION (Backend)
   ↓
   insertGestureSampleSchema.parse(req.body)
   File: shared/schema.ts
   ↓
   
7. STORAGE LAYER (Backend)
   ↓
   storage.createGesture(validatedData)
   File: server/storage.ts
   ↓
   
8. MONGOOSE MODEL (Backend → Database)
   ↓
   new GestureSample(data).save()
   File: shared/schema.ts
   ↓
   
9. MONGODB (Database)
   ↓
   Insert document into gesturesamples collection
   Returns: Created document with _id
   ↓
   
10. HTTP RESPONSE (Backend → Frontend)
    ↓
    res.status(201).json(createdGesture)
    ↓
    
11. REACT QUERY UPDATE (Frontend)
    ↓
    Cache invalidation & refetch
    UI updates automatically
    ↓
    
12. USER SEES RESULT
    ↓
    New gesture appears in the list
    Toast notification: "Gesture saved!"
```

## 🔌 Data Flow Diagram

```
┌──────────────┐    HTTP GET      ┌──────────────┐    Mongoose    ┌──────────────┐
│   React      │ ──────────────→  │   Express    │ ──────────────→│   MongoDB    │
│   Frontend   │                   │   Backend    │                │   Database   │
│              │ ←──────────────   │              │ ←──────────────│              │
└──────────────┘   JSON Response   └──────────────┘   Documents    └──────────────┘

Data formats at each stage:
1. Frontend: TypeScript interfaces (IGestureSample)
2. HTTP: JSON string
3. Backend: Zod-validated objects
4. Mongoose: JavaScript objects
5. MongoDB: BSON documents
```

## 🛡️ Validation Flow

```
Input Data
    │
    ↓
┌───────────────────────────┐
│  Zod Schema Validation    │  ← shared/schema.ts
│  (insertGestureSampleSchema)│
└───────────────────────────┘
    │
    ├─── ✅ Valid ───→ Continue to database
    │
    └─── ❌ Invalid ─→ Return 400 error
                       { message: "Label is required" }
```

## 🔐 Security Layers

```
Request
  │
  ↓
┌────────────────────────────┐
│ 1. Express Middleware      │
│    - Body parsing limits   │
│    - URL encoding          │
└────────────────────────────┘
  │
  ↓
┌────────────────────────────┐
│ 2. Zod Validation          │
│    - Type checking         │
│    - Required fields       │
│    - Data structure        │
└────────────────────────────┘
  │
  ↓
┌────────────────────────────┐
│ 3. Mongoose Schema         │
│    - Type enforcement      │
│    - Required fields       │
│    - Trimming/sanitization │
└────────────────────────────┘
  │
  ↓
┌────────────────────────────┐
│ 4. MongoDB Storage         │
│    - BSON validation       │
│    - Document structure    │
└────────────────────────────┘
```

## 🌐 Environment Configuration

```
.env file
    ↓
    ├─── MONGODB_URI ────→ server/db.ts ────→ MongoDB Connection
    ├─── PORT ───────────→ server/index.ts ─→ Express Server
    └─── NODE_ENV ───────→ Build configuration (dev/prod)
```

## 📊 State Management

```
Frontend State:
┌────────────────────────────────────────┐
│         React Query Cache               │
│  ┌──────────────────────────────────┐  │
│  │  /api/gestures: GestureSample[]  │  │
│  │  - Cached for 5 minutes          │  │
│  │  - Auto-refetch on focus         │  │
│  │  - Optimistic updates            │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
        ↕
    HTTP API
        ↕
Backend (Stateless):
┌────────────────────────────────────────┐
│  Each request is independent           │
│  No server-side session state          │
└────────────────────────────────────────┘
        ↕
    Mongoose
        ↕
Database (Persistent):
┌────────────────────────────────────────┐
│  MongoDB Collections                   │
│  - gesturesamples (persistent data)    │
└────────────────────────────────────────┘
```

## 🚀 Development vs Production

### Development Mode
```
npm run dev
    │
    ├─── Vite Dev Server (HMR) ──→ Frontend hot reload
    │
    └─── TSX (server) ──→ Backend auto-restart
             ↓
        MongoDB (local)
```

### Production Mode
```
npm run build → npm start
    │
    ├─── Static files served by Express
    │
    └─── Compiled Node.js server
             ↓
        MongoDB Atlas (cloud)
```

## 🔄 Technology Comparison

```
Before (PostgreSQL):              After (MongoDB):
┌─────────────────┐              ┌─────────────────┐
│   Drizzle ORM   │              │    Mongoose     │
│   - Complex     │    ──→       │   - Simple      │
│   - SQL-based   │              │   - NoSQL       │
│   - Migrations  │              │   - Schemaless  │
└─────────────────┘              └─────────────────┘
        ↓                                 ↓
┌─────────────────┐              ┌─────────────────┐
│   PostgreSQL    │              │    MongoDB      │
│   - Relational  │    ──→       │   - Document    │
│   - Tables      │              │   - Collections │
│   - Integer IDs │              │   - ObjectIds   │
└─────────────────┘              └─────────────────┘
```

---

This diagram represents the complete MERN stack architecture of your Gesture-Web application! 🎉
