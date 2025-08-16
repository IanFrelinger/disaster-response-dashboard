import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { ElevenLabs } from '@elevenlabs/elevenlabs-js';
import * as dotenv from 'dotenv';

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
}

class InteractiveVideoWithTTS {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private timeline: any;
  private audioDir: string;

  constructor() {
    // Load environment variables from config.env
    const configPath = path.join(__dirname, '..', 'config.env');
    if (fs.existsSync(configPath)) {
      dotenv.config({ path: configPath });
      console.log('✅ Environment variables loaded from config.env');
    } else {
      console.log('⚠️  config.env not found, using system environment variables');
    }
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.audioDir = path.join(__dirname, '..', 'audio', 'vo');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async createInteractiveVideoWithTTS() {
    console.log('🎬 Starting Interactive Video with TTS Creation...');
    console.log('This will create a video based on "Video presentation plan-3"');
    console.log('📹 Recording real interactions + ElevenLabs TTS narration');
    
    try {
      // Load timeline-3.yaml
      await this.loadTimeline();
      
      // Generate TTS audio for all segments
      await this.generateTTSAudio();
      
      // Initialize browser with video recording
      await this.initializeBrowser();
      
      // Record video segments with interactions
      await this.recordVideoSegments();
      
      // Generate final video with audio
      await this.generateFinalVideoWithAudio();
      
      console.log('✅ Interactive video with TTS completed!');
      console.log('🎬 Professional video with real interactions and narration ready');
      
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

  private async generateTTSAudio() {
    console.log('🎤 Generating ElevenLabs TTS audio for all segments...');
    
    // Check if TTS audio already exists
    const existingAudio = fs.readdirSync(this.audioDir).filter(file => file.endsWith('.wav'));
    
    if (existingAudio.length >= this.timeline.timeline.tracks.video.length) {
      console.log('✅ TTS audio files already exist, skipping generation');
      return;
    }
    
    // Generate TTS for each segment
    const segments = this.timeline.timeline.tracks.video;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`🎤 Generating TTS for segment ${i + 1}/${segments.length}: ${segment.name}`);
      
      await this.generateSegmentTTS(segment, i);
    }
    
    console.log('✅ TTS audio generation completed');
  }

  private async generateSegmentTTS(segment: TimelineSegment, index: number) {
    const audioPath = path.join(this.audioDir, `segment-${index + 1}-${segment.name}.wav`);
    
    // Check if audio already exists
    if (fs.existsSync(audioPath)) {
      console.log(`✅ TTS audio already exists: ${audioPath}`);
      return;
    }
    
    try {
      // Use ElevenLabs API for high-quality TTS
      const text = segment.narration || `This is segment ${segment.name}`;
      
      // Get API key from environment
      const apiKey = process.env.ELEVEN_API_KEY;
      if (!apiKey) {
        throw new Error('ELEVEN_API_KEY environment variable not set');
      }
      
      // Get voice ID from environment
      const voiceId = process.env.ELEVEN_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel voice
      
      console.log(`🎤 Generating TTS for: "${text.substring(0, 50)}..."`);
      
      // Create ElevenLabs client
      const elevenLabs = new ElevenLabs({
        apiKey: apiKey
      });
      
      // Generate audio
      const audio = await elevenLabs.textToSpeech({
        text: text,
        voice_id: voiceId,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      });
      
      // Save audio to file
      fs.writeFileSync(audioPath, audio);
      console.log(`✅ ElevenLabs TTS generated: ${audioPath}`);
      
    } catch (error) {
      console.error(`❌ Error generating TTS for ${segment.name}:`, error);
      
      // Fallback to macOS say command
      try {
        const text = segment.narration || `This is segment ${segment.name}`;
        const sayCommand = [
          'say',
          '-v', 'Alex',
          '-o', audioPath,
          text
        ].join(' ');
        
        execSync(sayCommand, { stdio: 'inherit' });
        console.log(`✅ Fallback TTS generated: ${audioPath}`);
        
      } catch (sayError) {
        console.error(`❌ Fallback TTS also failed:`, sayError);
        
        // Create a silent audio file as final fallback
        try {
          const silentCommand = [
            'ffmpeg',
            '-f', 'lavfi',
            '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
            '-t', '5',
            '-y',
            audioPath
          ].join(' ');
          
          execSync(silentCommand, { stdio: 'inherit' });
          console.log(`✅ Silent audio fallback created: ${audioPath}`);
        } catch (fallbackError) {
          console.error(`❌ Failed to create any audio: ${fallbackError}`);
        }
      }
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser with video recording...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security'
      ]
    });
    
