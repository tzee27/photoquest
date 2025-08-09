import React from "react";

// Memory monitoring utility for development
export const memoryMonitor = {
  // Get current memory usage (browser only)
  getMemoryInfo: () => {
    if (typeof window === "undefined") return null;

    // Check if performance.memory is available (Chrome/Edge)
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }

    return null;
  },

  // Log memory usage with context
  logMemoryUsage: (context: string) => {
    const memInfo = memoryMonitor.getMemoryInfo();
    if (memInfo) {
      console.log(`🧠 Memory Usage [${context}]:`, {
        used: `${memInfo.used}MB`,
        total: `${memInfo.total}MB`,
        limit: `${memInfo.limit}MB`,
        percentage: `${Math.round((memInfo.used / memInfo.limit) * 100)}%`,
      });
    }
  },

  // Check if memory usage is high
  isMemoryHigh: (): boolean => {
    const memInfo = memoryMonitor.getMemoryInfo();
    if (!memInfo) return false;

    const usagePercentage = (memInfo.used / memInfo.limit) * 100;
    return usagePercentage > 70; // Consider high if over 70%
  },

  // Get optimization recommendations
  getOptimizationTips: () => {
    const memInfo = memoryMonitor.getMemoryInfo();
    if (!memInfo) return [];

    const tips = [];
    const usagePercentage = (memInfo.used / memInfo.limit) * 100;

    if (usagePercentage > 80) {
      tips.push("Critical: Memory usage very high. Consider refreshing the page.");
    } else if (usagePercentage > 60) {
      tips.push("Warning: Memory usage getting high. Monitor performance.");
    }

    if (memInfo.used > 100) {
      tips.push("Subgraph polling may be aggressive. Consider reducing poll intervals.");
    }

    if (memInfo.used > 200) {
      tips.push("Large data sets detected. Implement pagination or lazy loading.");
    }

    return tips;
  },

  // Monitor Apollo Client cache size
  monitorApolloCache: (client: any) => {
    if (!client) return null;

    try {
      const cache = client.cache.extract();
      const cacheSize = JSON.stringify(cache).length;
      const cacheSizeMB = Math.round((cacheSize / 1024 / 1024) * 100) / 100;

      return {
        size: cacheSizeMB,
        entries: Object.keys(cache).length,
        isLarge: cacheSizeMB > 5, // Consider large if over 5MB
      };
    } catch (error) {
      console.warn("Could not monitor Apollo cache:", error);
      return null;
    }
  },

  // Performance observer for long tasks
  observeLongTasks: () => {
    if (typeof window === "undefined") return;

    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Tasks longer than 50ms
            console.warn(`🐌 Long task detected:`, {
              duration: `${Math.round(entry.duration)}ms`,
              name: entry.name,
              type: entry.entryType,
            });
          }
        }
      });

      observer.observe({ entryTypes: ["longtask"] });
      return observer;
    } catch (error) {
      console.warn("Long task observation not supported:", error);
      return null;
    }
  },
};

// React hook for memory monitoring
export const useMemoryMonitor = (interval: number = 10000) => {
  if (typeof window === "undefined") return null;

  const [memoryInfo, setMemoryInfo] = React.useState(memoryMonitor.getMemoryInfo());

  React.useEffect(() => {
    const updateMemoryInfo = () => {
      setMemoryInfo(memoryMonitor.getMemoryInfo());
    };

    const intervalId = setInterval(updateMemoryInfo, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};
