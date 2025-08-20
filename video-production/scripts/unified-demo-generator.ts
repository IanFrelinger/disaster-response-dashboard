#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class UnifiedDemoGenerator {
  private browser: Browser | null = null;
  private capturesDir: string;
  private voScriptPath: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.voScriptPath = path.join(__dirname, '..', 'UNIFIED_VO_SCRIPT.md');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  private log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[level];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private async initializeBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    this.log('✅ Browser initialized', 'success');
  }

  private async generateSlide(filename: string, title: string, content: string): Promise<void> {
    this.log(`📹 Generating slide: ${title}`);
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const htmlContent = this.createSlideHTML(title, content);
    await page.setContent(htmlContent);
    
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(this.capturesDir, `${filename}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    this.log(`✅ Slide saved: ${screenshotPath}`, 'success');
    await context.close();
  }

  private async generateSlideWithChart(filename: string, title: string, content: string, chartFilename: string): Promise<void> {
    this.log(`📹 Generating slide with chart: ${title}`);
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const htmlContent = this.createSlideWithChartHTML(title, content, chartFilename);
    await page.setContent(htmlContent);
    
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(this.capturesDir, `${filename}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    this.log(`✅ Slide with chart saved: ${screenshotPath}`, 'success');
    await context.close();
  }

  private createSlideHTML(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0d1117 0%, #161b22 25%, #21262d 50%, #161b22 75%, #0d1117 100%);
              color: #f0f6fc;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              margin: 0;
              padding: 0;
            }
            
            .slide-container {
              max-width: 1400px;
              width: 90%;
              text-align: center;
              padding: 80px 60px;
              background: linear-gradient(145deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.98) 50%, rgba(33, 38, 45, 0.98) 100%);
              border-radius: 8px;
              border: 1px solid rgba(48, 54, 61, 0.6);
              box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(48, 54, 61, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
              backdrop-filter: blur(30px);
              position: relative;
            }
            
            .title {
              font-size: 2.8rem;
              font-weight: 700;
              margin-bottom: 40px;
              color: #ffffff;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
              letter-spacing: -0.01em;
              position: relative;
            }
            
            .title::after {
              content: '';
              position: absolute;
              bottom: -12px;
              left: 50%;
              transform: translateX(-50%);
              width: 60px;
              height: 2px;
              background: linear-gradient(90deg, #58a6ff, #1f6feb);
              border-radius: 1px;
            }
            
            .content {
              font-size: 1.4rem;
              line-height: 1.6;
              color: #e6edf3;
              max-width: 1000px;
              margin: 0 auto;
              text-align: left;
              font-weight: 400;
            }
            
            .highlight {
              color: #58a6ff;
              font-weight: 600;
              text-shadow: 0 0 12px rgba(88, 166, 255, 0.2);
            }
            
            .tech-term {
              color: #1f6feb;
              font-weight: 500;
              text-shadow: 0 0 10px rgba(31, 111, 235, 0.2);
            }
            
            .api-endpoint {
              font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
              background: rgba(13, 17, 23, 0.9);
              padding: 4px 8px;
              border-radius: 4px;
              color: #79c0ff;
              border: 1px solid rgba(88, 166, 255, 0.2);
              font-size: 0.85em;
              font-weight: 500;
            }
            
            .data-flow {
              color: #fbbf24;
              font-weight: 600;
              text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
            }
            
            .user-action {
              color: #10b981;
              font-weight: 600;
              font-style: italic;
              background: rgba(16, 185, 129, 0.1);
              padding: 8px 12px;
              border-radius: 6px;
              border-left: 3px solid #10b981;
              display: inline-block;
              margin-bottom: 10px;
            }
            
            .outcome {
              color: #f59e0b;
              font-weight: 600;
              background: rgba(245, 158, 11, 0.1);
              padding: 8px 12px;
              border-radius: 6px;
              border-left: 3px solid #f59e0b;
              display: inline-block;
              margin-top: 10px;
            }
            
            .foundry-callout {
              color: #8b5cf6;
              font-weight: 600;
              background: rgba(139, 92, 246, 0.1);
              padding: 8px 12px;
              border-radius: 6px;
              border-left: 3px solid #8b5cf6;
              display: inline-block;
            }
            
            .h3-callout {
              color: #ec4899;
              font-weight: 600;
              background: rgba(236, 72, 153, 0.1);
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 0.9em;
            }
            
            .training-note {
              color: #6b7280;
              font-weight: 500;
              font-style: italic;
              background: rgba(107, 114, 128, 0.1);
              padding: 6px 10px;
              border-radius: 4px;
              border-left: 2px solid #6b7280;
              font-size: 0.9em;
            }
            
            .privacy-note {
              color: #059669;
              font-weight: 500;
              background: rgba(5, 150, 105, 0.1);
              padding: 6px 10px;
              border-radius: 4px;
              border-left: 2px solid #059669;
              font-size: 0.85em;
            }
            
            .metric {
              color: #7c3aed;
              font-weight: 600;
              text-shadow: 0 0 10px rgba(124, 58, 237, 0.2);
            }
            
            .fade-in {
              animation: fadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes fadeIn {
              from { 
                opacity: 0; 
                transform: translateY(30px) scale(0.98); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
              }
            }
          </style>
        </head>
        <body>
          <div class="slide-container fade-in">
            <h1 class="title">${title}</h1>
            <div class="content">${content}</div>
          </div>
        </body>
      </html>
    `;
  }

  private createSlideWithChartHTML(title: string, content: string, chartFilename: string): string {
    const chartPath = path.join(this.capturesDir, 'mermaid-charts', chartFilename);
    const chartBase64 = fs.readFileSync(chartPath).toString('base64');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0d1117 0%, #161b22 25%, #21262d 50%, #161b22 75%, #0d1117 100%);
              color: #f0f6fc;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              margin: 0;
              padding: 0;
            }
            
            .slide-container {
              max-width: 1600px;
              width: 95%;
              text-align: center;
              padding: 60px 40px;
              background: linear-gradient(145deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.98) 50%, rgba(33, 38, 45, 0.98) 100%);
              border-radius: 8px;
              border: 1px solid rgba(48, 54, 61, 0.6);
              box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(48, 54, 61, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
              backdrop-filter: blur(30px);
              position: relative;
            }
            
            .title {
              font-size: 2.4rem;
              font-weight: 700;
              margin-bottom: 30px;
              color: #ffffff;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
              letter-spacing: -0.01em;
              position: relative;
            }
            
            .title::after {
              content: '';
              position: absolute;
              bottom: -10px;
              left: 50%;
              transform: translateX(-50%);
              width: 50px;
              height: 2px;
              background: linear-gradient(90deg, #58a6ff, #1f6feb);
              border-radius: 1px;
            }
            
            .slide-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              align-items: center;
              max-width: 1400px;
              margin: 0 auto;
            }
            
            .text-content {
              text-align: left;
              font-size: 1.2rem;
              line-height: 1.6;
              color: #e6edf3;
              font-weight: 400;
            }
            
            .chart-container {
              display: flex;
              justify-content: center;
              align-items: center;
              background: rgba(13, 17, 23, 0.8);
              border-radius: 8px;
              padding: 20px;
              border: 1px solid rgba(48, 54, 61, 0.4);
            }
            
            .chart-image {
              max-width: 100%;
              max-height: 600px;
              border-radius: 6px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            }
            
            .highlight {
              color: #58a6ff;
              font-weight: 600;
              text-shadow: 0 0 12px rgba(88, 166, 255, 0.2);
            }
            
            .tech-term {
              color: #1f6feb;
              font-weight: 500;
              text-shadow: 0 0 10px rgba(31, 111, 235, 0.2);
            }
            
            .api-endpoint {
              font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
              background: rgba(13, 17, 23, 0.9);
              padding: 4px 8px;
              border-radius: 4px;
              color: #79c0ff;
              border: 1px solid rgba(88, 166, 255, 0.2);
              font-size: 0.85em;
              font-weight: 500;
            }
            
            .data-flow {
              color: #fbbf24;
              font-weight: 600;
              text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
            }
            
            .metric {
              color: #7c3aed;
              font-weight: 600;
              text-shadow: 0 0 10px rgba(124, 58, 237, 0.2);
            }
            
            .fade-in {
              animation: fadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes fadeIn {
              from { 
                opacity: 0; 
                transform: translateY(30px) scale(0.98); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
              }
            }
          </style>
        </head>
        <body>
          <div class="slide-container fade-in">
            <h1 class="title">${title}</h1>
            <div class="slide-content">
              <div class="text-content">${content}</div>
              <div class="chart-container">
                <img src="data:image/png;base64,${chartBase64}" alt="Technical Architecture Diagram" class="chart-image">
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  public async generateAllContent(): Promise<void> {
    try {
      await this.initializeBrowser();
      
      this.log('🎬 Generating unified demo content...');
      
      // Generate all slides
      await this.generateMainDemoSlides();
      await this.generateTechnicalInsertSlides();
      
      // Generate unified VO script
      await this.generateUnifiedVOScript();
      
      this.log('✅ All demo content generated successfully!');
      
    } catch (error) {
      this.log(`❌ Error generating demo content: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // Main Demo Slides (Original 12)
  private async generateMainDemoSlides(): Promise<void> {
    this.log('📹 Generating main demo slides...');
    
    await this.generateSlide('01_main_dashboard_overview', 'Disaster Response Dashboard', `
      <p>For <u>Incident Commanders and emergency planners</u> who need a single operational picture.</p>
      <br>
      <p>Welcome to the <u>Disaster Response Dashboard</u> - a unified platform that transforms emergency management through <u>real-time data fusion</u> and <u>intelligent decision support</u>.</p>
      <br>
      <p>This system integrates <u>multiple data sources</u>, provides <u>ML-powered hazard analysis</u>, and delivers <u>optimized evacuation routes</u> for emergency responders.</p>
      <br>
      <p>Built on <u>Palantir Foundry architecture</u> with <u>real-time processing</u> and <u>spatial intelligence</u>.</p>
    `);

    await this.generateSlide('02_live_hazard_map', 'Live Hazard Map', `
      <p><u>User Action: Toggle Buildings & Weather layers, Center on hazard</u></p>
      <br>
      <p>The <u>Live Hazard Map</u> displays real-time emergency incidents with <u>spatial intelligence</u> and <u>risk assessment</u>.</p>
      <br>
      <p>Active hazards are shown with <u>color-coded risk levels</u>, <u>risk scoring and proximity context</u>, and <u>affected areas</u>.</p>
      <br>
      <p>Data sources include <u>NASA FIRMS satellite feeds</u>, <u>NOAA weather data</u>, and <u>911 emergency calls</u>.</p>
      <br>
      <p><u>Focusing early prevents dispatching units into deteriorating areas.</u></p>
    `);

    await this.generateSlide('03_emergency_units_panel', 'Emergency Units Panel', `
      <p><u>User Action: Select unit from roster</u></p>
      <br>
      <p>The <u>Emergency Units Panel</u> provides real-time visibility into <u>resource deployment</u> and <u>unit status</u>.</p>
      <br>
      <p>Track <u>fire engines</u>, <u>ambulances</u>, and <u>police units</u> with <u>GPS positioning</u> and <u>operational status</u>.</p>
      <br>
      <p>Units are categorized by <u>response type</u>, <u>availability</u>, and <u>current assignments</u>.</p>
      <br>
      <p><u>Selecting the right unit reduces time-to-arrival and risk.</u></p>
    `);

    await this.generateSlide('04_route_optimization', 'Route Optimization', `
      <p><u>User Action: Choose Fire Tactical profile</u></p>
      <br>
      <p><u>Route Optimization</u> calculates <u>safe evacuation paths</u> using <u>A* algorithm</u> with <u>hazard avoidance</u>.</p>
      <br>
      <p>Routes consider <u>traffic conditions</u>, <u>road closures</u>, <u>hazard zones</u>, and <u>vehicle constraints</u>.</p>
      <br>
      <p>Real-time updates ensure <u>optimal pathfinding</u> as conditions change during emergency response.</p>
      <br>
      <p><u>Profile-based routing keeps crews out of smoke/closures.</u></p>
    `);

    await this.generateSlide('05_aip_decision_support', 'AIP Decision Support', `
      <p><u>User Action: Review AI recommendations</u></p>
      <br>
      <p>The <u>AIP Decision Support</u> system provides <u>intelligent recommendations</u> for emergency response coordination.</p>
      <br>
      <p>Analyzes <u>resource availability</u>, <u>hazard progression</u>, and <u>response priorities</u> to suggest <u>optimal actions</u>.</p>
      <br>
      <p>Powered by <u>machine learning models</u> trained on historical emergency data and <u>real-time analytics</u>.</p>
      <br>
      <p><u>Models are trained on historical and synthetic scenarios; we validate continuously against recent events.</u></p>
    `);

    await this.generateSlide('06_building_evacuation_tracker', 'Building Evacuation Tracker', `
      <p><u>User Action: Monitor evacuation progress</u></p>
      <br>
      <p>The <u>Building Evacuation Tracker</u> monitors <u>evacuation progress</u> and <u>occupant safety</u> in affected areas.</p>
      <br>
      <p>Tracks <u>evacuation status</u>, <u>occupant counts</u>, and <u>shelter assignments</u> for <u>real-time coordination</u>.</p>
      <br>
      <p>Designed to integrate with building systems; today shows building-level status and progress.</p>
    `);

    await this.generateSlide('07_analytics_and_performance', 'Analytics & Performance', `
      <p>The <u>Analytics & Performance</u> dashboard provides <u>comprehensive insights</u> into emergency response operations and <u>system health</u>.</p>
      <br>
      <p>Displays <u>response times</u>, <u>resource utilization</u>, <u>evacuation progress</u>, and <u>system reliability</u>.</p>
      <br>
      <p>Includes <u>health checks</u>, <u>structured logging</u>, and <u>caching with hazard-based invalidation</u>.</p>
      <br>
      <p><u>Continuous status cuts uncertainty for command.</u></p>
    `);

    await this.generateSlide('08_public_safety_communications', 'Public Safety Communications', `
      <p><u>Public Safety panel</u> surfaces status for public communications during crisis events.</p>
      <br>
      <p>Coordinates <u>emergency broadcasts</u>, <u>social media updates</u>, and <u>mass notification systems</u>.</p>
      <br>
      <p>Pluggable to existing mass-notification systems for seamless integration.</p>
    `);

    await this.generateSlide('09_incident_management', 'Incident Management', `
      <p><u>User Action: Confirm assignment and monitor status</u></p>
      <br>
      <p><u>Incident oversight</u> via map focus, unit assignments and progress panels.</p>
      <br>
      <p>Manages <u>incident lifecycle</u>, <u>resource allocation</u>, <u>communication protocols</u>, and <u>response coordination</u>.</p>
      <br>
      <p>Enables <u>unified command structure</u> and <u>coordinated response</u> across multiple agencies and jurisdictions.</p>
    `);

    await this.generateSlide('10_system_integration', 'System Integration', `
      <p><u>System Integration</u> connects <u>multiple data sources</u> and <u>emergency management systems</u> into a unified platform.</p>
      <br>
      <p>Integrates with <u>911 systems</u>, <u>traffic management</u>, <u>weather services</u>, and <u>public safety networks</u>.</p>
      <br>
      <p>Provides <u>real-time data fusion</u> and <u>seamless interoperability</u> across emergency response infrastructure.</p>
    `);

    await this.generateSlide('11_conclusion_and_next_steps', 'Conclusion and Next Steps', `
      <p>The <u>Disaster Response Dashboard</u> demonstrates the power of <u>integrated emergency management</u> through <u>real-time data fusion</u>.</p>
      <br>
      <p>Key benefits include <u>faster response times</u>, <u>improved resource utilization</u>, <u>enhanced public safety</u>, and <u>coordinated operations</u>.</p>
      <br>
      <p><u>Schedule a private working session</u> to walk through your scenarios.</p>
      <br>
      <p>Book a 30-minute scenario run-through with your data and SOPs.</p>
    `);
  }

  // Technical Insert Slides (4 new slides)
  private async generateTechnicalInsertSlides(): Promise<void> {
    this.log('📹 Generating technical insert slides...');
    
    // Insert 1: Slice A - Sources → Foundry → Backend (30 seconds)
    await this.generateSlideWithChart('insert1_slice_a_sources_to_backend', 'Data Sources → Foundry → Backend', `
      <p><u>External Data Sources</u> flow into <u>Palantir Foundry</u> for real-time processing:</p>
      <br>
      <p><u>FIRMS, NOAA, 911, traffic, GPS</u> → <u>Foundry Inputs/Functions/Outputs</u></p>
      <br>
      <p><u>Foundry Functions fuse FIRMS + NOAA + 911 into a single, queryable stream.</u></p>
      <br>
      <p>Our <u>Flask API + Celery + Redis</u> architecture pulls processed outputs:</p>
      <br>
      <p><u>REST APIs</u> for data access + <u>WebSockets</u> for real-time updates</p>
      <br>
      <p>This creates a unified data pipeline that powers all emergency response operations.</p>
      <br>
      <p><u>Demo uses synthetic/aggregated data; no PII.</u></p>
    `, 'slide3_data_sources_to_backend.png');

    // Insert 1: Slice B - Processing Engines (35 seconds)
    await this.generateSlideWithChart('insert1_slice_b_processing_engines', 'Processing Engines', `
      <p>Three specialized <u>Processing Engines</u> power intelligent decision-making:</p>
      <br>
      <p><u>HazardProcessor</u> (ML Forecasting): RandomForest models predict fire spread patterns</p>
      <p><u>RiskProcessor</u> (H3 Spatial): H3 resolution-9 hexagons (~174m) for spatial analysis <u>H3 res-9 (~174m)</u></p>
      <p><u>RouteOptimizer</u> (A* Algorithm): Advanced pathfinding with hazard avoidance</p>
      <br>
      <p>Each engine processes data through <u>Foundry Functions</u> with real-time updates.</p>
      <br>
      <p>This enables <u>ML-powered predictions</u> and <u>intelligent routing</u> for emergency response.</p>
    `, 'slide4_processing_engines.png');

    // Insert 1: Slice C - API Surface → Frontend (25 seconds)
    await this.generateSlideWithChart('insert1_slice_c_api_surface', 'API Surface → Frontend', `
      <p><u>API Surface</u> connects backend processing to frontend interface:</p>
      <br>
      <p><u>/api/hazards</u> - Active incident data</p>
      <p><u>/api/hazard_zones</u> - Spatial risk assessment</p>
      <p><u>/api/routes</u> - Optimized evacuation paths</p>
      <p><u>/api/risk</u> - Location-specific risk analysis</p>
      <p><u>/api/evacuations</u> - Progress tracking</p>
      <p><u>/api/units</u> - Resource management</p>
      <p><u>/api/public_safety</u> - Public communications</p>
      <br>
      <p><u>REST APIs</u> expose data + <u>WebSockets</u> push live events to dashboard</p>
    `, 'slide5_api_surface_to_frontend.png');

    // Insert 2: Request Lifecycle (25-30 seconds)
    await this.generateSlideWithChart('insert2_request_lifecycle', 'Request Lifecycle', `
      <p><u>Async Request Lifecycle</u> for route planning:</p>
      <br>
      <p><u>POST /api/routes</u> → <u>202 Accepted (jobId)</u></p>
      <p><u>Celery Processing</u> → <u>route_ready Event</u></p>
      <p><u>GET /api/routes/:id</u> → <u>Geometry/ETA/Distance</u></p>
      <br>
      <p>This <u>asynchronous architecture</u> enables:</p>
      <p>• Complex route calculations without blocking the UI</p>
      <p>• Real-time updates via WebSocket events</p>
      <p>• Scalable processing for multiple concurrent requests</p>
      <br>
      <p>The system maintains <u>sub-second response times</u> while processing complex spatial algorithms.</p>
    `, 'slide10_request_lifecycle.png');
  }

  // Generate Unified VO Script
  private async generateUnifiedVOScript(): Promise<void> {
    this.log('📝 Generating unified VO script...');
    
    const voScript = `# Unified Demo Voice-Over Script

## Demo Flow Overview

**Total Duration**: 6:15-6:45 minutes (with optional Insert 2)
**Target**: 5-7 minutes for recruiter requirements

---

## BEAT 1: Introduction (30 seconds)

**Slide**: Disaster Response Dashboard

**VO Script**:
"Welcome to the Disaster Response Dashboard - a unified platform that transforms emergency management through real-time data fusion and intelligent decision support."

"This system integrates multiple data sources, provides ML-powered hazard analysis, and delivers optimized evacuation routes for emergency responders."

"Built on Palantir Foundry architecture with real-time processing and spatial intelligence."

---

## BEAT 2: Platform Overview (45 seconds)

**Slide**: Live Hazard Map

**VO Script**:
"The Live Hazard Map displays real-time emergency incidents with spatial intelligence and risk assessment."

"Active hazards are shown with color-coded risk levels, spread predictions, and affected areas."

"Data sources include NASA F-I-R-M-S satellite feeds, N-O-A-A weather data, and nine-one-one emergency calls."

---

## INSERT 1: Technical Deep-Dive (90 seconds)

### **Slice A: Sources → Foundry → Backend (30 seconds)**

**Slide**: Data Sources → Foundry → Backend

**VO Script**:
"F-I-R-M-S, N-O-A-A, nine-one-one, traffic and G-P-S flow into Pal-an-TEER Found-ree. Functions fuse the streams. Our Flask gateway and Celery workers pull the processed outputs in real time."

### **Slice B: Processing Engines (35 seconds)**

**Slide**: Processing Engines

**VO Script**:
"Three engines power decisions: hazard forecasting, risk on H-three hexes, and A-star routing that balances safety and speed."

### **Slice C: API Surface → Frontend (25 seconds)**

**Slide**: API Surface → Frontend

**VO Script**:
"REST exposes hazards, routes, units and evacuations; Web-Sockets push live events to the dashboard."

---

## BEAT 3: Emergency Units (30 seconds)

**Slide**: Emergency Units Panel

**VO Script**:
"The Emergency Units Panel provides real-time visibility into resource deployment and unit status."

"Track fire engines, ambulances, and police units with G-P-S positioning and operational status."

"Units are categorized by response type, availability, and current assignments."

---

## BEAT 4: Route Optimization (40 seconds)

**Slide**: Route Optimization

**VO Script**:
"Route Optimization calculates safe evacuation paths using A-star algorithm with hazard avoidance."

"Routes consider traffic conditions, road closures, hazard zones, and vehicle constraints."

"Real-time updates ensure optimal pathfinding as conditions change during emergency response."

---

## BEAT 5: AIP Decision Support (35 seconds)

**Slide**: AIP Decision Support

**VO Script**:
"The A-I-P Decision Support system provides intelligent recommendations for emergency response coordination."

"Analyzes resource availability, hazard progression, and response priorities to suggest optimal actions."

"Powered by machine learning models trained on historical emergency data and real-time analytics."

---

## BEAT 6: Building Evacuation (30 seconds)

**Slide**: Building Evacuation Tracker

**VO Script**:
"The Building Evacuation Tracker monitors evacuation progress and occupant safety in affected areas."

"Tracks evacuation status, occupant counts, and shelter assignments for real-time coordination."

"Integrates with building management systems and emergency communications networks."

---

## BEAT 7: Analytics Dashboard (30 seconds)

**Slide**: Analytics Dashboard

**VO Script**:
"The Analytics Dashboard provides comprehensive insights into emergency response operations and performance metrics."

"Displays response times, resource utilization, hazard trends, and evacuation efficiency."

"Enables data-driven decision making and continuous improvement of emergency response capabilities."

---

## BEAT 8: Public Safety Communications (25 seconds)

**Slide**: Public Safety Communications

**VO Script**:
"Public Safety Communications manages emergency alerts and public notifications during crisis events."

"Coordinates emergency broadcasts, social media updates, and mass notification systems."

"Ensures timely communication with affected communities and accurate information dissemination."

---

## BEAT 9: Incident Management (30 seconds)

**Slide**: Incident Management

**VO Script**:
"Incident Management provides comprehensive oversight of emergency response operations and resource coordination."

"Manages incident lifecycle, resource allocation, communication protocols, and response coordination."

"Enables unified command structure and coordinated response across multiple agencies and jurisdictions."

---

## INSERT 2: Request Lifecycle (Optional - 25-30 seconds)

**Slide**: Request Lifecycle

**VO Script**:
"Planning a route returns 202 with a job I-D. Celery computes; a route_ready event triggers the UI to fetch geometry, E-T-A and distance."

---

## BEAT 10: System Integration (25 seconds)

**Slide**: System Integration

**VO Script**:
"System Integration connects multiple data sources and emergency management systems into a unified platform."

"Integrates with nine-one-one systems, traffic management, weather services, and public safety networks."

"Provides real-time data fusion and seamless interoperability across emergency response infrastructure."

---

## BEAT 11: Performance Metrics (20 seconds)

**Slide**: Performance Metrics

**VO Script**:
"Performance Metrics track system performance and response effectiveness across all emergency operations."

"Monitors response times, resource efficiency, evacuation success rates, and system reliability."

"Enables continuous optimization and evidence-based improvements to emergency response capabilities."

---

## BEAT 12: Conclusion and Next Steps (25 seconds)

**Slide**: Conclusion and Next Steps

**VO Script**:
"The Disaster Response Dashboard demonstrates the power of integrated emergency management through real-time data fusion."

"Key benefits include faster response times, improved resource utilization, enhanced public safety, and coordinated operations."

"Next steps: deployment planning, training programs, and continuous system enhancement."

---

## Timing Summary

| Component | Duration | Total Time |
|-----------|----------|------------|
| Beats 1-2 | ~1:15 | 1:15 |
| **Insert 1: Technical Deep-Dive** | **1:30** | **2:45** |
| Beats 3-9 | ~2:45-3:00 | 5:30-5:45 |
| **Insert 2: Request Lifecycle (Optional)** | **0:25-0:30** | **5:55-6:15** |
| Beats 10-12 | ~0:45-1:00 | **6:40-7:15** |

**Total with Insert 2**: 6:40-7:15 minutes
**Total without Insert 2**: 6:15-6:45 minutes

---

## Delivery Notes

### **Technical Terms (Phonetic Spellings for TTS)**
- **FIRMS**: "F-I-R-M-S"
- **NOAA**: "N-O-A-A"
- **911**: "nine-one-one"
- **GPS**: "G-P-S"
- **Palantir**: "Pal-an-TEER"
- **Foundry**: "Found-ree"
- **H3**: "H-three"
- **A***: "A-star"
- **AIP**: "A-I-P"
- **REST**: "REST"
- **WebSockets**: "Web-Sockets"
- **API**: "A-P-I"
- **ETA**: "E-T-A"
- **ID**: "I-D"

### **Pacing Guidelines**
- **Operational beats**: 25-45 seconds each
- **Technical inserts**: 25-35 seconds each
- **Natural pauses**: 1-2 seconds between sections
- **Emphasis**: Key technical terms and metrics
- **Flow**: Smooth transitions between operational and technical content

### **Key Success Factors**
- **Maintain operational story**: Technical content supports business value
- **Clear pronunciation**: Phonetic spellings ensure TTS accuracy
- **Engaging delivery**: Balance technical depth with accessibility
- **Professional tone**: Enterprise-grade presentation quality
- **Timing discipline**: Respect recruiter's 5-7 minute target

This unified script provides a complete demo experience that satisfies both operational storytelling and technical architecture requirements.
`;

    fs.writeFileSync(this.voScriptPath, voScript);
    this.log(`✅ Unified VO script saved: ${this.voScriptPath}`, 'success');
  }
}

// Main execution
async function main() {
  const generator = new UnifiedDemoGenerator();
  await generator.generateAllContent();
}

main().catch(console.error);
