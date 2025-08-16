import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ApiSlideCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createApiSlide() {
    console.log('📊 Creating API Endpoints Information Slide...');
    
    try {
      await this.initializeBrowser();
      await this.generateApiSlide();
      
      console.log('✅ API slide created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating API slide:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
    
    console.log('✅ Browser initialized');
  }

  private async generateApiSlide() {
    if (!this.page) return;

    // Create the API slide HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Disaster Response API Endpoints</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            min-height: 100vh;
            padding: 40px;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 40px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          }
          
          .header h1 {
            font-size: 48px;
            color: #ffd700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }
          
          .header h2 {
            font-size: 24px;
            color: #cccccc;
            font-weight: 300;
          }
          
          .api-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-bottom: 40px;
          }
          
          .api-section {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            padding: 25px;
            border-left: 4px solid #ffd700;
            transition: transform 0.3s ease;
          }
          
          .api-section:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.12);
          }
          
          .section-title {
            font-size: 20px;
            color: #ffd700;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .endpoint {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 3px solid #44ff44;
          }
          
          .endpoint-name {
            font-size: 16px;
            color: #44ff44;
            font-weight: 600;
            margin-bottom: 8px;
            font-family: 'Courier New', monospace;
          }
          
          .endpoint-desc {
            font-size: 14px;
            color: #cccccc;
            margin-bottom: 8px;
          }
          
          .endpoint-details {
            font-size: 12px;
            color: #888888;
            font-family: 'Courier New', monospace;
          }
          
          .architecture-section {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #4444ff;
          }
          
          .architecture-title {
            font-size: 24px;
            color: #4444ff;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .architecture-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .arch-component {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .arch-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .arch-title {
            font-size: 16px;
            color: #ffd700;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .arch-desc {
            font-size: 12px;
            color: #cccccc;
          }
          
          .data-flow {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #ff4444;
          }
          
          .data-flow-title {
            font-size: 24px;
            color: #ff4444;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .flow-steps {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
          }
          
          .flow-step {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 2px solid #ffd700;
            position: relative;
          }
          
          .flow-step::after {
            content: "→";
            position: absolute;
            right: -30px;
            font-size: 24px;
            color: #ffd700;
          }
          
          .flow-step:last-child::after {
            display: none;
          }
          
          .step-label {
            text-align: center;
            margin-top: 10px;
            font-size: 12px;
            color: #cccccc;
          }
          
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid rgba(255, 255, 255, 0.1);
            color: #888888;
            font-size: 14px;
          }
          
          .highlight {
            color: #ffd700;
            font-weight: 600;
          }
          
          .code {
            background: rgba(0, 0, 0, 0.5);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #44ff44;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Disaster Response API</h1>
            <h2>Real-time Emergency Coordination Platform</h2>
          </div>
          
          <div class="architecture-section">
            <div class="architecture-title">🏗️ Technical Architecture</div>
            <div class="architecture-grid">
              <div class="arch-component">
                <div class="arch-icon">📡</div>
                <div class="arch-title">Data Ingestion</div>
                <div class="arch-desc">NASA FIRMS, NOAA Weather, 911 Feeds, Population Data</div>
              </div>
              <div class="arch-component">
                <div class="arch-icon">⚙️</div>
                <div class="arch-title">Processing</div>
                <div class="arch-desc">ML Models, H3 Spatial Indexing, Risk Assessment</div>
              </div>
              <div class="arch-component">
                <div class="arch-icon">🎯</div>
                <div class="arch-title">Delivery</div>
                <div class="arch-desc">REST API, WebSocket, GeoJSON, Real-time Updates</div>
              </div>
            </div>
          </div>
          
          <div class="data-flow">
            <div class="data-flow-title">🔄 Data Flow Pipeline</div>
            <div class="flow-steps">
              <div>
                <div class="flow-step">1</div>
                <div class="step-label">Ingestion</div>
              </div>
              <div>
                <div class="flow-step">2</div>
                <div class="step-label">Foundry Fusion</div>
              </div>
              <div>
                <div class="flow-step">3</div>
                <div class="step-label">ML Processing</div>
              </div>
              <div>
                <div class="flow-step">4</div>
                <div class="step-label">Route Optimization</div>
              </div>
              <div>
                <div class="flow-step">5</div>
                <div class="step-label">API Response</div>
              </div>
            </div>
          </div>
          
          <div class="api-grid">
            <div class="api-section">
              <div class="section-title">🎯 Core Endpoints</div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/disaster-data</div>
                <div class="endpoint-desc">Comprehensive disaster response data including hazards, routes, resources, and metrics</div>
                <div class="endpoint-details">Response: JSON with real-time hazard zones, evacuation routes, emergency resources</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/hazard-summary</div>
                <div class="endpoint-desc">Summary statistics of current hazard zones and risk distribution</div>
                <div class="endpoint-details">Returns: total_hazards, risk_distribution, population_at_risk, bbox</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/hazard-zones-geojson</div>
                <div class="endpoint-desc">Hazard zones in GeoJSON format for mapping visualization</div>
                <div class="endpoint-details">Format: GeoJSON with metadata, timestamps, spatial indexing</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/evacuation-routes</div>
                <div class="endpoint-desc">Safe evacuation routes avoiding hazard zones with A-Star optimization</div>
                <div class="endpoint-details">Params: origin_lat, origin_lon, destination_lat, destination_lon</div>
              </div>
            </div>
            
            <div class="api-section">
              <div class="section-title">🔍 Analysis Endpoints</div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/risk-assessment</div>
                <div class="endpoint-desc">Risk assessment for specific location with spatial buffer analysis</div>
                <div class="endpoint-details">Params: latitude, longitude, radius_km (default: 10)</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">POST /api/calculate-safe-route</div>
                <div class="endpoint-desc">Advanced routing with hazard avoidance and vehicle constraints</div>
                <div class="endpoint-details">Vehicle types: civilian, ambulance, fire_engine, police</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/evacuation-status</div>
                <div class="endpoint-desc">Evacuation progress tracking by zone with shelter information</div>
                <div class="endpoint-details">Returns: zone_status, population_progress, nearest_shelters</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/resource-coordination</div>
                <div class="endpoint-desc">Emergency resource tracking and availability with hazard proximity</div>
                <div class="endpoint-details">Real-time GPS tracking, nearest hazards, assignment status</div>
              </div>
            </div>
          </div>
          
          <div class="api-grid">
            <div class="api-section">
              <div class="section-title">🤖 AI & ML Features</div>
              
              <div class="endpoint">
                <div class="endpoint-name">POST /api/process-hazard-data</div>
                <div class="endpoint-desc">ML-powered hazard spread prediction using RandomForest models</div>
                <div class="endpoint-details">Features: weather patterns, terrain analysis, population density</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/public-safety-status</div>
                <div class="endpoint-desc">Public-facing safety information with multi-language support</div>
                <div class="endpoint-details">Languages: English, Spanish, Chinese; evacuation recommendations</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">POST /api/ai-commander-query</div>
                <div class="endpoint-desc">Natural language AI assistant for decision support</div>
                <div class="endpoint-details">Example: "What if we lose Highway 30?" → Route recommendations</div>
              </div>
            </div>
            
            <div class="api-section">
              <div class="section-title">⚡ Performance & Integration</div>
              
              <div class="endpoint">
                <div class="endpoint-name">GET /api/health</div>
                <div class="endpoint-desc">API health check and system status monitoring</div>
                <div class="endpoint-details">Returns: status, version, uptime, performance metrics</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">WebSocket /ws/real-time</div>
                <div class="endpoint-desc">Real-time updates for live hazard tracking and resource positions</div>
                <div class="endpoint-details">Events: hazard_updates, resource_movement, evacuation_alerts</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">POST /api/update-resource-status</div>
                <div class="endpoint-desc">Update emergency resource status and assignments</div>
                <div class="endpoint-details">Status: available, deployed, responding, maintenance</div>
              </div>
              
              <div class="endpoint">
                <div class="endpoint-name">POST /api/add-alert</div>
                <div class="endpoint-desc">Add new emergency alerts and notifications</div>
                <div class="endpoint-details">Types: warning, info, critical; Severity: low, medium, high</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><span class="highlight">Foundry Integration:</span> All data processed through Palantir Foundry pipelines and ontology</p>
            <p><span class="highlight">Real-time Processing:</span> <2 second latency from data ingestion to API response</p>
            <p><span class="highlight">Spatial Indexing:</span> H3 hexagonal grid for efficient geographic queries and clustering</p>
            <p><span class="highlight">ML Models:</span> RandomForest algorithms for hazard spread prediction and risk assessment</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write HTML to file
    const htmlPath = path.join(this.outputDir, 'api_endpoints_slide.html');
    fs.writeFileSync(htmlPath, htmlContent);

    // Navigate to the slide and take a screenshot
    await this.page.goto(`file://${htmlPath}`);
    await this.page.waitForLoadState('networkidle');
    
    // Take a screenshot
    const screenshotPath = path.join(this.outputDir, 'api_endpoints_slide.png');
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      type: 'png'
    });

    console.log(`✅ API slide created: ${htmlPath}`);
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Run the slide creation
const creator = new ApiSlideCreator();
creator.createApiSlide().catch(console.error);
