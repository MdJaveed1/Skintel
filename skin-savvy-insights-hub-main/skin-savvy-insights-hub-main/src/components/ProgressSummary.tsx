import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, RefreshCw, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { progressService, ProgressSummaryResponse } from '@/services/api';

interface ProgressSummaryProps {
  onViewDetails?: () => void;
  onTakeAnalysis?: () => void;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ onViewDetails, onTakeAnalysis }) => {
  const [summaryData, setSummaryData] = useState<ProgressSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      try {
        const data = await progressService.getProgressSummary();
        setSummaryData(data);
      } catch (error) {
        console.error('Failed to fetch progress summary:', error);
        toast({
          title: "Error",
          description: "Failed to load progress summary.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'stable': return <Minus className="h-5 w-5 text-yellow-500" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <BarChart3 className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50 border-green-200';
      case 'stable': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'declining': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle no data or insufficient data
  if (summaryData?.status !== 'success') {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              {summaryData?.message || "Start tracking your progress!"}
            </p>
            <Button onClick={onTakeAnalysis || (() => window.location.href = '#upload')} size="sm">
              Take Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success scenario
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Summary
          </CardTitle>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-2xl font-bold text-green-600 mb-1">
              {summaryData.improvement_percentage?.toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 font-medium">Improvement</div>
          </motion.div>

          <motion.div 
            className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {summaryData.total_analyses}
            </div>
            <div className="text-xs text-blue-700 font-medium">Total Scans</div>
          </motion.div>
        </div>

        {/* Trend Status */}
        {summaryData.improvement_trend && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Trend</span>
            <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${getTrendColor(summaryData.improvement_trend)}`}>
              {getTrendIcon(summaryData.improvement_trend)}
              <span className="ml-1 capitalize">{summaryData.improvement_trend}</span>
            </div>
          </div>
        )}

        {/* Latest Concerns */}
        {summaryData.latest_concerns && summaryData.latest_concerns.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Latest Concerns</span>
            <div className="flex flex-wrap gap-2">
              {summaryData.latest_concerns.map((concern) => (
                <Badge key={concern} variant="secondary" className="text-xs">
                  {concern.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressSummary;