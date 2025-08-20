#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class TechnicalInsertsSlideGenerator {
  private browser: Browser | null = null;
  private capturesDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.ensureCapturesDirectory();
  }

  private ensureCapturesDirectory(): void {
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

  private async generateTechnicalSlide(filename: string, title: string, content: string): Promise<void> {
    this.log(`📹 Generating technical slide: ${title}`);
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const htmlContent = this.createTechnicalSlideHTML(title, content);
    await page.setContent(htmlContent);
    
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(this.capturesDir, `${filename}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    this.log(`✅ Technical slide saved: ${screenshotPath}`, 'success');
    await context.close();
  }

  private createTechnicalSlideHTML(title: string, content: string): string {
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

  public async generateAllTechnicalSlides(): Promise<void> {
    try {
      await this.initializeBrowser();
      
      this.log('🎬 Generating technical insert slides...');
      
      // Insert 1: 90-Second Mini-Module
      await this.generateSliceASourcesToBackendSlide();
      await this.generateSliceBProcessingEnginesSlide();
      await this.generateSliceCAPISurfaceSlide();
      
      // Insert 2: Request Lifecycle
      await this.generateRequestLifecycleSlide();
      
      this.log('✅ All technical insert slides generated successfully!');
      
    } catch (error) {
      this.log(`❌ Error generating technical slides: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // Insert 1: Slice A - Sources → Foundry → Backend (30 seconds)
  private async generateSliceASourcesToBackendSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">External Data Sources</span> flow into <span class="tech-term">Palantir Foundry</span> for real-time processing:</p>
      <br>
      <p><span class="data-flow">FIRMS, NOAA, 911, traffic, GPS</span> → <span class="tech-term">Foundry Inputs/Functions/Outputs</span></p>
      <br>
      <p>Our <span class="api-endpoint">Flask API + Celery + Redis</span> architecture pulls processed outputs:</p>
      <br>
      <p><span class="tech-term">REST APIs</span> for data access + <span class="tech-term">WebSockets</span> for real-time updates</p>
      <br>
      <p>This creates a unified data pipeline that powers all emergency response operations.</p>
    `;
    await this.generateTechnicalSlide('insert1_slice_a_sources_to_backend', 'Data Sources → Foundry → Backend', content);
  }

  // Insert 1: Slice B - Processing Engines (35 seconds)
  private async generateSliceBProcessingEnginesSlide(): Promise<void> {
    const content = `
      <p>Three specialized <span class="highlight">Processing Engines</span> power intelligent decision-making:</p>
      <br>
      <p><span class="tech-term">HazardProcessor</span> (ML Forecasting): RandomForest models predict fire spread patterns</p>
      <p><span class="tech-term">RiskProcessor</span> (H3 Spatial): H3 resolution-9 hexagons (~174m) for spatial analysis</p>
      <p><span class="tech-term">RouteOptimizer</span> (A* Algorithm): Advanced pathfinding with hazard avoidance</p>
      <br>
      <p>Each engine processes data through <span class="api-endpoint">Foundry Functions</span> with real-time updates.</p>
      <br>
      <p>This enables <span class="highlight">ML-powered predictions</span> and <span class="highlight">intelligent routing</span> for emergency response.</p>
    `;
    await this.generateTechnicalSlide('insert1_slice_b_processing_engines', 'Processing Engines', content);
  }

  // Insert 1: Slice C - API Surface → Frontend (25 seconds)
  private async generateSliceCAPISurfaceSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">API Surface</span> connects backend processing to frontend interface:</p>
      <br>
      <p><span class="api-endpoint">/api/hazards</span> - Active incident data</p>
      <p><span class="api-endpoint">/api/hazard_zones</span> - Spatial risk assessment</p>
      <p><span class="api-endpoint">/api/routes</span> - Optimized evacuation paths</p>
      <p><span class="api-endpoint">/api/risk</span> - Location-specific risk analysis</p>
      <p><span class="api-endpoint">/api/evacuations</span> - Progress tracking</p>
      <p><span class="api-endpoint">/api/units</span> - Resource management</p>
      <p><span class="api-endpoint">/api/public_safety</span> - Public communications</p>
      <br>
      <p><span class="tech-term">REST APIs</span> expose data + <span class="tech-term">WebSockets</span> push live events to dashboard</p>
    `;
    await this.generateTechnicalSlide('insert1_slice_c_api_surface', 'API Surface → Frontend', content);
  }

  // Insert 2: Request Lifecycle (25-30 seconds)
  private async generateRequestLifecycleSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Async Request Lifecycle</span> for route planning:</p>
      <br>
      <p><span class="api-endpoint">POST /api/routes</span> → <span class="tech-term">202 Accepted (jobId)</span></p>
      <p><span class="tech-term">Celery Processing</span> → <span class="data-flow">route_ready Event</span></p>
      <p><span class="api-endpoint">GET /api/routes/:id</span> → <span class="highlight">Geometry/ETA/Distance</span></p>
      <br>
      <p>This <span class="tech-term">asynchronous architecture</span> enables:</p>
      <p>• Complex route calculations without blocking the UI</p>
      <p>• Real-time updates via WebSocket events</p>
      <p>• Scalable processing for multiple concurrent requests</p>
      <br>
      <p>The system maintains <span class="highlight">sub-second response times</span> while processing complex spatial algorithms.</p>
    `;
    await this.generateTechnicalSlide('insert2_request_lifecycle', 'Request Lifecycle', content);
  }
}

// Main execution
async function main() {
  const generator = new TechnicalInsertsSlideGenerator();
  await generator.generateAllTechnicalSlides();
}

main().catch(console.error);
