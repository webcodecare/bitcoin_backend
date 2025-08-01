@echo off
echo.
echo ===============================================
echo   Crypto Strategy Backend - Windows Setup
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Install dependencies
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Setup environment
if not exist ".env" (
    if exist ".env.local" (
        echo.
        echo 📋 Copying .env.local to .env...
        copy .env.local .env
    ) else (
        echo.
        echo ⚠️  Creating basic .env file...
        echo NODE_ENV=development > .env
        echo PORT=3001 >> .env
        echo DATABASE_URL=postgresql://username:password@localhost:5432/crypto_trading >> .env
        echo JWT_SECRET=local-development-secret-key >> .env
        echo CORS_ORIGIN=http://localhost:3000 >> .env
        echo.
        echo ⚠️  Please edit .env file with your actual database URL
    )
)

echo.
echo 🚀 Starting backend server on port 3001...
echo 📡 API will be available at: http://localhost:3001
echo 🔗 Frontend should proxy to this URL
echo.

REM Set environment variable and start server
set NODE_ENV=development
tsx src/index.ts

pause