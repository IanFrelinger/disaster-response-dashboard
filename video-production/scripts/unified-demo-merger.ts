#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SlideMapping {
  slideNumber: number;
  slideTitle: string;
  slideFile: string;
  voScript: string;
  duration: number;
  isTechnicalInsert: boolean;
}

class UnifiedDemoMerger {
  private projectRoot: string;
  private capturesDir: string;
  private audioDir: string;
  private outputDir: string;
  private apiKey: string;
  private voiceId: string;
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
    
    this.projectRoot = path.join(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
    this.audioDir = path.join(this.projectRoot, 'audio', 'vo');
    this.outputDir = path.join(this.projectRoot, 'output', 'unified-demo');
    
    // Get ElevenLabs API configuration
    this.apiKey = process.env.ELEVEN_API_KEY || '';
    this.voiceId = process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr';
    
    if (!this.apiKey) {
      throw new Error('ELEVEN_API_KEY not found in environment variables');
    }
    
    this.ensureDirectories();
    this.checkFFmpeg();
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    this.log(`📁 Directories ready: ${this.audioDir}`, 'success');
  }

  private async checkFFmpeg(): Promise<void> {
    try {
      await execAsync('ffmpeg -version');
      this.ffmpegAvailable = true;
      this.log('✅ FFmpeg is available for video processing', 'success');
    } catch (error) {
      this.log('❌ FFmpeg is not available. Please install FFmpeg to merge audio and video.', 'error');
      process.exit(1);
    }
  }

