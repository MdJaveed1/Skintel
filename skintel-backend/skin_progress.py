#!/usr/bin/env python3
"""
Skin Progress Tracking and Analysis Module
Analyzes user's skincare journey by comparing historical skin analysis data
WITHOUT using external AI APIs - uses statistical analysis and templates
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import Counter, defaultdict
import statistics
from database import history_collection
import logging

logger = logging.getLogger(__name__)

class SkinProgressAnalyzer:
    def __init__(self):
        # Concern severity weights (higher = more severe)
        self.concern_severity_weights = {
            # High severity concerns
            'acne': 5,
            'severe_acne': 8,
            'cystic_acne': 7,
            'blackheads': 4,
            'whiteheads': 4,
            'blemishes': 3,
            
            # Medium severity concerns
            'dark_spots': 4,
            'pigmentation': 4,
            'melasma': 5,
            'uneven_skin_tone': 3,
            'scars': 4,
            'sun_damage': 4,
            
            # Lower severity concerns
            'dryness': 2,
            'dull_skin': 2,
            'large_pores': 2,
            'fine_lines': 3,
            'wrinkles': 4,
            'general_care': 1,
            'oiliness': 2,
        }
        
        # Progress insight templates
        self.insight_templates = {
            'excellent_progress': [
                "Fantastic progress! Your skin is showing remarkable improvement.",
                "Outstanding results! Keep up the excellent skincare routine.",
                "Amazing transformation! Your dedication is paying off beautifully."
            ],
            'good_progress': [
                "Great job! Your skin is definitely improving.",
                "Solid progress! You're on the right track.",
                "Nice improvement! Your skincare routine is working well."
            ],
            'moderate_progress': [
                "You're making steady progress. Consistency is key!",
                "Some positive changes are visible. Keep being patient.",
                "Progress is happening gradually. Stay consistent with your routine."
            ],
            'minimal_progress': [
                "Small improvements are happening. Skincare takes time.",
                "Minor positive changes detected. Stay patient and consistent.",
                "Early signs of improvement. Give your routine more time to work."
            ],
            'no_progress': [
                "Your skin appears stable. Consider adjusting your routine.",
                "No significant changes yet. You might need to modify your approach.",
                "Skin condition is maintaining. Consider consulting for routine updates."
            ],
            'concern_increase': [
                "Some new concerns have appeared. This might be temporary.",
                "Slight increase in concerns detected. Consider reviewing your routine.",
                "New skin issues noticed. It might be time to reassess your skincare."
            ]
        }
    
    def get_user_history(self, email: str, days_back: int = 90) -> List[Dict]:
        """Get user's analysis history for the specified period"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_back)
            
            history = list(history_collection.find({
                "email": email,
                "timestamp": {"$gte": cutoff_date}
            }).sort("timestamp", 1))
            
            return history
        except Exception as e:
            logger.error(f"Error retrieving history for {email}: {e}")
            return []
    
    def calculate_concern_score(self, concerns: List[str]) -> float:
        """Calculate a severity score for a list of concerns"""
        if not concerns:
            return 0.0
        
        total_score = 0
        for concern in concerns:
            # Normalize concern names (remove spaces, lowercase)
            normalized_concern = concern.lower().replace(' ', '_').replace(',', '').strip()
            score = self.concern_severity_weights.get(normalized_concern, 2)  # Default weight
            total_score += score
        
        return total_score / len(concerns) if concerns else 0  # Average score
    
    def analyze_concern_trends(self, history: List[Dict]) -> Dict:
        """Analyze how different skin concerns have changed over time"""
        if len(history) < 2:
            return {"status": "insufficient_data", "message": "Need at least 2 analyses for comparison"}
        
        # Group analyses by time periods
        concern_timeline = []
        concern_frequency = defaultdict(list)
        
        for entry in history:
            concerns = entry.get('concerns', [])
            timestamp = entry.get('timestamp')
            concern_score = self.calculate_concern_score(concerns)
            
            concern_timeline.append({
                'timestamp': timestamp,
                'concerns': concerns,
                'score': concern_score
            })
            
            # Track individual concern frequency
            for concern in concerns:
                concern_frequency[concern].append(timestamp)
        
        return {
            "timeline": concern_timeline,
            "concern_frequency": dict(concern_frequency),
            "total_analyses": len(history)
        }
    
    def calculate_progress_metrics(self, history: List[Dict]) -> Dict:
        """Calculate key progress metrics"""
        if len(history) < 2:
            return {"status": "insufficient_data"}
        
        # Get first and latest analysis
        first_analysis = history[0]
        latest_analysis = history[-1]
        
        # Calculate concern scores
        first_score = self.calculate_concern_score(first_analysis.get('concerns', []))
        latest_score = self.calculate_concern_score(latest_analysis.get('concerns', []))
        
        # Calculate improvement percentage
        if first_score > 0:
            improvement_percentage = ((first_score - latest_score) / first_score) * 100
        else:
            improvement_percentage = 0
        
        # Analyze concern changes
        first_concerns = set(first_analysis.get('concerns', []))
        latest_concerns = set(latest_analysis.get('concerns', []))
        
        resolved_concerns = first_concerns - latest_concerns
        new_concerns = latest_concerns - first_concerns
        persistent_concerns = first_concerns & latest_concerns
        
        # Calculate timeline metrics
        first_date = first_analysis.get('timestamp')
        latest_date = latest_analysis.get('timestamp')
        days_tracked = (latest_date - first_date).days if first_date and latest_date else 0
        
        # Calculate average scores over time
        all_scores = [self.calculate_concern_score(entry.get('concerns', [])) for entry in history]
        average_score = statistics.mean(all_scores) if all_scores else 0
        
        # Determine trend
        if improvement_percentage > 20:
            trend = "excellent_improvement"
        elif improvement_percentage > 10:
            trend = "good_improvement"
        elif improvement_percentage > 5:
            trend = "moderate_improvement"
        elif improvement_percentage > 0:
            trend = "minimal_improvement"
        elif improvement_percentage == 0:
            trend = "stable"
        else:
            trend = "needs_attention"
        
        return {
            "status": "success",
            "overall_improvement_percentage": round(improvement_percentage, 1),
            "first_analysis": {
                "date": first_date,
                "concerns": list(first_concerns),
                "severity_score": round(first_score, 2)
            },
            "latest_analysis": {
                "date": latest_date,
                "concerns": list(latest_concerns),
                "severity_score": round(latest_score, 2)
            },
            "concern_changes": {
                "resolved": list(resolved_concerns),
                "new": list(new_concerns),
                "persistent": list(persistent_concerns)
            },
            "tracking_period": {
                "days": days_tracked,
                "total_analyses": len(history)
            },
            "trend": trend,
            "average_severity": round(average_score, 2)
        }
    
    def generate_progress_insights(self, progress_metrics: Dict, user_age: Optional[int] = None, skin_type: Optional[str] = None) -> str:
        """Generate insights about skin progress using templates and statistical analysis"""
        try:
            if progress_metrics.get("status") != "success":
                return "Insufficient data to generate progress insights. Please continue using the app to track your skincare journey."
            
            improvement_pct = progress_metrics.get("overall_improvement_percentage", 0)
            resolved_concerns = progress_metrics.get("concern_changes", {}).get("resolved", [])
            new_concerns = progress_metrics.get("concern_changes", {}).get("new", [])
            persistent_concerns = progress_metrics.get("concern_changes", {}).get("persistent", [])
            days_tracked = progress_metrics.get("tracking_period", {}).get("days", 0)
            trend = progress_metrics.get("trend", "stable")
            
            # Generate insights based on progress
            insights = []
            
            # Main progress assessment
            if improvement_pct > 20:
                insights.append(self.insight_templates['excellent_progress'][0])
            elif improvement_pct > 10:
                insights.append(self.insight_templates['good_progress'][0])
            elif improvement_pct > 5:
                insights.append(self.insight_templates['moderate_progress'][0])
            elif improvement_pct > 0:
                insights.append(self.insight_templates['minimal_progress'][0])
            elif improvement_pct == 0:
                insights.append(self.insight_templates['no_progress'][0])
            else:
                insights.append(self.insight_templates['concern_increase'][0])
            
            # Specific concern analysis
            if resolved_concerns:
                insights.append(f"🎉 Great news! You've successfully addressed: {', '.join(resolved_concerns)}.")
            
            if persistent_concerns:
                insights.append(f"📊 Areas still being worked on: {', '.join(persistent_concerns)}. Keep maintaining your routine!")
            
            if new_concerns:
                insights.append(f"⚠️ New concerns detected: {', '.join(new_concerns)}. Consider adjusting your routine or consulting a dermatologist.")
            
            # Timeline insights
            if days_tracked > 60:
                insights.append(f"💪 You've been consistently tracking for {days_tracked} days - excellent commitment!")
            elif days_tracked > 30:
                insights.append(f"📈 {days_tracked} days of tracking shows good consistency. Keep it up!")
            else:
                insights.append(f"🌱 Early tracking stage ({days_tracked} days). Continue for better trend analysis.")
            
            # Age and skin type specific advice
            if user_age and skin_type:
                if user_age < 25 and skin_type == "oily":
                    insights.append("💡 For young oily skin, focus on gentle cleansing and oil control products.")
                elif user_age > 35:
                    insights.append("💡 At your age, incorporating anti-aging ingredients can be beneficial.")
                elif skin_type == "sensitive":
                    insights.append("💡 For sensitive skin, always patch test new products and maintain a gentle routine.")
            
            # Recommendations based on progress
            if improvement_pct < 5:
                insights.append("🔄 Consider reviewing your routine - it might be time for adjustments.")
            else:
                insights.append("✅ Your current routine is working well. Stay consistent!")
            
            return " ".join(insights)
                
        except Exception as e:
            logger.error(f"Error generating progress insights: {e}")
            return "Unable to generate insights at this time due to a technical issue."

