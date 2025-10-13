import { useCallback } from 'react';

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

export const useAIOptimization = () => {
  const logOptimization = useCallback((entry: Omit<OptimizationEntry, 'id' | 'timestamp'>) => {
    const stored = localStorage.getItem('ai-optimization-log');
    const entries: OptimizationEntry[] = stored ? JSON.parse(stored) : [];
    
    const newEntry: OptimizationEntry = {
      ...entry,
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    entries.push(newEntry);
    localStorage.setItem('ai-optimization-log', JSON.stringify(entries));
    
    console.log('🧠 AI Optimization Logged:', newEntry);
    return newEntry;
  }, []);

  const updateOptimization = useCallback((id: string, updates: Partial<OptimizationEntry>) => {
    const stored = localStorage.getItem('ai-optimization-log');
    const entries: OptimizationEntry[] = stored ? JSON.parse(stored) : [];
    
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      localStorage.setItem('ai-optimization-log', JSON.stringify(entries));
      console.log('🧠 AI Optimization Updated:', entries[index]);
    }
  }, []);

  const getOptimizations = useCallback(() => {
    const stored = localStorage.getItem('ai-optimization-log');
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Helper: Track user action for behavioral analysis
  const trackBehavior = useCallback((
    action: string,
    context?: Record<string, any>
  ) => {
    const behaviorLog = localStorage.getItem('ai-behavior-log');
    const logs = behaviorLog ? JSON.parse(behaviorLog) : [];
    
    logs.push({
      action,
      context,
      timestamp: new Date(),
    });

    // Keep only last 100 entries
    if (logs.length > 100) {
      logs.shift();
    }

    localStorage.setItem('ai-behavior-log', JSON.stringify(logs));
  }, []);

  return {
    logOptimization,
    updateOptimization,
    getOptimizations,
    trackBehavior,
  };
};
