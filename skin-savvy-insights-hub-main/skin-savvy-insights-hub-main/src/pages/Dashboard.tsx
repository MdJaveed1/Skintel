import React, { useState } from "react";
import { LogOut, Upload, History, Bot, User, TrendingUp, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PageContainer from "@/components/layout/PageContainer";
import ImageUpload, { SkinAnalysisFormData } from "@/components/ImageUpload";
import AnalysisResults from "@/components/AnalysisResults";
import HistoryTab from "@/components/HistoryTab";
import ChatBot from "@/components/ChatBot";
import ProgressTracker from "@/components/ProgressTracker";
import ProgressSummary from "@/components/ProgressSummary";

import { useAuth } from "@/contexts/AuthContext";
import { analysisService, AnalysisResult } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisData, setAnalysisData] = useState<SkinAnalysisFormData>({});



  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setAnalysisResult(null);
  };

  const handleAnalysisDataChange = (data: SkinAnalysisFormData) => {
    setAnalysisData(data);
  };

  const handleTakeAnalysis = () => {
    setActiveTab("upload");
  };

  const handleViewProgressDetails = () => {
    setActiveTab("progress");
    // Scroll to progress section after a brief delay to ensure tab content is rendered
    setTimeout(() => {
      const progressSection = document.querySelector('[data-section="progress"]');
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analysisService.analyzeImage(selectedImage, analysisData);
      setAnalysisResult(result);
      setActiveTab("results");
      toast({
        title: "Analysis Complete!",
        description: "Your skin analysis has been completed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <PageContainer>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Insights Hub
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <p className="text-sm text-slate-600 font-medium">AI-Powered Skin Analysis Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-slate-200">
            <Avatar className="ring-2 ring-teal-500">
              <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="font-semibold text-slate-800">{user?.username}</p>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Hero: Banner (Left) + Progress Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Left - Banner */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lg border border-slate-200">
              <img
                src="/images/banner.jpeg"
                alt="SkinCare Banner"
                className="w-full object-cover h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>
          </div>

          {/* Right - Progress Summary + Description */}
          <div className="space-y-8">
            {/* Progress Summary Widget */}
            <ProgressSummary 
              onViewDetails={handleViewProgressDetails} 
              onTakeAnalysis={handleTakeAnalysis}
            />
            
            {/* Description */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Your Skin, Smarter with AI
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
                Experience next-generation skincare with{" "}
                <span className="font-semibold text-teal-600">
                  Insights Hub
                </span>
                . Our advanced AI delivers precise insights, personalized recommendations, and intelligent routines.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1 border border-slate-200 h-auto">
              <TabsTrigger
                value="upload"
                className="flex items-center justify-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 hover:bg-slate-50 font-medium text-sm whitespace-nowrap"
              >
                <Upload className="h-4 w-4" /> 
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={!analysisResult}
                className="flex items-center justify-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 hover:bg-slate-50 font-medium text-sm whitespace-nowrap disabled:opacity-50"
              >
                <Bot className="h-4 w-4" /> 
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex items-center justify-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 hover:bg-slate-50 font-medium text-sm whitespace-nowrap"
              >
                <TrendingUp className="h-4 w-4" /> 
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 hover:bg-slate-50 font-medium text-sm whitespace-nowrap"
              >
                <History className="h-4 w-4" /> 
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div>
            {/* Upload */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5" />
                    Skin Analysis Upload
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Upload your photo for AI-powered skin analysis
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    onAnalysisDataChange={handleAnalysisDataChange}
                    selectedImage={selectedImage}
                    analysisData={analysisData}
                    loading={analyzing}
                  />

                  {selectedImage && (
                    <div className="text-center">
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {analyzing ? "Analyzing..." : "Analyze My Skin"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results */}
            <TabsContent value="results">
              {analysisResult ? (
                <AnalysisResults result={analysisResult} />
              ) : (
                <Card className="bg-white/80 border-slate-200">
                  <CardContent className="text-center py-12">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold mb-2 text-slate-800">
                      No Analysis Yet
                    </h3>
                    <p className="text-slate-600">
                      Upload an image to see your skin analysis results here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Progress */}
            <TabsContent value="progress" data-section="progress">
              <ProgressTracker onTakeAnalysis={handleTakeAnalysis} />
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <HistoryTab
                onViewRecommendations={(entry) => {
                  setAnalysisResult({
                    predicted_concerns: entry.concerns,
                    recommendations: entry.recommendations || [],
                    annotated_image_url: entry.annotated_image_url,
                  });
                  setActiveTab("results");
                }}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Chatbot */}
        <ChatBot 
          analysisResult={analysisResult}
          onAnalysisAdviceComplete={() => {
            setActiveTab("results");
          }}
        />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              img: "/images/skin1.jpg",
              title: "AI Analysis",
              desc: "Get instant skin insights with our advanced AI technology"
            },
            {
              img: "/images/skin2.jpg",
              title: "Smart Recommendations",
              desc: "Receive personalized product suggestions based on your skin"
            },
            {
              img: "/images/skin3.webp",
              title: "Expert Insights",
              desc: "Professional guidance and progress tracking for better skin health"
            },
          ].map((item, i) => (
            <Card key={i} className="overflow-hidden bg-white/80 border-slate-200 shadow-lg">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">{item.title}</CardTitle>
                <p className="text-slate-600">{item.desc}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </PageContainer>
    </div>
  );
};

export default DashboardPage;