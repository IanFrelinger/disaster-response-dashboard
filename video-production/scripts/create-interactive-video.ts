import { chromium, Browser, BrowserContext, Page } from 'playwright';
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
}

class InteractiveVideoCreator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private timeline: any;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createInteractiveVideo() {
    console.log('🎬 Starting Interactive Video Creation...');
    console.log('This will create a video based on "Video presentation plan-3"');
    console.log('📹 Recording actual interactions with real frontend elements');
    
    try {
      // Load timeline-3.yaml
      await this.loadTimeline();
      
      // Initialize browser with video recording
      await this.initializeBrowser();
      
      // Record video segments with interactions
      await this.recordVideoSegments();
      
      // Generate final video
      await this.generateFinalVideo();
      
      console.log('✅ Interactive video creation completed!');
      console.log('🎬 Professional video with real interactions ready');
      
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

  private async initializeBrowser() {
    console.log('🌐 Initializing browser with video recording...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security'
      ]
    });
    
    // Create context with video recording enabled
    this.context = await this.browser.newContext({
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the frontend
    await this.page.goto('http://localhost:3000');
    await this.page.waitForLoadState('networkidle');
    
    console.log('✅ Browser initialized with video recording');
  }

  private async recordVideoSegments() {
    const segments = this.timeline.timeline.tracks.video;
    
    console.log(`🎬 Recording ${segments.length} video segments with interactions...`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`📹 Recording segment ${i + 1}/${segments.length}: ${segment.name}`);
      
      // Navigate to appropriate page based on segment
      await this.navigateToSegment(segment);
      
      // Perform interactive actions based on segment
      await this.performSegmentInteractions(segment);
      
      // Wait for segment duration
      await this.page?.waitForTimeout(segment.duration * 1000);
      
      console.log(`✅ Segment ${segment.name} recorded`);
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
        // Smooth scroll and highlight key elements
        await this.page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await this.page.waitForTimeout(1000);
        
        // Highlight the title
        await this.page.locator('h1').highlight();
        await this.page.waitForTimeout(2000);
        break;
        
      case 'problem_statement':
        // Navigate to map and show hazards
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load and show hazard data
        await this.page.waitForTimeout(2000);
        
        // Try to find and interact with hazard elements
        try {
          const hazardElements = await this.page.locator('.hazard-cluster, .hazard-feature, [data-hazard]').all();
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
        // Navigate to dashboard and show user roles
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for dashboard to load
        await this.page.waitForTimeout(2000);
        
        // Try to highlight different sections
        try {
          const zoneCards = await this.page.locator('.zone-card, .zone-item, [data-zone]').all();
          if (zoneCards.length > 0) {
            for (let i = 0; i < Math.min(zoneCards.length, 3); i++) {
              await zoneCards[i].highlight();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No zone cards found, continuing...');
        }
        break;
        
      case 'technical_architecture':
        // Show technical components
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load
        await this.page.waitForTimeout(2000);
        
        // Try to show map controls
        try {
          const mapControls = await this.page.locator('.mapboxgl-ctrl-group, .map-controls, [data-map-control]').all();
          if (mapControls.length > 0) {
            await mapControls[0].highlight();
            await this.page.waitForTimeout(1000);
          }
        } catch (error) {
          console.log('No map controls found, continuing...');
        }
        break;
        
      case 'commander_dashboard':
        // Navigate to dashboard and show features
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for dashboard to load
        await this.page.waitForTimeout(2000);
        
        // Try to show zone management
        try {
          const zones = await this.page.locator('.zone-card, .zone-item, [data-zone]').all();
          if (zones.length > 0) {
            // Click on first zone to show details
            await zones[0].click();
            await this.page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No zones found, continuing...');
        }
        break;
        
      case 'live_map_hazard':
        // Show live map features
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load
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
        // Show current capabilities
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load
        await this.page.waitForTimeout(2000);
        
        // Try to demonstrate map features
        try {
          // Try to zoom in/out
          const zoomControls = await this.page.locator('.mapboxgl-ctrl-zoom-in, .mapboxgl-ctrl-zoom-out, [data-zoom]').all();
          if (zoomControls.length > 0) {
            await zoomControls[0].click();
            await this.page.waitForTimeout(1000);
            if (zoomControls.length > 1) {
              await zoomControls[1].click();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No zoom controls found, continuing...');
        }
        break;
        
      case 'conclusion':
        // Return to dashboard for conclusion
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for dashboard to load
        await this.page.waitForTimeout(2000);
        
        // Try to show summary elements
        try {
          const summaryElements = await this.page.locator('.dashboard-header, .zones-overview, [data-summary]').all();
          if (summaryElements.length > 0) {
            for (let i = 0; i < Math.min(summaryElements.length, 2); i++) {
              await summaryElements[i].highlight();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No summary elements found, continuing...');
        }
        break;
    }
  }

  private async navigateToSegment(segment: TimelineSegment) {
    if (!this.page) return;
    
    // Navigate based on segment name
    switch (segment.name) {
      case 'introduction':
        // Stay on main page for introduction
        break;
      case 'problem_statement':
        // Show map view for hazards
        await this.page.click('text=Live Map');
        break;
      case 'user_persona':
        // Show commander dashboard view
        await this.page.click('text=Commander Dashboard');
        break;
      case 'technical_architecture':
        // Show map view for technical overview
        await this.page.click('text=Live Map');
        break;
      case 'commander_dashboard':
        // Show commander dashboard view
        await this.page.click('text=Commander Dashboard');
        break;
      case 'live_map_hazard':
        // Show map view for hazards
        await this.page.click('text=Live Map');
        break;
      case 'simplified_flow':
        // Show map view for 3D terrain
        await this.page.click('text=Live Map');
        break;
      case 'conclusion':
        // Return to commander dashboard
        await this.page.click('text=Commander Dashboard');
        break;
    }
    
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
  }

  private async generateFinalVideo() {
    console.log('🎬 Generating final video from recorded segments...');
    
    // Wait a moment for video files to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we have video files
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length > 0) {
      await this.generateVideoFromRecordings(videoFiles);
    } else {
      console.log('❌ No video files found, checking for other formats...');
      const allVideoFiles = fs.readdirSync(this.outputDir).filter(file => 
        file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mov')
      );
      
      if (allVideoFiles.length > 0) {
        await this.generateVideoFromRecordings(allVideoFiles);
      } else {
        console.log('📸 No video files found, using fallback screenshot method');
        await this.generateVideoFromScreenshots();
      }
    }
  }

  private async generateVideoFromRecordings(videoFiles: string[]) {
    console.log(`🎥 Found ${videoFiles.length} video segments, creating final video...`);
    
    const outputPath = path.join(this.outputDir, 'timeline-3-interactive-final.mp4');
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
      console.log('✅ Final interactive video generated from recordings');
      
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
    const outputPath = path.join(this.outputDir, 'timeline-3-screenshot-fallback.mp4');
    
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
      console.log('✅ Fallback video generated from screenshots');
      
    } catch (error) {
      console.error('❌ Video generation failed:', error);
    }
  }

  private async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the video creation
const creator = new InteractiveVideoCreator();
creator.createInteractiveVideo().catch(console.error);