  private getUnifiedSlideMappings(): SlideMapping[] {
    // Define the unified slide mappings for the complete demo flow
    const mappings: SlideMapping[] = [
      // Main Demo Slides (12)
      {
        slideNumber: 1,
        slideTitle: "Disaster Response Dashboard",
        slideFile: "01_main_dashboard_overview.png",
        voScript: "Welcome to the Disaster Response Dashboard - a unified platform that transforms emergency management through real-time data fusion and intelligent decision support. This system integrates multiple data sources, provides ML-powered hazard analysis, and delivers optimized evacuation routes for emergency responders. Built on Palantir Foundry architecture with real-time processing and spatial intelligence.",
        duration: 35,
        isTechnicalInsert: false
      },
      {
        slideNumber: 2,
        slideTitle: "Live Hazard Map",
        slideFile: "02_live_hazard_map.png",
        voScript: "The Live Hazard Map displays real-time emergency incidents with spatial intelligence and risk assessment. Active hazards are shown with color-coded risk levels, spread predictions, and affected areas. Data sources include NASA F-I-R-M-S satellite feeds, N-O-A-A weather data, and nine-one-one emergency calls.",
        duration: 45,
        isTechnicalInsert: false
      },
      // Technical Insert 1: Slice A
      {
        slideNumber: 3,
        slideTitle: "Data Sources → Foundry → Backend",
        slideFile: "insert1_slice_a_sources_to_backend.png",
        voScript: "F-I-R-M-S, N-O-A-A, nine-one-one, traffic and G-P-S flow into Pal-an-TEER Found-ree. Functions fuse the streams. Our Flask gateway and Celery workers pull the processed outputs in real time.",
        duration: 35,
        isTechnicalInsert: true
      },
      // Technical Insert 1: Slice B
      {
        slideNumber: 4,
        slideTitle: "Processing Engines",
        slideFile: "insert1_slice_b_processing_engines.png",
        voScript: "Three engines power decisions: hazard forecasting, risk on H-three hexes, and A-star routing that balances safety and speed.",
        duration: 40,
        isTechnicalInsert: true
      },
      // Technical Insert 1: Slice C
      {
        slideNumber: 5,
        slideTitle: "API Surface → Frontend",
        slideFile: "insert1_slice_c_api_surface.png",
        voScript: "REST exposes hazards, routes, units and evacuations; Web-Sockets push live events to the dashboard.",
        duration: 30,
        isTechnicalInsert: true
      },
      // Continue with main demo slides
      {
        slideNumber: 6,
        slideTitle: "Emergency Units Panel",
        slideFile: "03_emergency_units_panel.png",
        voScript: "The Emergency Units Panel provides real-time visibility into resource deployment and unit status. Track fire engines, ambulances, and police units with G-P-S positioning and operational status. Units are categorized by response type, availability, and current assignments.",
        duration: 35,
        isTechnicalInsert: false
      },
      {
        slideNumber: 7,
        slideTitle: "Route Optimization",
        slideFile: "04_route_optimization.png",
        voScript: "Route Optimization calculates safe evacuation paths using A-star algorithm with hazard avoidance. Routes consider traffic conditions, road closures, hazard zones, and vehicle constraints. Real-time updates ensure optimal pathfinding as conditions change during emergency response.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 8,
        slideTitle: "AIP Decision Support",
        slideFile: "05_aip_decision_support.png",
        voScript: "The A-I-P Decision Support system provides intelligent recommendations for emergency response coordination. Analyzes resource availability, hazard progression, and response priorities to suggest optimal actions. Powered by machine learning models trained on historical emergency data and real-time analytics. Models are trained on historical and synthetic scenarios; we validate continuously against recent events.",
        duration: 35,
        isTechnicalInsert: false
      },
      {
        slideNumber: 9,
        slideTitle: "Building Evacuation Tracker",
        slideFile: "06_building_evacuation_tracker.png",
        voScript: "The Building Evacuation Tracker monitors evacuation progress and occupant safety in affected areas. Tracks evacuation status, occupant counts, and shelter assignments for real-time coordination. Designed to integrate with building systems; today shows building-level status and progress.",
        duration: 35,
        isTechnicalInsert: false
      },
      // Technical Insert 2: Request Lifecycle (Optional)
      {
        slideNumber: 10,
        slideTitle: "Request Lifecycle",
        slideFile: "insert2_request_lifecycle.png",
        voScript: "Planning a route returns 202 with a job I-D. Celery computes; a route_ready event triggers the UI to fetch geometry, E-T-A and distance.",
        duration: 35,
        isTechnicalInsert: true
      },
      {
        slideNumber: 11,
        slideTitle: "Analytics & Performance",
        slideFile: "07_analytics_and_performance.png",
        voScript: "The Analytics & Performance dashboard provides comprehensive insights into emergency response operations and system health. Displays response times, resource utilization, evacuation progress, and system reliability. Includes health checks, structured logging, and caching with hazard-based invalidation. Continuous status cuts uncertainty for command.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 12,
        slideTitle: "Public Safety Communications",
        slideFile: "08_public_safety_communications.png",
        voScript: "Public Safety panel surfaces status for public communications during crisis events. Coordinates emergency broadcasts, social media updates, and mass notification systems. Pluggable to existing mass-notification systems for seamless integration.",
        duration: 22,
        isTechnicalInsert: false
      },
      {
        slideNumber: 13,
        slideTitle: "Incident Management",
        slideFile: "09_incident_management.png",
        voScript: "Incident oversight via map focus, unit assignments and progress panels. Manages incident lifecycle, resource allocation, communication protocols, and response coordination. Enables unified command structure and coordinated response across multiple agencies and jurisdictions.",
        duration: 27,
        isTechnicalInsert: false
      },
      {
        slideNumber: 14,
        slideTitle: "System Integration",
        slideFile: "10_system_integration.png",
        voScript: "System Integration connects multiple data sources and emergency management systems into a unified platform. Integrates with nine-one-one systems, traffic management, weather services, and public safety networks. Provides real-time data fusion and seamless interoperability across emergency response infrastructure.",
        duration: 30,
        isTechnicalInsert: false
      },
      {
        slideNumber: 15,
        slideTitle: "Conclusion and Next Steps",
        slideFile: "11_conclusion_and_next_steps.png",
        voScript: "The Disaster Response Dashboard demonstrates the power of integrated emergency management through real-time data fusion. Key benefits include faster response times, improved resource utilization, enhanced public safety, and coordinated operations. Schedule a private working session to walk through your scenarios. Book a 30-minute scenario run-through with your data and SOPs.",
        duration: 35,
        isTechnicalInsert: false
      }
    ];

    return mappings;
  }

