# Windows Setup Instructions - Backend

## 🚀 Quick Windows Setup

### Method 1: Use Windows Script (Easiest)
```cmd
cd backend_new
start-windows.cmd
```

### Method 2: Manual Commands
```cmd
cd backend_new

REM Install dependencies
npm install

REM Setup environment
copy .env.local .env

REM Start server (Windows compatible)
set NODE_ENV=development
tsx src/index.ts
```

### Method 3: Use npx (If cross-env still doesn't work)
```cmd
cd backend_new
npx cross-env NODE_ENV=development tsx src/index.ts
```

## 🔧 If You Still Get Errors

### Error: 'NODE_ENV' is not recognized
**Solution 1:** Use the Windows script above

**Solution 2:** Install cross-env globally
```cmd
npm install -g cross-env
npm run dev
```

**Solution 3:** Set environment manually
```cmd
set NODE_ENV=development
tsx src/index.ts
```

## 📋 Environment Setup

Create `.env` file in backend_new directory:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://your_database_url_here
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000
```

## ✅ Expected Output

When running successfully, you should see:
```
✅ Backend Configuration Loaded: {
  port: 3001,
  environment: 'development',
  databaseConnected: true,
  ...
}
🚀 Server running on port 3001
```

## 🌐 Test Your Setup

Open browser or use curl:
- http://localhost:3001/api/health
- http://localhost:3001/api/public/market/price/BTCUSDT

Both should return JSON responses if working correctly.