import { test, expect } from '@playwright/test';

test.describe('Building Status and UI Overlap Check', () => {
  test('should check building loading status and detect UI overlaps', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Click the map button to switch to map view
    const mapButton = page.locator('button:has-text("🗺️ Live Map")');
    await expect(mapButton).toBeVisible();
    await mapButton.click();
    
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    console.log('=== BUILDING STATUS AND OVERLAP CHECK ===');
    
    // Check building loading status
    const buildingStatusText = page.locator('text=Buildings:');
    const buildingStatusExists = await buildingStatusText.count();
    console.log('Building status text found:', buildingStatusExists);
    
    if (buildingStatusExists > 0) {
      // Find the building status container
      const buildingStatusContainer = page.locator('text=Buildings:').first().locator('..').locator('..');
      const buildingStatusHTML = await buildingStatusContainer.innerHTML();
      console.log('Building status container HTML:', buildingStatusHTML);
      
      // Check if it shows "Loading..." or actual status
      const loadingText = page.locator('text=Loading...');
      const loadingCount = await loadingText.count();
      console.log('Loading text found:', loadingCount);
      
      if (loadingCount > 0) {
        console.log('⚠️ Buildings are still showing as loading!');
      } else {
        console.log('✅ Buildings appear to be loaded');
      }
    }
    
    // Check for any "Loading 3D Buildings..." text
    const loading3DBuildings = page.locator('text=Loading 3D Buildings');
    const loading3DCount = await loading3DBuildings.count();
    console.log('Loading 3D Buildings text found:', loading3DCount);
    
    // Check for any "Loading..." text in status indicators
    const statusLoadingText = page.locator('text=Loading');
    const statusLoadingCount = await statusLoadingText.count();
    console.log('Total Loading text found:', statusLoadingCount);
    
    // Now check for UI overlaps by examining element positions
    console.log('\n=== UI OVERLAP DETECTION ===');
    
    // Get all major UI elements and check their positions
    const analyticsPanel = page.locator('.analytics-panel');
    const statusIndicators = page.locator('[style*="position: absolute"][style*="top: var(--ios-spacing-md)"][style*="right: var(--ios-spacing-md)"]');
    const mapContainer = page.locator('.simple-mapbox-test');
    
    // Check analytics panel position
    if (await analyticsPanel.count() > 0) {
      const analyticsRect = await analyticsPanel.boundingBox();
      if (analyticsRect) {
        console.log('Analytics Panel position:', analyticsRect);
      }
    }
    
    // Check status indicators position
    if (await statusIndicators.count() > 0) {
      const statusRect = await statusIndicators.boundingBox();
      if (statusRect) {
        console.log('Status Indicators position:', statusRect);
      }
    }
    
    // Check map container position
    if (await mapContainer.count() > 0) {
      const mapRect = await mapContainer.boundingBox();
      if (mapRect) {
        console.log('Map Container position:', mapRect);
      }
    }
    
    // Check for overlapping elements by examining all positioned elements
    const allPositionedElements = page.locator('[style*="position: absolute"], [style*="position: fixed"]');
    const positionedCount = await allPositionedElements.count();
    console.log('Total positioned elements found:', positionedCount);
    
    // Get positions of all positioned elements
    const elementPositions: Array<{element: any, rect: any, className: string}> = [];
    
    for (let i = 0; i < positionedCount; i++) {
      const element = allPositionedElements.nth(i);
      const rect = await element.boundingBox();
      const className = await element.getAttribute('class') || 'no-class';
      
      if (rect) {
        elementPositions.push({ element, rect, className });
        console.log(`Element ${i} (${className}):`, rect);
      }
    }
    
    // Check for overlaps
    console.log('\n=== OVERLAP ANALYSIS ===');
    let overlapCount = 0;
    
    for (let i = 0; i < elementPositions.length; i++) {
      for (let j = i + 1; j < elementPositions.length; j++) {
        const elem1 = elementPositions[i];
        const elem2 = elementPositions[j];
        
        // Check if rectangles overlap
        const overlap = !(elem1.rect.x + elem1.rect.width <= elem2.rect.x ||
                         elem2.rect.x + elem2.rect.width <= elem1.rect.x ||
                         elem1.rect.y + elem1.rect.height <= elem2.rect.y ||
                         elem2.rect.y + elem2.rect.height <= elem1.rect.y);
        
        if (overlap) {
          overlapCount++;
          console.log(`⚠️ OVERLAP DETECTED between:`);
          console.log(`   Element 1 (${elem1.className}):`, elem1.rect);
          console.log(`   Element 2 (${elem2.className}):`, elem2.rect);
          
          // Calculate overlap area
          const overlapX = Math.max(elem1.rect.x, elem2.rect.x);
          const overlapY = Math.max(elem1.rect.y, elem2.rect.y);
          const overlapWidth = Math.min(elem1.rect.x + elem1.rect.width, elem2.rect.x + elem2.rect.width) - overlapX;
          const overlapHeight = Math.min(elem1.rect.y + elem1.rect.height, elem2.rect.y + elem2.rect.height) - overlapY;
          
          if (overlapWidth > 0 && overlapHeight > 0) {
            console.log(`   Overlap area: ${overlapWidth.toFixed(0)}x${overlapHeight.toFixed(0)} pixels`);
          }
        }
      }
    }
    
    if (overlapCount === 0) {
      console.log('✅ No UI overlaps detected!');
    } else {
      console.log(`⚠️ Total overlaps detected: ${overlapCount}`);
    }
    
    // Check for any error messages or warnings
    console.log('\n=== ERROR AND WARNING CHECK ===');
    const errorElements = page.locator('[class*="error"], [style*="color: red"], [style*="color: #FF3B30"]');
    const errorCount = await errorElements.count();
    console.log('Error elements found:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorElement = errorElements.nth(i);
        const errorText = await errorElement.textContent();
        console.log(`Error ${i}:`, errorText);
      }
    }
    
    // Take a screenshot for analysis
    await page.screenshot({ path: 'building-status-overlap-check.png', fullPage: true });
    
    console.log('\n=== CHECK COMPLETE ===');
    console.log(`Building loading status: ${statusLoadingCount > 0 ? 'Still loading' : 'Loaded'}`);
    console.log(`UI overlaps detected: ${overlapCount}`);
    console.log(`Total positioned elements: ${positionedCount}`);
  });
});
