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

class SegmentedInteractiveVideoCreator {
  private browser: Browser | null = null;
  private outputDir: string;
  private timeline: any;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createSegmentedInteractiveVideo() {
    console.log('🎬 Starting Segmented Interactive Video Creation...');
    console.log('This will create a video based on "Video presentation plan-3"');
    console.log('📹 Recording each segment separately with real interactions');
    
    try {
      // Load timeline-3.yaml
      await this.loadTimeline();
      
      // Record each segment separately
      await this.recordSegmentsSeparately();
      
      // Generate final video from segments
      await this.generateFinalVideo();
      
      console.log('✅ Segmented interactive video creation completed!');
      console.log('🎬 Professional video with real interactions ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    }
  }

  private async loadTimeline() {
    const timelinePath = path.join(__dirname, '..', 'timeline-3.yaml');
    const timelineContent = fs.readFileSync(timelinePath, 'utf8');
    this.timeline = yaml.load(timelineContent);
    
    console.log(`📹 Timeline loaded: ${this.timeline.timeline.duration} seconds total`);
    console.log(`🎭 ${this.timeline.timeline.tracks.video.length} video segments`);
  }

  private async recordSegmentsSeparately() {
    const segments = this.timeline.timeline.tracks.video;
    
    console.log(`🎬 Recording ${segments.length} video segments separately...`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`📹 Recording segment ${i + 1}/${segments.length}: ${segment.name}`);
      
      await this.recordSingleSegment(segment);
      
      console.log(`✅ Segment ${segment.name} recorded`);
    }
  }

  private async recordSingleSegment(segment: TimelineSegment) {
    // Create a new browser context for each segment to ensure clean recording
    const browser = await chromium.launch({
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
    
    const context = await browser.newContext({
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    try {
      // Navigate to the frontend
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Navigate to appropriate page based on segment
      await this.navigateToSegment(page, segment);
      
      // Perform interactive actions based on segment
      await this.performSegmentInteractions(page, segment);
      
      // Wait for segment duration
      await page.waitForTimeout(segment.duration * 1000);
      
      // Close context to finalize video recording
      await context.close();
      await browser.close();
      
      // Wait a moment for video file to be written
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Rename the video file to match the segment
      await this.renameVideoFile(segment.name);
      
    } catch (error) {
      console.error(`❌ Error recording segment ${segment.name}:`, error);
      await context.close();
      await browser.close();
    }
  }

  private async navigateToSegment(page: Page, segment: TimelineSegment) {
    // Navigate based on segment name
    switch (segment.name) {
      case 'introduction':
        // Stay on main page for introduction
        break;
      case 'problem_statement':
        // Show map view for hazards
        await page.click('text=Live Map');
        break;
      case 'user_persona':
        // Show commander dashboard view
        await page.click('text=Commander Dashboard');
        break;
      case 'technical_architecture':
        // Show map view for technical overview
        await page.click('text=Live Map');
        break;
      case 'commander_dashboard':
        // Show commander dashboard view
        await page.click('text=Commander Dashboard');
        break;
      case 'live_map_hazard':
        // Show map view for hazards
        await page.click('text=Live Map');
        break;
      case 'simplified_flow':
        // Show map view for 3D terrain
        await page.click('text=Live Map');
        break;
      case 'conclusion':
        // Return to commander dashboard
        await page.click('text=Commander Dashboard');
        break;
    }
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  }

  private async performSegmentInteractions(page: Page, segment: TimelineSegment) {
    console.log(`🎭 Performing interactions for segment: ${segment.name}`);
    
    switch (segment.name) {
      case 'introduction':
        // Smooth scroll and highlight key elements
        await page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await page.waitForTimeout(1000);
        
        // Highlight the title
        await page.locator('h1').highlight();
        await page.waitForTimeout(2000);
        break;
        
      case 'problem_statement':
        // Wait for map to load and show hazard data
        await page.waitForTimeout(2000);
        
        // Try to find and interact with hazard elements
        try {
          const hazardElements = await page.locator('.hazard-cluster, .hazard-feature, [data-hazard]').all();
          if (hazardElements.length > 0) {
            await hazardElements[0].hover();
            await page.waitForTimeout(1000);
            await hazardElements[0].click();
            await page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No hazard elements found, continuing...');
        }
        break;
        
      case 'user_persona':
        // Wait for dashboard to load
        await page.waitForTimeout(2000);
        
        // Try to highlight different sections
        try {
          const zoneCards = await page.locator('.zone-card, .zone-item, [data-zone]').all();
          if (zoneCards.length > 0) {
            for (let i = 0; i < Math.min(zoneCards.length, 3); i++) {
              await zoneCards[i].highlight();
              await page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No zone cards found, continuing...');
        }
        break;
        
      case 'technical_architecture':
        // Wait for map to load
        await page.waitForTimeout(2000);
        
        // Try to show map controls
        try {
          const mapControls = await page.locator('.mapboxgl-ctrl-group, .map-controls, [data-map-control]').all();
          if (mapControls.length > 0) {
            await mapControls[0].highlight();
            await page.waitForTimeout(1000);
          }
        } catch (error) {
          console.log('No map controls found, continuing...');
        }
        break;
        
      case 'commander_dashboard':
        // Wait for dashboard to load
        await page.waitForTimeout(2000);
        
        // Try to show zone management
        try {
          const zones = await page.locator('.zone-card, .zone-item, [data-zone]').all();
          if (zones.length > 0) {
            // Click on first zone to show details
            await zones[0].click();
            await page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No zones found, continuing...');
        }
        break;
        
      case 'live_map_hazard':
        // Wait for map to load
        await page.waitForTimeout(2000);
        
        // Try to toggle different layers
        try {
          const layerToggles = await page.locator('button').filter({ hasText: /hazard|unit|route|building/i }).all();
          if (layerToggles.length > 0) {
            for (let i = 0; i < Math.min(layerToggles.length, 3); i++) {
              await layerToggles[i].click();
              await page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No layer toggles found, continuing...');
        }
        break;
        
      case 'simplified_flow':
        // Wait for map to load
        await page.waitForTimeout(2000);
        
        // Try to demonstrate map features
        try {
          // Try to zoom in/out
          const zoomControls = await page.locator('.mapboxgl-ctrl-zoom-in, .mapboxgl-ctrl-zoom-out, [data-zoom]').all();
          if (zoomControls.length > 0) {
            await zoomControls[0].click();
            await page.waitForTimeout(1000);
            if (zoomControls.length > 1) {
              await zoomControls[1].click();
              await page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No zoom controls found, continuing...');
        }
        break;
        
      case 'conclusion':
        // Wait for dashboard to load
        await page.waitForTimeout(2000);
        
        // Try to show summary elements
        try {
          const summaryElements = await page.locator('.dashboard-header, .zones-overview, [data-summary]').all();
          if (summaryElements.length > 0) {
            for (let i = 0; i < Math.min(summaryElements.length, 2); i++) {
              await summaryElements[i].highlight();
              await page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No summary elements found, continuing...');
        }
        break;
    }
  }

  private async renameVideoFile(segmentName: string) {
    // Find the most recent .webm file and rename it
    const webmFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (webmFiles.length > 0) {
      // Get the most recent file
      const latestFile = webmFiles.sort((a, b) => {
        const statA = fs.statSync(path.join(this.outputDir, a));
        const statB = fs.statSync(path.join(this.outputDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      })[0];
      
      const oldPath = path.join(this.outputDir, latestFile);
      const newPath = path.join(this.outputDir, `${segmentName}.webm`);
      
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed video file to: ${segmentName}.webm`);
      } catch (error) {
        console.log(`⚠️ Could not rename video file: ${error}`);
      }
    }
  }

  private async generateFinalVideo() {
    console.log('🎬 Generating final video from recorded segments...');
    
    // Check if we have video files
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length > 0) {
      await this.generateVideoFromRecordings(videoFiles);
    } else {
      console.log('❌ No video files found, using fallback screenshot method');
      await this.generateVideoFromScreenshots();
    }
  }

  private async generateVideoFromRecordings(videoFiles: string[]) {
    console.log(`🎥 Found ${videoFiles.length} video segments, creating final video...`);
    
    const outputPath = path.join(this.outputDir, 'timeline-3-segmented-final.mp4');
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
      console.log('✅ Final segmented video generated from recordings');
      
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
}

// Run the video creation
const creator = new SegmentedInteractiveVideoCreator();
creator.createSegmentedInteractiveVideo().catch(console.error);
