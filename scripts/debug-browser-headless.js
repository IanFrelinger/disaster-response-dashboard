#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugBrowserHeadless() {
    console.log('🔍 Starting headless browser debugging...');
    console.log('==================================================');
    
    let browser;
    let page;
    
    try {
        // Launch browser in headless mode for silent operation
        console.log('🌐 Launching headless Chromium browser...');
        browser = await chromium.launch({
            headless: true, // Run silently in background
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
        const networkErrors = [];
        const warnings = [];
        const infoLogs = [];
        
        // Capture all console messages
        page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString(),
                location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : 'N/A'
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
                case 'info':
                    console.log(`ℹ️ Console Info: ${msg.text()}`);
                    infoLogs.push(logEntry);
                    break;
                default:
                    console.log(`📝 Console ${msg.type()}: ${msg.text()}`);
            }
        });
        
        // Capture page errors (unhandled exceptions)
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
            const failure = {
                url: request.url(),
                failureText: request.failure()?.errorText || 'Unknown failure',
                timestamp: new Date().toISOString()
            };
            console.log(`🌐 Network Failure: ${request.url()} - ${failure.failureText}`);
            networkErrors.push(failure);
        });
        
        // Capture WebGL context issues
        await page.addInitScript(() => {
            // Monitor WebGL context creation
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
            
            // Monitor Mapbox GL JS loading
            Object.defineProperty(window, 'mapboxgl', {
                set: function(value) {
                    console.log('Mapbox GL JS loaded:', value);
                    this._mapboxgl = value;
                },
                get: function() {
                    return this._mapboxgl;
                }
            });
            
            // Monitor React mounting
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                const element = originalCreateElement.call(this, tagName);
                if (tagName === 'div' && element.id === 'root') {
                    console.log('Root element created');
                    // Monitor when React mounts content
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                                console.log('React content added to root:', mutation.addedNodes.length, 'nodes');
                            }
                        });
                    });
                    observer.observe(element, { childList: true, subtree: true });
                }
                return element;
            };
        });
        
        console.log('🔍 Navigating to React app...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for React app to load...');
        await page.waitForTimeout(5000);
        
        // Check initial React app state
        console.log('🔍 Checking initial React app state...');
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
            
            // Check for map container
            const mapContainer = document.querySelector('[class*="map"], [id*="map"], .mapboxgl-canvas');
            results.mapContainer = {
                exists: !!mapContainer,
                className: mapContainer ? mapContainer.className : 'N/A',
                id: mapContainer ? mapContainer.id : 'N/A'
            };
            
            return results;
        });
        
        console.log('📊 Initial React App State:');
        console.log(JSON.stringify(initialState, null, 2));
        
        // Now test Live Map navigation
        console.log('🗺️ Testing Live Map navigation...');
        
        try {
            // Click on Live Map button
            await page.click('text=Live Map');
            console.log('✅ Clicked on Live Map button');
            
            // Wait for potential map rendering
            await page.waitForTimeout(3000);
            
            // Check map state after navigation
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
                
                // Check for any error messages on the page
                const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .error, .Error');
                results.errors = {
                    count: errorElements.length,
                    texts: Array.from(errorElements).map(el => el.textContent)
                };
                
                return results;
            });
            
            console.log('🗺️ Map State After Live Map Click:');
            console.log(JSON.stringify(mapStateAfterClick, null, 2));
            
            // Check for Mapbox-specific issues
            const mapboxIssues = await page.evaluate(() => {
                const issues = [];
                
                // Check if Mapbox GL JS is loaded
                if (typeof mapboxgl === 'undefined') {
                    issues.push('Mapbox GL JS not loaded');
                } else {
                    console.log('Mapbox GL JS is loaded');
                }
                
                // Check for WebGL support
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) {
                    issues.push('WebGL not supported');
                } else {
                    console.log('WebGL is supported');
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
                } else if (typeof mapboxgl !== 'undefined') {
                    console.log('Mapbox access token is set');
                }
                
                return issues;
            });
            
            if (mapboxIssues.length > 0) {
                console.log('🗺️ Mapbox Issues:');
                mapboxIssues.forEach(issue => console.log(`   - ${issue}`));
            }
            
        } catch (clickError) {
            console.log('⚠️ Error clicking Live Map button:', clickError.message);
            errors.push({
                type: 'clickerror',
                text: clickError.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Generate comprehensive error report
        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            summary: {
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                totalConsoleLogs: consoleLogs.length,
                totalNetworkErrors: networkErrors.length,
                totalInfoLogs: infoLogs.length,
                reactMounted: initialState.rootElement.hasChildren,
                mapContainerExists: initialState.mapContainer.exists
            },
            errors: errors,
            warnings: warnings,
            consoleLogs: consoleLogs,
            networkErrors: networkErrors,
            infoLogs: infoLogs,
            initialState: initialState
        };
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../debug-reports');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(reportPath, 'headless-browser-debug-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Save console logs separately for easy reading
        const consoleReport = {
            timestamp: new Date().toISOString(),
            errors: errors.map(e => `${e.timestamp} - ${e.type}: ${e.text}`),
            warnings: warnings.map(w => `${w.timestamp} - ${w.type}: ${w.text}`),
            infoLogs: infoLogs.map(i => `${i.timestamp} - ${i.type}: ${i.text}`),
            networkErrors: networkErrors.map(n => `${n.timestamp} - ${n.url}: ${n.failureText}`)
        };
        
        fs.writeFileSync(
            path.join(reportPath, 'headless-console-logs.txt'),
            JSON.stringify(consoleReport, null, 2)
        );
        
        console.log('📝 Detailed debug report saved to debug-reports/headless-browser-debug-report.json');
        console.log('📝 Console logs saved to debug-reports/headless-console-logs.txt');
        
        // Final summary
        console.log('\n🔍 Headless Browser Debugging Summary:');
        console.log('==================================================');
        console.log(`✅ Console Logs Captured: ${consoleLogs.length}`);
        console.log(`❌ Errors Captured: ${errors.length}`);
        console.log(`⚠️ Warnings Captured: ${warnings.length}`);
        console.log(`🌐 Network Errors: ${networkErrors.length}`);
        console.log(`ℹ️ Info Logs: ${infoLogs.length}`);
        console.log(`⚛️ React App Mounted: ${initialState.rootElement.hasChildren ? 'Yes' : 'No'}`);
        console.log(`🗺️ Map Container Exists: ${initialState.mapContainer.exists ? 'Yes' : 'No'}`);
        
        if (errors.length > 0) {
            console.log('\n🚨 Critical Issues Found:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.type}: ${error.text}`);
                if (error.location && error.location !== 'N/A') {
                    console.log(`   Location: ${error.location}`);
                }
            });
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️ Warnings Found:');
            warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.text}`);
            });
        }
        
        console.log('\n📋 Next Steps:');
        console.log('1. Check the detailed debug report for analysis');
        console.log('2. Review console logs for specific error patterns');
        console.log('3. Fix the identified issues');
        console.log('4. Re-run this script to verify fixes');
        
        // Return exit code based on errors found
        if (errors.length > 0) {
            console.log('\n❌ Debugging completed with errors found');
            process.exit(1);
        } else {
            console.log('\n✅ Debugging completed successfully - no critical errors found');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('💥 Headless browser debugging failed:', error);
        process.exit(1);
    } finally {
        if (browser) {
            console.log('\n🔒 Closing headless browser...');
            await browser.close();
        }
    }
}

// Run the headless debugging script
debugBrowserHeadless().catch(console.error);
