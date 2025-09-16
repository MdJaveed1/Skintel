// components/ChatBot.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, X, Bot, User, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { chatbotService, AnalysisResult } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/use-chat";

interface ChatBotProps {
  analysisResult?: AnalysisResult | null;
  onAnalysisAdviceComplete?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  analysisResult, 
  onAnalysisAdviceComplete 
}) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  
  const {
    messages,
    conversationHistory,
    addMessage,
    updateConversationHistory,
    clearChat,
  } = useChat();

  // Add initial welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = "Hello! I'm SkinTel AI, your personal skincare assistant. I'm here to help you with skincare advice, product recommendations, and answer any questions about your skin analysis results. How can I help you with your skincare today?";
      addMessage({ content: welcomeMessage, sender: "bot" });
    }
  }, [isOpen, messages.length, addMessage]);

  // Auto-scroll when chatbot opens (if there are existing messages)
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Delay to ensure the chat UI is fully rendered
      const timer = setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTo({
              top: scrollElement.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 200); // Slightly longer delay for opening
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  // Immediate scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      // Force immediate scroll without animation when opening
      const immediateScroll = () => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      };
      
      // Try immediate scroll first
      immediateScroll();
      
      // Then try again after a short delay to ensure rendering is complete
      const timer = setTimeout(immediateScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when messages change or when chat opens
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            scrollElement.scrollTo({
              top: scrollElement.scrollHeight,
              behavior: 'smooth'
            });
          });
        }
      }
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping, isOpen]); // Added isOpen dependency

  // Smooth auto-scroll for new messages (removed redundant function)

  // Auto-trigger analysis-based advice when analysisResult is provided
  useEffect(() => {
    if (analysisResult && analysisResult.predicted_concerns.length > 0 && messages.length <= 1) {
      // Add a welcoming message about the analysis
      const welcomeMessage = `Hello! I'm SkinTel AI, your personal skincare assistant. I see you've completed your skin analysis and I detected these concerns: ${analysisResult.predicted_concerns.join(', ')}. I'll provide personalized advice based on your results from our SkinTel platform.`;
      addMessage({ content: welcomeMessage, sender: "bot" });
      
      // Then get the detailed advice
      setTimeout(() => {
        handleAnalysisAdvice(analysisResult.predicted_concerns);
      }, 1000);
      
      setIsOpen(true); // Auto-open chat when analysis completes
    }
  }, [analysisResult, messages.length]);

  // Listen for global events to open chat with analysis
  useEffect(() => {
    const handleOpenChatWithAnalysis = (event: CustomEvent) => {
      const { analysisResult: newAnalysisResult } = event.detail;
      if (newAnalysisResult && newAnalysisResult.predicted_concerns.length > 0) {
        setIsOpen(true);
        // Add welcome message
        const welcomeMessage = `Hi! I'm SkinTel AI from your SkinTel platform. I see you want advice about your skin analysis results. You have these concerns: ${newAnalysisResult.predicted_concerns.join(', ')}. Let me provide personalized recommendations from our SkinTel system.`;
        addMessage({ content: welcomeMessage, sender: "bot" });
        
        // Get detailed advice
        setTimeout(() => {
          handleAnalysisAdvice(newAnalysisResult.predicted_concerns);
        }, 500);
      }
    };

    window.addEventListener('openChatWithAnalysis', handleOpenChatWithAnalysis as EventListener);
    
    return () => {
      window.removeEventListener('openChatWithAnalysis', handleOpenChatWithAnalysis as EventListener);
    };
  }, [addMessage]);

  const handleAnalysisAdvice = async (concerns: string[]) => {
    if (!isAuthenticated) {
      setError("Please log in to get personalized skin advice.");
      return;
    }

    setError(null);
    setIsTyping(true);

    // Add user message indicating analysis completion
    const userMessage = `I've completed my skin analysis and these concerns were detected: ${concerns.join(', ')}. What should I do?`;
    addMessage({ content: userMessage, sender: "user" });

    try {
      const response = await chatbotService.getSkinAdvice(concerns);
      
      if (response.success) {
        addMessage({ content: response.advice, sender: "bot" });
        updateConversationHistory(userMessage, response.advice);
        onAnalysisAdviceComplete?.();
      } else {
        throw new Error("Failed to get skin advice");
      }
    } catch (error) {
      console.error("Analysis advice error:", error);
      const errorMessage = "I'm having trouble analyzing your skin concerns right now. Please try asking me a general skincare question instead.";
      addMessage({ content: errorMessage, sender: "bot" });
      setError("Failed to get analysis-based advice. You can still ask general skincare questions.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      setError("Please log in to chat with the AI assistant.");
      return;
    }

    const text = inputValue.trim();
    if (!text) return;

    setError(null);
    setInputValue("");
    
    // Add user message
    addMessage({ content: text, sender: "user" });
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(text, conversationHistory);
      
      if (response.success) {
        addMessage({ content: response.message, sender: "bot" });
        updateConversationHistory(text, response.message);
      } else {
        throw new Error("Failed to get bot response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = "I'm having trouble connecting right now. Please make sure you're logged in and try again.";
      addMessage({ content: errorMessage, sender: "bot" });
      setError("Failed to send message. Please check your connection and try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (question: string) => {
    setInputValue(question);
  };

  const handleClearChat = () => {
    clearChat();
    setError(null);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // Quick action buttons based on context
  const getQuickActions = () => {
    if (analysisResult && analysisResult.predicted_concerns.length > 0) {
      // Analysis-specific quick actions
      const concerns = analysisResult.predicted_concerns;
      const actions = [];
      
      if (concerns.some(c => c.toLowerCase().includes('acne'))) {
        actions.push("How do I treat acne naturally?");
      }
      if (concerns.some(c => c.toLowerCase().includes('dry'))) {
        actions.push("What's the best moisturizer for dry skin?");
      }
      if (concerns.some(c => c.toLowerCase().includes('oily'))) {
        actions.push("How to control oily skin?");
      }
      if (concerns.some(c => c.toLowerCase().includes('dark'))) {
        actions.push("How to reduce dark spots?");
      }
      
      // Add some general actions
      actions.push("What products should I avoid?");
      actions.push("Create a skincare routine for me");
      
      return actions.slice(0, 4); // Limit to 4 actions
    }
    
    // General quick actions
    return [
      "What's a good basic skincare routine?",
      "How often should I use retinol?",
      "What ingredients should I avoid?",
      "How do I treat sensitive skin?"
    ];
  };

  const quickActions = getQuickActions();

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-18 w-18 rounded-full shadow-2xl bg-gradient-to-br from-fuchsia-500 via-sky-500 to-fuchsia-500 hover:scale-110 transition-all duration-300 z-50 border-2 border-white/20 backdrop-blur-sm hover:shadow-fuchsia-500/25 hover:shadow-2xl"
        size="icon"
      >
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[480px] h-[700px] md:w-[480px] sm:w-96 xs:w-[calc(100vw-2rem)] xs:h-[calc(100vh-4rem)] xs:bottom-2 xs:right-2 shadow-2xl z-50 flex flex-col border-2 border-white/20 max-h-[calc(100vh-2rem)] bg-gradient-to-br from-slate-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-fuchsia-500 via-sky-500 to-fuchsia-500 text-white rounded-t-lg p-4 flex-shrink-0 shadow-lg border-b border-white/20">
        <CardTitle className="text-lg flex items-center gap-3 font-bold">
          <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center shadow-lg border border-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="hidden sm:inline text-lg">SkinTel AI</span>
            <span className="sm:hidden text-lg">AI Assistant</span>
            <span className="text-xs opacity-80 font-normal">Personalized Skincare Advice</span>
          </div>
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="text-white hover:bg-white/20 h-8 w-8 transition-all duration-200 hover:scale-105 rounded-full border border-white/20"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 transition-all duration-200 hover:scale-105 rounded-full border border-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-slate-800/50 via-gray-900/50 to-black/50 overflow-hidden backdrop-blur-sm">
        {/* Error display */}
        {error && (
          <Alert className="m-4 mb-0 flex-shrink-0 bg-red-500/20 border-red-500/30 text-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 p-6 min-h-0" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-5 shadow-xl backdrop-blur-sm transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-fuchsia-500 to-sky-500 text-white ml-4 border border-white/20"
                      : "bg-gradient-to-br from-white/95 to-gray-100/95 text-gray-900 mr-4 border border-gray-200 shadow-lg"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {message.sender === "bot" ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg border border-white/20">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-lg border border-white/30">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words font-medium ${
                        message.sender === "user" ? "text-white" : "text-gray-900"
                      }`}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-3 font-medium ${
                        message.sender === "user" ? "opacity-70 text-white" : "opacity-70 text-gray-600"
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-gradient-to-br from-white/95 to-gray-100/95 text-gray-900 rounded-2xl p-5 max-w-[85%] mr-4 shadow-xl border border-gray-200 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-fuchsia-400 to-sky-400 rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-gradient-to-r from-fuchsia-400 to-sky-400 rounded-full animate-bounce delay-100" />
                      <div className="w-3 h-3 bg-gradient-to-r from-fuchsia-400 to-sky-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick actions */}
        {!isAuthenticated ? (
          <div className="p-5 border-t border-white/10 bg-gradient-to-r from-red-500/20 to-red-600/20 flex-shrink-0 backdrop-blur-sm">
            <p className="text-sm text-red-100 text-center font-medium">
              🔒 Please log in to chat with the AI assistant
            </p>
          </div>
        ) : (
          <div className="p-5 border-t border-white/10 bg-gradient-to-r from-slate-800/50 via-gray-900/50 to-slate-800/50 flex-shrink-0 backdrop-blur-sm">
            <div className="flex gap-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your skincare question..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                className="text-sm h-12 rounded-full border-2 border-gray-300 focus:border-fuchsia-400 px-5 bg-white text-gray-900 placeholder:text-gray-500 shadow-lg transition-all duration-200 focus:shadow-xl"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="h-12 w-12 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 bg-gradient-to-r from-fuchsia-500 to-sky-500 hover:from-fuchsia-400 hover:to-sky-400 flex-shrink-0 border border-white/20"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatBot;
