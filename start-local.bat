@echo off
echo.
echo ========================================
echo   Proud Profits Backend - Local Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm found:
npm --version

echo.
echo 📦 Installing dependencies...
call npm install

REM Check if .env file exists
if not exist .env (
    echo.
    echo ⚠️  .env file not found, creating from template...
    copy .env.example .env
    echo.
    echo ✅ Created .env file from template
    echo 📝 Please edit .env file to add your DATABASE_URL and other settings
    echo.
    echo Press any key to continue once you've updated .env...
    pause >nul
)

echo.
echo 🚀 Starting backend server...
echo.
echo Server will run on: http://localhost:5000
echo Health check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev