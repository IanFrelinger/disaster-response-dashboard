import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TimelineSegment {
  name: string;
  start: number;
  duration: number;
  narration: string;
  visual: string;
  graphics: any[];
  transitions: {
    in: string;
    out: string;
  };
  source?: string;
}

class Timeline3VideoCreatorEnhanced {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private timeline: any;
  private videoPresentationDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.videoPresentationDir = path.join(__dirname, '..', 'VideoPresentation');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createTimeline3Video() {
    console.log('🎬 Starting Enhanced Timeline 3 Video Creation...');
    console.log('This will create a video based on "Video presentation plan-3"');
    console.log('📹 Using both live interactions and VideoPresentation assets');
    
    try {
      // Load timeline-3.yaml
      await this.loadTimeline();
      
      // Check VideoPresentation assets
      await this.checkVideoPresentationAssets();
      
      // Initialize browser
      await this.initializeBrowser();
      
      // Record video segments with interactions and assets
      await this.recordVideoSegments();
      
      // Generate final video
      await this.generateFinalVideo();
      
      console.log('✅ Enhanced Timeline 3 video creation completed!');
      console.log('🎬 Professional video with live interactions and assets ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async loadTimeline() {
    const timelinePath = path.join(__dirname, '..', 'timeline-3.yaml');
    const timelineContent = fs.readFileSync(timelinePath, 'utf8');
    this.timeline = yaml.load(timelineContent);
    
    console.log(`📹 Timeline loaded: ${this.timeline.timeline.duration} seconds total`);
    console.log(`🎭 ${this.timeline.timeline.tracks.video.length} video segments`);
  }

  private async checkVideoPresentationAssets() {
    console.log('📁 Checking VideoPresentation assets...');
    
    const assets = [
      'introduction_generated_new.png',
      'user_persona_generated_new.png',
      'hazard_detection.png',
      'api_dataflow_diagram.png',
      'asset_management.png',
      'ai_support.png',
      'conclusion_generated_new.png'
    ];
    
    const availableAssets = [];
    for (const asset of assets) {
      const assetPath = path.join(this.videoPresentationDir, asset);
      if (fs.existsSync(assetPath)) {
        availableAssets.push(asset);
        console.log(`✅ Found asset: ${asset}`);
      } else {
        console.log(`⚠️  Missing asset: ${asset}`);
      }
    }
    
    console.log(`📊 Found ${availableAssets.length}/${assets.length} VideoPresentation assets`);
    return availableAssets;
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser for video recording...');
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the frontend
    await this.page.goto('http://localhost:3000');
    await this.page.waitForLoadState('networkidle');
    
    console.log('✅ Browser initialized for video recording');
  }

  private async recordVideoSegments() {
    const segments = this.timeline.timeline.tracks.video;
    
    console.log(`🎬 Recording ${segments.length} video segments with interactions and assets...`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`📹 Recording segment ${i + 1}/${segments.length}: ${segment.name}`);
      
      // Check if we have a corresponding asset
      const assetPath = await this.getAssetPathForSegment(segment);
      
      if (assetPath) {
        // Use the asset image
        await this.recordSegmentWithAsset(segment, assetPath);
      } else {
        // Fall back to live interaction
        await this.navigateToSegment(segment);
        await this.recordSegmentVideo(segment);
      }
      
      console.log(`✅ Segment ${segment.name} recorded`);
    }
  }

  private async getAssetPathForSegment(segment: TimelineSegment): Promise<string | null> {
    const assetMapping: { [key: string]: string } = {
      'introduction': 'introduction_generated_new.png',
      'user_persona': 'user_persona_generated_new.png',
      'live_map_hazard': 'hazard_detection.png',
      'technical_architecture': 'api_dataflow_diagram.png',
      'commander_dashboard': 'asset_management.png',
      'ai_support': 'ai_support.png',
      'conclusion': 'conclusion_generated_new.png'
    };
    
    const assetName = assetMapping[segment.name];
    if (!assetName) return null;
    
    const assetPath = path.join(this.videoPresentationDir, assetName);
    return fs.existsSync(assetPath) ? assetPath : null;
  }

  private async recordSegmentWithAsset(segment: TimelineSegment, assetPath: string) {
    console.log(`🖼️  Using asset for segment ${segment.name}: ${path.basename(assetPath)}`);
    
    // Create a simple HTML page to display the asset
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${segment.name}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          }
          .asset-container {
            position: relative;
            max-width: 100%;
            max-height: 100%;
          }
          .asset-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .segment-title {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          }
        </style>
      </head>
      <body>
        <div class="asset-container">
          <div class="segment-title">${segment.name.replace(/_/g, ' ').toUpperCase()}</div>
          <img src="file://${assetPath}" class="asset-image" alt="${segment.name}">
        </div>
      </body>
      </html>
    `;
    
    const htmlPath = path.join(this.outputDir, `${segment.name}_asset.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    
    // Navigate to the asset page
    await this.page?.goto(`file://${htmlPath}`);
    await this.page?.waitForLoadState('networkidle');
    
    // Record the asset display
    const videoPath = path.join(this.outputDir, `${segment.name}.webm`);
    
    try {
      const video = this.page?.video();
      if (video) {
        await video.saveAs(videoPath);
      }
      
      // Wait for segment duration
      await this.page?.waitForTimeout(segment.duration * 1000);
      
      // Stop recording
      if (video) {
        await video.delete();
      }
      
      console.log(`🎥 Asset video saved: ${videoPath}`);
      
    } catch (error) {
      console.error(`❌ Error recording asset segment ${segment.name}:`, error);
      // Fallback to screenshot
      await this.captureFallbackScreenshot(segment);
    }
  }

  private async navigateToSegment(segment: TimelineSegment) {
    if (!this.page) return;
    
    // Navigate to the main page first
    await this.page.goto('http://localhost:3000');
    await this.page.waitForLoadState('networkidle');
    
    // Navigate to specific section based on segment
    switch (segment.name) {
      case 'introduction':
        // Stay on main page
        break;
      case 'problem_statement':
      case 'live_map_hazard':
        await this.page.click('text=Live Map');
        break;
      case 'user_persona':
      case 'commander_dashboard':
        await this.page.click('text=Commander Dashboard');
        break;
      case 'technical_architecture':
      case 'ai_support':
        await this.page.click('text=AI Support');
        break;
      default:
        // Stay on main page
        break;
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  private async recordSegmentVideo(segment: TimelineSegment) {
    const videoPath = path.join(this.outputDir, `${segment.name}.webm`);
    
    try {
      // Start video recording
      const video = this.page?.video();
      if (video) {
        await video.saveAs(videoPath);
      }
      
      // Perform interactive actions based on segment
      await this.performSegmentInteractions(segment);
      
      // Wait for segment duration
      await this.page?.waitForTimeout(segment.duration * 1000);
      
      // Stop recording
      if (video) {
        await video.delete();
      }
      
      console.log(`🎥 Video saved: ${videoPath}`);
      
    } catch (error) {
      console.error(`❌ Error recording segment ${segment.name}:`, error);
      // Fallback to screenshot if video recording fails
      await this.captureFallbackScreenshot(segment);
    }
  }

  private async performSegmentInteractions(segment: TimelineSegment) {
    if (!this.page) {
      console.error('❌ Page not initialized');
      return;
    }
    
    console.log(`🎭 Performing interactions for segment: ${segment.name}`);
    
    switch (segment.name) {
      case 'introduction':
        // Production features from timeline:
        // - Apply intro_template with title and subtitle
        // - Use Emergency Response colors (info blue accent)
        // - Start from black with fade-in transition
        
        // Smooth scroll and highlight key elements
        await this.page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await this.page.waitForTimeout(1000);
        
        // Highlight the title with intro template styling
        await this.page.locator('h1').highlight();
        await this.page.waitForTimeout(2000);
        
        // Simulate intro template with title and subtitle
        await this.page.evaluate(() => {
          const introDiv = document.createElement('div');
          introDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        text-align: center; color: #0066cc; z-index: 1000; background: rgba(0,0,0,0.8); 
                        padding: 40px; border-radius: 10px; animation: fadeIn 2s ease-in;">
              <h1 style="margin: 0 0 10px 0; font-size: 36px;">Disaster Response Platform</h1>
              <h2 style="margin: 0; font-size: 24px; color: #ffffff;">Palantir Building Challenge Project</h2>
            </div>
            <style>
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
          `;
          document.body.appendChild(introDiv);
        });
        await this.page.waitForTimeout(3000);
        break;
        
      case 'problem_statement':
        // Production features from timeline:
        // - Crossfade transition from introduction
        // - Overlay callout_alert ("Fragmented systems slow response") with bounce animation
        // - Follow with callout_info listing key issues ("Data overload", "Manual fusion", "Limited access")
        // - Use blue color scheme, slide in from right
        
        // Navigate to map and show hazards
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add callout alert overlay
        await this.page.evaluate(() => {
          const alertDiv = document.createElement('div');
          alertDiv.innerHTML = `
            <div style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); 
                        background: #ff4444; color: white; padding: 15px 25px; border-radius: 8px; 
                        z-index: 1000; animation: bounce 1s ease-in-out;">
              <strong>Fragmented systems slow response</strong>
            </div>
            <style>
              @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                                 40% { transform: translateX(-50%) translateY(-10px); }
                                 60% { transform: translateX(-50%) translateY(-5px); } }
            </style>
          `;
          document.body.appendChild(alertDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Add callout info with key issues
        await this.page.evaluate(() => {
          const infoDiv = document.createElement('div');
          infoDiv.innerHTML = `
            <div style="position: fixed; top: 40%; right: -300px; background: #0066cc; color: white; 
                        padding: 20px; border-radius: 8px; z-index: 1000; animation: slideIn 1.5s ease-out forwards;">
              <h3 style="margin: 0 0 10px 0;">Key Issues:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Data overload</li>
                <li>Manual fusion</li>
                <li>Limited access</li>
              </ul>
            </div>
            <style>
              @keyframes slideIn { to { right: 20px; } }
            </style>
          `;
          document.body.appendChild(infoDiv);
        });
        await this.page.waitForTimeout(3000);
        
        // Try to find and interact with hazard elements
        try {
          const hazardElements = await this.page.locator('.hazard-cluster, .hazard-feature').all();
          if (hazardElements.length > 0) {
            await hazardElements[0].hover();
            await this.page.waitForTimeout(1000);
            await hazardElements[0].click();
            await this.page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No hazard elements found, continuing...');
        }
        break;
        
      case 'user_persona':
        // Production features from timeline:
        // - Slide-left transition
        // - Place label_role boxes above silhouettes ("Commander", "Planner", "Responder")
        // - Subtle fade-in animation
        // - Add lower_third_basic template with name and title
        
        // Navigate to dashboard and show user roles
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add role labels with fade-in animation
        await this.page.evaluate(() => {
          const rolesDiv = document.createElement('div');
          rolesDiv.innerHTML = `
            <div style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); 
                        display: flex; gap: 40px; z-index: 1000;">
              <div style="text-align: center; animation: fadeIn 0.5s ease-in 0s forwards; opacity: 0;">
                <div style="background: #0066cc; color: white; padding: 10px 20px; border-radius: 5px; margin-bottom: 10px;">
                  Commander
                </div>
                <div style="width: 60px; height: 80px; background: #333; border-radius: 5px; margin: 0 auto;"></div>
              </div>
              <div style="text-align: center; animation: fadeIn 0.5s ease-in 0.3s forwards; opacity: 0;">
                <div style="background: #0066cc; color: white; padding: 10px 20px; border-radius: 5px; margin-bottom: 10px;">
                  Planner
                </div>
                <div style="width: 60px; height: 80px; background: #333; border-radius: 5px; margin: 0 auto;"></div>
              </div>
              <div style="text-align: center; animation: fadeIn 0.5s ease-in 0.6s forwards; opacity: 0;">
                <div style="background: #0066cc; color: white; padding: 10px 20px; border-radius: 5px; margin-bottom: 10px;">
                  Responder
                </div>
                <div style="width: 60px; height: 80px; background: #333; border-radius: 5px; margin: 0 auto;"></div>
              </div>
            </div>
            <style>
              @keyframes fadeIn { to { opacity: 1; } }
            </style>
          `;
          document.body.appendChild(rolesDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Add lower third with name and title
        await this.page.evaluate(() => {
          const lowerThirdDiv = document.createElement('div');
          lowerThirdDiv.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); 
                        color: white; padding: 15px 25px; border-radius: 5px; z-index: 1000;">
              <div style="font-size: 18px; font-weight: bold;">Ian Frelinger</div>
              <div style="font-size: 14px; color: #ccc;">Developer & Presenter</div>
            </div>
          `;
          document.body.appendChild(lowerThirdDiv);
        });
        await this.page.waitForTimeout(2000);
        break;
        
      case 'technical_architecture':
        // Production features from timeline:
        // - Present with technical_template
        // - Display diagram with fade-in
        // - Place label_component callouts near "Ingestion", "Processing", "Map"
        // - Conclude with brief fade-out
        
        // Show technical components
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add technical template overlay
        await this.page.evaluate(() => {
          const techDiv = document.createElement('div');
          techDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(0,0,0,0.9); color: white; padding: 30px; border-radius: 10px; 
                        z-index: 1000; text-align: center; animation: fadeIn 1s ease-in;">
              <h2 style="margin: 0 0 20px 0; color: #0066cc;">Technical Architecture</h2>
              <div style="display: flex; justify-content: space-around; margin: 20px 0;">
                <div style="text-align: center; animation: fadeIn 0.5s ease-in 0.5s forwards; opacity: 0;">
                  <div style="background: #0066cc; padding: 10px; border-radius: 5px; margin-bottom: 10px;">Ingestion</div>
                  <div style="font-size: 12px;">Satellite, Weather, Population Data</div>
                </div>
                <div style="text-align: center; animation: fadeIn 0.5s ease-in 1s forwards; opacity: 0;">
                  <div style="background: #0066cc; padding: 10px; border-radius: 5px; margin-bottom: 10px;">Processing</div>
                  <div style="font-size: 12px;">Foundry Data Fusion</div>
                </div>
                <div style="text-align: center; animation: fadeIn 0.5s ease-in 1.5s forwards; opacity: 0;">
                  <div style="background: #0066cc; padding: 10px; border-radius: 5px; margin-bottom: 10px;">Map</div>
                  <div style="font-size: 12px;">React + Mapbox 3D</div>
                </div>
              </div>
            </div>
            <style>
              @keyframes fadeIn { to { opacity: 1; } }
            </style>
          `;
          document.body.appendChild(techDiv);
        });
        await this.page.waitForTimeout(4000);
        break;
        
      case 'commander_dashboard':
        // Production features from timeline:
        // - Enter with slide-down transition
        // - Use label_component callouts next to Zone A/B/C
        // - Display priority (Immediate, Warning, Standby)
        // - Each label fades in sequentially
        // - Add status bar at bottom with evacuation progress
        
        // Navigate to dashboard and show features
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add zone labels with sequential fade-in
        await this.page.evaluate(() => {
          const zonesDiv = document.createElement('div');
          zonesDiv.innerHTML = `
            <div style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); 
                        display: flex; gap: 30px; z-index: 1000;">
              <div style="text-align: center; animation: fadeIn 0.5s ease-in 0s forwards; opacity: 0;">
                <div style="background: #ff4444; color: white; padding: 10px 15px; border-radius: 5px;">
                  Zone A: Immediate
                </div>
              </div>
              <div style="text-align: center; animation: fadeIn 0.5s ease-in 0.5s forwards; opacity: 0;">
                <div style="background: #ffaa00; color: white; padding: 10px 15px; border-radius: 5px;">
                  Zone B: Warning
                </div>
              </div>
              <div style="text-align: center; animation: fadeIn 0.5s ease-in 1s forwards; opacity: 0;">
                <div style="background: #00aa00; color: white; padding: 10px 15px; border-radius: 5px;">
                  Zone C: Standby
                </div>
              </div>
            </div>
            <style>
              @keyframes fadeIn { to { opacity: 1; } }
            </style>
          `;
          document.body.appendChild(zonesDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Add status bar at bottom
        await this.page.evaluate(() => {
          const statusDiv = document.createElement('div');
          statusDiv.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                        background: rgba(0,0,0,0.8); color: white; padding: 15px 25px; 
                        border-radius: 5px; z-index: 1000;">
              <strong>Evacuated: 1 of 3 buildings</strong>
            </div>
          `;
          document.body.appendChild(statusDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Try to show zone management
        try {
          const zones = await this.page.locator('.zone-card').all();
          if (zones.length > 0) {
            await zones[0].click();
            await this.page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No zones found, continuing...');
        }
        break;
        
      case 'live_map_hazard':
        // Production features from timeline:
        // - Use slide-right transition
        // - Highlight map layer toggles with callout_info
        // - Arrange "Hazards", "Routes", "Units", "Evac Zones" vertically
        // - Animate each toggle with slight scale-in
        // - Use zoom-in effect on hazard clusters
        // - Overlay label_status ("3 hazards active") near top
        
        // Show live map features
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add layer toggles callout
        await this.page.evaluate(() => {
          const togglesDiv = document.createElement('div');
          togglesDiv.innerHTML = `
            <div style="position: fixed; top: 20%; right: 20px; background: #0066cc; color: white; 
                        padding: 20px; border-radius: 8px; z-index: 1000;">
              <h3 style="margin: 0 0 15px 0;">Map Layers:</h3>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="animation: scaleIn 0.3s ease-in 0s forwards; transform: scale(0.8);">🔴 Hazards</div>
                <div style="animation: scaleIn 0.3s ease-in 0.2s forwards; transform: scale(0.8);">🛣️ Routes</div>
                <div style="animation: scaleIn 0.3s ease-in 0.4s forwards; transform: scale(0.8);">🚑 Units</div>
                <div style="animation: scaleIn 0.3s ease-in 0.6s forwards; transform: scale(0.8);">🏠 Evac Zones</div>
              </div>
            </div>
            <style>
              @keyframes scaleIn { to { transform: scale(1); } }
            </style>
          `;
          document.body.appendChild(togglesDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Add hazard status overlay
        await this.page.evaluate(() => {
          const statusDiv = document.createElement('div');
          statusDiv.innerHTML = `
            <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                        background: rgba(255,68,68,0.9); color: white; padding: 10px 20px; 
                        border-radius: 5px; z-index: 1000;">
              <strong>3 hazards active</strong>
            </div>
          `;
          document.body.appendChild(statusDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Try to toggle different layers
        try {
          const layerToggles = await this.page.locator('button').filter({ hasText: /hazard|unit|route|building/i }).all();
          if (layerToggles.length > 0) {
            for (let i = 0; i < Math.min(layerToggles.length, 3); i++) {
              await layerToggles[i].click();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No layer toggles found, continuing...');
        }
        break;
        
      case 'simplified_flow':
        // Production features from timeline:
        // - Transition with crossfade
        // - Display operational overview with short fade-in
        // - Add callout_info ("Coming soon: Zones, Routes, AI & Units")
        // - Slide up from bottom
        // - Use graphics_fade to end scene
        
        // Show current capabilities
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add operational overview
        await this.page.evaluate(() => {
          const overviewDiv = document.createElement('div');
          overviewDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(0,0,0,0.9); color: white; padding: 30px; border-radius: 10px; 
                        z-index: 1000; text-align: center; animation: fadeIn 1s ease-in;">
              <h2 style="margin: 0 0 20px 0; color: #0066cc;">Operational Overview</h2>
              <div style="font-size: 16px; line-height: 1.6;">
                Current prototype focuses on dashboard and live hazard view.<br>
                Future versions will include enhanced capabilities.
              </div>
            </div>
            <style>
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
          `;
          document.body.appendChild(overviewDiv);
        });
        await this.page.waitForTimeout(2000);
        
        // Add "Coming soon" callout
        await this.page.evaluate(() => {
          const comingSoonDiv = document.createElement('div');
          comingSoonDiv.innerHTML = `
            <div style="position: fixed; bottom: -100px; left: 50%; transform: translateX(-50%); 
                        background: #0066cc; color: white; padding: 15px 25px; border-radius: 8px; 
                        z-index: 1000; animation: slideUp 1s ease-out 1s forwards;">
              <strong>Coming soon: Zones, Routes, AI & Units</strong>
            </div>
            <style>
              @keyframes slideUp { to { bottom: 20px; } }
            </style>
          `;
          document.body.appendChild(comingSoonDiv);
        });
        await this.page.waitForTimeout(3000);
        break;
        
      case 'conclusion':
        // Production features from timeline:
        // - Fade out of previous scene
        // - Fade into sunrise graphic
        // - Use title_small ("Conclusion & Next Steps")
        // - Scale in gently at top
        // - Display contact information in lower third overlay
        // - Let text linger, then fade to black
        
        // Return to main page for conclusion
        await this.page.goto('http://localhost:3000');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Add conclusion overlay
        await this.page.evaluate(() => {
          const conclusionDiv = document.createElement('div');
          conclusionDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: linear-gradient(135deg, #ff6b6b, #4ecdc4); z-index: 1000; 
                        display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="text-align: center; color: white; animation: fadeIn 2s ease-in;">
                <h1 style="font-size: 48px; margin: 0 0 20px 0; animation: scaleIn 1s ease-in 1s forwards; transform: scale(0.8);">
                  Conclusion & Next Steps
                </h1>
                <div style="font-size: 24px; margin: 20px 0; animation: fadeIn 1s ease-in 2s forwards; opacity: 0;">
                  Real-time data fusion accelerates disaster response
                </div>
                <div style="font-size: 18px; margin: 20px 0; animation: fadeIn 1s ease-in 3s forwards; opacity: 0;">
                  Ian Frelinger | ian.frelinger@example.com
                </div>
              </div>
            </div>
            <style>
              @keyframes fadeIn { to { opacity: 1; } }
              @keyframes scaleIn { to { transform: scale(1); } }
            </style>
          `;
          document.body.appendChild(conclusionDiv);
        });
        await this.page.waitForTimeout(5000);
        break;
        
      default:
        // Default interaction - just wait
        await this.page.waitForTimeout(2000);
        break;
    }
  }

  private async captureFallbackScreenshot(segment: TimelineSegment) {
    if (!this.page) return;
    
    console.log(`📸 Fallback: Capturing screenshot for ${segment.name}`);
    const screenshotPath = path.join(this.outputDir, `${segment.name}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  private async generateFinalVideo() {
    console.log('🎬 Generating final video from recorded segments...');
    
    // Check if we have video files
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length > 0) {
      await this.generateVideoFromRecordings(videoFiles);
    } else {
      // Fallback to screenshots if no videos
      await this.generateVideoFromScreenshots();
    }
  }

  private async generateVideoFromRecordings(videoFiles: string[]) {
    console.log(`🎥 Found ${videoFiles.length} video segments, creating final video...`);
    
    const outputPath = path.join(this.outputDir, 'timeline-3-enhanced-final.mp4');
    const inputListPath = path.join(this.outputDir, 'input_list.txt');
    
    // Create input list for ffmpeg
    const inputList = videoFiles
      .sort()
      .map(file => `file '${file}'`)
      .join('\n');
    
    fs.writeFileSync(inputListPath, inputList);
    
    try {
      const ffmpegCommand = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', `"${inputListPath}"`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-preset', 'medium',
        '-y',
        `"${outputPath}"`
      ].join(' ');
      
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log('✅ Enhanced final video generated from recordings');
      
      // Clean up input list
      fs.unlinkSync(inputListPath);
      
    } catch (error) {
      console.error('❌ Video generation from recordings failed:', error);
      // Fallback to screenshot method
      await this.generateVideoFromScreenshots();
    }
  }

  private async generateVideoFromScreenshots() {
    console.log('📸 Generating video from screenshots (fallback method)...');
    
    const inputPattern = path.join(this.outputDir, '*.png');
    const outputPath = path.join(this.outputDir, 'timeline-3-enhanced-final.mp4');
    
    try {
      const ffmpegCommand = [
        'ffmpeg',
        '-framerate', '1/5', // 5 seconds per frame
        '-pattern_type', 'glob',
        '-i', `"${inputPattern}"`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-y',
        `"${outputPath}"`
      ].join(' ');
      
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log('✅ Enhanced final video generated from screenshots');
      
    } catch (error) {
      console.error('❌ Video generation failed:', error);
    }
  }

  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the enhanced video creation
const creator = new Timeline3VideoCreatorEnhanced();
creator.createTimeline3Video().catch(console.error);
