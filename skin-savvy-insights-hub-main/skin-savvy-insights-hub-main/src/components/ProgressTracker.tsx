import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award, 
  Activity,
  CheckCircle,
  XCircle,
  Minus,
  RefreshCw,
  BarChart3,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { progressService, ProgressReportResponse } from '@/services/api';

interface ProgressTrackerProps {
  onTakeAnalysis?: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ onTakeAnalysis }) => {
  const [progressData, setProgressData] = useState<ProgressReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(90);
  const { toast } = useToast();

  const fetchProgressData = async (daysBack: number = 90) => {
    setLoading(true);
    try {
      const data = await progressService.getProgressReport(daysBack);
      setProgressData(data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (value: string) => {
    const days = parseInt(value);
    setSelectedPeriod(days);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'excellent_improvement':
      case 'good_improvement':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'stable':
        return <Minus className="h-6 w-6 text-yellow-500" />;
      case 'declining':
        return <TrendingDown className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'excellent_improvement':
      case 'good_improvement':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'stable':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading your progress...</span>
        </div>
      </div>
    );
  }

  // Handle no data scenario
  if (progressData?.status === 'no_data') {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {progressData.message}
          </p>
          <Button 
            className="mt-4" 
            onClick={onTakeAnalysis || (() => window.location.href = '#upload')}
          >
            Take Your First Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle insufficient data scenario
  if (progressData?.status === 'insufficient_data') {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Building Your Progress</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {progressData.message}
            </p>
            {progressData.current_analysis && (
              <div className="bg-muted/50 rounded-lg p-4 mt-4 max-w-md mx-auto">
                <h4 className="font-medium mb-2">Current Analysis</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Date: {formatDate(progressData.current_analysis.date)}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {progressData.current_analysis.concerns.map((concern) => (
                    <Badge key={concern} variant="outline">
                      {concern.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button 
              className="mt-4" 
              onClick={onTakeAnalysis || (() => window.location.href = '#upload')}
            >
              Take Another Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success scenario with full progress data
  const metrics = progressData?.progress_metrics;
  if (!metrics) return null;

  return (
    <div className="space-y-8">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Progress Tracking</h2>
          <p className="text-muted-foreground">Monitor your skin improvement journey</p>
        </div>
        <Select value={selectedPeriod.toString()} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-48 text-gray-900 dark:text-white">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Improvement</p>
                  <p className="text-3xl font-bold text-green-600">
                    {metrics.overall_improvement_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                  <p className="text-3xl font-bold">{metrics.tracking_period.total_analyses}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tracking Period</p>
                  <p className="text-3xl font-bold">{metrics.tracking_period.days}</p>
                  <p className="text-sm text-muted-foreground">days</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trend Status</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getTrendColor(metrics.trend)}`}>
                    {getTrendIcon(metrics.trend)}
                    <span className="ml-2 capitalize">{metrics.trend.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Concern Changes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Concern Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resolved Concerns */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium text-green-700">Resolved</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {metrics.concern_changes.resolved.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {metrics.concern_changes.resolved.map((concern) => (
                    <Badge key={concern} className="bg-green-50 text-green-700 border-green-200">
                      {concern.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* New Concerns */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-blue-700">New</h4>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {metrics.concern_changes.new.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {metrics.concern_changes.new.map((concern) => (
                    <Badge key={concern} className="bg-blue-50 text-blue-700 border-blue-200">
                      {concern.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Persistent Concerns */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-medium text-yellow-700">Persistent</h4>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    {metrics.concern_changes.persistent.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {metrics.concern_changes.persistent.length > 0 ? (
                    metrics.concern_changes.persistent.map((concern) => (
                      <Badge key={concern} className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {concern.replace('_', ' ')}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No persistent concerns</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Timeline */}
      {progressData?.trend_analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Progress Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.trend_analysis.timeline.map((entry, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{formatDate(entry.timestamp)}</span>
                        <Badge 
                          variant="outline" 
                          className={`${entry.score <= 1.5 ? 'bg-green-50 text-green-700 border-green-200' : 
                            entry.score <= 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            'bg-red-50 text-red-700 border-red-200'}`}
                        >
                          Severity: {entry.score.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entry.concerns.map((concern) => (
                          <Badge key={concern} variant="secondary">
                            {concern.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Insights and Recommendations */}
      {progressData?.insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <p className="text-sm leading-relaxed">{progressData.insights}</p>
                </div>
                {progressData.recommendation && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Recommendation:</h4>
                    <p className="text-sm text-muted-foreground">{progressData.recommendation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressTracker;