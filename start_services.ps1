# SKYGUARD Unified Platform Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SKYGUARD - AI Weather Intelligence Platform Launcher   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Python ML Microservice (Port 5001)
Write-Host "[1/3] Starting Python ML Microservice on port 5001..." -ForegroundColor Yellow
$mlProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 5001" -WorkingDirectory "$PSScriptRoot\ml-service" -PassThru

# 2. Start Node.js Express Gateway (Port 5000)
Write-Host "[2/3] Starting Node.js Express Gateway on port 5000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$PSScriptRoot\backend" -PassThru

# 3. Start Vite React Frontend (Port 3000)
Write-Host "[3/3] Starting Vite React Frontend on port 3000..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot" -PassThru

Write-Host "----------------------------------------------------------" -ForegroundColor Green
Write-Host "All SKYGUARD services launched successfully!" -ForegroundColor Green
Write-Host " - Frontend UI:        http://localhost:3000/" -ForegroundColor Cyan
Write-Host " - Node.js Express API: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host " - Python ML Service:   http://localhost:5001/docs" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
