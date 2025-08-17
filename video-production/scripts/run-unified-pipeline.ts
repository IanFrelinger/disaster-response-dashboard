#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

interface PipelineConfig {
  mode: 'static' | 'live' | 'hybrid';
  includeStatic: boolean;
  includeLive: boolean;
  liveUrl: string;
  outputFormat: 'mp4' | 'webm';
  quality: 'high' | 'medium' | 'low';
}

class UnifiedVideoPipeline {
  private projectRoot: string;
  private startTime: Date;
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.startTime = new Date();
    this.config = config;
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

  async checkPrerequisites(): Promise<boolean> {
    this.logSection('Checking Prerequisites');
    
    const checks = [
      { name: 'FFmpeg', command: 'ffmpeg -version', required: true },
      { name: 'Node.js', command: 'node --version', required: true },
      { name: 'ts-node', command: 'npx ts-node --version', required: true },
      { name: 'HTML Captures', path: path.join(this.projectRoot, 'captures'), required: this.config.includeStatic },
      { name: 'Output Directory', path: path.join(this.projectRoot, 'output'), required: false }
    ];

    let allChecksPassed = true;
    
    for (const check of checks) {
      if (check.command) {
        try {
          execSync(check.command, { stdio: 'ignore' });
          this.log(`✅ ${check.name}: Available`, 'success');
        } catch (error) {
          this.log(`❌ ${check.name}: Not available`, 'error');
          if (check.required) allChecksPassed = false;
        }
      } else if (check.path) {
        if (fs.existsSync(check.path)) {
          this.log(`✅ ${check.name}: Found`, 'success');
        } else if (check.required) {
          this.log(`❌ ${check.name}: Missing (required)`, 'error');
          allChecksPassed = false;
        } else {
          this.log(`⚠️ ${check.name}: Missing (will be created)`, 'warning');
        }
      }
    }

    return allChecksPassed;
  }

  async generateStaticSegments(): Promise<void> {
    if (!this.config.includeStatic) {
      this.log('⏭️  Skipping static segments generation', 'info');
      return;
    }

    this.logSection('Generating Static Video Segments');
    
    try {
      this.log('Running static video generation script...', 'info');
      execSync('npx ts-node scripts/generate-7min-technical.ts', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      this.log('✅ Static video segments generated successfully', 'success');
    } catch (error) {
      this.log(`Error generating static segments: ${error}`, 'error');
      throw error;
    }
  }

  async generateUIComponentMap(): Promise<void> {
    this.logSection('Generating UI Component Map for Humanizer Bot');
    
    try {
      this.log('Running UI component mapping script...', 'info');
      execSync('npx ts-node scripts/generate-ui-component-map.ts', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      this.log('✅ UI component map generated successfully', 'success');
    } catch (error) {
      this.log(`Error generating UI component map: ${error}`, 'error');
      throw error;
    }
  }

  async generateLiveSegments(): Promise<void> {
    if (!this.config.includeLive) {
      this.log('⏭️  Skipping live segments generation', 'info');
      return;
    }

    this.logSection('Generating Live Interactive Video Segments');
    
    try {
      this.log('Running live video generation script...', 'info');
      execSync('npx ts-node scripts/generate-live-video-demo.ts', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      this.log('✅ Live video segments generated successfully', 'success');
    } catch (error) {
      this.log(`Error generating live segments: ${error}`, 'error');
      throw error;
    }
  }

  async assembleFinalVideo(): Promise<void> {
    this.logSection('Assembling Final Video');
    
    try {
      let assemblyScript = 'scripts/assemble-7min-technical.ts';
      
      if (this.config.mode === 'hybrid') {
        assemblyScript = 'scripts/assemble-hybrid-demo.ts';
      } else if (this.config.mode === 'live') {
        assemblyScript = 'scripts/assemble-live-demo.ts';
      }
      
      this.log(`Running ${assemblyScript}...`, 'info');
      execSync(`npx ts-node ${assemblyScript}`, {
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
        mode: this.config.mode,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${Math.round(duration)} seconds`
      },
      configuration: {
        includeStatic: this.config.includeStatic,
        includeLive: this.config.includeLive,
        liveUrl: this.config.liveUrl,
        outputFormat: this.config.outputFormat,
        quality: this.config.quality
      },
      outputs: {
        videoSegments: path.join(this.projectRoot, 'out'),
        finalVideo: path.join(this.projectRoot, 'output', 'final_unified_demo.mp4'),
        summary: path.join(this.projectRoot, 'output', 'unified_pipeline_summary.json')
      }
    };

    const summaryPath = path.join(this.projectRoot, 'output', 'unified_pipeline_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    this.log(`Pipeline completed in ${Math.round(duration)} seconds`, 'success');
    this.log(`Final video: ${summary.outputs.finalVideo}`, 'success');
    this.log(`Pipeline summary: ${summaryPath}`, 'info');
  }

  async run(): Promise<void> {
    try {
      this.logSection('Unified Video Production Pipeline');
      this.log(`Starting ${this.config.mode} video production pipeline...`, 'info');
      this.log(`Configuration: Static=${this.config.includeStatic}, Live=${this.config.includeLive}`, 'info');
      
      // Step 1: Check prerequisites
      const prerequisitesOk = await this.checkPrerequisites();
      if (!prerequisitesOk) {
        this.log('Prerequisites check failed. Please fix the issues above and try again.', 'error');
        return;
      }
      
      // Step 2: Generate UI component map for humanizer bot
      await this.generateUIComponentMap();
      
      // Step 3: Generate static segments (if enabled)
      if (this.config.includeStatic) {
        await this.generateStaticSegments();
      }
      
      // Step 4: Generate live segments (if enabled)
      if (this.config.includeLive) {
        await this.generateLiveSegments();
      }
      
      // Step 5: Assemble final video
      await this.assembleFinalVideo();
      
      // Step 6: Generate summary
      await this.generatePipelineSummary();
      
      this.logSection('Pipeline Complete');
      this.log('🎉 Unified video production pipeline completed successfully!', 'success');
      
      if (this.config.mode === 'hybrid') {
        this.log('The hybrid demo combines static content with live interactions.', 'info');
      } else if (this.config.mode === 'live') {
        this.log('The live demo showcases real website interactions.', 'info');
      } else {
        this.log('The static demo provides consistent, controlled content.', 'info');
      }
      
    } catch (error) {
      this.log(`Pipeline failed: ${error}`, 'error');
      throw error;
    }
  }
}

// Main execution with configuration
async function main() {
  const config: PipelineConfig = {
    mode: 'hybrid', // 'static', 'live', or 'hybrid'
    includeStatic: true,
    includeLive: true,
    liveUrl: 'http://localhost:3000',
    outputFormat: 'mp4',
    quality: 'high'
  };

  const pipeline = new UnifiedVideoPipeline(config);
  await pipeline.run();
}

// Run main function
main().catch(console.error);
