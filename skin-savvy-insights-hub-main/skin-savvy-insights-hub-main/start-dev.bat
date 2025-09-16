@echo off
echo 🚀 Starting SkinTel Frontend...

echo 📦 Installing dependencies...

REM Install main app dependencies  
if not exist "node_modules" (
    call npm install
)

echo 🌐 Starting SkinTel Frontend (port 8080)...
call npm run dev

echo ✅ SkinTel Frontend started!
echo 📱 Frontend: http://localhost:8080
echo 🔗 Make sure your FastAPI backend is running on port 8000
echo.
pause