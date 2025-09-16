import React, { useState } from 'react';
import { CheckCircle, Sparkles, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import ChatBot from './ChatBot';
import { AnalysisResult, analysisService } from '@/services/api';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatBotKey, setChatBotKey] = useState(0); // Force re-render of chatbot
  
  const annotatedImageUrl = result.annotated_image_url.startsWith('http') 
    ? result.annotated_image_url 
    : analysisService.getImageUrl(result.annotated_image_url.replace(/^\//, ''));

  const handleAskAI = () => {
    // Force the main dashboard chatbot to open with analysis results
    const event = new CustomEvent('openChatWithAnalysis', {
      detail: { analysisResult: result }
    });
    window.dispatchEvent(event);
  };

  const handleChatComplete = () => {
    // Optional callback when AI provides analysis-based advice
    console.log('Analysis advice provided');
  };

  return (
    <div className="space-y-10">
      {/* Sticky Analysis Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg p-4 flex items-center justify-between backdrop-blur-md">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
          <Sparkles className="h-5 w-5 text-fuchsia-500" />
          Analysis Results
        </h2>
      </div>

      {/* Analysis Summary Section */}
      <Card className="shadow-card bg-gradient-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Left: Annotated Image */}
            <div className="space-y-4">
              <h3 className="font-semibold">Your Skin Analysis</h3>
              <div className="relative overflow-hidden rounded-lg shadow-lg border">
                <img
                  src={annotatedImageUrl}
                  alt="Skin analysis with annotations"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    console.error('Failed to load annotated image:', annotatedImageUrl);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>

            {/* Right: Detected Concerns */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Detected Skin Concerns</h3>
                {result.predicted_concerns.length > 0 && (
                  <Button
                    onClick={handleAskAI}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask AI for Advice
                  </Button>
                )}
              </div>
              {result.predicted_concerns.length > 0 ? (
                <div className="space-y-4">
                  {result.predicted_concerns.map((concern, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-4 bg-card rounded-lg border shadow-sm"
                    >
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {concern}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          We've identified this concern in your skin analysis
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-4 bg-secondary/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> Click "Ask AI for Advice" to get personalized skincare recommendations based on your specific concerns!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p>Great news! No major skin concerns detected.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Recommendations Section */}
      {result.recommendations.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recommended Products</CardTitle>
            <p className="text-muted-foreground text-sm">
              Personalized skincare recommendations based on your analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.recommendations.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
            
            {/* Summary footer */}
            <div className="mt-8 p-4 bg-gradient-to-r from-fuchsia-50 to-sky-50 dark:from-fuchsia-950/30 dark:to-sky-950/30 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Shopping Tip:</strong> These products are specifically recommended based on your skin analysis. 
                Click "Buy Now" to purchase directly from trusted retailers.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* ChatBot Integration - Only show if not on dashboard */}
      {showChatBot && window.location.pathname !== '/dashboard' && (
        <ChatBot 
          key={chatBotKey}
          analysisResult={result}
          onAnalysisAdviceComplete={handleChatComplete}
        />
      )}
    </div>
  );
};

export default AnalysisResults;
