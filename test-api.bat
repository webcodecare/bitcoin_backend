@echo off
echo.
echo ========================================
echo   Testing Proud Profits Backend API
echo ========================================
echo.

REM Check if curl is available
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ curl is not available
    echo Please install curl or use PowerShell commands instead
    pause
    exit /b 1
)

echo Testing API endpoints...
echo.

echo 1. Health Check:
curl -s http://localhost:5000/api/health
echo.
echo.

echo 2. Available Tickers:
curl -s http://localhost:5000/api/public/tickers
echo.
echo.

echo 3. Bitcoin Price:
curl -s http://localhost:5000/api/public/market/price/BTCUSDT
echo.
echo.

echo 4. Trading Signals:
curl -s "http://localhost:5000/api/public/signals/alerts?ticker=BTCUSDT&timeframe=1W"
echo.
echo.

echo 5. OHLC Chart Data:
curl -s "http://localhost:5000/api/public/ohlc?symbol=BTCUSDT&interval=1w&limit=5"
echo.
echo.

echo ✅ API testing complete!
echo.
pause