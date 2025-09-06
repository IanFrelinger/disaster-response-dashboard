import { test, expect } from '@playwright/test';

test.describe('Basic Page Load Test on Port 3001', () => {
  test('check what is actually being rendered on the containerized dev server', async ({ page }) => {
    // Navigate to the containerized development server on port 3001
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    console.log('Page loaded');
    
    // Get the page title
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Get the page content
    const pageContent = await page.content();
    console.log(`Page content length: ${pageContent.length} characters`);
    
    // Look for any buttons on the page
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`Found ${buttonCount} buttons on the page`);
    
    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        const buttonVisible = await button.isVisible();
        console.log(`Button ${i + 1}: "${buttonText}" (visible: ${buttonVisible})`);
      }
    }
    
    // Look for any headings
    const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await allHeadings.count();
    console.log(`Found ${headingCount} headings on the page`);
    
    if (headingCount > 0) {
      for (let i = 0; i < headingCount; i++) {
        const heading = allHeadings.nth(i);
        const headingText = await heading.textContent();
        const headingVisible = await heading.isVisible();
        console.log(`Heading ${i + 1}: "${headingText}" (visible: ${headingVisible})`);
      }
    }
    
    // Look for any divs with specific classes
    const iosCardDivs = page.locator('.ios-card');
    const iosCardCount = await iosCardDivs.count();
    console.log(`Found ${iosCardCount} divs with ios-card class`);
    
    const layerToggleDivs = page.locator('.layer-toggle-panel');
    const layerToggleCount = await layerToggleDivs.count();
    console.log(`Found ${layerToggleCount} divs with layer-toggle-panel class`);
    
    // Look for any text containing "Test" or "Panel"
    const testTextElements = page.locator('*:has-text("Test")');
    const testTextCount = await testTextElements.count();
    console.log(`Found ${testTextCount} elements containing "Test" text`);
    
    const panelTextElements = page.locator('*:has-text("Panel")');
    const panelTextCount = await panelTextElements.count();
    console.log(`Found ${panelTextCount} elements containing "Panel" text`);
    
    // Look for any text containing "Map" or "Layers"
    const mapTextElements = page.locator('*:has-text("Map")');
    const mapTextCount = await mapTextElements.count();
    console.log(`Found ${mapTextCount} elements containing "Map" text`);
    
    const layersTextElements = page.locator('*:has-text("Layers")');
    const layersTextCount = await layersTextElements.count();
    console.log(`Found ${layersTextCount} elements containing "Layers" text`);
    
    // Check for any error messages or build errors
    const errorElements = page.locator('*:has-text("error"), *:has-text("Error"), *:has-text("ERROR")');
    const errorCount = await errorElements.count();
    console.log(`Found ${errorCount} elements containing error text`);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorElement = errorElements.nth(i);
        const errorText = await errorElement.textContent();
        console.log(`Error ${i + 1}: "${errorText}"`);
      }
    }
    
    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    // Wait a bit for any console errors to appear
    await page.waitForTimeout(2000);
    
    console.log(`Total console errors: ${consoleErrors.length}`);
    
    // The test should pass if we can at least see some content
    expect(pageContent.length).toBeGreaterThan(100);
  });
});
