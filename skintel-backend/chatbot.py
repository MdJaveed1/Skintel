# chatbot.py
import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
import json
import time
import asyncio
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Debug: Check if API key is loaded
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    logger.info(f"✅ Gemini API key loaded: {api_key[:10]}...")
else:
    logger.error("❌ No Gemini API key found in environment!")

# Configure Gemini AI
genai.configure(api_key=api_key)

@dataclass
class QuotaManager:
    """Manages API quota and rate limiting"""
    daily_limit: int = 50
    requests_made: int = 0
    last_reset: datetime = None
    retry_after: int = 0
    last_request_time: datetime = None
    
    def __post_init__(self):
        if self.last_reset is None:
            self.last_reset = datetime.now()
    
    def reset_if_new_day(self):
        """Reset quota if it's a new day"""
        now = datetime.now()
        if now.date() > self.last_reset.date():
            self.requests_made = 0
            self.last_reset = now
            self.retry_after = 0
            logger.info("✅ Daily quota reset")
    
    def can_make_request(self) -> bool:
        """Check if we can make a request"""
        self.reset_if_new_day()
        
        # Check daily limit
        if self.requests_made >= self.daily_limit:
            return False
        
        # Check retry delay
        if self.retry_after > 0:
            time_since_last = time.time() - (self.last_request_time.timestamp() if self.last_request_time else 0)
            if time_since_last < self.retry_after:
                return False
            else:
                self.retry_after = 0
        
        return True
    
    def record_request(self):
        """Record a successful request"""
        self.requests_made += 1
        self.last_request_time = datetime.now()
    
    def record_rate_limit(self, retry_after: int = 3600):
        """Record a rate limit hit"""
        self.retry_after = retry_after
        self.last_request_time = datetime.now()
        logger.warning(f"⚠️ Rate limit hit, retry after {retry_after} seconds")
    
    def get_status(self) -> dict:
        """Get current quota status"""
        self.reset_if_new_day()
        return {
            "requests_remaining": max(0, self.daily_limit - self.requests_made),
            "requests_made": self.requests_made,
            "daily_limit": self.daily_limit,
            "retry_after": self.retry_after,
            "can_make_request": self.can_make_request()
        }

# Global quota manager
quota_manager = QuotaManager()

class SkintelChatbot:
    def __init__(self):
        try:
            # Try multiple model versions
            self.model_options = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
            self.active_model = None
            
            for model_name in self.model_options:
                try:
                    self.model = genai.GenerativeModel(model_name)
                    # Test the model with a simple request
                    test_response = self.model.generate_content("Test")
                    self.active_model = model_name
                    logger.info(f"✅ Successfully initialized {model_name}")
                    break
                except Exception as e:
                    logger.warning(f"⚠️ Failed to initialize {model_name}: {str(e)[:100]}...")
                    continue
            
            if not self.active_model:
                logger.error("❌ All model initialization attempts failed")
                raise Exception("No available Gemini models")
            
            self.fallback_responses = {
                "general": [
                    "I'm currently experiencing high demand. Here's some general skincare advice: Always use sunscreen daily, maintain a consistent routine, and listen to your skin's needs.",
                    "While I'm temporarily unavailable, remember these basics: gentle cleansing, regular moisturizing, and sun protection are key to healthy skin.",
                    "I'm having technical difficulties, but here's a quick tip: less is often more with skincare - start with basics and add products gradually."
                ],
                "concerns": {
                    "acne": "For acne-prone skin, focus on gentle cleansing, avoid over-washing, and consider salicylic acid or benzoyl peroxide products. Always patch test new products.",
                    "dryness": "For dry skin, use a gentle, hydrating cleanser and apply moisturizer to damp skin. Look for ingredients like hyaluronic acid and ceramides.",
                    "aging": "For anti-aging, prioritize sunscreen daily, consider retinoids (start slowly), and maintain consistent hydration with quality moisturizers.",
                    "sensitivity": "For sensitive skin, choose fragrance-free, gentle products. Patch test everything and introduce new products one at a time."
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini model: {str(e)}")
            self.model = None
            self.active_model = None
            # Initialize fallback responses even if model fails
            self.fallback_responses = {
                "general": [
                    "I'm currently experiencing technical difficulties. Here's some general skincare advice: Always use sunscreen daily, maintain a consistent routine, and listen to your skin's needs.",
                    "While I'm temporarily unavailable, remember these basics: gentle cleansing, regular moisturizing, and sun protection are key to healthy skin."
                ],
                "concerns": {
                    "acne": "For acne-prone skin, focus on gentle cleansing, avoid over-washing, and consider salicylic acid or benzoyl peroxide products.",
                    "dryness": "For dry skin, use a gentle, hydrating cleanser and apply moisturizer to damp skin. Look for hyaluronic acid and ceramides.",
                    "aging": "For anti-aging, prioritize sunscreen daily, consider retinoids (start slowly), and maintain consistent hydration.",
                    "sensitivity": "For sensitive skin, choose fragrance-free, gentle products. Patch test everything."
                }
            }
        
        # System context for skincare expertise
        self.system_context = """
        You are Skintel AI, an expert skincare consultant and product recommendation assistant. 
        You specialize in:
        - Analyzing skin concerns and conditions
        - Providing personalized skincare advice
        - Recommending appropriate skincare products and routines
        - Answering questions about ingredients, skin types, and treatments
        - Offering general skincare education and tips
        
        Always provide helpful, accurate, and safe skincare advice. If a user has serious skin conditions, 
        recommend consulting with a dermatologist. Keep responses conversational but professional.
        
        Available product categories for recommendations:
        - Serums (anti-aging, vitamin C, niacinamide, etc.)
        - Face washes and cleansers
        - Sunscreens (SPF protection)
        - Moisturizers (day/night creams)
        - Other specialized treatments
        """
    
    def generate_response(self, user_message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """
        Generate a response using Gemini AI with skincare context
        
        Args:
            user_message: The user's message
            conversation_history: Previous conversation messages for context
        
        Returns:
            AI-generated response
        """
        # Check if model is available
        if not self.model or not self.active_model:
            return self._get_fallback_response('general')
        
        # Check quota before making request
        if not quota_manager.can_make_request():
            status = quota_manager.get_status()
            if status["requests_remaining"] == 0:
                return f"I've reached my daily conversation limit. I'll be back tomorrow! In the meantime, {self._get_fallback_response('general')}"
            else:
                return f"I'm temporarily rate limited. Please try again in about an hour. {self._get_fallback_response('general')}"
        
        def make_request():
            # Build conversation context
            context = self.system_context + "\n\n"
            
            if conversation_history:
                context += "Previous conversation:\n"
                for msg in conversation_history[-5:]:  # Keep last 5 messages for context
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    context += f"{role.capitalize()}: {content}\n"
                context += "\n"
            
            context += f"User: {user_message}\nSkintel AI:"
            
            # Generate response
            response = self.model.generate_content(context)
            return response.text.strip()
        
        try:
            response = self._retry_with_backoff(make_request)
            
            # Record successful request
            quota_manager.record_request()
            logger.info(f"✅ Successful API request using {self.active_model}. Remaining: {quota_manager.get_status()['requests_remaining']}")
            
            return response
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ All retry attempts failed: {error_msg}")
            
            if "429" in error_msg or "quota" in error_msg.lower():
                # Record rate limit hit
                quota_manager.record_rate_limit()
                status = quota_manager.get_status()
                
                if status["requests_remaining"] == 0:
                    return f"I've reached my daily conversation limit. I'll be back tomorrow! In the meantime, {self._get_fallback_response('general')}"
                else:
                    return f"I'm experiencing high demand right now. Please try again in about an hour. {self._get_fallback_response('general')}"
            elif "404" in error_msg:
                return f"I'm having model compatibility issues. {self._get_fallback_response('general')} Our team has been notified."
            elif "403" in error_msg or "permission" in error_msg.lower():
                return f"I'm experiencing authentication issues. {self._get_fallback_response('general')} Please check your API configuration."
            else:
                return f"I'm having technical difficulties. {self._get_fallback_response('general')} Error details have been logged for our team."
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                # Record rate limit hit
                quota_manager.record_rate_limit()
                status = quota_manager.get_status()
                
                if status["requests_remaining"] == 0:
                    hours_until_reset = 24 - datetime.now().hour
                    return f"I've reached my daily conversation limit. I'll be back tomorrow! In the meantime, {self._get_fallback_response('general')}"
                else:
                    return f"I'm experiencing high demand right now. Please try again in about an hour. {self._get_fallback_response('general')}"
            else:
                logger.error(f"Chatbot error: {str(e)}")
                return f"I'm having technical difficulties. {self._get_fallback_response('general')} Error details have been logged for our team."
    
    def get_skincare_recommendations(self, concerns: List[str], user_message: str = None) -> str:
        """
        Generate skincare advice based on detected skin concerns
        
        Args:
            concerns: List of detected skin concerns
            user_message: Optional additional user context
        
        Returns:
            Personalized skincare advice
        """
        # Check if model is available
        if not self.model or not self.active_model:
            return self._get_concern_fallback(concerns)
        
        # Check quota before making request
        if not quota_manager.can_make_request():
            return self._get_concern_fallback(concerns)
        
        def make_request():
            prompt = f"""
            Based on the following detected skin concerns: {', '.join(concerns)}, 
            provide personalized skincare advice including:
            1. General care tips for these specific concerns
            2. Recommended skincare routine order
            3. Key ingredients to look for
            4. Ingredients or products to avoid
            5. Lifestyle recommendations
            
            {f"Additional context from user: {user_message}" if user_message else ""}
            
            Keep the response helpful, practical, and easy to follow.
            """
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        
        try:
            response = self._retry_with_backoff(make_request)
            
            # Record successful request
            quota_manager.record_request()
            logger.info(f"✅ Successful recommendation request using {self.active_model}. Remaining: {quota_manager.get_status()['requests_remaining']}")
            
            return response
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Recommendation request failed: {error_msg}")
            
            if "429" in error_msg or "quota" in error_msg.lower():
                quota_manager.record_rate_limit()
                # Try to provide fallback advice based on concerns
                fallback_advice = self._get_concern_fallback(concerns)
                return f"I'm experiencing high demand, but here's some general advice for your concerns: {fallback_advice}"
            else:
                fallback_advice = self._get_concern_fallback(concerns)
                return f"I'm having technical difficulties, but here's some general advice: {fallback_advice}"
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                quota_manager.record_rate_limit()
                # Try to provide fallback advice based on concerns
                fallback_advice = self._get_concern_fallback(concerns)
                return f"I'm experiencing high demand, but here's some general advice for your concerns: {fallback_advice}"
            else:
                logger.error(f"Recommendation error: {str(e)}")
                fallback_advice = self._get_concern_fallback(concerns)
                return f"I'm having technical difficulties, but here's some general advice: {fallback_advice}"
    
    def _get_fallback_response(self, category: str) -> str:
        """Get a fallback response when API is unavailable"""
        import random
        responses = self.fallback_responses.get(category, ["Please try again later."])
        return random.choice(responses)
    
    def _get_concern_fallback(self, concerns: List[str]) -> str:
        """Get fallback advice for specific concerns"""
        if not concerns:
            return self._get_fallback_response("general")
        
        advice_parts = []
        for concern in concerns[:2]:  # Limit to 2 concerns for brevity
            concern_lower = concern.lower()
            for key, advice in self.fallback_responses["concerns"].items():
                if key in concern_lower:
                    advice_parts.append(advice)
                    break
        
        if advice_parts:
            return " ".join(advice_parts)
        else:
            return "Focus on gentle cleansing, regular moisturizing, and daily sun protection. Consider consulting a dermatologist for persistent concerns."
    
    def validate_api_key(self) -> bool:
        """
        Validate if Gemini API key is properly configured
        
        Returns:
            True if API key is valid, False otherwise
        """
        try:
            # Check if API key exists
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "your-gemini-api-key-here":
                return False
            
            # Skip live validation to save quota
            # Just check if key format is correct (starts with AIza)
            return api_key.startswith("AIza")
            
        except Exception as e:
            logger.error(f"API key validation error: {str(e)}")
            return False
    
    def _retry_with_backoff(self, operation, max_retries=3):
        """Retry operation with exponential backoff"""
        for attempt in range(max_retries):
            try:
                return operation()
            except Exception as e:
                error_msg = str(e)
                
                if "429" in error_msg or "quota" in error_msg.lower():
                    # Rate limiting - try exponential backoff
                    wait_time = (2 ** attempt) * 2  # 2, 4, 8 seconds
                    if attempt < max_retries - 1:
                        logger.warning(f"⏳ Rate limited, waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"❌ Max retries exceeded for rate limiting")
                        raise e
                elif "404" in error_msg:
                    # Model not found - try alternative model
                    if hasattr(self, 'model_options') and len(self.model_options) > 1:
                        current_index = self.model_options.index(self.active_model) if self.active_model in self.model_options else 0
                        if current_index + 1 < len(self.model_options):
                            next_model = self.model_options[current_index + 1]
                            logger.info(f"🔄 Switching to alternative model: {next_model}")
                            try:
                                self.model = genai.GenerativeModel(next_model)
                                self.active_model = next_model
                                return operation()
                            except Exception as e2:
                                logger.error(f"❌ Alternative model {next_model} also failed: {str(e2)[:50]}...")
                    raise e
                else:
                    # Other errors - don't retry
                    raise e
        
        raise Exception("Max retries exceeded")
    
    def get_quota_status(self) -> dict:
        """Get current API quota status (legacy method)"""
        return self.get_service_status()

    def get_service_status(self) -> dict:
        """Get detailed service status"""
        quota_status = quota_manager.get_status()
        
        return {
            "model_available": self.model is not None,
            "active_model": self.active_model,
            "quota_status": quota_status,
            "service_health": "healthy" if self.model and quota_status["can_make_request"] else "degraded"
        }

# Global chatbot instance
chatbot = SkintelChatbot()

def get_chatbot_response(message: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Get chatbot response with error handling
    
    Args:
        message: User message
        history: Conversation history
    
    Returns:
        Response dictionary with success status and message
    """
    try:
        if not chatbot.validate_api_key():
            return {
                "success": False,
                "message": "Chatbot service is not properly configured. Please check your API key.",
                "error": "Invalid API configuration"
            }
        
        response = chatbot.generate_response(message, history)
        quota_status = chatbot.get_quota_status()
        
        return {
            "success": True,
            "message": response,
            "timestamp": datetime.now().isoformat(),
            "quota_status": quota_status
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": "I'm experiencing technical difficulties. Please try again later.",
            "error": str(e),
            "quota_status": chatbot.get_quota_status()
        }

def get_concern_based_advice(concerns: List[str], user_context: str = None) -> Dict[str, Any]:
    """
    Get skincare advice based on detected concerns
    
    Args:
        concerns: List of skin concerns
        user_context: Additional user context
    
    Returns:
        Advice dictionary with success status and recommendations
    """
    try:
        if not concerns:
            return {
                "success": False,
                "message": "No skin concerns provided for analysis.",
                "error": "Missing concerns data"
            }
        
        if not chatbot.validate_api_key():
            return {
                "success": False,
                "message": "Skincare advice service is not available. Please check configuration.",
                "error": "Invalid API configuration"
            }
        
        advice = chatbot.get_skincare_recommendations(concerns, user_context)
        quota_status = chatbot.get_quota_status()
        
        return {
            "success": True,
            "advice": advice,
            "concerns_analyzed": concerns,
            "timestamp": datetime.now().isoformat(),
            "quota_status": quota_status
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": "Unable to generate skincare advice at this time.",
            "error": str(e),
            "quota_status": chatbot.get_quota_status()
        }

# Add utility function to get service status
def get_quota_status() -> Dict[str, Any]:
    """
    Get current API quota status and service health
    
    Returns:
        Comprehensive status dictionary
    """
    try:
        return chatbot.get_service_status()
    except:
        return {
            "model_available": False,
            "active_model": None,
            "quota_status": {
                "requests_remaining": 0,
                "requests_made": 50,
                "daily_limit": 50,
                "retry_after": 3600,
                "can_make_request": False
            },
            "service_health": "unavailable"
        }