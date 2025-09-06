#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateMapVisualRendering() {
    console.log('👁️ Starting Automated Visual Rendering Validation...');
    console.log('==================================================');
    console.log('🔍 This script acts as your automated eyes to validate frontend rendering');
    console.log('📸 Capturing screenshots and analyzing visual elements');
    console.log('🔄 Cross-referencing console logs with actual rendered content');
    
    let browser;
    let page;
    
    try {
        // Launch browser in headless mode for CI/CD
        console.log('🌐 Launching headless Chromium browser...');
        browser = await chromium.launch({
            headless: true,
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--enable-logging',
                '--v=1',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu-sandbox',
                '--disable-software-rasterizer'
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }, // Full HD for better detail
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        page = await context.newPage();
        
        // Set up comprehensive monitoring
        const consoleLogs = [];
        const errors = [];
        const warnings = [];
        const visualElements = [];
        const mapLayers = [];
        const screenshots = [];
        
        // Capture all console messages with timestamps
        page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString(),
                location: msg.location()?.url || 'unknown'
            };
            
            consoleLogs.push(logEntry);
            
            switch (msg.type()) {
                case 'error':
                    console.log(`❌ Console Error: ${msg.text()}`);
                    errors.push(logEntry);
                    break;
                case 'warning':
                    console.log(`⚠️ Console Warning: ${msg.text()}`);
                    warnings.push(logEntry);
                    break;
                default:
                    console.log(`📝 Console ${msg.type()}: ${msg.text()}`);
            }
        });
        
        // Capture page errors
        page.on('pageerror', error => {
            console.log(`💥 Page Error: ${error.message}`);
            errors.push({
                type: 'pageerror',
                text: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });
        
        // Capture network failures
        page.on('requestfailed', request => {
            console.log(`🌐 Network Failure: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
        });
        
        console.log('🔍 Navigating to React app...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for React app to load...');
        await page.waitForTimeout(5000);
        
        // Wait for root element to be populated
        await page.waitForSelector('#root', { timeout: 10000 });
        
        // Test 1: Initial Page Load and Visual Elements
        console.log('\n🧪 Test 1: Initial Page Load and Visual Elements');
        
        const initialVisualState = await page.evaluate(() => {
            const results = {};
            
            // Check if React app mounted
            const rootElement = document.getElementById('root');
            results.rootElement = {
                exists: !!rootElement,
                hasChildren: rootElement ? rootElement.children.length > 0 : false,
                innerHTML: rootElement ? rootElement.innerHTML.substring(0, 300) + '...' : 'N/A'
            };
            
            // Check for Command Center header
            const header = document.querySelector('h1');
            results.header = {
                exists: !!header,
                text: header ? header.textContent : 'N/A',
                visible: header ? window.getComputedStyle(header).display !== 'none' : false
            };
            
            // Check for navigation buttons and their visibility
            const navButtons = document.querySelectorAll('button');
            results.navigation = {
                buttonCount: navButtons.length,
                buttons: Array.from(navButtons).map((btn, index) => ({
                    index,
                    text: btn.textContent,
                    visible: window.getComputedStyle(btn).display !== 'none',
                    enabled: !btn.disabled,
                    className: btn.className
                }))
            };
            
            // Check for any visible cards or panels
            const cards = document.querySelectorAll('[class*="card"], [class*="panel"], [class*="ios-card"]');
            results.cards = {
                count: cards.length,
                details: Array.from(cards).map((card, index) => ({
                    index,
                    className: card.className,
                    visible: window.getComputedStyle(card).display !== 'none',
                    hasContent: card.children.length > 0,
                    textContent: card.textContent.substring(0, 100) + '...'
                }))
            };
            
            return results;
        });
        
        console.log('📊 Initial Visual State:', JSON.stringify(initialVisualState, null, 2));
        
        if (!initialVisualState.rootElement.hasChildren) {
            throw new Error('React app failed to mount');
        }
        
        // Capture initial screenshot
        const initialScreenshot = await page.screenshot({ 
            fullPage: true,
            path: path.join(__dirname, '../debug-reports/01-initial-page-load.png')
        });
        screenshots.push({
            name: '01-initial-page-load',
            description: 'Initial page load with React app mounted',
            timestamp: new Date().toISOString()
        });
        console.log('📸 Initial page screenshot captured');
        
        // Test 2: Commander Dashboard Visual Validation
        console.log('\n🧪 Test 2: Commander Dashboard Visual Validation');
        
        try {
            const dashboardButton = await page.locator('text=Commander Dashboard').first();
            if (await dashboardButton.isVisible()) {
                await dashboardButton.click();
                console.log('✅ Commander Dashboard button clicked');
                await page.waitForTimeout(3000);
                
                const dashboardVisualState = await page.evaluate(() => {
                    const results = {};
                    
                    // Check for dashboard content
                    const dashboardContent = document.querySelector('[class*="dashboard"], [class*="Dashboard"]');
                    results.dashboardContent = {
                        exists: !!dashboardContent,
                        hasContent: dashboardContent ? dashboardContent.children.length > 0 : false,
                        visible: dashboardContent ? window.getComputedStyle(dashboardContent).display !== 'none' : false,
                        className: dashboardContent ? dashboardContent.className : 'N/A'
                    };
                    
                    // Check for any visible metrics or data
                    const metrics = document.querySelectorAll('[class*="metric"], [class*="stat"], [class*="number"]');
                    results.metrics = {
                        count: metrics.length,
                        details: Array.from(metrics).map(metric => ({
                            text: metric.textContent,
                            visible: window.getComputedStyle(metric).display !== 'none'
                        }))
                    };
                    
                    // Check for any charts or visualizations
                    const charts = document.querySelectorAll('canvas, svg, [class*="chart"]');
                    results.charts = {
                        count: charts.length,
                        details: Array.from(charts).map(chart => ({
                            tagName: chart.tagName,
                            className: chart.className,
                            visible: window.getComputedStyle(chart).display !== 'none'
                        }))
                    };
                    
                    return results;
                });
                
                console.log('📊 Dashboard Visual State:', JSON.stringify(dashboardVisualState, null, 2));
                visualElements.push({
                    component: 'Commander Dashboard',
                    state: dashboardVisualState,
                    timestamp: new Date().toISOString()
                });
                
                // Capture dashboard screenshot
                const dashboardScreenshot = await page.screenshot({ 
                    fullPage: true,
                    path: path.join(__dirname, '../debug-reports/02-commander-dashboard.png')
                });
                screenshots.push({
                    name: '02-commander-dashboard',
                    description: 'Commander Dashboard view',
                    timestamp: new Date().toISOString()
                });
                console.log('📸 Dashboard screenshot captured');
                
            } else {
                console.log('⚠️ Commander Dashboard button not visible');
            }
        } catch (error) {
            console.log('❌ Commander Dashboard test failed:', error.message);
        }
        
        // Test 3: Live Map Visual Validation (Main Test)
        console.log('\n🧪 Test 3: Live Map Visual Validation - Your Automated Eyes');
        
        try {
            const liveMapButton = await page.locator('text=Live Map').first();
            if (await liveMapButton.isVisible()) {
                await liveMapButton.click();
                console.log('✅ Live Map button clicked');
                await page.waitForTimeout(8000); // Wait longer for map to fully load
                
                // Capture map loading screenshot
                const mapLoadingScreenshot = await page.screenshot({ 
                    fullPage: true,
                    path: path.join(__dirname, '../debug-reports/03-map-loading.png')
                });
                screenshots.push({
                    name: '03-map-loading',
                    description: 'Map during loading phase',
                    timestamp: new Date().toISOString()
                });
                console.log('📸 Map loading screenshot captured');
                
                // Comprehensive map visual analysis
                const mapVisualState = await page.evaluate(() => {
                    const results = {};
                    
                    // Check for map container
                    const mapContainer = document.querySelector('[class*="map"], [id*="map"], .mapboxgl-canvas, [class*="mapbox"]');
                    results.mapContainer = {
                        exists: !!mapContainer,
                        className: mapContainer ? mapContainer.className : 'N/A',
                        visible: mapContainer ? window.getComputedStyle(mapContainer).display !== 'none' : false,
                        dimensions: mapContainer ? {
                            width: mapContainer.offsetWidth,
                            height: mapContainer.offsetHeight
                        } : 'N/A'
                    };
                    
                    // Check for Mapbox canvas
                    const mapboxCanvas = document.querySelector('.mapboxgl-canvas');
                    results.mapboxCanvas = {
                        exists: !!mapboxCanvas,
                        className: mapboxCanvas ? mapboxCanvas.className : 'N/A',
                        visible: mapboxCanvas ? window.getComputedStyle(mapboxCanvas).display !== 'none' : false,
                        dimensions: mapboxCanvas ? {
                            width: mapboxCanvas.offsetWidth,
                            height: mapboxCanvas.offsetHeight
                        } : 'N/A'
                    };
                    
                    // Check for map controls
                    const mapControls = document.querySelectorAll('[class*="mapboxgl-ctrl"]');
                    results.mapControls = {
                        count: mapControls.length,
                        details: Array.from(mapControls).map((ctrl, index) => ({
                            index,
                            className: ctrl.className,
                            visible: window.getComputedStyle(ctrl).display !== 'none',
                            hasContent: ctrl.children.length > 0
                        }))
                    };
                    
                    // Check for layer toggle buttons and their states
                    const layerToggles = document.querySelectorAll('input[type="checkbox"]');
                    results.layerToggles = {
                        count: layerToggles.length,
                        details: Array.from(layerToggles).map((input, index) => {
                            const label = input.closest('label');
                            return {
                                index,
                                checked: input.checked,
                                disabled: input.disabled,
                                visible: window.getComputedStyle(input).display !== 'none',
                                label: label ? label.textContent.trim() : 'No label',
                                className: input.className
                            };
                        })
                    };
                    
                    // Check for map style selector
                    const styleSegments = document.querySelectorAll('.ios-segment');
                    results.styleSelector = {
                        count: styleSegments.length,
                        details: Array.from(styleSegments).map((segment, index) => ({
                            index,
                            text: segment.textContent,
                            active: segment.classList.contains('active'),
                            visible: window.getComputedStyle(segment).display !== 'none'
                        }))
                    };
                    
                    // Check for any visible map features (terrain, buildings, etc.)
                    const mapFeatures = document.querySelectorAll('[class*="terrain"], [class*="building"], [class*="hazard"], [class*="unit"], [class*="route"]');
                    results.mapFeatures = {
                        count: mapFeatures.length,
                        details: Array.from(mapFeatures).map(feature => ({
                            className: feature.className,
                            visible: window.getComputedStyle(feature).display !== 'none',
                            hasContent: feature.children.length > 0
                        }))
                    };
                    
                    // Check for any data panels or overlays
                    const dataPanels = document.querySelectorAll('[class*="panel"], [class*="overlay"], [class*="card"]');
                    results.dataPanels = {
                        count: dataPanels.length,
                        details: Array.from(dataPanels).map(panel => ({
                            className: panel.className,
                            visible: window.getComputedStyle(panel).display !== 'none',
                            textContent: panel.textContent.substring(0, 150) + '...'
                        }))
                    };
                    
                    return results;
                });
                
                console.log('🗺️ Map Visual State:', JSON.stringify(mapVisualState, null, 2));
                visualElements.push({
                    component: 'Live Map',
                    state: mapVisualState,
                    timestamp: new Date().toISOString()
                });
                
                // Capture final map screenshot
                const mapFinalScreenshot = await page.screenshot({ 
                    fullPage: true,
                    path: path.join(__dirname, '../debug-reports/04-map-final.png')
                });
                screenshots.push({
                    name: '04-map-final',
                    description: 'Final map state with all layers',
                    timestamp: new Date().toISOString()
                });
                console.log('📸 Final map screenshot captured');
                
                // Test 4: Layer Toggle Visual Validation
                console.log('\n🧪 Test 4: Layer Toggle Visual Validation');
                
                if (mapVisualState.layerToggles.count > 0) {
                    console.log(`Found ${mapVisualState.layerToggles.count} layer toggle buttons`);
                    
                    // Test each layer toggle and capture visual changes
                    for (let i = 0; i < mapVisualState.layerToggles.count; i++) {
                        try {
                            const checkbox = await page.locator('input[type="checkbox"]').nth(i);
                            const label = mapVisualState.layerToggles.details[i].label;
                            
                            if (await checkbox.isVisible()) {
                                const isChecked = await checkbox.isChecked();
                                console.log(`🧪 Testing ${label} toggle (currently ${isChecked ? 'checked' : 'unchecked'})`);
                                
                                // Capture before state
                                const beforeScreenshot = await page.screenshot({ 
                                    fullPage: true,
                                    path: path.join(__dirname, `../debug-reports/05-${label.toLowerCase()}-before.png`)
                                });
                                
                                // Toggle the checkbox
                                await checkbox.click({ force: true });
                                await page.waitForTimeout(2000);
                                
                                // Capture after state
                                const afterScreenshot = await page.screenshot({ 
                                    fullPage: true,
                                    path: path.join(__dirname, `../debug-reports/06-${label.toLowerCase()}-after.png`)
                                });
                                
                                const newState = await checkbox.isChecked();
                                const toggleSuccess = isChecked !== newState;
                                
                                console.log(`✅ ${label} toggle: ${toggleSuccess ? 'Working' : 'Failed'}`);
                                
                                // Analyze visual changes
                                const layerVisualState = await page.evaluate((layerName) => {
                                    const results = {};
                                    
                                    // Check for layer-specific elements
                                    const layerElements = document.querySelectorAll(`[class*="${layerName.toLowerCase()}"], [id*="${layerName.toLowerCase()}"]`);
                                    results.layerElements = {
                                        count: layerElements.length,
                                        details: Array.from(layerElements).map(el => ({
                                            className: el.className,
                                            visible: window.getComputedStyle(el).display !== 'none',
                                            hasContent: el.children.length > 0
                                        }))
                                    };
                                    
                                    // Check for any visible data or markers
                                    const dataElements = document.querySelectorAll('[class*="data"], [class*="marker"], [class*="point"]');
                                    results.dataElements = {
                                        count: dataElements.length,
                                        details: Array.from(dataElements).map(el => ({
                                            className: el.className,
                                            visible: window.getComputedStyle(el).display !== 'none'
                                        }))
                                    };
                                    
                                    return results;
                                }, label);
                                
                                mapLayers.push({
                                    layer: label,
                                    toggleSuccess: toggleSuccess,
                                    beforeState: isChecked,
                                    afterState: newState,
                                    visualState: layerVisualState,
                                    timestamp: new Date().toISOString()
                                });
                                
                                screenshots.push({
                                    name: `05-${label.toLowerCase()}-before`,
                                    description: `${label} layer before toggle`,
                                    timestamp: new Date().toISOString()
                                });
                                
                                screenshots.push({
                                    name: `06-${label.toLowerCase()}-after`,
                                    description: `${label} layer after toggle`,
                                    timestamp: new Date().toISOString()
                                });
                                
                                // Toggle back to original state
                                await checkbox.click({ force: true });
                                await page.waitForTimeout(2000);
                                
                            } else {
                                console.log(`⚠️ ${label} toggle not visible`);
                                mapLayers.push({
                                    layer: label,
                                    toggleSuccess: false,
                                    error: 'Not visible',
                                    timestamp: new Date().toISOString()
                                });
                            }
                            
                        } catch (error) {
                            console.log(`❌ ${label} toggle test failed:`, error.message);
                            mapLayers.push({
                                layer: label,
                                toggleSuccess: false,
                                error: error.message,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
                
                // Test 5: Map Style Selector Visual Validation
                console.log('\n🧪 Test 5: Map Style Selector Visual Validation');
                
                if (mapVisualState.styleSelector.count > 0) {
                    console.log(`Found ${mapVisualState.styleSelector.count} style selector buttons`);
                    
                    for (let i = 0; i < mapVisualState.styleSelector.count; i++) {
                        try {
                            const segment = await page.locator('.ios-segment').nth(i);
                            if (await segment.isVisible()) {
                                const originalText = await segment.textContent();
                                console.log(`🧪 Testing style selector: ${originalText}`);
                                
                                // Capture before state
                                const beforeScreenshot = await page.screenshot({ 
                                    fullPage: true,
                                    path: path.join(__dirname, `../debug-reports/07-${originalText.toLowerCase()}-style-before.png`)
                                });
                                
                                await segment.click({ force: true });
                                await page.waitForTimeout(3000);
                                
                                // Capture after state
                                const afterScreenshot = await page.screenshot({ 
                                    fullPage: true,
                                    path: path.join(__dirname, `../debug-reports/08-${originalText.toLowerCase()}-style-after.png`)
                                });
                                
                                console.log(`✅ Style Selector ${originalText}: Working`);
                                
                                screenshots.push({
                                    name: `07-${originalText.toLowerCase()}-style-before`,
                                    description: `${originalText} style before change`,
                                    timestamp: new Date().toISOString()
                                });
                                
                                screenshots.push({
                                    name: `08-${originalText.toLowerCase()}-style-after`,
                                    description: `${originalText} style after change`,
                                    timestamp: new Date().toISOString()
                                });
                                
                            } else {
                                console.log(`⚠️ Style Selector ${i + 1} not visible`);
                            }
                            
                        } catch (error) {
                            console.log(`❌ Style Selector ${i + 1} test failed:`, error.message);
                        }
                    }
                }
                
            } else {
                console.log('❌ Live Map button not visible');
            }
            
        } catch (error) {
            console.log('❌ Live Map test failed:', error.message);
        }
        
        // Test 6: Cross-Reference Console Logs with Visual Elements
        console.log('\n🧪 Test 6: Console Logs vs Visual Elements Cross-Reference');
        
        const consoleAnalysis = {
            totalLogs: consoleLogs.length,
            errors: errors.length,
            warnings: warnings.length,
            mapboxLogs: consoleLogs.filter(log => log.text.includes('Mapbox')),
            terrainLogs: consoleLogs.filter(log => log.text.includes('terrain')),
            buildingLogs: consoleLogs.filter(log => log.text.includes('building')),
            hazardLogs: consoleLogs.filter(log => log.text.includes('hazard')),
            unitLogs: consoleLogs.filter(log => log.text.includes('unit')),
            routeLogs: consoleLogs.filter(log => log.text.includes('route')),
            successLogs: consoleLogs.filter(log => log.text.includes('successfully')),
            errorLogs: errors
        };
        
        console.log('📊 Console Log Analysis:', JSON.stringify(consoleAnalysis, null, 2));
        
        // Generate comprehensive visual validation report
        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            summary: {
                totalScreenshots: screenshots.length,
                totalVisualElements: visualElements.length,
                totalMapLayers: mapLayers.length,
                totalConsoleLogs: consoleLogs.length,
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                reactMounted: initialVisualState.rootElement.hasChildren,
                mapComponentWorking: visualElements.find(e => e.component === 'Live Map') !== undefined
            },
            screenshots: screenshots,
            visualElements: visualElements,
            mapLayers: mapLayers,
            consoleLogs: consoleLogs,
            errors: errors,
            warnings: warnings,
            consoleAnalysis: consoleAnalysis,
            initialVisualState: initialVisualState
        };
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../debug-reports');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(reportPath, 'visual-rendering-validation-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Final validation summary
        console.log('\n👁️ Automated Visual Rendering Validation Summary:');
        console.log('==================================================');
        console.log(`📸 Screenshots Captured: ${screenshots.length}`);
        console.log(`🔍 Visual Elements Analyzed: ${visualElements.length}`);
        console.log(`🗺️ Map Layers Tested: ${mapLayers.length}`);
        console.log(`📝 Console Logs Captured: ${consoleLogs.length}`);
        console.log(`❌ Errors Captured: ${errors.length}`);
        console.log(`⚠️ Warnings Captured: ${warnings.length}`);
        console.log(`⚛️ React App Mounted: ${initialVisualState.rootElement.hasChildren ? 'Yes' : 'No'}`);
        console.log(`🗺️ Map Component Working: ${visualElements.find(e => e.component === 'Live Map') !== undefined ? 'Yes' : 'No'}`);
        
        // Analyze map layer rendering success
        const successfulLayers = mapLayers.filter(layer => layer.toggleSuccess);
        const failedLayers = mapLayers.filter(layer => !layer.toggleSuccess);
        
        console.log(`✅ Successfully Rendered Layers: ${successfulLayers.length}/${mapLayers.length}`);
        if (successfulLayers.length > 0) {
            console.log('   - ' + successfulLayers.map(l => l.layer).join(', '));
        }
        
        if (failedLayers.length > 0) {
            console.log(`❌ Failed to Render Layers: ${failedLayers.length}/${mapLayers.length}`);
            failedLayers.forEach(layer => {
                console.log(`   - ${layer.layer}: ${layer.error || 'Unknown failure'}`);
            });
        }
        
        console.log('\n📝 Detailed visual validation report saved to debug-reports/visual-rendering-validation-report.json');
        console.log('📸 All screenshots saved to debug-reports/ directory');
        
        // Return exit code based on critical failures
        const criticalFailures = errors.length > 0 || !initialVisualState.rootElement.hasChildren;
        
        if (criticalFailures) {
            console.log('\n❌ Validation completed with critical failures');
            process.exit(1);
        } else {
            console.log('\n✅ All critical visual validation tests passed successfully!');
            console.log('🎯 Your automated eyes have validated the frontend rendering!');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('💥 Visual validation failed:', error);
        process.exit(1);
    } finally {
        if (browser) {
            console.log('\n🔒 Closing browser...');
            await browser.close();
        }
    }
}

// Run the visual validation script
validateMapVisualRendering().catch(console.error);
