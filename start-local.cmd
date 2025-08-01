@echo off
echo 🚀 Starting Crypto Strategy Backend (Local Development)
echo 📂 Port: 3001
echo 🔗 API URL: http://localhost:3001
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Copy environment file if it doesn't exist
if not exist ".env" (
    if exist ".env.local" (
        echo 📋 Using .env.local configuration...
        copy .env.local .env
    ) else (
        echo ⚠️  Warning: No .env file found. Please configure your environment variables.
    )
)

REM Start the development server
echo 🚀 Starting TypeScript development server...
echo Running: cross-env NODE_ENV=development tsx src/index.ts
npx cross-env NODE_ENV=development tsx src/index.ts

echo.
echo ✅ Backend ready at: http://localhost:3001
echo 📊 Database: Configure DATABASE_URL in .env file