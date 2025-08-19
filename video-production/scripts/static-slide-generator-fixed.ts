#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Recruiter-Friendly Demo narration scripts with backend API details
const TECHNICAL_NARRATION_SCRIPTS = {
  'Title & Persona': {
    script: "Hi, I'm Ian Frelinjer, Disaster Response Platform Architect. I'm building this system through the lens of an Incident Commander and Operations Manager. This briefing covers how we transform disconnected data into coordinated emergency response.",
    duration: 35
  },
  'Problem & Outcomes': {
    script: "Emergency managers face disconnected systems that slow response times. Our platform provides hazards plus exposure plus conditions in one unified view. This turns insight into clear assignments for faster decisions, safer access, and reliable status tracking.",
    duration: 40
  },
  'Data & Architecture': {
    script: "Foundry ingests data from FIRMS, NOAA, nine one one, population, and traffic feeds. Backend: Python slash Flask plus Celery plus WebSockets. Frontend: React plus Mapbox. Our REST APIs provide programmatic access to hazards, risk assessment, routing, units, evacuations, and public safety data.",
    duration: 45
  },
  'Backend API Overview': {
    script: "Our backend API is built with Python FastAPI, providing high-performance asynchronous endpoints. The API serves as the central nervous system, processing real-time data streams and coordinating between multiple data sources. We use PostgreSQL with PostGIS for geospatial data and Redis for caching and real-time updates.",
    duration: 40
  },
  'API Data Flow': {
    script: "Data flows through our API in three layers: ingestion, processing, and delivery. Ingestion handles FIRMS wildfire data, NOAA weather feeds, and 911 call centers. Processing applies H3 geospatial indexing and risk algorithms. Delivery provides REST endpoints and WebSocket streams for real-time updates.",
    duration: 45
  },
  'Hazards API Endpoints': {
    script: "The hazards API provides slash api slash hazards for active incidents, slash api slash hazards slash history for historical data, and slash api slash hazards slash forecast for predictive modeling. Each endpoint returns GeoJSON with H3 cell data, confidence scores, and temporal information.",
    duration: 40
  },
  'Risk Assessment Engine': {
    script: "Our risk assessment engine processes multiple factors: proximity to population centers, weather conditions, historical incident patterns, and infrastructure vulnerability. The engine calculates dynamic risk scores using machine learning models trained on historical emergency response data.",
    duration: 45
  },
  'Routing API Architecture': {
    script: "The routing API uses A-star pathfinding with real-time constraints. Endpoints include slash api slash routes slash calculate for path generation, slash api slash routes slash optimize for multi-objective optimization, and slash api slash routes slash traffic for real-time traffic integration.",
    duration: 40
  },
  'Real-time WebSocket Streams': {
    script: "WebSocket connections provide real-time data streaming for live updates. Clients subscribe to specific channels: hazards for incident updates, weather for condition changes, and units for resource status. Each message includes timestamp, location, and metadata for precise synchronization.",
    duration: 35
  },
  'Database Schema Design': {
    script: "Our PostgreSQL schema uses PostGIS extensions for geospatial queries. Tables include incidents with H3 cell mapping, units with real-time status, routes with optimization parameters, and evacuations with progress tracking. Indexes are optimized for spatial and temporal queries.",
    duration: 40
  },
  'API Security & Authentication': {
    script: "API security includes JWT token authentication, rate limiting, and role-based access control. Emergency managers get full access, while public safety officials have restricted endpoints. All API calls are logged for audit trails and compliance requirements.",
    duration: 35
  },
  'Live Hazard Map': {
    script: "The Live Hazard Map serves as our operational canvas. Hazard cells are visible with real-time updates from satellite and ground sensors. Commanders can focus on specific areas and track changes as conditions evolve.",
    duration: 35
  },
  'Exposure & Conditions': {
    script: "Buildings ON shows population exposure as a proxy for risk assessment. Weather ON displays current conditions that shape access and operations. This reveals who's affected and what shapes access in real-time.",
    duration: 35
  },
  'Incident Triage': {
    script: "Select an incident cell to begin the operational workflow. Confirm quick details: confidence, start time, and nearby population. This anchors the workflow and sets the context for all subsequent decisions.",
    duration: 30
  },
  'Resource Roster': {
    script: "Open Units to access the resource roster. Select Engine twenty one from available units. Match capability to assignment based on incident requirements and unit status.",
    duration: 35
  },
  'Route Planning': {
    script: "Switch to routing view for path planning. Set Start: Staging Area and End near incident. Configure Profile: FIRE_TACTICAL for emergency response routing.",
    duration: 35
  },
  'Route Result': {
    script: "Generate Route using the A-star algorithm with real-time constraints. View polyline, ETA, and distance for the optimal path. Ensure safe, predictable access that respects current conditions.",
    duration: 30
  },
  'Tasking': {
    script: "Assign to Route to create the operational tasking. This provides a defined task plus access plan for the unit. Now shift to the broader picture to monitor overall operations.",
    duration: 30
  },
  'AIP Guidance': {
    script: "Access AIP Decision Support for AI-powered recommendations. Review recommendations plus confidence levels for each decision point. Use this as a quick cross-check against operational experience.",
    duration: 35
  },
  'Ops Status & CTA': {
    script: "Monitor Building Evacuation Tracker for real-time progress. Track evacuation status, unit positions, and emerging risks. Ready to invite personalized scenario for your specific use case.",
    duration: 40
  }
};

