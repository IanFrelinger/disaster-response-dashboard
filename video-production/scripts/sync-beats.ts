#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Beat {
  id: string;
  title: string;
  startTime: number; // Start time in seconds
  duration: number; // Duration in seconds
  audioFile: string;
}

interface SyncResult {
  beat: Beat;
  success: boolean;
  outputPath?: string;
  error?: string;
  actualDuration?: number;
}

class BeatSyncer {
  private videoFile: string;
  private audioDir: string;
  private outputDir: string;
  private beats: Beat[];

  constructor() {
    this.videoFile = this.findMainVideoFile();
    this.audioDir = 'audio';
    this.outputDir = 'synced-beats';
    this.beats = this.createBeats();
    this.ensureOutputDir();
  }

  private findMainVideoFile(): string {
    const capturesDir = 'captures';
    const files = fs.readdirSync(capturesDir);
    
    // Find the most recent WebM file (likely the main recording)
    const webmFiles = files.filter(file => file.endsWith('.webm'));
    if (webmFiles.length === 0) {
      throw new Error('No WebM video files found in captures directory');
    }
    
    // Sort by modification time and get the most recent
    const sortedFiles = webmFiles
      .map(file => ({
        name: file,
        path: path.join(capturesDir, file),
        mtime: fs.statSync(path.join(capturesDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    console.log(`📹 Using video file: ${sortedFiles[0].name}`);
    return sortedFiles[0].path;
  }

  private createBeats(): Beat[] {
    return [
      {
        id: "intro",
        title: "Introduction",
        startTime: 0,
        duration: 15,
        audioFile: "intro.aiff"
      },
      {
        id: "problem-statement",
        title: "Problem Statement & Motivation",
        startTime: 15,
        duration: 25,
        audioFile: "problem-statement.aiff"
      },
      {
        id: "user-persona",
        title: "Target User Persona",
        startTime: 40,
        duration: 15,
        audioFile: "user-persona.aiff"
      },
      {
        id: "technical-architecture",
        title: "Technical Architecture & API Data Flow",
        startTime: 55,
        duration: 30,
        audioFile: "technical-architecture.aiff"
      },
      {
        id: "detect-verify",
        title: "Detect & Verify",
        startTime: 85,
        duration: 15,
        audioFile: "detect-verify.aiff"
      },
      {
        id: "triage-risk",
        title: "Triage & Risk Scoring",
        startTime: 100,
        duration: 10,
        audioFile: "triage-risk.aiff"
      },
      {
        id: "define-zones",
        title: "Define Zones",
        startTime: 110,
        duration: 10,
        audioFile: "define-zones.aiff"
      },
      {
        id: "plan-routes",
        title: "Plan Routes",
        startTime: 120,
        duration: 20,
        audioFile: "plan-routes.aiff"
      },
      {
        id: "assign-units",
        title: "Assign Units & Track Assets",
        startTime: 140,
        duration: 10,
        audioFile: "assign-units.aiff"
      },
      {
        id: "ai-support",
        title: "AI Support & Replan",
        startTime: 150,
        duration: 20,
        audioFile: "ai-support.aiff"
      },
      {
        id: "value-proposition",
        title: "Value Proposition & Impact",
        startTime: 170,
        duration: 30,
        audioFile: "value-proposition.aiff"
      },
      {
        id: "foundry-integration",
        title: "Foundry Integration & AI Assistance",
        startTime: 200,
        duration: 20,
        audioFile: "foundry-integration.aiff"
      },
      {
        id: "conclusion",
        title: "Conclusion & Call to Action",
        startTime: 220,
        duration: 20,
        audioFile: "conclusion.aiff"
      }
    ];
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private async getVideoDuration(): Promise<number> {
    try {
      const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${this.videoFile}"`);
      return parseFloat(stdout.trim());
    } catch (error) {
      console.error('❌ Failed to get video duration:', error);
      return 240; // Default to 4 minutes
    }
  }

  async syncBeat(beat: Beat): Promise<SyncResult> {
    console.log(`\n🎬 Syncing beat: ${beat.title} (${beat.duration}s)`);
    
    const result: SyncResult = {
      beat,
      success: false
    };

    try {
      const audioPath = path.join(this.audioDir, beat.audioFile);
      const outputPath = path.join(this.outputDir, `${beat.id}.mp4`);
      
      // Check if audio file exists
      if (!fs.existsSync(audioPath)) {
        result.error = `Audio file not found: ${audioPath}`;
        return result;
      }

      // Extract video segment and sync with audio
      const startTimeStr = this.formatTime(beat.startTime);
      const durationStr = this.formatTime(beat.duration);
      
      const command = `ffmpeg -i "${this.videoFile}" -i "${audioPath}" -map 0:v -map 1:a -ss ${startTimeStr} -t ${durationStr} -c:v libx264 -c:a aac -preset fast -crf 23 -y "${outputPath}"`;
      
      console.log(`  🔧 Extracting video segment: ${startTimeStr} to ${durationStr}`);
      console.log(`  🎤 Syncing with audio: ${beat.audioFile}`);
      
      await execAsync(command);
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        result.success = true;
        result.outputPath = outputPath;
        result.actualDuration = beat.duration;
        
        console.log(`✅ Beat synced successfully: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
      } else {
        result.error = 'Output file not created';
      }
      
    } catch (error) {
      result.error = `Sync failed: ${error}`;
      console.error(`❌ Beat sync failed: ${error}`);
    }
    
    return result;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async syncAllBeats(): Promise<void> {
    console.log('🎬 Starting Beat Synchronization');
    console.log('=' .repeat(50));
    console.log(`📹 Video file: ${path.basename(this.videoFile)}`);
    console.log(`🎤 Audio directory: ${this.audioDir}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`📊 Total beats: ${this.beats.length}`);
    console.log('');

    const videoDuration = await this.getVideoDuration();
    console.log(`📹 Video duration: ${videoDuration.toFixed(1)}s`);

    const results: SyncResult[] = [];

    for (const beat of this.beats) {
      const result = await this.syncBeat(beat);
      results.push(result);
      
      if (!result.success) {
        console.log(`⚠️ Beat failed, but continuing with next beat...`);
      }
    }

    await this.generateReport(results, videoDuration);
  }

  async generateReport(results: SyncResult[], videoDuration: number): Promise<void> {
    const reportPath = path.join(this.outputDir, 'beat-sync-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      videoFile: path.basename(this.videoFile),
      videoDuration: videoDuration,
      results: results.map(r => ({
        id: r.beat.id,
        title: r.beat.title,
        startTime: r.beat.startTime,
        duration: r.beat.duration,
        audioFile: r.beat.audioFile,
        success: r.success,
        outputPath: r.outputPath,
        error: r.error,
        actualDuration: r.actualDuration
      })),
      summary: {
        totalBeats: results.length,
        successfulBeats: results.filter(r => r.success).length,
        failedBeats: results.filter(r => !r.success).length,
        totalDuration: results.reduce((sum, r) => sum + (r.actualDuration || 0), 0)
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Beat Sync Report');
    console.log('=' .repeat(25));
    console.log(`Total beats: ${report.summary.totalBeats}`);
    console.log(`Successful: ${report.summary.successfulBeats}`);
    console.log(`Failed: ${report.summary.failedBeats}`);
    console.log(`Success rate: ${((report.summary.successfulBeats / report.summary.totalBeats) * 100).toFixed(1)}%`);
    console.log(`Total duration: ${report.summary.totalDuration.toFixed(1)}s`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (report.summary.failedBeats > 0) {
      console.log('\n❌ Failed beats:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.beat.title}: ${result.error}`);
      });
    }
    
    console.log('\n🎬 Synced Beat Files:');
    results.filter(r => r.success).forEach(result => {
      console.log(`  ✅ ${result.beat.id}.mp4 - ${result.beat.title}`);
    });
    
    console.log('\n🎬 Next Steps:');
    console.log('1. Review the synced beat files in the synced-beats directory');
    console.log('2. Each file contains video + audio perfectly synchronized');
    console.log('3. Use video editing software to combine all beats into final presentation');
    console.log('4. Add transitions, graphics, or additional enhancements as needed');
  }
}

// Main execution
async function main() {
  const syncer = new BeatSyncer();
  await syncer.syncAllBeats();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BeatSyncer };
