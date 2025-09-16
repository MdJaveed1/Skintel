# Insights Hub

🤖 **AI-Powered Skincare Analysis Platform** with FastAPI Backend Integration

## Project info

**URL**: https://lovable.dev/projects/a8934ade-79fd-4fa2-b5cc-1d9c562a9573

## 🚀 Quick Start

### Frontend Setup
```bash
# Windows users
start-dev.bat

# Mac/Linux users  
bash start-dev.sh

# Or manually
npm install
npm run dev
```

### Backend Requirements
This frontend expects a **FastAPI backend** running on `http://localhost:8000` with the following endpoint:

```python
# Your FastAPI backend should have:
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Your Gemini AI logic here
    return {"reply": "AI response"}
```

## ✨ Features

🔬 **AI Skin Analysis**: Upload photos for intelligent skin assessment  
🤖 **AI Chatbot**: Expert skincare consultation via your FastAPI backend  
📊 **Smart Recommendations**: Personalized product and routine suggestions  
📈 **Progress Tracking**: Monitor your skincare journey over time  
🎨 **Beautiful UI**: Modern design with animations and dark mode  

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a8934ade-79fd-4fa2-b5cc-1d9c562a9573) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)
- Framer Motion (animations)
- React Router (navigation)

**Backend Integration:**
- Connects to FastAPI backend on port 8000
- `/api/chat` endpoint for AI conversations
- `/analyze-and-recommend` for skin analysis

**Architecture:**
```
┌─────────────────┐    ┌──────────────────┐
│  Insights Hub  │    │   Your FastAPI   │
│   (React)       │◄──►│   Backend        │
│  Port: 8080     │    │   Port: 8000     │
└─────────────────┘    └──────────────────┘
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a8934ade-79fd-4fa2-b5cc-1d9c562a9573) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
