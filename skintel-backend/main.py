from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from ultralytics import YOLO
from PIL import Image
from datetime import datetime
from typing import Optional
import shutil, os, cv2, uuid

from recommendation import recommend_products
from auth import decode_token
from database import history_collection
from users import router as user_router
from chatbot import get_chatbot_response, get_concern_based_advice, get_quota_status
from models import ChatRequest, ChatResponse, SkinAdviceRequest, SkinAdviceResponse, ProgressReport, ProgressSummary
from skin_progress import get_skin_progress_report, get_progress_summary

app = FastAPI()
app.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO("best.pt")

# Directory to store images
IMAGE_DIR = "output_images"
os.makedirs(IMAGE_DIR, exist_ok=True)

# OAuth2 for token verification
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/analyze-and-recommend")
async def analyze_and_recommend(
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme),
    age: Optional[int] = Form(None),
    skin_type: Optional[str] = Form(None)
):
    try:
        email = decode_token(token)["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Save temp image
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run YOLO prediction
    results = model.predict(temp_filename, conf=0.1)
    boxes = results[0].boxes
    class_names = model.names

    concerns_detected = list(set(
        class_names[int(cls_id)] for cls_id in boxes.cls
    )) if boxes and len(boxes.cls) > 0 else []

    # Validate skin_type if provided
    valid_skin_types = ["oily", "dry", "combination", "normal", "sensitive", "all"]
    if skin_type and skin_type.lower() not in valid_skin_types:
        raise HTTPException(status_code=400, detail=f"Invalid skin_type. Must be one of: {', '.join(valid_skin_types)}")
    
    # Validate age if provided
    if age and (age < 13 or age > 100):
        raise HTTPException(status_code=400, detail="Age must be between 13 and 100")
    
    # Recommend products with skin type preference
    recommendations = recommend_products(concerns_detected, skin_type=skin_type)

    # Save annotated image
    image_with_boxes = results[0].plot()
    image_rgb = cv2.cvtColor(image_with_boxes, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(image_rgb)
    output_filename = f"{uuid.uuid4().hex}.jpg"
    output_path = os.path.join(IMAGE_DIR, output_filename)
    pil_image.save(output_path)

    # Save to MongoDB (now including recommendations, age, and skin_type)
    history_collection.insert_one({
        "email": email,
        "image_name": output_filename,
        "annotated_image_url": f"/result-image/{output_filename}",
        "concerns": concerns_detected,
        "recommendations": recommendations,   # ✅ Save recommendations
        "age": age,  # ✅ Save age
        "skin_type": skin_type,  # ✅ Save skin type
        "timestamp": datetime.utcnow()
    })

    # Delete temp file
    os.remove(temp_filename)

    return {
        "predicted_concerns": concerns_detected,
        "recommendations": recommendations,
        "annotated_image_url": f"/result-image/{output_filename}"
    }


@app.get("/result-image/{filename}")
async def get_result_image(filename: str):
    # Prevent path traversal
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(IMAGE_DIR, safe_filename)

    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"message": "Image not found"})

    return StreamingResponse(open(file_path, "rb"), media_type="image/jpeg")


@app.get("/history")
def get_history(token: str = Depends(oauth2_scheme)):
    try:
        email = decode_token(token)["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    history = list(history_collection.find({"email": email}, {"_id": 0}))
    return history


# Chatbot Endpoints
@app.post("/chatbot", response_model=ChatResponse)
def chat_with_bot(request: ChatRequest, token: str = Depends(oauth2_scheme)):
    try:
        email = decode_token(token)["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Convert ChatMessage objects to dict format for the chatbot
    history = [msg.dict() for msg in request.conversation_history] if request.conversation_history else None
    
    response = get_chatbot_response(request.message, history)
    
    if not response["success"]:
        raise HTTPException(status_code=500, detail=response["message"])
    
    return ChatResponse(
        success=True,
        message=response["message"],
        timestamp=response["timestamp"]
    )


@app.post("/skin-advice", response_model=SkinAdviceResponse)
def get_skin_advice(request: SkinAdviceRequest, token: str = Depends(oauth2_scheme)):
    try:
        email = decode_token(token)["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    response = get_concern_based_advice(request.concerns, request.additional_context)
    
    if not response["success"]:
        raise HTTPException(status_code=500, detail=response["message"])
    
    return SkinAdviceResponse(
        success=True,
        advice=response["advice"],
        concerns_analyzed=response["concerns_analyzed"],
        timestamp=response["timestamp"]
    )


@app.get("/chatbot/status")
def get_chatbot_status(token: str = Depends(oauth2_scheme)):
    """Get chatbot quota status"""
    try:
        email = decode_token(token)["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    quota_status = get_quota_status()
    
    return {
        "quota_status": quota_status,
        "service_available": quota_status["can_make_request"],
        "estimated_reset_time": "Daily reset at midnight UTC" if quota_status["requests_remaining"] == 0 else None
    }


# Progress Tracking Endpoints
@app.get("/progress-report", response_model=ProgressReport)
def get_user_progress_report(days_back: int = 90, token: str = Depends(oauth2_scheme)):
    """Get detailed skin progress report for the user"""
    try:
        email = decode_token(token)["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Validate days_back parameter
    if days_back < 7 or days_back > 365:
        raise HTTPException(status_code=400, detail="Days back must be between 7 and 365")
    
    progress_report = get_skin_progress_report(email, days_back)
    
    return ProgressReport(**progress_report)


@app.get("/progress-summary", response_model=ProgressSummary)
def get_user_progress_summary(token: str = Depends(oauth2_scheme)):
    """Get quick progress summary for dashboard display"""
    try:
        email = decode_token(token)["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    progress_summary = get_progress_summary(email)
    
    return ProgressSummary(**progress_summary)

