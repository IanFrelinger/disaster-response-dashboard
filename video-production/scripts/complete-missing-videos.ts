#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VideoSegment {
  slideNumber: number;
  slideTitle: string;
  slideFile: string;
  audioFile: string;
  duration: number;
}

class MissingVideoCompleter {
  private projectRoot: string;
  private capturesDir: string;
  private audioDir: string;
  private outputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
    this.audioDir = path.join(this.projectRoot, 'audio', 'vo');
    this.outputDir = path.join(this.projectRoot, 'output', 'unified-demo');
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

  private getMissingSegments(): VideoSegment[] {
    // These are the segments that need to be completed
    return [
      {
        slideNumber: 5,
        slideTitle: "API Surface → Frontend",
        slideFile: "insert1_slice_c_api_surface.png",
        audioFile: "05_api_surface__frontend_vo.wav",
        duration: 25
      },
      {
        slideNumber: 6,
        slideTitle: "Emergency Units Panel",
        slideFile: "03_emergency_units_panel.png",
        audioFile: "06_emergency_units_panel_vo.wav",
        duration: 30
      },
      {
        slideNumber: 7,
        slideTitle: "Route Optimization",
        slideFile: "04_route_optimization.png",
        audioFile: "07_route_optimization_vo.wav",
        duration: 40
      },
      {
        slideNumber: 8,
        slideTitle: "AIP Decision Support",
        slideFile: "05_aip_decision_support.png",
        audioFile: "08_aip_decision_support_vo.wav",
        duration: 35
      },
      {
        slideNumber: 9,
        slideTitle: "Building Evacuation Tracker",
        slideFile: "06_building_evacuation_tracker.png",
        audioFile: "09_building_evacuation_tracker_vo.wav",
        duration: 30
      },
      {
        slideNumber: 10,
        slideTitle: "Request Lifecycle",
        slideFile: "insert2_request_lifecycle.png",
        audioFile: "10_request_lifecycle_vo.wav",
        duration: 30
      },
      {
        slideNumber: 11,
        slideTitle: "Analytics Dashboard",
        slideFile: "07_analytics_dashboard.png",
        audioFile: "11_analytics_dashboard_vo.wav",
        duration: 30
      }
    ];
  }

  private async mergeAudioWithVideo(segment: VideoSegment): Promise<void> {
    const imagePath = path.join(this.capturesDir, segment.slideFile);
    const audioPath = path.join(this.audioDir, segment.audioFile);
    const outputPath = path.join(this.outputDir, `${segment.slideNumber.toString().padStart(2, '0')}_${segment.slideTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`);

    // Check if files exist
    if (!fs.existsSync(audioPath)) {
      this.log(`❌ Audio file not found: ${audioPath}`, 'error');
      return;
    }

    if (!fs.existsSync(imagePath)) {
      this.log(`❌ Image file not found: ${imagePath}`, 'error');
      return;
    }

    try {
      this.log(`🎬 Merging slide ${segment.slideNumber}: ${segment.slideTitle}...`);

      // FFmpeg command to create video from PNG image with audio
      const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -t ${segment.duration} -c:v libx264 -preset fast -crf 23 -c:a aac -shortest -y "${outputPath}"`;

      const { stdout, stderr } = await execAsync(ffmpegCommand);
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        this.log(`✅ Merged video created: ${path.basename(outputPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
      } else {
        this.log(`❌ Failed to create merged video: ${outputPath}`, 'error');
      }

    } catch (error) {
      this.log(`❌ Error merging slide ${segment.slideNumber}: ${error}`, 'error');
    }
  }

  public async completeMissingVideos(): Promise<void> {
    try {
      this.log('🎬 Starting completion of missing video segments...');
      
      const missingSegments = this.getMissingSegments();
      this.log(`📊 Found ${missingSegments.length} segments to complete`);

      for (const segment of missingSegments) {
        await this.mergeAudioWithVideo(segment);
      }

      this.log('✅ All missing video segments completed!');
      
      // List all video files
      const outputFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.mp4'));
      this.log(`📋 Total video files: ${outputFiles.length}`);
      outputFiles.forEach(file => {
        const stats = fs.statSync(path.join(this.outputDir, file));
        this.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      });

    } catch (error) {
      this.log(`❌ Error completing missing videos: ${error}`, 'error');
    }
  }
}

// Main execution
async function main() {
  const completer = new MissingVideoCompleter();
  await completer.completeMissingVideos();
}

main().catch(console.error);
