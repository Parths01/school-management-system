@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Stopping Scholar - School Management System
echo ===================================================

REM Close terminal windows by window title
echo Closing Scholar console windows...
taskkill /fi "WINDOWTITLE eq Scholar API Server*" /t /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq Scholar Client Server*" /t /f >nul 2>&1

REM Free port 5000 (Backend API)
echo Checking port 5000 (Backend API)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":5000 .*LISTENING"') do (
    echo Terminating backend process PID %%a on port 5000...
    taskkill /f /t /pid %%a >nul 2>&1
)

REM Free port 5173 (Frontend Vite)
echo Checking port 5173 (Frontend Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":5173 .*LISTENING"') do (
    echo Terminating frontend process PID %%a on port 5173...
    taskkill /f /t /pid %%a >nul 2>&1
)

REM Free port 5174 (Frontend Vite alternate)
echo Checking port 5174 (Frontend Vite alternate)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":5174 .*LISTENING"') do (
    echo Terminating frontend process PID %%a on port 5174...
    taskkill /f /t /pid %%a >nul 2>&1
)

echo.
echo ===================================================
echo   All Scholar services have been stopped.
echo ===================================================
echo.
pause