    // Create context with video recording enabled
    this.context = await this.browser.newContext({
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the frontend
    await this.page.goto('http://localhost:3000');
    await this.page.waitForLoadState('networkidle');
    
    console.log('✅ Browser initialized with video recording');
  }

  private async recordVideoSegments() {
    const segments = this.timeline.timeline.tracks.video;
    const totalDuration = this.timeline.timeline.duration;
    
    console.log(`🎬 Recording ${segments.length} video segments with interactions...`);
    console.log(`⏱️ Total timeline duration: ${totalDuration} seconds (${Math.floor(totalDuration/60)}:${(totalDuration%60).toString().padStart(2,'0')})`);
    
    // Record the entire timeline as one continuous video
    console.log('📹 Starting continuous video recording...');
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`🎭 Segment ${i + 1}/${segments.length}: ${segment.name} (${segment.duration}s)`);
      
      // Navigate to appropriate page based on segment
      await this.navigateToSegment(segment);
      
      // Perform interactive actions based on segment
      await this.performSegmentInteractions(segment);
      
      // Wait for segment duration (this ensures proper pacing)
      await this.page?.waitForTimeout(segment.duration * 1000);
      
      console.log(`✅ Segment ${segment.name} completed`);
    }
    
    // Wait a bit more to ensure the final segment is fully recorded
    console.log('⏳ Finalizing video recording...');
    await this.page?.waitForTimeout(2000);
    
