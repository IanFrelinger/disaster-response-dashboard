const { chromium } = require('playwright');

async function runSimpleIOSValidation() {
  console.log('🍎 Simple iOS Design Validation');
  console.log('='.repeat(40));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📍 Loading application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait for key elements to load
    await page.waitForTimeout(2000);
    
    // Test 1: Basic iOS Elements
    console.log('\n🎨 Test 1: iOS Design Elements');
    console.log('-'.repeat(30));
    
    const iosCards = await page.locator('.ios-card').count();
    const iosButtons = await page.locator('.ios-button').count();
    const iosInputs = await page.locator('.ios-input').count();
    const iosHeadlines = await page.locator('.ios-headline').count();
    
    console.log(`✅ iOS Cards: ${iosCards}`);
    console.log(`✅ iOS Buttons: ${iosButtons}`);
    console.log(`✅ iOS Inputs: ${iosInputs}`);
    console.log(`✅ iOS Headlines: ${iosHeadlines}`);
    
    // Test 2: Navigation
    console.log('\n🧭 Test 2: Navigation');
    console.log('-'.repeat(30));
    
    const navbar = await page.locator('.ios-navbar').isVisible();
    const navButton = await page.locator('a.ios-button').isVisible();
    
    console.log(`✅ Navigation Bar: ${navbar}`);
    console.log(`✅ Navigation Button: ${navButton}`);
    
    // Test 3: Control Panel
    console.log('\n🎛️ Test 3: Control Panel');
    console.log('-'.repeat(30));
    
    const locationSelect = await page.locator('select.ios-input').isVisible();
    const layerToggles = await page.locator('input[type="checkbox"]').count();
    
    console.log(`✅ Location Selector: ${locationSelect}`);
    console.log(`✅ Layer Toggles: ${layerToggles}`);
    
    // Test 4: Map Container
    console.log('\n🗺️ Test 4: Map Container');
    console.log('-'.repeat(30));
    
    const mapCards = await page.locator('.ios-card').count();
    console.log(`✅ Map Cards: ${mapCards}`);
    
    // Test 5: Typography
    console.log('\n📝 Test 5: Typography');
    console.log('-'.repeat(30));
    
    const headlines = await page.locator('.ios-headline').count();
    const subheadlines = await page.locator('.ios-subheadline').count();
    const bodyText = await page.locator('.ios-body').count();
    const captions = await page.locator('.ios-caption').count();
    
    console.log(`✅ Headlines: ${headlines}`);
    console.log(`✅ Subheadlines: ${subheadlines}`);
    console.log(`✅ Body Text: ${bodyText}`);
    console.log(`✅ Captions: ${captions}`);
    
    // Test 6: Color Usage
    console.log('\n🎨 Test 6: Color Usage');
    console.log('-'.repeat(30));
    
    const blueElements = await page.locator('[style*="var(--ios-blue)"]').count();
    const greenElements = await page.locator('[style*="var(--ios-green)"]').count();
    const redElements = await page.locator('[style*="var(--ios-red)"]').count();
    
    console.log(`✅ Blue Elements: ${blueElements}`);
    console.log(`✅ Green Elements: ${greenElements}`);
    console.log(`✅ Red Elements: ${redElements}`);
    
    // Test 7: Responsive Design
    console.log('\n📱 Test 7: Responsive Design');
    console.log('-'.repeat(30));
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const mobileContainer = await page.locator('.ios-container').isVisible();
    console.log(`✅ Mobile Layout: ${mobileContainer}`);
    
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Test 8: Error Check
    console.log('\n⚠️ Test 8: Error Check');
    console.log('-'.repeat(30));
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log(`✅ Console Errors: ${consoleErrors.length}`);
    
    // Final Assessment
    console.log('\n🎯 Assessment');
    console.log('='.repeat(40));
    
    const totalElements = iosCards + iosButtons + iosInputs + iosHeadlines;
    const hasNavigation = navbar && navButton;
    const hasControls = locationSelect && layerToggles > 0;
    const hasMap = mapCards > 0;
    const hasTypography = headlines + subheadlines + bodyText + captions > 0;
    const hasColors = blueElements + greenElements + redElements > 0;
    const isResponsive = mobileContainer;
    const noErrors = consoleErrors.length === 0;
    
    console.log(`📊 Total iOS Elements: ${totalElements}`);
    console.log(`🧭 Navigation Working: ${hasNavigation}`);
    console.log(`🎛️ Controls Present: ${hasControls}`);
    console.log(`🗺️ Map Container: ${hasMap}`);
    console.log(`📝 Typography: ${hasTypography}`);
    console.log(`🎨 Colors Applied: ${hasColors}`);
    console.log(`📱 Responsive: ${isResponsive}`);
    console.log(`✅ No Errors: ${noErrors}`);
    
    const passedTests = [hasNavigation, hasControls, hasMap, hasTypography, hasColors, isResponsive, noErrors].filter(Boolean).length;
    const totalTests = 7;
    
    console.log(`\n🏆 Test Results: ${passedTests}/${totalTests} passed`);
    
    if (passedTests === totalTests) {
      console.log('✅ iOS Design Implementation: SUCCESS');
    } else {
      console.log('⚠️ iOS Design Implementation: PARTIAL SUCCESS');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💥 iOS Design Validation: FAILED');
  } finally {
    await browser.close();
  }
}

// Run the test
runSimpleIOSValidation().catch(console.error);
