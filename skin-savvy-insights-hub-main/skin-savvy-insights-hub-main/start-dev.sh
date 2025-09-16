#!/bin/bash

# SkinTel Frontend Development Startup Script

echo "🚀 Starting SkinTel Frontend..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install dependencies for main app
if [ ! -d "node_modules" ]; then
    npm install
fi

echo -e "${GREEN}🌐 Starting SkinTel Frontend (port 8080)...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ SkinTel Frontend is starting up!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:8080${NC}"
echo -e "${YELLOW}🔗 Make sure your FastAPI backend is running on port 8000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the frontend${NC}"

# Function to cleanup processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down frontend...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT

# Wait for process
wait