#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';
import * as yaml from 'js-yaml';

// Updated narration scripts for 12 condensed beats with regular spelling (phonetic only for special cases)
const TECHNICAL_NARRATION_SCRIPTS = {
  'Persona & Problem': {
    script: "Hi, I'm Ian Frelinger, Disaster Response Platform Architect. In live incidents, seconds matter. Emergency managers face disconnected systems that slow response times. Our platform provides hazards, exposure and conditions in one unified view. This turns insight into clear assignments for faster decisions.",
    duration: 30
  },
  'Architecture Overview': {
    script: "Data streams in from F-I-R-M-S, N-O-A-A, nine-one-one, population and traffic. Thanks to Palantir Foundry, this fusion happens in real time, keeping all stakeholders in sync. Our Python/Flask backend with Celery and WebSockets delivers real-time updates. The React/Mapbox front-end consumes APIs for hazards, risk, routes, units, evacuations and public safety. Now let's look at how we visualize hazards and conditions on the map.",
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
    script: "I open the Routing panel and choose a Fire Tactical profile. The system shows the route that matches this profile. This includes staging and access points.",
    duration: 30
  },
  'Route Review': {
    script: "I review the route details—estimated time of arrival and distance. This tells me how long it will take and which path the unit will follow. Now let's confirm the assignment.",
    duration: 30
  },
  'Task Assignment': {
    script: "With the route validated, I confirm the unit will follow it. Now I know the plan is actionable and can be executed confidently. Let's check our AI-powered decision support.",
    duration: 30
  },
  'AIP Guidance': {
    script: "In A-I-P decision support, I review recommendations and confidence levels. This provides a quick cross-check against operational experience. Now let's monitor our progress.",
    duration: 30
  },
  'Progress Tracking': {
    script: "I open the Building Evacuation Tracker to monitor status and progress. From map to assignment to tracking, everything stays connected. This completes our operational workflow.",
    duration: 30
  },
  'Conclusion & CTA': {
    script: "Thank you for joining me on this technical deep dive. We've seen how real-time data fusion, intelligent routing and AI-powered decision support transform emergency response. Together, we can reduce response times and save lives. For a personalized demo, please contact our team.",
    duration: 30
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
      
      this.log('🎬 Generating static slides for 12-Beat Condensed Demo...');
      
      // Generate each slide following the new 12-beat condensed structure
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
      
      this.log('✅ All 12-beat condensed demo slides generated successfully!');
      
    } catch (error) {
      this.log(`❌ Error generating slides: ${error}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

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
    await this.generateStaticSlide('01_persona_and_problem', 'Persona & Problem', content, 30);
  }

  private async generateArchitectureOverviewSlide(): Promise<void> {
    const content = `
      <p>Data streams in from <span class="highlight">F-I-R-M-S</span>, <span class="highlight">N-O-A-A</span>, <span class="highlight">nine-one-one</span>, population and traffic.</p>
      <br>
      <p>Thanks to <span class="tech-term">Palantir Foundry</span>, this fusion happens in real time, keeping all stakeholders in sync.</p>
      <br>
      <p><span class="api-endpoint">Backend</span>: Python/Flask + Celery + WebSockets</p>
      <p><span class="api-endpoint">Frontend</span>: React + Mapbox</p>
      <br>
      <p>APIs: hazards, risk, routes, units, evacuations, public safety</p>
    `;
    await this.generateStaticSlide('02_architecture_overview', 'Architecture Overview', content, 45);
  }



  private async generateLiveHazardMapSlide(): Promise<void> {
    const content = `
      <p>We operate from the <span class="highlight">Live Hazard Map</span>.</p>
      <br>
      <p><span class="tech-term">Hazard cells</span> show what's active, where it's clustered and where to focus next.</p>
      <br>
      <p>This gives immediate <span class="api-endpoint">situational awareness</span>.</p>
    `;
    await this.generateStaticSlide('03_live_hazard_map', 'Live Hazard Map', content, 30);
  }

  private async generateExposureAndConditionsSlide(): Promise<void> {
    const content = `
      <p>I turn on the <span class="highlight">Buildings</span> and <span class="highlight">Weather</span> layers.</p>
      <br>
      <p><span class="tech-term">Buildings</span> act as a practical proxy for population exposure.</p>
      <br>
      <p><span class="tech-term">Weather</span> shows conditions that shape access and operations.</p>
    `;
    await this.generateStaticSlide('04_exposure_and_conditions', 'Exposure & Conditions', content, 30);
  }

  private async generateIncidentFocusSlide(): Promise<void> {
    const content = `
      <p>I center the map on a <span class="highlight">specific hazard</span>.</p>
      <br>
      <p>This <span class="tech-term">anchors the workflow</span> to the right location.</p>
      <br>
      <p>Now let's select resources and plan our response.</p>
    `;
    await this.generateStaticSlide('05_incident_focus', 'Incident Focus', content, 30);
  }

  private async generateResourceSelectionSlide(): Promise<void> {
    const content = `
      <p>I open the <span class="highlight">Units</span> panel and select a fire engine from the roster.</p>
      <br>
      <p>The roster shows <span class="tech-term">status and location</span> at a glance.</p>
      <br>
      <p>This helps me ensure the <span class="api-endpoint">right capability reaches the right place, faster</span>.</p>
    `;
    await this.generateStaticSlide('06_resource_selection', 'Resource Selection', content, 30);
  }

  private async generateRoutePlanningSlide(): Promise<void> {
    const content = `
      <p>I open the <span class="highlight">Routing</span> panel and choose a <span class="tech-term">Fire Tactical</span> profile.</p>
      <br>
      <p>The system shows the route that matches this profile.</p>
      <br>
      <p>This includes <span class="api-endpoint">staging and access points</span>.</p>
    `;
    await this.generateStaticSlide('07_route_planning', 'Route Planning', content, 30);
  }

  private async generateRouteReviewSlide(): Promise<void> {
    const content = `
      <p>I review the route details—<span class="highlight">estimated time of arrival</span> and <span class="highlight">distance</span>.</p>
      <br>
      <p>This tells me how long it will take and which path the unit will follow.</p>
      <br>
      <p>Now let's <span class="api-endpoint">confirm the assignment</span>.</p>
    `;
    await this.generateStaticSlide('08_route_review', 'Route Review', content, 30);
  }

  private async generateTaskAssignmentSlide(): Promise<void> {
    const content = `
      <p>With the route validated, I <span class="highlight">confirm the unit will follow it</span>.</p>
      <br>
      <p>Now I know the plan is <span class="tech-term">actionable and can be executed confidently</span>.</p>
      <br>
      <p>Let's check our <span class="api-endpoint">AI-powered decision support</span>.</p>
    `;
    await this.generateStaticSlide('09_task_assignment', 'Task Assignment', content, 30);
  }

  private async generateAIPGuidanceSlide(): Promise<void> {
    const content = `
      <p>In <span class="highlight">A-I-P decision support</span>, I review recommendations and confidence levels.</p>
      <br>
      <p>This provides a <span class="tech-term">quick cross-check</span> against operational experience.</p>
      <br>
      <p>Now let's <span class="api-endpoint">monitor our progress</span>.</p>
    `;
    await this.generateStaticSlide('10_aip_guidance', 'AIP Guidance', content, 30);
  }

  private async generateProgressTrackingSlide(): Promise<void> {
    const content = `
      <p>I open the <span class="highlight">Building Evacuation Tracker</span> to monitor status and progress.</p>
      <br>
      <p>From map to assignment to tracking, <span class="tech-term">everything stays connected</span>.</p>
      <br>
      <p>This completes our <span class="api-endpoint">operational workflow</span>.</p>
    `;
    await this.generateStaticSlide('11_progress_tracking', 'Progress Tracking', content, 30);
  }

  private async generateConclusionAndCTASlide(): Promise<void> {
    const content = `
      <p>Thank you for joining me on this <span class="highlight">technical deep dive</span>.</p>
      <br>
      <p>We've seen how <span class="tech-term">real-time data fusion</span>, <span class="tech-term">intelligent routing</span> and <span class="tech-term">AI-powered decision support</span> transform emergency response.</p>
      <br>
      <p><span class="api-endpoint">Together, we can reduce response times and save lives</span>.</p>
      <br>
      <p>For a <span class="highlight">personalized demo</span>, please contact our team.</p>
    `;
    await this.generateStaticSlide('12_conclusion_and_cta', 'Conclusion & CTA', content, 30);
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
