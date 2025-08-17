#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

interface VideoSegment {
  name: string;
  file: string;
  duration: number;
  technicalFocus: string;
}

class TechnicalVideoAssembler {
  private projectRoot: string;
  private inputDir: string;
  private outputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.inputDir = path.join(this.projectRoot, 'out');
    this.outputDir = path.join(this.projectRoot, 'output');
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} [${timestamp}] ${message}`);
  }

  async checkVideoFiles(): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = [
      { name: 'Personal Introduction', file: '01_personal_intro_7min.mp4', duration: 20, technicalFocus: 'Personal context and mission statement' },
      { name: 'User Persona Definition', file: '02_user_persona_7min.mp4', duration: 25, technicalFocus: 'Target users and their technical needs' },
      { name: 'Foundry Architecture Deep Dive', file: '03_foundry_architecture_7min.mp4', duration: 60, technicalFocus: 'Technical architecture and data flow' },
      { name: 'Platform Capabilities Overview', file: '04_platform_capabilities_7min.mp4', duration: 45, technicalFocus: 'Core platform features and capabilities' },
      { name: 'Hazard Management System', file: '05_hazard_management_7min.mp4', duration: 45, technicalFocus: 'Dynamic zone management and risk assessment' },
      { name: 'Evacuation Routing Engine', file: '06_evacuation_routing_7min.mp4', duration: 45, technicalFocus: 'AI-powered route optimization algorithms' },
      { name: 'AI Decision Support', file: '07_ai_decision_support_7min.mp4', duration: 45, technicalFocus: 'Machine learning models and decision algorithms' },
      { name: 'Technical Implementation', file: '08_technical_implementation_7min.mp4', duration: 45, technicalFocus: 'Code architecture, APIs, and deployment' },
      { name: 'Integration Scenarios', file: '09_integration_scenarios_7min.mp4', duration: 45, technicalFocus: 'System integration and deployment options' },
      { name: 'Strong Technical CTA', file: '10_strong_cta_7min.mp4', duration: 45, technicalFocus: 'Implementation discussion and next steps' }
    ];

    const availableSegments: VideoSegment[] = [];
    
    for (const segment of segments) {
      const filePath = path.join(this.inputDir, segment.file);
      if (fs.existsSync(filePath)) {
        availableSegments.push(segment);
        this.log(`Found video segment: ${segment.name} (${segment.duration}s)`, 'success');
      } else {
        this.log(`Missing video segment: ${segment.name} (${segment.file})`, 'warning');
      }
    }

    return availableSegments;
  }

  async createVideoListFile(segments: VideoSegment[]): Promise<string> {
    const listFilePath = path.join(this.outputDir, 'video_list_7min_technical.txt');
    const lines = segments.map(segment => `file '${path.join(this.inputDir, segment.file)}'`);
    
    fs.writeFileSync(listFilePath, lines.join('\n'));
    this.log(`Created video list file: ${listFilePath}`, 'info');
    
    return listFilePath;
  }

  async assembleTechnicalVideo(segments: VideoSegment[], listFilePath: string): Promise<void> {
    if (segments.length === 0) {
      this.log('No video segments available for assembly', 'error');
      return;
    }

    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
    this.log(`Assembling ${segments.length} technical video segments (total duration: ${totalDuration}s)`, 'info');

    const outputPath = path.join(this.outputDir, 'final_7min_technical_demo.mp4');
    
    try {
      // Use ffmpeg to concatenate videos
      const ffmpegCommand = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', listFilePath,
        '-c', 'copy',
        '-y', // Overwrite output file
        outputPath
      ].join(' ');

      this.log(`Running ffmpeg command: ${ffmpegCommand}`, 'info');
      
      execSync(ffmpegCommand, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      this.log(`✅ 7-minute technical video assembled successfully: ${outputPath}`, 'success');
      this.log(`📊 Video details:`, 'info');
      this.log(`   - Total segments: ${segments.length}`, 'info');
      this.log(`   - Total duration: ${totalDuration} seconds (${Math.round(totalDuration/60*10)/10} minutes)`, 'info');
      this.log(`   - Output file: ${outputPath}`, 'info');

    } catch (error) {
      this.log(`Error assembling technical video: ${error}`, 'error');
      throw error;
    }
  }

  async generateTechnicalSummary(segments: VideoSegment[]): Promise<void> {
    const summary = {
      generatedAt: new Date().toISOString(),
      videoType: '7-Minute Technical Deep Dive',
      totalSegments: segments.length,
      totalDuration: segments.reduce((sum, segment) => sum + segment.duration, 0),
      segments: segments.map(segment => ({
        name: segment.name,
        file: segment.file,
        duration: segment.duration,
        technicalFocus: segment.technicalFocus
      })),
      outputFiles: {
        finalVideo: 'final_7min_technical_demo.mp4',
        videoList: 'video_list_7min_technical.txt'
      },
      technicalHighlights: [
        'Personal introduction and mission statement',
        'User persona definition and technical requirements',
        'Foundry platform architecture deep dive',
        'Platform capabilities and feature overview',
        'Hazard management system details',
        'Evacuation routing algorithms',
        'AI decision support systems',
        'Technical implementation details',
        'Integration scenarios and deployment',
        'Strong technical call-to-action'
      ]
    };

    const summaryPath = path.join(this.outputDir, '7min_technical_assembly_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    this.log(`Generated technical assembly summary: ${summaryPath}`, 'success');
  }

  async run(): Promise<void> {
    try {
      this.log('🎬 Starting 7-minute technical video assembly process...', 'info');
      
      // Check available video files
      const segments = await this.checkVideoFiles();
      
      if (segments.length === 0) {
        this.log('No video segments found. Please run the 7-minute technical video generator first.', 'error');
        return;
      }

      // Create video list file for ffmpeg
      const listFilePath = await this.createVideoListFile(segments);
      
      // Assemble the final technical video
      await this.assembleTechnicalVideo(segments, listFilePath);
      
      // Generate technical summary
      await this.generateTechnicalSummary(segments);
      
      this.log('🎉 7-minute technical video assembly process completed successfully!', 'success');
      
    } catch (error) {
      this.log(`Error in technical video assembly process: ${error}`, 'error');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const assembler = new TechnicalVideoAssembler();
  await assembler.run();
}

// Run main function
main().catch(console.error);

export { TechnicalVideoAssembler };
