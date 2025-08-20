#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { chromium, type Browser } from 'playwright';

interface ChartConfig {
  name: string;
  title: string;
  mermaidCode: string;
  filename: string;
}

class MermaidChartExporter {
  private browser: Browser | null = null;
  private outputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.outputDir = path.join(__dirname, '..', 'captures', 'mermaid-charts');
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
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
    this.log('✅ Browser initialized for Mermaid chart export', 'success');
  }

  private getChartConfigs(): ChartConfig[] {
    return [
      {
        name: 'Data Sources to Backend',
        title: 'Real-time Data Pipeline',
        filename: 'slide3_data_sources_to_backend.png',
        mermaidCode: `
graph TB
    subgraph "External Data Sources"
        FIRMS["NASA FIRMS<br/>Satellite Fire Detection"]
        NOAA["NOAA Weather<br/>Atmospheric Data"]
        E911["911 Emergency<br/>Call Feeds"]
        GPS["GPS Tracking<br/>Emergency Vehicles"]
        TRAFFIC["Traffic APIs<br/>Road Conditions"]
    end
    
    subgraph "Palantir Foundry Platform"
        INPUTS["Foundry Inputs<br/>Real-time Ingestion"]
        FUNCTIONS["Foundry Functions<br/>Data Fusion & Processing"]
        OUTPUTS["Foundry Outputs<br/>Processed Data Streams"]
    end
    
    subgraph "Backend Architecture"
        FLASK["Flask API<br/>REST Gateway"]
        CELERY["Celery Workers<br/>Async Processing"]
        REDIS["Redis Cache<br/>Real-time Data"]
        WEBSOCKET["WebSockets<br/>Live Updates"]
    end
    
    FIRMS --> INPUTS
    NOAA --> INPUTS
    E911 --> INPUTS
    GPS --> INPUTS
    TRAFFIC --> INPUTS
    
    INPUTS --> FUNCTIONS
    FUNCTIONS --> OUTPUTS
    
    OUTPUTS --> FLASK
    OUTPUTS --> CELERY
    OUTPUTS --> REDIS
    
    FLASK --> WEBSOCKET
    CELERY --> WEBSOCKET
    REDIS --> WEBSOCKET
    
    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000
    classDef foundry fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000000
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000
    
    class FIRMS,NOAA,E911,GPS,TRAFFIC external
    class INPUTS,FUNCTIONS,OUTPUTS foundry
    class FLASK,CELERY,REDIS,WEBSOCKET backend
        `
      },
      {
        name: 'Processing Engines',
        title: 'ML-Powered Decision Engines',
        filename: 'slide4_processing_engines.png',
        mermaidCode: `
graph LR
    subgraph "Data Input"
        HAZARD_DATA["Hazard Data<br/>FIRMS + Weather"]
        SPATIAL_DATA["Spatial Data<br/>H3 Hexagons"]
        ROUTE_DATA["Route Data<br/>Road Networks"]
    end
    
    subgraph "Processing Engines"
        HP["HazardProcessor<br/>ML Forecasting<br/>RandomForest Models"]
        RP["RiskProcessor<br/>Spatial Analysis<br/>H3 Resolution-9"]
        RO["RouteOptimizer<br/>A* Algorithm<br/>Hazard Avoidance"]
    end
    
    subgraph "Output"
        PREDICTIONS["Fire Spread<br/>Predictions"]
        RISK_ZONES["Risk Assessment<br/>Hexagon Grids"]
        OPTIMAL_ROUTES["Safe Routes<br/>Real-time"]
    end
    
    HAZARD_DATA --> HP
    SPATIAL_DATA --> RP
    ROUTE_DATA --> RO
    
    HP --> PREDICTIONS
    RP --> RISK_ZONES
    RO --> OPTIMAL_ROUTES
    
    HP -.-> RP
    RP -.-> RO
    
    classDef input fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    classDef engine fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    classDef output fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000000
    
    class HAZARD_DATA,SPATIAL_DATA,ROUTE_DATA input
    class HP,RP,RO engine
    class PREDICTIONS,RISK_ZONES,OPTIMAL_ROUTES output
        `
      },
      {
        name: 'API Surface to Frontend',
        title: 'API Integration Architecture',
        filename: 'slide5_api_surface_to_frontend.png',
        mermaidCode: `
graph TB
    subgraph "Backend APIs"
        HAZARDS_API["/api/hazards<br/>Active Incidents"]
        ZONES_API["/api/hazard_zones<br/>Spatial Risk"]
        ROUTES_API["/api/routes<br/>Optimized Paths"]
        RISK_API["/api/risk<br/>Location Analysis"]
        EVAC_API["/api/evacuations<br/>Progress Tracking"]
        UNITS_API["/api/units<br/>Resource Management"]
        SAFETY_API["/api/public_safety<br/>Communications"]
    end
    
    subgraph "Communication Layer"
        REST["REST APIs<br/>Synchronous Data"]
        WEBSOCKETS["WebSockets<br/>Real-time Events"]
    end
    
    subgraph "Frontend Components"
        MAP["Live Hazard Map<br/>Spatial Visualization"]
        UNITS_PANEL["Emergency Units<br/>Resource Tracking"]
        ROUTING_PANEL["Route Planning<br/>Optimization"]
        AIP_PANEL["AIP Decision Support<br/>ML Recommendations"]
        TRACKER_PANEL["Evacuation Tracker<br/>Progress Monitoring"]
        ANALYTICS_PANEL["Analytics Dashboard<br/>Performance Metrics"]
    end
    
    HAZARDS_API --> REST
    ZONES_API --> REST
    ROUTES_API --> REST
    RISK_API --> REST
    EVAC_API --> REST
    UNITS_API --> REST
    SAFETY_API --> REST
    
    REST --> MAP
    REST --> UNITS_PANEL
    REST --> ROUTING_PANEL
    REST --> AIP_PANEL
    REST --> TRACKER_PANEL
    REST --> ANALYTICS_PANEL
    
    WEBSOCKETS --> MAP
    WEBSOCKETS --> UNITS_PANEL
    WEBSOCKETS --> ROUTING_PANEL
    WEBSOCKETS --> AIP_PANEL
    WEBSOCKETS --> TRACKER_PANEL
    WEBSOCKETS --> ANALYTICS_PANEL
    
    classDef api fill:#fff8e1,stroke:#f57c00,stroke-width:2px,color:#000000
    classDef comm fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#000000
    classDef frontend fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000000
    
    class HAZARDS_API,ZONES_API,ROUTES_API,RISK_API,EVAC_API,UNITS_API,SAFETY_API api
    class REST,WEBSOCKETS comm
    class MAP,UNITS_PANEL,ROUTING_PANEL,AIP_PANEL,TRACKER_PANEL,ANALYTICS_PANEL frontend
        `
      },
      {
        name: 'Request Lifecycle',
        title: 'Async Route Planning',
        filename: 'slide10_request_lifecycle.png',
        mermaidCode: `
sequenceDiagram
    participant UI as Frontend UI
    participant API as Flask API
    participant CELERY as Celery Worker
    participant REDIS as Redis Cache
    participant WS as WebSocket
    
    UI->>API: POST /api/routes<br/>{origin, destination, profile}
    API->>API: Validate request
    API->>CELERY: Submit route calculation job
    API->>UI: 202 Accepted<br/>{jobId: "route_123"}
    
    Note over CELERY: Processing Route
    CELERY->>CELERY: Load hazard data
    CELERY->>CELERY: Calculate A* path
    CELERY->>CELERY: Apply constraints
    CELERY->>CELERY: Optimize route
    
    CELERY->>REDIS: Store route result
    CELERY->>WS: route_ready event<br/>{jobId: "route_123"}
    
    WS->>UI: WebSocket message<br/>route_ready
    
    UI->>API: GET /api/routes/route_123
    API->>REDIS: Retrieve route data
    API->>UI: Route response<br/>{geometry, eta, distance, hazards}
    
    Note over UI: Update map with route
    Note over UI: Display ETA and distance
    Note over UI: Show hazard avoidance
    
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    classDef backend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000000
    classDef cache fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000
    
    class UI frontend
    class API,CELERY,WS backend
    class REDIS cache
        `
      }
    ];
  }

  private createChartHTML(chartConfig: ChartConfig): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${chartConfig.title}</title>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #0d1117 0%, #161b22 25%, #21262d 50%, #161b22 75%, #0d1117 100%);
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #f0f6fc;
            }
            .chart-container {
              background: rgba(13, 17, 23, 0.9);
              border-radius: 8px;
              padding: 40px;
              border: 1px solid rgba(48, 54, 61, 0.6);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            }
            .chart-title {
              text-align: center;
              font-size: 1.8rem;
              font-weight: 700;
              margin-bottom: 30px;
              color: #ffffff;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            .mermaid {
              text-align: center;
            }
            .mermaid svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="chart-container">
            <h1 class="chart-title">${chartConfig.title}</h1>
            <div class="mermaid">
              ${chartConfig.mermaidCode}
            </div>
          </div>
          <script>
            mermaid.initialize({
              startOnLoad: true,
              theme: 'dark',
              themeVariables: {
                darkMode: true,
                primaryColor: '#58a6ff',
                primaryTextColor: '#f0f6fc',
                primaryBorderColor: '#1f6feb',
                lineColor: '#30363d',
                secondaryColor: '#21262d',
                tertiaryColor: '#161b22',
                background: '#0d1117',
                surfaceColor: '#161b22',
                surfaceBorderColor: '#30363d',
                textColor: '#f0f6fc',
                fontSize: '14px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
              },
              sequence: {
                useMaxWidth: true,
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35,
                mirrorActors: true,
                bottomMarginAdj: 1,
                useMaxWidth: true,
                rightAngles: false,
                showSequenceNumbers: false
              }
            });
          </script>
        </body>
      </html>
    `;
  }

  private async exportChart(chartConfig: ChartConfig): Promise<void> {
    this.log(`📊 Exporting chart: ${chartConfig.name}`);
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const htmlContent = this.createChartHTML(chartConfig);
    await page.setContent(htmlContent);
    
    // Wait for Mermaid to render
    await page.waitForTimeout(3000);
    
    // Wait for the chart to be fully rendered
    await page.waitForSelector('.mermaid svg', { timeout: 10000 });
    
    const outputPath = path.join(this.outputDir, chartConfig.filename);
    await page.screenshot({ 
      path: outputPath,
      fullPage: true,
      type: 'png'
    });
    
    this.log(`✅ Chart exported: ${chartConfig.filename}`, 'success');
    await context.close();
  }

  public async exportAllCharts(): Promise<void> {
    try {
      await this.initializeBrowser();
      
      this.log('🎨 Starting Mermaid chart export...');
      
      const chartConfigs = this.getChartConfigs();
      this.log(`📊 Found ${chartConfigs.length} charts to export`);
      
      for (const chartConfig of chartConfigs) {
        try {
          await this.exportChart(chartConfig);
          // Add delay between exports
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          this.log(`⚠️  Failed to export ${chartConfig.name}: ${error}`, 'warning');
        }
      }
      
      this.log('✅ All Mermaid charts exported successfully!');
      this.log(`📁 Output directory: ${this.outputDir}`);
      
      // List exported files
      const exportedFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.png'));
      this.log(`📋 Exported ${exportedFiles.length} chart files:`);
      exportedFiles.forEach(file => {
        const stats = fs.statSync(path.join(this.outputDir, file));
        this.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
      
    } catch (error) {
      this.log(`❌ Error during chart export: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Main execution
async function main() {
  const exporter = new MermaidChartExporter();
  await exporter.exportAllCharts();
}

main().catch(console.error);
