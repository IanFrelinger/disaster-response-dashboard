#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveScreenshotter {
    constructor() {
        this.screenshots = [];
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Launching browser for comprehensive screenshots...');
        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 500
        });
        this.page = await this.browser.newPage();
        
        // Set viewport to match video dimensions
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        
        console.log('✅ Browser launched successfully');
    }

    async takeScreenshot(name, description, url = 'http://localhost:3000', selector = null, waitFor = null, action = null) {
        try {
            console.log(`📸 Taking screenshot: ${name} - ${description}`);
            
            // Navigate to the page
            await this.page.goto(url, { waitUntil: 'networkidle' });
            
            // Wait for specific element if provided
            if (waitFor) {
                await this.page.waitForSelector(waitFor, { timeout: 10000 });
            }
            
            // Perform action if specified
            if (action) {
                await action(this.page);
            }
            
            // Wait for animations to complete
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
            
            this.screenshots.push({ 
                name, 
                description,
                path: screenshotPath,
                url: url
            });
            console.log(`✅ Screenshot saved: ${screenshotPath}`);
            
        } catch (error) {
            console.error(`❌ Error taking screenshot ${name}:`, error.message);
        }
    }

    async captureMainDashboard() {
        console.log('\n🎯 Capturing Main Dashboard Views...');
        
        // Main dashboard overview
        await this.takeScreenshot(
            '01-main-dashboard-overview',
            'Main dashboard with overview panels and navigation',
            'http://localhost:3000'
        );
        
        // Dashboard with key metrics
        await this.takeScreenshot(
            '02-dashboard-with-metrics',
            'Dashboard showing key performance metrics and status indicators',
            'http://localhost:3000'
        );
        
        // Navigation menu open
        await this.takeScreenshot(
            '03-navigation-menu-open',
            'Navigation menu expanded showing all available sections',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                const menuButton = await page.$('button[aria-label="Menu"]') || 
                                  await page.$('[data-testid="menu-button"]') ||
                                  await page.$('button:has-text("Menu")');
                if (menuButton) await menuButton.click();
            }
        );
    }

    async captureMapViews() {
        console.log('\n🗺️  Capturing Map and Visualization Views...');
        
        // Multi-hazard map
        await this.takeScreenshot(
            '04-multi-hazard-map',
            'Interactive map showing multiple hazard layers and data visualization',
            'http://localhost:3000/multi-hazard'
        );
        
        // Map with hazard layers active
        await this.takeScreenshot(
            '05-map-hazard-layers-active',
            'Map with hazard layers toggled on showing fire, flood, and weather data',
            'http://localhost:3000/multi-hazard',
            null,
            null,
            async (page) => {
                // Try to activate hazard layers
                const hazardButton = await page.$('[data-testid="hazard-layers"]') || 
                                    await page.$('button:has-text("Hazards")') ||
                                    await page.$('button:has-text("Layers")');
                if (hazardButton) await hazardButton.click();
            }
        );
        
        // Map with evacuation routes
        await this.takeScreenshot(
            '06-map-evacuation-routes',
            'Map displaying evacuation routes and safe passage corridors',
            'http://localhost:3000/multi-hazard',
            null,
            null,
            async (page) => {
                // Try to show evacuation routes
                const routesButton = await page.$('[data-testid="evacuation-routes"]') || 
                                    await page.$('button:has-text("Routes")') ||
                                    await page.$('button:has-text("Evacuation")');
                if (routesButton) await routesButton.click();
            }
        );
        
        // 3D terrain view
        await this.takeScreenshot(
            '07-3d-terrain-view',
            '3D terrain visualization with elevation and topographic data',
            'http://localhost:3000/multi-hazard',
            null,
            null,
            async (page) => {
                // Try to activate 3D view
                const threeDButton = await page.$('[data-testid="3d-view"]') || 
                                    await page.$('button:has-text("3D")') ||
                                    await page.$('button:has-text("Terrain")');
                if (threeDButton) await threeDButton.click();
            }
        );
    }

    async captureEvacuationDashboard() {
        console.log('\n🚨 Capturing Evacuation Management Views...');
        
        // Evacuation dashboard main view
        await this.takeScreenshot(
            '08-evacuation-dashboard-main',
            'Main evacuation management interface with route planning tools',
            'http://localhost:3000/evacuation'
        );
        
        // Route planning interface
        await this.takeScreenshot(
            '09-route-planning-interface',
            'Route planning interface with origin, destination, and optimization settings',
            'http://localhost:3000/evacuation',
            null,
            null,
            async (page) => {
                // Try to show route planning tools
                const planningButton = await page.$('[data-testid="route-planning"]') || 
                                      await page.$('button:has-text("Plan Route")') ||
                                      await page.$('button:has-text("Planning")');
                if (planningButton) await planningButton.click();
            }
        );
        
        // Evacuation zones
        await this.takeScreenshot(
            '10-evacuation-zones',
            'Map showing evacuation zones and affected areas',
            'http://localhost:3000/evacuation',
            null,
            null,
            async (page) => {
                // Try to show evacuation zones
                const zonesButton = await page.$('[data-testid="evacuation-zones"]') || 
                                   await page.$('button:has-text("Zones")') ||
                                   await page.$('button:has-text("Areas")');
                if (zonesButton) await zonesButton.click();
            }
        );
    }

    async captureRoleBasedViews() {
        console.log('\n👥 Capturing Role-Based Interface Views...');
        
        // Commander view
        await this.takeScreenshot(
            '11-commander-view',
            'Strategic commander interface with high-level overview and decision tools',
            'http://localhost:3000/routing'
        );
        
        // First responder view
        await this.takeScreenshot(
            '12-first-responder-view',
            'Tactical first responder interface with detailed operational information',
            'http://localhost:3000/routing',
            null,
            null,
            async (page) => {
                // Try to switch to responder view
                const responderButton = await page.$('[data-testid="responder-view"]') || 
                                       await page.$('button:has-text("Responder")') ||
                                       await page.$('button:has-text("Tactical")');
                if (responderButton) await responderButton.click();
            }
        );
        
        // Public information view
        await this.takeScreenshot(
            '13-public-information-view',
            'Public information interface with citizen-facing alerts and updates',
            'http://localhost:3000/routing',
            null,
            null,
            async (page) => {
                // Try to switch to public view
                const publicButton = await page.$('[data-testid="public-view"]') || 
                                    await page.$('button:has-text("Public")') ||
                                    await page.$('button:has-text("Citizen")');
                if (publicButton) await publicButton.click();
            }
        );
    }

    async captureAIPDecisionSupport() {
        console.log('\n🤖 Capturing AI Decision Support Views...');
        
        // AIP decision support main
        await this.takeScreenshot(
            '14-aip-decision-support-main',
            'AI-powered decision support interface with recommendations and insights',
            'http://localhost:3000/aip'
        );
        
        // AI recommendations panel
        await this.takeScreenshot(
            '15-ai-recommendations-panel',
            'Panel showing AI-generated recommendations for resource allocation',
            'http://localhost:3000/aip',
            null,
            null,
            async (page) => {
                // Try to show recommendations
                const recButton = await page.$('[data-testid="recommendations"]') || 
                                 await page.$('button:has-text("Recommendations")') ||
                                 await page.$('button:has-text("AI Insights")');
                if (recButton) await recButton.click();
            }
        );
        
        // Risk analysis view
        await this.takeScreenshot(
            '16-risk-analysis-view',
            'Risk analysis interface with threat assessment and probability modeling',
            'http://localhost:3000/aip',
            null,
            null,
            async (page) => {
                // Try to show risk analysis
                const riskButton = await page.$('[data-testid="risk-analysis"]') || 
                                  await page.$('button:has-text("Risk")') ||
                                  await page.$('button:has-text("Analysis")');
                if (riskButton) await riskButton.click();
            }
        );
    }

    async captureWeatherPanel() {
        console.log('\n🌤️  Capturing Weather and Environmental Views...');
        
        // Weather panel main
        await this.takeScreenshot(
            '17-weather-panel-main',
            'Weather information panel with current conditions and forecasts',
            'http://localhost:3000/weather'
        );
        
        // Weather forecast view
        await this.takeScreenshot(
            '18-weather-forecast-view',
            'Extended weather forecast with multiple time periods and conditions',
            'http://localhost:3000/weather',
            null,
            null,
            async (page) => {
                // Try to show forecast
                const forecastButton = await page.$('[data-testid="forecast"]') || 
                                      await page.$('button:has-text("Forecast")') ||
                                      await page.$('button:has-text("Extended")');
                if (forecastButton) await forecastButton.click();
            }
        );
        
        // Environmental conditions
        await this.takeScreenshot(
            '19-environmental-conditions',
            'Environmental monitoring with air quality, wind patterns, and other factors',
            'http://localhost:3000/weather',
            null,
            null,
            async (page) => {
                // Try to show environmental data
                const envButton = await page.$('[data-testid="environmental"]') || 
                                 await page.$('button:has-text("Environmental")') ||
                                 await page.$('button:has-text("Conditions")');
                if (envButton) await envButton.click();
            }
        );
    }

    async captureInteractiveElements() {
        console.log('\n🎮 Capturing Interactive Elements and Controls...');
        
        // Button interactions
        await this.takeScreenshot(
            '20-button-interactions',
            'Various interactive buttons and controls throughout the interface',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                // Try to interact with buttons
                const buttons = await page.$$('button');
                if (buttons.length > 0) {
                    await buttons[0].hover();
                }
            }
        );
        
        // Panel interactions
        await this.takeScreenshot(
            '21-panel-interactions',
            'Expandable panels and collapsible sections in the interface',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                // Try to expand panels
                const panels = await page.$$('.panel, .collapsible, [data-testid*="panel"]');
                if (panels.length > 0) {
                    await panels[0].click();
                }
            }
        );
        
        // Search functionality
        await this.takeScreenshot(
            '22-search-functionality',
            'Search interface with filters and query capabilities',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                // Try to activate search
                const searchBox = await page.$('input[type="search"], input[placeholder*="search"], [data-testid="search"]');
                if (searchBox) {
                    await searchBox.click();
                    await searchBox.type('test');
                }
            }
        );
        
        // Settings and configuration
        await this.takeScreenshot(
            '23-settings-configuration',
            'Settings panel with user preferences and system configuration',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                // Try to open settings
                const settingsButton = await page.$('[data-testid="settings"]') || 
                                      await page.$('button:has-text("Settings")') ||
                                      await page.$('button:has-text("Config")');
                if (settingsButton) await settingsButton.click();
            }
        );
    }

    async captureAlertsAndNotifications() {
        console.log('\n🚨 Capturing Alerts and Notification Systems...');
        
        // Alert center
        await this.takeScreenshot(
            '24-alert-center',
            'Central alert management system with active notifications',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                // Try to show alerts
                const alertButton = await page.$('[data-testid="alerts"]') || 
                                   await page.$('button:has-text("Alerts")') ||
                                   await page.$('button:has-text("Notifications")');
                if (alertButton) await alertButton.click();
            }
        );
        
        // Emergency notifications
        await this.takeScreenshot(
            '25-emergency-notifications',
            'Emergency notification system with priority alerts and status tracking',
            'http://localhost:3000',
            null,
            null,
            async (page) => {
                // Try to show emergency notifications
                const emergencyButton = await page.$('[data-testid="emergency"]') || 
                                       await page.$('button:has-text("Emergency")') ||
                                       await page.$('button:has-text("Priority")');
                if (emergencyButton) await emergencyButton.click();
            }
        );
    }

    async generateScreenshotReport() {
        console.log('\n📊 Generating comprehensive screenshot report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalScreenshots: this.screenshots.length,
            screenshots: this.screenshots.map(s => ({
                name: s.name,
                description: s.description,
                path: s.path,
                url: s.url,
                size: fs.statSync(s.path).size
            })),
            categories: {
                dashboard: this.screenshots.filter(s => s.name.includes('dashboard')).length,
                map: this.screenshots.filter(s => s.name.includes('map')).length,
                evacuation: this.screenshots.filter(s => s.name.includes('evacuation')).length,
                roleBased: this.screenshots.filter(s => s.name.includes('view')).length,
                aip: this.screenshots.filter(s => s.name.includes('aip')).length,
                weather: this.screenshots.filter(s => s.name.includes('weather')).length,
                interactive: this.screenshots.filter(s => s.name.includes('interaction')).length,
                alerts: this.screenshots.filter(s => s.name.includes('alert')).length
            }
        };

        const reportPath = path.join(__dirname, '..', 'screenshots', 'comprehensive-screenshot-report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        console.log(`✅ Comprehensive screenshot report saved: ${reportPath}`);
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
            
            await this.captureMainDashboard();
            await this.captureMapViews();
            await this.captureEvacuationDashboard();
            await this.captureRoleBasedViews();
            await this.captureAIPDecisionSupport();
            await this.captureWeatherPanel();
            await this.captureInteractiveElements();
            await this.captureAlertsAndNotifications();
            
            const report = await this.generateScreenshotReport();
            
            console.log('\n🎉 Comprehensive screenshot capture complete!');
            console.log('📁 Screenshots saved in: frontend/screenshots/');
            
        } catch (error) {
            console.error('❌ Error during screenshot capture:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// Run comprehensive screenshot capture
const screenshotter = new ComprehensiveScreenshotter();
screenshotter.run().catch(console.error);
