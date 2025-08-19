#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

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

class VoiceOverGenerator {
  private audioDir: string;
  private apiKey: string;
  private voiceId: string;

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
    
    this.audioDir = path.join(__dirname, '..', 'audio', 'vo');
    this.ensureAudioDirectory();
    
    // Get ElevenLabs API configuration
    this.apiKey = process.env.ELEVEN_API_KEY || '';
    this.voiceId = process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr';
    
    if (!this.apiKey) {
      throw new Error('ELEVEN_API_KEY not found in environment variables');
    }
  }

  private ensureAudioDirectory(): void {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    this.log(`✅ Audio directory ready: ${this.audioDir}`, 'success');
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

  private async generateVoiceOver(slideName: string, script: string, beatNumber: number): Promise<string> {
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
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const paddedBeatNumber = beatNumber.toString().padStart(2, '0');
      const filename = `${paddedBeatNumber}_${slideName.toLowerCase().replace(/\s+/g, '_')}_vo.wav`;
      const audioPath = path.join(this.audioDir, filename);
      
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
      
      this.log(`✅ Voice-over generated: ${filename}`, 'success');
      return audioPath;
      
    } catch (error) {
      this.log(`❌ Voice-over generation failed for ${slideName}: ${error}`, 'error');
      throw error;
    }
  }

  public async generateAllVoiceOvers(): Promise<void> {
    this.log('🎤 Starting voice-over generation for all slides...');
    
    const results: { slide: string; audioPath: string; duration: number; beatNumber: number }[] = [];
    
    try {
      let beatNumber = 1;
      for (const [slideName, slideData] of Object.entries(TECHNICAL_NARRATION_SCRIPTS)) {
        try {
          const audioPath = await this.generateVoiceOver(slideName, slideData.script, beatNumber);
          results.push({
            slide: slideName,
            audioPath,
            duration: slideData.duration,
            beatNumber: beatNumber
          });
          
          beatNumber++;
          
          // Add a small delay between API calls to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          this.log(`⚠️  Skipping ${slideName} due to error`, 'warning');
          beatNumber++;
        }
      }
      
      // Generate a summary report
      await this.generateSummaryReport(results);
      
      this.log(`✅ Voice-over generation completed! Generated ${results.length} audio files.`, 'success');
      
    } catch (error) {
      this.log(`❌ Voice-over generation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async generateSummaryReport(results: { slide: string; audioPath: string; duration: number; beatNumber: number }[]): Promise<void> {
    const reportPath = path.join(this.audioDir, 'voice-over-summary.json');
    const report = {
      generatedAt: new Date().toISOString(),
      totalSlides: results.length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      slides: results.map(r => ({
        beatNumber: r.beatNumber,
        slide: r.slide,
        audioFile: path.basename(r.audioPath),
        duration: r.duration,
        script: TECHNICAL_NARRATION_SCRIPTS[r.slide as keyof typeof TECHNICAL_NARRATION_SCRIPTS]?.script
      }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📋 Summary report saved: ${reportPath}`, 'success');
  }
}

// Main execution
async function main() {
  try {
    const generator = new VoiceOverGenerator();
    await generator.generateAllVoiceOvers();
  } catch (error) {
    console.error('❌ Voice-over generation failed:', error);
    process.exit(1);
  }
}

main();
