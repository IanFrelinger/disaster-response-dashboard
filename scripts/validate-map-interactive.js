#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateMapInteractive() {
    console.log('🔍 Starting Interactive Map Component Validation...');
    console.log('==================================================');
    
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
                '--disable-dev-shm-usage'
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        page = await context.newPage();
        
        // Set up comprehensive error and console logging
        const errors = [];
        const consoleLogs = [];
        const warnings = [];
        const buttonTests = [];
        
        // Capture all console messages
        page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
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
        
        console.log('🔍 Navigating to React app...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for React app to load...');
        await page.waitForTimeout(5000); // Increased wait time
        
        // Test 1: Initial Page Load and Navigation
        console.log('\n🧪 Test 1: Initial Page Load and Navigation');
        
        // Wait for root element to be populated
        await page.waitForSelector('#root', { timeout: 10000 });
        
        const initialState = await page.evaluate(() => {
            const results = {};
            
            // Check if React app mounted
            const rootElement = document.getElementById('root');
            results.rootElement = {
                exists: !!rootElement,
                hasChildren: rootElement ? rootElement.children.length > 0 : false,
                innerHTML: rootElement ? rootElement.innerHTML.substring(0, 200) + '...' : 'N/A'
            };
            
            // Check for Command Center header
            const header = document.querySelector('h1');
            results.header = {
                exists: !!header,
                text: header ? header.textContent : 'N/A'
            };
            
            // Check for navigation buttons
            const navButtons = document.querySelectorAll('button');
            results.navigation = {
                buttonCount: navButtons.length,
                buttonTexts: Array.from(navButtons).map(btn => btn.textContent)
            };
            
            return results;
        });
        
        console.log('📊 Initial Page State:', JSON.stringify(initialState, null, 2));
        
        if (!initialState.rootElement.hasChildren) {
            throw new Error('React app failed to mount');
        }
        
        // Test 2: Navigation Button Functionality
        console.log('\n🧪 Test 2: Navigation Button Functionality');
        
        // Test Commander Dashboard button
        try {
            const dashboardButton = await page.locator('text=Commander Dashboard').first();
            if (await dashboardButton.isVisible()) {
                await dashboardButton.click();
                console.log('✅ Commander Dashboard button clicked');
                await page.waitForTimeout(2000);
                
                const dashboardState = await page.evaluate(() => {
                    const dashboardContent = document.querySelector('[class*="dashboard"], [class*="Dashboard"]');
                    return {
                        exists: !!dashboardContent,
                        hasContent: dashboardContent ? dashboardContent.children.length > 0 : false
                    };
                });
                
                buttonTests.push({
                    button: 'Commander Dashboard',
                    success: dashboardState.exists && dashboardState.hasContent,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`📊 Dashboard State: ${JSON.stringify(dashboardState)}`);
            } else {
                console.log('⚠️ Commander Dashboard button not visible');
                buttonTests.push({
                    button: 'Commander Dashboard',
                    success: false,
                    error: 'Button not visible',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.log('❌ Commander Dashboard button test failed:', error.message);
            buttonTests.push({
                button: 'Commander Dashboard',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Test Live Map button (Main Test)
        console.log('\n🧪 Test 3: Live Map Component Validation');
        try {
            const liveMapButton = await page.locator('text=Live Map').first();
            if (await liveMapButton.isVisible()) {
                await liveMapButton.click();
                console.log('✅ Live Map button clicked');
                await page.waitForTimeout(5000); // Increased wait time for map to load
                
                // Check map container state
                const mapState = await page.evaluate(() => {
                    const results = {};
                    
                    // Check for map container
                    const mapContainer = document.querySelector('[class*="map"], [id*="map"], .mapboxgl-canvas, [class*="mapbox"]');
                    results.mapContainer = {
                        exists: !!mapContainer,
                        className: mapContainer ? mapContainer.className : 'N/A'
                    };
                    
                    // Check for Mapbox canvas
                    const mapboxCanvas = document.querySelector('.mapboxgl-canvas');
                    results.mapboxCanvas = {
                        exists: !!mapboxCanvas,
                        className: mapboxCanvas ? mapboxCanvas.className : 'N/A'
                    };
                    
                    // Check for map controls
                    const mapControls = document.querySelectorAll('[class*="mapboxgl-ctrl"]');
                    results.mapControls = {
                        count: mapControls.length,
                        classes: Array.from(mapControls).map(el => el.className)
                    };
                    
                    // Check for layer toggle buttons
                    const layerToggles = document.querySelectorAll('input[type="checkbox"]');
                    results.layerToggles = {
                        count: layerToggles.length,
                        labels: Array.from(layerToggles).map(input => {
                            const label = input.closest('label');
                            return label ? label.textContent.trim() : 'No label';
                        })
                    };
                    
                    return results;
                });
                
                console.log('🗺️ Map State:', JSON.stringify(mapState, null, 2));
                
                buttonTests.push({
                    button: 'Live Map',
                    success: mapState.mapContainer.exists && mapState.mapboxCanvas.exists,
                    mapState: mapState,
                    timestamp: new Date().toISOString()
                });
                
                // Test 4: Map Layer Toggle Buttons
                console.log('\n🧪 Test 4: Map Layer Toggle Buttons');
                if (mapState.layerToggles.count > 0) {
                    console.log(`Found ${mapState.layerToggles.count} layer toggle buttons`);
                    
                    // Test each layer toggle with better error handling
                    for (let i = 0; i < mapState.layerToggles.count; i++) {
                        try {
                            const checkbox = await page.locator('input[type="checkbox"]').nth(i);
                            
                            if (await checkbox.isVisible()) {
                                const isChecked = await checkbox.isChecked();
                                
                                // Try to click with better positioning
                                await checkbox.click({ force: true });
                                await page.waitForTimeout(1000);
                                
                                const newState = await checkbox.isChecked();
                                const toggleSuccess = isChecked !== newState;
                                
                                console.log(`✅ Layer Toggle ${i + 1} (${mapState.layerToggles.labels[i]}): ${toggleSuccess ? 'Working' : 'Failed'}`);
                                
                                buttonTests.push({
                                    button: `Layer Toggle ${i + 1} (${mapState.layerToggles.labels[i]})`,
                                    success: toggleSuccess,
                                    timestamp: new Date().toISOString()
                                });
                                
                                // Toggle back to original state
                                await checkbox.click({ force: true });
                                await page.waitForTimeout(1000);
                            } else {
                                console.log(`⚠️ Layer Toggle ${i + 1} not visible`);
                                buttonTests.push({
                                    button: `Layer Toggle ${i + 1} (${mapState.layerToggles.labels[i]})`,
                                    success: false,
                                    error: 'Not visible',
                                    timestamp: new Date().toISOString()
                                });
                            }
                            
                        } catch (error) {
                            console.log(`❌ Layer Toggle ${i + 1} test failed:`, error.message);
                            buttonTests.push({
                                button: `Layer Toggle ${i + 1} (${mapState.layerToggles.labels[i]})`,
                                success: false,
                                error: error.message,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
                
                // Test 5: Map Style Selector
                console.log('\n🧪 Test 5: Map Style Selector');
                try {
                    const styleSegments = await page.locator('.ios-segment').all();
                    if (styleSegments.length > 0) {
                        console.log(`Found ${styleSegments.length} style selector buttons`);
                        
                        for (let i = 0; i < styleSegments.length; i++) {
                            try {
                                const segment = styleSegments[i];
                                if (await segment.isVisible()) {
                                    const originalText = await segment.textContent();
                                    
                                    await segment.click({ force: true });
                                    await page.waitForTimeout(1500);
                                    
                                    console.log(`✅ Style Selector ${i + 1} (${originalText}): Working`);
                                    
                                    buttonTests.push({
                                        button: `Style Selector ${i + 1} (${originalText})`,
                                        success: true,
                                        timestamp: new Date().toISOString()
                                    });
                                } else {
                                    console.log(`⚠️ Style Selector ${i + 1} not visible`);
                                    buttonTests.push({
                                        button: `Style Selector ${i + 1}`,
                                        success: false,
                                        error: 'Not visible',
                                        timestamp: new Date().toISOString()
                                    });
                                }
                                
                            } catch (error) {
                                console.log(`❌ Style Selector ${i + 1} test failed:`, error.message);
                                buttonTests.push({
                                    button: `Style Selector ${i + 1}`,
                                    success: false,
                                    error: error.message,
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.log('⚠️ Style selector test skipped:', error.message);
                }
                
                // Test 6: Refresh Button
                console.log('\n🧪 Test 6: Refresh Button');
                try {
                    const refreshButton = await page.locator('button:has-text("Refresh")').first();
                    if (await refreshButton.isVisible()) {
                        await refreshButton.click();
                        await page.waitForTimeout(2000);
                        
                        console.log('✅ Refresh button: Working');
                        buttonTests.push({
                            button: 'Refresh',
                            success: true,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.log('⚠️ Refresh button not visible');
                        buttonTests.push({
                            button: 'Refresh',
                            success: false,
                            error: 'Button not visible',
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (error) {
                    console.log('❌ Refresh button test failed:', error.message);
                    buttonTests.push({
                        button: 'Refresh',
                        success: false,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
                
            } else {
                console.log('❌ Live Map button not visible');
                buttonTests.push({
                    button: 'Live Map',
                    success: false,
                    error: 'Button not visible',
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.log('❌ Live Map button test failed:', error.message);
            buttonTests.push({
                button: 'Live Map',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Test 7: Other Navigation Buttons
        console.log('\n🧪 Test 7: Other Navigation Buttons');
        const otherButtons = ['Operations', 'Conditions', 'Assets', 'AIP Commander'];
        
        for (const buttonText of otherButtons) {
            try {
                const button = await page.locator(`text=${buttonText}`).first();
                if (await button.isVisible()) {
                    await button.click();
                    console.log(`✅ ${buttonText} button clicked`);
                    await page.waitForTimeout(1500);
                    
                    buttonTests.push({
                        button: buttonText,
                        success: true,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    console.log(`⚠️ ${buttonText} button not visible`);
                    buttonTests.push({
                        button: buttonText,
                        success: false,
                        error: 'Button not visible',
                        timestamp: new Date().toISOString()
                    });
                }
                
            } catch (error) {
                console.log(`❌ ${buttonText} button test failed:`, error.message);
                buttonTests.push({
                    button: buttonText,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Test 8: Map Performance and Error Monitoring
        console.log('\n🧪 Test 8: Map Performance and Error Monitoring');
        
        // Check for any runtime errors during testing
        const runtimeErrors = errors.filter(e => 
            e.timestamp > new Date(Date.now() - 60000).toISOString() // Last minute
        );
        
        if (runtimeErrors.length > 0) {
            console.log('⚠️ Runtime errors detected during testing:');
            runtimeErrors.forEach(error => {
                console.log(`   - ${error.type}: ${error.text}`);
            });
        } else {
            console.log('✅ No runtime errors detected during testing');
        }
        
        // Generate comprehensive validation report
        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            summary: {
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                totalConsoleLogs: consoleLogs.length,
                totalButtonTests: buttonTests.length,
                successfulButtonTests: buttonTests.filter(t => t.success).length,
                failedButtonTests: buttonTests.filter(t => !t.success).length,
                reactMounted: initialState.rootElement.hasChildren,
                mapComponentWorking: buttonTests.find(t => t.button === 'Live Map')?.success || false
            },
            errors: errors,
            warnings: warnings,
            consoleLogs: consoleLogs,
            buttonTests: buttonTests,
            initialState: initialState
        };
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../debug-reports');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(reportPath, 'interactive-map-validation-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Final validation summary
        console.log('\n🔍 Interactive Map Component Validation Summary:');
        console.log('==================================================');
        console.log(`✅ Console Logs Captured: ${consoleLogs.length}`);
        console.log(`❌ Errors Captured: ${errors.length}`);
        console.log(`⚠️ Warnings Captured: ${warnings.length}`);
        console.log(`🧪 Button Tests: ${buttonTests.length}`);
        console.log(`✅ Successful Tests: ${buttonTests.filter(t => t.success).length}`);
        console.log(`❌ Failed Tests: ${buttonTests.filter(t => !t.success).length}`);
        console.log(`⚛️ React App Mounted: ${initialState.rootElement.hasChildren ? 'Yes' : 'No'}`);
        console.log(`🗺️ Map Component Working: ${buttonTests.find(t => t.button === 'Live Map')?.success ? 'Yes' : 'No'}`);
        
        if (buttonTests.filter(t => !t.success).length > 0) {
            console.log('\n❌ Failed Button Tests:');
            buttonTests.filter(t => !t.success).forEach(test => {
                console.log(`   - ${test.button}: ${test.error || 'Unknown failure'}`);
            });
        }
        
        console.log('\n📝 Detailed validation report saved to debug-reports/interactive-map-validation-report.json');
        
        // Return exit code based on test results
        const criticalFailures = buttonTests.filter(t => 
            ['Live Map', 'Commander Dashboard'].includes(t.button) && !t.success
        );
        
        if (criticalFailures.length > 0 || errors.length > 0) {
            console.log('\n❌ Validation completed with critical failures');
            process.exit(1);
        } else {
            console.log('\n✅ All critical validation tests passed successfully!');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('💥 Interactive validation failed:', error);
        process.exit(1);
    } finally {
        if (browser) {
            console.log('\n🔒 Closing browser...');
            await browser.close();
        }
    }
}

// Run the interactive validation script
validateMapInteractive().catch(console.error);
