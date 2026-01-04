# Start MongoDB Service (Run as Administrator)
# Right-click PowerShell and select "Run as Administrator", then run this script

Write-Host "🚀 Starting MongoDB Service..." -ForegroundColor Cyan
Write-Host ""

try {
    Start-Service MongoDB -ErrorAction Stop
    Write-Host "✅ MongoDB service started successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Verify service is running
    $service = Get-Service MongoDB
    Write-Host "Service Status: $($service.Status)" -ForegroundColor Green
    Write-Host ""
    
    # Test connection
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    $testConnection = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "✅ MongoDB is accepting connections on port 27017" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ MongoDB service is running but not accepting connections yet" -ForegroundColor Yellow
        Write-Host "   Wait a few seconds and try again" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to start MongoDB service" -ForegroundColor Red
    Write-Host ""
    Write-Host "This script requires Administrator privileges!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to this folder:" -ForegroundColor White
    Write-Host "   cd '$PWD'" -ForegroundColor Cyan
    Write-Host "4. Run: .\start-mongodb.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use MongoDB Atlas (cloud) instead" -ForegroundColor Cyan
    Write-Host "See README_MERN.md for instructions" -ForegroundColor Cyan
}
