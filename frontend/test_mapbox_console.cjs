const { chromium } = require('playwright');

async function testMapboxConsole() {
  console.log('🔍 Testing Mapbox Console Errors');
  console.log('='.repeat(40));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📍 Loading application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait longer for all scripts to load
    await page.waitForTimeout(5000);
    
    // Monitor console logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('\n🎯 Test 1: Check Console Logs');
    console.log('-'.repeat(30));
    
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    const warningLogs = consoleLogs.filter(log => log.type === 'warn');
    const infoLogs = consoleLogs.filter(log => log.type === 'log');
    
    console.log(`Total Console Logs: ${consoleLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`Warnings: ${warningLogs.length}`);
    console.log(`Info: ${infoLogs.length}`);
    
    if (errorLogs.length > 0) {
      console.log('\nError Logs:');
      errorLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.text}`);
      });
    }
    
    if (warningLogs.length > 0) {
      console.log('\nWarning Logs:');
      warningLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.text}`);
      });
    }
    
    if (infoLogs.length > 0) {
      console.log('\nInfo Logs:');
      infoLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.text}`);
      });
    }
    
    console.log('\n🎯 Test 2: Check Mapbox Library in Console');
    console.log('-'.repeat(30));
    
    const mapboxCheck = await page.evaluate(() => {
      return {
        windowMapbox: !!window.mapboxgl,
        windowMap: !!window.mapboxgl?.Map,
        windowAccessToken: window.mapboxgl?.accessToken ? 'Set' : 'Not Set'
      };
    });
    
    console.log('Mapbox Check:', mapboxCheck);
    
    console.log('\n🎯 Test 3: Check for Module Loading Errors');
    console.log('-'.repeat(30));
    
    const moduleErrors = consoleLogs.filter(log => 
      log.text.includes('Failed to load') ||
      log.text.includes('Cannot find module') ||
      log.text.includes('mapbox') ||
      log.text.includes('import') ||
      log.text.includes('require')
    );
    
    console.log(`Module Loading Errors: ${moduleErrors.length}`);
    moduleErrors.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
    });
    
    console.log('\n🎯 Test 4: Check Network Tab');
    console.log('-'.repeat(30));
    
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    await page.waitForTimeout(2000);
    
    const jsRequests = networkRequests.filter(req => req.resourceType === 'script');
    const failedRequests = networkRequests.filter(req => req.status === 'failed');
    
    console.log(`Total Network Requests: ${networkRequests.length}`);
    console.log(`JavaScript Requests: ${jsRequests.length}`);
    console.log(`Failed Requests: ${failedRequests.length}`);
    
    if (jsRequests.length > 0) {
      console.log('\nJavaScript Files Loaded:');
      jsRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.url}`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('\nFailed Requests:');
      failedRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
      });
    }
    
    console.log('\n🎯 Test 5: Check for Mapbox-specific Errors');
    console.log('-'.repeat(30));
    
    const mapboxErrors = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('mapbox') ||
      log.text.toLowerCase().includes('mapboxgl') ||
      log.text.toLowerCase().includes('access token') ||
      log.text.toLowerCase().includes('style')
    );
    
    console.log(`Mapbox-specific Errors: ${mapboxErrors.length}`);
    mapboxErrors.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
    });
    
    // Final Analysis
    console.log('\n🔍 Final Analysis');
    console.log('='.repeat(40));
    
    const hasErrors = errorLogs.length > 0;
    const hasModuleErrors = moduleErrors.length > 0;
    const hasMapboxErrors = mapboxErrors.length > 0;
    const hasMapboxLibrary = mapboxCheck.windowMapbox;
    const hasFailedRequests = failedRequests.length > 0;
    
    console.log(`Console Errors: ${hasErrors ? '❌' : '✅'} (${errorLogs.length})`);
    console.log(`Module Loading Errors: ${hasModuleErrors ? '❌' : '✅'} (${moduleErrors.length})`);
    console.log(`Mapbox-specific Errors: ${hasMapboxErrors ? '❌' : '✅'} (${mapboxErrors.length})`);
    console.log(`Mapbox Library Loaded: ${hasMapboxLibrary ? '✅' : '❌'}`);
    console.log(`Failed Network Requests: ${hasFailedRequests ? '❌' : '✅'} (${failedRequests.length})`);
    
    if (hasModuleErrors) {
      console.log('\n🚨 ISSUE: Module loading errors detected');
      console.log('This suggests the Mapbox library is not being imported correctly');
    } else if (hasMapboxErrors) {
      console.log('\n🚨 ISSUE: Mapbox-specific errors detected');
      console.log('This suggests the Mapbox library is loaded but has configuration issues');
    } else if (!hasMapboxLibrary) {
      console.log('\n🚨 ISSUE: Mapbox library not loaded');
      console.log('This suggests a build or import issue');
    } else if (hasFailedRequests) {
      console.log('\n🚨 ISSUE: Network request failures');
      console.log('This suggests network connectivity issues');
    } else {
      console.log('\n✅ No obvious issues detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Run the test
testMapboxConsole().catch(console.error);
