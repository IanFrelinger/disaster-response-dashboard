#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Updated narration scripts for 12 condensed beats with regular spelling (phonetic only for special cases)
const TECHNICAL_NARRATION_SCRIPTS = {
  'Persona & Problem': {
        script: "Hi, I'm Ian Frel-in-jer, Disaster Response Platform Architect. When incidents happen, every second counts. Emergency managers struggle with disconnected systems that delay response times. Our platform brings together hazards, exposure and conditions in one unified view. This transforms insight into clear assignments for faster decisions.",
    duration: 30
  },
  'High-Level Architecture': {
        script: "Data flows in from Fire Information Resource Management System, National Oceanic and Atmospheric Administration, nine-one-one, population and traffic. Thanks to Pal-an-TEER Found-ree, this fusion happens in real time, keeping all stakeholders connected. Our Python/Flask backend with Sell-uh-ree and Web-Sockets delivers real-time updates. The Ree-act/Map-box front end consumes APIs for hazards, risk, routes, units, evacuations and public safety. Now let's see how we visualize hazards and conditions on the map.",
    duration: 45
  },
  'Live Hazard Map': {
        script: "We work from the Live Hazard Map. Hazard cells show what's active, where it's clustered and where to focus next. This gives us immediate situational awareness.",
    duration: 30
  },
  'Exposure & Conditions': {
        script: "I turn on the Buildings and Weather layers. Buildings serve as a practical proxy for population exposure. Weather shows conditions that affect access and operations.",
    duration: 30
  },
  'Incident Focus': {
        script: "I center the map on a specific hazard. This anchors the workflow to the right location. Now let's pick resources and plan our response.",
    duration: 30
  },
  'Resource Selection': {
        script: "I open the Units panel and pick a fire engine from the roster. The roster shows status and location at a glance. This helps me make sure the right capability reaches the right place, faster.",
    duration: 30
  },
  'Route Planning': {
        script: "I open the Routing panel and pick a Fire Tac-ti-cal profile. The system shows the route that matches this profile. This includes staging and access points.",
    duration: 30
  },
  'Route Review': {
    script: "I review the route details—estimated time of arrival and distance. This tells me how long it will take and which path the unit will follow. Now let's confirm the assignment.",
    duration: 30
  },
  'Task Assignment': {
    script: "With the route validated, I confirm the unit will follow it. Now I know the plan is actionable and can be executed confidently. Let's check our Artificial Intelligence-powered decision support.",
    duration: 30
  },
  'AIP Guidance': {
        script: "In Artificial Intelligence Platform decision support, I review recommendations and confidence levels. This gives me a quick cross-check against operational experience. Now let's monitor our progress.",
    duration: 30
  },
  'Progress Tracking': {
    script: "I open the Building Evacuation Tracker to monitor status and progress. From map to assignment to tracking, everything stays connected. This completes our operational workflow.",
    duration: 30
  },
  'Conclusion & CTA': {
        script: "Thanks for joining me on this technical deep dive. We've seen how real-time data fusion, intelligent routing and Artificial Intelligence-powered decision support transform emergency response. Together, we can reduce response times and save lives. For a personalized demo, please contact our team.",
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
            stability: 0.9,
            similarity_boost: 0.95,
            speaking_rate: 0.3
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const paddedBeatNumber = beatNumber.toString().padStart(2, '0');
      const filename = `${paddedBeatNumber}_${slideName.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')}_vo.wav`;
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
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const tempPath = audioPath.replace('.wav', '_temp.wav');
    
    try {
      // Use FFmpeg to slow down the audio to 85% of original speed
      await execAsync(`ffmpeg -i "${audioPath}" -filter:a "atempo=0.85" "${tempPath}" -y`);
      
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
