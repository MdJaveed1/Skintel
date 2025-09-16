import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/services/api';

interface UseChatOptions {
  storageKey?: string;
  maxHistoryLength?: number;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { storageKey = 'skincare-chat-history', maxHistoryLength = 50 } = options;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem(`${storageKey}-messages`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    }
    
    return [{
      id: "initial",
      content: "Hi! I'm your AI-powered skincare consultant. I can help you with skincare routines, product recommendations, ingredient questions, and skin concerns. What would you like to know about skincare today?",
      sender: "bot" as const,
      timestamp: new Date(),
    }];
  });
  
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(() => {
    const savedHistory = localStorage.getItem(`${storageKey}-conversation`);
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (error) {
        console.error('Failed to parse saved conversation:', error);
      }
    }
    return [];
  });

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}-messages`, JSON.stringify(messages));
  }, [messages, storageKey]);

  // Persist conversation history to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}-conversation`, JSON.stringify(conversationHistory));
  }, [conversationHistory, storageKey]);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      // Limit message history length
      if (updated.length > maxHistoryLength) {
        return updated.slice(-maxHistoryLength);
      }
      return updated;
    });
    
    return newMessage;
  }, [maxHistoryLength]);

  const updateConversationHistory = useCallback((userMessage: string, botResponse: string) => {
    setConversationHistory((prev) => {
      const updated = [
        ...prev,
        { role: "user" as const, content: userMessage },
        { role: "assistant" as const, content: botResponse }
      ];
      
      // Limit conversation history length (keep last N exchanges)
      const maxExchanges = Math.floor(maxHistoryLength / 2);
      if (updated.length > maxExchanges * 2) {
        return updated.slice(-maxExchanges * 2);
      }
      
      return updated;
    });
  }, [maxHistoryLength]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: "initial-" + Date.now(),
      content: "Chat cleared! How can I help you with your skincare today?",
      sender: "bot",
      timestamp: new Date(),
    }]);
    setConversationHistory([]);
    
    // Clear from localStorage
    localStorage.removeItem(`${storageKey}-messages`);
    localStorage.removeItem(`${storageKey}-conversation`);
  }, [storageKey]);

  return {
    messages,
    conversationHistory,
    addMessage,
    updateConversationHistory,
    clearChat,
  };
};
