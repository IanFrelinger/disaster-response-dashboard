#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SlideMapping {
  slideNumber: number;
  slideTitle: string;
  audioFile: string;
  videoFile: string;
  duration: number;
}

class TTSVideoMerger {
  private projectRoot: string;
  private capturesDir: string;
  private audioDir: string;
  private outputDir: string;
  private ffmpegAvailable: boolean = false;

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
    
    this.projectRoot = path.join(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
    this.audioDir = path.join(this.projectRoot, 'audio', 'vo');
    this.outputDir = path.join(this.projectRoot, 'output', 'merged-slides');
    
    this.ensureDirectories();
    this.checkFFmpeg();
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      this.log(`📁 Created output directory: ${this.outputDir}`, 'success');
    }
  }

  private async checkFFmpeg(): Promise<void> {
    try {
      await execAsync('ffmpeg -version');
      this.ffmpegAvailable = true;
      this.log('✅ FFmpeg is available for video processing', 'success');
    } catch (error) {
      this.log('❌ FFmpeg is not available. Please install FFmpeg to merge audio and video.', 'error');
      process.exit(1);
    }
  }

  private getSlideMappings(): SlideMapping[] {
    // Define the slide mappings for 12 condensed beats based on PNG files and voice-over files
    const mappings: SlideMapping[] = [
      {
        slideNumber: 1,
        slideTitle: "Persona & Problem",
        audioFile: "01_persona_&_problem_vo.wav",
        videoFile: "01_persona_and_problem.png", // Using PNG for static slides
        duration: 30
      },
      {
        slideNumber: 2,
        slideTitle: "High-Level Architecture",
        audioFile: "02_high_level_architecture_vo.wav",
        videoFile: "02_high_level_architecture.png",
        duration: 45
      },
      {
        slideNumber: 3,
        slideTitle: "Live Hazard Map",
        audioFile: "03_live_hazard_map_vo.wav",
        videoFile: "03_live_hazard_map.png",
        duration: 30
      },
      {
        slideNumber: 4,
        slideTitle: "Exposure & Conditions",
        audioFile: "04_exposure_&_conditions_vo.wav",
        videoFile: "04_exposure_and_conditions.png",
        duration: 30
      },
      {
        slideNumber: 5,
        slideTitle: "Incident Focus",
        audioFile: "05_incident_focus_vo.wav",
        videoFile: "05_incident_focus.png",
        duration: 30
      },
      {
        slideNumber: 6,
        slideTitle: "Resource Selection",
        audioFile: "06_resource_selection_vo.wav",
        videoFile: "06_resource_selection.png",
        duration: 30
      },
      {
        slideNumber: 7,
        slideTitle: "Route Planning",
        audioFile: "07_route_planning_vo.wav",
        videoFile: "07_route_planning.png",
        duration: 30
      },
      {
        slideNumber: 8,
        slideTitle: "Route Review",
        audioFile: "08_route_review_vo.wav",
        videoFile: "08_route_review.png",
        duration: 30
      },
      {
        slideNumber: 9,
        slideTitle: "Task Assignment",
        audioFile: "09_task_assignment_vo.wav",
        videoFile: "09_task_assignment.png",
        duration: 30
      },
      {
        slideNumber: 10,
        slideTitle: "AIP Guidance",
        audioFile: "10_aip_guidance_vo.wav",
        videoFile: "10_aip_guidance.png",
        duration: 30
      },
      {
        slideNumber: 11,
        slideTitle: "Progress Tracking",
        audioFile: "11_progress_tracking_vo.wav",
        videoFile: "11_progress_tracking.png",
        duration: 30
      },
      {
        slideNumber: 12,
        slideTitle: "Conclusion & CTA",
        audioFile: "12_conclusion_&_cta_vo.wav",
        videoFile: "12_conclusion_and_cta.png",
        duration: 30
      }
    ];

    return mappings;
  }

  private async mergeAudioWithVideo(mapping: SlideMapping): Promise<void> {
    const audioPath = path.join(this.audioDir, mapping.audioFile);
    const imagePath = path.join(this.capturesDir, mapping.videoFile); // This is actually a PNG file
    const outputPath = path.join(this.outputDir, `${mapping.slideNumber.toString().padStart(2, '0')}_${mapping.slideTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`);

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
      this.log(`🎬 Merging slide ${mapping.slideNumber}: ${mapping.slideTitle}...`);

      // FFmpeg command to create video from PNG image with audio
      // -loop 1: Loop the image for the duration of the audio
      // -t: Set duration to match audio length
      // -c:v libx264: Use H.264 codec
      // -preset fast: Faster encoding with good quality
      // -crf 23: Constant Rate Factor for quality control
      // -c:a aac: Use AAC codec for audio
      // -shortest: End when shortest stream ends
      const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -t ${mapping.duration} -c:v libx264 -preset fast -crf 23 -c:a aac -shortest -y "${outputPath}"`;

      const { stdout, stderr } = await execAsync(ffmpegCommand);
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        this.log(`✅ Merged video created: ${path.basename(outputPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
      } else {
        this.log(`❌ Failed to create merged video: ${outputPath}`, 'error');
      }

    } catch (error) {
      this.log(`❌ Error merging slide ${mapping.slideNumber}: ${error}`, 'error');
    }
  }

  public async mergeAllSlides(): Promise<void> {
    try {
      this.log('🎬 Starting TTS and slide video merging process...');
      
      const mappings = this.getSlideMappings();
      this.log(`📊 Found ${mappings.length} condensed beats to merge`);

      for (const mapping of mappings) {
        await this.mergeAudioWithVideo(mapping);
      }

      this.log('✅ All slides merged successfully!');
      this.log(`📁 Output directory: ${this.outputDir}`);
      
      // List the created files
      const outputFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.mp4'));
      this.log(`📋 Created ${outputFiles.length} merged video files:`);
      outputFiles.forEach(file => {
        const stats = fs.statSync(path.join(this.outputDir, file));
        this.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      });

    } catch (error) {
      this.log(`❌ Error during merging process: ${error}`, 'error');
    }
  }
}

// Main execution
async function main() {
  const merger = new TTSVideoMerger();
  await merger.mergeAllSlides();
}

main().catch(console.error);
