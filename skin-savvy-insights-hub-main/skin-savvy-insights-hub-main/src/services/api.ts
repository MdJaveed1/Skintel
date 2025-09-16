import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; 
const DEMO_MODE = false; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface SkinConcern {
  name: string;
  confidence?: number;
}

export interface ProductRecommendation {
  brand: string;
  name: string;
  price: string;
  image_url: string;
  category: string;
  concern?: string;
  url?: string;
  description?: string;
}

export interface SkinAnalysisRequest {
  age?: number;
  skinType?: string;
}

export interface AnalysisResult {
  predicted_concerns: string[];
  recommendations: ProductRecommendation[];
  annotated_image_url: string;
}

export interface HistoryEntry {
  id?: string;
  image_url?: string;
  concerns: string[];
  timestamp: string;
  annotated_image_url: string;
  recommendations: ProductRecommendation[];  // ✅ Added recommendations
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface SkinAdviceResponse {
  success: boolean;
  advice: string;
  concerns_analyzed: string[];
  timestamp: string;
}

// Progress Tracking Types
export interface AnalysisEntry {
  date: string;
  concerns: string[];
  severity_score: number;
}

export interface TimelineEntry {
  timestamp: string;
  concerns: string[];
  score: number;
}

export interface ConcernChanges {
  resolved: string[];
  new: string[];
  persistent: string[];
}

export interface TrackingPeriod {
  days: number;
  total_analyses: number;
}

export interface TrendAnalysis {
  timeline: TimelineEntry[];
  concern_frequency: Record<string, string[]>;
}

export interface UserProfile {
  age?: number;
  skin_type?: string;
}

export interface ProgressMetrics {
  overall_improvement_percentage: number;
  first_analysis: AnalysisEntry;
  latest_analysis: AnalysisEntry;
  concern_changes: ConcernChanges;
  tracking_period: TrackingPeriod;
  trend: string;
  average_severity: number;
}

export interface ProgressReportResponse {
  status: 'success' | 'insufficient_data' | 'no_data';
  message: string;
  progress_metrics?: ProgressMetrics;
  insights?: string;
  trend_analysis?: TrendAnalysis;
  user_profile?: UserProfile;
  recommendation?: string;
  current_analysis?: AnalysisEntry;
}

export interface ProgressSummaryResponse {
  status: 'success' | 'insufficient_data' | 'no_data';
  total_analyses?: number;
  improvement_percentage?: number;
  improvement_trend?: 'improving' | 'stable' | 'declining';
  latest_concerns?: string[];
  tracking_days?: number;
  message?: string;
  insights?: string;
  current_analysis?: AnalysisEntry;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    if (DEMO_MODE) {
      const demoUser = {
        id: 'demo-user-123',
        username: credentials.username,
        email: `${credentials.username}@demo.com`
      };
      const demoToken = 'demo-jwt-token-' + Date.now();
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      
      return { token: demoToken, user: demoUser };
    }
    
    const response = await api.post('/login', credentials);
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token: access_token, user };
  },

  async register(userData: RegisterData) {
    if (DEMO_MODE) {
      return { message: 'User registered successfully' };
    }
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};

