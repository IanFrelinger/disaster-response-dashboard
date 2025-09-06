import { test, expect, Page } from '@playwright/test';

/**
 * INSANE ERROR DEEP DIVE - Comprehensive error detection and analysis
 * This test captures EVERY possible error: console, network, rendering, map issues, etc.
 */

interface ErrorCapture {
  timestamp: number;
  type: 'console' | 'network' | 'unhandled' | 'rejection' | 'resource' | 'dom' | 'performance';
  severity: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  source?: string;
  stack?: string;
  url?: string;
  status?: number;
  details?: any;
}

test.describe('INSANE ERROR DEEP DIVE', () => {
  test('comprehensive error detection and analysis', async ({ page }) => {
    const allErrors: ErrorCapture[] = [];
    const performanceMetrics: any[] = [];
    const networkRequests: any[] = [];
    const consoleMessages: any[] = [];
    
    // Capture ALL possible error types
    page.on('console', msg => {
      const error: ErrorCapture = {
        timestamp: Date.now(),
        type: 'console',
        severity: msg.type() as any,
        message: msg.text(),
        source: msg.location().url,
        stack: msg.location().lineNumber ? `Line ${msg.location().lineNumber}` : undefined
      };
      allErrors.push(error);
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    page.on('pageerror', error => {
      const errorCapture: ErrorCapture = {
        timestamp: Date.now(),
        type: 'unhandled',
        severity: 'error',
        message: error instanceof Error ? error.message : String(error),
        stack: error.stack,
        source: error.name
      };
      allErrors.push(errorCapture);
    });

    page.on('requestfailed', request => {
      const error: ErrorCapture = {
        timestamp: Date.now(),
        type: 'network',
        severity: 'error',
        message: `Request failed: ${request.method()} ${request.url()}`,
        url: request.url(),
        status: (request.failure() as any)?.statusCode,
        details: {
          method: request.method(),
          failure: request.failure()?.errorText,
          headers: request.headers()
        }
      };
      allErrors.push(error);
    });

    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: Date.now()
      });
    });

    page.on('response', response => {
      if (!response.ok()) {
        const error: ErrorCapture = {
          timestamp: Date.now(),
          type: 'network',
          severity: 'error',
          message: `HTTP ${response.status()}: ${response.statusText()}`,
          url: response.url(),
          status: response.status(),
          details: {
            headers: response.headers(),
            timing: (response as any).timing()
          }
        };
        allErrors.push(error);
      }
    });

    // Capture unhandled promise rejections
    await page.addInitScript(() => {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
      });
    });

    // Navigate to the app
    console.log('🚀 Starting INSANE ERROR DEEP DIVE...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/insane-deep-dive-01-initial.png', fullPage: true });
    
    // Click on the "Open 3D Map" button
    console.log('🔍 Clicking "Open 3D Map" button...');
    await page.click('button:has-text("Open 3D Map")');
    
    // Monitor during map loading
    console.log('⏳ Monitoring during map loading...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/insane-deep-dive-02-loading.png', fullPage: true });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/insane-deep-dive-03-partial-load.png', fullPage: true });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/insane-deep-dive-04-near-complete.png', fullPage: true });
    
    // Wait for full initialization
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/insane-deep-dive-05-final.png', fullPage: true });
    
    // Test all layer toggles to trigger any hidden errors
    console.log('🔧 Testing all layer toggles...');
    const toggles = page.locator('input[type="checkbox"]');
    const toggleCount = await toggles.count();
    
    for (let i = 0; i < toggleCount; i++) {
      const toggle = toggles.nth(i);
      await toggle.click();
      await page.waitForTimeout(500);
      await toggle.click();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: 'test-results/insane-deep-dive-06-after-toggles.png', fullPage: true });
    
    // Test map interactions
    console.log('🖱️ Testing map interactions...');
    const mapContainer = page.locator('.map-container-3d');
    if (await mapContainer.isVisible()) {
      await mapContainer.hover();
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'test-results/insane-deep-dive-07-after-interactions.png', fullPage: true });
    
    // Test rapid toggling to stress test
    console.log('⚡ Stress testing with rapid toggles...');
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < toggleCount; j++) {
        const toggle = toggles.nth(j);
        await toggle.click();
        await page.waitForTimeout(50);
      }
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/insane-deep-dive-08-after-stress.png', fullPage: true });
    
    // Capture final state
    console.log('📊 Capturing final state...');
    const finalState = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api) return { error: 'API not available' };
      
      try {
        const map = api.getMapInstance();
        if (!map) return { error: 'Map not available' };
        
        const style = map.getStyle();
        const sources = Object.keys(style.sources || {});
        const layers = (style.layers || []).map((layer: any) => layer.id);
        
        return {
          mapReady: map.isStyleLoaded() && (map.isLoaded ? map.isLoaded() : true),
          styleLoaded: map.isStyleLoaded(),
          mapLoaded: map.isLoaded ? map.isLoaded() : true,
          sources: sources,
          layers: layers,
          customSources: ['hazards', 'units', 'routes'].map(id => ({
            id,
            exists: sources.includes(id),
            source: map.getSource(id) ? 'available' : 'null'
          })),
          customLayers: ['hazards', 'units', 'routes', '3d-buildings'].map(id => ({
            id,
            exists: layers.includes(id),
            layer: map.getLayer(id) ? 'available' : 'null'
          }))
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    // Run validation to check for any issues
    console.log('🔍 Running validation...');
    const validationResults = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'Validation API not available' };
      }
      
      try {
        return api.validateLayers();
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    // Capture performance metrics
    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const measure = performance.getEntriesByType('measure');
      
      return {
        navigation: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        },
        paint: paint.map(p => ({
          name: p.name,
          startTime: p.startTime,
          duration: p.duration
        })),
        measures: measure.map(m => ({
          name: m.name,
          startTime: m.startTime,
          duration: m.duration
        }))
      };
    });
    
    // Analyze and categorize errors
    console.log('📋 Analyzing captured errors...');
    const errorAnalysis = {
      totalErrors: allErrors.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      criticalErrors: [] as ErrorCapture[],
      warnings: [] as ErrorCapture[],
      networkErrors: [] as ErrorCapture[],
      consoleErrors: [] as ErrorCapture[],
      unhandledErrors: [] as ErrorCapture[]
    };
    
    allErrors.forEach(error => {
      // Count by type
      errorAnalysis.byType[error.type] = (errorAnalysis.byType[error.type] || 0) + 1;
      errorAnalysis.bySeverity[error.severity] = (errorAnalysis.bySeverity[error.severity] || 0) + 1;
      
      // Categorize
      if (error.severity === 'error') {
        errorAnalysis.criticalErrors.push(error);
      } else if (error.severity === 'warning') {
        errorAnalysis.warnings.push(error);
      }
      
      if (error.type === 'network') {
        errorAnalysis.networkErrors.push(error);
      } else if (error.type === 'console') {
        errorAnalysis.consoleErrors.push(error);
      } else if (error.type === 'unhandled') {
        errorAnalysis.unhandledErrors.push(error);
      }
    });
    
    // Log comprehensive analysis
    console.log('\n🔍 INSANE ERROR DEEP DIVE RESULTS:');
    console.log('=====================================');
    console.log(`📊 Total Errors Captured: ${errorAnalysis.totalErrors}`);
    console.log(`📊 Errors by Type:`, errorAnalysis.byType);
    console.log(`📊 Errors by Severity:`, errorAnalysis.bySeverity);
    
    if (errorAnalysis.criticalErrors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
      errorAnalysis.criticalErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error instanceof Error ? error.message : String(error)}`);
        if (error.stack) console.log(`   Stack: ${error.stack}`);
        if (error.url) console.log(`   URL: ${error.url}`);
      });
    }
    
    if (errorAnalysis.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      errorAnalysis.warnings.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error instanceof Error ? error.message : String(error)}`);
      });
    }
    
    if (errorAnalysis.networkErrors.length > 0) {
      console.log('\n🌐 NETWORK ERRORS:');
      errorAnalysis.networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error instanceof Error ? error.message : String(error)}`);
        if (error.status) console.log(`   Status: ${error.status}`);
      });
    }
    
    console.log('\n📊 FINAL STATE ANALYSIS:');
    console.log('========================');
    console.log('Map State:', JSON.stringify(finalState, null, 2));
    console.log('Validation Results:', JSON.stringify(validationResults, null, 2));
    console.log('Performance Data:', JSON.stringify(performanceData, null, 2));
    
    console.log('\n🌐 NETWORK REQUESTS:');
    console.log('====================');
    console.log(`Total Requests: ${networkRequests.length}`);
    const uniqueUrls = [...new Set(networkRequests.map(r => r.url))];
    console.log(`Unique URLs: ${uniqueUrls.length}`);
    uniqueUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    
    console.log('\n💬 CONSOLE MESSAGES:');
    console.log('====================');
    console.log(`Total Messages: ${consoleMessages.length}`);
    const messageTypes = {} as Record<string, number>;
    consoleMessages.forEach(msg => {
      messageTypes[msg.type] = (messageTypes[msg.type] || 0) + 1;
    });
    console.log('Message Types:', messageTypes);
    
    // Assertions - be very strict about errors
    expect(errorAnalysis.criticalErrors.length).toBe(0);
    expect(errorAnalysis.unhandledErrors.length).toBe(0);
    
    // Check for specific error patterns (excluding debug logs)
    const mapErrors = allErrors.filter(error => 
      error.severity === 'error' && (
        error instanceof Error ? error.message : String(error).toLowerCase().includes('map') ||
        error instanceof Error ? error.message : String(error).toLowerCase().includes('mapbox') ||
        error instanceof Error ? error.message : String(error).toLowerCase().includes('terrain') ||
        error instanceof Error ? error.message : String(error).toLowerCase().includes('layer')
      )
    );
    
    if (mapErrors.length > 0) {
      console.log('\n🗺️ MAP-RELATED ERRORS:');
      mapErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error instanceof Error ? error.message : String(error)}`);
      });
    }
    
    expect(mapErrors.length).toBe(0);
    
    // Check for white screen indicators
    const whiteScreenErrors = allErrors.filter(error => 
      error instanceof Error ? error.message : String(error).toLowerCase().includes('white screen') ||
      error instanceof Error ? error.message : String(error).toLowerCase().includes('blank') ||
      error instanceof Error ? error.message : String(error).toLowerCase().includes('empty') ||
      error instanceof Error ? error.message : String(error).toLowerCase().includes('not rendering')
    );
    
    expect(whiteScreenErrors.length).toBe(0);
    
    // Check for performance issues
    if (performanceData.navigation.totalTime > 10000) {
      console.log(`⚠️ Slow page load: ${performanceData.navigation.totalTime}ms`);
    }
    
    // Final validation that everything is working
    expect(finalState.mapReady).toBe(true);
    expect(validationResults.overall?.success).toBe(true);
    expect(validationResults.overall?.successfulLayers).toBeGreaterThan(0);
    
    console.log('\n✅ INSANE ERROR DEEP DIVE COMPLETED SUCCESSFULLY!');
    console.log('🎉 NO CRITICAL ERRORS FOUND!');
  });
});
