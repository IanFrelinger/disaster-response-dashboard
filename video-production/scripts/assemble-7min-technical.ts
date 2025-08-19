#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

class TechnicalVideoAssembler {
  private projectRoot: string;
  private outputDir: string;
  private finalOutputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.finalOutputDir = path.join(this.projectRoot, 'output');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.finalOutputDir)) {
      fs.mkdirSync(this.finalOutputDir, { recursive: true });
    }
  }

  async createVideoList(): Promise<string> {
    const videoListPath = path.join(this.finalOutputDir, 'video_list_7min_technical.txt');
    const segments = [
      '01_personal_intro_7min.mp4',
      '02_problem_outcomes_7min.mp4',
      '03_data_architecture_7min.mp4',
      '04_live_hazard_map_7min.mp4',
      '05_exposure_conditions_7min.mp4',
      '06_incident_focus_7min.mp4',
      '07_resource_roster_7min.mp4',
      '08_route_planning_7min.mp4',
      '09_route_result_7min.mp4',
      '10_tasking_7min.mp4',
      '11_aip_guidance_7min.mp4',
      '12_ops_status_cta_7min.mp4'
    ];

    const videoListContent = segments
      .map(segment => `file '${path.join(this.outputDir, segment)}'`)
      .join('\n');

    fs.writeFileSync(videoListPath, videoListContent);
    console.log(`✅ Video list created: ${videoListPath}`);
    return videoListPath;
  }

  async assembleVideo(videoListPath: string): Promise<void> {
    const outputPath = path.join(this.finalOutputDir, 'final_7min_technical_demo.mp4');
    
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', videoListPath,
        '-c', 'copy',
        '-y',
        outputPath
      ];

      console.log('🎬 Assembling 7-minute technical video...');
      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: 'pipe' });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 7-minute technical video assembled: ${outputPath}`);
          resolve();
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateAssemblySummary(): Promise<void> {
    const summaryPath = path.join(this.finalOutputDir, '7min_technical_assembly_summary.json');
    
    const segments = [
      { id: 'personal_intro', title: 'Meet Emergency Manager Sarah Chen', duration: 30 },
      { id: 'problem_outcomes', title: 'The Challenge: Seconds Matter in Live Incidents', duration: 45 },
      { id: 'data_architecture', title: 'Data & Architecture: Real-time Integration', duration: 60 },
      { id: 'live_hazard_map', title: 'Live Hazard Map: Situational Awareness', duration: 60 },
      { id: 'exposure_conditions', title: 'Exposure & Conditions: Buildings & Weather', duration: 60 },
      { id: 'incident_focus', title: 'Incident Focus: Anchoring the Workflow', duration: 60 },
      { id: 'resource_roster', title: 'Resource Roster: Unit Management', duration: 60 },
      { id: 'route_planning', title: 'Route Planning: Tactical Profiles', duration: 60 },
      { id: 'route_result', title: 'Route Result: ETA & Distance Review', duration: 60 },
      { id: 'tasking', title: 'Tasking: Plan to Execution', duration: 60 },
      { id: 'aip_guidance', title: 'AIP Decision Support: AI Recommendations', duration: 60 },
      { id: 'ops_status_cta', title: 'Operations Status & Call to Action', duration: 60 }
    ];

    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
    const summary = {
      title: '7-Minute Technical Video Assembly Summary',
      totalDuration,
      totalDurationMinutes: (totalDuration / 60).toFixed(1),
      segmentCount: segments.length,
      segments,
      outputFile: 'final_7min_technical_demo.mp4',
      videoListFile: 'video_list_7min_technical.txt',
      assemblyDate: new Date().toISOString(),
      description: 'Comprehensive technical deep dive video demonstrating emergency management platform capabilities through a realistic workflow scenario.'
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Assembly summary created: ${summaryPath}`);
  }

  async assembleAll(): Promise<void> {
    try {
      console.log('🎬 Starting 7-minute technical video assembly...');
      
      // Create video list
      const videoListPath = await this.createVideoList();
      
      // Assemble video
      await this.assembleVideo(videoListPath);
      
      // Generate summary
      await this.generateAssemblySummary();
      
      console.log('');
      console.log('🎉 7-minute technical video assembly completed successfully!');
      console.log(`📁 Final video: ${path.join(this.finalOutputDir, 'final_7min_technical_demo.mp4')}`);
      console.log(`📊 Total duration: ${(675 / 60).toFixed(1)} minutes`);
      console.log(`🎬 Total segments: 12`);
      
    } catch (error) {
      console.error('❌ Error assembling video:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const assembler = new TechnicalVideoAssembler();
  await assembler.assembleAll();
}

main().catch(console.error);