class StaticSlideGeneratorFixed {
  private browser: Browser | null = null;
  private capturesDir: string;
  private ffmpegAvailable: boolean = false;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Load environment variables from config.env
    const configPath = path.join(__dirname, '..', 'config.env');
    if (fs.existsSync(configPath)) {
      dotenv.config({ path: configPath });
      this.log('✅ Loaded environment variables from config.env', 'success');
    } else {
      this.log('⚠️  config.env not found, using system environment variables', 'warning');
    }
    
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.ensureCapturesDirectory();
    this.checkFFmpeg();
  }

  private async checkFFmpeg(): Promise<void> {
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      await execAsync('ffmpeg -version');
      this.ffmpegAvailable = true;
      this.log('✅ FFmpeg is available for audio processing', 'success');
    } catch (error) {
      this.log('⚠️  FFmpeg not available, audio processing will be limited', 'warning');
    }
  }

  private ensureCapturesDirectory(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
    this.log(`✅ Captures directory ready: ${this.capturesDir}`, 'success');
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

  private async generateStaticSlide(filename: string, title: string, content: string): Promise<void> {
    this.log(`📹 Generating static slide: ${title}`);
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    // Create a simple context without video recording
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const htmlContent = this.createSlideHTML(title, content);
    await page.setContent(htmlContent);
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot instead of video recording
    const screenshotPath = path.join(this.capturesDir, `${filename}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    this.log(`✅ Screenshot saved: ${screenshotPath}`, 'success');
    
    // Close the context
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
            
            .slide-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
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
            
            .metric {
              color: #fbbf24;
              font-weight: 600;
              text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
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

  public async generateAllSlides(): Promise<void> {
    try {
      await this.initializeBrowser();
      
      this.log('🎬 Generating static slides for Recruiter-Friendly Demo...');
      
      // Generate each slide following the new operational workflow
      await this.generateTitleAndPersonaSlide();
      await this.generateProblemAndOutcomesSlide();
      await this.generateDataAndArchitectureSlide();
      await this.generateBackendAPIOverviewSlide();
      await this.generateAPIDataFlowSlide();
      await this.generateHazardsAPIEndpointsSlide();
      await this.generateRiskAssessmentEngineSlide();
      await this.generateRoutingAPIArchitectureSlide();
      await this.generateRealTimeWebSocketStreamsSlide();
      await this.generateDatabaseSchemaDesignSlide();
      await this.generateAPISecurityAndAuthenticationSlide();
      await this.generateLiveHazardMapSlide();
      await this.generateExposureAndConditionsSlide();
      await this.generateIncidentTriageSlide();
      await this.generateResourceRosterSlide();
      await this.generateRoutePlanningSlide();
      await this.generateRouteResultSlide();
      await this.generateTaskingSlide();
      await this.generateAIPGuidanceSlide();
      await this.generateOpsStatusAndCTASlide();
      await this.generateOutroAndConclusionSlide();
      
      this.log('✅ All recruiter-friendly demo slides generated successfully!');
      
    } catch (error) {
      this.log(`❌ Error generating slides: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async generateTitleAndPersonaSlide(): Promise<void> {
    const content = `
      <p>Hi, I'm <span class="highlight">Ian Frelinger</span>, Disaster Response Platform Architect.</p>
      <br>
      <p>I'm building this system through the lens of an <span class="tech-term">Incident Commander</span> and <span class="tech-term">Operations Manager</span>.</p>
      <br>
      <p>This briefing covers how we transform disconnected data into coordinated emergency response.</p>
    `;
    await this.generateStaticSlide('01_title_and_persona', 'Title & Persona', content);
  }

  private async generateProblemAndOutcomesSlide(): Promise<void> {
    const content = `
      <p>Emergency managers face <span class="highlight">disconnected systems</span> that slow response times.</p>
      <br>
      <p>Our platform provides <span class="tech-term">hazards + exposure + conditions</span> in one unified view.</p>
      <br>
      <p>This turns insight into <span class="api-endpoint">clear assignments</span> for faster decisions, safer access, and reliable status tracking.</p>
    `;
    await this.generateStaticSlide('02_problem_and_outcomes', 'Problem & Outcomes', content);
  }

  private async generateDataAndArchitectureSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Foundry</span> ingests data from <span class="tech-term">FIRMS</span>, <span class="tech-term">NOAA</span>, <span class="tech-term">911</span>, population, and traffic feeds.</p>
      <br>
      <p><span class="api-endpoint">Backend</span>: Python/Flask + Celery + WebSockets</p>
      <p><span class="api-endpoint">Frontend</span>: React + Mapbox</p>
      <br>
      <p><span class="metric">APIs</span>: /api/hazards /api/risk /api/routes /api/units /api/evacuations /api/public_safety</p>
    `;
    await this.generateStaticSlide('03_data_and_architecture', 'Data & Architecture', content);
  }

  private async generateBackendAPIOverviewSlide(): Promise<void> {
    const content = `
      <p>Our <span class="highlight">backend API</span> is built with <span class="tech-term">Python FastAPI</span>, providing high-performance asynchronous endpoints.</p>
      <br>
      <p>The API serves as the <span class="api-endpoint">central nervous system</span>, processing real-time data streams and coordinating between multiple data sources.</p>
      <br>
      <p>We use <span class="tech-term">PostgreSQL with PostGIS</span> for geospatial data and <span class="tech-term">Redis</span> for caching and real-time updates.</p>
    `;
    await this.generateStaticSlide('04_backend_api_overview', 'Backend API Overview', content);
  }

  private async generateAPIDataFlowSlide(): Promise<void> {
    const content = `
      <p>Data flows through our API in <span class="highlight">three layers</span>: ingestion, processing, and delivery.</p>
      <br>
      <p><span class="tech-term">Ingestion</span>: FIRMS wildfire data, NOAA weather feeds, and 911 call centers</p>
      <p><span class="tech-term">Processing</span>: H3 geospatial indexing and risk algorithms</p>
      <p><span class="tech-term">Delivery</span>: REST endpoints and WebSocket streams for real-time updates</p>
    `;
    await this.generateStaticSlide('05_api_data_flow', 'API Data Flow', content);
  }

  private async generateHazardsAPIEndpointsSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">hazards API</span> provides comprehensive incident management endpoints:</p>
      <br>
      <p><span class="api-endpoint">/api/hazards</span> - Active incidents</p>
      <p><span class="api-endpoint">/api/hazards/history</span> - Historical data</p>
      <p><span class="api-endpoint">/api/hazards/forecast</span> - Predictive modeling</p>
      <br>
      <p>Each endpoint returns <span class="tech-term">GeoJSON</span> with H3 cell data, confidence scores, and temporal information.</p>
    `;
    await this.generateStaticSlide('06_hazards_api_endpoints', 'Hazards API Endpoints', content);
  }

  private async generateRiskAssessmentEngineSlide(): Promise<void> {
    const content = `
      <p>Our <span class="highlight">risk assessment engine</span> processes multiple factors:</p>
      <br>
      <p><span class="tech-term">Proximity</span> to population centers</p>
      <p><span class="tech-term">Weather conditions</span> and patterns</p>
      <p><span class="tech-term">Historical incidents</span> and infrastructure vulnerability</p>
      <br>
      <p>The engine calculates <span class="api-endpoint">dynamic risk scores</span> using machine learning models trained on historical emergency response data.</p>
    `;
    await this.generateStaticSlide('07_risk_assessment_engine', 'Risk Assessment Engine', content);
  }

  private async generateRoutingAPIArchitectureSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">routing API</span> uses <span class="tech-term">A-star pathfinding</span> with real-time constraints.</p>
      <br>
      <p><span class="api-endpoint">/api/routes/calculate</span> - Path generation</p>
      <p><span class="api-endpoint">/api/routes/optimize</span> - Multi-objective optimization</p>
      <p><span class="api-endpoint">/api/routes/traffic</span> - Real-time traffic integration</p>
      <br>
      <p>Optimized for <span class="tech-term">emergency response</span> scenarios with dynamic route adjustments.</p>
    `;
    await this.generateStaticSlide('08_routing_api_architecture', 'Routing API Architecture', content);
  }

  private async generateRealTimeWebSocketStreamsSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">WebSocket connections</span> provide real-time data streaming for live updates.</p>
      <br>
      <p>Clients subscribe to specific channels:</p>
      <p><span class="tech-term">hazards</span> - Incident updates</p>
      <p><span class="tech-term">weather</span> - Condition changes</p>
      <p><span class="tech-term">units</span> - Resource status</p>
      <br>
      <p>Each message includes <span class="api-endpoint">timestamp, location, and metadata</span> for precise synchronization.</p>
    `;
    await this.generateStaticSlide('09_real_time_websocket_streams', 'Real-time WebSocket Streams', content);
  }

  private async generateDatabaseSchemaDesignSlide(): Promise<void> {
    const content = `
      <p>Our <span class="highlight">PostgreSQL schema</span> uses <span class="tech-term">PostGIS extensions</span> for geospatial queries.</p>
      <br>
      <p>Tables include:</p>
      <p><span class="api-endpoint">incidents</span> - H3 cell mapping</p>
      <p><span class="api-endpoint">units</span> - Real-time status</p>
      <p><span class="api-endpoint">routes</span> - Optimization parameters</p>
      <p><span class="api-endpoint">evacuations</span> - Progress tracking</p>
      <br>
      <p>Indexes are optimized for <span class="tech-term">spatial and temporal queries</span>.</p>
    `;
    await this.generateStaticSlide('10_database_schema_design', 'Database Schema Design', content);
  }

  private async generateAPISecurityAndAuthenticationSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">API security</span> includes comprehensive protection measures:</p>
      <br>
      <p><span class="tech-term">JWT token authentication</span> and rate limiting</p>
      <p><span class="tech-term">Role-based access control</span> for different user types</p>
      <p><span class="tech-term">Emergency managers</span> get full access</p>
      <p><span class="tech-term">Public safety officials</span> have restricted endpoints</p>
      <br>
      <p>All API calls are <span class="api-endpoint">logged for audit trails</span> and compliance requirements.</p>
    `;
    await this.generateStaticSlide('11_api_security_and_authentication', 'API Security & Authentication', content);
  }

  private async generateLiveHazardMapSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Live Hazard Map</span> serves as our operational canvas.</p>
      <br>
      <p><span class="tech-term">Hazard cells</span> are visible with real-time updates from satellite and ground sensors.</p>
      <br>
      <p>Commanders can focus on specific areas and track changes as conditions evolve.</p>
    `;
    await this.generateStaticSlide('12_live_hazard_map', 'Live Hazard Map', content);
  }

  private async generateExposureAndConditionsSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Buildings ON</span> shows population exposure as a proxy for risk assessment.</p>
      <br>
      <p><span class="tech-term">Weather ON</span> displays current conditions that shape access and operations.</p>
      <br>
      <p>This reveals <span class="api-endpoint">who's affected</span> and <span class="api-endpoint">what shapes access</span> in real-time.</p>
    `;
    await this.generateStaticSlide('13_exposure_and_conditions', 'Exposure & Conditions', content);
  }

  private async generateIncidentTriageSlide(): Promise<void> {
    const content = `
      <p>Select an <span class="highlight">incident cell</span> to begin the operational workflow.</p>
      <br>
      <p>Confirm <span class="tech-term">quick details</span>: confidence, start time, and nearby population.</p>
      <br>
      <p>This <span class="api-endpoint">anchors the workflow</span> and sets the context for all subsequent decisions.</p>
    `;
    await this.generateStaticSlide('14_incident_triage', 'Incident Triage', content);
  }

  private async generateResourceRosterSlide(): Promise<void> {
    const content = `
      <p>Open <span class="highlight">Units</span> to access the resource roster.</p>
      <br>
      <p>Select <span class="tech-term">Engine 21</span> from available units.</p>
      <br>
      <p>Match capability to assignment based on incident requirements and unit status.</p>
    `;
    await this.generateStaticSlide('15_resource_roster', 'Resource Roster', content);
  }

  private async generateRoutePlanningSlide(): Promise<void> {
    const content = `
      <p>Switch to <span class="highlight">routing view</span> for path planning.</p>
      <br>
      <p>Set <span class="tech-term">Start: Staging Area</span> and <span class="tech-term">End near incident</span>.</p>
      <br>
      <p>Configure <span class="api-endpoint">Profile: FIRE_TACTICAL</span> for emergency response routing.</p>
    `;
    await this.generateStaticSlide('16_route_planning', 'Route Planning', content);
  }

  private async generateRouteResultSlide(): Promise<void> {
    const content = `
      <p>Generate Route using the <span class="highlight">A-star algorithm</span> with real-time constraints.</p>
      <br>
      <p>View <span class="tech-term">polyline, ETA, and distance</span> for the optimal path.</p>
      <br>
      <p>Ensure safe, predictable access that respects current conditions.</p>
    `;
    await this.generateStaticSlide('17_route_result', 'Route Result', content);
  }

  private async generateTaskingSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Assign to Route</span> to create the operational tasking.</p>
      <br>
      <p>This provides a <span class="tech-term">defined task plus access plan</span> for the unit.</p>
      <br>
      <p>Now shift to the broader picture to monitor overall operations.</p>
    `;
    await this.generateStaticSlide('18_tasking', 'Tasking', content);
  }

  private async generateAIPGuidanceSlide(): Promise<void> {
    const content = `
      <p>Access <span class="highlight">AIP Decision Support</span> for AI-powered recommendations.</p>
      <br>
      <p>Review <span class="tech-term">recommendations + confidence</span> levels for each decision point.</p>
      <br>
      <p>Use this as a <span class="api-endpoint">quick cross-check</span> against operational experience.</p>
    `;
    await this.generateStaticSlide('19_aip_guidance', 'AIP Guidance', content);
  }

  private async generateOpsStatusAndCTASlide(): Promise<void> {
    const content = `
      <p>Monitor <span class="highlight">Building Evacuation Tracker</span> for real-time progress.</p>
      <br>
      <p>Track evacuation status, unit positions, and emerging risks.</p>
      <br>
      <p>Ready to <span class="api-endpoint">invite personalized scenario</span> for your specific use case.</p>
    `;
    await this.generateStaticSlide('20_ops_status_and_cta', 'Ops Status & CTA', content);
  }

  private async generateOutroAndConclusionSlide(): Promise<void> {
    const content = `
      <p>Thank you for joining me on this <span class="highlight">technical deep dive</span> into our disaster response platform.</p>
      <br>
      <p>We've demonstrated how <span class="tech-term">real-time data integration</span>, <span class="tech-term">intelligent routing</span>, and <span class="tech-term">AI-powered decision support</span> can transform emergency response operations.</p>
      <br>
      <p>This system represents the future of <span class="api-endpoint">emergency management</span>—where every second counts and every decision matters.</p>
      <br>
      <p>For more information or to schedule a <span class="highlight">personalized demo</span>, please visit our website or contact our team.</p>
      <br>
      <p><span class="metric">Together, we can build a safer, more resilient future.</span></p>
    `;
    await this.generateStaticSlide('21_outro_and_conclusion', 'Outro & Conclusion', content);
  }
}

// Main execution
async function main() {
  const generator = new StaticSlideGeneratorFixed();
  await generator.generateAllSlides();
}

main().catch(console.error);
