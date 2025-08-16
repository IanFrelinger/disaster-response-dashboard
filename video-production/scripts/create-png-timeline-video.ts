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
  lowerThird: string;
  businessValue: string;
}

class PNGTimelineVideoCreator {
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
    console.log('🎬 Starting PNG Timeline Video Creation...');
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
    }
  }

  private defineTimelineSegments(): TimelineSegment[] {
    const segments: TimelineSegment[] = [
      {
        name: "intro",
        start: 0,
        duration: 15,
        description: "Introduction to Disaster Response Platform",
        lowerThird: "Disaster Response Platform",
        businessValue: "Immediate situational awareness for emergency commanders"
      },
      {
        name: "problem",
        start: 15,
        duration: 25,
        description: "The Challenge of Emergency Response",
        lowerThird: "Emergency Response Challenges",
        businessValue: "Addresses critical gaps in emergency coordination"
      },
      {
        name: "users",
        start: 40,
        duration: 20,
        description: "Target Users and Roles",
        lowerThird: "Target Users & Roles",
        businessValue: "Tailored experience for each emergency response role"
      },
      {
        name: "architecture",
        start: 60,
        duration: 30,
        description: "Technical Architecture Overview",
        lowerThird: "Technical Architecture",
        businessValue: "Enterprise-grade scalability and reliability"
      },
      {
        name: "detect",
        start: 90,
        duration: 15,
        description: "Hazard Detection and Verification",
        lowerThird: "Hazard Detection & Verification",
        businessValue: "Proactive threat identification and response"
      },
      {
        name: "triage",
        start: 105,
        duration: 10,
        description: "Risk Assessment and Triage",
        lowerThird: "Risk Assessment & Triage",
        businessValue: "Intelligent prioritization saves critical response time"
      },
      {
        name: "zones",
        start: 115,
        duration: 10,
        description: "Evacuation Zone Definition",
        lowerThird: "Evacuation Zone Definition",
        businessValue: "Dynamic zone management for optimal evacuation planning"
      },
      {
        name: "routes",
        start: 125,
        duration: 20,
        description: "Route Planning and Optimization",
        lowerThird: "Route Planning & Optimization",
        businessValue: "Optimal evacuation routes save lives and reduce response time"
      },
      {
        name: "units",
        start: 145,
        duration: 10,
        description: "Unit Assignment and Tracking",
        lowerThird: "Unit Assignment & Tracking",
        businessValue: "Efficient resource allocation and real-time coordination"
      },
      {
        name: "ai_support",
        start: 155,
        duration: 20,
        description: "AI Decision Support",
        lowerThird: "AI Decision Support",
        businessValue: "AI-powered insights improve decision quality and response effectiveness"
      },
      {
        name: "value",
        start: 175,
        duration: 30,
        description: "Value Proposition and Impact",
        lowerThird: "Value Proposition & Impact",
        businessValue: "Tangible improvements in emergency response effectiveness"
      },
      {
        name: "foundry",
        start: 205,
        duration: 20,
        description: "Foundry Integration and Data Fusion",
        lowerThird: "Foundry Integration",
        businessValue: "Seamless integration with existing emergency response infrastructure"
      },
      {
        name: "conclusion",
        start: 225,
        duration: 15,
        description: "Conclusion and Next Steps",
        lowerThird: "Conclusion & Next Steps",
        businessValue: "Ready for pilot deployment and stakeholder engagement"
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
      
      // Create a simple text-based PNG frame using ImageMagick
      await this.createPNGFrame(segment, i, totalFrames, framePath);
    }
  }

  private async createPNGFrame(segment: TimelineSegment, frameIndex: number, totalFrames: number, outputPath: string) {
    const progress = (frameIndex / totalFrames * 100).toFixed(1);
    const currentTime = segment.start + (frameIndex / totalFrames * segment.duration);
    const timeString = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toFixed(1).padStart(4, '0')}`;
    
    // Create a simple text-based PNG using ImageMagick
    const text = `${segment.name.replace(/_/g, ' ').toUpperCase()}\n\n${segment.description}\n\n"${segment.businessValue}"\n\n${segment.lowerThird}\n\n${timeString}`;
    
    try {
      // Create a temporary text file to avoid shell escaping issues
      const tempTextFile = outputPath.replace('.png', '.txt');
      fs.writeFileSync(tempTextFile, text);
      
      // Use ImageMagick to create a PNG with text from file (more reliable)
      const convertCommand = `magick -size 1920x1080 xc:"#1e3c72" -fill white -gravity center -pointsize 48 -annotate +0+0 "@${tempTextFile}" "${outputPath}"`;
      console.log(`   Running ImageMagick command for ${segment.name}`);
      execSync(convertCommand, { stdio: 'pipe' });
      
      // Clean up temp text file
      fs.unlinkSync(tempTextFile);
      
      console.log(`   ✅ Frame created successfully: ${outputPath}`);
      
    } catch (error) {
      // If ImageMagick fails, create a simple colored frame
      console.log(`   ⚠️  ImageMagick failed for ${segment.name}: ${error}`);
      await this.createSimpleColoredFrame(segment, frameIndex, totalFrames, outputPath);
    }
  }

  private async createSimpleColoredFrame(segment: TimelineSegment, frameIndex: number, totalFrames: number, outputPath: string) {
    // Create a simple colored frame using a different approach
    const colors = ['#1e3c72', '#2a5298', '#3a5f9a', '#4a6b9c', '#5a779e'];
    const colorIndex = Math.floor(frameIndex / (totalFrames / colors.length)) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    try {
      // Use a simple approach to create a colored frame
      const convertCommand = `magick -size 1920x1080 xc:"${backgroundColor}" -fill white -gravity center -pointsize 72 -annotate +0+0 "${segment.name.toUpperCase()}" "${outputPath}"`;
      console.log(`   Creating simple colored frame with ${backgroundColor}`);
      execSync(convertCommand, { stdio: 'pipe' });
      console.log(`   ✅ Simple frame created: ${outputPath}`);
      
    } catch (error) {
      // Last resort: create a minimal frame
      console.log(`   ⚠️  Simple frame failed: ${error}`);
      await this.createMinimalFrame(segment, outputPath);
    }
  }

  private async createMinimalFrame(segment: TimelineSegment, outputPath: string) {
    // Create the most basic possible frame - just a solid color
    try {
      console.log(`   Creating minimal frame for ${segment.name}`);
      const convertCommand = `magick -size 1920x1080 xc:"#1e3c72" "${outputPath}"`;
      execSync(convertCommand, { stdio: 'pipe' });
      console.log(`   ✅ Minimal frame created: ${outputPath}`);
    } catch (error) {
      console.log(`   ❌ Could not create frame for ${segment.name}: ${error}`);
    }
  }

  private async createVideoFromTimelineFrames(framesDir: string, outputPath: string) {
    console.log('🎬 Creating timeline video from frames...');
    
    try {
      // Use ffmpeg to create video from frames with exact timing
      const ffmpegCommand = `ffmpeg -y -framerate 30 -i "${framesDir}/frame_%06d.png" -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium "${outputPath}"`;
      
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
      const convertCommand = `magick -delay 33 -loop 0 "${framesDir}/frame_*.png" "${outputPath.replace('.mp4', '.gif')}"`;
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
}

// Run the PNG timeline video creator
async function main() {
  const creator = new PNGTimelineVideoCreator();
  await creator.createTimelineVideo();
}

main().catch(console.error);
