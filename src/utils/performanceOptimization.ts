// Optimisations de performance pour fort trafic
import React, { useCallback, useMemo, useRef, DependencyList } from 'react';

// Cache LRU pour les requêtes fréquentes
class LRUCache<T> {
  private cache = new Map<string, { value: T; time: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) { // 5 minutes TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, time: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.time > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache global pour les données utilisateur
export const userDataCache = new LRUCache(50);
export const journalCache = new LRUCache(100);
export const progressCache = new LRUCache(30);

// Debounce pour les sauvegardes fréquentes
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
};

// Optimisation des re-renders avec memoization
export const useMemoizedData = <T>(
  data: T,
  deps: DependencyList
): T => {
  return useMemo(() => data, deps);
};

// Queue pour les actions offline
class ActionQueue {
  private queue: Array<{ action: string; data: any; timestamp: number }> = [];
  private isProcessing = false;

  add(action: string, data: any): void {
    this.queue.push({ action, data, timestamp: Date.now() });
  }

  async process(processor: (item: any) => Promise<void>): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        try {
          await processor(item);
        } catch (error) {
          console.error('Failed to process queued action:', error);
          // Re-queue si erreur réseau
          if (error instanceof Error && error.message.includes('network')) {
            this.queue.unshift(item);
            break;
          }
        }
      }
    }

    this.isProcessing = false;
  }

  getSize(): number {
    return this.queue.length;
  }
}

export const actionQueue = new ActionQueue();

// Métriques de performance
export const performanceMonitor = {
  startTiming: (label: string) => {
    performance.mark(`${label}-start`);
  },

  endTiming: (label: string) => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    if (measure && measure.duration > 200) {
      console.warn(`⚠️ Slow operation detected: ${label} took ${measure.duration.toFixed(2)}ms`);
    }
  },

  measureDBQuery: async <T>(query: () => Promise<T>, label: string): Promise<T> => {
    performanceMonitor.startTiming(`db-${label}`);
    try {
      const result = await query();
      return result;
    } finally {
      performanceMonitor.endTiming(`db-${label}`);
    }
  }
};