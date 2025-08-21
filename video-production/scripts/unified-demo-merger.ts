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
      // RECRUITER CUT (10 slides, 6:15-6:45 minutes)
      {
        slideNumber: 1,
        slideTitle: "Command Center",
        slideFile: "01_main_dashboard_overview.png",
        voScript: "For Incident Commanders and emergency planners who need a single operational picture. Welcome to the Command Center—real-time data fusion and intelligent decision support in one place. It brings together multiple data sources, adds ML-powered hazard analysis, and delivers optimized evacuation routes. Built on Pal-an-TEER Foundry with real-time processing and spatial intelligence. Here's the plan: a quick user path, a short look at how it works, and the outcomes. If you want more depth, we can open the appendix on engines, APIs, and resilience.",
        duration: 25,
        isTechnicalInsert: false
      },
      {
        slideNumber: 2,
        slideTitle: "Live Hazard Map",
        slideFile: "02_live_hazard_map.png",
        voScript: "The Live Hazard Map shows real-time incidents with spatial intelligence and risk assessment. Active hazards display risk scores, proximity, and affected areas. Data sources include NASA Firms, Noah weather, and nine-one-one. Focusing early prevents sending units into deteriorating areas. Now that we see exposure and conditions, let's pick the right unit.",
        duration: 35,
        isTechnicalInsert: false
      },
      {
        slideNumber: 3,
        slideTitle: "Data Sources → Foundry → Backend",
        slideFile: "insert1_slice_a_sources_to_backend.png",
        voScript: "Firms, Noah, nine-one-one, traffic, and G-P-S flow into Pal-an-TEER Foundry. Foundry Functions fuse the inputs into a single, queryable source. Our Flask gateway and Celery workers pull processed outputs in real time. Demo uses synthetic and aggregated data—no PII.",
        duration: 30,
        isTechnicalInsert: true
      },
      {
        slideNumber: 4,
        slideTitle: "Emergency Units Panel",
        slideFile: "03_emergency_units_panel.png",
        voScript: "The Emergency Units Panel gives real-time visibility into resources and status. We track fire engines, ambulances, and police units with G-P-S and current state. Units are organized by type, availability, and current assignment. Selecting the right unit reduces time-to-arrival and risk.",
        duration: 25,
        isTechnicalInsert: false
      },
      {
        slideNumber: 5,
        slideTitle: "Route Optimization",
        slideFile: "04_route_optimization.png",
        voScript: "Route Optimization computes safe paths with the A-star algorithm and hazard avoidance. Routes account for traffic, road closures, hazard zones, and vehicle constraints. As conditions change, real-time updates keep the path optimal. Profile-based routing keeps crews out of smoke and closures. I confirm the unit assignment to this route—the plan is locked. Next, a quick A-I cross-check.",
        duration: 30,
        isTechnicalInsert: false
      },
      {
        slideNumber: 6,
        slideTitle: "AIP Decision Support",
        slideFile: "05_aip_decision_support.png",
        voScript: "The A-I-P Decision Support panel provides recommendations with confidence levels. It analyzes resource availability, hazard progression, and response priorities to suggest the next best action. Models are trained on historical data and real-time analytics, with synthetic scenarios as needed—and we validate continuously against recent events.",
        duration: 25,
        isTechnicalInsert: false
      },
      {
        slideNumber: 7,
        slideTitle: "Building Evacuation Tracker",
        slideFile: "06_building_evacuation_tracker.png",
        voScript: "Here's the Building Evacuation Tracker. At a glance I see building-level progress—what's cleared, what's pending, and current occupant counts. Updates stream in over WebSockets, so there's no refreshing. It's designed to integrate with building systems; today it shows building-level status and progress.",
        duration: 25,
        isTechnicalInsert: false
      },
      {
        slideNumber: 8,
        slideTitle: "Request Lifecycle",
        slideFile: "insert2_request_lifecycle.png",
        voScript: "Planning a route returns a 202 with a job I-D. Celery computes; a route_ready event triggers the UI to fetch geometry, E-T-A, and distance. That's why the UI stays responsive—the compute is asynchronous.",
        duration: 25,
        isTechnicalInsert: true
      },
      {
        slideNumber: 9,
        slideTitle: "Analytics & Performance",
        slideFile: "07_analytics_and_performance.png",
        voScript: "The Analytics & Performance view summarizes operations and system health. Response times, resource utilization, evacuation progress—plus health checks, structured logging, and caching with hazard-based invalidation. Continuous status reduces uncertainty at command.",
        duration: 30,
        isTechnicalInsert: false
      },
      {
        slideNumber: 10,
        slideTitle: "Conclusion and Next Steps",
        slideFile: "08_conclusion_and_next_steps.png",
        voScript: "Command Center shows the power of integrated emergency management through real-time fusion. The benefits: faster response, better resource use, enhanced public safety, and coordinated operations. We can stop here at outcomes, or take two minutes in the appendix for engines and APIs. Book a 30-minute scenario run-through with your data and S-O-P-s.",
        duration: 25,
        isTechnicalInsert: false
      },
      // ENGINEER APPENDIX SLIDES (Optional 3-4 minutes)
      {
        slideNumber: 11,
        slideTitle: "Processing Engines (Appendix)",
        slideFile: "appendix_01_processing_engines.png",
        voScript: "Three Processing Engines drive decision-making. HazardProcessor uses ML forecasting with RandomForest to predict fire spread patterns. RiskProcessor uses H-3 Spatial at resolution-9 hexagons for precise spatial analysis. RouteOptimizer uses the A-star algorithm for advanced pathfinding with hazard avoidance. Each engine runs via Foundry Functions with real-time updates.",
        duration: 45,
        isTechnicalInsert: false
      },
      {
        slideNumber: 12,
        slideTitle: "API Surface → Frontend (Appendix)",
        slideFile: "appendix_02_api_surface.png",
        voScript: "We expose seven core endpoints—hazards for active incidents, hazard-zones for spatial risk, routes for evacuation paths, risk for location analysis, evacuations for progress, units for resources, and public-safety for community status. REST serves the data; WebSockets push live events to the dashboard.",
        duration: 35,
        isTechnicalInsert: false
      },
      {
        slideNumber: 13,
        slideTitle: "Public Safety Status (Appendix)",
        slideFile: "appendix_03_public_safety_status.png",
        voScript: "The Public Safety panel surfaces status for crisis communications. It provides status-only outputs — not outbound sends — making it pluggable to existing mass-notification systems. That preserves your current channels while improving accuracy.",
        duration: 25,
        isTechnicalInsert: false
      },
      {
        slideNumber: 14,
        slideTitle: "Exception Flows & Resilience (Appendix)",
        slideFile: "appendix_04_exception_flows.png",
        voScript: "Here's how we handle exceptions. If route compute is delayed, the UI shows a non-blocking notice and a retry path. If a unit isn't available, filter by availability and select an alternate. On backend errors, the UI stays responsive with readable messages. This architecture keeps operations smooth even during complex calculations.",
        duration: 35,
        isTechnicalInsert: false
      },
      // IC User Story Slides - End-to-End Workflow
      {
        slideNumber: 16,
        slideTitle: "Earthquake Scenario: San Francisco",
        slideFile: "12_earthquake_scenario_san_francisco.png",
        voScript: "Let's set the scene for our Incident Commander. At 2:47 p.m., a seven-point-two magnitude earthquake strikes the San Francisco Bay Area. The epicenter is on the Hayward Fault, about three miles east of downtown Oakland. The impact is immediate: building collapses, fires from gas leaks, critical bridge damage, and compromised BART stations. Major highways are blocked, affecting 2.3 million people across seven counties. The first 60 minutes are critical for search and rescue. This is where the Command Center proves its value — when every second counts and coordination saves lives.",
        duration: 50,
        isTechnicalInsert: false
      },
      {
        slideNumber: 17,
        slideTitle: "IC User Journey Overview",
        slideFile: "13_ic_user_journey_overview.png",
        voScript: "Now a quick look at the Incident Commander workflow — the golden path from situational awareness to execution. We have four personas: the Incident Commander, the Planner, the Unit Lead, and the Public Info Officer. Each beat shows the user action, the system response, the outcome, and the APIs that power it. Together, they demonstrate the operational value of the Command Center.",
        duration: 45,
        isTechnicalInsert: false
      },
      {
        slideNumber: 18,
        slideTitle: "Situational Picture",
        slideFile: "14_situational_picture_beat.png",
        voScript: "We start with the situational picture. The Incident Commander opens the dashboard and sees active hazards from the quake. They toggle the Buildings and Weather layers to view exposure and conditions, then center on a specific hazard. The system loads hazards and risk summaries and renders overlays. This uses our hazards and risk endpoints, plus the public-safety feed. The takeaway: focusing early prevents sending units into deteriorating areas.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 19,
        slideTitle: "Resource Posture",
        slideFile: "15_resource_posture_beat.png",
        voScript: "Next, resource posture. The IC opens the Units panel and selects a fire engine from the roster. The system shows status, location, and capabilities, and the selection persists. That's powered by our units endpoint. Selecting the right unit reduces time-to-arrival and risk.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 20,
        slideTitle: "Access Planning",
        slideFile: "16_access_planning_beat.png",
        voScript: "Access planning. The IC opens Routing and chooses the Fire Tactical profile. The system shows route options for that profile with E-T-A, distance, and safety considerations. We call the routes endpoint for the profile view, then fetch route details for geometry and E-T-A. Profile-based routing keeps crews out of smoke and closures.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 21,
        slideTitle: "Assignment & Execution",
        slideFile: "17_assignment_execution_beat.png",
        voScript: "Assignment and execution. The IC reviews the route and confirms the unit assignment. The system persists the assignment, updates unit and route status, and moves the plan to execution. We persist the assignment through the units-assignment endpoint, and status updates immediately. Assignment tracking enables coordinated response across agencies.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 22,
        slideTitle: "Decision Support Cross-Check",
        slideFile: "18_decision_support_beat.png",
        voScript: "Decision support cross-check. The IC opens the A-I-P Decision Support panel to review recommendations and confidence. The system returns risk guidance for the area, helping confirm or adjust the plan quickly. We query the risk endpoint for the affected area to validate or adjust the plan. A-I insights reduce decision uncertainty when seconds matter.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 23,
        slideTitle: "Progress Monitoring",
        slideFile: "19_progress_monitoring_beat.png",
        voScript: "Progress monitoring. The IC opens the Building Evacuation Tracker and drills into a building. The system shows building-level progress, occupant counts, and shelter assignments, then pushes updates via WebSocket events. The tracker pulls from evacuations and public-safety, with WebSocket status updates streaming in. Real-time monitoring enables proactive adjustments.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 24,
        slideTitle: "Public Safety Status Surfacing",
        slideFile: "20_public_safety_status_beat.png",
        voScript: "Public safety status surfacing. The Public Information Officer views the Public Safety panel for current public-facing information. The system presents accurate status data without sending outbound notifications, making it pluggable to existing tools. It's backed by our public-safety endpoint and plugs into your existing comms tools. Unified status ensures consistent, accurate messaging.",
        duration: 40,
        isTechnicalInsert: false
      },
      {
        slideNumber: 25,
        slideTitle: "Async Lifecycle & Exception Handling",
        slideFile: "21_async_lifecycle_beat.png",
        voScript: "Under the hood, we post to the routes endpoint, get a 202 with a job I-D, Celery computes, a route_ready event lands, and we fetch route details for geometry and E-T-A. If compute lags, the UI shows a non-blocking notice with a retry—stays responsive the whole time.",
        duration: 45,
        isTechnicalInsert: false
      },
      {
        slideNumber: 26,
        slideTitle: "Acceptance Criteria & Demo Readiness",
        slideFile: "22_acceptance_criteria_summary.png",
        voScript: "To validate the IC workflow, we define clear acceptance criteria. For the map and layers: Buildings and Weather must visibly change the map, and hazard focus should recenter within one second. For units: the list shows type and status, and selection persists. For routing: profile selection updates route details within one to two seconds or shows pending. For assignment: an assigned indicator appears and is reflected in oversight. For monitoring: building updates arrive via WebSocket with no refresh. This validates the full workflow from situational awareness to execution.",
        duration: 45,
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
