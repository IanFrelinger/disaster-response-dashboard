#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface CaptureConfig {
  name: string;
  duration: number;
  description: string;
  actions: string[];
  type: 'static' | 'frontend' | 'interaction';
  url?: string;
  waitFor?: string;
}

class FrontendIntegratedCaptureGenerator {
  private browser: any = null;
  private page: any = null;
  private capturesDir: string;
  private frontendUrl: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.frontendUrl = 'http://localhost:3000';
    this.ensureCapturesDirectory();
  }

  private ensureCapturesDirectory(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Frontend-Integrated Capture Generator...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create context with video recording enabled
    const context = await this.browser.newContext({
      recordVideo: {
        dir: this.capturesDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    this.page = await context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized with video recording enabled');
  }

  async generatePersonalIntro(): Promise<void> {
    console.log('📹 Generating Personal Introduction capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .intro-container {
              text-align: center;
              max-width: 800px;
              padding: 40px;
            }
            .name {
              font-size: 4rem;
              font-weight: 300;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .title {
              font-size: 2rem;
              margin-bottom: 30px;
              opacity: 0.9;
            }
            .mission {
              font-size: 1.4rem;
              line-height: 1.6;
              opacity: 0.8;
              max-width: 600px;
              margin: 0 auto;
            }
            .highlight {
              color: #ffd700;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="intro-container">
            <div class="name">Ian Frelinger</div>
            <div class="title">Disaster Response Platform Architect</div>
            <div class="mission">
              Building intelligent systems that save lives during emergencies. 
              Our platform transforms disaster response from reactive to proactive, 
              leveraging AI and real-time data to coordinate emergency services 
              and protect communities.
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Wait for content to render and record video
    await this.page.waitForTimeout(3000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '01_personal_intro.webm'));
      console.log('✅ Personal Introduction video captured');
    } else {
      console.log('⚠️ No video recording available');
    }
  }

  async generateUserPersona(): Promise<void> {
    console.log('📹 Generating User Persona capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .persona-container {
              text-align: center;
              max-width: 900px;
              padding: 40px;
            }
            .title {
              font-size: 3rem;
              margin-bottom: 40px;
              color: #3498db;
            }
            .personas {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              margin-top: 40px;
            }
            .persona {
              background: rgba(255,255,255,0.1);
              padding: 30px;
              border-radius: 15px;
              backdrop-filter: blur(10px);
            }
            .persona-title {
              font-size: 1.5rem;
              margin-bottom: 15px;
              color: #f39c12;
            }
            .persona-desc {
              font-size: 1.1rem;
              line-height: 1.6;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="persona-container">
            <div class="title">Target Users & Technical Requirements</div>
            <div class="personas">
              <div class="persona">
                <div class="persona-title">Incident Commanders</div>
                <div class="persona-desc">
                  Need real-time situational awareness, resource coordination, 
                  and decision support during active emergencies.
                </div>
              </div>
              <div class="persona">
                <div class="persona-title">Emergency Planners</div>
                <div class="persona-desc">
                  Require comprehensive risk assessment, evacuation planning, 
                  and scenario modeling capabilities.
                </div>
              </div>
              <div class="persona">
                <div class="persona-title">First Responders</div>
                <div class="persona-desc">
                  Need immediate access to critical information, navigation, 
                  and team coordination tools.
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '02_user_persona.webm'));
      console.log('✅ User Persona video captured');
    } else {
      console.log('⚠️ No video recording available');
    }
  }

  async generateFrontendDashboardOverview(): Promise<void> {
    console.log('📹 Generating Frontend Dashboard Overview capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to the frontend - throw error if unavailable
    await this.page.goto(this.frontendUrl, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Navigated to frontend successfully');
    
    // Wait for critical dashboard elements to load
    await this.page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Dashboard loaded successfully');
    
    // Comprehensive dashboard exploration
    console.log('🔍 Exploring dashboard elements...');
    
    // Wait for initial render
    await this.page.waitForTimeout(2000);
    
    // Explore navigation elements
    try {
      const navElements = await this.page.$$('nav, [role="navigation"], .navbar, .header, .menu');
      console.log(`📍 Found ${navElements.length} navigation elements`);
      
      // Click through main navigation items
      for (let i = 0; i < Math.min(navElements.length, 3); i++) {
        await navElements[i].click();
        await this.page.waitForTimeout(1000);
        console.log(`  ✅ Clicked navigation element ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No navigation elements found, continuing...');
    }
    
    // Explore dashboard widgets and cards
    try {
      const dashboardCards = await this.page.$$('.card, .widget, .metric, .stat, [class*="card"], [class*="widget"]');
      console.log(`📊 Found ${dashboardCards.length} dashboard widgets`);
      
      // Hover over key metrics
      for (let i = 0; i < Math.min(dashboardCards.length, 5); i++) {
        await dashboardCards[i].hover();
        await this.page.waitForTimeout(800);
        console.log(`  ✅ Hovered over widget ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No dashboard widgets found, continuing...');
    }
    
    // Explore interactive elements
    try {
      const buttons = await this.page.$$('button, .btn, [role="button"], [class*="button"]');
      console.log(`🔘 Found ${buttons.length} interactive buttons`);
      
      // Click on non-destructive buttons
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        const buttonText = await buttons[i].textContent();
        if (buttonText && !buttonText.toLowerCase().includes('delete') && !buttonText.toLowerCase().includes('remove')) {
          await buttons[i].click();
          await this.page.waitForTimeout(1000);
          console.log(`  ✅ Clicked button: ${buttonText}`);
        }
      }
    } catch (e) {
      console.log('  ℹ️ No interactive buttons found, continuing...');
    }
    
    // Final comprehensive view
    await this.page.waitForTimeout(2000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '03_frontend_dashboard.webm'));
      console.log('✅ Frontend Dashboard Overview video captured');
    } else {
      throw new Error('Video recording failed - no video object available');
    }
  }



  async generateFrontendMapInteraction(): Promise<void> {
    console.log('📹 Generating Frontend Map Interaction capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to the frontend map view - throw error if unavailable
    await this.page.goto(`${this.frontendUrl}/map`, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Navigated to map view successfully');
    
    // Wait for map to load
    await this.page.waitForTimeout(3000);
    
    // Comprehensive map exploration
    console.log('🗺️ Exploring map elements and interactions...');
    
    // Look for map controls and tools
    try {
      const mapControls = await this.page.$$('[data-testid*="map"], .map-control, .map-tool, [class*="map-control"], [class*="map-tool"]');
      console.log(`🎛️ Found ${mapControls.length} map controls`);
      
      // Interact with map controls
      for (let i = 0; i < Math.min(mapControls.length, 4); i++) {
        await mapControls[i].click();
        await this.page.waitForTimeout(1000);
        console.log(`  ✅ Clicked map control ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No specific map controls found, continuing...');
    }
    
    // Explore map layers and overlays
    try {
      const mapLayers = await this.page.$$('.map-layer, .layer-control, [class*="layer"], [class*="overlay"]');
      console.log(`🔍 Found ${mapLayers.length} map layers/overlays`);
      
      // Toggle map layers
      for (let i = 0; i < Math.min(mapLayers.length, 3); i++) {
        await mapLayers[i].click();
        await this.page.waitForTimeout(800);
        console.log(`  ✅ Toggled map layer ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No map layers found, continuing...');
    }
    
    // Simulate map navigation (zoom, pan)
    console.log('🧭 Simulating map navigation...');
    
    // Zoom in
    await this.page.mouse.wheel(0, -100);
    await this.page.waitForTimeout(1000);
    console.log('  ✅ Zoomed in');
    
    // Pan around
    await this.page.mouse.move(500, 400);
    await this.page.mouse.down();
    await this.page.mouse.move(700, 300);
    await this.page.mouse.up();
    await this.page.waitForTimeout(1000);
    console.log('  ✅ Panned map');
    
    // Zoom out
    await this.page.mouse.wheel(0, 100);
    await this.page.waitForTimeout(1000);
    console.log('  ✅ Zoomed out');
    
    // Look for clickable map elements (hazards, routes, etc.)
    try {
      const mapElements = await this.page.$$('[data-testid*="hazard"], [data-testid*="route"], [data-testid*="zone"], .hazard, .route, .zone');
      console.log(`📍 Found ${mapElements.length} map elements (hazards/routes/zones)`);
      
      // Click on map elements
      for (let i = 0; i < Math.min(mapElements.length, 3); i++) {
        await mapElements[i].click();
        await this.page.waitForTimeout(1000);
        console.log(`  ✅ Clicked map element ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No clickable map elements found, continuing...');
    }
    
    // Final map overview
    await this.page.waitForTimeout(2000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '04_frontend_map_interaction.webm'));
      console.log('✅ Frontend Map Interaction video captured');
    } else {
      throw new Error('Video recording failed - no video object available');
    }
  }

  async generateStaticMapInteraction(): Promise<void> {
    console.log('📹 Generating Static Map Interaction (fallback)...');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #2c3e50;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .map-container {
              position: relative;
              width: 100vw;
              height: 100vh;
              background: linear-gradient(45deg, #34495e, #2c3e50);
            }
            .map-overlay {
              position: absolute;
              top: 20px;
              left: 20px;
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 15px;
              border-radius: 10px;
            }
            .hazard-zone {
              position: absolute;
              top: 200px;
              left: 300px;
              width: 150px;
              height: 100px;
              background: rgba(231, 76, 60, 0.3);
              border: 2px solid #e74c3c;
              border-radius: 10px;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { opacity: 0.3; }
              50% { opacity: 0.6; }
              100% { opacity: 0.3; }
            }
            .route {
              position: absolute;
              top: 150px;
              left: 100px;
              width: 200px;
              height: 2px;
              background: #27ae60;
              transform: rotate(45deg);
            }
          </style>
        </head>
        <body>
          <div class="map-container">
            <div class="map-overlay">
              <h3>Live Hazard Map</h3>
              <p>Active Zones: 3 | Safe Routes: 5</p>
            </div>
            <div class="hazard-zone"></div>
            <div class="route"></div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    await this.page.video()?.saveAs(path.join(this.capturesDir, '04_frontend_map_interaction.webm'));
    console.log('✅ Static Map Interaction capture completed');
  }

  async generateFrontendEvacuationDemo(): Promise<void> {
    console.log('📹 Generating Frontend Evacuation Demo capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to evacuation planning view - throw error if unavailable
    await this.page.goto(`${this.frontendUrl}/evacuation`, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Navigated to evacuation view successfully');
    
    // Wait for page to load
    await this.page.waitForTimeout(3000);
    
    // Comprehensive evacuation planning exploration
    console.log('🚨 Exploring evacuation planning features...');
    
    // Look for evacuation planning controls
    try {
      const evacuationControls = await this.page.$$('[data-testid*="evacuation"], .evacuation-control, [class*="evacuation"], .planning-control');
      console.log(`🎛️ Found ${evacuationControls.length} evacuation planning controls`);
      
      // Interact with evacuation controls
      for (let i = 0; i < Math.min(evacuationControls.length, 4); i++) {
        await evacuationControls[i].click();
        await this.page.waitForTimeout(1000);
        console.log(`  ✅ Clicked evacuation control ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No specific evacuation controls found, continuing...');
    }
    
    // Explore evacuation zones and routes
    try {
      const evacuationZones = await this.page.$$('[data-testid*="zone"], [data-testid*="route"], .evacuation-zone, .evacuation-route, [class*="zone"], [class*="route"]');
      console.log(`📍 Found ${evacuationZones.length} evacuation zones/routes`);
      
      // Click on evacuation zones
      for (let i = 0; i < Math.min(evacuationZones.length, 3); i++) {
        await evacuationZones[i].click();
        await this.page.waitForTimeout(1000);
        console.log(`  ✅ Clicked evacuation zone/route ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No evacuation zones/routes found, continuing...');
    }
    
    // Look for planning tools and forms
    try {
      const planningTools = await this.page.$$('form, .form, .planning-tool, [class*="planning"], [class*="form"]');
      console.log(`📝 Found ${planningTools.length} planning tools/forms`);
      
      // Interact with planning forms
      for (let i = 0; i < Math.min(planningTools.length, 2); i++) {
        // Look for input fields
        const inputs = await planningTools[i].$$('input, select, textarea');
        if (inputs.length > 0) {
          await inputs[0].click();
          await inputs[0].type('Test Data');
          await this.page.waitForTimeout(800);
          console.log(`  ✅ Filled planning form ${i + 1}`);
        }
      }
    } catch (e) {
      console.log('  ℹ️ No planning tools/forms found, continuing...');
    }
    
    // Look for evacuation simulation controls
    try {
      const simulationControls = await this.page.$$('[data-testid*="simulate"], [data-testid*="start"], .simulation-control, [class*="simulation"], [class*="start"]');
      console.log(`🎮 Found ${simulationControls.length} simulation controls`);
      
      // Start evacuation simulation
      for (let i = 0; i < Math.min(simulationControls.length, 2); i++) {
        const controlText = await simulationControls[i].textContent();
        if (controlText && (controlText.toLowerCase().includes('start') || controlText.toLowerCase().includes('simulate'))) {
          await simulationControls[i].click();
          await this.page.waitForTimeout(2000);
          console.log(`  ✅ Started evacuation simulation ${i + 1}`);
        }
      }
    } catch (e) {
      console.log('  ℹ️ No simulation controls found, continuing...');
    }
    
    // Look for status and progress indicators
    try {
      const statusIndicators = await this.page.$$('.status, .progress, [class*="status"], [class*="progress"], [data-testid*="status"]');
      console.log(`📊 Found ${statusIndicators.length} status/progress indicators`);
      
      // Hover over status indicators
      for (let i = 0; i < Math.min(statusIndicators.length, 3); i++) {
        await statusIndicators[i].hover();
        await this.page.waitForTimeout(800);
        console.log(`  ✅ Hovered over status indicator ${i + 1}`);
      }
    } catch (e) {
      console.log('  ℹ️ No status indicators found, continuing...');
    }
    
    // Final evacuation planning overview
    await this.page.waitForTimeout(2000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '05_frontend_evacuation_demo.webm'));
      console.log('✅ Frontend Evacuation Demo video captured');
    } else {
      throw new Error('Video recording failed - no video object available');
    }
  }

  async generateStaticEvacuationDemo(): Promise<void> {
    console.log('📹 Generating Static Evacuation Demo (fallback)...');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #ecf0f1;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .evacuation-container {
              padding: 40px;
              max-width: 1200px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .title {
              font-size: 2.5rem;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 1.2rem;
              color: #7f8c8d;
            }
            .evacuation-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
            }
            .evacuation-card {
              background: white;
              padding: 25px;
              border-radius: 15px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .card-title {
              font-size: 1.3rem;
              color: #e74c3c;
              margin-bottom: 15px;
            }
            .route-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="evacuation-container">
            <div class="header">
              <div class="title">Evacuation Planning System</div>
              <div class="subtitle">AI-powered route optimization and safety assessment</div>
            </div>
            <div class="evacuation-grid">
              <div class="evacuation-card">
                <div class="card-title">Zone A - High Risk</div>
                <p>Population: 2,847 | Priority: Critical</p>
                <div class="route-info">
                  <strong>Primary Route:</strong> Highway 101 North<br>
                  <strong>Estimated Time:</strong> 15 minutes<br>
                  <strong>Status:</strong> Active
                </div>
              </div>
              <div class="evacuation-card">
                <div class="card-title">Zone B - Medium Risk</div>
                <p>Population: 1,923 | Priority: High</p>
                <div class="route-info">
                  <strong>Primary Route:</strong> Main Street East<br>
                  <strong>Estimated Time:</strong> 22 minutes<br>
                  <strong>Status:</strong> Preparing
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    await this.page.video()?.saveAs(path.join(this.capturesDir, '05_frontend_evacuation_demo.webm'));
    console.log('✅ Static Evacuation Demo capture completed');
  }

  async generateTechnicalImplementation(): Promise<void> {
    console.log('📹 Generating Technical Implementation capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #1a1a1a;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              color: #00ff00;
            }
            .code-container {
              padding: 40px;
              max-width: 1400px;
              margin: 0 auto;
            }
            .title {
              font-size: 2rem;
              color: #00ff00;
              margin-bottom: 30px;
              text-align: center;
            }
            .code-block {
              background: #2d2d2d;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 20px;
              border-left: 4px solid #00ff00;
            }
            .code-header {
              color: #ffff00;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .code-content {
              line-height: 1.6;
            }
            .highlight {
              color: #ff6b6b;
            }
            .comment {
              color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="code-container">
            <div class="title">Technical Implementation & Architecture</div>
            
            <div class="code-block">
              <div class="code-header">API Architecture (Foundry Integration)</div>
              <div class="code-content">
                <span class="highlight">class</span> DisasterResponseAPI {<br>
                &nbsp;&nbsp;<span class="comment">// Real-time hazard data processing</span><br>
                &nbsp;&nbsp;async <span class="highlight">processHazardData</span>(data: HazardData) {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="highlight">const</span> processed = await this.hazardProcessor.analyze(data);<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="highlight">return</span> this.routeOptimizer.calculateSafeRoutes(processed);<br>
                &nbsp;&nbsp;}<br>
                }
              </div>
            </div>
            
            <div class="code-block">
              <div class="code-header">AI Decision Support Engine</div>
              <div class="code-content">
                <span class="highlight">class</span> AIDecisionEngine {<br>
                &nbsp;&nbsp;<span class="comment">// Machine learning model integration</span><br>
                &nbsp;&nbsp;async <span class="highlight">generateRecommendations</span>(context: EmergencyContext) {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="highlight">const</span> predictions = await this.mlModel.predict(context);<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="highlight">return</span> this.strategyEngine.optimize(predictions);<br>
                &nbsp;&nbsp;}<br>
                }
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '06_technical_implementation.webm'));
      console.log('✅ Technical Implementation video captured');
    } else {
      console.log('⚠️ No video recording available');
    }
  }

  async generateStrongCTA(): Promise<void> {
    console.log('📹 Generating Strong Call-to-Action capture...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .cta-container {
              text-align: center;
              max-width: 800px;
              padding: 40px;
            }
            .title {
              font-size: 3.5rem;
              margin-bottom: 30px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .subtitle {
              font-size: 1.5rem;
              margin-bottom: 40px;
              opacity: 0.9;
            }
            .cta-button {
              display: inline-block;
              background: #f39c12;
              color: white;
              padding: 20px 40px;
              font-size: 1.3rem;
              text-decoration: none;
              border-radius: 50px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .cta-button:hover {
              background: #e67e22;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            .stats {
              margin-top: 40px;
              display: flex;
              justify-content: center;
              gap: 40px;
            }
            .stat {
              text-align: center;
            }
            .stat-number {
              font-size: 2rem;
              font-weight: bold;
              color: #f39c12;
            }
            .stat-label {
              font-size: 1rem;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="cta-container">
            <div class="title">Transform Emergency Response Today</div>
            <div class="subtitle">
              Join leading emergency management agencies using our platform 
              to save lives and protect communities
            </div>
            <a href="#" class="cta-button">Schedule Demo & Implementation</a>
            <div class="stats">
              <div class="stat">
                <div class="stat-number">95%</div>
                <div class="stat-label">Faster Response</div>
              </div>
              <div class="stat">
                <div class="stat-number">3x</div>
                <div class="stat-label">Efficiency Gain</div>
              </div>
              <div class="stat">
                <div class="stat-number">1000+</div>
                <div class="stat-label">Lives Saved</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    
    // Save the recorded video
    const video = this.page.video();
    if (video) {
      await video.saveAs(path.join(this.capturesDir, '07_strong_cta.webm'));
      console.log('✅ Strong Call-to-Action video captured');
    } else {
      console.log('⚠️ No video recording available');
    }
  }

  async generateAllCaptures(): Promise<void> {
    console.log('🎬 Starting enhanced capture generation with frontend integration...');
    
    try {
      await this.initialize();
      
      // Generate static content captures
      await this.generatePersonalIntro();
      await this.generateUserPersona();
      
      // Generate comprehensive frontend captures (NO FALLBACKS - FAIL FAST)
      console.log('🌐 Starting frontend integration captures...');
      await this.generateFrontendDashboardOverview();
      await this.generateFrontendMapInteraction();
      await this.generateFrontendEvacuationDemo();
      
      // Generate technical content
      await this.generateTechnicalImplementation();
      await this.generateStrongCTA();
      
      console.log('🎉 All enhanced captures generated successfully!');
      
    } catch (error) {
      console.error('❌ Error during capture generation:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Cleanup completed');
    }
  }
}

// Main execution
async function main() {
  try {
    const generator = new FrontendIntegratedCaptureGenerator();
    await generator.generateAllCaptures();
  } catch (error) {
    console.error('❌ Capture generation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FrontendIntegratedCaptureGenerator };