# Global analyzer instance
progress_analyzer = SkinProgressAnalyzer()

def get_skin_progress_report(email: str, days_back: int = 90) -> Dict:
    """
    Generate a comprehensive skin progress report for a user
    """
    try:
        # Get user history
        history = progress_analyzer.get_user_history(email, days_back)
        
        if not history:
            return {
                "status": "no_data",
                "message": "No analysis history found. Start using the app to track your progress!",
                "progress_metrics": None,
                "insights": None
            }
        
        if len(history) < 2:
            latest_analysis = history[0] if history else {}
            return {
                "status": "insufficient_data", 
                "message": "Need at least 2 skin analyses to show progress. Keep tracking!",
                "progress_metrics": None,
                "insights": "Continue using the app regularly to track your skincare journey. We recommend weekly analysis for best results.",
                "current_analysis": {
                    "concerns": latest_analysis.get('concerns', []),
                    "date": latest_analysis.get('timestamp'),
                    "severity_score": progress_analyzer.calculate_concern_score(latest_analysis.get('concerns', []))
                }
            }
        
        # Calculate progress metrics
        progress_metrics = progress_analyzer.calculate_progress_metrics(history)
        
        # Get user profile from latest analysis
        latest_analysis = history[-1]
        user_age = latest_analysis.get('age')
        skin_type = latest_analysis.get('skin_type')
        
        # Generate insights
        insights = progress_analyzer.generate_progress_insights(progress_metrics, user_age, skin_type)
        
        # Analyze trends
        trend_analysis = progress_analyzer.analyze_concern_trends(history)
        
        return {
            "status": "success",
            "message": "Progress report generated successfully",
            "progress_metrics": progress_metrics,
            "insights": insights,
            "trend_analysis": trend_analysis,
            "user_profile": {
                "age": user_age,
                "skin_type": skin_type
            },
            "recommendation": "Continue with regular skin analysis to track long-term progress."
        }
        
    except Exception as e:
        logger.error(f"Error generating progress report for {email}: {e}")
        return {
            "status": "error",
            "message": "Unable to generate progress report at this time",
            "progress_metrics": None,
            "insights": None
        }

def get_progress_summary(email: str) -> Dict:
    """Get a quick progress summary for dashboard display"""
    try:
        history = progress_analyzer.get_user_history(email, days_back=30)  # Last 30 days
        
        if len(history) < 2:
            return {
                "status": "insufficient_data",
                "total_analyses": len(history),
                "improvement_trend": "N/A",
                "latest_concerns": history[0].get('concerns', []) if history else []
            }
        
        first_score = progress_analyzer.calculate_concern_score(history[0].get('concerns', []))
        latest_score = progress_analyzer.calculate_concern_score(history[-1].get('concerns', []))
        
        if first_score > 0:
            improvement = ((first_score - latest_score) / first_score) * 100
        else:
            improvement = 0
        
        trend = "improving" if improvement > 0 else "stable" if improvement == 0 else "needs_attention"
        
        return {
            "status": "success",
            "total_analyses": len(history),
            "improvement_percentage": round(improvement, 1),
            "improvement_trend": trend,
            "latest_concerns": history[-1].get('concerns', []),
            "tracking_days": (history[-1].get('timestamp') - history[0].get('timestamp')).days
        }
        
    except Exception as e:
        logger.error(f"Error generating progress summary for {email}: {e}")
        return {"status": "error", "message": "Unable to generate summary"}