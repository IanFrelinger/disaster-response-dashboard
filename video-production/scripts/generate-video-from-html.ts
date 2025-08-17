#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface VideoSegment {
  name: string;
  htmlFile: string;
  duration: number;
  outputFile: string;
}

class HTMLToVideoConverter {
  private browser: any = null;
  private page: any = null;
  private projectRoot: string;
  private outputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing HTML to Video Converter...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized successfully');
  }

  async convertHTMLToVideo(segment: VideoSegment): Promise<void> {
    console.log(`🎬 Converting ${segment.name} to video...`);
    
    try {
      const htmlPath = path.join(this.projectRoot, 'captures', segment.htmlFile);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Set the HTML content
      await this.page.setContent(htmlContent);
      
      // Wait for content to render
      await this.page.waitForTimeout(1000);
      
      // Wait for the specified duration
      await this.page.waitForTimeout(segment.duration * 1000);
      
      console.log(`✅ ${segment.name} video recorded for ${segment.duration} seconds`);
      
    } catch (error) {
      console.error(`❌ Error converting ${segment.name}:`, error);
      throw error;
    }
  }

  async generateAllVideos(): Promise<void> {
    const segments: VideoSegment[] = [
      {
        name: 'Personal Introduction',
        htmlFile: 'personal_intro.html',
        duration: 15,
        outputFile: '01_personal_intro.webm'
      },
      {
        name: 'User Persona',
        htmlFile: 'user_persona.html',
        duration: 20,
        outputFile: '02_user_persona.webm'
      },
      {
        name: 'Foundry Architecture',
        htmlFile: 'foundry_architecture.html',
        duration: 30,
        outputFile: '03_foundry_architecture.webm'
      },
      {
        name: 'Action Demonstration',
        htmlFile: 'action_demonstration.html',
        duration: 30,
        outputFile: '04_action_demonstration.webm'
      },
      {
        name: 'Strong Call to Action',
        htmlFile: 'strong_cta.html',
        duration: 45,
        outputFile: '05_strong_cta.webm'
      }
    ];

    try {
      await this.initialize();
      
      console.log('🎬 Starting HTML to video conversion...');
      
      for (const segment of segments) {
        await this.convertHTMLToVideo(segment);
      }
      
      // After all segments are recorded, save them with proper names
      await this.saveRecordedVideos(segments);
      
      console.log('🎉 All videos generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating videos:', error);
    } finally {
      await this.cleanup();
    }
  }

  async saveRecordedVideos(segments: VideoSegment[]): Promise<void> {
    console.log('💾 Saving recorded videos with proper names...');
    
    try {
      // Get the recorded video file
      const videoPath = await this.page.video()?.path();
      if (!videoPath) {
        console.log('No video recorded, skipping save');
        return;
      }
      
      // For now, we'll copy the recorded video to our output directory
      // In a more sophisticated version, we could split the video by segments
      const finalPath = path.join(this.outputDir, 'complete_recording.webm');
      fs.copyFileSync(videoPath, finalPath);
      
      console.log(`✅ Complete video saved: ${finalPath}`);
      
    } catch (error) {
      console.error('Error saving recorded videos:', error);
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
  const converter = new HTMLToVideoConverter();
  await converter.generateAllVideos();
}

// Run main function
main().catch(console.error);

export { HTMLToVideoConverter };
