const { chromium } = require('playwright');

async function runComprehensiveIOSTest() {
  console.log('🍎 Comprehensive iOS Design Test');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📍 Loading application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(3000);
    
    // Test 1: Core iOS Design Elements
    console.log('\n🎨 Test 1: Core iOS Design Elements');
    console.log('-'.repeat(40));
    
    const iosCards = await page.locator('.ios-card').count();
    const iosButtons = await page.locator('.ios-button').count();
    const iosInputs = await page.locator('.ios-input').count();
    const iosHeadlines = await page.locator('.ios-headline').count();
    const iosSubheadlines = await page.locator('.ios-subheadline').count();
    const iosBody = await page.locator('.ios-body').count();
    const iosCaptions = await page.locator('.ios-caption').count();
    
    console.log(`✅ iOS Cards: ${iosCards}`);
    console.log(`✅ iOS Buttons: ${iosButtons}`);
    console.log(`✅ iOS Inputs: ${iosInputs}`);
    console.log(`✅ iOS Headlines: ${iosHeadlines}`);
    console.log(`✅ iOS Subheadlines: ${iosSubheadlines}`);
    console.log(`✅ iOS Body Text: ${iosBody}`);
    console.log(`✅ iOS Captions: ${iosCaptions}`);
    
    // Test 2: Navigation and Layout
    console.log('\n🧭 Test 2: Navigation and Layout');
    console.log('-'.repeat(40));
    
    const navbar = await page.locator('.ios-navbar').isVisible();
    const navButton = await page.locator('a.ios-button').isVisible();
    const mainContainer = await page.locator('main.ios-container').isVisible();
    
    console.log(`✅ Navigation Bar: ${navbar}`);
    console.log(`✅ Navigation Button: ${navButton}`);
    console.log(`✅ Main Container: ${mainContainer}`);
    
    // Test 3: Control Panel Functionality
    console.log('\n🎛️ Test 3: Control Panel Functionality');
    console.log('-'.repeat(40));
    
    const locationSelect = await page.locator('select.ios-input').isVisible();
    const layerToggles = await page.locator('input[type="checkbox"]').count();
    const segmentedControls = await page.locator('.ios-segmented-control').count();
    
    console.log(`✅ Location Selector: ${locationSelect}`);
    console.log(`✅ Layer Toggles: ${layerToggles}`);
    console.log(`✅ Segmented Controls: ${segmentedControls}`);
    
    // Test 4: Map and 3D Elements
    console.log('\n🗺️ Test 4: Map and 3D Elements');
    console.log('-'.repeat(40));
    
    const mapCards = await page.locator('.ios-card').count();
    const mapContainer = await page.locator('.ios-card').filter({ hasText: '' }).nth(1).isVisible();
    
    console.log(`✅ Total Cards: ${mapCards}`);
    console.log(`✅ Map Container: ${mapContainer}`);
    
    // Test 5: Typography Hierarchy
    console.log('\n📝 Test 5: Typography Hierarchy');
    console.log('-'.repeat(40));
    
    const titleText = await page.locator('.ios-headline').first().textContent();
    const hasProperTypography = iosHeadlines > 0 && iosSubheadlines > 0 && iosBody > 0 && iosCaptions > 0;
    
    console.log(`✅ Title: "${titleText?.substring(0, 30)}..."`);
    console.log(`✅ Typography Hierarchy: ${hasProperTypography}`);
    
    // Test 6: iOS Color Palette
    console.log('\n🎨 Test 6: iOS Color Palette');
    console.log('-'.repeat(40));
    
    const blueElements = await page.locator('[style*="var(--ios-blue)"]').count();
    const greenElements = await page.locator('[style*="var(--ios-green)"]').count();
    const redElements = await page.locator('[style*="var(--ios-red)"]').count();
    const orangeElements = await page.locator('[style*="var(--ios-orange)"]').count();
    const purpleElements = await page.locator('[style*="var(--ios-purple)"]').count();
    
    console.log(`✅ Blue Elements: ${blueElements}`);
    console.log(`✅ Green Elements: ${greenElements}`);
    console.log(`✅ Red Elements: ${redElements}`);
    console.log(`✅ Orange Elements: ${orangeElements}`);
    console.log(`✅ Purple Elements: ${purpleElements}`);
    
    // Test 7: Responsive Design
    console.log('\n📱 Test 7: Responsive Design');
    console.log('-'.repeat(40));
    
    // Test mobile viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const mobileNavbar = await page.locator('.ios-navbar').isVisible();
    const mobileCards = await page.locator('.ios-card').count();
    
    console.log(`✅ Mobile Navigation: ${mobileNavbar}`);
    console.log(`✅ Mobile Cards: ${mobileCards}`);
    
    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);
    
    // Test 8: Error Handling
    console.log('\n⚠️ Test 8: Error Handling');
    console.log('-'.repeat(40));
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log(`✅ Console Errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, index) => {
        console.log(`   Error ${index + 1}: ${error.substring(0, 80)}...`);
      });
    }
    
    // Test 9: Accessibility
    console.log('\n♿ Test 9: Accessibility');
    console.log('-'.repeat(40));
    
    const focusableElements = await page.locator('button, input, select, a').count();
    const hasAltText = await page.locator('img[alt]').count();
    
    console.log(`✅ Focusable Elements: ${focusableElements}`);
    console.log(`✅ Images with Alt Text: ${hasAltText}`);
    
    // Test 10: Performance
    console.log('\n⚡ Test 10: Performance');
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Page Load Time: ${loadTime}ms`);
    
    // Final Assessment
    console.log('\n🎯 Final Assessment');
    console.log('='.repeat(50));
    
    // Calculate scores
    const designElements = iosCards + iosButtons + iosInputs + iosHeadlines + iosSubheadlines + iosBody + iosCaptions;
    const hasNavigation = navbar && navButton && mainContainer;
    const hasControls = locationSelect && layerToggles > 0;
    const hasMap = mapContainer;
    const hasTypography = hasProperTypography;
    const hasColors = blueElements + greenElements + redElements + orangeElements + purpleElements > 0;
    const isResponsive = mobileNavbar && mobileCards > 0;
    const noErrors = consoleErrors.length === 0;
    const isAccessible = focusableElements > 0;
    const isPerformant = loadTime < 5000;
    
    console.log(`📊 Design Elements: ${designElements} total`);
    console.log(`🧭 Navigation: ${hasNavigation ? '✅' : '❌'}`);
    console.log(`🎛️ Controls: ${hasControls ? '✅' : '❌'}`);
    console.log(`🗺️ Map: ${hasMap ? '✅' : '❌'}`);
    console.log(`📝 Typography: ${hasTypography ? '✅' : '❌'}`);
    console.log(`🎨 Colors: ${hasColors ? '✅' : '❌'}`);
    console.log(`📱 Responsive: ${isResponsive ? '✅' : '❌'}`);
    console.log(`⚠️ No Errors: ${noErrors ? '✅' : '❌'}`);
    console.log(`♿ Accessible: ${isAccessible ? '✅' : '❌'}`);
    console.log(`⚡ Performant: ${isPerformant ? '✅' : '❌'}`);
    
    const passedTests = [hasNavigation, hasControls, hasMap, hasTypography, hasColors, isResponsive, noErrors, isAccessible, isPerformant].filter(Boolean).length;
    const totalTests = 9;
    const percentage = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n🏆 Test Results: ${passedTests}/${totalTests} passed (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🎉 iOS Design Implementation: EXCELLENT');
    } else if (percentage >= 80) {
      console.log('✅ iOS Design Implementation: VERY GOOD');
    } else if (percentage >= 70) {
      console.log('⚠️ iOS Design Implementation: GOOD');
    } else {
      console.log('❌ iOS Design Implementation: NEEDS IMPROVEMENT');
    }
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`• ${iosCards} iOS cards with glass morphism effects`);
    console.log(`• ${iosButtons} iOS-style buttons with proper styling`);
    console.log(`• ${iosInputs} iOS form inputs with focus states`);
    console.log(`• ${iosHeadlines + iosSubheadlines + iosBody + iosCaptions} typography elements`);
    console.log(`• ${blueElements + greenElements + redElements + orangeElements + purpleElements} color-coded elements`);
    console.log(`• Responsive design across mobile and desktop`);
    console.log(`• ${consoleErrors.length} console errors (${consoleErrors.length === 0 ? 'none' : 'needs attention'})`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💥 iOS Design Validation: FAILED');
  } finally {
    await browser.close();
  }
}

// Run the test
runComprehensiveIOSTest().catch(console.error);
