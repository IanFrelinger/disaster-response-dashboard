#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PresentationBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  visualTarget?: string;
}

interface TTSConfig {
  voice: string;
  rate: number;
  pitch: number;
  outputFormat: 'aiff' | 'wav';
}

class TTSGenerator {
  private config: TTSConfig;
  private audioDir: string = 'audio';
  private beats: PresentationBeat[];

  constructor() {
    this.config = {
      voice: 'Alex',
      rate: 175,
      pitch: 100,
      outputFormat: 'aiff'
    };
    this.beats = this.createPresentationBeats();
    this.ensureAudioDir();
  }

  private createPresentationBeats(): PresentationBeat[] {
    return [
      {
        id: "intro",
        title: "Introduction",
        duration: 15,
        description: "Dashboard overview and platform introduction",
        narration: "Hi, I'm excited to share my Palantir Building Challenge project. I've built a disaster-response platform that helps incident commanders and their teams coordinate faster and safer when minutes matter.",
        visualTarget: "Dashboard main view"
      },
      {
        id: "problem-statement",
        title: "Problem Statement & Motivation",
        duration: 25,
        description: "Show current challenges with hazard detection",
        narration: "Emergency responders have to juggle radios, maps, spreadsheets and more, which slows them down when every minute counts. In many cases, lower-level responders lack access to high-level situational awareness and tools reserved for incident commanders. I wanted to build something that brings everyone onto the same page without overloading them with information.",
        visualTarget: "Live hazard map with active hazards"
      },
      {
        id: "user-persona",
        title: "Target User Persona",
        duration: 15,
        description: "Show different user roles and access levels",
        narration: "This system is designed for Incident Commanders, Operations and Planning chiefs, dispatchers and field units. We keep the Incident Commander at the top of the chain of command but also give front-line teams real-time information and AI-generated recommendations.",
        visualTarget: "User role selection interface"
      },
      {
        id: "technical-architecture",
        title: "Technical Architecture & API Data Flow",
        duration: 30,
        description: "Show API data flow and system architecture",
        narration: "Under the hood, the front end uses React and Mapbox for a fast, 3-D map. The backend runs on Python/Flask with WebSockets and Celery to handle real-time updates. Everything sits on Palantir Foundry, which streams live data from NOAA, NASA and USGS and powers the AIP assistant. This API data-flow diagram shows how external feeds flow into ingestion and hazard processing. From there, the data drives three core services: route optimisation, ontology and entities, and AI decision support.",
        visualTarget: "API data flow diagram"
      },
      {
        id: "detect-verify",
        title: "Detect & Verify",
        duration: 15,
        description: "Show satellite feed and risk scoring",
        narration: "A satellite feed shows a new fire. The system flags it and scores the risk using population data and weather. As the Incident Commander, I confirm that this is a real incident.",
        visualTarget: "Satellite feed with risk scoring"
      },
      {
        id: "triage-risk",
        title: "Triage & Risk Scoring",
        duration: 10,
        description: "Show evacuation vs shelter decision",
        narration: "Looking at the risk and wind direction, I decide we should evacuate rather than shelter in place. The AI suggests this because the fire is near critical infrastructure.",
        visualTarget: "Risk analysis with AI recommendations"
      },
      {
        id: "define-zones",
        title: "Define Zones",
        duration: 10,
        description: "Show evacuation zone drawing tool",
        narration: "With the drawing tool, I outline the evacuation zone and set its priority. This defines which buildings and residents are affected.",
        visualTarget: "Zone drawing interface"
      },
      {
        id: "plan-routes",
        title: "Plan Routes",
        duration: 20,
        description: "Show route planning with different profiles",
        narration: "I pick a route profile—civilian, EMS, fire tactical or police—each balancing safety and speed. The blue line you see is a hazard-aware route calculated using A Star search.",
        visualTarget: "Route planning with hazard-aware routing"
      },
      {
        id: "assign-units",
        title: "Assign Units & Track Assets",
        duration: 10,
        description: "Show unit assignment and building status",
        narration: "I assign engines and medics. Dragging units onto the map updates their tasks and travel times. On the right, you can see building status—evacuated, in progress, refused or uncontacted.",
        visualTarget: "Unit assignment and building status tracking"
      },
      {
        id: "ai-support",
        title: "AI Support & Replan",
        duration: 20,
        description: "Show AIP assistant and alternative routes",
        narration: "If I have a question, I can ask the AIP assistant something like \"What happens if we lose Highway 30?\" and get alternative routes right away. When a new hazard or weather update comes in, the system automatically recalculates and loops back to zone definition.",
        visualTarget: "AI assistant interface"
      },
      {
        id: "value-proposition",
        title: "Value Proposition & Impact",
        duration: 30,
        description: "Show asset management and benefits",
        narration: "This platform speeds up decisions, reduces staffing needed for manual data fusion, and gives every responder a common operating picture while keeping the Incident Commander firmly in control. By automating routine steps, it lets teams focus on actions that save lives and property.",
        visualTarget: "Asset management dashboard"
      },
      {
        id: "foundry-integration",
        title: "Foundry Integration & AI Assistance",
        duration: 20,
        description: "Show Foundry data pipelines and ontology",
        narration: "Thanks to Foundry's data pipelines and ontology, I can ingest and fuse multiple feeds quickly. The AIP assistant is context-aware because it sits on top of that ontology, so it can recommend re-routing around a blocked highway or predict fire spread.",
        visualTarget: "Foundry integration and data pipelines"
      },
      {
        id: "conclusion",
        title: "Conclusion & Call to Action",
        duration: 20,
        description: "Final summary and call to action",
        narration: "To wrap up, this project shows how real-time data, AI assistance and a streamlined chain of command can modernize emergency response. I'd love to talk about piloting this with your teams.",
        visualTarget: "Navigation menu with CTA"
      }
    ];
  }

  private ensureAudioDir(): void {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateTTSAudio(beat: PresentationBeat): Promise<string | null> {
    const audioPath = path.join(this.audioDir, `${beat.id}.${this.config.outputFormat}`);
    
    try {
      console.log(`🎤 Generating TTS for: ${beat.title}`);
      
      // Create a temporary text file
      const tempTextFile = path.join(this.audioDir, `${beat.id}.txt`);
      fs.writeFileSync(tempTextFile, beat.narration);
      
      // Use macOS say command with text file input
      const command = `say -v ${this.config.voice} -r ${this.config.rate} -f "${tempTextFile}" -o "${audioPath}"`;
      
      await execAsync(command);
      
      // Clean up temp file
      if (fs.existsSync(tempTextFile)) {
        fs.unlinkSync(tempTextFile);
      }
      
      if (fs.existsSync(audioPath)) {
        console.log(`✅ TTS generated: ${audioPath}`);
        return audioPath;
      } else {
        console.error(`❌ TTS file not created: ${audioPath}`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ TTS generation failed: ${error}`);
      return null;
    }
  }

  async generateAllTTS(): Promise<void> {
    console.log('🎤 Starting TTS Generation');
    console.log('=' .repeat(40));
    console.log(`📊 Total beats: ${this.beats.length}`);
    console.log(`🔊 Voice: ${this.config.voice}`);
    console.log(`⚡ Rate: ${this.config.rate}`);
    console.log(`📁 Output directory: ${this.audioDir}`);
    console.log(`🎵 Format: ${this.config.outputFormat.toUpperCase()}`);
    console.log('');

    const results: { beat: PresentationBeat; success: boolean; filePath?: string; error?: string }[] = [];

    for (const beat of this.beats) {
      const filePath = await this.generateTTSAudio(beat);
      results.push({
        beat,
        success: !!filePath,
        filePath,
        error: filePath ? undefined : 'TTS generation failed'
      });
    }

    // Generate report
    await this.generateReport(results);
  }

  async generateReport(results: { beat: PresentationBeat; success: boolean; filePath?: string; error?: string }[]): Promise<void> {
    const reportPath = path.join(this.audioDir, 'tts-generation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: results.map(r => ({
        id: r.beat.id,
        title: r.beat.title,
        duration: r.beat.duration,
        success: r.success,
        filePath: r.filePath,
        error: r.error
      })),
      summary: {
        totalBeats: results.length,
        successfulBeats: results.filter(r => r.success).length,
        failedBeats: results.filter(r => !r.success).length,
        totalDuration: results.reduce((sum, r) => sum + r.beat.duration, 0)
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 TTS Generation Report');
    console.log('=' .repeat(30));
    console.log(`Total beats: ${report.summary.totalBeats}`);
    console.log(`Successful: ${report.summary.successfulBeats}`);
    console.log(`Failed: ${report.summary.failedBeats}`);
    console.log(`Success rate: ${((report.summary.successfulBeats / report.summary.totalBeats) * 100).toFixed(1)}%`);
    console.log(`Total duration: ${report.summary.totalDuration}s`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (report.summary.failedBeats > 0) {
      console.log('\n❌ Failed TTS generations:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.beat.title}: ${result.error}`);
      });
    }
    
    console.log('\n🎬 Next Steps:');
    console.log('1. Review the generated audio files in the audio directory');
    console.log('2. Use video editing software to combine video and audio');
    console.log('3. Adjust timing if needed to sync audio with video');
    console.log('4. Add any additional sound effects or music as needed');
  }
}

// Main execution
async function main() {
  const generator = new TTSGenerator();
  await generator.generateAllTTS();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TTSGenerator };
