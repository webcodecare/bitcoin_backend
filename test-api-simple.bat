@echo off
echo.
echo ===================================
echo  Backend API Testing Suite
echo ===================================
echo.

REM Wait for server to be ready
echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Testing API endpoints...
echo.

echo 1. Health Check:
curl -s http://localhost:5000/api/health
echo.
echo.

echo 2. Bitcoin Price:
curl -s http://localhost:5000/api/public/market/price/BTCUSDT
echo.
echo.

echo 3. Available Tickers:
curl -s http://localhost:5000/api/public/tickers
echo.
echo.

echo 4. Trading Signals:
curl -s "http://localhost:5000/api/public/signals/alerts?ticker=BTCUSDT"
echo.
echo.

echo ===================================
echo  API Testing Complete!
echo ===================================
echo.
echo If you see JSON responses above, your backend is working correctly!
echo.
pause