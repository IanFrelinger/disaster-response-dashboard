#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

interface VideoSegment {
  name: string;
  htmlFile: string;
  duration: number;
  outputFile: string;
  technicalFocus: string;
}

class TechnicalVideoGenerator {
  private browser: any = null;
  private page: any = null;
  private projectRoot: string;
  private outputDir: string;
  private tempDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.tempDir = path.join(this.projectRoot, 'temp');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing 7-Minute Technical Video Generator...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized successfully');
  }

  async generateTechnicalSegment(segment: VideoSegment): Promise<void> {
    console.log(`🎬 Generating ${segment.name} (${segment.duration}s) - ${segment.technicalFocus}`);
    
    try {
      const htmlPath = path.join(this.projectRoot, 'captures', segment.htmlFile);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Set the HTML content
      await this.page.setContent(htmlContent);
      
      // Wait for content to render
      await this.page.waitForTimeout(1000);
      
      // Take a screenshot
      const screenshotPath = path.join(this.tempDir, `${segment.name.replace(/\s+/g, '_').toLowerCase()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Convert screenshot to video using ffmpeg
      const outputPath = path.join(this.outputDir, segment.outputFile);
      await this.convertImageToVideo(screenshotPath, outputPath, segment.duration);
      
      console.log(`✅ ${segment.name} video generated: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Error generating ${segment.name}:`, error);
      throw error;
    }
  }

  async convertImageToVideo(imagePath: string, outputPath: string, duration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-loop', '1',
        '-i', imagePath,
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
        '-c:v', 'libx264',
        '-t', duration.toString(),
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: 'pipe' });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
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

  async generateAllTechnicalVideos(): Promise<void> {
    const segments: VideoSegment[] = [
      {
        name: 'Personal Introduction',
        htmlFile: 'personal_intro.html',
        duration: 20,
        outputFile: '01_personal_intro_7min.mp4',
        technicalFocus: 'Personal context and mission statement'
      },
      {
        name: 'User Persona Definition',
        htmlFile: 'user_persona.html',
        duration: 25,
        outputFile: '02_user_persona_7min.mp4',
        technicalFocus: 'Target users and their technical needs'
      },
      {
        name: 'Foundry Architecture Deep Dive',
        htmlFile: 'foundry_architecture.html',
        duration: 60,
        outputFile: '03_foundry_architecture_7min.mp4',
        technicalFocus: 'Technical architecture and data flow'
      },
      {
        name: 'Platform Capabilities Overview',
        htmlFile: 'action_demonstration.html',
        duration: 45,
        outputFile: '04_platform_capabilities_7min.mp4',
        technicalFocus: 'Core platform features and capabilities'
      },
      {
        name: 'Hazard Management System',
        htmlFile: 'action_demonstration.html',
        duration: 45,
        outputFile: '05_hazard_management_7min.mp4',
        technicalFocus: 'Dynamic zone management and risk assessment'
      },
      {
        name: 'Evacuation Routing Engine',
        htmlFile: 'action_demonstration.html',
        duration: 45,
        outputFile: '06_evacuation_routing_7min.mp4',
        technicalFocus: 'AI-powered route optimization algorithms'
      },
      {
        name: 'AI Decision Support',
        htmlFile: 'strong_cta.html',
        duration: 45,
        outputFile: '07_ai_decision_support_7min.mp4',
        technicalFocus: 'Machine learning models and decision algorithms'
      },
      {
        name: 'Technical Implementation',
        htmlFile: 'foundry_architecture.html',
        duration: 45,
        outputFile: '08_technical_implementation_7min.mp4',
        technicalFocus: 'Code architecture, APIs, and deployment'
      },
      {
        name: 'Integration Scenarios',
        htmlFile: 'user_persona.html',
        duration: 45,
        outputFile: '09_integration_scenarios_7min.mp4',
        technicalFocus: 'System integration and deployment options'
      },
      {
        name: 'Strong Technical CTA',
        htmlFile: 'strong_cta.html',
        duration: 45,
        outputFile: '10_strong_cta_7min.mp4',
        technicalFocus: 'Implementation discussion and next steps'
      }
    ];

    try {
      await this.initialize();
      
      console.log('🎬 Starting 7-minute technical video generation...');
      console.log(`📊 Total segments: ${segments.length}`);
      console.log(`⏱️  Total duration: ${segments.reduce((sum, s) => sum + s.duration, 0)} seconds (7 minutes)`);
      console.log('');
      
      for (const segment of segments) {
        await this.generateTechnicalSegment(segment);
      }
      
      console.log('');
      console.log('🎉 All 7-minute technical videos generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating technical videos:', error);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Main execution
async function main() {
  const generator = new TechnicalVideoGenerator();
  await generator.generateAllTechnicalVideos();
}

// Run main function
main().catch(console.error);

export { TechnicalVideoGenerator };