export const analysisService = {
  async analyzeImage(file: File, analysisData?: SkinAnalysisRequest): Promise<AnalysisResult> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        predicted_concerns: ["Acne", "Oily-Skin", "Dark-Spots"],
        recommendations: [
          {
            brand: "CeraVe",
            name: "Foaming Facial Cleanser",
            price: "₹ 899",
            image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            category: "cleanser",
            concern: "Acne",
            url: "https://www.cerave.com/skincare/cleansers/foaming-facial-cleanser",
            description: "Gentle foaming cleanser with niacinamide"
          },
          {
            brand: "The Ordinary",
            name: "Niacinamide 10% + Zinc 1%",
            price: "₹ 599",
            image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop",
            category: "serum",
            concern: "Oily-Skin",
            url: "https://theordinary.com/us/the-ordinary-niacinamide-10-zinc-1-30ml.html",
            description: "High-strength vitamin and mineral formula"
          },
          {
            brand: "Neutrogena",
            name: "Rapid Tone Repair Serum",
            price: "₹ 1299",
            image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
            category: "serum",
            concern: "Dark-Spots",
            url: "https://www.neutrogena.com/products/skincare/rapid-tone-repair-20-vitamin-c-serum/6811047.html",
            description: "Vitamin C serum to brighten skin"
          }
        ],
        annotated_image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=400&fit=crop&crop=face"
      };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add age and skin type if provided
    if (analysisData?.age) {
      formData.append('age', analysisData.age.toString());
    }
    if (analysisData?.skinType) {
      formData.append('skin_type', analysisData.skinType);
    }
    
    const response = await api.post('/analyze-and-recommend', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getHistory(): Promise<HistoryEntry[]> {
    if (DEMO_MODE) {
      return [
        {
          id: '1',
          concerns: ['Acne', 'Oily-Skin'],
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          annotated_image_url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=400&fit=crop&crop=face',
          recommendations: [
            {
              brand: "CeraVe",
              name: "Cleanser",
              price: "₹ 799",
              image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
              category: "cleanser",
              concern: "Acne",
              url: "https://www.cerave.com",
              description: "Gentle cleanser"
            }
          ]
        }
      ];
    }
    
    const response = await api.get('/history');
    return response.data;
  },

  // api.ts
getImageUrl(path: string): string {
  if (!path) return '/placeholder.svg';
  
  // Ensure we don’t double-prefix
  const cleanPath = path.replace(/^\/?result-image\//, '');
  return `${API_BASE_URL}/result-image/${cleanPath}`;
}

};

// Chatbot Services
export const chatbotService = {
  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    if (DEMO_MODE) {
      // Simulate AI response in demo mode
      const responses = [
        "Hello! I'm SkinTel AI. For oily skin, I recommend using a gentle foaming cleanser twice daily and incorporating niacinamide into your routine.",
        "From SkinTel's analysis, Vitamin C serums are great for brightening, but start slowly to avoid irritation. Use sunscreen daily when using vitamin C.",
        "Based on SkinTel's recommendations, for acne-prone skin, look for products with salicylic acid or benzoyl peroxide. Always patch test first.",
        "SkinTel suggests a basic routine includes cleanser, moisturizer, and sunscreen. Add treatments gradually based on your specific concerns."
      ];
      
      return {
        success: true,
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
    }
    
    const response = await api.post('/chatbot', {
      message,
      conversation_history: conversationHistory,
      context: {
        platform: "SkinTel",
        description: "AI-powered skincare analysis platform that provides personalized skincare recommendations",
        features: ["YOLO AI image analysis", "Google Gemini chatbot", "Product recommendations", "Skin concern detection"]
      }
    });
    return response.data;
  },

  async getSkinAdvice(concerns: string[], additionalContext?: string): Promise<SkinAdviceResponse> {
    if (DEMO_MODE) {
      const concernsText = concerns.join(', ');
      return {
        success: true,
        advice: `Hello! I'm SkinTel AI. Based on your SkinTel analysis results showing ${concernsText}, I recommend a targeted approach. Focus on gentle cleansing, appropriate treatments for each concern, and consistent moisturizing. ${additionalContext ? 'Given your additional context, consider consulting with a dermatologist for personalized treatment.' : 'Start with one new product at a time to monitor your skin\'s response. SkinTel\'s AI analysis helps guide these recommendations.'}`,
        concerns_analyzed: concerns,
        timestamp: new Date().toISOString()
      };
    }
    
    const response = await api.post('/skin-advice', {
      concerns,
      additional_context: additionalContext,
      platform_context: {
        platform: "SkinTel",
        description: "AI-powered skincare analysis platform",
        analysis_method: "YOLO AI image analysis with Google Gemini recommendations"
      }
    });
    return response.data;
  }
};

// Progress Tracking Services
export const progressService = {
  async getProgressReport(daysBack: number = 90): Promise<ProgressReportResponse> {
    if (DEMO_MODE) {
      // Simulate different scenarios for demo
      const scenarios = [
        // Success scenario with good progress
        {
          status: 'success' as const,
          message: 'Progress report generated successfully',
          progress_metrics: {
            overall_improvement_percentage: 73.3,
            first_analysis: {
              date: '2025-07-10T20:42:15.582000',
              concerns: ['acne', 'blackheads', 'dark_spots'],
              severity_score: 3.75
            },
            latest_analysis: {
              date: '2025-09-08T20:42:15.582000',
              concerns: ['general_care'],
              severity_score: 1.0
            },
            concern_changes: {
              resolved: ['acne', 'blackheads', 'dark_spots'],
              new: ['general_care'],
              persistent: []
            },
            tracking_period: {
              days: 60,
              total_analyses: 5
            },
            trend: 'excellent_improvement',
            average_severity: 3.42
          },
          insights: "Fantastic progress! Your skin is showing remarkable improvement. 🎉 Great news! You've successfully addressed: acne, blackheads, dark_spots. Your consistent skincare routine is paying off!",
          trend_analysis: {
            timeline: [
              {
                timestamp: '2025-07-10T20:42:15.582000',
                concerns: ['acne', 'blackheads', 'dark_spots'],
                score: 3.75
              },
              {
                timestamp: '2025-07-25T20:42:15.582000',
                concerns: ['acne', 'blackheads'],
                score: 2.5
              },
              {
                timestamp: '2025-08-10T20:42:15.582000',
                concerns: ['blackheads'],
                score: 1.8
              },
              {
                timestamp: '2025-08-25T20:42:15.582000',
                concerns: ['general_care'],
                score: 1.2
              },
              {
                timestamp: '2025-09-08T20:42:15.582000',
                concerns: ['general_care'],
                score: 1.0
              }
            ],
            concern_frequency: {
              acne: ['2025-07-10T20:42:15.582000', '2025-07-25T20:42:15.582000'],
              blackheads: ['2025-07-10T20:42:15.582000', '2025-07-25T20:42:15.582000', '2025-08-10T20:42:15.582000'],
              dark_spots: ['2025-07-10T20:42:15.582000'],
              general_care: ['2025-08-25T20:42:15.582000', '2025-09-08T20:42:15.582000']
            }
          },
          user_profile: {
            age: 25,
            skin_type: 'oily'
          },
          recommendation: 'Continue with regular skin analysis to maintain your excellent progress!'
        },
        // Insufficient data scenario
        {
          status: 'insufficient_data' as const,
          message: 'Need at least 2 skin analyses to show progress',
          insights: 'Continue using the app regularly to track your skin progress over time.',
          current_analysis: {
            date: '2025-09-08T20:42:15.582000',
            concerns: ['acne', 'dryness'],
            severity_score: 3.5
          }
        }
      ];
      
      // Return success scenario most of the time
      return scenarios[Math.random() > 0.2 ? 0 : 1];
    }
    
    const response = await api.get(`/progress-report?days_back=${daysBack}`);
    return response.data;
  },

  async getProgressSummary(): Promise<ProgressSummaryResponse> {
    if (DEMO_MODE) {
      const scenarios = [
        {
          status: 'success' as const,
          total_analyses: 5,
          improvement_percentage: 73.3,
          improvement_trend: 'improving' as const,
          latest_concerns: ['general_care'],
          tracking_days: 60
        },
        {
          status: 'insufficient_data' as const,
          message: 'Need at least 2 skin analyses to show progress',
          insights: 'Continue using the app regularly to track your progress.',
          current_analysis: {
            date: '2025-09-08T20:42:15.582000',
            concerns: ['acne', 'dryness'],
            severity_score: 3.5
          }
        }
      ];
      
      return scenarios[Math.random() > 0.3 ? 0 : 1];
    }
    
    const response = await api.get('/progress-summary');
    return response.data;
  }
};

export default api;
