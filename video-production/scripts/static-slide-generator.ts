#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';
import * as yaml from 'js-yaml';

// Updated narration scripts from narration.yaml
const TECHNICAL_NARRATION_SCRIPTS = {
  'Meet Emergency Manager Sarah Chen': {
    script: "Hi, I'm EYE-uhn FREN-ling-er. I'll walk you through how an IN-sih-dent kuh-MAN-der or op-er-AY-shun SEK-shun chief uses our web tool to size up a live situation, pick the right resource, plan access and MON-ih-ter PROH-gres.",
    duration: 30
  },
  'The Challenge: Seconds Matter in Live Incidents': {
    script: "In a live incident, SEK-undz MAT-er. The CHAL-enj is SEE-ing HAZ-erdz, ek-SPOH-zher and kuhn-DIH-shunz in one place, then TURN-ing that into KLEER uh-SYNE-mentz. Our goal is FAST-er TYME-to-deh-SIZH-uhn, SAY-fer AK-ses to the scene and kuhn-TIN-yoo-us STA-tus you can TRUST.",
    duration: 45
  },
  'Data & Architecture: Real-time Integration': {
    script: "Data STREEMZ in from F-I-R-M-S, N-O-A-A, nine one one, pop-yuh-LAY-shun and TRA-fik, and is FYOOZD in PAL-uhn-teer FOWN-dree. The BAK-end is PY-thon and FLASK, with SEL-er-ee and WEB-sok-its for REEL-taym up-DAYTZ. The FRONT end is REE-akt with MAP-boks. The system provides APIs for HAZ-erdz, risk assessment, ROWT planning, YOO-nit management, ih-vak-yoo-AY-shun tracking and PUB-lik SAYF-tee functions.",
    duration: 60
  },
  'Live Hazard Map: Situational Awareness': {
    script: "We op-er-AYT from the Live Hazard Map. HAZ-erd selz give ih-MEE-dee-it sit-yoo-AY-shun-ul uh-WARE-ness—what's AK-tiv, where it's KLUS-terd and where to FOH-kus next.",
    duration: 60
  },
  'Exposure & Conditions: Buildings & Weather': {
    script: "I turn on the BIL-dingz and WEH-ther LAY-erz. BIL-dingz act as a PRAK-ti-kuhl PROK-see for pop-yuh-LAY-shun. WEH-ther shows the kuhn-DIH-shunz that will SHAPE AK-ses and op-er-AY-shunz.",
    duration: 60
  },
  'Incident Focus: Anchoring the Workflow': {
    script: "I SEN-ter the map on a speh-SIF-ik HAZ-erd. This ANG-kerz the WORK-flow to the right loh-KAY-shun and helps me pry-OR-ih-tyz the next move.",
    duration: 60
  },
  'Resource Roster: Unit Management': {
    script: "Next, I open the YOO-nits PAN-ul and seh-LEKT a FY-er EN-jin from the ROS-ter. The ROS-ter keeps STA-tus and loh-KAY-shun at a GLANS so I can MATCH the uh-SYNE-ment to the right KAY-puh-BIL-ih-tee.",
    duration: 60
  },
  'Route Planning: Tactical Profiles': {
    script: "I open the ROW-ting PAN-ul and choose a FY-er TAK-ti-kuhl PROH-fyle. The SIS-tem shows the ROWT that MATCH-ez this PROH-fyle, in-KLOO-ding the STAY-jing and AK-ses points.",
    duration: 60
  },
  'Route Result: ETA & Distance Review': {
    script: "I rih-VYOO the ROWT DEE-taylz—an ES-tih-may-ted TYME of uh-RY-vul and DIS-tens. This TELLZ me how long it will take and which PATH the YOO-nit will FOL-oh.",
    duration: 60
  },
  'Tasking: Plan to Execution': {
    script: "With the ROWT VAL-ih-day-ted, I kuhn-FERM the YOO-nit will FOL-oh it. The plan moves from PLAN-ing to ek-sek-YOO-shun.",
    duration: 60
  },
  'AIP Decision Support: AI Recommendations': {
    script: "In A-I-P dih-SIZH-uhn suh-PORT, I rih-VYOO rek-uh-men-DAY-shunz and their kuhn-FIH-dens LEV-elz. It's a KWIK KROS-chek that our plan uh-LYNEZ with the KUR-ent risk PIK-cher.",
    duration: 60
  },
  'Operations Status & Call to Action': {
    script: "I open the BIL-ding ih-vak-yoo-AY-shun TRAK-er to MON-ih-ter STA-tus and PROH-gres. From map to uh-SYNE-ment to TRAK-ing, EV-ree-thing stays kuh-NEK-ted. If this MATCH-ez your MIH-shun PROH-fyle, I'd be HAP-ee to walk through a per-suh-nuh-LYZD see-NAR-ee-oh next.",
    duration: 60
  }
};

