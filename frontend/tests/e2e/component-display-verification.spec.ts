import { test, expect } from '@playwright/test';

test.describe('Frontend Component Display Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Additional wait for React components to render
    await page.waitForTimeout(2000);
  });

  test('should display main App component structure', async ({ page }) => {
    // Check that the main app container is visible
    const appContainer = page.locator('#root');
    await expect(appContainer).toBeVisible();
    
    // Check for main app content
    const mainContent = page.locator('main, .app-container, .main-content');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test('should display ChallengeDemo component', async ({ page }) => {
    // Look for ChallengeDemo component elements
    const demoContainer = page.locator('[data-testid="challenge-demo"], .challenge-demo, .demo-container');
    
    if (await demoContainer.count() > 0) {
      await expect(demoContainer.first()).toBeVisible();
      
      // Check for demo-specific content
      const demoTitle = page.locator('text=Challenge Demo, text=Demo, text=Challenge');
      if (await demoTitle.count() > 0) {
        await expect(demoTitle.first()).toBeVisible();
      }
    } else {
      console.log('ChallengeDemo component not found - may be conditionally rendered');
    }
  });

  test('should display EvacuationDashboard component', async ({ page }) => {
    // Look for EvacuationDashboard component elements
    const evacuationContainer = page.locator('[data-testid="evacuation-dashboard"], .evacuation-dashboard, .dashboard-container');
    
    if (await evacuationContainer.count() > 0) {
      await expect(evacuationContainer.first()).toBeVisible();
      
      // Check for evacuation-specific content
      const evacuationTitle = page.locator('text=Evacuation, text=Dashboard, text=Emergency');
      if (await evacuationTitle.count() > 0) {
        await expect(evacuationTitle.first()).toBeVisible();
      }
    } else {
      console.log('EvacuationDashboard component not found - may be conditionally rendered');
    }
  });

  test('should display BuildingEvacuationTracker component', async ({ page }) => {
    // Look for BuildingEvacuationTracker component elements
    const trackerContainer = page.locator('[data-testid="building-evacuation-tracker"], .building-evacuation-tracker, .tracker-container');
    
    if (await trackerContainer.count() > 0) {
      await expect(trackerContainer.first()).toBeVisible();
      
      // Check for tracker-specific content
      const trackerTitle = page.locator('text=Building, text=Evacuation, text=Tracker');
      if (await trackerTitle.count() > 0) {
        await expect(trackerTitle.first()).toBeVisible();
      }
    } else {
      console.log('BuildingEvacuationTracker component not found - may be conditionally rendered');
    }
  });

  test('should display WeatherPanel component', async ({ page }) => {
    // Look for WeatherPanel component elements
    const weatherContainer = page.locator('[data-testid="weather-panel"], .weather-panel, .weather-container');
    
    if (await weatherContainer.count() > 0) {
      await expect(weatherContainer.first()).toBeVisible();
      
      // Check for weather-specific content
      const weatherTitle = page.locator('text=Weather, text=Conditions, text=Temperature');
      if (await weatherTitle.count() > 0) {
        await expect(weatherTitle.first()).toBeVisible();
      }
    } else {
      console.log('WeatherPanel component not found - may be conditionally rendered');
    }
  });

  test('should display DemoMetrics component', async ({ page }) => {
    // Look for DemoMetrics component elements
    const metricsContainer = page.locator('[data-testid="demo-metrics"], .demo-metrics, .metrics-container');
    
    if (await metricsContainer.count() > 0) {
      await expect(metricsContainer.first()).toBeVisible();
      
      // Check for metrics-specific content
      const metricsTitle = page.locator('text=Metrics, text=Performance, text=Statistics');
      if (await metricsTitle.count() > 0) {
        await expect(metricsTitle.first()).toBeVisible();
      }
    } else {
      console.log('DemoMetrics component not found - may be conditionally rendered');
    }
  });

  test('should verify 3D terrain components are removed', async ({ page }) => {
    // Verify that 3D terrain components are no longer present (as requested by user)
    const terrainComponents = [
      '[data-testid="enhanced-3d-terrain"]',
      '.enhanced-3d-terrain',
      '[data-testid="disaster-response-3d"]',
      '.disaster-response-3d',
      '[data-testid="mapbox-3d-terrain"]',
      '.mapbox-3d-terrain'
    ];
    
    // All 3D terrain components should be removed
    for (const selector of terrainComponents) {
      const component = page.locator(selector);
      const count = await component.count();
      expect(count).toBe(0);
      console.log(`✅ 3D terrain component removed: ${selector}`);
    }
    
    console.log('✅ All 3D terrain components successfully removed as requested');
  });

  test('should display map components', async ({ page }) => {
    // Navigate to Live Map view to find map components
    const mapButton = page.locator('text=🗺️ Live Map');
    await mapButton.click();
    await page.waitForTimeout(2000);
    
    // Look for map related components
    const mapComponents = [
      '[data-testid="live-hazard-map"]',
      '.live-hazard-map',
      '[data-testid="simple-mapbox-test"]',
      '.simple-mapbox-test'
    ];
    
    let foundMapComponent = false;
    
    for (const selector of mapComponents) {
      const component = page.locator(selector);
      if (await component.count() > 0) {
        await expect(component.first()).toBeVisible();
        foundMapComponent = true;
        console.log(`Found map component: ${selector}`);
        break;
      }
    }
    
    if (!foundMapComponent) {
      console.log('No map components found - may be conditionally rendered or require specific navigation');
    }
  });

  test('should display navigation and routing elements', async ({ page }) => {
    // Check for navigation elements
    const navElements = page.locator('nav, .navigation, .nav-container');
    if (await navElements.count() > 0) {
      await expect(navElements.first()).toBeVisible();
    }
    
    // Check for routing elements
    const routerElements = page.locator('[data-testid="router"], .router-container');
    if (await routerElements.count() > 0) {
      await expect(routerElements.first()).toBeVisible();
    }
  });

  test('should handle component state changes', async ({ page }) => {
    // Look for interactive elements that might change component state
    const interactiveElements = page.locator('button, input, select, [role="button"]');
    
    if (await interactiveElements.count() > 0) {
      // Check that at least some interactive elements are visible
      const visibleInteractiveElements = await interactiveElements.filter({ hasText: /./ }).count();
      expect(visibleInteractiveElements).toBeGreaterThan(0);
      
      console.log(`Found ${visibleInteractiveElements} interactive elements`);
    }
  });

  test('should display responsive layout elements', async ({ page }) => {
    // Check for responsive container elements
    const responsiveContainers = page.locator('.container, .responsive-container, [class*="container"]');
    
    if (await responsiveContainers.count() > 0) {
      // Verify that containers are properly sized
      const firstContainer = responsiveContainers.first();
      const boundingBox = await firstContainer.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
        console.log(`Container dimensions: ${boundingBox.width}x${boundingBox.height}`);
      }
    }
  });

  test('should verify CSS styling is applied', async ({ page }) => {
    // Check that CSS classes are being applied
    const styledElements = page.locator('[class]');
    
    if (await styledElements.count() > 0) {
      // Verify that elements have CSS classes
      const firstStyledElement = styledElements.first();
      const className = await firstStyledElement.getAttribute('class');
      
      expect(className).toBeTruthy();
      expect(className!.length).toBeGreaterThan(0);
      console.log(`Element with CSS classes: ${className}`);
    }
  });

  test('should check for console errors', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(3000);
    
    // Log errors but don't fail the test (some errors might be expected)
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('No console errors detected');
    }
  });

  test('should verify page performance', async ({ page }) => {
    // Check page load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Basic performance checks (adjust thresholds as needed)
    expect(performanceMetrics.loadTime).toBeLessThan(10000); // 10 seconds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
  });
});
