import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceHookOptions {
  enableCaching?: boolean;
  enableOfflineQueue?: boolean;
  monitoringEnabled?: boolean;
}

interface PerformanceMetric {
  label: string;
  duration: number;
  timestamp: number;
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePerformanceOptimization = (options: PerformanceHookOptions = {}) => {
  const {
    enableCaching = true,
    enableOfflineQueue = true,
    monitoringEnabled = true
  } = options;

  const metricsRef = useRef<PerformanceMetric[]>([]);
  const isOnlineRef = useRef<boolean>(navigator.onLine);

  // Get from cache
  const getFromCache = useCallback((key: string) => {
    if (!enableCaching) return null;
    
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_TTL) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  }, [enableCaching]);

  // Set to cache
  const setToCache = useCallback((key: string, data: any) => {
    if (enableCaching) {
      cache.set(key, { data, timestamp: Date.now() });
    }
  }, [enableCaching]);

  // Optimized query with caching
  const optimizedQuery = useCallback(async (
    queryFn: () => Promise<any>,
    cacheKey: string
  ) => {
    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for: ${cacheKey}`);
      return { data: cached, error: null };
    }

    const startTime = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      // Log performance metrics
      if (monitoringEnabled) {
        metricsRef.current.push({
          label: `db-query-${cacheKey}`,
          duration,
          timestamp: Date.now()
        });

        if (duration > 200) {
          console.warn(`⚠️ Slow query detected: ${cacheKey} took ${duration}ms`);
        }
      }

      // Cache successful results
      if (result.data && !result.error) {
        setToCache(cacheKey, result.data);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Query failed: ${cacheKey}`, error);
      
      if (monitoringEnabled) {
        metricsRef.current.push({
          label: `db-query-error-${cacheKey}`,
          duration,
          timestamp: Date.now()
        });
      }

      return { data: null, error };
    }
  }, [getFromCache, setToCache, monitoringEnabled]);

  // Optimized journal query
  const optimizedJournalQuery = useCallback(async (userId: string) => {
    const cacheKey = `journal-${userId}`;
    
    return optimizedQuery(async () => {
      return await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    }, cacheKey);
  }, [optimizedQuery]);

  // Report performance metrics
  const reportMetrics = useCallback(async () => {
    if (!monitoringEnabled || metricsRef.current.length === 0) return;

    try {
      await supabase.functions.invoke('performance-analytics', {
        body: {
          action: 'log_performance',
          metrics: metricsRef.current
        }
      });

      // Clear reported metrics
      metricsRef.current = [];
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
    }
  }, [monitoringEnabled]);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.clear();
    console.log('🧹 Cache cleared');
  }, []);

  // Check system health
  const checkSystemHealth = useCallback(async () => {
    try {
      const response = await supabase.functions.invoke('performance-analytics', {
        body: { action: 'get_system_health' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check system health:', error);
      return null;
    }
  }, []);

  // Setup effects
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      console.log('🌐 Back online');
    };
    
    const handleOffline = () => {
      isOnlineRef.current = false;
      console.log('📴 Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Report metrics every minute
    let metricsInterval: NodeJS.Timeout;
    if (monitoringEnabled) {
      metricsInterval = setInterval(reportMetrics, 60000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (metricsInterval) clearInterval(metricsInterval);
    };
  }, [monitoringEnabled, reportMetrics]);

  return {
    optimizedQuery,
    optimizedJournalQuery,
    reportMetrics,
    clearCache,
    checkSystemHealth,
    isOnline: isOnlineRef.current,
    metricsCount: metricsRef.current.length
  };
};