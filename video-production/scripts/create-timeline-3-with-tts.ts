import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TimelineSegment {
  name: string;
  start: number;
  duration: number;
  narration: string;
  visual: string;
  graphics: any[];
  transitions: {
    in: string;
    out: string;
  };
  source?: string;
}

class Timeline3WithTTSCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private timeline: any;
  private videoPresentationDir: string;
  private audioDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.videoPresentationDir = path.join(__dirname, '..', 'VideoPresentation');
    this.audioDir = path.join(__dirname, '..', 'audio', 'vo');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createTimeline3WithTTS() {
    console.log('🎬 Timeline 3 Video Creation with TTS');
    console.log('=====================================');
    console.log('This will create a complete video with VideoPresentation assets and TTS audio');
    console.log('');
    
    try {
      // Load timeline-3.yaml
      await this.loadTimeline();
      
      // Check assets and audio
      await this.checkAssetsAndAudio();
      
      // Initialize browser
      await this.initializeBrowser();
      
      // Create video segments with assets and TTS
      await this.createVideoSegments();
      
      // Generate final video with audio
      await this.generateFinalVideoWithAudio();
      
      console.log('✅ Timeline 3 video with TTS completed!');
      console.log('🎬 Complete video presentation ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async loadTimeline() {
    const timelinePath = path.join(__dirname, '..', 'timeline-3.yaml');
    const timelineContent = fs.readFileSync(timelinePath, 'utf8');
    this.timeline = yaml.load(timelineContent);
    
    console.log(`📹 Timeline loaded: ${this.timeline.timeline.duration} seconds total`);
    console.log(`🎭 ${this.timeline.timeline.tracks.video.length} video segments`);
  }

  private async checkAssetsAndAudio() {
    console.log('📁 Checking VideoPresentation assets and TTS audio...');
    
    const assets = [
      'introduction_generated_new.png',
      'user_persona_generated_new.png',
      'hazard_detection.png',
      'api_dataflow_diagram.png',
      'asset_management.png',
      'ai_support.png',
      'conclusion_generated_new.png'
    ];
    
    const audioFiles = [
      'shot-01-introduction-introduction.wav',
      'shot-02-problem_statement-problem-statement.wav',
      'shot-03-user_persona-user-persona.wav',
      'shot-04-technical_architecture-technical-architecture.wav',
      'shot-05-commander_dashboard-commander-dashboard.wav',
      'shot-06-live_map_hazard-live-map--hazard-view.wav',
      'shot-07-simplified_flow-simplified-flow.wav',
      'shot-08-conclusion-conclusion.wav'
    ];
    
    // Check assets
    const availableAssets = [];
    for (const asset of assets) {
      const assetPath = path.join(this.videoPresentationDir, asset);
      if (fs.existsSync(assetPath)) {
        availableAssets.push(asset);
        console.log(`✅ Found asset: ${asset}`);
      } else {
        console.log(`⚠️  Missing asset: ${asset}`);
      }
    }
    
    // Check audio files
    const availableAudio = [];
    for (const audio of audioFiles) {
      const audioPath = path.join(this.audioDir, audio);
      if (fs.existsSync(audioPath)) {
        availableAudio.push(audio);
        console.log(`✅ Found audio: ${audio}`);
      } else {
        console.log(`⚠️  Missing audio: ${audio}`);
      }
    }
    
    console.log(`📊 Found ${availableAssets.length}/${assets.length} assets and ${availableAudio.length}/${audioFiles.length} audio files`);
    return { availableAssets, availableAudio };
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser for video creation...');
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized for video creation');
  }

  private async createVideoSegments() {
    const segments = this.timeline.timeline.tracks.video;
    
    console.log(`🎬 Creating ${segments.length} video segments with assets and TTS...`);
    console.log('');
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`📹 Creating segment ${i + 1}/${segments.length}: ${segment.name}`);
      
      // Check if we have a corresponding asset
      const assetPath = await this.getAssetPathForSegment(segment);
      
      if (assetPath) {
        // Use the asset image
        await this.createSegmentWithAsset(segment, assetPath, i);
      } else {
        // Fall back to live interaction
        await this.createSegmentWithLiveInteraction(segment, i);
      }
      
      console.log(`✅ Segment ${segment.name} created`);
      console.log('');
    }
  }

  private async getAssetPathForSegment(segment: TimelineSegment): Promise<string | null> {
    const assetMapping: { [key: string]: string } = {
      'introduction': 'introduction_generated_new.png',
      'user_persona': 'user_persona_generated_new.png',
      'live_map_hazard': 'hazard_detection.png',
      'technical_architecture': 'api_dataflow_diagram.png',
      'commander_dashboard': 'asset_management.png',
      'ai_support': 'ai_support.png',
      'conclusion': 'conclusion_generated_new.png'
    };
    
    const assetName = assetMapping[segment.name];
    if (!assetName) return null;
    
    const assetPath = path.join(this.videoPresentationDir, assetName);
    return fs.existsSync(assetPath) ? assetPath : null;
  }

  private async createSegmentWithAsset(segment: TimelineSegment, assetPath: string, segmentIndex: number) {
    console.log(`🖼️  Using asset for segment ${segment.name}: ${path.basename(assetPath)}`);
    
    // Create a professional HTML page to display the asset with production features
    const htmlContent = this.createProfessionalAssetHTML(segment, assetPath);
    
    const htmlPath = path.join(this.outputDir, `${segment.name}_asset.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    
    // Navigate to the asset page
    await this.page?.goto(`file://${htmlPath}`);
    await this.page?.waitForLoadState('networkidle');
    
    // Record the asset display
    const videoPath = path.join(this.outputDir, `${segment.name}.webm`);
    
    try {
      const video = this.page?.video();
      if (video) {
        await video.saveAs(videoPath);
      }
      
      // Wait for segment duration
      await this.page?.waitForTimeout(segment.duration * 1000);
      
      // Stop recording
      if (video) {
        await video.delete();
      }
      
      console.log(`🎥 Asset video saved: ${videoPath}`);
      
    } catch (error) {
      console.error(`❌ Error recording asset segment ${segment.name}:`, error);
      // Fallback to screenshot
      await this.captureFallbackScreenshot(segment);
    }
  }

  private createProfessionalAssetHTML(segment: TimelineSegment, assetPath: string): string {
    const segmentTitle = segment.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${segmentTitle}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
          }
          .asset-container {
            position: relative;
            max-width: 100%;
            max-height: 100%;
            width: 100%;
            height: 100%;
          }
          .asset-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            animation: fadeIn 2s ease-in;
          }
          .segment-title {
            position: absolute;
            top: 30px;
            left: 30px;
            color: white;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            background: rgba(0,0,0,0.7);
            padding: 15px 25px;
            border-radius: 8px;
            border-left: 4px solid #0066cc;
            animation: slideInLeft 1s ease-out;
          }
          .production-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          .lower-third {
            position: absolute;
            bottom: 30px;
            left: 30px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            border-left: 4px solid #0066cc;
            animation: slideInUp 1s ease-out 0.5s both;
          }
          .lower-third .name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .lower-third .title {
            font-size: 14px;
            color: #ccc;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="asset-container">
          <img src="file://${assetPath}" class="asset-image" alt="${segmentTitle}">
          <div class="production-overlay">
            <div class="segment-title">${segmentTitle}</div>
            <div class="lower-third">
              <div class="name">Ian Frelinger</div>
              <div class="title">Developer & Presenter</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async createSegmentWithLiveInteraction(segment: TimelineSegment, segmentIndex: number) {
    console.log(`🎭 Creating live interaction for segment ${segment.name}`);
    
    // Navigate to appropriate page
    await this.navigateToSegment(segment);
    
    // Record the interaction
    const videoPath = path.join(this.outputDir, `${segment.name}.webm`);
    
    try {
      const video = this.page?.video();
      if (video) {
        await video.saveAs(videoPath);
      }
      
      // Perform interactive actions
      await this.performSegmentInteractions(segment);
      
      // Wait for segment duration
      await this.page?.waitForTimeout(segment.duration * 1000);
      
      // Stop recording
      if (video) {
        await video.delete();
      }
      
      console.log(`🎥 Live interaction video saved: ${videoPath}`);
      
    } catch (error) {
      console.error(`❌ Error recording live segment ${segment.name}:`, error);
      await this.captureFallbackScreenshot(segment);
    }
  }

  private async navigateToSegment(segment: TimelineSegment) {
    if (!this.page) return;
    
    // Navigate to the main page first
    await this.page.goto('http://localhost:3000');
    await this.page.waitForLoadState('networkidle');
    
    // Navigate to specific section based on segment
    switch (segment.name) {
      case 'introduction':
        // Stay on main page
        break;
      case 'problem_statement':
      case 'live_map_hazard':
        await this.page.click('text=Live Map');
        break;
      case 'user_persona':
      case 'commander_dashboard':
        await this.page.click('text=Commander Dashboard');
        break;
      case 'technical_architecture':
      case 'ai_support':
        await this.page.click('text=AI Support');
        break;
      default:
        // Stay on main page
        break;
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  private async performSegmentInteractions(segment: TimelineSegment) {
    if (!this.page) return;
    
    console.log(`🎭 Performing interactions for segment: ${segment.name}`);
    
    // Add production features overlay
    await this.addProductionFeaturesOverlay(segment);
    
    // Wait for animations
    await this.page.waitForTimeout(2000);
  }

  private async addProductionFeaturesOverlay(segment: TimelineSegment) {
    if (!this.page) return;
    
    // Add production features based on segment
    switch (segment.name) {
      case 'problem_statement':
        await this.page.evaluate(() => {
          const overlay = document.createElement('div');
          overlay.innerHTML = `
            <div style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); 
                        background: #ff4444; color: white; padding: 15px 25px; border-radius: 8px; 
                        z-index: 1000; animation: bounce 1s ease-in-out;">
              <strong>Fragmented systems slow response</strong>
            </div>
            <style>
              @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                                 40% { transform: translateX(-50%) translateY(-10px); }
                                 60% { transform: translateX(-50%) translateY(-5px); } }
            </style>
          `;
          document.body.appendChild(overlay);
        });
        break;
        
      case 'simplified_flow':
        await this.page.evaluate(() => {
          const overlay = document.createElement('div');
          overlay.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                        background: #0066cc; color: white; padding: 15px 25px; border-radius: 8px; 
                        z-index: 1000; animation: slideUp 1s ease-out;">
              <strong>Coming soon: Zones, Routes, AI & Units</strong>
            </div>
            <style>
              @keyframes slideUp { from { bottom: -100px; } to { bottom: 20px; } }
            </style>
          `;
          document.body.appendChild(overlay);
        });
        break;
    }
  }

  private async captureFallbackScreenshot(segment: TimelineSegment) {
    if (!this.page) return;
    
    console.log(`📸 Fallback: Capturing screenshot for ${segment.name}`);
    const screenshotPath = path.join(this.outputDir, `${segment.name}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  private async generateFinalVideoWithAudio() {
    console.log('🎬 Generating final video with TTS audio...');
    
    // Check if we have video files
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length > 0) {
      await this.generateVideoFromRecordingsWithAudio(videoFiles);
    } else {
      // Fallback to screenshots if no videos
      await this.generateVideoFromScreenshotsWithAudio();
    }
  }

  private async generateVideoFromRecordingsWithAudio(videoFiles: string[]) {
    console.log(`🎥 Found ${videoFiles.length} video segments, creating final video with audio...`);
    
    const outputPath = path.join(this.outputDir, 'timeline-3-with-tts-final.mp4');
    const inputListPath = path.join(this.outputDir, 'input_list.txt');
    
    // Create input list for ffmpeg
    const inputList = videoFiles
      .sort()
      .map(file => `file '${file}'`)
      .join('\n');
    
    fs.writeFileSync(inputListPath, inputList);
    
    try {
      const ffmpegCommand = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', `"${inputListPath}"`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-preset', 'medium',
        '-y',
        `"${outputPath}"`
      ].join(' ');
      
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log('✅ Final video generated from recordings');
      
      // Clean up input list
      fs.unlinkSync(inputListPath);
      
      // Now add audio
      await this.addAudioToVideo(outputPath);
      
    } catch (error) {
      console.error('❌ Video generation from recordings failed:', error);
      // Fallback to screenshot method
      await this.generateVideoFromScreenshotsWithAudio();
    }
  }

  private async generateVideoFromScreenshotsWithAudio() {
    console.log('📸 Generating video from screenshots with audio (fallback method)...');
    
    const inputPattern = path.join(this.outputDir, '*.png');
    const outputPath = path.join(this.outputDir, 'timeline-3-with-tts-final.mp4');
    
    try {
      const ffmpegCommand = [
        'ffmpeg',
        '-framerate', '1/5', // 5 seconds per frame
        '-pattern_type', 'glob',
        '-i', `"${inputPattern}"`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-y',
        `"${outputPath}"`
      ].join(' ');
      
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log('✅ Final video generated from screenshots');
      
      // Now add audio
      await this.addAudioToVideo(outputPath);
      
    } catch (error) {
      console.error('❌ Video generation failed:', error);
    }
  }

  private async addAudioToVideo(videoPath: string) {
    console.log('🎵 Adding TTS audio to video...');
    
    // Get all audio files
    const audioFiles = fs.readdirSync(this.audioDir)
      .filter(file => file.endsWith('.wav'))
      .sort();
    
    if (audioFiles.length === 0) {
      console.log('⚠️  No audio files found, skipping audio addition');
      return;
    }
    
    // Create a combined audio file
    const combinedAudioPath = path.join(this.outputDir, 'combined_audio.wav');
    const audioListPath = path.join(this.outputDir, 'audio_list.txt');
    
    // Create audio input list
    const audioList = audioFiles
      .map(file => `file '${path.join(this.audioDir, file)}'`)
      .join('\n');
    
    fs.writeFileSync(audioListPath, audioList);
    
    try {
      // Combine audio files
      const combineAudioCommand = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', `"${audioListPath}"`,
        '-c', 'copy',
        '-y',
        `"${combinedAudioPath}"`
      ].join(' ');
      
      execSync(combineAudioCommand, { stdio: 'inherit' });
      console.log('✅ Audio files combined');
      
      // Add audio to video
      const finalOutputPath = path.join(this.outputDir, 'timeline-3-with-tts-final-with-audio.mp4');
      const addAudioCommand = [
        'ffmpeg',
        '-i', `"${videoPath}"`,
        '-i', `"${combinedAudioPath}"`,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-shortest',
        '-y',
        `"${finalOutputPath}"`
      ].join(' ');
      
      execSync(addAudioCommand, { stdio: 'inherit' });
      console.log('✅ Audio added to video successfully');
      
      // Clean up
      fs.unlinkSync(audioListPath);
      fs.unlinkSync(combinedAudioPath);
      
    } catch (error) {
      console.error('❌ Audio addition failed:', error);
    }
  }

  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the video creation with TTS
const creator = new Timeline3WithTTSCreator();
creator.createTimeline3WithTTS().catch(console.error);
