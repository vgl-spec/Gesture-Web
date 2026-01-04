# Quick Setup Script for MERN Stack Gesture-Web

Write-Host "🚀 Setting up Gesture-Web MERN Stack..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created! Please update it with your MongoDB connection string." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Check if MongoDB is running (local)
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($mongoCheck.TcpTestSucceeded) {
        Write-Host "✅ MongoDB is running on localhost:27017" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB is not running on localhost:27017" -ForegroundColor Yellow
        Write-Host "   If you're using MongoDB Atlas, you can ignore this." -ForegroundColor Yellow
        Write-Host "   Otherwise, start MongoDB with: net start MongoDB" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check MongoDB connection" -ForegroundColor Yellow
}
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with your MongoDB connection string" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:5000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see README_MERN.md" -ForegroundColor Cyan
