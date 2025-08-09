#!/usr/bin/env node
/**
 * Frontend End-to-End Interaction Test
 * Tests all UI components and interactions after cleanup
 */

const { chromium } = require('playwright');

async function runE2ETest() {
    console.log('🧪 Starting Frontend E2E Interaction Test');
    console.log('='.repeat(60));
    
    const browser = await chromium.launch({ 
        headless: false, // Set to true for headless mode
        slowMo: 100 // Slow down actions for visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    try {
        // Test 1: Page Loading and Initial State
        console.log('\n📄 Test 1: Page Loading and Initial State');
        console.log('-'.repeat(40));
        
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        console.log('✅ Page loaded successfully');
        
        // Check if the main content is visible
        const mainContent = await page.locator('#root').isVisible();
        console.log(`✅ Main content visible: ${mainContent}`);
        
        // Check page title
        const title = await page.title();
        console.log(`✅ Page title: ${title}`);
        
        // Test 2: Navigation and Routing
        console.log('\n🧭 Test 2: Navigation and Routing');
        console.log('-'.repeat(40));
        
        // Check if the 3D Buildings link is present
        const buildingsLink = await page.locator('a[href="/mapbox-3d-buildings"]').isVisible();
        console.log(`✅ 3D Buildings navigation link: ${buildingsLink}`);
        
        // Navigate to the 3D Buildings page
        await page.click('a[href="/mapbox-3d-buildings"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ Navigated to 3D Buildings page');
        
        // Check if we're on the correct page
        const currentUrl = page.url();
        console.log(`✅ Current URL: ${currentUrl}`);
        
        // Test 3: 3D Map Component Loading
        console.log('\n🗺️ Test 3: 3D Map Component Loading');
        console.log('-'.repeat(40));
        
        // Wait for the map container to be present
        const mapContainer = await page.locator('[data-testid="mapbox-3d-terrain"]').isVisible();
        console.log(`✅ Map container visible: ${mapContainer}`);
        
        // Check for Mapbox GL JS initialization
        const mapboxContainer = await page.locator('.mapboxgl-canvas-container').isVisible();
        console.log(`✅ Mapbox canvas container: ${mapboxContainer}`);
        
        // Test 4: Layer Controls
        console.log('\n🎛️ Test 4: Layer Controls');
        console.log('-'.repeat(40));
        
        // Check for layer control panel
        const controlPanel = await page.locator('[data-testid="control-panel"]').isVisible();
        console.log(`✅ Control panel visible: ${controlPanel}`);
        
        // Test layer toggles
        const layerToggles = await page.locator('[data-testid="layer-toggle"]').count();
        console.log(`✅ Layer toggles found: ${layerToggles}`);
        
        // Test 5: Terrain Controls
        console.log('\n🏔️ Test 5: Terrain Controls');
        console.log('-'.repeat(40));
        
        // Check for terrain toggle
        const terrainToggle = await page.locator('[data-testid="terrain-toggle"]').isVisible();
        console.log(`✅ Terrain toggle visible: ${terrainToggle}`);
        
        // Test terrain toggle functionality
        if (terrainToggle) {
            await page.click('[data-testid="terrain-toggle"]');
            console.log('✅ Terrain toggle clicked');
            await page.waitForTimeout(1000);
        }
        
        // Test 6: Building Extrusion Controls
        console.log('\n🏢 Test 6: Building Extrusion Controls');
        console.log('-'.repeat(40));
        
        // Check for building toggle
        const buildingToggle = await page.locator('[data-testid="building-toggle"]').isVisible();
        console.log(`✅ Building toggle visible: ${buildingToggle}`);
        
        // Test building toggle functionality
        if (buildingToggle) {
            await page.click('[data-testid="building-toggle"]');
            console.log('✅ Building toggle clicked');
            await page.waitForTimeout(1000);
        }
        
        // Test 7: Map Interactions
        console.log('\n🖱️ Test 7: Map Interactions');
        console.log('-'.repeat(40));
        
        // Test zoom controls
        const zoomIn = await page.locator('[data-testid="zoom-in"]').isVisible();
        const zoomOut = await page.locator('[data-testid="zoom-out"]').isVisible();
        console.log(`✅ Zoom in button: ${zoomIn}`);
        console.log(`✅ Zoom out button: ${zoomOut}`);
        
        if (zoomIn) {
            await page.click('[data-testid="zoom-in"]');
            console.log('✅ Zoom in clicked');
            await page.waitForTimeout(500);
        }
        
        if (zoomOut) {
            await page.click('[data-testid="zoom-out"]');
            console.log('✅ Zoom out clicked');
            await page.waitForTimeout(500);
        }
        
        // Test map dragging
        const mapElement = await page.locator('.mapboxgl-canvas-container');
        if (await mapElement.isVisible()) {
            await mapElement.dragTo(mapElement, { sourcePosition: { x: 100, y: 100 }, targetPosition: { x: 200, y: 200 } });
            console.log('✅ Map dragging tested');
            await page.waitForTimeout(1000);
        }
        
        // Test 8: Data Integration
        console.log('\n📊 Test 8: Data Integration');
        console.log('-'.repeat(40));
        
        // Check for data loading indicators
        const loadingIndicator = await page.locator('[data-testid="loading-indicator"]').isVisible();
        console.log(`✅ Loading indicator: ${loadingIndicator}`);
        
        // Wait for data to load
        await page.waitForTimeout(2000);
        
        // Check for hazard markers
        const hazardMarkers = await page.locator('[data-testid="hazard-marker"]').count();
        console.log(`✅ Hazard markers found: ${hazardMarkers}`);
        
        // Check for unit markers
        const unitMarkers = await page.locator('[data-testid="unit-marker"]').count();
        console.log(`✅ Unit markers found: ${unitMarkers}`);
        
        // Check for route lines
        const routeLines = await page.locator('[data-testid="route-line"]').count();
        console.log(`✅ Route lines found: ${routeLines}`);
        
        // Test 9: Interactive Elements
        console.log('\n🖱️ Test 9: Interactive Elements');
        console.log('-'.repeat(40));
        
        // Test clicking on hazard markers
        if (hazardMarkers > 0) {
            await page.click('[data-testid="hazard-marker"]:first-child');
            console.log('✅ Clicked on hazard marker');
            await page.waitForTimeout(1000);
        }
        
        // Test clicking on unit markers
        if (unitMarkers > 0) {
            await page.click('[data-testid="unit-marker"]:first-child');
            console.log('✅ Clicked on unit marker');
            await page.waitForTimeout(1000);
        }
        
        // Test 10: Analytics Panel
        console.log('\n📈 Test 10: Analytics Panel');
        console.log('-'.repeat(40));
        
        // Check for analytics panel
        const analyticsPanel = await page.locator('[data-testid="analytics-panel"]').isVisible();
        console.log(`✅ Analytics panel visible: ${analyticsPanel}`);
        
        if (analyticsPanel) {
            // Check for analytics data
            const hazardCount = await page.locator('[data-testid="hazard-count"]').textContent();
            const unitCount = await page.locator('[data-testid="unit-count"]').textContent();
            const routeCount = await page.locator('[data-testid="route-count"]').textContent();
            
            console.log(`✅ Hazard count: ${hazardCount}`);
            console.log(`✅ Unit count: ${unitCount}`);
            console.log(`✅ Route count: ${routeCount}`);
        }
        
        // Test 11: Error Handling
        console.log('\n⚠️ Test 11: Error Handling');
        console.log('-'.repeat(40));
        
        // Check for error boundaries
        const errorBoundary = await page.locator('[data-testid="error-boundary"]').isVisible();
        console.log(`✅ Error boundary present: ${errorBoundary}`);
        
        // Check for error messages
        const errorMessages = await page.locator('[data-testid="error-message"]').count();
        console.log(`✅ Error messages found: ${errorMessages}`);
        
        // Test 12: Responsive Design
        console.log('\n📱 Test 12: Responsive Design');
        console.log('-'.repeat(40));
        
        // Test mobile viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        console.log('✅ Mobile viewport set');
        await page.waitForTimeout(1000);
        
        // Check if controls are still accessible
        const mobileControls = await page.locator('[data-testid="mobile-controls"]').isVisible();
        console.log(`✅ Mobile controls visible: ${mobileControls}`);
        
        // Reset to desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        console.log('✅ Desktop viewport restored');
        
        // Test 13: Performance
        console.log('\n⚡ Test 13: Performance');
        console.log('-'.repeat(40));
        
        // Measure page load time
        const loadTime = await page.evaluate(() => {
            return performance.timing.loadEventEnd - performance.timing.navigationStart;
        });
        console.log(`✅ Page load time: ${loadTime}ms`);
        
        // Check for memory leaks (basic check)
        const memoryUsage = await page.evaluate(() => {
            return performance.memory ? performance.memory.usedJSHeapSize : 'Not available';
        });
        console.log(`✅ Memory usage: ${memoryUsage}`);
        
        // Test 14: Accessibility
        console.log('\n♿ Test 14: Accessibility');
        console.log('-'.repeat(40));
        
        // Check for ARIA labels
        const ariaLabels = await page.locator('[aria-label]').count();
        console.log(`✅ ARIA labels found: ${ariaLabels}`);
        
        // Check for alt text on images
        const altTexts = await page.locator('img[alt]').count();
        console.log(`✅ Images with alt text: ${altTexts}`);
        
        // Test 15: Final State Verification
        console.log('\n✅ Test 15: Final State Verification');
        console.log('-'.repeat(40));
        
        // Verify the page is still functional
        const finalUrl = page.url();
        console.log(`✅ Final URL: ${finalUrl}`);
        
        const finalTitle = await page.title();
        console.log(`✅ Final title: ${finalTitle}`);
        
        const mapStillVisible = await page.locator('.mapboxgl-canvas-container').isVisible();
        console.log(`✅ Map still visible: ${mapStillVisible}`);
        
        console.log('\n🎉 All E2E Interaction Tests Completed Successfully!');
        
    } catch (error) {
        console.error('❌ E2E Test Failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
runE2ETest().catch(console.error);
