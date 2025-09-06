/**
 * Real User Monitoring (RUM) for map load times, frame rates, and route generation
 * Provides comprehensive performance tracking for the disaster response dashboard
 */

interface PerformanceMetrics {
  mapLoadTime: number;
  frameRate: number;
  routeGenerationLatency: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  interactionLatency: number;
}

interface PerformanceThresholds {
  mapLoadTime: number; // milliseconds
  frameRate: number; // FPS
  routeGenerationLatency: number; // milliseconds
  memoryUsage: number; // MB
  networkLatency: number; // milliseconds
  renderTime: number; // milliseconds
  interactionLatency: number; // milliseconds
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    mapLoadTime: 0,
    frameRate: 0,
    routeGenerationLatency: 0,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    interactionLatency: 0
  };

  private thresholds: PerformanceThresholds = {
    mapLoadTime: 3000, // 3 seconds
    frameRate: 30, // 30 FPS
    routeGenerationLatency: 1000, // 1 second
    memoryUsage: 100, // 100 MB
    networkLatency: 500, // 500ms
    renderTime: 16, // 16ms (60 FPS)
    interactionLatency: 100 // 100ms
  };

  private frameCount = 0;
  private lastFrameTime = 0;
  private frameRateHistory: number[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Monitor frame rate
    this.startFrameRateMonitoring();
    
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Monitor network performance
    this.startNetworkMonitoring();
    
    // Monitor user interactions
    this.startInteractionMonitoring();
  }

  private startFrameRateMonitoring(): void {
    const measureFrameRate = (timestamp: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = timestamp;
      }
      
      this.frameCount++;
      
      if (timestamp - this.lastFrameTime >= 1000) { // Update every second
        const currentFrameRate = (this.frameCount * 1000) / (timestamp - this.lastFrameTime);
        this.frameRateHistory.push(currentFrameRate);
        
        // Keep only last 10 measurements
        if (this.frameRateHistory.length > 10) {
          this.frameRateHistory.shift();
        }
        
        this.metrics.frameRate = this.calculateAverageFrameRate();
        this.lastFrameTime = timestamp;
        this.frameCount = 0;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFrameRate);
      }
    };
    
    requestAnimationFrame(measureFrameRate);
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }
    }, 1000);
  }

  private startNetworkMonitoring(): void {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        this.metrics.networkLatency = endTime - startTime;
        return response;
      } catch (error) {
        const endTime = performance.now();
        this.metrics.networkLatency = endTime - startTime;
        throw error;
      }
    };
  }

  private startInteractionMonitoring(): void {
    const events = ['click', 'keydown', 'scroll', 'resize'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, () => {
        const startTime = performance.now();
        requestAnimationFrame(() => {
          const endTime = performance.now();
          this.metrics.interactionLatency = endTime - startTime;
        });
      });
    });
  }

  private calculateAverageFrameRate(): number {
    if (this.frameRateHistory.length === 0) return 0;
    return this.frameRateHistory.reduce((sum, rate) => sum + rate, 0) / this.frameRateHistory.length;
  }

  public startMapLoadTimer(): void {
    this.metrics.mapLoadTime = performance.now();
  }

  public endMapLoadTimer(): void {
    this.metrics.mapLoadTime = performance.now() - this.metrics.mapLoadTime;
  }

  public startRouteGenerationTimer(): void {
    this.metrics.routeGenerationLatency = performance.now();
  }

  public endRouteGenerationTimer(): void {
    this.metrics.routeGenerationLatency = performance.now() - this.metrics.routeGenerationLatency;
  }

  public startRenderTimer(): void {
    this.metrics.renderTime = performance.now();
  }

  public endRenderTimer(): void {
    this.metrics.renderTime = performance.now() - this.metrics.renderTime;
  }

  public startMonitoring(): void {
    this.isMonitoring = true;
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  public setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  public checkPerformance(): {
    isHealthy: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check map load time
    if (this.metrics.mapLoadTime > this.thresholds.mapLoadTime) {
      violations.push(`Map load time (${this.metrics.mapLoadTime}ms) exceeds threshold (${this.thresholds.mapLoadTime}ms)`);
      recommendations.push('Consider lazy loading map resources or optimizing initial bundle size');
    }

    // Check frame rate
    if (this.metrics.frameRate < this.thresholds.frameRate) {
      violations.push(`Frame rate (${this.metrics.frameRate.toFixed(1)} FPS) below threshold (${this.thresholds.frameRate} FPS)`);
      recommendations.push('Optimize rendering performance, reduce layer complexity, or implement level-of-detail');
    }

    // Check route generation latency
    if (this.metrics.routeGenerationLatency > this.thresholds.routeGenerationLatency) {
      violations.push(`Route generation latency (${this.metrics.routeGenerationLatency}ms) exceeds threshold (${this.thresholds.routeGenerationLatency}ms)`);
      recommendations.push('Consider caching route calculations or optimizing routing algorithms');
    }

    // Check memory usage
    if (this.metrics.memoryUsage > this.thresholds.memoryUsage) {
      violations.push(`Memory usage (${this.metrics.memoryUsage.toFixed(1)} MB) exceeds threshold (${this.thresholds.memoryUsage} MB)`);
      recommendations.push('Implement memory cleanup, reduce data retention, or optimize data structures');
    }

    // Check network latency
    if (this.metrics.networkLatency > this.thresholds.networkLatency) {
      violations.push(`Network latency (${this.metrics.networkLatency}ms) exceeds threshold (${this.thresholds.networkLatency}ms)`);
      recommendations.push('Implement caching, use CDN, or optimize API responses');
    }

    // Check render time
    if (this.metrics.renderTime > this.thresholds.renderTime) {
      violations.push(`Render time (${this.metrics.renderTime}ms) exceeds threshold (${this.thresholds.renderTime}ms)`);
      recommendations.push('Optimize rendering pipeline, reduce draw calls, or implement frame skipping');
    }

    // Check interaction latency
    if (this.metrics.interactionLatency > this.thresholds.interactionLatency) {
      violations.push(`Interaction latency (${this.metrics.interactionLatency}ms) exceeds threshold (${this.thresholds.interactionLatency}ms)`);
      recommendations.push('Debounce interactions, optimize event handlers, or use requestIdleCallback');
    }

    return {
      isHealthy: violations.length === 0,
      violations,
      recommendations
    };
  }

  public generateReport(): {
    timestamp: string;
    metrics: PerformanceMetrics;
    thresholds: PerformanceThresholds;
    health: ReturnType<PerformanceMonitor['checkPerformance']>;
    userAgent: string;
    viewport: { width: number; height: number };
  } {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      thresholds: this.getThresholds(),
      health: this.checkPerformance(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  public sendToAnalytics(): void {
    const report = this.generateReport();
    
    // Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_metrics', {
        event_category: 'performance',
        event_label: 'rum_metrics',
        custom_map_load_time: report.metrics.mapLoadTime,
        custom_frame_rate: report.metrics.frameRate,
        custom_route_latency: report.metrics.routeGenerationLatency,
        custom_memory_usage: report.metrics.memoryUsage,
        custom_network_latency: report.metrics.networkLatency,
        custom_render_time: report.metrics.renderTime,
        custom_interaction_latency: report.metrics.interactionLatency,
        custom_is_healthy: report.health.isHealthy,
        custom_violation_count: report.health.violations.length
      });
    }
    
    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    }).catch(error => {
      console.warn('Failed to send performance metrics:', error);
    });
  }

  public exportMetrics(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Export types and utilities
export type { PerformanceMetrics, PerformanceThresholds };
export { PerformanceMonitor };

