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
}

class SimpleVideoGenerator {
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
    console.log('🚀 Initializing Simple Video Generator...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized successfully');
  }

  async generateVideoFromHTML(segment: VideoSegment): Promise<void> {
    console.log(`🎬 Generating ${segment.name} video...`);
    
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

  async generateAllVideos(): Promise<void> {
    const segments: VideoSegment[] = [
      {
        name: 'Personal Introduction',
        htmlFile: 'personal_intro.html',
        duration: 15,
        outputFile: '01_personal_intro.mp4'
      },
      {
        name: 'User Persona',
        htmlFile: 'user_persona.html',
        duration: 20,
        outputFile: '02_user_persona.mp4'
      },
      {
        name: 'Foundry Architecture',
        htmlFile: 'foundry_architecture.html',
        duration: 30,
        outputFile: '03_foundry_architecture.mp4'
      },
      {
        name: 'Action Demonstration',
        htmlFile: 'action_demonstration.html',
        duration: 30,
        outputFile: '04_action_demonstration.mp4'
      },
      {
        name: 'Strong Call to Action',
        htmlFile: 'strong_cta.html',
        duration: 45,
        outputFile: '05_strong_cta.mp4'
      }
    ];

    try {
      await this.initialize();
      
      console.log('🎬 Starting video generation...');
      
      for (const segment of segments) {
        await this.generateVideoFromHTML(segment);
      }
      
      console.log('🎉 All videos generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating videos:', error);
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
  const generator = new SimpleVideoGenerator();
  await generator.generateAllVideos();
}

// Run main function
main().catch(console.error);

export { SimpleVideoGenerator };
