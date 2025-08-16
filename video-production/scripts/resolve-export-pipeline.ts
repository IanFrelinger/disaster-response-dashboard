import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ResolveExportPipeline {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private resolveAssetsDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.resolveAssetsDir = path.join(__dirname, '..', 'resolve-export');
    
    // Create resolve export directory
    if (!fs.existsSync(this.resolveAssetsDir)) {
      fs.mkdirSync(this.resolveAssetsDir, { recursive: true });
    }
    
    // Create subdirectories for organized export
    const subdirs = ['video', 'audio', 'graphics', 'project'];
    subdirs.forEach(dir => {
      const fullPath = path.join(this.resolveAssetsDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async exportForResolve() {
    console.log('🎬 Resolve Export Pipeline - Option A');
    console.log('📹 Exporting assets for Resolve finishing...');
    
    try {
      await this.initializeBrowser();
      await this.recordRoughCut();
      await this.exportGraphics();
      await this.exportAudio();
      await this.createResolveProject();
      await this.generateExportSummary();
      
      console.log('✅ Resolve export pipeline completed!');
      console.log('🎬 Ready for Resolve import and finishing');
      
    } catch (error) {
      console.error('❌ Error during Resolve export:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser for recording...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: path.join(this.resolveAssetsDir, 'video'),
        size: { width: 1920, height: 1080 }
      }
    });
    
    console.log('✅ Browser initialized for recording');
  }

  private async recordRoughCut() {
    console.log('📹 Recording rough cut for Resolve...');
    
    // Load the recorder-ready timeline configuration
    const recordConfigPath = path.join(__dirname, '..', 'record.config.json');
    const ttsCueSheetPath = path.join(__dirname, '..', 'tts-cue-sheet.json');
    
    if (!fs.existsSync(recordConfigPath) || !fs.existsSync(ttsCueSheetPath)) {
      throw new Error('Missing required configuration files for recording');
    }
    
    const recordConfig = JSON.parse(fs.readFileSync(recordConfigPath, 'utf8'));
    const ttsCueSheet = JSON.parse(fs.readFileSync(ttsCueSheetPath, 'utf8'));
    
    console.log(`🎬 Recording ${recordConfig.beats.length} beats for rough cut...`);
    
    for (let i = 0; i < recordConfig.beats.length; i++) {
      const beat = recordConfig.beats[i];
      const ttsCue = ttsCueSheet.beats.find((b: any) => b.id === beat.id);
      
      console.log(`🎬 Recording beat ${i + 1}/${recordConfig.beats.length}: ${beat.id} (${beat.duration}s)`);
      console.log(`🎤 Narration: ${ttsCue?.text || 'No narration'}`);
      
      try {
        await this.executeBeat(beat, this.page!);
        console.log(`✅ Beat ${beat.id} recorded successfully`);
      } catch (error) {
        console.error(`❌ Error recording beat ${beat.id}:`, error);
      }
    }
  }

  private async executeBeat(beat: any, page: Page) {
    // Execute each action in the beat
    for (const action of beat.actions) {
      await this.executeAction(action, page);
    }
  }

  private async executeAction(action: string, page: Page) {
    // Parse action string and execute accordingly
    if (action.startsWith('goto(')) {
      const url = action.match(/goto\(([^)]+)\)/)?.[1];
      if (url === 'APP_URL') {
        await page.goto('http://localhost:3000');
      }
    } else if (action.startsWith('waitForSelector(')) {
      const selector = action.match(/waitForSelector\(([^)]+)\)/)?.[1];
      if (selector) {
        await page.waitForSelector(selector);
      }
    } else if (action.startsWith('click(')) {
      const selector = action.match(/click\(([^)]+)\)/)?.[1];
      if (selector) {
        await page.click(selector);
      }
    } else if (action.startsWith('wait(')) {
      const ms = parseInt(action.match(/wait\(([^)]+)\)/)?.[1] || '1000');
      await page.waitForTimeout(ms);
    } else if (action.startsWith('mouseMove(')) {
      const coordsMatch = action.match(/mouseMove\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 2) {
          await page.mouse.move(coords[0], coords[1]);
        }
      }
    } else if (action.startsWith('mouseClick(')) {
      const coordsMatch = action.match(/mouseClick\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 2) {
          await page.mouse.click(coords[0], coords[1]);
        }
      }
    } else if (action.startsWith('mouseDrag(')) {
      const coordsMatch = action.match(/mouseDrag\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 4) {
          await page.mouse.move(coords[0], coords[1]);
          await page.mouse.down();
          await page.mouse.move(coords[2], coords[3]);
          await page.mouse.up();
        }
      }
    } else if (action.startsWith('wheel(')) {
      const delta = parseInt(action.match(/wheel\(([^)]+)\)/)?.[1] || '0');
      await page.mouse.wheel(0, delta);
    } else if (action.startsWith('screenshot(')) {
      const pathMatch = action.match(/screenshot\(([^)]+)\)/)?.[1];
      if (pathMatch) {
        const screenshotPath = pathMatch.replace(/"/g, '');
        await page.screenshot({ path: screenshotPath });
      }
    } else if (action.startsWith('overlay(')) {
      console.log(`🎨 Overlay action: ${action}`);
      await page.waitForTimeout(500);
    }
  }

  private async exportGraphics() {
    console.log('🎨 Exporting graphics for Resolve...');
    
    const graphicsDir = path.join(this.resolveAssetsDir, 'graphics');
    const assetsDir = path.join(__dirname, '..', 'assets');
    
    // Copy all graphics assets
    const copyGraphics = async (sourceDir: string, targetDir: string) => {
      if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        for (const file of files) {
          const sourcePath = path.join(sourceDir, file);
          const targetPath = path.join(targetDir, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`📁 Copied: ${file}`);
          }
        }
      }
    };
    
    // Copy slides, diagrams, and art
    await copyGraphics(path.join(assetsDir, 'slides'), graphicsDir);
    await copyGraphics(path.join(assetsDir, 'diagrams'), graphicsDir);
    await copyGraphics(path.join(assetsDir, 'art'), graphicsDir);
    
    // Copy any SVG files
    const svgFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.svg'));
    for (const svgFile of svgFiles) {
      const sourcePath = path.join(assetsDir, svgFile);
      const targetPath = path.join(graphicsDir, svgFile);
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`📁 Copied SVG: ${svgFile}`);
    }
    
    console.log('✅ Graphics exported for Resolve');
  }

  private async exportAudio() {
    console.log('🎵 Exporting audio for Resolve...');
    
    const audioDir = path.join(this.resolveAssetsDir, 'audio');
    const sourceAudioDir = path.join(this.outputDir, 'audio');
    
    if (fs.existsSync(sourceAudioDir)) {
      const audioFiles = fs.readdirSync(sourceAudioDir);
      for (const audioFile of audioFiles) {
        const sourcePath = path.join(sourceAudioDir, audioFile);
        const targetPath = path.join(audioDir, audioFile);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`🎵 Copied audio: ${audioFile}`);
      }
    }
    
    // Also copy any existing TTS WAV files if they exist
    const ttsDir = path.join(__dirname, '..', 'resolve-export', 'audio');
    if (fs.existsSync(ttsDir)) {
      const ttsFiles = fs.readdirSync(ttsDir).filter(file => file.endsWith('.wav'));
      for (const ttsFile of ttsFiles) {
        const sourcePath = path.join(ttsDir, ttsFile);
        const targetPath = path.join(audioDir, ttsFile);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`🎵 Copied TTS: ${ttsFile}`);
      }
    }
    
    console.log('✅ Audio exported for Resolve');
  }

  private async createResolveProject() {
    console.log('🎬 Creating Resolve project file...');
    
    const projectDir = path.join(this.resolveAssetsDir, 'project');
    
    // Create a basic Resolve project structure
    const resolveProject = {
      name: 'Disaster Response Dashboard Demo',
      version: '18.0',
      timeline: {
        name: 'Demo Timeline',
        frameRate: 30,
        resolution: '1920x1080',
        audioSampleRate: 48000
      },
      media: {
        video: './video/',
        audio: './audio/',
        graphics: './graphics/'
      },
      settings: {
        colorSpace: 'Rec.709',
        gamma: '2.4',
        audioFormat: 'WAV',
        audioChannels: 2
      }
    };
    
    const projectPath = path.join(projectDir, 'resolve-project.json');
    fs.writeFileSync(projectPath, JSON.stringify(resolveProject, null, 2));
    
    // Create import guide
    const importGuide = `# Resolve Import Guide

## Step 1: Import Assets
1. Open DaVinci Resolve
2. Create new project: "Disaster Response Dashboard Demo"
3. Import the following:
   - Video: ./video/ (rough cut MP4)
   - Audio: ./audio/ (TTS WAV files)
   - Graphics: ./graphics/ (PNG/SVG assets)

## Step 2: Timeline Setup
1. Create new timeline: 1920x1080, 30fps
2. Import rough cut video to timeline
3. Add audio tracks for TTS narration
4. Add graphics tracks for overlays

## Step 3: Audio Pass (Fairlight)
- Dialogue Leveler: Light
- Voice Isolation: ≤ 30%
- Loudness: -16 LUFS
- Music track: Side-chain duck -6 to -9 dB under VO

## Step 4: Graphics Pass
- Place lower-thirds/callouts
- Animate 200-300ms ease
- Position graphics strategically

## Step 5: Color Pass
- Small S-curve
- Slight saturation bump (105-110%)
- Optional neutral LUT

## Step 6: Export Settings
- Format: H.264
- Bitrate: 16-24 Mbps
- Keyframe distance: 60
- Resolution: 1920x1080
- Frame rate: 30fps

## File Structure
\`\`\`
resolve-export/
├── video/          # Rough cut MP4
├── audio/          # TTS WAV files
├── graphics/       # PNG/SVG assets
└── project/        # Project files
\`\`\`
`;
    
    const guidePath = path.join(projectDir, 'IMPORT_GUIDE.md');
    fs.writeFileSync(guidePath, importGuide);
    
    console.log('✅ Resolve project files created');
  }

  private async generateExportSummary() {
    console.log('📋 Generating export summary...');
    
    const summary = {
      exportDate: new Date().toISOString(),
      pipeline: 'Option A - Resolve Finishing',
      assets: {
        video: {
          count: 0,
          files: []
        },
        audio: {
          count: 0,
          files: []
        },
        graphics: {
          count: 0,
          files: []
        }
      },
      nextSteps: [
        '1. Import rough cut (final.mp4) + graphics PNGs/SVGs + TTS WAV into Resolve',
        '2. Transcribe to enable text-based tweaks',
        '3. Audio pass (Fairlight): Dialogue Leveler (light), Voice Isolation (≤ 30%), Loudness to –16 LUFS',
        '4. Graphics pass: place lower-thirds/callouts; animate 200–300 ms ease',
        '5. Color pass: small S-curve, slight saturation bump (105–110%), optional neutral LUT',
        '6. Export H.264 at ~16–24 Mbps; keyframe distance 60'
      ]
    };
    
    // Count files in each directory
    const videoDir = path.join(this.resolveAssetsDir, 'video');
    const audioDir = path.join(this.resolveAssetsDir, 'audio');
    const graphicsDir = path.join(this.resolveAssetsDir, 'graphics');
    
    if (fs.existsSync(videoDir)) {
      summary.assets.video.files = fs.readdirSync(videoDir);
      summary.assets.video.count = summary.assets.video.files.length;
    }
    
    if (fs.existsSync(audioDir)) {
      summary.assets.audio.files = fs.readdirSync(audioDir);
      summary.assets.audio.count = summary.assets.audio.files.length;
    }
    
    if (fs.existsSync(graphicsDir)) {
      summary.assets.graphics.files = fs.readdirSync(graphicsDir);
      summary.assets.graphics.count = summary.assets.graphics.files.length;
    }
    
    const summaryPath = path.join(this.resolveAssetsDir, 'export-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('✅ Export summary generated');
    console.log(`📊 Assets exported: ${summary.assets.video.count} video, ${summary.assets.audio.count} audio, ${summary.assets.graphics.count} graphics`);
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Run the Resolve export pipeline
const pipeline = new ResolveExportPipeline();
pipeline.exportForResolve().catch(console.error);

