import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface OptimizationApplication {
  id: string;
  optimization_id: string;
  category: string;
  description: string;
  status: 'pending' | 'applied' | 'rolled_back' | 'failed';
  applied_at: string | null;
  rolled_back_at: string | null;
  error_message: string | null;
  created_at: string;
}

export const AdminOptimizationConsole: React.FC = () => {
  const { t } = useTranslation();
  const [optimizations, setOptimizations] = useState<OptimizationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    fetchOptimizations();
  }, []);

  const fetchOptimizations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_optimization_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOptimizations(data as OptimizationApplication[] || []);

      // Count today's successful applications
      const today = new Date().toISOString().split('T')[0];
      const todayApplied = (data || []).filter(
        opt => opt.status === 'applied' && 
        opt.applied_at && 
        opt.applied_at.startsWith(today)
      );
      setTodayCount(todayApplied.length);

    } catch (error) {
      console.error('Error fetching optimizations:', error);
      toast.error('Failed to load optimization history');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (optimizationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_optimization_applications')
        .update({ 
          status: 'rolled_back',
          rolled_back_at: new Date().toISOString()
        })
        .eq('id', optimizationId);

      if (error) throw error;

      toast.success('Optimization rolled back successfully');
      fetchOptimizations();
    } catch (error) {
      console.error('Error rolling back:', error);
      toast.error('Failed to rollback optimization');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'rolled_back': return <Undo2 className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'applied': 'bg-success/10 text-success',
      'failed': 'bg-destructive/10 text-destructive',
      'rolled_back': 'bg-warning/10 text-warning',
      'pending': 'bg-secondary text-secondary-foreground'
    };

    return (
      <Badge className={variants[status] || ''}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading optimization console...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Optimization Console</CardTitle>
                <CardDescription>Live behavioral improvements tracker</CardDescription>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2 p-4 bg-success/10 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-lg font-semibold text-success">
              AI applied {todayCount} optimization{todayCount !== 1 ? 's' : ''} successfully today ✅
            </p>
          </div>

          {optimizations.some(opt => opt.status === 'applied') && (
            <div className="mt-4 flex items-center justify-center space-x-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning">
                Rollback possible for applied optimizations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization History */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization History</CardTitle>
          <CardDescription>
            Track all AI-driven behavioral improvements and their implementation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {optimizations.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No optimizations recorded yet. The AI system will start logging improvements automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {optimizations.map((opt) => (
                <div
                  key={opt.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(opt.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{opt.optimization_id}</h4>
                          {getStatusBadge(opt.status)}
                          <Badge variant="outline" className="text-xs">
                            {opt.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {opt.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>
                            Created: {new Date(opt.created_at).toLocaleDateString()}
                          </span>
                          {opt.applied_at && (
                            <span>
                              Applied: {new Date(opt.applied_at).toLocaleDateString()}
                            </span>
                          )}
                          {opt.rolled_back_at && (
                            <span>
                              Rolled back: {new Date(opt.rolled_back_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {opt.error_message && (
                          <p className="text-xs text-destructive mt-2">
                            Error: {opt.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    {opt.status === 'applied' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(opt.id)}
                        className="ml-4"
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Rollback
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
