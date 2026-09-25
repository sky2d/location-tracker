@echo off
echo =======================================================
echo Starting Real-Time Tracking App (Backend + Frontend)
echo =======================================================

echo.
echo [1/4] Starting Docker infrastructure (Postgres, Redis, Kafka)...
start cmd /k "docker-compose up"

echo.
echo Waiting for infrastructure to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [2/4] Starting Node.js Backend Server...
start cmd /k "cd server && npm run dev"

echo.
echo [3/4] Starting React Frontend...
start cmd /k "cd client && npm run dev"

echo.
echo Waiting for servers to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Starting Member Simulator Script...
start cmd /k "cd server && node scripts/simulator.js"

echo.
echo =======================================================
echo All services started! Check the separate terminal windows.
echo Frontend should be available at http://localhost:3000
echo Backend should be available at http://localhost:4000
echo =======================================================
pause