  private async generateVoiceOver(slideName: string, script: string, slideNumber: number): Promise<string> {
    this.log(`🎤 Generating voice-over for: ${slideName}`);
    
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            speaking_rate: 0.4,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const paddedSlideNumber = slideNumber.toString().padStart(2, '0');
      const filename = `${paddedSlideNumber}_${slideName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_vo.wav`;
      const audioPath = path.join(this.audioDir, filename);
      
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
      
      // Post-process with FFmpeg to slow down the audio
      await this.slowDownAudio(audioPath);
      
      this.log(`✅ Voice-over generated: ${filename}`, 'success');
      return audioPath;
      
    } catch (error) {
      this.log(`❌ Voice-over generation failed for ${slideName}: ${error}`, 'error');
      throw error;
    }
  }

  private async slowDownAudio(audioPath: string): Promise<void> {
    const tempPath = audioPath.replace('.wav', '_temp.wav');
    
    try {
      // Use FFmpeg to slow down the audio to 90% of original speed (less aggressive)
      await execAsync(`ffmpeg -i "${audioPath}" -filter:a "atempo=0.90" "${tempPath}" -y`);
      
      // Replace original with slowed version
      fs.renameSync(tempPath, audioPath);
      
      this.log(`🎵 Audio slowed down to match natural cadence`, 'success');
    } catch (error) {
      this.log(`⚠️  Audio slowdown failed, using original: ${error}`, 'warning');
      // If FFmpeg fails, keep the original
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  private async mergeAudioWithVideo(mapping: SlideMapping, audioPath: string): Promise<void> {
    const imagePath = path.join(this.capturesDir, mapping.slideFile);
    const outputPath = path.join(this.outputDir, `${mapping.slideNumber.toString().padStart(2, '0')}_${mapping.slideTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`);

    // Check if files exist
    if (!fs.existsSync(audioPath)) {
      this.log(`❌ Audio file not found: ${audioPath}`, 'error');
      return;
    }

    if (!fs.existsSync(imagePath)) {
      this.log(`❌ Image file not found: ${imagePath}`, 'error');
      return;
    }

    try {
      this.log(`🎬 Merging slide ${mapping.slideNumber}: ${mapping.slideTitle}...`);

      // FFmpeg command to create video from PNG image with audio
      // Use -shortest to match video duration to audio duration, and add 1 second padding
      const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -shortest -af "apad=pad_dur=1" -y "${outputPath}"`;

      const { stdout, stderr } = await execAsync(ffmpegCommand);
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        this.log(`✅ Merged video created: ${path.basename(outputPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
      } else {
        this.log(`❌ Failed to create merged video: ${outputPath}`, 'error');
      }

    } catch (error) {
      this.log(`❌ Error merging slide ${mapping.slideNumber}: ${error}`, 'error');
    }
  }

  public async generateUnifiedDemo(): Promise<void> {
    try {
      this.log('🎬 Starting unified demo generation...');
      
      const mappings = this.getUnifiedSlideMappings();
      this.log(`📊 Found ${mappings.length} slides to process`);

      const results: { slide: string; audioPath: string; videoPath: string; duration: number; slideNumber: number }[] = [];

      for (const mapping of mappings) {
        try {
          // Generate voice-over
          const audioPath = await this.generateVoiceOver(mapping.slideTitle, mapping.voScript, mapping.slideNumber);
          
          // Merge with slide
          await this.mergeAudioWithVideo(mapping, audioPath);
          
          const videoPath = path.join(this.outputDir, `${mapping.slideNumber.toString().padStart(2, '0')}_${mapping.slideTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`);
          
          results.push({
            slide: mapping.slideTitle,
            audioPath,
            videoPath,
            duration: mapping.duration,
            slideNumber: mapping.slideNumber
          });
          
          // Add a small delay between API calls to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          this.log(`⚠️  Skipping ${mapping.slideTitle} due to error`, 'warning');
        }
      }

      // Generate a summary report
      await this.generateSummaryReport(results);
      
      this.log('✅ Unified demo generation completed!');
      this.log(`📁 Output directory: ${this.outputDir}`);
      
      // List the created files
      const outputFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.mp4'));
      this.log(`📋 Created ${outputFiles.length} merged video files:`);
      outputFiles.forEach(file => {
        const stats = fs.statSync(path.join(this.outputDir, file));
        this.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      });

    } catch (error) {
      this.log(`❌ Error during unified demo generation: ${error}`, 'error');
    }
  }

  private async generateSummaryReport(results: { slide: string; audioPath: string; videoPath: string; duration: number; slideNumber: number }[]): Promise<void> {
    const reportPath = path.join(this.outputDir, 'unified-demo-summary.json');
    const report = {
      generatedAt: new Date().toISOString(),
      totalSlides: results.length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      slides: results.map(r => ({
        slideNumber: r.slideNumber,
        slide: r.slide,
        audioFile: path.basename(r.audioPath),
        videoFile: path.basename(r.videoPath),
        duration: r.duration
      }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📋 Summary report saved: ${reportPath}`, 'success');
  }
}

// Main execution
async function main() {
  try {
    const merger = new UnifiedDemoMerger();
    await merger.generateUnifiedDemo();
  } catch (error) {
    console.error('❌ Unified demo generation failed:', error);
    process.exit(1);
  }
}

main();
