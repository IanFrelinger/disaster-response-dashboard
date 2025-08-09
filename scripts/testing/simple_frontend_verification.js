#!/usr/bin/env node
/**
 * Simple Frontend Verification Test
 * Basic UI functionality check after cleanup
 */

const { chromium } = require('playwright');

async function runSimpleVerification() {
    console.log('🔍 Starting Simple Frontend Verification');
    console.log('='.repeat(50));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Test 1: Basic Page Load
        console.log('\n📄 Test 1: Basic Page Load');
        console.log('-'.repeat(30));
        
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        console.log('✅ Page loaded successfully');
        
        const title = await page.title();
        console.log(`✅ Page title: ${title}`);
        
        // Test 2: Main Content
        console.log('\n🎯 Test 2: Main Content');
        console.log('-'.repeat(30));
        
        const rootElement = await page.locator('#root').isVisible();
        console.log(`✅ Root element visible: ${rootElement}`);
        
        // Check for any heading
        const headings = await page.locator('h1, h2, h3').count();
        console.log(`✅ Headings found: ${headings}`);
        
        // Test 3: Navigation
        console.log('\n🧭 Test 3: Navigation');
        console.log('-'.repeat(30));
        
        // Look for any navigation links
        const navLinks = await page.locator('nav a, a[href]').count();
        console.log(`✅ Navigation links found: ${navLinks}`);
        
        // Test 4: Map Component
        console.log('\n🗺️ Test 4: Map Component');
        console.log('-'.repeat(30));
        
        // Check for Mapbox elements
        const mapboxElements = await page.locator('.mapboxgl-canvas-container, .mapboxgl-canvas').count();
        console.log(`✅ Mapbox elements found: ${mapboxElements}`);
        
        // Check for any canvas elements (maps usually use canvas)
        const canvasElements = await page.locator('canvas').count();
        console.log(`✅ Canvas elements found: ${canvasElements}`);
        
        // Test 5: Interactive Elements
        console.log('\n🖱️ Test 5: Interactive Elements');
        console.log('-'.repeat(30));
        
        // Look for buttons
        const buttons = await page.locator('button').count();
        console.log(`✅ Buttons found: ${buttons}`);
        
        // Look for clickable elements
        const clickableElements = await page.locator('button, a, [role="button"]').count();
        console.log(`✅ Clickable elements found: ${clickableElements}`);
        
        // Test 6: Data Display
        console.log('\n📊 Test 6: Data Display');
        console.log('-'.repeat(30));
        
        // Look for any text content that might indicate data
        const textContent = await page.locator('body').textContent();
        const hasData = textContent.includes('hazard') || textContent.includes('unit') || textContent.includes('route');
        console.log(`✅ Data content detected: ${hasData}`);
        
        // Test 7: Responsive Check
        console.log('\n📱 Test 7: Responsive Check');
        console.log('-'.repeat(30));
        
        // Test mobile viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        console.log('✅ Mobile viewport applied');
        
        // Check if content is still visible
        const mobileContent = await page.locator('#root').isVisible();
        console.log(`✅ Content visible on mobile: ${mobileContent}`);
        
        // Reset to desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        console.log('✅ Desktop viewport restored');
        
        // Test 8: Console Errors
        console.log('\n⚠️ Test 8: Console Errors');
        console.log('-'.repeat(30));
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Reload page to capture errors
        await page.reload({ waitUntil: 'networkidle' });
        console.log(`✅ Console errors found: ${consoleErrors.length}`);
        
        if (consoleErrors.length > 0) {
            console.log('⚠️ Console errors:');
            consoleErrors.forEach(error => console.log(`   - ${error}`));
        }
        
        // Test 9: Network Requests
        console.log('\n🌐 Test 9: Network Requests');
        console.log('-'.repeat(30));
        
        const requests = [];
        page.on('request', request => {
            requests.push(request.url());
        });
        
        // Navigate to trigger requests
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        
        const apiRequests = requests.filter(url => url.includes('/api/'));
        console.log(`✅ API requests made: ${apiRequests.length}`);
        
        // Test 10: Final State
        console.log('\n✅ Test 10: Final State');
        console.log('-'.repeat(30));
        
        const finalUrl = page.url();
        console.log(`✅ Final URL: ${finalUrl}`);
        
        const finalTitle = await page.title();
        console.log(`✅ Final title: ${finalTitle}`);
        
        // Check if page is still responsive
        const bodyText = await page.locator('body').textContent();
        console.log(`✅ Page has content: ${bodyText.length > 0}`);
        
        console.log('\n🎉 Simple Frontend Verification Completed!');
        
        // Summary
        console.log('\n📋 Summary:');
        console.log('-'.repeat(30));
        console.log(`✅ Page loads: Yes`);
        console.log(`✅ Navigation works: ${navLinks > 0}`);
        console.log(`✅ Map component: ${mapboxElements > 0 || canvasElements > 0}`);
        console.log(`✅ Interactive elements: ${clickableElements > 0}`);
        console.log(`✅ Data integration: ${hasData}`);
        console.log(`✅ Responsive design: ${mobileContent}`);
        console.log(`✅ No console errors: ${consoleErrors.length === 0}`);
        console.log(`✅ API integration: ${apiRequests.length > 0}`);
        
    } catch (error) {
        console.error('❌ Simple Verification Failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the verification
runSimpleVerification().catch(console.error);
