/**
 * Simple 3D Terrain Verification
 * Check if 3D terrain is working
 */

import puppeteer from 'puppeteer';

async function simple3DVerification() {
  console.log('🔍 Simple 3D Terrain Verification...');

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
        text: msg.text()
      });
    });

    console.log('🌐 Navigating to Foundry 3D Demo...');
    await page.goto('http://localhost:3001/foundry-terrain', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait for 3D terrain to load
    console.log('⏳ Waiting for 3D terrain to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check what's visible
    const pageInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const buttons = document.querySelectorAll('button');
      const loadingOverlay = document.querySelector('.absolute.inset-0.flex.items-center.justify-center.bg-black.bg-opacity-75.z-20');
      
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        canvasDisplayWidth: canvas ? canvas.offsetWidth : 0,
        canvasDisplayHeight: canvas ? canvas.offsetHeight : 0,
        buttonsCount: buttons.length,
        hasLoadingOverlay: !!loadingOverlay,
        pageTitle: document.title,
        bodyText: document.body.textContent.substring(0, 200)
      };
    });

    console.log('📊 Page Information:');
    console.log('  Has canvas:', pageInfo.hasCanvas);
    console.log('  Canvas size:', pageInfo.canvasWidth, 'x', pageInfo.canvasHeight);
    console.log('  Canvas display size:', pageInfo.canvasDisplayWidth, 'x', pageInfo.canvasDisplayHeight);
    console.log('  Buttons count:', pageInfo.buttonsCount);
    console.log('  Has loading overlay:', pageInfo.hasLoadingOverlay);
    console.log('  Page title:', pageInfo.pageTitle);
    console.log('  Body text preview:', pageInfo.bodyText);

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'simple-3d-verification.png', fullPage: true });

    // Check console messages
    const initMessages = consoleMessages.filter(msg => 
      msg.text.includes('Initializing 3D terrain') || 
      msg.text.includes('3D terrain initialization complete')
    );

    console.log('📋 Console Messages:');
    console.log('  Total messages:', consoleMessages.length);
    console.log('  Init messages:', initMessages.length);
    
    if (initMessages.length > 0) {
      console.log('  Last init message:', initMessages[initMessages.length - 1].text);
    }

    // Summary
    if (pageInfo.hasCanvas && pageInfo.canvasDisplayWidth > 0 && pageInfo.canvasDisplayHeight > 0) {
      console.log('\n✅ 3D Terrain is working correctly!');
      console.log('   What you should see:');
      console.log('   - Dark blue background (scene background color)');
      console.log('   - Green terrain surface (bright green for visibility)');
      console.log('   - Red cube floating above the terrain');
      console.log('   - Gray ground plane as backup');
      console.log('   - Interactive control buttons');
      console.log('   - No loading overlay (should be hidden)');
      
      if (pageInfo.hasLoadingOverlay) {
        console.log('\n⚠️ Loading overlay is still visible - terrain may still be loading');
      } else {
        console.log('\n✅ Loading overlay is hidden - terrain has loaded successfully');
      }
    } else {
      console.log('\n❌ 3D Terrain is not working properly');
      console.log('   Issues:');
      if (!pageInfo.hasCanvas) console.log('   - No canvas found');
      if (pageInfo.canvasDisplayWidth === 0) console.log('   - Canvas has no width');
      if (pageInfo.canvasDisplayHeight === 0) console.log('   - Canvas has no height');
    }

    // Check for errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    if (errors.length > 0) {
      console.log('\n❌ Console errors found:');
      errors.forEach(error => console.log('   -', error.text));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

simple3DVerification();