class StaticSlideGenerator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private capturesDir: string;
  private ffmpegAvailable: boolean = false;
  private qualityThreshold: number = 80;
  private maxIterations: number = 2;
  private criticBotEnabled: boolean = true;

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

    this.log('✅ Browser initialized with video recording enabled', 'success');
  }

  private async generateStaticSlide(filename: string, title: string, content: string, duration: number = 30): Promise<void> {
    this.log(`📹 Generating static slide: ${title}`);
    
    if (!this.browser) throw new Error('Browser not initialized');
    
    // Create a fresh context for each slide to ensure clean video recording
    const context = await this.browser.newContext({
              viewport: { width: 3840, height: 2160 },
      recordVideo: { dir: this.capturesDir }
    });
    
    const page = await context.newPage();
    const htmlContent = this.createSlideHTML(title, content);
    await page.setContent(htmlContent);
    
    // Wait for the specified duration
    await page.waitForTimeout(duration * 1000);
    
    // Close the context to finalize video recording
    await context.close();
    
    await this.finalizeVideoRecording(`${filename}.webm`, title);
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
            
            .pulse {
              animation: pulse 4s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { 
                opacity: 1; 
                transform: scale(1);
              }
              50% { 
                opacity: 0.95; 
                transform: scale(1.02);
              }
            }
          </style>
        </head>
        <body>
          <div class="slide-container fade-in">
            <div class="title">${title}</div>
            <div class="content">${content}</div>
          </div>
        </body>
      </html>
    `;
  }

  private getIntendedDuration(segmentName: string): number {
    // Map segment names to their intended durations
    const durationMap: { [key: string]: number } = {
      'Title & Persona': 35,
      'Problem & Outcomes': 40,
      'Data & Architecture': 45,
      'Live Hazard Map': 35,
      'Exposure & Conditions': 35,
      'Incident Triage': 30,
      'Resource Roster': 35,
      'Route Planning': 35,
      'Route Result': 30,
      'Tasking': 30,
      'AIP Guidance': 35,
      'Ops Status & CTA': 40
    };
    return durationMap[segmentName] || 30;
  }

  private async finalizeVideoRecording(outputFileName: string, segmentName?: string): Promise<void> {
    try {
      this.log('🎥 Finalizing video recording...');
      
      // Wait for video file to be written
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Find the most recent video file
      const videoFiles = fs.readdirSync(this.capturesDir)
        .filter(file => file.endsWith('.webm'))
        .map(file => ({ 
          file, 
          path: path.join(this.capturesDir, file), 
          mtime: fs.statSync(path.join(this.capturesDir, file)).mtime 
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      if (videoFiles.length === 0) {
        this.log('⚠️ No video files found', 'warning');
        return;
      }
      
      const latestVideo = videoFiles[0];
      this.log(`✅ Video saved: ${latestVideo.file} (${fs.statSync(latestVideo.path).size} bytes)`);
      
      // Generate voice-over and convert to MP4
      if (segmentName) {
        // Extract clean name from segment name (e.g., "01 - Personal Introduction" -> "Personal Introduction")
        const cleanName = segmentName.replace(/^\d+\s*-\s*/, '');
        if (TECHNICAL_NARRATION_SCRIPTS[cleanName as keyof typeof TECHNICAL_NARRATION_SCRIPTS]) {
          await this.generateVoiceOver(segmentName, latestVideo.path); // Pass full title for beat number extraction
        }
      }
      
    } catch (error) {
      this.log(`❌ Error finalizing video: ${error}`, 'error');
    }
  }

  private async generateVoiceOver(segmentName: string, videoPath: string): Promise<void> {
    try {
      this.log(`🎤 Creating voice-over for ${segmentName}...`);
      
      // Extract clean name from segment name (e.g., "01 - Personal Introduction" -> "Personal Introduction")
      const cleanName = segmentName.replace(/^\d+\s*-\s*/, '');
      const script = TECHNICAL_NARRATION_SCRIPTS[cleanName as keyof typeof TECHNICAL_NARRATION_SCRIPTS];
      if (!script) {
        this.log('⚠️ No script found for segment', 'warning');
        return;
      }
      
      this.log(`🎤 Generating voice-over for: ${segmentName}`);
      this.log(`🔊 Converting text to speech: "${script.script.substring(0, 50)}..."`);
      
      // Try to generate TTS using ElevenLabs API
      const apiKey = process.env.ELEVEN_API_KEY;
      this.log(`🔑 API Key found: ${apiKey ? 'Yes' : 'No'}`);
      
      if (apiKey) {
        try {
          const voiceId = 'LIpBYrITLsIquxoXdSkr'; // Professional male voice
          this.log(`🎤 Using voice ID: ${voiceId}`);
          
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': apiKey
            },
            body: JSON.stringify({
              text: script.script,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
              }
            })
          });
          
          this.log(`📡 API Response status: ${response.status}`);
          
          if (response.ok) {
            const audioBuffer = await response.arrayBuffer();
            const audioPath = path.join(this.capturesDir, `${segmentName.toLowerCase().replace(/\s+/g, '_')}_vo.wav`);
            fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
            
            this.log(`✅ TTS audio generated: ${audioPath}`);
            this.log(`✅ Voice-over generated with natural duration: ${audioPath}`);
            
            // Convert WebM to MP4 and add audio
            await this.convertToMP4WithAudio(videoPath, audioPath, segmentName);
            return;
          } else {
            const errorText = await response.text();
            this.log(`❌ API Error: ${response.status} - ${errorText}`, 'error');
          }
        } catch (error) {
          this.log(`❌ TTS generation failed: ${error}`, 'error');
        }
      } else {
        this.log('⚠️ No API key found, using silent audio', 'warning');
      }
      
      // Fallback to silent audio
      this.log('🔄 Falling back to silent audio file...');
      const audioPath = await this.createSilentAudio(script.duration, segmentName);
      
      // Convert WebM to MP4 and add audio
      await this.convertToMP4WithAudio(videoPath, audioPath, segmentName);
      
    } catch (error) {
      this.log(`❌ Voice-over generation failed: ${error}`, 'error');
    }
  }

  private async createSilentAudio(duration: number, segmentName: string): Promise<string> {
    try {
      this.log(`🔇 Creating silent audio file (${duration}s)...`);
      
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      const audioPath = path.join(this.capturesDir, `${segmentName.toLowerCase().replace(/\s+/g, '_')}_vo.wav`);
      await execAsync(`ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t ${duration} -c:a pcm_s16le "${audioPath}"`);
      
      this.log(`✅ Silent audio file created (${duration}s)`);
      this.log(`✅ Voice-over generated with natural duration: ${audioPath}`);
      
      return audioPath;
      
    } catch (error) {
      this.log(`❌ Silent audio creation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async convertToMP4WithAudio(videoPath: string, audioPath: string, segmentName: string): Promise<void> {
    try {
      this.log('🔄 Converting WebM to MP4 with H.264 codec...');
      
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      // Map segment names to their file names with beat numbers
      const segmentFileMap: { [key: string]: string } = {
        'Title & Persona': '01_title_&_persona',
        'Problem & Outcomes': '02_problem_&_outcomes',
        'Data & Architecture': '03_data_&_architecture',
        'Live Hazard Map': '04_live_hazard_map',
        'Exposure & Conditions': '05_exposure_&_conditions',
        'Incident Triage': '06_incident_triage',
        'Resource Roster': '07_resource_roster',
        'Route Planning': '08_route_planning',
        'Route Result': '09_route_result',
        'Tasking': '10_tasking',
        'AIP Guidance': '11_aip_guidance',
        'Ops Status & CTA': '12_ops_status_&_cta'
      };
      
      const fileName = segmentFileMap[segmentName] || segmentName.toLowerCase().replace(/\s+/g, '_');
      const outputPath = path.join(this.capturesDir, `${fileName}_with_vo.mp4`);
      
      // Check if video file exists and has content
      if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
        this.log('⚠️ Video file is empty or missing, creating static slide video...');
        // Create a static video from the slide content
        await this.createStaticVideoFromSlide(segmentName, outputPath, audioPath);
        return;
      }
      
      // First convert WebM to MP4 with 3840x2160 resolution and 60fps
      const tempMp4 = path.join(this.capturesDir, 'temp.mp4');
      await execAsync(`ffmpeg -i "${videoPath}" -c:v libx264 -preset fast -crf 23 -vf "scale=3840:2160:flags=lanczos" -r 60 "${tempMp4}"`);
      
      // Then add audio and extend video to match intended duration
      this.log('🎵 Adding audio to MP4 video...');
      // Get the intended duration from the segment name
      const intendedDuration = this.getIntendedDuration(segmentName);
      await execAsync(`ffmpeg -i "${tempMp4}" -i "${audioPath}" -c:v copy -c:a aac -t ${intendedDuration} "${outputPath}"`);
      
      // Clean up temp file
      if (fs.existsSync(tempMp4)) {
        fs.unlinkSync(tempMp4);
      }
      
      this.log(`✅ Video with voice-over created: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
      this.log(`✅ Added voice-over to ${segmentName}: ${outputPath}`);
      
    } catch (error) {
      this.log(`❌ MP4 conversion failed: ${error}`, 'error');
      // Fallback: create static video
      try {
        this.log('🔄 Creating fallback static video...');
        // Map segment names to their file names with beat numbers
        const segmentFileMap: { [key: string]: string } = {
          'Title & Persona': '01_title_&_persona',
          'Problem & Outcomes': '02_problem_&_outcomes',
          'Data & Architecture': '03_data_&_architecture',
          'Live Hazard Map': '04_live_hazard_map',
          'Exposure & Conditions': '05_exposure_&_conditions',
          'Incident Triage': '06_incident_triage',
          'Resource Roster': '07_resource_roster',
          'Route Planning': '08_route_planning',
          'Route Result': '09_route_result',
          'Tasking': '10_tasking',
          'AIP Guidance': '11_aip_guidance',
          'Ops Status & CTA': '12_ops_status_&_cta'
        };
        
        const fileName = segmentFileMap[segmentName] || segmentName.toLowerCase().replace(/\s+/g, '_');
        const outputPath = path.join(this.capturesDir, `${fileName}_with_vo.mp4`);
        await this.createStaticVideoFromSlide(segmentName, outputPath, audioPath);
      } catch (fallbackError) {
        this.log(`❌ Fallback video creation also failed: ${fallbackError}`, 'error');
      }
    }
  }

  private async generateAllSlides(): Promise<void> {
    try {
      await this.initializeBrowser();
      
      this.log('🎬 Generating static slides for Recruiter-Friendly Demo...');
      
      // Generate each slide following the new operational workflow
      await this.generateTitleAndPersonaSlide();
      await this.generateProblemAndOutcomesSlide();
      await this.generateDataAndArchitectureSlide();
      await this.generateLiveHazardMapSlide();
      await this.generateExposureAndConditionsSlide();
      await this.generateIncidentTriageSlide();
      await this.generateResourceRosterSlide();
      await this.generateRoutePlanningSlide();
      await this.generateRouteResultSlide();
      await this.generateTaskingSlide();
      await this.generateAIPGuidanceSlide();
      await this.generateOpsStatusAndCTASlide();
      await this.generateOutroAndConclusionSlide();
      
      this.log('✅ All recruiter-friendly demo slides generated successfully!');
      
    } catch (error) {
      this.log(`❌ Error generating slides: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async generateTitleAndPersonaSlide(): Promise<void> {
    const content = `
      <p>Hi, I'm <span class="highlight">Ian Frelinger</span>, Disaster Response Platform Architect.</p>
      <br>
      <p>I'm building this system through the lens of an <span class="tech-term">Incident Commander</span> and <span class="tech-term">Operations Manager</span>.</p>
      <br>
      <p>This briefing covers how we transform disconnected data into coordinated emergency response.</p>
    `;
    await this.generateStaticSlide('01_title_and_persona', 'Title & Persona', content, 35);
  }

  private async generateProblemAndOutcomesSlide(): Promise<void> {
    const content = `
      <p>Emergency managers face <span class="highlight">disconnected systems</span> that slow response times.</p>
      <br>
      <p>Our platform provides <span class="tech-term">hazards + exposure + conditions</span> in one unified view.</p>
      <br>
      <p>This turns insight into <span class="api-endpoint">clear assignments</span> for faster decisions, safer access, and reliable status tracking.</p>
    `;
    await this.generateStaticSlide('02_problem_and_outcomes', 'Problem & Outcomes', content, 40);
  }

  private async generateDataAndArchitectureSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Foundry</span> ingests data from <span class="tech-term">FIRMS</span>, <span class="tech-term">NOAA</span>, <span class="tech-term">911</span>, population, and traffic feeds.</p>
      <br>
      <p><span class="api-endpoint">Backend</span>: Python/Flask + Celery + WebSockets</p>
      <p><span class="api-endpoint">Frontend</span>: React + Mapbox</p>
      <br>
      <p><span class="metric">APIs</span>: /api/hazards /api/risk /api/routes /api/units /api/evacuations /api/public_safety</p>
    `;
    await this.generateStaticSlide('03_data_and_architecture', 'Data & Architecture', content, 45);
  }

  private async generateLiveHazardMapSlide(): Promise<void> {
    const content = `
      <p>The <span class="highlight">Live Hazard Map</span> serves as our operational canvas.</p>
      <br>
      <p><span class="tech-term">Hazard cells</span> are visible with real-time updates from satellite and ground sensors.</p>
      <br>
      <p>Commanders can focus on specific areas and track changes as conditions evolve.</p>
    `;
    await this.generateStaticSlide('04_live_hazard_map', 'Live Hazard Map', content, 35);
  }

  private async generateExposureAndConditionsSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Buildings ON</span> shows population exposure as a proxy for risk assessment.</p>
      <br>
      <p><span class="tech-term">Weather ON</span> displays current conditions that shape access and operations.</p>
      <br>
      <p>This reveals <span class="api-endpoint">who's affected</span> and <span class="api-endpoint">what shapes access</span> in real-time.</p>
    `;
    await this.generateStaticSlide('05_exposure_and_conditions', 'Exposure & Conditions', content, 35);
  }

  private async generateIncidentTriageSlide(): Promise<void> {
    const content = `
      <p>Select an <span class="highlight">incident cell</span> to begin the operational workflow.</p>
      <br>
      <p>Confirm <span class="tech-term">quick details</span>: confidence, start time, and nearby population.</p>
      <br>
      <p>This <span class="api-endpoint">anchors the workflow</span> and sets the context for all subsequent decisions.</p>
    `;
    await this.generateStaticSlide('06_incident_triage', 'Incident Triage', content, 30);
  }

  private async generateResourceRosterSlide(): Promise<void> {
    const content = `
      <p>Open <span class="highlight">Units</span> to access the resource roster.</p>
      <br>
      <p>Select <span class="tech-term">Engine-21</span> from available units.</p>
      <br>
      <p>Match <span class="api-endpoint">capability to assignment</span> based on incident requirements and unit status.</p>
    `;
    await this.generateStaticSlide('07_resource_roster', 'Resource Roster', content, 35);
  }

  private async generateRoutePlanningSlide(): Promise<void> {
    const content = `
      <p>Switch to <span class="highlight">routing view</span> for path planning.</p>
      <br>
      <p>Set <span class="tech-term">Start: Staging Area</span> and <span class="tech-term">End near incident</span>.</p>
      <br>
      <p>Configure <span class="api-endpoint">Profile: FIRE_TACTICAL</span> for emergency response routing.</p>
    `;
    await this.generateStaticSlide('08_route_planning', 'Route Planning', content, 35);
  }

  private async generateRouteResultSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Generate Route</span> using the A* algorithm with real-time constraints.</p>
      <br>
      <p>View <span class="tech-term">polyline, ETA, and distance</span> for the optimal path.</p>
      <br>
      <p>Ensure <span class="api-endpoint">safe, predictable access</span> that respects current conditions.</p>
    `;
    await this.generateStaticSlide('09_route_result', 'Route Result', content, 30);
  }

  private async generateTaskingSlide(): Promise<void> {
    const content = `
      <p><span class="highlight">Assign to Route</span> to create the operational tasking.</p>
      <br>
      <p>This provides a <span class="tech-term">defined task + access plan</span> for the unit.</p>
      <br>
      <p>Now shift to the <span class="api-endpoint">broader picture</span> to monitor overall operations.</p>
    `;
    await this.generateStaticSlide('10_tasking', 'Tasking', content, 30);
  }

  private async generateAIPGuidanceSlide(): Promise<void> {
    const content = `
      <p>Access <span class="highlight">AIP Decision Support</span> for AI-powered recommendations.</p>
      <br>
      <p>Review <span class="tech-term">recommendations + confidence</span> levels for each decision point.</p>
      <br>
      <p>Use this as a <span class="api-endpoint">quick cross-check</span> against operational experience.</p>
    `;
    await this.generateStaticSlide('11_aip_guidance', 'AIP Guidance', content, 35);
  }

  private async generateOpsStatusAndCTASlide(): Promise<void> {
    const content = `
      <p>Monitor <span class="highlight">Building Evacuation Tracker</span> for real-time progress.</p>
      <br>
      <p>Track evacuation status, unit positions, and emerging risks.</p>
      <br>
      <p>Ready to <span class="api-endpoint">invite personalized scenario</span> for your specific use case.</p>
    `;
    await this.generateStaticSlide('12_ops_status_and_cta', 'Ops Status & CTA', content, 40);
  }

  private async generateOutroAndConclusionSlide(): Promise<void> {
    const content = `
      <p>Thank you for joining me on this <span class="highlight">technical deep dive</span> into our disaster response platform.</p>
      <br>
      <p>We've demonstrated how <span class="tech-term">real-time data integration</span>, <span class="tech-term">intelligent routing</span>, and <span class="tech-term">AI-powered decision support</span> can transform emergency response operations.</p>
      <br>
      <p>This system represents the future of <span class="api-endpoint">emergency management</span>—where every second counts and every decision matters.</p>
      <br>
      <p>For more information or to schedule a <span class="highlight">personalized demo</span>, please visit our website or contact our team.</p>
      <br>
      <p><span class="metric">Together, we can build a safer, more resilient future.</span></p>
    `;
    await this.generateStaticSlide('21_outro_and_conclusion', 'Outro & Conclusion', content, 45);
  }

  private async createStaticVideoFromSlide(segmentName: string, outputPath: string, audioPath: string): Promise<void> {
    try {
      this.log(`🎬 Creating static video for ${segmentName}...`);
      
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      // Get the slide content based on segment name
      let slideContent = '';
      switch (segmentName) {
        case 'Personal Introduction':
          slideContent = `
            <p>Hi, I'm <span class="highlight">Ian Frelinger</span>, Disaster Response Platform Architect.</p>
            <br>
            <p>I'm building this intelligent system because emergency managers need better tools when lives are at stake.</p>
            <br>
            <p>Our platform transforms disaster response from <span class="tech-term">reactive to proactive</span>, leveraging <span class="tech-term">AI and real-time data</span> to coordinate emergency services and protect communities.</p>
          `;
          break;
        case 'User Persona Definition':
          slideContent = `
            <p>Our primary users are <span class="highlight">Incident Commanders</span>, <span class="highlight">emergency planners</span>, and <span class="highlight">first responders</span>.</p>
            <br>
            <p>They face <span class="tech-term">disconnected systems</span>, <span class="tech-term">slow response times</span>, and <span class="tech-term">limited situational awareness</span>.</p>
            <br>
            <p>Every minute wasted puts lives at risk. They need unified tools that provide <span class="metric">real-time insights</span> and <span class="metric">coordinated response capabilities</span>.</p>
          `;
          break;
        case 'Technical Architecture':
          slideContent = `
            <p>Our architecture ingests data from <span class="tech-term">FIRMS</span>, <span class="tech-term">NOAA</span>, <span class="tech-term">911</span>, population and traffic feeds via <span class="highlight">Palantir Foundry</span>.</p>
            <br>
            <p>We process hazards using <span class="api-endpoint">H3 at resolution 9</span>, giving us <span class="metric">174-meter precision</span>.</p>
            <br>
            <p>Our <span class="tech-term">Python/Flask backend</span> with <span class="tech-term">Celery/Redis</span> exposes data through REST endpoints:</p>
            <p><span class="api-endpoint">/api/hazards</span> <span class="api-endpoint">/api/zones</span> <span class="api-endpoint">/api/routes</span> <span class="api-endpoint">/api/risk</span></p>
            <p><span class="api-endpoint">/api/evacuations</span> <span class="api-endpoint">/api/units</span> <span class="api-endpoint">/api/public_safety</span></p>
            <br>
            <p><span class="tech-term">WebSockets</span> provide real-time streaming updates.</p>
          `;
          break;
        default:
          slideContent = `<p>${segmentName}</p>`;
      }
      
      // Create HTML file for the slide
      const htmlContent = this.createSlideHTML(segmentName, slideContent);
      // Extract beat number from segment name
      const beatMatch = segmentName.match(/^(\d+)\s*-\s*(.+)$/);
      const beatNumber = beatMatch ? beatMatch[1] : '';
      const cleanName = beatMatch ? beatMatch[2] : segmentName;
      const htmlPath = path.join(this.capturesDir, `${beatNumber}_${cleanName.toLowerCase().replace(/\s+/g, '_')}_slide.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      // Create video from HTML with audio
      const duration = TECHNICAL_NARRATION_SCRIPTS[segmentName as keyof typeof TECHNICAL_NARRATION_SCRIPTS]?.duration || 30;
      await execAsync(`ffmpeg -f lavfi -i color=c=0x1e3c72:size=3840x2160:duration=${duration} -i "${audioPath}" -vf "drawtext=text='${segmentName}':fontsize=120:fontcolor=white:x=(w-text_w)/2:y=200" -c:a aac -shortest "${outputPath}"`);
      
      // Clean up HTML file
      if (fs.existsSync(htmlPath)) {
        fs.unlinkSync(htmlPath);
      }
      
      this.log(`✅ Static video created: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
      
    } catch (error) {
      this.log(`❌ Static video creation failed: ${error}`, 'error');
    }
  }
}

// Main execution
async function main() {
  const generator = new StaticSlideGenerator();
  await generator.generateAllSlides();
}

main().catch(console.error);
