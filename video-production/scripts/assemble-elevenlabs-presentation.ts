#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Beat {
  id: string;
  title: string;
  filePath: string;
  duration: number;
}

class ElevenLabsPresentationAssembler {
  private syncedBeatsDir: string;
  private outputDir: string;
  private beats: Beat[];

  constructor() {
    this.syncedBeatsDir = 'synced-beats';
    this.outputDir = 'final-presentation';
    this.beats = [];
    this.ensureOutputDir();
  }

  private async loadSyncedBeats(): Promise<Beat[]> {
    const beatOrder = [
      'intro',
      'problem-statement',
      'user-persona',
      'technical-architecture',
      'detect-verify',
      'triage-risk',
      'define-zones',
      'plan-routes',
      'assign-units',
      'ai-support',
      'value-proposition',
      'foundry-integration',
      'conclusion'
    ];

    const beats: Beat[] = [];
    
    for (const beatId of beatOrder) {
      const filePath = path.join(this.syncedBeatsDir, `${beatId}.mp4`);
      if (fs.existsSync(filePath)) {
        // Get duration using ffprobe
        try {
          const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`);
          const duration = parseFloat(stdout.trim());
          
          beats.push({
            id: beatId,
            title: this.getBeatTitle(beatId),
            filePath,
            duration
          });
        } catch (error) {
          console.error(`❌ Error getting duration for ${beatId}: ${error}`);
        }
      } else {
        console.warn(`⚠️  Beat file not found: ${filePath}`);
      }
    }

    return beats;
  }

  private getBeatTitle(beatId: string): string {
    const titles: { [key: string]: string } = {
      'intro': 'Introduction',
      'problem-statement': 'Problem Statement & Motivation',
      'user-persona': 'Target User Persona',
      'technical-architecture': 'Technical Architecture & API Data Flow',
      'detect-verify': 'Detect & Verify',
      'triage-risk': 'Triage & Risk Scoring',
      'define-zones': 'Define Zones',
      'plan-routes': 'Plan Routes',
      'assign-units': 'Assign Units & Track Assets',
      'ai-support': 'AI Support & Replan',
      'value-proposition': 'Value Proposition & Impact',
      'foundry-integration': 'Foundry Integration & AI Assistance',
      'conclusion': 'Conclusion & Call to Action'
    };
    
    return titles[beatId] || beatId;
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private createConcatFile(): string {
    const concatPath = path.join(this.outputDir, 'concat-list.txt');
    const lines = this.beats.map(beat => `file '${path.resolve(beat.filePath)}'`);
    
    fs.writeFileSync(concatPath, lines.join('\n'));
    return concatPath;
  }

  async assemblePresentation(): Promise<void> {
    console.log('🎬 ElevenLabs Presentation Assembly');
    console.log('=' .repeat(50));
    console.log(`📁 Synced beats directory: ${this.syncedBeatsDir}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    
    // Load beats
    this.beats = await this.loadSyncedBeats();
    console.log(`📊 Total beats: ${this.beats.length}`);
    console.log('');

    if (this.beats.length === 0) {
      throw new Error('No synced beat files found');
    }

    // Display beat information
    console.log('🎬 Beat Files to Assemble:');
    let totalDuration = 0;
    this.beats.forEach((beat, index) => {
      console.log(`  ${index + 1}. ${beat.title} (${beat.duration.toFixed(2)}s)`);
      totalDuration += beat.duration;
    });
    console.log(`\n⏱️  Total duration: ${totalDuration.toFixed(2)}s (${(totalDuration / 60).toFixed(2)} minutes)`);
    console.log('');

    // Create concat file
    const concatFile = this.createConcatFile();
    console.log(`📝 Created concat file: ${concatFile}`);

    // Assemble presentation
    const outputPath = path.join(this.outputDir, 'disaster-response-elevenlabs-presentation.mp4');
    
    console.log('🚀 Assembling presentation...');
    console.log(`  📹 Output: ${outputPath}`);
    console.log(`  🎤 Audio: ElevenLabs with your cloned voice`);
    console.log(`  📊 Format: MP4 with H.264 video and AAC audio`);
    console.log('');

    const command = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy -y "${outputPath}"`;
    
    try {
      await execAsync(command);
      
      // Verify output file
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          console.log('✅ Presentation assembled successfully!');
          
          // Get final duration
          const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${outputPath}"`);
          const finalDuration = parseFloat(stdout.trim());
          
          console.log(`📹 Final presentation: ${outputPath}`);
          console.log(`⏱️  Duration: ${finalDuration.toFixed(2)}s (${(finalDuration / 60).toFixed(2)} minutes)`);
          console.log(`📊 File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
          
          // Generate assembly report
          await this.generateReport(outputPath, finalDuration, stats.size);
          
        } else {
          throw new Error('Output file is empty');
        }
      } else {
        throw new Error('Output file was not created');
      }
      
    } catch (error) {
      console.error('❌ Assembly failed:', error);
      throw error;
    }
  }

  async generateReport(outputPath: string, duration: number, fileSize: number): Promise<void> {
    const reportPath = path.join(this.outputDir, 'assembly-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      outputFile: path.basename(outputPath),
      totalBeats: this.beats.length,
      totalDuration: duration,
      fileSizeBytes: fileSize,
      fileSizeMB: fileSize / (1024 * 1024),
      beats: this.beats.map(beat => ({
        id: beat.id,
        title: beat.title,
        duration: beat.duration,
        filePath: beat.filePath
      })),
      audioProvider: 'ElevenLabs',
      voiceType: 'Cloned Voice',
      format: 'MP4 (H.264 + AAC)'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Assembly Report');
    console.log('=' .repeat(30));
    console.log(`Total beats: ${report.totalBeats}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Audio: ElevenLabs with your cloned voice`);
    console.log(`Report saved to: ${reportPath}`);
    
    console.log('\n🎬 Final Presentation Ready!');
    console.log('=' .repeat(30));
    console.log(`📹 File: ${outputPath}`);
    console.log(`🎤 Audio: Your cloned voice throughout`);
    console.log(`⏱️  Duration: ${(duration / 60).toFixed(2)} minutes`);
    console.log(`📊 Quality: Professional MP4 format`);
    
    console.log('\n🎬 Next Steps:');
    console.log('1. Review the final presentation');
    console.log('2. Share or upload as needed');
    console.log('3. The presentation is ready for submission');
  }
}

// Main execution
async function main() {
  try {
    const assembler = new ElevenLabsPresentationAssembler();
    await assembler.assemblePresentation();
  } catch (error) {
    console.error('❌ Presentation assembly failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ElevenLabsPresentationAssembler };
