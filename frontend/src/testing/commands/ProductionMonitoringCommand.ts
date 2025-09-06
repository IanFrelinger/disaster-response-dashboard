/**
 * ProductionMonitoringCommand - Monitors production metrics and performance
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface ProductionMonitoringInput extends CommandInput {
  url: string;
  monitoringDuration: number; // ms
  checkMemoryUsage: boolean;
  checkNetworkLatency: boolean;
  checkErrorRate: boolean;
  checkUserInteractions: boolean;
  memoryThreshold: number; // MB
  latencyThreshold: number; // ms
  errorRateThreshold: number; // percentage
}

export class ProductionMonitoringCommand extends BaseCommand<ProductionMonitoringInput> {
  name = 'ProductionMonitoring';
  
  private readonly MONITORING_TIMEOUTS = {
    pageLoad: 30000, // 30 seconds
    monitoring: 60000, // 60 seconds
    dataCollection: 10000, // 10 seconds
  };

  async run(context: TestContext): Promise<TestResult> {
    return this.execute(context);
  }

  async execute(context: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`📊 Running production monitoring for: ${this.input.url}`);
      console.log(`⏱️ Monitoring duration: ${this.input.monitoringDuration}ms`);
      
      // Navigate to production URL
      await context.page.goto(this.input.url, {
        waitUntil: 'networkidle',
        timeout: this.MONITORING_TIMEOUTS.pageLoad
      });

      const monitoringData = {
        memoryUsage: [] as number[],
        networkLatency: [] as number[],
        errors: [] as any[],
        userInteractions: [] as any[],
        performanceMetrics: {} as any
      };

      // Set up monitoring
      await this.setupMonitoring(context);

      // Monitor for specified duration
      const monitoringStart = Date.now();
      const monitoringEnd = monitoringStart + this.input.monitoringDuration;
      
      while (Date.now() < monitoringEnd) {
        // Collect data every 5 seconds
        await this.collectMonitoringData(context, monitoringData);
        await context.page.waitForTimeout(5000);
      }

      // Analyze collected data
      const analysis = this.analyzeMonitoringData(monitoringData);
      
      const duration = Date.now() - startTime;
      
      if (analysis.healthy) {
        console.log('✅ Production monitoring completed - All metrics healthy');
        return {
          name: this.name,
          success: true,
          duration: duration,
          message: 'Production monitoring completed successfully',
          details: {
            analysis,
            rawData: monitoringData
          }
        };
      } else {
        console.log('❌ Production monitoring detected issues');
        return {
          name: this.name,
          success: false,
          duration: duration,
          message: 'Production monitoring detected issues',
          error: 'One or more monitoring thresholds exceeded',
          details: {
            analysis,
            rawData: monitoringData
          }
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Production monitoring failed: ${error}`);
      
      return {
        name: this.name,
        success: false,
        durationMs: duration,
        message: 'Production monitoring failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async setupMonitoring(context: TestContext): Promise<void> {
    // Set up console error monitoring
    await context.page.evaluate(() => {
      (window as any).monitoringData = {
        errors: [],
        userInteractions: [],
        networkRequests: []
      };

      // Monitor console errors
      const originalError = console.error;
      console.error = (...args) => {
        (window as any).monitoringData.errors.push({
          timestamp: Date.now(),
          message: args.join(' '),
          type: 'console_error'
        });
        originalError.apply(console, args);
      };

      // Monitor user interactions
      document.addEventListener('click', (e) => {
        (window as any).monitoringData.userInteractions.push({
          timestamp: Date.now(),
          type: 'click',
          target: e.target?.tagName || 'unknown'
        });
      });

      document.addEventListener('keydown', (e) => {
        (window as any).monitoringData.userInteractions.push({
          timestamp: Date.now(),
          type: 'keydown',
          key: e.key
        });
      });

      // Monitor network requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = Date.now();
        try {
          const response = await originalFetch(...args);
          const endTime = Date.now();
          (window as any).monitoringData.networkRequests.push({
            timestamp: startTime,
            url: args[0],
            status: response.status,
            duration: endTime - startTime,
            success: response.ok
          });
          return response;
        } catch (error) {
          const endTime = Date.now();
          (window as any).monitoringData.networkRequests.push({
            timestamp: startTime,
            url: args[0],
            status: 0,
            duration: endTime - startTime,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      };
    });
  }

  private async collectMonitoringData(context: TestContext, data: any): Promise<void> {
    try {
      // Collect memory usage
      if (this.input.checkMemoryUsage) {
        const memoryInfo = await context.page.evaluate(() => {
          const memory = (performance as any).memory;
          return memory ? {
            used: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
            total: memory.totalJSHeapSize / 1024 / 1024,
            limit: memory.jsHeapSizeLimit / 1024 / 1024
          } : null;
        });

        if (memoryInfo) {
          data.memoryUsage.push(memoryInfo.used);
        }
      }

      // Collect network latency
      if (this.input.checkNetworkLatency) {
        const latency = await context.page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return navigation ? navigation.responseEnd - navigation.requestStart : 0;
        });
        data.networkLatency.push(latency);
      }

      // Collect errors
      if (this.input.checkErrorRate) {
        const errors = await context.page.evaluate(() => {
          return (window as any).monitoringData?.errors || [];
        });
        data.errors.push(...errors);
      }

      // Collect user interactions
      if (this.input.checkUserInteractions) {
        const interactions = await context.page.evaluate(() => {
          return (window as any).monitoringData?.userInteractions || [];
        });
        data.userInteractions.push(...interactions);
      }

      // Collect performance metrics
      const performanceMetrics = await context.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: paint.find(p => p.name === 'largest-contentful-paint')?.startTime || 0
        };
      });
      
      data.performanceMetrics = performanceMetrics;

    } catch (error) {
      console.log(`Warning: Failed to collect monitoring data: ${error}`);
    }
  }

  private analyzeMonitoringData(data: any): {healthy: boolean, issues: any[], metrics: any} {
    const issues: any[] = [];
    const metrics: any = {};

    // Analyze memory usage
    if (data.memoryUsage.length > 0) {
      const avgMemory = data.memoryUsage.reduce((a: number, b: number) => a + b, 0) / data.memoryUsage.length;
      const maxMemory = Math.max(...data.memoryUsage);
      
      metrics.memory = { average: avgMemory, maximum: maxMemory };
      
      if (maxMemory > this.input.memoryThreshold) {
        issues.push(`Memory usage exceeded threshold: ${maxMemory.toFixed(2)}MB > ${this.input.memoryThreshold}MB`);
      }
    }

    // Analyze network latency
    if (data.networkLatency.length > 0) {
      const avgLatency = data.networkLatency.reduce((a: number, b: number) => a + b, 0) / data.networkLatency.length;
      const maxLatency = Math.max(...data.networkLatency);
      
      metrics.latency = { average: avgLatency, maximum: maxLatency };
      
      if (maxLatency > this.input.latencyThreshold) {
        issues.push(`Network latency exceeded threshold: ${maxLatency.toFixed(2)}ms > ${this.input.latencyThreshold}ms`);
      }
    }

    // Analyze error rate
    if (data.errors.length > 0) {
      const errorRate = (data.errors.length / data.userInteractions.length) * 100;
      metrics.errorRate = errorRate;
      
      if (errorRate > this.input.errorRateThreshold) {
        issues.push(`Error rate exceeded threshold: ${errorRate.toFixed(2)}% > ${this.input.errorRateThreshold}%`);
      }
    }

    // Analyze user interactions
    metrics.userInteractions = data.userInteractions.length;
    metrics.performance = data.performanceMetrics;

    return {
      healthy: issues.length === 0,
      issues,
      metrics
    };
  }
}
