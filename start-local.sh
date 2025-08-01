#!/bin/bash

echo "🚀 Starting Crypto Strategy Backend (Local Development)"
echo "📂 Port: 3001"
echo "🔗 API URL: http://localhost:3001"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.local" ]; then
        echo "📋 Using .env.local configuration..."
        cp .env.local .env
    else
        echo "⚠️  Warning: No .env file found. Please configure your environment variables."
    fi
fi

# Start the development server
echo "🚀 Starting TypeScript development server..."
npm run dev

echo ""
echo "✅ Backend ready at: http://localhost:3001"
echo "📊 Database: Configure DATABASE_URL in .env file"