@echo off
setlocal
echo ===================================================
echo   Starting Scholar - School Management System
echo ===================================================

REM Check MongoDB service status
sc query MongoDB | findstr /i "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Attempting to start MongoDB service...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Could not start MongoDB service automatically.
        echo Please ensure MongoDB is running or configured in server\.env.
    ) else (
        echo [OK] MongoDB service is running.
    )
) else (
    echo [OK] MongoDB service is running.
)

echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "Scholar API Server" cmd /k "title Scholar API Server && cd /d ""%~dp0server"" && npm run dev"

echo Waiting for the API and MongoDB to become ready...
for /l %%i in (1,1,30) do (
    curl --fail --silent http://127.0.0.1:5000/api/health >nul 2>&1 && goto api_ready
    timeout /t 1 /nobreak >nul
)
echo [WARNING] API health check did not succeed after 30 seconds.
echo Check the API window, MongoDB service, and server\.env settings.
goto start_client

:api_ready
echo [OK] API and database are responding.

:start_client

echo [2/2] Starting Frontend Client (Vite)...
start "Scholar Client Server" cmd /k "title Scholar Client Server && cd /d ""%~dp0client"" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo   Scholar is starting up!
echo   - Backend API : http://127.0.0.1:5000/api/health
echo   - Frontend    : http://localhost:5173
echo ===================================================
echo.
echo Opening browser...
start http://localhost:5173

timeout /t 5 >nul
