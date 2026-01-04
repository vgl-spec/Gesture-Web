# 🚀 MERN Stack Quick Reference

## Environment Setup
```env
MONGODB_URI=mongodb://localhost:27017/gesture-web
PORT=5000
NODE_ENV=development
```

## Start Development
```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:5000
```

## MongoDB Connection Strings

### Local MongoDB
```
mongodb://localhost:27017/gesture-web
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/gesture-web?retryWrites=true&w=majority
```

## API Quick Test

### GET All Gestures
```bash
curl http://localhost:5000/api/gestures
```

### POST New Gesture
```bash
curl -X POST http://localhost:5000/api/gestures \
  -H "Content-Type: application/json" \
  -d '{"label":"Peace","landmarks":[{"x":0.5,"y":0.3,"z":0.1}]}'
```

### DELETE Gesture
```bash
curl -X DELETE http://localhost:5000/api/gestures/507f1f77bcf86cd799439011
```

## Key Differences from PostgreSQL

| Aspect | PostgreSQL | MongoDB |
|--------|------------|---------|
| ID Type | `number` (1, 2, 3...) | `string` (ObjectId) |
| Schema | Strict, predefined | Flexible, dynamic |
| Query | SQL | JavaScript methods |
| Connection | `DATABASE_URL` | `MONGODB_URI` |

## MongoDB Commands (if using local)

```bash
# Windows - Start MongoDB
net start MongoDB

# Windows - Stop MongoDB
net stop MongoDB

# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use database
use gesture-web

# Show collections
show collections

# Query all gestures
db.gesturesamples.find()

# Count documents
db.gesturesamples.countDocuments()

# Delete all gestures
db.gesturesamples.deleteMany({})
```

## Troubleshooting

### Can't connect to MongoDB
```bash
# Check if MongoDB is running
net start MongoDB

# Check connection string in .env
```

### Port 5000 in use
```env
# Change port in .env
PORT=3000
```

### Dependencies issues
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

## File Structure
```
Gesture-Web/
├── client/          # React frontend
├── server/          # Express backend
│   ├── db.ts        # MongoDB connection
│   ├── index.ts     # Server entry
│   ├── routes.ts    # API routes
│   └── storage.ts   # DB operations
├── shared/
│   └── schema.ts    # Mongoose models
├── .env             # Your config (not in git)
├── .env.example     # Template
└── package.json     # Dependencies
```

## Stack Components

- **M**ongoDB - Database
- **E**xpress - Backend framework
- **R**eact - Frontend library
- **N**ode.js - Runtime

---

Need more details? Check:
- `README_MERN.md` - Full documentation
- `MIGRATION_GUIDE.md` - Migration details
- `TRANSFORMATION_SUMMARY.md` - Complete summary
