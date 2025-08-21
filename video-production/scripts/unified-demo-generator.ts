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
              color: #ffffff;
              max-width: 1000px;
              margin: 0 auto;
              text-align: left;
              font-weight: 400;
            }
            
            .content u, .text-content u, u {
              color: #ffffff !important;
              text-decoration: underline !important;
              text-decoration-color: #58a6ff !important;
              text-decoration-thickness: 2px !important;
              text-underline-offset: 3px !important;
              font-weight: 600 !important;
            }
            
            /* Override any inherited colors */
            p u, div u, span u {
              color: #ffffff !important;
            }
            
            /* Ensure no other colors can override */
            * u {
              color: #ffffff !important;
            }
            
            /* Additional specificity and browser overrides */
            .content p u, .content div u, .content span u {
              color: #ffffff !important;
            }
            
            /* Force override any potential browser defaults */
            u {
              color: #ffffff !important;
              text-decoration: underline !important;
              text-decoration-color: #58a6ff !important;
              text-decoration-thickness: 2px !important;
              text-underline-offset: 3px !important;
              font-weight: 600 !important;
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
              color: #ffffff;
              font-weight: 400;
            }
            
            .text-content u, u {
              color: #ffffff !important;
              text-decoration: underline !important;
              text-decoration-color: #58a6ff !important;
              text-decoration-thickness: 2px !important;
              text-underline-offset: 3px !important;
              font-weight: 600 !important;
            }
            
            /* Override any inherited colors */
            p u, div u, span u {
              color: #ffffff !important;
            }
            
            /* Ensure no other colors can override */
            * u {
              color: #ffffff !important;
            }
            
            /* Additional specificity and browser overrides */
            .text-content p u, .text-content div u, .text-content span u {
              color: #ffffff !important;
            }
            
            /* Force override any potential browser defaults */
            u {
              color: #ffffff !important;
              text-decoration: underline !important;
              text-decoration-color: #58a6ff !important;
              text-decoration-thickness: 2px !important;
              text-underline-offset: 3px !important;
              font-weight: 600 !important;
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
    
    await this.generateSlide('01_main_dashboard_overview', 'Command Center', `
      <p><small>For Incident Commanders and emergency planners who need a single operational picture.</small></p>
      <br>
      <p>Welcome to the <u>Command Center</u> - a unified platform that transforms emergency management through <u>real-time data fusion</u> and <u>intelligent decision support</u>.</p>
      <br>
      <p>This system integrates <u>multiple data sources</u>, provides <u>ML-powered hazard analysis</u>, and delivers <u>optimized evacuation routes</u> for emergency responders.</p>
      <br>
      <p>Built on <u>Palantir Foundry architecture</u> with <u>real-time processing</u> and <u>spatial intelligence</u>.</p>
      <br>
      <p style="font-size: 14px; color: #666; font-style: italic;"><u>Today:</u> User path → short tech peek → outcomes → CTA. Appendix available (Engines • API Surface • Resilience).</p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>Foundry:</strong> real-time fusion
      </div>
    `);

    await this.generateSlide('02_live_hazard_map', 'Live Hazard Map', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        <span style="color: #58a6ff;">User Path</span> → Tech Peek → Outcomes → CTA
      </div>
      <p><u>User Action: Toggle Buildings & Weather layers, Center on hazard</u></p>
      <br>
      <p>The <u>Live Hazard Map</u> displays real-time emergency incidents with <u>spatial intelligence</u> and <u>risk assessment</u>.</p>
      <br>
      <p>Active hazards show <u>risk scoring and proximity context</u>, plus <u>affected areas</u>.</p>
      <br>
      <p>Data sources include <u>NASA FIRMS satellite feeds</u>, <u>NOAA weather data</u>, and <u>911 emergency calls</u>.</p>
      <br>
      <p><u>Focusing early prevents dispatching units into deteriorating areas.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>User Action:</strong> Toggle Buildings & Weather • Center hazard
        <br><strong>API:</strong> GET /api/hazards, GET /api/risk
      </div>
    `);

    await this.generateSlide('03_emergency_units_panel', 'Emergency Units Panel', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        <span style="color: #58a6ff;">User Path</span> → Tech Peek → Outcomes → CTA
      </div>
      <p><u>User Action: Select unit from roster</u></p>
      <br>
      <p>The <u>Emergency Units Panel</u> provides real-time visibility into <u>resource deployment</u> and <u>unit status</u>.</p>
      <br>
      <p>Track <u>fire engines</u>, <u>ambulances</u>, and <u>police units</u> with <u>GPS positioning</u> and <u>operational status</u>.</p>
      <br>
      <p>Units are categorized by <u>response type</u>, <u>availability</u>, and <u>current assignments</u>.</p>
      <br>
      <p><u>Selecting the right unit reduces time-to-arrival and risk.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>User Action:</strong> Select Fire Engine
        <br><strong>API:</strong> GET /api/units
      </div>
    `);

    await this.generateSlide('04_route_optimization', 'Route Optimization', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        <span style="color: #58a6ff;">User Path</span> → Tech Peek → Outcomes → CTA
      </div>
      <p><u>User Action: Choose Fire Tactical profile</u></p>
      <br>
      <p><u>Route Optimization</u> calculates <u>safe evacuation paths</u> using <u>A* algorithm</u> with <u>hazard avoidance</u>.</p>
      <br>
      <p>Routes consider <u>traffic conditions</u>, <u>road closures</u>, <u>hazard zones</u>, and <u>vehicle constraints</u>.</p>
      <br>
      <p>Real-time updates ensure <u>optimal pathfinding</u> as conditions change during emergency response.</p>
      <br>
      <p><u>Profile-based routing keeps crews out of smoke/closures.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>User Action:</strong> Choose Fire Tactical • Confirm assignment
        <br><strong>API:</strong> GET /api/routes (profile view)
      </div>
    `);

    await this.generateSlide('05_aip_decision_support', 'AIP Decision Support', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        <span style="color: #58a6ff;">User Path</span> → Tech Peek → Outcomes → CTA
      </div>
      <p><u>User Action: Review AI recommendations</u></p>
      <br>
      <p>The <u>AIP Decision Support</u> system provides <u>intelligent recommendations</u> for emergency response coordination.</p>
      <br>
      <p>Analyzes <u>resource availability</u>, <u>hazard progression</u>, and <u>response priorities</u> to suggest <u>optimal actions</u>.</p>
      <br>
      <p>Powered by <u>machine learning models</u> trained on historical emergency data and <u>real-time analytics</u>.</p>
      <br>
      <p><u>Models trained on historical and synthetic scenarios; validated continuously against recent events.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>User Action:</strong> Review AIP recommendations
        <br><strong>API:</strong> GET /api/risk?area=…
      </div>
    `);

    await this.generateSlide('06_building_evacuation_tracker', 'Building Evacuation Tracker', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        <span style="color: #58a6ff;">User Path</span> → Tech Peek → Outcomes → CTA
      </div>
      <p><u>User Action: Monitor evacuation progress</u></p>
      <br>
      <p>The <u>Building Evacuation Tracker</u> monitors <u>evacuation progress</u> and <u>occupant safety</u> in affected areas.</p>
      <br>
      <p>Tracks <u>evacuation status</u>, <u>occupant counts</u>, and <u>shelter assignments</u> for <u>real-time coordination</u>.</p>
      <br>
      <p><u>Designed to integrate with building systems; today shows building-level status and progress.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>User Action:</strong> Drill building in tracker
        <br><strong>API:</strong> GET /api/evacuations, GET /api/public_safety
      </div>
    `);

    await this.generateSlide('07_analytics_and_performance', 'Analytics & Performance', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        User Path → Tech Peek → <span style="color: #58a6ff;">Outcomes</span> → CTA
      </div>
      <p><u>Health checks</u> • <u>Structured logging</u> • <u>Caching (hazards 5 min)</u> • <u>Route invalidation on hazard change</u></p>
      <br>
      <p>The <u>Analytics & Performance</u> dashboard provides <u>comprehensive insights</u> into emergency response operations and <u>system health</u>.</p>
      <br>
      <p><u>Response times</u> • <u>Resource utilization</u> • <u>Evacuation progress</u></p>
      <br>
      <p><u>Health checks</u> • <u>Structured logging</u> • <u>Caching (hazards 5 min)</u> • <u>Route invalidation on hazard change</u></p>
      <br>
      <p><u>Continuous status cuts uncertainty for command.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>Bullets:</strong> response times • utilization • health checks • structured logging • caching (5 min) & invalidation
      </div>
    `);

    await this.generateSlide('08_conclusion_and_next_steps', 'Conclusion and Next Steps', `
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        User Path → Tech Peek → Outcomes → <span style="color: #58a6ff;">CTA</span>
      </div>
      <p>The <u>Command Center</u> demonstrates the power of <u>integrated emergency management</u> through <u>real-time data fusion</u>.</p>
      <br>
      <p>Key benefits include <u>faster response times</u>, <u>improved resource utilization</u>, <u>enhanced public safety</u>, and <u>coordinated operations</u>.</p>
      <br>
      <p><u>Book a 30-minute scenario run-through with your data and SOPs.</u></p>
    `);

    // ENGINEER APPENDIX SLIDES (Optional 3-4 minutes)
    await this.generateSlide('appendix_01_processing_engines', 'Processing Engines (Appendix)', `
      <p>Three specialized <u>Processing Engines</u> power intelligent decision-making:</p>
      <br>
      <p><u>HazardProcessor</u> (ML Forecasting): RandomForest models predict fire spread patterns</p>
      <p><u>RiskProcessor</u> (H3 Spatial): H3 resolution-9 hexagons (~174m) for spatial analysis</p>
      <p><u>RouteOptimizer</u> (A* Algorithm): Advanced pathfinding with hazard avoidance</p>
      <br>
      <p>Each engine processes data through <u>Foundry Functions</u> with real-time updates.</p>
    `);

    await this.generateSlide('appendix_02_api_surface', 'API Surface → Frontend (Appendix)', `
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
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badges:</strong> /api/hazards • /api/hazard_zones • /api/routes • /api/risk • /api/evacuations • /api/units • /api/public_safety
      </div>
    `);

    await this.generateSlide('appendix_03_public_safety_status', 'Public Safety Status (Appendix)', `
      <p><u>Public Safety panel</u> surfaces status for public communications during crisis events.</p>
      <br>
      <p>Surfaces current public-safety status for messaging teams.</p>
      <br>
      <p>Connects to existing notification platforms via integration points.</p>
    `);

    await this.generateSlide('appendix_04_exception_flows', 'Exception Flows & Resilience (Appendix)', `
      <p><u>Exception Handling</u> for robust operations:</p>
      <br>
      <p><u>Route compute delayed</u> → non-blocking notice → retry path visible</p>
      <p><u>Unit not available</u> → filter by availability → select alternate unit</p>
      <p><u>Backend errors</u> → UI remains responsive with readable messages</p>
      <br>
      <p><u>This architecture ensures smooth operations even when complex calculations are running.</u></p>
    `);

    // IC User Story Slides - End-to-End Workflow
    await this.generateSlide('12_earthquake_scenario_san_francisco', 'Earthquake Scenario: San Francisco', `
      <p><u>Scenario:</u> 7.2 magnitude earthquake strikes San Francisco Bay Area at 2:47 PM</p>
      <br>
      <p><u>Epicenter:</u> Hayward Fault, 3 miles east of downtown Oakland</p>
      <br>
      <p><u>Immediate Impact:</u> Multiple building collapses, fires, gas leaks, bridge damage</p>
      <br>
      <p><u>Critical Infrastructure:</u> BART stations compromised, major highways blocked</p>
      <br>
      <p><u>Population at Risk:</u> 2.3 million people across 7 counties</p>
      <br>
      <p><u>Time Pressure:</u> First 60 minutes critical for search & rescue operations</p>
    `);

    await this.generateSlide('13_ic_user_journey_overview', 'IC User Journey Overview', `
      <p><u>Incident Commander Golden Path</u> - Complete workflow from situational awareness to execution:</p>
      <br>
      <p><u>Personas:</u> IC (primary), Planner, Unit Lead, Public Info Officer</p>
      <br>
      <p><u>End-to-End Storyboard:</u> 7 key beats that transform emergency response</p>
      <br>
      <p><u>Each beat shows:</u> User Action → System Behavior → Outcome → Key APIs</p>
      <br>
      <p>This demonstrates the complete operational value of the Command Center platform.</p>
    `);

    await this.generateSlide('14_situational_picture_beat', 'Situational Picture', `
      <p><u>User Action:</u> IC opens Dashboard; toggles Buildings & Weather; centers on hazard</p>
      <br>
      <p><u>System Behavior:</u> Loads hazards + risk summary; overlays render</p>
      <br>
      <p><u>Outcome:</u> Clear exposure + conditions at a glance</p>
      <br>
      <p><u>Key APIs:</u> GET /api/hazards, GET /api/risk, GET /api/public_safety</p>
      <br>
      <p><u>Focusing early prevents dispatching units into deteriorating areas.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badges:</strong> GET /api/hazards • GET /api/risk • GET /api/public_safety
      </div>
    `);

    await this.generateSlide('15_resource_posture_beat', 'Resource Posture', `
      <p><u>User Action:</u> IC opens Units and selects a fire engine from the roster</p>
      <br>
      <p><u>System Behavior:</u> Shows status/location; highlights selection</p>
      <br>
      <p><u>Outcome:</u> Right capability identified quickly</p>
      <br>
      <p><u>Key APIs:</u> GET /api/units</p>
      <br>
      <p><u>Selecting the right unit reduces time-to-arrival and risk.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badge:</strong> GET /api/units
      </div>
    `);

    await this.generateSlide('16_access_planning_beat', 'Access Planning', `
      <p><u>User Action:</u> IC opens Routing and chooses the Fire Tactical profile</p>
      <br>
      <p><u>System Behavior:</u> Displays route option(s) computed for that profile</p>
      <br>
      <p><u>Outcome:</u> Safe approach path visible (ETA/distance)</p>
      <br>
      <p><u>Key APIs:</u> GET /api/routes (profile view), later GET /api/routes/:id</p>
      <br>
      <p><u>Profile-based routing keeps crews out of smoke/closures.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badges:</strong> GET /api/routes • GET /api/routes/:id
      </div>
    `);

    await this.generateSlide('17_assignment_execution_beat', 'Assignment & Execution', `
      <p><u>User Action:</u> IC confirms the unit assignment to the selected route</p>
      <br>
      <p><u>System Behavior:</u> Persists assignment; updates unit/route status</p>
      <br>
      <p><u>Outcome:</u> Plan moves to execution</p>
      <br>
      <p><u>Key APIs:</u> POST /api/units/:id/assign</p>
      <br>
      <p><u>Assignment tracking enables coordinated response across multiple agencies.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badge:</strong> POST /api/units/:id/assign
      </div>
    `);

    await this.generateSlide('18_decision_support_beat', 'Decision Support Cross-Check', `
      <p><u>User Action:</u> IC opens AIP Decision Support; reviews recommendations + confidence</p>
      <br>
      <p><u>System Behavior:</u> Returns risk guidance for the area</p>
      <br>
      <p><u>Outcome:</u> Confirms or adjusts plan with quick sanity-check</p>
      <br>
      <p><u>Key APIs:</u> GET /api/risk?area=…</p>
      <br>
      <p><u>AI-powered insights reduce decision uncertainty in time-critical situations.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badge:</strong> GET /api/risk?area=…
      </div>
    `);

    await this.generateSlide('19_progress_monitoring_beat', 'Progress Monitoring', `
      <p><u>User Action:</u> IC opens Building Evacuation Tracker; drills into a building</p>
      <br>
      <p><u>System Behavior:</u> Shows building-level status; pushes updates via WebSocket</p>
      <br>
      <p><u>Outcome:</u> Reduced uncertainty, faster replans if needed</p>
      <br>
      <p><u>Key APIs:</u> GET /api/evacuations, GET /api/public_safety, WS status events</p>
      <br>
      <p><u>Real-time monitoring enables proactive response adjustments.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badges:</strong> GET /api/evacuations • GET /api/public_safety • WebSocket
      </div>
    `);

    await this.generateSlide('20_public_safety_status_beat', 'Public Safety Status Surfacing', `
      <p><u>User Action:</u> PIO views Public Safety status panel</p>
      <br>
      <p><u>System Behavior:</u> Presents current public-facing status (no outbound sends)</p>
      <br>
      <p><u>Outcome:</u> Accurate messaging inputs; pluggable to existing notification tools</p>
      <br>
      <p><u>Key APIs:</u> GET /api/public_safety</p>
      <br>
      <p><u>Unified status ensures consistent public communications across all channels.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API badge:</strong> GET /api/public_safety
      </div>
    `);

    await this.generateSlide('21_async_lifecycle_beat', 'Async Lifecycle & Exception Handling', `
      <p><u>Under the Hood:</u> POST /api/routes → 202 {jobId} → Celery compute → WS route_ready {routeId} → GET /api/routes/:id</p>
      <br>
      <p><u>Alternative Flows:</u> Unit not available → filter by availability → select alternate unit</p>
      <br>
      <p><u>Exception Handling:</u> Route compute delayed → non-blocking notice → retry path visible</p>
      <br>
      <p><u>Resilience:</u> UI remains responsive on any backend error with readable messages</p>
      <br>
      <p><u>This architecture ensures smooth operations even when complex calculations are running.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>API flow:</strong> POST /api/routes → 202 jobId → WS route_ready → GET /api/routes/:id
      </div>
    `);

    await this.generateSlide('22_acceptance_criteria_summary', 'Acceptance Criteria & Demo Readiness', `
      <p><u>Map & Layers:</u> Buildings + Weather toggles change map; hazard focus recenters within 1s</p>
      <br>
      <p><u>Units:</u> List shows type/status; selection persists highlight until changed</p>
      <br>
      <p><u>Routing:</u> Profile selection updates route details within 1-2s or shows "pending"</p>
      <br>
      <p><u>Assignment:</u> "Assigned" indicator appears; status reflected in oversight view</p>
      <br>
      <p><u>Monitoring:</u> Building updates appear via WebSocket without refresh</p>
      <br>
      <p><u>This validates the complete IC workflow from situational awareness to execution.</u></p>
    `);
  }

  // Technical Insert Slides (4 new slides)
  private async generateTechnicalInsertSlides(): Promise<void> {
    this.log('📹 Generating technical insert slides...');
    
    // Insert 1: Slice A - Sources → Foundry → Backend (30 seconds)
    await this.generateSlideWithChart('insert1_slice_a_sources_to_backend', 'Data Sources → Foundry → Backend', `
      <p style="font-size: 16px; color: #58a6ff; font-weight: 600; margin-bottom: 15px;"><u>Tech Peek: Foundry → Backend (30s)</u></p>
      <p><u>External Data Sources</u> flow into <u>Palantir Foundry</u> for real-time processing:</p>
      <br>
      <p><u>FIRMS, NOAA, 911, traffic, GPS</u> → <u>Foundry Inputs/Functions/Outputs</u></p>
      <br>
      <p><u>Foundry Functions fuse FIRMS + NOAA + 911 into a single, queryable stream. Flask/Celery/Redis expose REST and WebSockets for real-time updates.</u></p>
      <br>
      <p>This creates a unified data pipeline that powers all emergency response operations.</p>
      <br>
      <p><u>Footnote: Demo uses synthetic/aggregated data; no PII.</u></p>
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>Callout:</strong> Foundry Functions fuse FIRMS + NOAA + 911
        <br><strong>REST + WebSockets; Flask/Celery/Redis</strong>
      </div>
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
      <p style="font-size: 16px; color: #58a6ff; font-weight: 600; margin-bottom: 15px;"><u>Tech Peek: Async Route Lifecycle (25s)</u></p>
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
      <br>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <strong>Flow:</strong> POST /api/routes → 202 jobId → WS route_ready → GET /api/routes/:id
      </div>
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

**Slide**: Command Center

**VO Script**:
"Welcome to the Command Center - a unified platform that transforms emergency management through real-time data fusion and intelligent decision support."

"This system integrates multiple data sources, provides ML-powered hazard analysis, and delivers optimized evacuation routes for emergency responders."

"Built on Palantir Foundry architecture with real-time processing and spatial intelligence."

---

## BEAT 2: Platform Overview (45 seconds)

**Slide**: Live Hazard Map

**VO Script**:
"The Live Hazard Map displays real-time emergency incidents with spatial intelligence and risk assessment."

"Active hazards are shown with color-coded risk levels, risk scoring and proximity context, and affected areas."

"Data sources include NASA firms satellite feeds, Noah weather data, and nine-one-one emergency calls."

---

## INSERT 1: Technical Deep-Dive (90 seconds)

### **Slice A: Sources → Foundry → Backend (30 seconds)**

**Slide**: Data Sources → Foundry → Backend

**VO Script**:
"Firms, Noah, nine-one-one, traffic and G-P-S flow into Pal-an-TEER Found-ree. Functions fuse the streams. Our Flask gateway and Celery workers pull the processed outputs in real time."

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

"Designed to integrate with building systems; today shows building-level status and progress."

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
"Public Safety Communications surfaces public-safety status; pluggable to existing mass-notification systems."

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

"Health checks • Structured logging • Caching (hazards 5 min), route invalidation on hazard change."

"Monitors response times, resource efficiency, evacuation success rates, and system reliability."

"Enables continuous optimization and evidence-based improvements to emergency response capabilities."

---

## BEAT 12: Conclusion and Next Steps (25 seconds)

**Slide**: Conclusion and Next Steps

**VO Script**:
        "The Command Center demonstrates the power of integrated emergency management through real-time data fusion."

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
- **FIRMS**: "firms" (like law firms)
- **NOAA**: "Noah" (like the name)
- **911**: "nine-one-one"
- **GPS**: "G-P-S"
- **Palantir**: "Pal-an-TEER"
- **Foundry**: "Foundry"
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