    console.log('✅ All segments recorded in continuous video');
  }

  private async performSegmentInteractions(segment: TimelineSegment) {
    if (!this.page) {
      console.error('❌ Page not initialized');
      return;
    }
    
    console.log(`🎭 Performing interactions for segment: ${segment.name}`);
    
    switch (segment.name) {
      case 'introduction':
        // Smooth scroll and highlight key elements
        await this.page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await this.page.waitForTimeout(1000);
        
        // Highlight the title
        await this.page.locator('h1').highlight();
        await this.page.waitForTimeout(2000);
        break;
        
      case 'problem_statement':
        // Navigate to map and show hazards
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load and show hazard data
        await this.page.waitForTimeout(2000);
        
        // Try to find and interact with hazard elements
        try {
          const hazardElements = await this.page.locator('.hazard-cluster, .hazard-feature, [data-hazard]').all();
          if (hazardElements.length > 0) {
            await hazardElements[0].hover();
            await this.page.waitForTimeout(1000);
            await hazardElements[0].click();
            await this.page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No hazard elements found, continuing...');
        }
        break;
        
      case 'user_persona':
        // Navigate to dashboard and show user roles
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for dashboard to load
        await this.page.waitForTimeout(2000);
        
        // Try to highlight different sections
        try {
          const zoneCards = await this.page.locator('.zone-card, .zone-item, [data-zone]').all();
          if (zoneCards.length > 0) {
            for (let i = 0; i < Math.min(zoneCards.length, 3); i++) {
              await zoneCards[i].highlight();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No zone cards found, continuing...');
        }
        break;
        
      case 'technical_architecture':
        // Show technical components
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load
        await this.page.waitForTimeout(2000);
        
        // Try to show map controls
        try {
          const mapControls = await this.page.locator('.mapboxgl-ctrl-group, .map-controls, [data-map-control]').all();
          if (mapControls.length > 0) {
            await mapControls[0].highlight();
            await this.page.waitForTimeout(1000);
          }
        } catch (error) {
          console.log('No map controls found, continuing...');
        }
        break;
        
      case 'commander_dashboard':
        // Navigate to dashboard and show features
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for dashboard to load
        await this.page.waitForTimeout(2000);
        
        // Try to show zone management
        try {
          const zones = await this.page.locator('.zone-card, .zone-item, [data-zone]').all();
          if (zones.length > 0) {
            // Click on first zone to show details
            await zones[0].click();
            await this.page.waitForTimeout(2000);
          }
        } catch (error) {
          console.log('No zones found, continuing...');
        }
        break;
        
      case 'live_map_hazard':
        // Show live map features
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load
        await this.page.waitForTimeout(2000);
        
        // Try to toggle different layers
        try {
          const layerToggles = await this.page.locator('button').filter({ hasText: /hazard|unit|route|building/i }).all();
          if (layerToggles.length > 0) {
            for (let i = 0; i < Math.min(layerToggles.length, 3); i++) {
              await layerToggles[i].click();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No layer toggles found, continuing...');
        }
        break;
        
      case 'simplified_flow':
        // Show current capabilities
        await this.page.click('text=Live Map');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for map to load
        await this.page.waitForTimeout(2000);
        
        // Try to demonstrate map features
        try {
          // Try to zoom in/out
          const zoomControls = await this.page.locator('.mapboxgl-ctrl-zoom-in, .mapboxgl-ctrl-zoom-out, [data-zoom]').all();
          if (zoomControls.length > 0) {
            await zoomControls[0].click();
            await this.page.waitForTimeout(1000);
            if (zoomControls.length > 1) {
              await zoomControls[1].click();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No zoom controls found, continuing...');
        }
        break;
        
      case 'conclusion':
        // Return to dashboard for conclusion
        await this.page.click('text=Commander Dashboard');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for dashboard to load
        await this.page.waitForTimeout(2000);
        
        // Try to show summary elements
        try {
          const summaryElements = await this.page.locator('.dashboard-header, .zones-overview, [data-summary]').all();
          if (summaryElements.length > 0) {
            for (let i = 0; i < Math.min(summaryElements.length, 2); i++) {
              await summaryElements[i].highlight();
              await this.page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log('No summary elements found, continuing...');
        }
        break;
    }
  }

  private async navigateToSegment(segment: TimelineSegment) {
    if (!this.page) return;
    
    // Navigate based on segment name
    switch (segment.name) {
      case 'introduction':
        // Stay on main page for introduction
        break;
      case 'problem_statement':
        // Show map view for hazards
        await this.page.click('text=Live Map');
        break;
      case 'user_persona':
        // Show commander dashboard view
        await this.page.click('text=Commander Dashboard');
        break;
      case 'technical_architecture':
        // Show map view for technical overview
        await this.page.click('text=Live Map');
        break;
      case 'commander_dashboard':
        // Show commander dashboard view
        await this.page.click('text=Commander Dashboard');
        break;
      case 'live_map_hazard':
        // Show map view for hazards
        await this.page.click('text=Live Map');
        break;
      case 'simplified_flow':
        // Show map view for 3D terrain
        await this.page.click('text=Live Map');
        break;
      case 'conclusion':
        // Return to commander dashboard
        await this.page.click('text=Commander Dashboard');
        break;
    }
    
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
  }

  private async generateFinalVideoWithAudio() {
    console.log('🎬 Generating final video with TTS audio...');
    
    // Wait a moment for video files to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we have video files
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length > 0) {
      await this.generateVideoWithAudioFromRecordings(videoFiles);
    } else {
      console.log('❌ No video files found, using fallback screenshot method');
      await this.generateVideoWithAudioFromScreenshots();
    }
  }

  private async generateVideoWithAudioFromRecordings(videoFiles: string[]) {
    console.log(`🎥 Found ${videoFiles.length} video segments, creating final video with audio...`);
    
    const outputPath = path.join(this.outputDir, 'timeline-3-interactive-with-tts.mp4');
    
    try {
      // First, concatenate all video files
      const inputListPath = path.join(this.outputDir, 'video_input_list.txt');
      const videoInputList = videoFiles
        .sort()
        .map(file => `file '${file}'`)
        .join('\n');
      
      fs.writeFileSync(inputListPath, videoInputList);
      
      // Create concatenated video without audio
      const tempVideoPath = path.join(this.outputDir, 'temp_concatenated_video.mp4');
      const concatCommand = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', `"${inputListPath}"`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-preset', 'medium',
        '-y',
        `"${tempVideoPath}"`
      ].join(' ');
      
      console.log('🎬 Concatenating video segments...');
      execSync(concatCommand, { stdio: 'inherit' });
      
      // Clean up video input list
      fs.unlinkSync(inputListPath);
      
      // Now concatenate all audio files
      const audioFiles = fs.readdirSync(this.audioDir)
        .filter(file => file.endsWith('.wav'))
        .sort()
        .map(file => path.join(this.audioDir, file));
      
      if (audioFiles.length > 0) {
        console.log(`🎤 Processing ${audioFiles.length} audio segments...`);
        
        let tempAudioPath = path.join(this.outputDir, 'temp_concatenated_audio.wav');
        
        try {
          // Try simple concatenation first
          console.log('🎤 Attempting simple audio concatenation...');
          
          const audioInputListPath = path.join(this.outputDir, 'audio_input_list.txt');
          const audioInputList = audioFiles
            .map(file => `file '${file}'`)
            .join('\n');
          
          fs.writeFileSync(audioInputListPath, audioInputList);
          
          // Create concatenated audio with proper encoding
          const audioConcatCommand = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', `"${audioInputListPath}"`,
            '-c:a', 'pcm_s16le',  // Use consistent PCM encoding
            '-ar', '44100',        // Set sample rate
            '-ac', '2',            // Set channels to stereo
            '-y',
            `"${tempAudioPath}"`
          ].join(' ');
          
          execSync(audioConcatCommand, { stdio: 'inherit' });
          console.log('✅ Audio concatenation successful');
          
          // Clean up audio input list
          fs.unlinkSync(audioInputListPath);
          
        } catch (error) {
          console.log('⚠️ Audio concatenation failed, using fallback method...');
          
          // Fallback: use first audio file
          const fallbackAudioPath = path.join(this.outputDir, 'temp_fallback_audio.wav');
          fs.copyFileSync(audioFiles[0], fallbackAudioPath);
          tempAudioPath = fallbackAudioPath;
          console.log('✅ Using fallback audio (first file)');
        }
        
        // Now combine video and audio
        try {
          console.log('🎬 Combining video with TTS audio...');
          
          // Extend audio to match video duration if needed
          const videoDuration = await this.getVideoDuration(tempVideoPath);
          const audioDuration = await this.getAudioDuration(tempAudioPath);
          
          console.log(`📹 Video duration: ${videoDuration}s, Audio duration: ${audioDuration}s`);
          
          let finalAudioPath = tempAudioPath;
          
          // If audio is shorter than video, loop it to match
          if (audioDuration < videoDuration) {
            console.log(`🔄 Extending audio from ${audioDuration}s to ${videoDuration}s...`);
            const extendedAudioPath = path.join(this.outputDir, 'temp_extended_audio.wav');
            
            // Use a simpler loop method that's more reliable
            const extendCommand = [
              'ffmpeg',
              '-i', `"${tempAudioPath}"`,
              '-filter_complex', `"aloop=loop=-1:size=${Math.ceil(videoDuration * 44100)}"`,
              '-c:a', 'pcm_s16le',
              '-ar', '44100',
              '-ac', '2',
              '-y',
              `"${extendedAudioPath}"`
            ].join(' ');
            
            try {
              execSync(extendCommand, { stdio: 'inherit' });
              finalAudioPath = extendedAudioPath;
              console.log('✅ Audio extension successful');
            } catch (extendError) {
              console.log('⚠️ Audio extension failed, using original audio');
              finalAudioPath = tempAudioPath;
            }
          }
          
          const finalCommand = [
            'ffmpeg',
            '-i', `"${tempVideoPath}"`,
            '-i', `"${finalAudioPath}"`,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-map', '0:v:0',  // Use video from first input
            '-map', '1:a:0',  // Use audio from second input
            '-y',
            `"${outputPath}"`
          ].join(' ');
          
          execSync(finalCommand, { stdio: 'inherit' });
          
          // Clean up temp files
          if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
          if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
          if (finalAudioPath !== tempAudioPath && fs.existsSync(finalAudioPath)) {
            fs.unlinkSync(finalAudioPath);
          }
          
          console.log('✅ Final video with TTS audio generated from recordings');
          
        } catch (combineError) {
          console.error('❌ Video-audio combination failed:', combineError);
          console.log('⚠️ Creating video without audio as fallback');
          fs.renameSync(tempVideoPath, outputPath);
        }
      } else {
        console.log('⚠️ No audio files found, creating video without audio');
        fs.renameSync(tempVideoPath, outputPath);
      }
      
    } catch (error) {
      console.error('❌ Video generation with audio failed:', error);
      // Fallback to screenshot method
      await this.generateVideoWithAudioFromScreenshots();
    }
  }

  private async generateVideoWithAudioFromScreenshots() {
    console.log('📸 Generating video with audio from screenshots (fallback method)...');
    
    const inputPattern = path.join(this.outputDir, '*.png');
    const outputPath = path.join(this.outputDir, 'timeline-3-screenshots-with-tts.mp4');
    
    try {
      // First create video from screenshots
      const videoCommand = [
        'ffmpeg',
        '-framerate', '1/5', // 5 seconds per frame
        '-pattern_type', 'glob',
        '-i', `"${inputPattern}"`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-y',
        'temp_video.mp4'
      ].join(' ');
      
      execSync(videoCommand, { stdio: 'inherit' });
      
      // Then add audio
      const audioFiles = fs.readdirSync(this.audioDir).filter(file => file.endsWith('.wav'));
      if (audioFiles.length > 0) {
        const audioInput = path.join(this.audioDir, audioFiles[0]);
        const audioCommand = [
          'ffmpeg',
          '-i', 'temp_video.mp4',
          '-i', `"${audioInput}"`,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-shortest',
          '-y',
          `"${outputPath}"`
        ].join(' ');
        
        execSync(audioCommand, { stdio: 'inherit' });
        
        // Clean up temp file
        if (fs.existsSync('temp_video.mp4')) {
          fs.unlinkSync('temp_video.mp4');
        }
        
        console.log('✅ Fallback video with audio generated from screenshots');
      } else {
        console.log('⚠️ No audio files found, creating video without audio');
        fs.renameSync('temp_video.mp4', outputPath);
      }
      
    } catch (error) {
      console.error('❌ Video generation with audio failed:', error);
    }
  }

  private async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const result = execSync([
        'ffprobe',
        '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        `"${videoPath}"`
      ].join(' '), { encoding: 'utf8' });
      
      return parseFloat(result.trim()) || 0;
    } catch (error) {
      console.error('Error getting video duration:', error);
      return 0;
    }
  }

  private async getAudioDuration(audioPath: string): Promise<number> {
    try {
      const result = execSync([
        'ffprobe',
        '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        `"${audioPath}"`
      ].join(' '), { encoding: 'utf8' });
      
      return parseFloat(result.trim()) || 0;
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  }

  private async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the video creation
const creator = new InteractiveVideoWithTTS();
creator.createInteractiveVideoWithTTS().catch(console.error);
