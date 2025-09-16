import React, { useState, useEffect } from "react";
import { Clock, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analysisService, HistoryEntry } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface HistoryTabProps {
  onViewRecommendations?: (entry: HistoryEntry) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ onViewRecommendations }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await analysisService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast({
        title: "Error",
        description: "Failed to load analysis history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading your analysis history...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card h-[500px] flex flex-col">
      {/* Fixed Header */}
      <CardHeader className="flex flex-row items-center justify-between shrink-0 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Analysis History
          </CardTitle>
          <p className="text-muted-foreground">
            Your previous skin analysis results
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          className="shrink-0 border-primary text-primary hover:bg-primary/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>

      {/* Scrollable Content */}
      <CardContent className="flex-1 overflow-y-auto pr-2">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              No Analysis History
            </h3>
            <p className="text-muted-foreground">
              Upload your first image to start tracking your skin journey
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => {
              const imageUrl = analysisService.getImageUrl(
                entry.annotated_image_url || entry.image_url
              );

              return (
                <div
                  key={index}
                  className="group border rounded-lg p-4 hover:shadow-soft transition-all duration-300 bg-card/70 backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="shrink-0">
                      <img
                        src={imageUrl}
                        alt="Analysis result"
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>

                      {/* Concerns */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">
                          Detected Concerns:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.concerns.length > 0 ? (
                            entry.concerns.map((concern, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-primary/80 to-purple-500/80 text-white shadow-sm"
                              >
                                {concern}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              No concerns detected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary hover:bg-primary/10"
                        onClick={() => window.open(imageUrl, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onViewRecommendations && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-primary to-purple-500 text-white hover:opacity-90"
                          onClick={() => onViewRecommendations(entry)}
                        >
                          View Recommendations
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryTab;
