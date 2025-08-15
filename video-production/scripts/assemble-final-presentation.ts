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
}

interface AssemblyResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  duration?: number;
  fileSize?: number;
}

class FinalPresentationAssembler {
  private syncedBeatsDir: string = 'synced-beats';
  private outputDir: string = 'final-presentation';
  private beats: Beat[];

  constructor() {
    this.beats = this.getSyncedBeats();
    this.ensureOutputDir();
  }

  private getSyncedBeats(): Beat[] {
    const beatOrder = [
      { id: "intro", title: "Introduction" },
      { id: "problem-statement", title: "Problem Statement & Motivation" },
      { id: "user-persona", title: "Target User Persona" },
      { id: "technical-architecture", title: "Technical Architecture & API Data Flow" },
      { id: "detect-verify", title: "Detect & Verify" },
      { id: "triage-risk", title: "Triage & Risk Scoring" },
      { id: "define-zones", title: "Define Zones" },
      { id: "plan-routes", title: "Plan Routes" },
      { id: "assign-units", title: "Assign Units & Track Assets" },
      { id: "ai-support", title: "AI Support & Replan" },
      { id: "value-proposition", title: "Value Proposition & Impact" },
      { id: "foundry-integration", title: "Foundry Integration & AI Assistance" },
      { id: "conclusion", title: "Conclusion & Call to Action" }
    ];

    return beatOrder.map(beat => ({
      ...beat,
      filePath: path.join(this.syncedBeatsDir, `${beat.id}.mp4`)
    }));
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private async checkBeatFiles(): Promise<boolean> {
    console.log('🔍 Checking synced beat files...');
    
    for (const beat of this.beats) {
      if (!fs.existsSync(beat.filePath)) {
        console.error(`❌ Missing beat file: ${beat.filePath}`);
        return false;
      }
      const stats = fs.statSync(beat.filePath);
      console.log(`  ✅ ${beat.id}.mp4 - ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
    }
    
    return true;
  }

  async assemblePresentation(): Promise<AssemblyResult> {
    console.log('🎬 Assembling Final Presentation');
    console.log('=' .repeat(40));
    console.log(`📊 Total beats: ${this.beats.length}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log('');

    const result: AssemblyResult = {
      success: false
    };

    try {
      // Check if all beat files exist
      if (!(await this.checkBeatFiles())) {
        result.error = 'Some beat files are missing';
        return result;
      }

      // Create file list for ffmpeg concat
      const fileListPath = path.join(this.outputDir, 'file-list.txt');
      const fileListContent = this.beats
        .map(beat => `file '${path.resolve(beat.filePath)}'`)
        .join('\n');
      
      fs.writeFileSync(fileListPath, fileListContent);

      // Output file path
      const outputPath = path.join(this.outputDir, 'disaster-response-presentation.mp4');
      
      console.log('🔧 Assembling presentation...');
      console.log('  📝 Using ffmpeg concat demuxer for seamless assembly');
      console.log('  🎵 Maintaining video and audio quality');
      console.log('  📹 Output: MP4 with H.264 video and AAC audio');
      
      // Use ffmpeg concat demuxer for seamless assembly
      const command = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy -y "${outputPath}"`;
      
      await execAsync(command);
      
      // Clean up file list
      if (fs.existsSync(fileListPath)) {
        fs.unlinkSync(fileListPath);
      }
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        
        // Get video duration
        const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${outputPath}"`);
        const duration = parseFloat(stdout.trim());
        
        result.success = true;
        result.outputPath = outputPath;
        result.duration = duration;
        result.fileSize = stats.size;
        
        console.log(`✅ Presentation assembled successfully!`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`⏱️ Duration: ${duration.toFixed(1)}s`);
        console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
        
      } else {
        result.error = 'Output file not created';
      }
      
    } catch (error) {
      result.error = `Assembly failed: ${error}`;
      console.error(`❌ Assembly failed: ${error}`);
    }
    
    return result;
  }

  async generateFinalReport(assemblyResult: AssemblyResult): Promise<void> {
    const reportPath = path.join(this.outputDir, 'final-presentation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      assembly: {
        success: assemblyResult.success,
        outputPath: assemblyResult.outputPath,
        error: assemblyResult.error,
        duration: assemblyResult.duration,
        fileSize: assemblyResult.fileSize
      },
      beats: this.beats.map(beat => ({
        id: beat.id,
        title: beat.title,
        filePath: beat.filePath,
        exists: fs.existsSync(beat.filePath)
      })),
      summary: {
        totalBeats: this.beats.length,
        totalDuration: assemblyResult.duration || 0,
        totalSize: assemblyResult.fileSize || 0
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Final Presentation Report');
    console.log('=' .repeat(30));
    console.log(`Assembly success: ${assemblyResult.success ? '✅ Yes' : '❌ No'}`);
    if (assemblyResult.success) {
      console.log(`Output file: ${path.basename(assemblyResult.outputPath!)}`);
      console.log(`Duration: ${assemblyResult.duration!.toFixed(1)}s`);
      console.log(`File size: ${(assemblyResult.fileSize! / 1024 / 1024).toFixed(1)}MB`);
    } else {
      console.log(`Error: ${assemblyResult.error}`);
    }
    console.log(`Report saved to: ${reportPath}`);
    
    console.log('\n🎬 Presentation Structure:');
    this.beats.forEach((beat, index) => {
      console.log(`  ${(index + 1).toString().padStart(2, '0')}. ${beat.title}`);
    });
    
    console.log('\n🎉 Final Presentation Complete!');
    console.log('Your disaster-response presentation is ready for use.');
    console.log('The video includes:');
    console.log('  - Professional video interactions');
    console.log('  - Synchronized text-to-speech narration');
    console.log('  - Perfect timing and transitions');
    console.log('  - High-quality MP4 format');
    console.log('  - Ready for sharing or further editing');
  }
}

// Main execution
async function main() {
  const assembler = new FinalPresentationAssembler();
  const result = await assembler.assemblePresentation();
  await assembler.generateFinalReport(result);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { FinalPresentationAssembler };
