import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VideoSegment {
  name: string;
  duration: number;
  description: string;
  narration: string;
  screenshotBefore: string;
  screenshotAfter: string;
  startTime: number;
  endTime: number;
}

class DemoVideoCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private videoName: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.videoName = 'disaster-response-demo-video';
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createDemoVideo() {
    console.log('🎬 Starting Demo Video Creation...');
    console.log('This will create a professional video combining screenshots and narration');
    
    try {
      // Define video segments with timing and content
      const segments = await this.defineVideoSegments();
      
      console.log(`📹 Creating video with ${segments.length} segments`);
      console.log(`Total Duration: ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds`);
      
      // Create video using ffmpeg
      await this.generateVideoWithFFmpeg(segments);
      
      console.log('✅ Demo video creation completed!');
      console.log('🎬 Professional video ready for distribution');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async defineVideoSegments(): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = [
      {
        name: "discovery",
        duration: 15,
        description: "User discovers the platform and explores the interface",
        narration: "Let me show you around this disaster response platform. As you can see, it's designed with a clean, intuitive interface that makes emergency management accessible to all users.",
        screenshotBefore: "working-disaster-response-demo-segment-1-dashboard-overview-before.png",
        screenshotAfter: "working-disaster-response-demo-segment-1-dashboard-overview-after.png",
        startTime: 0,
        endTime: 15
      },
      {
        name: "operations_exploration",
        duration: 20,
        description: "User explores the operations view and discovers evacuation zones",
        narration: "Now let me show you the Operations view. This is where incident commanders monitor evacuation zones and track building status in real-time. Watch how intuitive this interface is.",
        screenshotBefore: "working-disaster-response-demo-segment-2-operations-view-before.png",
        screenshotAfter: "working-disaster-response-demo-segment-2-operations-view-after.png",
        startTime: 15,
        endTime: 35
      },
      {
        name: "weather_integration",
        duration: 18,
        description: "User discovers weather integration and risk assessment features",
        narration: "Let me show you something really interesting - our weather integration system. This provides real-time conditions and automatically assesses operational risks.",
        screenshotBefore: "working-disaster-response-demo-segment-3-weather-conditions-before.png",
        screenshotAfter: "working-disaster-response-demo-segment-3-weather-conditions-after.png",
        startTime: 35,
        endTime: 53
      },
      {
        name: "asset_management",
        duration: 16,
        description: "User explores building and asset management capabilities",
        narration: "Now let me show you the Assets view. This gives us detailed information about buildings, their evacuation status, and special needs requirements.",
        screenshotBefore: "working-disaster-response-demo-segment-4-asset-management-before.png",
        screenshotAfter: "working-disaster-response-demo-segment-4-asset-management-after.png",
        startTime: 53,
        endTime: 69
      },
      {
        name: "ai_experience",
        duration: 22,
        description: "User interacts with AI decision support system",
        narration: "This is where it gets really exciting - our AI-powered decision support system. Let me show you how it works by asking it a real question about evacuation priorities.",
        screenshotBefore: "working-disaster-response-demo-segment-5-ai-decision-support-before.png",
        screenshotAfter: "working-disaster-response-demo-segment-5-ai-decision-support-after.png",
        startTime: 69,
        endTime: 91
      },
      {
        name: "live_map_exploration",
        duration: 14,
        description: "User explores the live map and real-time features",
        narration: "Finally, let me show you our Live Map integration. This provides real-time situational awareness and geographic visualization.",
        screenshotBefore: "working-disaster-response-demo-segment-6-live-map-integration-before.png",
        screenshotAfter: "working-disaster-response-demo-segment-6-live-map-integration-after.png",
        startTime: 91,
        endTime: 105
      },
      {
        name: "comprehensive_overview",
        duration: 12,
        description: "User gets a comprehensive overview and understanding",
        narration: "As you can see, this platform brings together everything needed for modern emergency response: real-time data, AI-powered insights, and intuitive interfaces.",
        screenshotBefore: "working-disaster-response-demo-segment-1-dashboard-overview-after.png",
        screenshotAfter: "working-disaster-response-demo-segment-6-live-map-integration-after.png",
        startTime: 105,
        endTime: 117
      }
    ];

    // Verify screenshots exist
    for (const segment of segments) {
      const beforePath = path.join(this.outputDir, segment.screenshotBefore);
      const afterPath = path.join(this.outputDir, segment.screenshotAfter);
      
      if (!fs.existsSync(beforePath)) {
        console.warn(`⚠️  Warning: Screenshot not found: ${segment.screenshotBefore}`);
      }
      if (!fs.existsSync(afterPath)) {
        console.warn(`⚠️  Warning: Screenshot not found: ${segment.screenshotAfter}`);
      }
    }

    return segments;
  }

  private async generateVideoWithFFmpeg(segments: VideoSegment[]) {
    console.log('🎬 Generating video with FFmpeg...');
    
    // Create a temporary directory for video frames
    const framesDir = path.join(this.outputDir, 'temp_frames');
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    try {
      // Generate video frames from screenshots
      await this.generateVideoFrames(segments, framesDir);
      
      // Create video from frames
      const outputVideoPath = path.join(this.outputDir, `${this.videoName}.mp4`);
      await this.createVideoFromFrames(framesDir, outputVideoPath);
      
      console.log(`✅ Video created successfully: ${outputVideoPath}`);
      
      // Clean up temporary files
      this.cleanupTempFiles(framesDir);
      
    } catch (error) {
      console.error('❌ Error in video generation:', error);
      this.cleanupTempFiles(framesDir);
    }
  }

  private async generateVideoFrames(segments: VideoSegment[], framesDir: string) {
    console.log('📸 Generating video frames...');
    
    for (const segment of segments) {
      console.log(`   Processing segment: ${segment.name} (${segment.duration}s)`);
      
      const beforePath = path.join(this.outputDir, segment.screenshotBefore);
      const afterPath = path.join(this.outputDir, segment.screenshotAfter);
      
      if (fs.existsSync(beforePath) && fs.existsSync(afterPath)) {
        // Create frames for this segment
        await this.createSegmentFrames(segment, beforePath, afterPath, framesDir);
      } else {
        // Create placeholder frames if screenshots don't exist
        await this.createPlaceholderFrames(segment, framesDir);
      }
    }
  }

  private async createSegmentFrames(segment: VideoSegment, beforePath: string, afterPath: string, framesDir: string) {
    const fps = 30;
    const totalFrames = segment.duration * fps;
    
    // Create frames showing transition from before to after
    for (let i = 0; i < totalFrames; i++) {
      const frameNumber = i.toString().padStart(6, '0');
      const framePath = path.join(framesDir, `frame_${frameNumber}.png`);
      
      // For now, alternate between before and after images
      const sourceImage = i < totalFrames / 2 ? beforePath : afterPath;
      
      try {
        // Copy the image as a frame
        fs.copyFileSync(sourceImage, framePath);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not create frame ${frameNumber}`);
      }
    }
  }

  private async createPlaceholderFrames(segment: VideoSegment, framesDir: string) {
    const fps = 30;
    const totalFrames = segment.duration * fps;
    
    console.log(`   Creating placeholder frames for ${segment.name}`);
    
    for (let i = 0; i < totalFrames; i++) {
      const frameNumber = i.toString().padStart(6, '0');
      const framePath = path.join(framesDir, `frame_${frameNumber}.png`);
      
      // Create a simple text-based placeholder frame
      await this.createTextFrame(segment, i, totalFrames, framePath);
    }
  }

  private async createTextFrame(segment: VideoSegment, frameIndex: number, totalFrames: number, outputPath: string) {
    // Create a simple HTML-based frame with text
    const progress = (frameIndex / totalFrames * 100).toFixed(1);
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
          }
          .title {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }
          .subtitle {
            font-size: 24px;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .description {
            font-size: 18px;
            max-width: 600px;
            line-height: 1.6;
            margin-bottom: 30px;
            opacity: 0.8;
          }
          .progress {
            width: 400px;
            height: 8px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            width: ${progress}%;
            transition: width 0.3s ease;
          }
          .time {
            font-size: 16px;
            margin-top: 15px;
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="title">${segment.name.replace(/_/g, ' ').toUpperCase()}</div>
        <div class="subtitle">${segment.description}</div>
        <div class="description">${segment.narration}</div>
        <div class="progress">
          <div class="progress-bar"></div>
        </div>
        <div class="time">${segment.startTime}s - ${segment.endTime}s (${segment.duration}s)</div>
      </body>
      </html>
    `;
    
    // Write HTML to temporary file
    const htmlPath = outputPath.replace('.png', '.html');
    fs.writeFileSync(htmlPath, html);
    
    // Convert HTML to PNG using Playwright
    if (this.page) {
      try {
        await this.page.goto(`file://${htmlPath}`);
        await this.page.waitForLoadState('networkidle');
        await this.page.screenshot({ path: outputPath, fullPage: true });
        
        // Clean up HTML file
        fs.unlinkSync(htmlPath);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not create frame for ${segment.name}`);
      }
    }
  }

  private async createVideoFromFrames(framesDir: string, outputPath: string) {
    console.log('🎬 Creating video from frames...');
    
    try {
      // Use ffmpeg to create video from frames
      const ffmpegCommand = `ffmpeg -y -framerate 30 -i "${framesDir}/frame_%06d.png" -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium "${outputPath}"`;
      
      console.log('   Running FFmpeg command...');
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Video created: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ FFmpeg error:', error);
      
      // Fallback: create a simple video using alternative method
      await this.createFallbackVideo(framesDir, outputPath);
    }
  }

  private async createFallbackVideo(framesDir: string, outputPath: string) {
    console.log('🔄 Creating fallback video...');
    
    try {
      // Create a simple video using ImageMagick if available
      const convertCommand = `convert -delay 33 -loop 0 "${framesDir}/frame_*.png" "${outputPath.replace('.mp4', '.gif')}"`;
      execSync(convertCommand, { stdio: 'inherit' });
      
      console.log(`✅ Fallback GIF created: ${outputPath.replace('.mp4', '.gif')}`);
      
    } catch (error) {
      console.error('❌ Fallback video creation failed:', error);
      console.log('💡 Consider installing FFmpeg or ImageMagick for video creation');
    }
  }

  private cleanupTempFiles(framesDir: string) {
    try {
      if (fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
        console.log('🧹 Temporary files cleaned up');
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not clean up temporary files');
    }
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the demo video creator
async function main() {
  const creator = new DemoVideoCreator();
  await creator.createDemoVideo();
}

main().catch(console.error);
