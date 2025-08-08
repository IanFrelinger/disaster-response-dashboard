/**
 * Verify 3D Terrain Visualization
 * Check what should be visible in the 3D terrain
 */

import puppeteer from 'puppeteer';

async function verify3DVisualization() {
  console.log('🔍 Verifying 3D Terrain Visualization...');

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

    console.log('🌐 Navigating to Foundry 3D Demo...');
    await page.goto('http://localhost:3001/foundry-terrain', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait for 3D terrain to load
    console.log('⏳ Waiting for 3D terrain to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check what's visible in the 3D scene
    const sceneInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas found' };

      // Get canvas dimensions
      const rect = canvas.getBoundingClientRect();
      
      // Check if canvas has content
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Count non-transparent pixels
      let nonTransparentPixels = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) nonTransparentPixels++;
      }
      
      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        displayWidth: rect.width,
        displayHeight: rect.height,
        nonTransparentPixels,
        totalPixels: canvas.width * canvas.height,
        hasContent: nonTransparentPixels > 0
      };
    });

    console.log('📊 Canvas Information:');
    console.log('  Canvas size:', sceneInfo.canvasWidth, 'x', sceneInfo.canvasHeight);
    console.log('  Display size:', sceneInfo.displayWidth, 'x', sceneInfo.displayHeight);
    console.log('  Non-transparent pixels:', sceneInfo.nonTransparentPixels);
    console.log('  Total pixels:', sceneInfo.totalPixels);
    console.log('  Has content:', sceneInfo.hasContent);

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: '3d-terrain-verification.png', fullPage: true });

    // Check for specific elements
    const elements = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const controls = document.querySelectorAll('.absolute');
      const canvas = document.querySelector('canvas');
      
      return {
        buttons: buttons.length,
        controls: controls.length,
        hasCanvas: !!canvas,
        canvasVisible: canvas ? canvas.offsetWidth > 0 && canvas.offsetHeight > 0 : false
      };
    });

    console.log('📋 Page Elements:');
    console.log('  Buttons found:', elements.buttons);
    console.log('  Control elements:', elements.controls);
    console.log('  Has canvas:', elements.hasCanvas);
    console.log('  Canvas visible:', elements.canvasVisible);

    // Summary
    if (sceneInfo.hasContent && elements.canvasVisible) {
      console.log('\n✅ 3D Terrain is rendering correctly!');
      console.log('   You should see:');
      console.log('   - Dark blue background (scene background)');
      console.log('   - Green terrain surface (bright green for visibility)');
      console.log('   - Red cube floating above the terrain');
      console.log('   - Gray ground plane as backup');
      console.log('   - Interactive controls (buttons)');
    } else {
      console.log('\n⚠️ 3D Terrain may not be rendering properly');
      console.log('   Issues detected:');
      if (!sceneInfo.hasContent) console.log('   - Canvas has no content');
      if (!elements.canvasVisible) console.log('   - Canvas is not visible');
    }

    // Check console for any errors
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

verify3DVisualization();

