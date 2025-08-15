#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as yaml from 'js-yaml';

const execAsync = promisify(exec);

interface Scene {
  id: string;
  title: string;
  duration: number;
  narration: string;
  voice?: string;
  emphasis?: string;
}

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

class ElevenLabsBeatSyncer {
  private videoFile: string;
  private audioDir: string;
  private outputDir: string;
  private beats: Beat[];
  private narrationConfig: any;

  constructor() {
    this.videoFile = this.findMainVideoFile();
    this.audioDir = 'audio/vo';
    this.outputDir = 'synced-beats';
    this.narrationConfig = this.loadNarrationConfig();
    this.beats = this.createBeatsFromNarration();
    this.ensureOutputDir();
  }

  private loadNarrationConfig(): any {
    try {
      const configPath = 'narration.yaml';
      const configContent = fs.readFileSync(configPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      console.error('❌ Failed to load narration config:', error);
      throw error;
    }
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

  private createBeatsFromNarration(): Beat[] {
    // Use the correct timing from Video presentation plan.pdf
    const correctTiming = [
      { id: "intro", title: "Introduction", startTime: 0, duration: 15 },
      { id: "problem-statement", title: "Problem Statement & Motivation", startTime: 15, duration: 25 },
      { id: "user-persona", title: "Target User Persona", startTime: 40, duration: 15 },
      { id: "technical-architecture", title: "Technical Architecture & API Data Flow", startTime: 55, duration: 30 },
      { id: "detect-verify", title: "Detect & Verify", startTime: 85, duration: 15 },
      { id: "triage-risk", title: "Triage & Risk Scoring", startTime: 100, duration: 10 },
      { id: "define-zones", title: "Define Zones", startTime: 110, duration: 10 },
      { id: "plan-routes", title: "Plan Routes", startTime: 120, duration: 20 },
      { id: "assign-units", title: "Assign Units & Track Assets", startTime: 140, duration: 10 },
      { id: "ai-support", title: "AI Support & Replan", startTime: 150, duration: 20 },
      { id: "value-proposition", title: "Value Proposition & Impact", startTime: 170, duration: 30 },
      { id: "foundry-integration", title: "Foundry Integration & AI Assistance", startTime: 200, duration: 20 },
      { id: "conclusion", title: "Conclusion & Call to Action", startTime: 220, duration: 20 }
    ];
    
    return correctTiming.map((timing, index) => {
      const beat: Beat = {
        id: timing.id,
        title: timing.title,
        startTime: timing.startTime,
        duration: timing.duration,
        audioFile: this.getActualAudioFileName(index + 1, timing.id, timing.title)
      };
      
      return beat;
    });
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private getActualAudioFileName(index: number, id: string, title: string): string {
    // Map the correct file names based on what was actually generated
    const fileMap: { [key: string]: string } = {
      'intro': 'shot-01-intro-introduction.wav',
      'problem-statement': 'shot-02-problem-statement-problem-statement--motivation.wav',
      'user-persona': 'shot-03-user-persona-target-user-persona.wav',
      'technical-architecture': 'shot-04-technical-architecture-technical-architecture--api-data-flow.wav',
      'detect-verify': 'shot-05-detect-verify-detect--verify.wav',
      'triage-risk': 'shot-06-triage-risk-triage--risk-scoring.wav',
      'define-zones': 'shot-07-define-zones-define-zones.wav',
      'plan-routes': 'shot-08-plan-routes-plan-routes.wav',
      'assign-units': 'shot-09-assign-units-assign-units--track-assets.wav',
      'ai-support': 'shot-10-ai-support-ai-support--replan.wav',
      'value-proposition': 'shot-11-value-proposition-value-proposition--impact.wav',
      'foundry-integration': 'shot-12-foundry-integration-foundry-integration--ai-assistance.wav',
      'conclusion': 'shot-13-conclusion-conclusion--call-to-action.wav'
    };
    
    return fileMap[id] || `shot-${index.toString().padStart(2, '0')}-${id}-${title.toLowerCase().replace(/\s+/g, '-')}.wav`;
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

      // Get actual audio duration
      const { stdout: audioDuration } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`);
      const actualAudioDuration = parseFloat(audioDuration.trim());
      
      // Use the longer of planned duration or actual audio duration
      const syncDuration = Math.max(beat.duration, actualAudioDuration);
      
      // Extract video segment and sync with audio
      const startTimeStr = this.formatTime(beat.startTime);
      const durationStr = this.formatTime(syncDuration);
      
      const command = `ffmpeg -i "${this.videoFile}" -i "${audioPath}" -map 0:v -map 1:a -ss ${startTimeStr} -t ${durationStr} -c:v libx264 -c:a aac -preset fast -crf 23 -y "${outputPath}"`;
      
      console.log(`  🔧 Extracting video segment: ${startTimeStr} to ${durationStr}`);
      console.log(`  🎤 Syncing with audio: ${beat.audioFile}`);
      console.log(`  ⏱️  Audio duration: ${actualAudioDuration.toFixed(2)}s`);
      
      await execAsync(command);
      
      // Verify output file was created
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          result.success = true;
          result.outputPath = outputPath;
          result.actualDuration = syncDuration;
          console.log(`  ✅ Beat synced successfully: ${outputPath}`);
        } else {
          result.error = 'Output file is empty';
        }
      } else {
        result.error = 'Output file was not created';
      }
      
    } catch (error) {
      result.error = `FFmpeg error: ${error}`;
      console.error(`  ❌ Error syncing beat: ${error}`);
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
    console.log('🎬 ElevenLabs Beat Synchronization');
    console.log('=' .repeat(50));
    console.log(`📹 Video file: ${path.basename(this.videoFile)}`);
    console.log(`🎤 Audio directory: ${this.audioDir}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`📊 Total beats: ${this.beats.length}`);
    console.log('');

    const videoDuration = await this.getVideoDuration();
    console.log(`📹 Video duration: ${videoDuration.toFixed(2)}s`);
    console.log('');

    const results: SyncResult[] = [];
    let totalDuration = 0;

    for (const beat of this.beats) {
      const result = await this.syncBeat(beat);
      results.push(result);
      
      if (result.success && result.actualDuration) {
        totalDuration += result.actualDuration;
      }
    }

    // Generate report
    await this.generateReport(results, videoDuration, totalDuration);
  }

  async generateReport(results: SyncResult[], videoDuration: number, totalDuration: number): Promise<void> {
    const reportPath = path.join(this.outputDir, 'beat-sync-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      videoFile: path.basename(this.videoFile),
      videoDuration: videoDuration,
      totalBeats: results.length,
      successfulBeats: results.filter(r => r.success).length,
      failedBeats: results.filter(r => !r.success).length,
      totalSyncedDuration: totalDuration,
      results: results.map(r => ({
        id: r.beat.id,
        title: r.beat.title,
        startTime: r.beat.startTime,
        plannedDuration: r.beat.duration,
        actualDuration: r.actualDuration,
        success: r.success,
        outputPath: r.outputPath,
        error: r.error
      }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Beat Synchronization Report');
    console.log('=' .repeat(40));
    console.log(`Total beats: ${report.totalBeats}`);
    console.log(`Successful: ${report.successfulBeats}`);
    console.log(`Failed: ${report.failedBeats}`);
    console.log(`Success rate: ${((report.successfulBeats / report.totalBeats) * 100).toFixed(1)}%`);
    console.log(`Total synced duration: ${totalDuration.toFixed(2)}s`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (report.failedBeats > 0) {
      console.log('\n❌ Failed beat synchronizations:');
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
    console.log('2. Each file contains video + ElevenLabs audio perfectly synchronized');
    console.log('3. Use video editing software to combine all beats into final presentation');
    console.log('4. Add transitions, graphics, or additional enhancements as needed');
  }
}

// Main execution
async function main() {
  try {
    const syncer = new ElevenLabsBeatSyncer();
    await syncer.syncAllBeats();
  } catch (error) {
    console.error('❌ Beat synchronization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ElevenLabsBeatSyncer };
