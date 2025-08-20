#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Updated narration scripts for 12 condensed beats with regular spelling (phonetic only for special cases)
const TECHNICAL_NARRATION_SCRIPTS = {
  'Persona & Problem': {
    script: "Hi, I'm Ian Frelinger, Disaster Response Platform Architect. In live incidents, seconds matter. Emergency managers face disconnected systems that slow response times. Our platform provides hazards, exposure and conditions in one unified view. This turns insight into clear assignments for faster decisions.",
    duration: 30
  },
  'High-Level Architecture': {
    script: "Data streams in from Fire Information Resource Management System, National Oceanic and Atmospheric Administration, nine-one-one, population and traffic. Thanks to Pal-an-TEER Found-ree, this fusion happens in real time, keeping all stakeholders in sync. Our Python/Flask backend with Sell-uh-ree and Web-Sockets delivers real-time updates. The Ree-act/Map-box front end consumes APIs for hazards, risk, routes, units, evacuations and public safety. Now let's look at how we visualize hazards and conditions on the map.",
    duration: 45
  },
  'Live Hazard Map': {
    script: "We operate from the Live Hazard Map. Hazard cells show what's active, where it's clustered and where to focus next. This gives immediate situational awareness.",
    duration: 30
  },
  'Exposure & Conditions': {
    script: "I turn on the Buildings and Weather layers. Buildings act as a practical proxy for population exposure. Weather shows conditions that shape access and operations.",
    duration: 30
  },
  'Incident Focus': {
    script: "I center the map on a specific hazard. This anchors the workflow to the right location. Now let's select resources and plan our response.",
    duration: 30
  },
  'Resource Selection': {
    script: "I open the Units panel and select a fire engine from the roster. The roster shows status and location at a glance. This helps me ensure the right capability reaches the right place, faster.",
    duration: 30
  },
  'Route Planning': {
    script: "I open the Routing panel and choose a Fire Tac-ti-cal profile. The system shows the route that matches this profile. This includes staging and access points.",
    duration: 30
  },
  'Route Review': {
    script: "I review the route details—estimated time of arrival and distance. This tells me how long it will take and which path the unit will follow. Now let's confirm the assignment.",
    duration: 30
  },
  'Task Assignment': {
    script: "With the route validated, I confirm the unit will follow it. Now I know the plan is actionable and can be executed confidently. Let's check our Artificial Intelligence-powered decision support.",
    duration: 30
  },
  'AIP Guidance': {
    script: "In Artificial Intelligence Platform decision support, I review recommendations and confidence levels. This provides a quick cross-check against operational experience. Now let's monitor our progress.",
    duration: 30
  },
  'Progress Tracking': {
    script: "I open the Building Evacuation Tracker to monitor status and progress. From map to assignment to tracking, everything stays connected. This completes our operational workflow.",
    duration: 30
  },
  'Conclusion & CTA': {
    script: "Thank you for joining me on this technical deep dive. We've seen how real-time data fusion, intelligent routing and Artificial Intelligence-powered decision support transform emergency response. Together, we can reduce response times and save lives. For a personalized demo, please contact our team.",
    duration: 30
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
      
      this.log('🎬 Generating static slides for Disaster Response Platform...');
      
      // Generate original 12-beat condensed demo slides
      await this.generatePersonaAndProblemSlide();
      await this.generateArchitectureOverviewSlide();
      await this.generateLiveHazardMapSlide();
      await this.generateExposureAndConditionsSlide();
      await this.generateIncidentFocusSlide();
      await this.generateResourceSelectionSlide();
      await this.generateRoutePlanningSlide();
      await this.generateRouteReviewSlide();
      await this.generateTaskAssignmentSlide();
      await this.generateAIPGuidanceSlide();
      await this.generateProgressTrackingSlide();
      await this.generateConclusionAndCTASlide();
      
      this.log('✅ All Disaster Response Platform slides generated successfully!');
      
    } catch (error) {
      this.log(`❌ Error generating slides: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // Original slide generation methods
  private async generatePersonaAndProblemSlide(): Promise<void> {
    const content = `
      <p>Hi, I'm <span class="highlight">Ian Frelinger</span>, Disaster Response Platform Architect.</p>
      <br>
      <p>In live incidents, <span class="tech-term">seconds matter</span>.</p>
      <br>
      <p>Emergency managers face <span class="api-endpoint">disconnected systems</span> that slow response times.</p>
      <br>
      <p>Our platform provides <span class="highlight">hazards + exposure + conditions</span> in one unified view.</p>
    `;
    await this.generateStaticSlide('01_persona_and_problem', 'Persona & Problem', content);
  }

  private async generateArchitectureOverviewSlide(): Promise<void> {
    const content = `
      <p>Data streams in from <span class="highlight">FIRMS</span>, <span class="highlight">NOAA</span>, <span class="highlight">911</span>, population and traffic.</p>
      <br>
      <p>Thanks to <span class="tech-term">Palantir Foundry</span>, this fusion happens in real time, keeping all stakeholders in sync.</p>
      <br>
      <p><span class="api-endpoint">Backend</span>: Python/Flask + Celery + WebSockets</p>
      <p><span class="api-endpoint">Frontend</span>: React + Mapbox</p>
      <br>
      <p>APIs: hazards, risk, routes, units, evacuations, public safety</p>
    `;
    await this.generateStaticSlide('02_architecture_overview', 'Architecture Overview', content);
  }

  private async generateLiveHazardMapSlide(): Promise<void> {
    const content = `
      <p>We operate from the <span class="highlight">Live Hazard Map</span>.</p>
      <br>
      <p><span class="tech-term">Hazard cells</span> show what's active, where it's clustered and where to focus next.</p>
      <br>
      <p>This gives immediate <span class="api-endpoint">situational awareness</span>.</p>
    `;
    await this.generateStaticSlide('03_live_hazard_map', 'Live Hazard Map', content);
  }

  private async generateExposureAndConditionsSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Buildings</span> and <span class="highlight">Weather</span> layers provide critical context.</p>
      <br>
      <p><span class="tech-term">Buildings</span> act as a practical proxy for population exposure.</p>
      <br>
      <p><span class="tech-term">Weather</span> shows conditions that shape access and operations.</p>
    `;
    await this.generateStaticSlide('04_exposure_and_conditions', 'Exposure & Conditions', content);
  }

  private async generateIncidentFocusSlide(): Promise<void> {
    const content = `
      <p>The map centers on the <span class="highlight">selected hazard</span> location.</p>
      <br>
      <p>This <span class="tech-term">anchors the workflow</span> to the incident area.</p>
      <br>
      <p>Resource selection and response planning can begin.</p>
    `;
    await this.generateStaticSlide('05_incident_focus', 'Incident Focus', content);
  }

  private async generateResourceSelectionSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Units</span> panel allows you to select individual units from the roster.</p>
      <br>
      <p>The roster displays <span class="tech-term">status and location</span> information at a glance.</p>
      <br>
      <p>This ensures the <span class="api-endpoint">right capability reaches the right place, faster</span>.</p>
    `;
    await this.generateStaticSlide('06_resource_selection', 'Resource Selection', content);
  }

  private async generateRoutePlanningSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Routing</span> panel provides <span class="tech-term">Fire TAC-ti-cal</span> profile selection.</p>
      <br>
      <p>The system automatically generates routes that match the selected profile.</p>
      <br>
      <p>Routes include <span class="api-endpoint">staging and access points</span> for tactical operations.</p>
    `;
    await this.generateStaticSlide('07_route_planning', 'Route Planning', content);
  }

  private async generateRouteReviewSlide(): Promise<void> {
    const content = `
      <p>Route details display <span class="highlight">estimated time of arrival</span> and <span class="highlight">distance</span> information.</p>
      <br>
      <p>This provides timing estimates and the exact path the unit will follow.</p>
      <br>
      <p>Assignment confirmation can proceed once route is <span class="api-endpoint">validated</span>.</p>
    `;
    await this.generateStaticSlide('08_route_review', 'Route Review', content);
  }

  private async generateTaskAssignmentSlide(): Promise<void> {
    const content = `
      <p>Route validation <span class="highlight">confirms the unit will follow</span> the planned path.</p>
      <br>
      <p>The plan becomes <span class="tech-term">actionable and can be executed</span> with confidence.</p>
      <br>
      <p><span class="api-endpoint">Artificial Intelligence-powered decision support</span> provides additional guidance.</p>
    `;
    await this.generateStaticSlide('09_task_assignment', 'Task Assignment', content);
  }

  private async generateAIPGuidanceSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Artificial Intelligence Platform decision support</span> system displays recommendations and confidence levels.</p>
      <br>
      <p>This provides a <span class="tech-term">quick cross-check</span> against operational experience.</p>
      <br>
      <p>Progress monitoring can begin once <span class="api-endpoint">guidance is reviewed</span>.</p>
    `;
    await this.generateStaticSlide('10_aip_guidance', 'AIP Guidance', content);
  }

  private async generateProgressTrackingSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Building Evacuation Tracker</span> monitors status and progress in real-time.</p>
      <br>
      <p>From map to assignment to tracking, <span class="tech-term">everything remains connected</span>.</p>
      <br>
      <p>This completes the <span class="api-endpoint">operational workflow</span> cycle.</p>
    `;
    await this.generateStaticSlide('11_progress_tracking', 'Progress Tracking', content);
  }

  private async generateConclusionAndCTASlide(): Promise<void> {
    const content = `
      <p>Thank you for joining me on this <span class="highlight">platform demonstration</span>.</p>
      <br>
      <p>We've seen how <span class="tech-term">real-time data fusion</span>, <span class="tech-term">intelligent routing</span> and <span class="tech-term">Artificial Intelligence-powered decision support</span> transform emergency response.</p>
      <br>
      <p><span class="api-endpoint">Together, we can reduce response times and save lives</span>.</p>
      <br>
      <p>For a <span class="highlight">personalized demo</span>, please contact our team.</p>
    `;
    await this.generateStaticSlide('12_conclusion_and_cta', 'Conclusion & CTA', content);
  }
}

// Main execution
async function main() {
  const generator = new StaticSlideGeneratorFixed();
  await generator.generateAllSlides();
}

main().catch(console.error);
