#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Missing voice-overs that need to be generated
const MISSING_VOICE_OVERS = {
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
  }
};

class MissingVoiceOverGenerator {
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
    
    this.apiKey = process.env.ELEVEN_API_KEY || '';
    this.voiceId = process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr';
    
    if (!this.apiKey) {
      this.log('❌ ElevenLabs API key not found in environment variables', 'error');
      process.exit(1);
    }
  }

  private ensureAudioDirectory(): void {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    this.log(`✅ Audio directory ready: ${this.audioDir}`, 'success');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private async generateVoiceOver(title: string, script: string, duration: number): Promise<void> {
    const fileName = `${title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}_vo.wav`;
    const filePath = path.join(this.audioDir, fileName);
    
    this.log(`🎤 Generating voice-over for: ${title}`);
    
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
      fs.writeFileSync(filePath, Buffer.from(audioBuffer));
      
      this.log(`✅ Voice-over generated: ${fileName}`, 'success');
      
    } catch (error) {
      this.log(`❌ Voice-over generation failed for ${title}: ${error}`, 'error');
      this.log(`⚠️  Skipping ${title} due to error`, 'warning');
    }
  }

  async generateAllMissingVoiceOvers(): Promise<void> {
    this.log('🎤 Starting missing voice-over generation...');
    
    const entries = Object.entries(MISSING_VOICE_OVERS);
    
    for (const [title, config] of entries) {
      await this.generateVoiceOver(title, config.script, config.duration);
      
      // Add delay between requests to avoid rate limits
      if (entries.indexOf([title, config]) < entries.length - 1) {
        this.log('⏳ Waiting 5 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    this.log('✅ Missing voice-over generation completed!');
  }
}

// Main execution
async function main() {
  const generator = new MissingVoiceOverGenerator();
  await generator.generateAllMissingVoiceOvers();
}

main().catch(console.error);
