#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugBrowserWithPlaywright() {
    console.log('🔍 Starting Playwright browser debugging...');
    console.log('==================================================');
    
    let browser;
    let page;
    
    try {
        // Launch browser with debugging enabled
        console.log('🌐 Launching Chromium browser...');
        browser = await chromium.launch({
            headless: false, // Show browser for visual debugging
            slowMo: 1000, // Slow down actions for better visibility
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--enable-logging',
                '--v=1'
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        page = await context.newPage();
        
        // Set up error and console logging
        const errors = [];
        const consoleLogs = [];
        const networkErrors = [];
        
        // Capture console errors
        page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            };
            consoleLogs.push(logEntry);
            
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${msg.text()}`);
                errors.push(logEntry);
            } else if (msg.type() === 'warning') {
                console.log(`⚠️ Console Warning: ${msg.text()}`);
            } else {
                console.log(`ℹ️ Console ${msg.type()}: ${msg.text()}`);
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
        
        // Capture network errors
        page.on('requestfailed', request => {
            const failure = {
                url: request.url(),
                failureText: request.failure()?.errorText || 'Unknown failure',
                timestamp: new Date().toISOString()
            };
            console.log(`🌐 Network Failure: ${request.url()} - ${failure.failureText}`);
            networkErrors.push(failure);
        });
        
        // Capture WebGL context loss (fixed version)
        await page.addInitScript(() => {
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, attributes) {
                const context = originalGetContext.call(this, type, attributes);
                if (type === 'webgl' || type === 'webgl2') {
                    if (context && typeof context.addEventListener === 'function') {
                        context.addEventListener('webglcontextlost', (event) => {
                            console.error('WebGL context lost:', event);
                        });
                        context.addEventListener('webglcontextrestored', (event) => {
                            console.log('WebGL context restored:', event);
                        });
                    }
                }
                return context;
            };
        });
        
        console.log('🔍 Navigating to React app...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for React app to load...');
        
        // Wait for React to potentially mount
        await page.waitForTimeout(5000);
        
        // Check if React app is actually rendering
        console.log('🔍 Checking React app rendering...');
        
        // Take screenshot of current state
        const screenshotPath = path.join(__dirname, '../debug-screenshots');
        if (!fs.existsSync(screenshotPath)) {
            fs.mkdirSync(screenshotPath, { recursive: true });
        }
        
        await page.screenshot({ 
            path: path.join(screenshotPath, 'react-app-state.png'),
            fullPage: true 
        });
        console.log('📸 Screenshot saved to debug-screenshots/react-app-state.png');
        
        // Check for React-specific elements
        const reactElements = await page.evaluate(() => {
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
            
            // Check for map container
            const mapContainer = document.querySelector('[class*="map"], [id*="map"], .mapboxgl-canvas');
            results.mapContainer = {
                exists: !!mapContainer,
                className: mapContainer ? mapContainer.className : 'N/A',
                id: mapContainer ? mapContainer.id : 'N/A'
            };
            
            // Check for any error messages
            const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .error, .Error');
            results.errors = {
                count: errorElements.length,
                texts: Array.from(errorElements).map(el => el.textContent)
            };
            
            // Check page title
            results.title = document.title;
            
            // Check for React DevTools
            results.reactDevTools = {
                exists: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
            };
            
            return results;
        });
        
        console.log('📊 React App Analysis:');
        console.log(JSON.stringify(reactElements, null, 2));
        
        // Now let's test clicking on the Live Map button to see if the map renders
        console.log('🗺️ Testing Live Map navigation...');
        
        try {
            // Click on Live Map button
            await page.click('text=Live Map');
            console.log('✅ Clicked on Live Map button');
            
            // Wait for potential map rendering
            await page.waitForTimeout(3000);
            
            // Take screenshot after clicking Live Map
            await page.screenshot({ 
                path: path.join(screenshotPath, 'after-live-map-click.png'),
                fullPage: true 
            });
            console.log('📸 Screenshot after Live Map click saved');
            
            // Check if map container now exists
            const mapStateAfterClick = await page.evaluate(() => {
                const results = {};
                
                // Check for map container
                const mapContainer = document.querySelector('[class*="map"], [id*="map"], .mapboxgl-canvas, [class*="mapbox"]');
                results.mapContainer = {
                    exists: !!mapContainer,
                    className: mapContainer ? mapContainer.className : 'N/A',
                    id: mapContainer ? mapContainer.id : 'N/A'
                };
                
                // Check for Mapbox canvas
                const mapboxCanvas = document.querySelector('.mapboxgl-canvas');
                results.mapboxCanvas = {
                    exists: !!mapboxCanvas,
                    className: mapboxCanvas ? mapboxCanvas.className : 'N/A'
                };
                
                // Check for any map-related elements
                const mapElements = document.querySelectorAll('[class*="map"], [id*="map"], [class*="mapbox"], [class*="terrain"]');
                results.mapElements = {
                    count: mapElements.length,
                    classes: Array.from(mapElements).map(el => el.className)
                };
                
                // Check for any error messages
                const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .error, .Error');
                results.errors = {
                    count: errorElements.length,
                    texts: Array.from(errorElements).map(el => el.textContent)
                };
                
                return results;
            });
            
            console.log('🗺️ Map State After Live Map Click:');
            console.log(JSON.stringify(mapStateAfterClick, null, 2));
            
            if (mapStateAfterClick.mapContainer.exists) {
                console.log('✅ Map container is now rendering!');
            } else {
                console.log('❌ Map container still not rendering after Live Map click');
                
                // Check for Mapbox-specific issues
                const mapboxIssues = await page.evaluate(() => {
                    const issues = [];
                    
                    // Check if Mapbox GL JS is loaded
                    if (typeof mapboxgl === 'undefined') {
                        issues.push('Mapbox GL JS not loaded');
                    }
                    
                    // Check for WebGL support
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    if (!gl) {
                        issues.push('WebGL not supported');
                    } else {
                        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                        if (debugInfo) {
                            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                            console.log(`WebGL Vendor: ${vendor}`);
                            console.log(`WebGL Renderer: ${renderer}`);
                        }
                    }
                    
                    // Check for Mapbox access token
                    if (typeof mapboxgl !== 'undefined' && !mapboxgl.accessToken) {
                        issues.push('Mapbox access token not set');
                    }
                    
                    return issues;
                });
                
                if (mapboxIssues.length > 0) {
                    console.log('🗺️ Mapbox Issues:');
                    mapboxIssues.forEach(issue => console.log(`   - ${issue}`));
                }
            }
            
        } catch (clickError) {
            console.log('⚠️ Error clicking Live Map button:', clickError.message);
        }
        
        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            errors: errors,
            consoleLogs: consoleLogs,
            networkErrors: networkErrors,
            reactElements: reactElements,
            summary: {
                totalErrors: errors.length,
                totalConsoleLogs: consoleLogs.length,
                totalNetworkErrors: networkErrors.length,
                reactMounted: reactElements.rootElement.hasChildren,
                mapContainerExists: reactElements.mapContainer.exists
            }
        };
        
        const reportPath = path.join(__dirname, '../debug-reports');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(reportPath, 'playwright-debug-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📝 Comprehensive debug report saved to debug-reports/playwright-debug-report.json');
        
        // Final summary
        console.log('\n🔍 Browser Debugging Summary:');
        console.log('==================================================');
        console.log(`✅ Console Logs Captured: ${consoleLogs.length}`);
        console.log(`❌ Errors Captured: ${errors.length}`);
        console.log(`🌐 Network Errors: ${networkErrors.length}`);
        console.log(`⚛️ React App Mounted: ${reactElements.rootElement.hasChildren ? 'Yes' : 'No'}`);
        console.log(`🗺️ Map Container Exists: ${reactElements.mapContainer.exists ? 'Yes' : 'No'}`);
        
        if (errors.length > 0) {
            console.log('\n🚨 Critical Issues Found:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.type}: ${error.text}`);
            });
        }
        
        console.log('\n📋 Next Steps:');
        console.log('1. Check the debug report for detailed analysis');
        console.log('2. Review screenshots for visual debugging');
        console.log('3. Fix the identified issues');
        console.log('4. Re-run this script to verify fixes');
        
        // Keep browser open for manual inspection
        console.log('\n🌐 Browser will remain open for manual inspection...');
        console.log('Press Ctrl+C to close the browser and exit');
        
        // Wait indefinitely for manual inspection
        await new Promise(() => {});
        
    } catch (error) {
        console.error('💥 Playwright debugging failed:', error);
        
        if (page) {
            try {
                await page.screenshot({ 
                    path: path.join(__dirname, '../debug-screenshots/error-state.png'),
                    fullPage: true 
                });
                console.log('📸 Error screenshot saved');
            } catch (screenshotError) {
                console.error('Failed to save error screenshot:', screenshotError);
            }
        }
        
        throw error;
    } finally {
        if (browser) {
            console.log('\n🔒 Closing browser...');
            await browser.close();
        }
    }
}

// Run the debugging script
debugBrowserWithPlaywright().catch(console.error);
