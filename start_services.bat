@echo off
echo ==========================================================
echo    SKYGUARD - AI Weather Intelligence Platform Launcher
echo ==========================================================

echo [1/3] Starting Python ML Microservice on port 5001...
start "SkyGuard - Python ML Microservice" cmd /k "cd /d %~dp0ml-service && python -m uvicorn main:app --host 0.0.0.0 --port 5001"

echo [2/3] Starting Node.js Express Gateway on port 5000...
start "SkyGuard - Node.js Express API" cmd /k "cd /d %~dp0backend && node server.js"

echo [3/3] Starting Vite React Frontend on port 3000...
start "SkyGuard - React Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ==========================================================
echo All services launched!
echo  - Frontend:         http://localhost:3000/
echo  - Express Gateway:  http://localhost:5000/api/health
echo  - Python ML Engine: http://localhost:5001/docs
echo ==========================================================
