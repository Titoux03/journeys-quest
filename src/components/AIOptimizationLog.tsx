import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface OptimizationEntry {
  id: string;
  timestamp: Date;
  category: 'emotional' | 'conversion' | 'engagement' | 'friction';
  severity: 'low' | 'medium' | 'high';
  observation: string;
  hypothesis: string;
  intervention?: string;
  status: 'observed' | 'proposed' | 'implemented' | 'validated';
  metrics?: {
    before?: Record<string, number>;
    after?: Record<string, number>;
  };
  psychologyPrinciple?: string;
}

export const AIOptimizationLog: React.FC = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<OptimizationEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load optimization log from localStorage
    const stored = localStorage.getItem('ai-optimization-log');
    if (stored) {
      setEntries(JSON.parse(stored));
    }

    // Initialize with baseline observations
    initializeBaselineObservations();
  }, []);

  const initializeBaselineObservations = () => {
    const baselineEntries: OptimizationEntry[] = [
      {
        id: 'obs-001',
        timestamp: new Date(),
        category: 'emotional',
        severity: 'medium',
        observation: t('aiOptimizationLog.baseline.obs1.observation'),
        hypothesis: t('aiOptimizationLog.baseline.obs1.hypothesis'),
        status: 'observed',
        psychologyPrinciple: t('aiOptimizationLog.baseline.obs1.principle'),
      },
      {
        id: 'obs-002',
        timestamp: new Date(),
        category: 'engagement',
        severity: 'low',
        observation: t('aiOptimizationLog.baseline.obs2.observation'),
        hypothesis: t('aiOptimizationLog.baseline.obs2.hypothesis'),
        status: 'observed',
        psychologyPrinciple: t('aiOptimizationLog.baseline.obs2.principle'),
      },
      {
        id: 'obs-003',
        timestamp: new Date(),
        category: 'conversion',
        severity: 'high',
        observation: t('aiOptimizationLog.baseline.obs3.observation'),
        hypothesis: t('aiOptimizationLog.baseline.obs3.hypothesis'),
        status: 'proposed',
        intervention: t('aiOptimizationLog.baseline.obs3.intervention'),
        psychologyPrinciple: t('aiOptimizationLog.baseline.obs3.principle'),
      },
      {
        id: 'obs-004',
        timestamp: new Date(),
        category: 'friction',
        severity: 'medium',
        observation: t('aiOptimizationLog.baseline.obs4.observation'),
        hypothesis: t('aiOptimizationLog.baseline.obs4.hypothesis'),
        status: 'proposed',
        intervention: t('aiOptimizationLog.baseline.obs4.intervention'),
        psychologyPrinciple: t('aiOptimizationLog.baseline.obs4.principle'),
      },
      {
        id: 'obs-005',
        timestamp: new Date(),
        category: 'emotional',
        severity: 'high',
        observation: t('aiOptimizationLog.baseline.obs5.observation'),
        hypothesis: t('aiOptimizationLog.baseline.obs5.hypothesis'),
        status: 'proposed',
        intervention: t('aiOptimizationLog.baseline.obs5.intervention'),
        psychologyPrinciple: t('aiOptimizationLog.baseline.obs5.principle'),
      },
    ];

    const stored = localStorage.getItem('ai-optimization-log');
    if (!stored) {
      setEntries(baselineEntries);
      localStorage.setItem('ai-optimization-log', JSON.stringify(baselineEntries));
    }
  };

  const getCategoryIcon = (category: OptimizationEntry['category']) => {
    switch (category) {
      case 'emotional':
        return '❤️';
      case 'conversion':
        return '🎯';
      case 'engagement':
        return '⚡';
      case 'friction':
        return '🚧';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status: OptimizationEntry['status']) => {
    switch (status) {
      case 'observed':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'proposed':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'implemented':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'validated':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: OptimizationEntry['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Debug mode: Show with Ctrl+Alt+O
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'o') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
        title={t('aiOptimizationLog.tooltip')}
      >
        <Brain className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-500" />
              {t('aiOptimizationLog.title')}
              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                {t('aiOptimizationLog.behavioralAnalysis')}
              </Badge>
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('aiOptimizationLog.description')}
          </p>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(entry.category)}</span>
                      <div>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                        <span className={`ml-2 text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                          {entry.severity.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Observation */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-blue-700">{t('aiOptimizationLog.observation')}</span>
                    </div>
                    <p className="text-sm text-foreground ml-6">{entry.observation}</p>
                  </div>

                  {/* Hypothesis */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-700">{t('aiOptimizationLog.hypothesis')}</span>
                    </div>
                    <p className="text-sm text-foreground ml-6">{entry.hypothesis}</p>
                  </div>

                  {/* Intervention */}
                  {entry.intervention && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-700">{t('aiOptimizationLog.intervention')}</span>
                      </div>
                      <p className="text-sm text-foreground ml-6 italic">{entry.intervention}</p>
                    </div>
                  )}

                  {/* Psychology Principle */}
                  {entry.psychologyPrinciple && (
                    <div className="mt-3 p-2 bg-accent/30 rounded border border-accent/50">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-accent-foreground" />
                        <span className="text-xs font-medium text-accent-foreground">
                          {t('aiOptimizationLog.psychologyPrinciple')}
                        </span>
                        <span className="text-xs text-muted-foreground">{entry.psychologyPrinciple}</span>
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {entry.metrics && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {entry.metrics.before && (
                        <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                          <span className="text-xs font-medium text-red-700">{t('aiOptimizationLog.before')}</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Object.entries(entry.metrics.before).map(([key, value]) => (
                              <div key={key}>
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {entry.metrics.after && (
                        <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                          <span className="text-xs font-medium text-green-700">{t('aiOptimizationLog.after')}</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Object.entries(entry.metrics.after).map(([key, value]) => (
                              <div key={key}>
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 p-3 bg-secondary/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {entries.filter((e) => e.status === 'observed').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('aiOptimizationLog.status.observed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {entries.filter((e) => e.status === 'proposed').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('aiOptimizationLog.status.proposed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {entries.filter((e) => e.status === 'implemented').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('aiOptimizationLog.status.implemented')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {entries.filter((e) => e.status === 'validated').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('aiOptimizationLog.status.validated')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
