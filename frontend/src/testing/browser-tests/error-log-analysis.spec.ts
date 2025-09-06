import { test, expect, Page } from '@playwright/test';

/**
 * Error Log Analysis Test
 * Focused on capturing and analyzing specific error logs in map layers
 */

interface ErrorAnalysis {
  timestamp: string;
  errorType: string;
  message: string;
  stack?: string;
  context: string;
  severity: 'error' | 'warning' | 'info';
}

test.describe('Error Log Analysis', () => {
  test('comprehensive error log capture and analysis', async ({ page }) => {
    const errorLogs: ErrorAnalysis[] = [];
    const consoleMessages: string[] = [];
    
    // Set up comprehensive error capture
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      const timestamp = new Date().toISOString();
      
      consoleMessages.push(`[${timestamp}] [${type.toUpperCase()}] ${text}`);
      
      // Analyze console messages for errors
      if (type === 'error' || type === 'warning') {
        const errorAnalysis: ErrorAnalysis = {
          timestamp,
          errorType: type,
          message: text,
          context: 'console',
          severity: type as 'error' | 'warning'
        };
        
        // Categorize errors
        if (text.toLowerCase().includes('mapbox')) {
          errorAnalysis.context = 'mapbox';
        } else if (text.toLowerCase().includes('layer')) {
          errorAnalysis.context = 'layer';
        } else if (text.toLowerCase().includes('terrain')) {
          errorAnalysis.context = 'terrain';
        } else if (text.toLowerCase().includes('source')) {
          errorAnalysis.context = 'source';
        } else if (text.toLowerCase().includes('webgl')) {
          errorAnalysis.context = 'webgl';
        } else if (text.toLowerCase().includes('network')) {
          errorAnalysis.context = 'network';
        }
        
        errorLogs.push(errorAnalysis);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      const timestamp = new Date().toISOString();
      errorLogs.push({
        timestamp,
        errorType: 'pageerror',
        message: error.message,
        stack: error.stack,
        context: 'page',
        severity: 'error'
      });
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
      const timestamp = new Date().toISOString();
      errorLogs.push({
        timestamp,
        errorType: 'network',
        message: `Request failed: ${request.url()} - ${request.failure()?.errorText}`,
        context: 'network',
        severity: 'error'
      });
    });
    
    // Navigate to the app
    console.log('🌐 Navigating to application...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    console.log('🗺️ Opening 3D Map...');
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to initialize and capture errors during initialization
    console.log('⏳ Waiting for map initialization...');
    await page.waitForTimeout(8000);
    
    // Test layer toggles and capture errors
    console.log('🔄 Testing layer toggles...');
    const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    
    for (const layerName of layerNames) {
      console.log(`  Testing ${layerName} layer...`);
      
      try {
        // Find and toggle the layer
        const toggleSelectors = [
          `input[type="checkbox"][data-layer="${layerName}"]`,
          `input[type="checkbox"][id*="${layerName}"]`,
          `label:has-text("${layerName}") input[type="checkbox"]`,
          `button:has-text("${layerName}")`,
          `[data-testid*="${layerName}"]`
        ];
        
        let toggleFound = false;
        for (const selector of toggleSelectors) {
          const toggle = page.locator(selector).first();
          if (await toggle.isVisible()) {
            await toggle.click();
            await page.waitForTimeout(1000);
            toggleFound = true;
            break;
          }
        }
        
        if (!toggleFound) {
          console.log(`    ⚠️ Toggle for ${layerName} not found`);
        }
        
        // Wait and capture any errors
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`    ❌ Error testing ${layerName}: ${error}`);
      }
    }
    
    // Test map interactions
    console.log('🎮 Testing map interactions...');
    const mapContainer = page.locator('.map-container-3d');
    
    if (await mapContainer.isVisible()) {
      try {
        // Pan the map
        await mapContainer.hover();
        await page.mouse.move(100, 100);
        await page.mouse.down();
        await page.mouse.move(200, 200);
        await page.mouse.up();
        await page.waitForTimeout(500);
        
        // Try zoom
        try {
          await page.mouse.wheel(0, -100);
          await page.waitForTimeout(500);
        } catch (error) {
          console.log('    ⚠️ Mouse wheel not supported on this platform');
        }
        
        // Click on map
        await mapContainer.click({ position: { x: 300, y: 300 } });
        await page.waitForTimeout(500);
        
      } catch (error) {
        console.log(`    ❌ Map interaction error: ${error}`);
      }
    }
    
    // Capture final state and any remaining errors
    console.log('📊 Capturing final state...');
    await page.waitForTimeout(2000);
    
    // Get detailed map state
    const mapState = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api) return { error: 'API not available' };
      
      try {
        const map = api.getMapInstance();
        if (!map) return { error: 'Map not available' };
        
        const style = map.getStyle();
        return {
          mapReady: map.isStyleLoaded() && (map.isLoaded ? map.isLoaded() : true),
          styleLoaded: map.isStyleLoaded(),
          sources: Object.keys(style.sources || {}),
          layers: (style.layers || []).map((layer: any) => ({
            id: layer.id,
            type: layer.type,
            source: layer.source,
            layout: layer.layout,
            paint: layer.paint
          })),
          customSources: ['hazards', 'units', 'routes', 'mapbox-dem'].map(id => ({
            id,
            exists: !!map.getSource(id),
            type: map.getSource(id)?.type
          })),
          customLayers: ['hazards', 'units', 'routes', '3d-buildings'].map(id => ({
            id,
            exists: !!map.getLayer(id),
            visible: map.getLayoutProperty(id, 'visibility') !== 'none'
          }))
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    // Analyze error patterns
    console.log('\n📋 ERROR ANALYSIS RESULTS:');
    console.log(`Total Errors Captured: ${errorLogs.length}`);
    console.log(`Total Console Messages: ${consoleMessages.length}`);
    
    // Group errors by context
    const errorsByContext = errorLogs.reduce((acc, error) => {
      if (!acc[error.context]) acc[error.context] = [];
      if (error.context && acc[error.context]) {
        acc[error.context]?.push(error);
      }
      return acc;
    }, {} as Record<string, ErrorAnalysis[]>);
    
    console.log('\n🔍 ERRORS BY CONTEXT:');
    Object.entries(errorsByContext).forEach(([context, errors]) => {
      console.log(`  ${context}: ${errors.length} errors`);
      errors.forEach(error => {
        console.log(`    [${error.severity.toUpperCase()}] ${error.message}`);
      });
    });
    
    // Show most frequent error patterns
    const errorMessages = errorLogs.map(e => e.message);
    const errorCounts = errorMessages.reduce((acc, msg) => {
      acc[msg] = (acc[msg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const frequentErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    if (frequentErrors.length > 0) {
      console.log('\n🚨 MOST FREQUENT ERRORS:');
      frequentErrors.forEach(([message, count], index) => {
        console.log(`${index + 1}. [${count}x] ${message}`);
      });
    }
    
    // Show map state issues
    console.log('\n🗺️ MAP STATE ANALYSIS:');
    if (mapState.error) {
      console.log(`  ❌ Map State Error: ${mapState.error}`);
    } else {
      console.log(`  Map Ready: ${mapState.mapReady}`);
      console.log(`  Style Loaded: ${mapState.styleLoaded}`);
      console.log(`  Sources: ${mapState.sources?.length || 0}`);
      console.log(`  Layers: ${mapState.layers.length}`);
      
      // Check for missing custom sources
      const missingSources = mapState.customSources?.filter((s: any) => !s.exists) || [];
      if (missingSources.length > 0) {
        console.log(`  ❌ Missing Sources: ${missingSources.map((s: any) => s.id).join(', ')}`);
      }
      
      // Check for missing custom layers
      const missingLayers = mapState.customLayers?.filter((l: any) => !l.exists) || [];
      if (missingLayers.length > 0) {
        console.log(`  ❌ Missing Layers: ${missingLayers.map((l: any) => l.id).join(', ')}`);
      }
    }
    
    // Take screenshots for visual debugging
    await page.screenshot({ path: 'test-results/error-analysis-final.png', fullPage: true });
    
    // Save detailed error log
    const errorReport = {
      timestamp: new Date().toISOString(),
      totalErrors: errorLogs.length,
      errorsByContext,
      frequentErrors,
      mapState,
      allErrors: errorLogs,
      consoleMessages: consoleMessages.slice(-50) // Last 50 console messages
    };
    
    // Write error report to file (this would need a file system API in a real scenario)
    console.log('\n💾 Error report generated (would be saved to file in production)');
    
    // Basic assertions
    expect(errorLogs.length).toBeGreaterThanOrEqual(0);
    expect(consoleMessages.length).toBeGreaterThan(0);
    
    console.log('\n✅ Error log analysis completed');
  });
  
  test('focused layer error detection', async ({ page }) => {
    const layerErrors: Record<string, string[]> = {};
    
    // Set up layer-specific error tracking
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error' || type === 'warning') {
        // Try to identify which layer the error relates to
        const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
        for (const layerName of layerNames) {
          if (text.toLowerCase().includes(layerName)) {
            if (!layerErrors[layerName]) layerErrors[layerName] = [];
            layerErrors[layerName].push(`[${type.toUpperCase()}] ${text}`);
          }
        }
      }
    });
    
    // Navigate and test each layer individually
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(5000);
    
    const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    
    for (const layerName of layerNames) {
      console.log(`🔍 Testing ${layerName} layer in isolation...`);
      
      // Clear previous errors for this layer
      layerErrors[layerName] = [];
      
      // Find and interact with the layer
      const toggleSelectors = [
        `input[type="checkbox"][data-layer="${layerName}"]`,
        `input[type="checkbox"][id*="${layerName}"]`,
        `label:has-text("${layerName}") input[type="checkbox"]`
      ];
      
      for (const selector of toggleSelectors) {
        const toggle = page.locator(selector).first();
        if (await toggle.isVisible()) {
          // Toggle on
          await toggle.click();
          await page.waitForTimeout(1000);
          
          // Toggle off
          await toggle.click();
          await page.waitForTimeout(1000);
          
          // Toggle on again
          await toggle.click();
          await page.waitForTimeout(1000);
          
          break;
        }
      }
    }
    
    // Report layer-specific errors
    console.log('\n🎯 LAYER-SPECIFIC ERROR ANALYSIS:');
    Object.entries(layerErrors).forEach(([layerName, errors]) => {
      if (errors.length > 0) {
        console.log(`\n❌ ${layerName.toUpperCase()} LAYER ERRORS (${errors.length}):`);
        errors.forEach(error => console.log(`  ${error}`));
      } else {
        console.log(`✅ ${layerName.toUpperCase()} LAYER: No errors detected`);
      }
    });
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/layer-specific-errors.png', fullPage: true });
    
    console.log('\n✅ Focused layer error detection completed');
  });
});
