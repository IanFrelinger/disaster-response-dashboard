#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FrontendScreenshotter {
    constructor() {
        this.screenshots = [];
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Launching browser...');
        this.browser = await chromium.launch({ 
            headless: true, // Run in headless mode
            slowMo: 1000 // Slow down for better screenshots
        });
        this.page = await this.browser.newPage();
        
        // Set viewport to match video dimensions
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        
        console.log('✅ Browser launched successfully');
    }

    async takeScreenshot(name, url = 'http://localhost:3001', selector = null, waitFor = null) {
        try {
            console.log(`📸 Taking screenshot: ${name}`);
            
            // Navigate to the page
            await this.page.goto(url, { waitUntil: 'networkidle' });
            
            // Wait for specific element if provided
            if (waitFor) {
                await this.page.waitForSelector(waitFor, { timeout: 10000 });
            }
            
            // Wait a bit for animations to complete
            await this.page.waitForTimeout(2000);
            
            // Take screenshot
            const screenshotPath = path.join(__dirname, '..', 'screenshots', `${name}.png`);
            await fs.ensureDir(path.dirname(screenshotPath));
            
            if (selector) {
                const element = await this.page.$(selector);
                if (element) {
                    await element.screenshot({ path: screenshotPath, fullPage: false });
                } else {
                    await this.page.screenshot({ path: screenshotPath, fullPage: true });
                }
            } else {
                await this.page.screenshot({ path: screenshotPath, fullPage: true });
            }
            
            this.screenshots.push({ name, path: screenshotPath });
            console.log(`✅ Screenshot saved: ${screenshotPath}`);
            
        } catch (error) {
            console.error(`❌ Error taking screenshot ${name}:`, error.message);
        }
    }

    async takeMainDashboardScreenshots() {
        console.log('\n🎯 Taking main dashboard screenshots...');
        
        // Main dashboard view
        await this.takeScreenshot('01-main-dashboard', 'http://localhost:3001');
        
        // Wait for map to load
        await this.page.waitForTimeout(3000);
        await this.takeScreenshot('02-dashboard-with-map', 'http://localhost:3001', null, '.mapboxgl-canvas');
        
        // Try to interact with different panels
        try {
            // Look for hazard layers panel
            const hazardButton = await this.page.$('[data-testid="hazard-layers"]') || 
                                await this.page.$('button:has-text("Hazards")') ||
                                await this.page.$('button:has-text("Layers")');
            
            if (hazardButton) {
                await hazardButton.click();
                await this.page.waitForTimeout(1000);
                await this.takeScreenshot('03-hazard-layers-active');
            }
        } catch (error) {
            console.log('⚠️  Could not find hazard layers button');
        }
        
        // Try to find evacuation routes
        try {
            const routesButton = await this.page.$('[data-testid="evacuation-routes"]') ||
                                await this.page.$('button:has-text("Routes")') ||
                                await this.page.$('button:has-text("Evacuation")');
            
            if (routesButton) {
                await routesButton.click();
                await this.page.waitForTimeout(1000);
                await this.takeScreenshot('04-evacuation-routes-active');
            }
        } catch (error) {
            console.log('⚠️  Could not find evacuation routes button');
        }
        
        // Try to find building status
        try {
            const buildingButton = await this.page.$('[data-testid="building-status"]') ||
                                  await this.page.$('button:has-text("Buildings")') ||
                                  await this.page.$('button:has-text("Status")');
            
            if (buildingButton) {
                await buildingButton.click();
                await this.page.waitForTimeout(1000);
                await this.takeScreenshot('05-building-status-active');
            }
        } catch (error) {
            console.log('⚠️  Could not find building status button');
        }
    }

    async takeComponentScreenshots() {
        console.log('\n🧩 Taking component screenshots...');
        
        // Try different routes or components
        const routes = [
            { name: '06-multi-hazard-map', path: '/multi-hazard' },
            { name: '07-evacuation-dashboard', path: '/evacuation' },
            { name: '08-role-based-routing', path: '/routing' },
            { name: '09-aip-decision-support', path: '/aip' },
            { name: '10-weather-panel', path: '/weather' }
        ];
        
        for (const route of routes) {
            try {
                await this.takeScreenshot(route.name, `http://localhost:3001${route.path}`);
                await this.page.waitForTimeout(1000);
            } catch (error) {
                console.log(`⚠️  Could not access route: ${route.path}`);
            }
        }
    }

    async takeInteractiveScreenshots() {
        console.log('\n🎮 Taking interactive screenshots...');
        
        // Go back to main page
        await this.page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(2000);
        
        // Try to find and click various UI elements
        const interactions = [
            { selector: 'button', name: '11-button-interactions' },
            { selector: '.panel', name: '12-panel-interactions' },
            { selector: '.layer-control', name: '13-layer-controls' },
            { selector: '.search', name: '14-search-functionality' }
        ];
        
        for (const interaction of interactions) {
            try {
                const elements = await this.page.$$(interaction.selector);
                if (elements.length > 0) {
                    await elements[0].click();
                    await this.page.waitForTimeout(1000);
                    await this.takeScreenshot(interaction.name);
                }
            } catch (error) {
                console.log(`⚠️  Could not interact with: ${interaction.selector}`);
            }
        }
    }

    async generateScreenshotReport() {
        console.log('\n📊 Generating screenshot report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalScreenshots: this.screenshots.length,
            screenshots: this.screenshots.map(s => ({
                name: s.name,
                path: s.path,
                size: fs.statSync(s.path).size
            })),
            summary: {
                mainDashboard: this.screenshots.filter(s => s.name.includes('dashboard')).length,
                components: this.screenshots.filter(s => s.name.includes('0')).length,
                interactions: this.screenshots.filter(s => s.name.includes('1')).length
            }
        };
        
        const reportPath = path.join(__dirname, '..', 'screenshots', 'screenshot-report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        console.log(`✅ Screenshot report saved: ${reportPath}`);
        console.log(`📈 Total screenshots taken: ${this.screenshots.length}`);
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }

    async run() {
        try {
            await this.init();
            
            await this.takeMainDashboardScreenshots();
            await this.takeComponentScreenshots();
            await this.takeInteractiveScreenshots();
            
            const report = await this.generateScreenshotReport();
            
            console.log('\n🎉 Screenshot capture complete!');
            console.log('📁 Screenshots saved in: frontend/screenshots/');
            
        } catch (error) {
            console.error('❌ Error during screenshot capture:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// Run the screenshot capture
const screenshotter = new FrontendScreenshotter();
screenshotter.run().catch(console.error);
