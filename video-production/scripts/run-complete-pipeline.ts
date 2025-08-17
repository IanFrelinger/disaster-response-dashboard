#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

class CompleteVideoPipeline {
  private projectRoot: string;
  private startTime: Date;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.startTime = new Date();
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

  private logSection(title: string): void {
    console.log('\n' + '='.repeat(60));
    console.log(`🎬 ${title}`);
    console.log('='.repeat(60));
  }

  private logProgress(current: number, total: number, description: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(`[${progressBar}] ${percentage}% - ${description}`);
  }

  async checkPrerequisites(): Promise<boolean> {
    this.logSection('Checking Prerequisites');
    
    const checks = [
      { name: 'HTML Captures', path: path.join(this.projectRoot, 'captures'), required: true },
      { name: 'Output Directory', path: path.join(this.projectRoot, 'output'), required: false },
      { name: 'Out Directory', path: path.join(this.projectRoot, 'out'), required: false }
    ];

    let allChecksPassed = true;
    
    for (const check of checks) {
      if (fs.existsSync(check.path)) {
        this.log(`✅ ${check.name}: Found`, 'success');
      } else if (check.required) {
        this.log(`❌ ${check.name}: Missing (required)`, 'error');
        allChecksPassed = false;
      } else {
        this.log(`⚠️ ${check.name}: Missing (will be created)`, 'warning');
      }
    }

    // Check for ffmpeg
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      this.log('✅ FFmpeg: Available', 'success');
    } catch (error) {
      this.log('❌ FFmpeg: Not available (required for video assembly)', 'error');
      this.log('Please install FFmpeg: https://ffmpeg.org/download.html', 'warning');
      allChecksPassed = false;
    }

    return allChecksPassed;
  }

  async generateVideoSegments(): Promise<void> {
    this.logSection('Generating Video Segments from HTML');
    
    try {
      // Run the generate-video-simple script directly
      this.log('Running video generation script...', 'info');
      execSync('npx ts-node scripts/generate-video-simple.ts', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      this.log('✅ Video segments generated successfully', 'success');
    } catch (error) {
      this.log(`Error generating video segments: ${error}`, 'error');
      throw error;
    }
  }

  async assembleFinalVideo(): Promise<void> {
    this.logSection('Assembling Final Video');
    
    try {
      // Run the assemble-final-video script directly
      this.log('Running video assembly script...', 'info');
      execSync('npx ts-node scripts/assemble-final-video.ts', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      this.log('✅ Final video assembled successfully', 'success');
    } catch (error) {
      this.log(`Error assembling final video: ${error}`, 'error');
      throw error;
    }
  }

  async generatePipelineSummary(): Promise<void> {
    this.logSection('Pipeline Summary');
    
    const endTime = new Date();
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000;
    
    const summary = {
      pipeline: {
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${Math.round(duration)} seconds`
      },
      outputs: {
        videoSegments: path.join(this.projectRoot, 'out'),
        finalVideo: path.join(this.projectRoot, 'output', 'final_enhanced_demo.mp4'),
        summary: path.join(this.projectRoot, 'output', 'video_assembly_summary.json')
      },
      segments: [
        { name: 'Personal Introduction', duration: '15s' },
        { name: 'User Persona', duration: '20s' },
        { name: 'Foundry Architecture', duration: '30s' },
        { name: 'Action Demonstration', duration: '30s' },
        { name: 'Strong Call to Action', duration: '45s' }
      ],
      totalDuration: '2 minutes 20 seconds'
    };

    const summaryPath = path.join(this.projectRoot, 'output', 'pipeline_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    this.log(`Pipeline completed in ${Math.round(duration)} seconds`, 'success');
    this.log(`Final video: ${summary.outputs.finalVideo}`, 'success');
    this.log(`Total duration: ${summary.totalDuration}`, 'success');
    this.log(`Pipeline summary: ${summaryPath}`, 'info');
  }

  async run(): Promise<void> {
    try {
      this.logSection('Disaster Response Video Production Pipeline');
      this.log('Starting complete video production pipeline...', 'info');
      
      // Step 1: Check prerequisites
      const prerequisitesOk = await this.checkPrerequisites();
      if (!prerequisitesOk) {
        this.log('Prerequisites check failed. Please fix the issues above and try again.', 'error');
        return;
      }
      
      this.logProgress(1, 4, 'Prerequisites check completed');
      
      // Step 2: Generate video segments
      await this.generateVideoSegments();
      this.logProgress(2, 4, 'Video segments generated');
      
      // Step 3: Assemble final video
      await this.assembleFinalVideo();
      this.logProgress(3, 4, 'Final video assembled');
      
      // Step 4: Generate summary
      await this.generatePipelineSummary();
      this.logProgress(4, 4, 'Pipeline summary generated');
      
      this.logSection('Pipeline Complete');
      this.log('🎉 Video production pipeline completed successfully!', 'success');
      this.log('The enhanced demo video is ready for use.', 'info');
      
    } catch (error) {
      this.log(`Pipeline failed: ${error}`, 'error');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const pipeline = new CompleteVideoPipeline();
  await pipeline.run();
}

// Run main function
main().catch(console.error);

export { CompleteVideoPipeline };
