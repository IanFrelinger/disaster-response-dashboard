/**
 * Test 3D Terrain Loading Fix
 * Check if the loading message disappears and 3D terrain loads properly
 */

import puppeteer from 'puppeteer';

async function test3DLoading() {
  console.log('🔍 Testing 3D Terrain Loading Fix...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    console.log('🌐 Navigating to Foundry 3D Demo...');
    await page.goto('http://localhost:3001/foundry-terrain', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait for initial load
    console.log('⏳ Waiting for initial load...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if loading overlay is present
    const loadingOverlay = await page.evaluate(() => {
      const overlay = document.querySelector('.absolute.inset-0.flex.items-center.justify-center.bg-black.bg-opacity-75.z-20');
      return overlay ? overlay.textContent : null;
    });

    console.log('📋 Loading overlay content:', loadingOverlay);

    // Wait a bit more to see if loading completes
    console.log('⏳ Waiting for loading to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check again if loading overlay is still present
    const loadingOverlayAfter = await page.evaluate(() => {
      const overlay = document.querySelector('.absolute.inset-0.flex.items-center.justify-center.bg-black.bg-opacity-75.z-20');
      return overlay ? overlay.textContent : null;
    });

    console.log('📋 Loading overlay after wait:', loadingOverlayAfter);

    // Check for 3D canvas
    const has3DCanvas = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas ? true : false;
    });

    console.log('🎨 3D Canvas found:', has3DCanvas);

    // Check for any error messages
    const errorElements = await page.evaluate(() => {
      const errors = document.querySelectorAll('.text-red-600, .text-red-500, [class*="error"]');
      return Array.from(errors).map(el => el.textContent);
    });

    console.log('❌ Error elements found:', errorElements);

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: '3d-terrain-test.png', fullPage: true });

    // Check console messages
    console.log('📋 Console messages:');
    consoleMessages.forEach(msg => {
      console.log(`  ${msg.type.toUpperCase()}: ${msg.text}`);
    });

    // Check for errors
    console.log('❌ Page errors:');
    pageErrors.forEach(error => {
      console.log(`  ERROR: ${error}`);
    });

    // Summary
    if (loadingOverlayAfter) {
      console.log('\n⚠️ Loading overlay is still present - 3D terrain may not be loading properly');
    } else if (has3DCanvas) {
      console.log('\n✅ Loading completed successfully - 3D terrain is working!');
    } else {
      console.log('\n❓ Loading overlay disappeared but no 3D canvas found');
    }

    if (pageErrors.length > 0) {
      console.log('\n🚨 Found errors that may be causing issues:');
      pageErrors.forEach(error => console.log(`  - ${error}`));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

test3DLoading();

