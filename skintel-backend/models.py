from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional, Dict, Any

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Chatbot Models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    success: bool
    message: str
    timestamp: str
    error: Optional[str] = None

class SkinAdviceRequest(BaseModel):
    concerns: List[str]
    additional_context: Optional[str] = None

class SkinAdviceResponse(BaseModel):
    success: bool
    advice: Optional[str] = None
    concerns_analyzed: Optional[List[str]] = None
    timestamp: str
    error: Optional[str] = None

class AnalysisRequest(BaseModel):
    """Model for image analysis request with additional user data"""
    age: Optional[int] = None
    skin_type: Optional[str] = None
    
    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 13 or v > 100):
            raise ValueError('Age must be between 13 and 100')
        return v
    
    @validator('skin_type')
    def validate_skin_type(cls, v):
        if v is not None:
            valid_types = ['oily', 'dry', 'combination', 'normal', 'sensitive', 'all']
            if v.lower() not in valid_types:
                raise ValueError(f'Skin type must be one of: {", ".join(valid_types)}')
        return v.lower() if v else v

# Progress Tracking Models
class ProgressMetrics(BaseModel):
    status: str
    overall_improvement_percentage: Optional[float] = None
    first_analysis: Optional[Dict[str, Any]] = None
    latest_analysis: Optional[Dict[str, Any]] = None
    concern_changes: Optional[Dict[str, List[str]]] = None
    tracking_period: Optional[Dict[str, int]] = None
    trend: Optional[str] = None
    average_severity: Optional[float] = None

class ProgressReport(BaseModel):
    status: str
    message: str
    progress_metrics: Optional[ProgressMetrics] = None
    insights: Optional[str] = None
    trend_analysis: Optional[Dict[str, Any]] = None
    user_profile: Optional[Dict[str, Any]] = None
    recommendation: Optional[str] = None

class ProgressSummary(BaseModel):
    status: str
    total_analyses: Optional[int] = None
    improvement_percentage: Optional[float] = None
    improvement_trend: Optional[str] = None
    latest_concerns: Optional[List[str]] = None
    tracking_days: Optional[int] = None
    message: Optional[str] = None