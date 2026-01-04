# 🚀 Quick Start Guide - Get Running in 5 Minutes!

## The Problem
You're seeing: `connect ECONNREFUSED 127.0.0.1:27017`

**This means**: MongoDB is not running on your computer.

---

## ✅ EASIEST Solution: MongoDB Atlas (Cloud) - **RECOMMENDED**

### Step 1: Sign Up (2 minutes)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a **FREE** account (no credit card needed)
3. Create a **FREE** cluster (M0 tier)

### Step 2: Set Up Access (2 minutes)
1. **Create Database User**:
   - Click "Database Access" → "Add New Database User"
   - Username: `gestureadmin`
   - Password: Create a strong password (SAVE THIS!)
   - User Privileges: "Read and write to any database"

2. **Allow Your IP**:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" → "Confirm"
   - (This adds 0.0.0.0/0 - fine for development)

### Step 3: Get Connection String (1 minute)
1. Go back to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like this):
   ```
   mongodb+srv://gestureadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 4: Update .env File
Open `.env` file in Gesture-Web folder and update:
```env
MONGODB_URI=mongodb+srv://gestureadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gesture-web?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### Step 5: Run the App! 🎉
```powershell
npm run dev
```

Open browser: http://localhost:5000

**Done!** ✅

---

## 🖥️ Alternative: Local MongoDB (More Steps)

If you want to run MongoDB on your computer instead:

### Windows - Quick Commands

**Option A: Start MongoDB (Requires Admin)**
1. Open PowerShell **as Administrator** (Right-click → "Run as Administrator")
2. Run:
   ```powershell
   cd "C:\Users\verge\OneDrive\Desktop\SideProj\Gesture-Web"
   .\start-mongodb.ps1
   ```

**Option B: Manual Start**
Open PowerShell **as Administrator** and run:
```powershell
net start MongoDB
```

### Verify MongoDB is Running
```powershell
# Check service status
Get-Service MongoDB

# Test connection (should show success on port 27017)
Test-NetConnection -ComputerName localhost -Port 27017
```

### Then Run the App
```powershell
npm run dev
```

---

## 🆘 Troubleshooting

### "Service cannot be started" Error
**Solution**: PowerShell needs Administrator privileges
1. Close PowerShell
2. Right-click PowerShell icon → "Run as Administrator"
3. Try again

### "MongoDB service not found"
**Solution**: MongoDB is not installed
- **Easy**: Use MongoDB Atlas (cloud) instead ☝️
- **Advanced**: Download and install from https://www.mongodb.com/try/download/community

### "Still getting ECONNREFUSED"
**Checklist**:
1. Is MongoDB service running? `Get-Service MongoDB`
2. Is port 27017 open? `Test-NetConnection localhost -Port 27017`
3. Is `.env` file correct? Check `MONGODB_URI`
4. Did you restart the app after changing `.env`?

### Port 5000 Already in Use
Update `.env`:
```env
PORT=3000
```

---

## 📋 Complete Commands Reference

### Check Everything
```powershell
# Check if .env exists
Test-Path .env

# Check MongoDB service
Get-Service MongoDB

# Test MongoDB connection
Test-NetConnection localhost -Port 27017

# Check node_modules installed
Test-Path node_modules
```

### Start Development
```powershell
# Make sure you're in the right folder
cd "C:\Users\verge\OneDrive\Desktop\SideProj\Gesture-Web"

# Install dependencies (if needed)
npm install

# Start the app
npm run dev
```

### Expected Output When Working
```
✅ MongoDB connected successfully
Mongoose connected to MongoDB
serving on port 5000
```

---

## 🎯 My Recommendation

**For fastest setup**: Use **MongoDB Atlas** (cloud)
- ✅ No installation needed
- ✅ Works immediately
- ✅ Free tier available
- ✅ More reliable for development
- ✅ Ready for production

**For local development**: Install MongoDB locally
- Requires admin rights
- More setup steps
- Good for offline work

---

## ⚡ TL;DR - Just Get It Running!

### 30-Second Version:

1. **Use MongoDB Atlas** (https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster
3. Get connection string
4. Update `.env` with connection string
5. Run `npm run dev`
6. Open http://localhost:5000

**That's it!** 🚀

---

## 📞 Need More Help?

- Full documentation: See `README_MERN.md`
- Troubleshooting: See `CHECKLIST.md`
- Architecture: See `ARCHITECTURE.md`

**Still stuck?** Check the error message in terminal and compare with troubleshooting section above.
