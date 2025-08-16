import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TimelineSegment {
  name: string;
  start: number;
  duration: number;
  description: string;
  narration: string;
  visualElements: string[];
  businessValue: string;
  lowerThird: string;
  transitionIn: string;
  transitionOut: string;
  source: string;
}

class TimelineVideoCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private videoName: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.videoName = 'disaster-response-timeline-video';
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createTimelineVideo() {
    console.log('🎬 Starting Timeline Video Creation...');
    console.log('This will create a video that precisely matches the new_timeline.yaml structure');
    
    try {
      // Define timeline segments exactly as specified
      const segments = this.defineTimelineSegments();
      
      console.log(`📹 Creating video with ${segments.length} segments over 4 minutes`);
      console.log(`Total Duration: ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds`);
      
      // Create video using ffmpeg
      await this.generateTimelineVideo(segments);
      
      console.log('✅ Timeline video creation completed!');
      console.log('🎬 Professional video matching timeline structure ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private defineTimelineSegments(): TimelineSegment[] {
    const segments: TimelineSegment[] = [
      {
        name: "intro",
        start: 0,
        duration: 15,
        description: "Introduction to Disaster Response Platform",
        narration: "Welcome to the Disaster Response Platform - a real-time emergency management system built on Palantir Foundry. This platform transforms complex emergency operations into clear, actionable insights.",
        visualElements: ["Platform overview", "Dashboard interface", "Emergency response capabilities"],
        businessValue: "Immediate situational awareness for emergency commanders",
        lowerThird: "Disaster Response Platform",
        transitionIn: "fade",
        transitionOut: "slide-left",
        source: "intro"
      },
      {
        name: "problem",
        start: 15,
        duration: 25,
        description: "The Challenge of Emergency Response",
        narration: "Emergency response teams face overwhelming challenges: multiple hazards, limited resources, and critical time constraints. Traditional systems struggle to provide real-time coordination and decision support.",
        visualElements: ["Hazard visualization", "Resource constraints", "Time pressure indicators"],
        businessValue: "Addresses critical gaps in emergency coordination",
        lowerThird: "Emergency Response Challenges",
        transitionIn: "slide-left",
        transitionOut: "slide-right",
        source: "hazards"
      },
      {
        name: "users",
        start: 40,
        duration: 20,
        description: "Target Users and Roles",
        narration: "Our platform serves incident commanders, emergency coordinators, and first responders. Each role has specific needs: commanders need strategic overview, coordinators need operational details, and responders need real-time updates.",
        visualElements: ["User personas", "Role definitions", "Interface customization"],
        businessValue: "Tailored experience for each emergency response role",
        lowerThird: "Target Users & Roles",
        transitionIn: "slide-right",
        transitionOut: "zoom-in",
        source: "commander"
      },
      {
        name: "architecture",
        start: 60,
        duration: 30,
        description: "Technical Architecture Overview",
        narration: "Built on Palantir Foundry, our platform integrates real-time data feeds, AI-powered analysis, and intuitive interfaces. The architecture ensures scalability, reliability, and seamless data fusion across multiple sources.",
        visualElements: ["System architecture", "Data flow diagrams", "Foundry integration"],
        businessValue: "Enterprise-grade scalability and reliability",
        lowerThird: "Technical Architecture",
        transitionIn: "zoom-in",
        transitionOut: "slide-up",
        source: "ai-support"
      },
      {
        name: "detect",
        start: 90,
        duration: 15,
        description: "Hazard Detection and Verification",
        narration: "Our system automatically detects and verifies hazards in real-time. Using advanced sensors and AI analysis, we identify threats, assess risks, and prioritize response actions.",
        visualElements: ["Hazard detection", "Risk assessment", "Verification process"],
        businessValue: "Proactive threat identification and response",
        lowerThird: "Hazard Detection & Verification",
        transitionIn: "slide-up",
        transitionOut: "fade",
        source: "hazards"
      },
      {
        name: "triage",
        start: 105,
        duration: 10,
        description: "Risk Assessment and Triage",
        narration: "Once hazards are detected, our AI-powered system automatically assesses risks and triages response priorities. This ensures the most critical threats receive immediate attention.",
        visualElements: ["Risk scoring", "Priority ranking", "Response triage"],
        businessValue: "Intelligent prioritization saves critical response time",
        lowerThird: "Risk Assessment & Triage",
        transitionIn: "fade",
        transitionOut: "slide-right",
        source: "evacuation"
      },
      {
        name: "zones",
        start: 115,
        duration: 10,
        description: "Evacuation Zone Definition",
        narration: "Commanders can define and modify evacuation zones in real-time. Our system automatically calculates population density, accessibility requirements, and evacuation complexity.",
        visualElements: ["Zone definition", "Population mapping", "Accessibility features"],
        businessValue: "Dynamic zone management for optimal evacuation planning",
        lowerThird: "Evacuation Zone Definition",
        transitionIn: "slide-right",
        transitionOut: "zoom-in",
        source: "evacuation"
      },
      {
        name: "routes",
        start: 125,
        duration: 20,
        description: "Route Planning and Optimization",
        narration: "Using A* algorithm optimization, our system plans evacuation routes for different user types: civilians, emergency vehicles, and specialized units. Routes are automatically deconflicted and optimized for safety.",
        visualElements: ["Route planning", "A* algorithm", "Route optimization"],
        businessValue: "Optimal evacuation routes save lives and reduce response time",
        lowerThird: "Route Planning & Optimization",
        transitionIn: "zoom-in",
        transitionOut: "slide-left",
        source: "routes"
      },
      {
        name: "units",
        start: 145,
        duration: 10,
        description: "Unit Assignment and Tracking",
        narration: "Commanders can assign emergency units to specific tasks using intuitive drag-and-drop interfaces. Real-time tracking shows unit status, location, and progress.",
        visualElements: ["Unit assignment", "Drag-and-drop interface", "Real-time tracking"],
        businessValue: "Efficient resource allocation and real-time coordination",
        lowerThird: "Unit Assignment & Tracking",
        transitionIn: "slide-left",
        transitionOut: "fade",
        source: "evacuation"
      },
      {
        name: "ai_support",
        start: 155,
        duration: 20,
        description: "AI Decision Support",
        narration: "Our AI-powered decision support system provides real-time recommendations for emergency response. Commanders can ask questions and receive actionable insights based on current conditions.",
        visualElements: ["AI interface", "Decision support", "Real-time recommendations"],
        businessValue: "AI-powered insights improve decision quality and response effectiveness",
        lowerThird: "AI Decision Support",
        transitionIn: "fade",
        transitionOut: "glitch",
        source: "ai-support"
      },
      {
        name: "value",
        start: 175,
        duration: 30,
        description: "Value Proposition and Impact",
        narration: "This platform delivers measurable impact: reduced response times, improved coordination, and enhanced safety. Emergency commanders gain the tools they need to protect lives and property effectively.",
        visualElements: ["Impact metrics", "Success stories", "Value demonstration"],
        businessValue: "Tangible improvements in emergency response effectiveness",
        lowerThird: "Value Proposition & Impact",
        transitionIn: "glitch",
        transitionOut: "slide-up",
        source: "evacuation"
      },
      {
        name: "foundry",
        start: 205,
        duration: 20,
        description: "Foundry Integration and Data Fusion",
        narration: "Built on Palantir Foundry, our platform seamlessly integrates with existing systems and data sources. This ensures data consistency, security, and scalability across the entire emergency response ecosystem.",
        visualElements: ["Foundry integration", "Data fusion", "System connectivity"],
        businessValue: "Seamless integration with existing emergency response infrastructure",
        lowerThird: "Foundry Integration",
        transitionIn: "slide-up",
        transitionOut: "fade",
        source: "ai-support"
      },
      {
        name: "conclusion",
        start: 225,
        duration: 15,
        description: "Conclusion and Next Steps",
        narration: "The Disaster Response Platform represents the future of emergency management. By combining real-time data, AI-powered insights, and intuitive interfaces, we're transforming how emergency response teams protect communities.",
        visualElements: ["Platform summary", "Future vision", "Call to action"],
        businessValue: "Ready for pilot deployment and stakeholder engagement",
        lowerThird: "Conclusion & Next Steps",
        transitionIn: "fade",
        transitionOut: "fade",
        source: "outro"
      }
    ];

    return segments;
  }

  private async generateTimelineVideo(segments: TimelineSegment[]) {
    console.log('🎬 Generating timeline video with FFmpeg...');
    
    // Create a temporary directory for video frames
    const framesDir = path.join(this.outputDir, 'timeline_frames');
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    try {
      // Generate video frames for each timeline segment
      await this.generateTimelineFrames(segments, framesDir);
      
      // Create video from frames
      const outputVideoPath = path.join(this.outputDir, `${this.videoName}.mp4`);
      await this.createVideoFromTimelineFrames(framesDir, outputVideoPath);
      
      console.log(`✅ Timeline video created successfully: ${outputVideoPath}`);
      
      // Clean up temporary files
      this.cleanupTempFiles(framesDir);
      
    } catch (error) {
      console.error('❌ Error in timeline video generation:', error);
      this.cleanupTempFiles(framesDir);
    }
  }

  private async generateTimelineFrames(segments: TimelineSegment[], framesDir: string) {
    console.log('📸 Generating timeline video frames...');
    
    for (const segment of segments) {
      console.log(`   Processing segment: ${segment.name} (${segment.start}s - ${segment.start + segment.duration}s, ${segment.duration}s)`);
      
      // Create frames for this segment
      await this.createTimelineSegmentFrames(segment, framesDir);
    }
  }

  private async createTimelineSegmentFrames(segment: TimelineSegment, framesDir: string) {
    const fps = 30;
    const totalFrames = segment.duration * fps;
    
    console.log(`   Creating ${totalFrames} frames for ${segment.name}`);
    
    for (let i = 0; i < totalFrames; i++) {
      const frameNumber = (segment.start * fps + i).toString().padStart(6, '0');
      const framePath = path.join(framesDir, `frame_${frameNumber}.png`);
      
      // Create a professional frame with segment information
      await this.createTimelineFrame(segment, i, totalFrames, framePath);
    }
  }

  private async createTimelineFrame(segment: TimelineSegment, frameIndex: number, totalFrames: number, outputPath: string) {
    // Create a professional HTML-based frame with timeline information
    const progress = (frameIndex / totalFrames * 100).toFixed(1);
    const currentTime = segment.start + (frameIndex / totalFrames * segment.duration);
    const timeString = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toFixed(1).padStart(4, '0')}`;
    
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
          .segment-name {
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .description {
            font-size: 28px;
            margin-bottom: 30px;
            max-width: 800px;
            line-height: 1.4;
            opacity: 0.9;
          }
          .lower-third {
            position: absolute;
            bottom: 40px;
            left: 40px;
            background: rgba(220, 53, 69, 0.9);
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
          }
          .time-display {
            position: absolute;
            top: 40px;
            right: 40px;
            background: rgba(0,0,0,0.7);
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 20px;
            font-family: 'Courier New', monospace;
          }
          .progress {
            width: 600px;
            height: 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 6px;
            overflow: hidden;
            margin: 20px 0;
          }
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            width: ${progress}%;
            transition: width 0.3s ease;
          }
          .business-value {
            font-size: 20px;
            max-width: 700px;
            line-height: 1.5;
            margin-top: 20px;
            opacity: 0.8;
            font-style: italic;
          }
          .transition-info {
            position: absolute;
            top: 40px;
            left: 40px;
            background: rgba(0,0,0,0.7);
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 16px;
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="transition-info">${segment.transitionIn} → ${segment.transitionOut}</div>
        <div class="time-display">${timeString}</div>
        
        <div class="segment-name">${segment.name.replace(/_/g, ' ')}</div>
        <div class="description">${segment.description}</div>
        
        <div class="progress">
          <div class="progress-bar"></div>
        </div>
        
        <div class="business-value">"${segment.businessValue}"</div>
        
        <div class="lower-third">${segment.lowerThird}</div>
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

  private async createVideoFromTimelineFrames(framesDir: string, outputPath: string) {
    console.log('🎬 Creating timeline video from frames...');
    
    try {
      // Use ffmpeg to create video from frames with exact timing
      const ffmpegCommand = `ffmpeg -y -framerate 30 -i "${framesDir}/frame_%06d.png" -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium -vf "fps=30" "${outputPath}"`;
      
      console.log('   Running FFmpeg command...');
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Timeline video created: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ FFmpeg error:', error);
      
      // Fallback: create a simple video using alternative method
      await this.createFallbackTimelineVideo(framesDir, outputPath);
    }
  }

  private async createFallbackTimelineVideo(framesDir: string, outputPath: string) {
    console.log('🔄 Creating fallback timeline video...');
    
    try {
      // Create a simple video using ImageMagick if available
      const convertCommand = `convert -delay 33 -loop 0 "${framesDir}/frame_*.png" "${outputPath.replace('.mp4', '.gif')}"`;
      execSync(convertCommand, { stdio: 'inherit' });
      
      console.log(`✅ Fallback timeline GIF created: ${outputPath.replace('.mp4', '.gif')}`);
      
    } catch (error) {
      console.error('❌ Fallback timeline video creation failed:', error);
      console.log('💡 Consider installing FFmpeg or ImageMagick for video creation');
    }
  }

  private cleanupTempFiles(framesDir: string) {
    try {
      if (fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
        console.log('🧹 Temporary timeline files cleaned up');
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not clean up temporary timeline files');
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

// Run the timeline video creator
async function main() {
  const creator = new TimelineVideoCreator();
  await creator.createTimelineVideo();
}

main().catch(console.error);
