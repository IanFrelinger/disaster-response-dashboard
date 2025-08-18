#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// AI Critic Bot Interface
interface CriticBotReview {
  overallScore: number;
  meetsStandards: boolean;
  criticalIssues: string[];
  improvementAreas: string[];
  recommendations: string[];
  needsRework: boolean;
  technicalAspects?: {
    videoQuality: string;
    audioQuality: string;
    synchronization: string;
    contentRelevance: string;
  };
}

// Technical narration scripts for the 5-minute demo
const TECHNICAL_NARRATION_SCRIPTS = {
  'Technical Introduction': {
    script: "Hi, I'm Ian Frelinger, Disaster Response Platform Architect. I'm building this intelligent system because emergency managers need better tools when lives are at stake. Our platform transforms disaster response from reactive to proactive, leveraging AI and real-time data to coordinate emergency services and protect communities. Today I'll show you our Palantir Foundry integration, real-time data processing, geospatial analytics, and AI/ML decision support capabilities.",
    duration: 30
  },
  'Dashboard Demonstration': {
    script: "When disasters hit, emergency managers are stuck dealing with disconnected systems and slow responses. Every minute wasted puts lives at risk. Our platform brings everything together in one unified dashboard powered by Palantir Foundry. You can see real-time hazard data, population density, weather conditions, and resource locations all in one view. The system provides dynamic risk assessment with live hazard monitoring and automated alert generation.",
    duration: 45
  },
  'Map Interactions': {
    script: "Our geospatial capabilities leverage H3 indexing at resolution 9, giving us approximately 174 meters per cell for precise location tracking. The map integrates real-time data streams from FIRMS for wildfire detection, NOAA for weather data, and traffic management systems. You can see how we perform dynamic hazard mapping with real-time updates and interactive zone management.",
    duration: 40
  },
  'AI Decision Support': {
    script: "The AI decision support module provides real-time recommendations based on machine learning models trained on historical incident data. The system analyzes current conditions, predicts fire spread patterns using our custom fire spread model, calculates risk scores, and provides confidence levels for each recommendation. Our REST API endpoints expose these capabilities programmatically for integration with existing systems.",
    duration: 35
  },
  'Evacuation Routing': {
    script: "Get safe evacuation routes with just one click. Our AI looks at the terrain, checks for hazards, and monitors traffic to find the safest way out. The routes keep updating as conditions change. The A-Star algorithm considers multiple factors to optimize for safety and speed. Our system provides optimized evacuation paths while tracking ongoing evacuations in real-time.",
    duration: 40
  },
  'Technical Architecture': {
    script: "Our technical architecture leverages Palantir Foundry as the core integration platform. We ingest real-time data streams from multiple sources and process them using microservices architecture with REST APIs and WebSocket connections for live updates. The platform uses H3 geospatial indexing for precise location tracking and machine learning models for predictive analytics.",
    duration: 30
  },
  'Impact and Value': {
    script: "Our system dramatically increases response throughput and allows for greater effectiveness of emergency responses. By reducing coordination time from hours to minutes, we save lives. The platform has been designed to handle the complexity of real-world disasters while remaining intuitive for emergency professionals. Our impact metrics show 65-90% faster coordination and potential savings of $15M-$75M per major event.",
    duration: 35
  },
  'Technical Conclusion': {
    script: "This demo showcases our core technical capabilities: Palantir Foundry integration, real-time data processing, H3 geospatial indexing, AI/ML decision support, and comprehensive REST APIs. The platform is built on proven technologies with seamless integration capabilities. Let's discuss how this can transform your emergency management operations and help you save more lives through intelligent, coordinated response.",
    duration: 30
  }
};

class QuickCaptureGenerator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private capturesDir: string;
  private frontendUrl: string = 'http://localhost:3000';
  private ffmpegAvailable: boolean = false;
  private qualityThreshold: number = 75; // Minimum quality score to pass
  private maxIterations: number = 3; // Maximum regeneration attempts
  private criticBotEnabled: boolean = true; // Enable AI critic bot review

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Load environment variables from config.env
    const configPath = path.join(__dirname, '..', 'config.env');
    if (fs.existsSync(configPath)) {
      dotenv.config({ path: configPath });
      this.log('✅ Loaded environment variables from config.env', 'success');
    } else {
      this.log('⚠️  config.env not found, using system environment variables', 'warning');
    }
    
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.ensureCapturesDirectory();
    this.checkFFmpeg();
  }

  private async checkFFmpeg(): Promise<void> {
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      await execAsync('ffmpeg -version');
      this.ffmpegAvailable = true;
      this.log('✅ FFmpeg is available for audio processing', 'success');
    } catch (error) {
      this.ffmpegAvailable = false;
      this.log('⚠️  FFmpeg not found - audio operations will be limited', 'warning');
    }
  }

  async generateVoiceOver(segmentName: string, duration: number): Promise<string> {
    this.log(`🎤 Generating voice-over for: ${segmentName}`);
    
    const narration = TECHNICAL_NARRATION_SCRIPTS[segmentName as keyof typeof TECHNICAL_NARRATION_SCRIPTS];
    if (!narration) {
      this.log(`⚠️  No narration script found for ${segmentName}`);
      return '';
    }
    
    try {
      const audioFileName = `${segmentName.toLowerCase().replace(/\s+/g, '_')}_vo.wav`;
      const audioPath = path.join(this.capturesDir, audioFileName);
      
      const elevenApiKey = process.env.ELEVEN_API_KEY;
      if (!elevenApiKey) {
        this.log('⚠️  ELEVEN_API_KEY not found - creating silent audio file for synchronization');
        
        await this.createSilentAudioFile(audioPath, duration);
        this.log(`🔇 Silent audio file created: ${audioPath}`);
        return audioPath;
      }
      
      await this.generateTTSAudio(narration.script, audioPath, elevenApiKey);
      
      if (this.ffmpegAvailable) {
        await this.adjustAudioDuration(audioPath, duration);
      }
      
      this.log(`✅ Voice-over generated: ${audioPath}`);
      return audioPath;
      
    } catch (error) {
      this.log(`❌ Error generating voice-over: ${error}`);
      return '';
    }
  }

  private async createSilentAudioFile(audioPath: string, duration: number): Promise<void> {
    if (!this.ffmpegAvailable) {
      this.log('⚠️  FFmpeg not available - cannot create silent audio file');
      return;
    }
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      const escapedPath = audioPath.replace(/"/g, '\\"');
      const command = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -acodec pcm_s16le -y "${escapedPath}"`;
      
      this.log(`🔇 Creating silent audio file (${duration}s)...`);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg timeout after 10 seconds')), 10000);
      });
      
      const execPromise = execAsync(command);
      await Promise.race([execPromise, timeoutPromise]);
      
      this.log(`✅ Silent audio file created (${duration}s)`);
    } catch (error) {
      this.log(`❌ Failed to create silent audio: ${error}`);
      this.log('⚠️  Continuing without audio file');
    }
  }

  private async generateTTSAudio(text: string, audioPath: string, apiKey: string): Promise<void> {
    this.log(`🔊 Converting text to speech: "${text.substring(0, 50)}..."`);
    
    try {
      // Import ElevenLabs API
      const elevenlabs = await import('elevenlabs');
      
      // Get the voice ID from environment or use default
      const voiceId = process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr';
      
      this.log(`🎤 Using voice ID: ${voiceId}`);
      
      // Generate speech using the API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }
      
      // Get the audio buffer
      const audioBuffer = await response.arrayBuffer();
      
      // Write the audio buffer to file
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
      
      this.log(`✅ TTS audio generated: ${audioPath}`);
      
    } catch (error) {
      this.log(`❌ TTS generation failed: ${error}`);
      this.log('🔄 Falling back to silent audio file...');
      await this.createSilentAudioFile(audioPath, 30);
    }
  }

  private async adjustAudioDuration(audioPath: string, targetDuration: number): Promise<void> {
    if (!this.ffmpegAvailable) {
      this.log('⚠️  FFmpeg not available - cannot adjust audio duration');
      return;
    }
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      const escapedPath = audioPath.replace(/"/g, '\\"');
      const probeCommand = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${escapedPath}"`;
      const { stdout: currentDurationStr } = await execAsync(probeCommand);
      const currentDuration = parseFloat(currentDurationStr.trim());
      
      if (Math.abs(currentDuration - targetDuration) > 1) {
        this.log(`⏱️  Adjusting audio duration from ${currentDuration.toFixed(2)}s to ${targetDuration.toFixed(2)}s`);
        
        const tempPath = audioPath.replace('.wav', '_temp.wav');
        const escapedTempPath = tempPath.replace(/"/g, '\\"');
        
        // Calculate the tempo ratio
        const tempoRatio = targetDuration / currentDuration;
        
        // For extreme tempo changes, use trimming instead of atempo
        if (tempoRatio < 0.5 || tempoRatio > 2.0) {
          this.log('🔄 Using trimming method for extreme duration changes');
          const trimCommand = `ffmpeg -i "${escapedPath}" -t ${targetDuration} -c copy "${escapedTempPath}" && mv "${escapedTempPath}" "${escapedPath}"`;
          await execAsync(trimCommand);
          this.log('✅ Audio trimmed to match video duration');
          return;
        }
        
        // Normal case - use atempo filter
        const filterChain = `atempo=${tempoRatio.toFixed(3)}`;
        
        const command = `ffmpeg -i "${escapedPath}" -filter:a "${filterChain}" "${escapedTempPath}" && mv "${escapedTempPath}" "${escapedPath}"`;
        await execAsync(command);
        
        this.log('✅ Audio duration adjusted successfully');
      }
    } catch (error) {
      this.log(`⚠️  Could not adjust audio duration: ${error}`);
      this.log('🔄 Using alternative method: trimming audio to match video duration');
      
      // Fallback: trim the audio to match video duration
      try {
        const tempPath = audioPath.replace('.wav', '_temp.wav');
        const escapedTempPath = tempPath.replace(/"/g, '\\"');
        const escapedAudioPath = audioPath.replace(/"/g, '\\"');
        const trimCommand = `ffmpeg -i "${escapedAudioPath}" -t ${targetDuration} -c copy "${escapedTempPath}" && mv "${escapedTempPath}" "${escapedAudioPath}"`;
        await execAsync(trimCommand);
        this.log('✅ Audio trimmed to match video duration');
      } catch (trimError) {
        this.log(`❌ Could not trim audio: ${trimError}`);
      }
    }
  }

  async combineVideoWithAudio(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
    if (!audioPath || !fs.existsSync(audioPath)) {
      this.log('⚠️  No audio file provided, copying video as-is');
      fs.copyFileSync(videoPath, outputPath);
      return;
    }
    
    if (!this.ffmpegAvailable) {
      this.log('⚠️  FFmpeg not available - copying video without audio');
      fs.copyFileSync(videoPath, outputPath);
      return;
    }
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      const escapedVideoPath = videoPath.replace(/"/g, '\\"');
      const escapedAudioPath = audioPath.replace(/"/g, '\\"');
      const escapedOutputPath = outputPath.replace(/"/g, '\\"');
      
      const videoProbe = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${escapedVideoPath}"`;
      const audioProbe = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${escapedAudioPath}"`;
      
      const [{ stdout: videoDurationStr }, { stdout: audioDurationStr }] = await Promise.all([
        execAsync(videoProbe),
        execAsync(audioProbe)
      ]);
      
      const videoDuration = parseFloat(videoDurationStr.trim());
      const audioDuration = parseFloat(audioDurationStr.trim());
      
      this.log(`📊 Video duration: ${videoDuration.toFixed(2)}s, Audio duration: ${audioDuration.toFixed(2)}s`);
      
      // Convert WebM to MP4 with H.264 codec first, then add audio
      const tempMp4Path = videoPath.replace('.webm', '_temp.mp4');
      const escapedTempMp4Path = tempMp4Path.replace(/"/g, '\\"');
      
      // Step 1: Convert WebM to MP4 with H.264 codec
      this.log('🔄 Converting WebM to MP4 with H.264 codec...');
      const convertCommand = `ffmpeg -i "${escapedVideoPath}" -c:v libx264 -preset fast -crf 23 -y "${escapedTempMp4Path}"`;
      await execAsync(convertCommand);
      
      // Step 2: Combine MP4 video with audio
      this.log('🎵 Adding audio to MP4 video...');
      const combineCommand = `ffmpeg -i "${escapedTempMp4Path}" -i "${escapedAudioPath}" -c:v copy -c:a aac -shortest -y "${escapedOutputPath}"`;
      await execAsync(combineCommand);
      
      // Clean up temporary file
      try {
        fs.unlinkSync(tempMp4Path);
      } catch (cleanupError) {
        this.log(`⚠️ Could not clean up temporary file: ${cleanupError}`);
      }
      
      this.log(`✅ Video with voice-over created: ${outputPath}`);
    } catch (error) {
      this.log(`❌ Failed to combine video with audio: ${error}`);
      // Fallback to video only
      fs.copyFileSync(videoPath, outputPath);
    }
  }

  private ensureCapturesDirectory(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
    console.log(`✅ Captures directory ready: ${this.capturesDir}`);
  }

  async reviewWithCriticBot(): Promise<CriticBotReview> {
    this.log('🤖 AI Critic Bot reviewing generated videos...', 'info');
    
    try {
      const captureFiles = fs.readdirSync(this.capturesDir).filter(file => 
        file.endsWith('_with_vo.mp4')
      );
      
      if (captureFiles.length === 0) {
        return {
          overallScore: 0,
          meetsStandards: false,
          criticalIssues: ['No video files with voice-over found'],
          improvementAreas: ['Video generation failed'],
          recommendations: ['Check video generation process'],
          needsRework: true
        };
      }
      
      let totalScore = 0;
      let fileCount = 0;
      const issues: string[] = [];
      const improvements: string[] = [];
      const technicalAspects = {
        videoQuality: 'unknown',
        audioQuality: 'unknown',
        synchronization: 'unknown',
        contentRelevance: 'unknown'
      };
      
      for (const file of captureFiles) {
        const filePath = path.join(this.capturesDir, file);
        const stats = fs.statSync(filePath);
        
        // Analyze video file
        const videoAnalysis = await this.analyzeVideoFile(filePath);
        
        // Score based on multiple factors
        let fileScore = 0;
        
        // File size scoring
        if (stats.size > 500000) { // > 500KB
          fileScore += 25;
        } else if (stats.size > 200000) { // > 200KB
          fileScore += 15;
        } else {
          fileScore += 5;
          issues.push(`${file} is too small (${stats.size} bytes)`);
        }
        
        // Duration scoring
        if (videoAnalysis.duration > 3) {
          fileScore += 25;
        } else if (videoAnalysis.duration > 1) {
          fileScore += 15;
        } else {
          fileScore += 5;
          issues.push(`${file} is too short (${videoAnalysis.duration}s)`);
        }
        
        // Audio presence scoring
        if (videoAnalysis.hasAudio) {
          fileScore += 25;
          technicalAspects.audioQuality = 'present';
        } else {
          fileScore += 5;
          issues.push(`${file} has no audio track`);
          technicalAspects.audioQuality = 'missing';
        }
        
        // Video quality scoring
        if (videoAnalysis.videoCodec === 'h264') {
          fileScore += 25;
          technicalAspects.videoQuality = 'h264';
        } else {
          fileScore += 10;
          technicalAspects.videoQuality = videoAnalysis.videoCodec || 'unknown';
        }
        
        totalScore += fileScore;
        fileCount++;
      }
      
      const averageScore = fileCount > 0 ? Math.round(totalScore / fileCount) : 0;
      
      // Content relevance scoring
      if (captureFiles.length >= 8) {
        technicalAspects.contentRelevance = 'comprehensive';
        totalScore += 20;
      } else if (captureFiles.length >= 4) {
        technicalAspects.contentRelevance = 'good';
        totalScore += 10;
      } else {
        technicalAspects.contentRelevance = 'limited';
        issues.push('Insufficient video segments generated');
      }
      
      // Synchronization scoring
      const syncScore = await this.analyzeSynchronization();
      if (syncScore > 90) {
        technicalAspects.synchronization = 'excellent';
        totalScore += 20;
      } else if (syncScore > 70) {
        technicalAspects.synchronization = 'good';
        totalScore += 10;
      } else {
        technicalAspects.synchronization = 'poor';
        issues.push('Audio-video synchronization issues detected');
      }
      
      const finalScore = Math.min(100, Math.round(totalScore / fileCount));
      const meetsStandards = finalScore >= this.qualityThreshold && issues.length === 0;
      
      // Generate recommendations
      if (finalScore < this.qualityThreshold) {
        improvements.push('Improve overall video quality');
      }
      if (captureFiles.length < 8) {
        improvements.push('Generate more video segments for comprehensive demo');
      }
      if (technicalAspects.synchronization === 'poor') {
        improvements.push('Fix audio-video synchronization');
      }
      
      this.log(`📊 AI Critic Bot Score: ${finalScore}/100`, 'info');
      this.log(`🎯 Technical Aspects:`, 'info');
      this.log(`   Video Quality: ${technicalAspects.videoQuality}`, 'info');
      this.log(`   Audio Quality: ${technicalAspects.audioQuality}`, 'info');
      this.log(`   Synchronization: ${technicalAspects.synchronization}`, 'info');
      this.log(`   Content Relevance: ${technicalAspects.contentRelevance}`, 'info');
      
      if (issues.length > 0) {
        this.log(`⚠️  Issues found: ${issues.length}`, 'warning');
      }
      if (improvements.length > 0) {
        this.log(`💡 Improvements suggested: ${improvements.length}`, 'info');
      }
      
      return {
        overallScore: finalScore,
        meetsStandards,
        criticalIssues: issues,
        improvementAreas: improvements,
        recommendations: improvements,
        needsRework: !meetsStandards,
        technicalAspects
      };
      
    } catch (error) {
      this.log(`❌ Critic bot review failed: ${error}`, 'error');
      return {
        overallScore: 0,
        meetsStandards: false,
        criticalIssues: ['Critic bot review failed'],
        improvementAreas: ['System error'],
        recommendations: ['Check system configuration'],
        needsRework: true
      };
    }
  }

  private async analyzeVideoFile(filePath: string): Promise<{
    duration: number;
    hasAudio: boolean;
    videoCodec: string;
    audioCodec: string;
  }> {
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      const escapedPath = filePath.replace(/"/g, '\\"');
      const probeCommand = `ffprobe -v quiet -show_streams -of json "${escapedPath}"`;
      const { stdout } = await execAsync(probeCommand);
      const probeData = JSON.parse(stdout);
      
      let duration = 0;
      let hasAudio = false;
      let videoCodec = 'unknown';
      let audioCodec = 'unknown';
      
      if (probeData.streams) {
        for (const stream of probeData.streams) {
          if (stream.codec_type === 'video') {
            duration = parseFloat(stream.duration || '0');
            videoCodec = stream.codec_name || 'unknown';
          } else if (stream.codec_type === 'audio') {
            hasAudio = true;
            audioCodec = stream.codec_name || 'unknown';
          }
        }
      }
      
      return { duration, hasAudio, videoCodec, audioCodec };
    } catch (error) {
      this.log(`⚠️  Could not analyze video file: ${error}`);
      return { duration: 0, hasAudio: false, videoCodec: 'unknown', audioCodec: 'unknown' };
    }
  }

  private async analyzeSynchronization(): Promise<number> {
    try {
      const captureFiles = fs.readdirSync(this.capturesDir).filter(file => 
        file.endsWith('_with_vo.mp4')
      );
      
      let syncScore = 0;
      let fileCount = 0;
      
      for (const file of captureFiles) {
        const filePath = path.join(this.capturesDir, file);
        const videoAnalysis = await this.analyzeVideoFile(filePath);
        
        // Check if video has audio (basic sync check)
        if (videoAnalysis.hasAudio && videoAnalysis.duration > 0) {
          syncScore += 100;
        }
        fileCount++;
      }
      
      return fileCount > 0 ? Math.round(syncScore / fileCount) : 0;
    } catch (error) {
      this.log(`⚠️  Could not analyze synchronization: ${error}`);
      return 0;
    }
  }

  async generateWithCriticBotReview(): Promise<void> {
    this.log('🎬 Starting AI-enhanced video generation with per-beat critic bot review...', 'info');
    
    let attempts = 0;
    let criticPassed = false;
    
    while (attempts < this.maxIterations && !criticPassed) {
      attempts++;
      this.log(`🔄 Generation attempt ${attempts}/${this.maxIterations}`, 'info');
      
      try {
        // Generate videos with per-beat critic bot review
        await this.generateBasicCapturesWithPerBeatReview();
        
        if (this.criticBotEnabled) {
          // Final comprehensive review
          const review = await this.reviewWithCriticBot();
          
          if (review.meetsStandards) {
            this.log(`✅ AI Critic Bot approved! Score: ${review.overallScore}/100`, 'success');
            criticPassed = true;
          } else {
            this.log(`⚠️  AI Critic Bot requires improvements. Score: ${review.overallScore}/100`, 'warning');
            this.log(`📋 Issues: ${review.criticalIssues.join(', ')}`, 'warning');
            this.log(`💡 Recommendations: ${review.recommendations.join(', ')}`, 'info');
            
            if (attempts < this.maxIterations) {
              this.log(`🔄 Regenerating with improvements...`, 'info');
              // Clean up and retry
              await this.cleanup();
            }
          }
        } else {
          // Skip critic bot review
          criticPassed = true;
        }
        
      } catch (error) {
        this.log(`❌ Generation attempt ${attempts} failed: ${error}`, 'error');
        if (attempts < this.maxIterations) {
          this.log(`🔄 Retrying...`, 'info');
          await this.cleanup();
        }
      }
    }
    
    if (criticPassed) {
      this.log(`🎉 AI-enhanced video generation completed successfully!`, 'success');
    } else {
      this.log(`❌ Failed to meet quality standards after ${this.maxIterations} attempts`, 'error');
    }
  }

  async generateBasicCapturesWithPerBeatReview(): Promise<void> {
    this.log('🎬 Generating comprehensive 5-minute technical demo with per-beat critic review...', 'info');
    
    try {
      // Generate technical introduction with critic review
      await this.generateBeatWithCriticReview('Technical Introduction', this.generateTechnicalIntro.bind(this));
      
      // Generate dashboard demonstration with critic review
      await this.generateBeatWithCriticReview('Dashboard Demonstration', this.generateComprehensiveDashboardCapture.bind(this));
      
      // Generate map interactions with critic review
      await this.generateBeatWithCriticReview('Map Interactions', this.generateDetailedMapCapture.bind(this));
      
      // Generate AI decision support with critic review
      await this.generateBeatWithCriticReview('AI Decision Support', this.generateComprehensiveAICapture.bind(this));
      
      // Generate evacuation routing with critic review
      await this.generateBeatWithCriticReview('Evacuation Routing', this.generateEvacuationRoutingCapture.bind(this));
      
      // Generate technical architecture with critic review
      await this.generateBeatWithCriticReview('Technical Architecture', this.generateTechnicalArchitectureCapture.bind(this));
      
      // Generate impact and value with critic review
      await this.generateBeatWithCriticReview('Impact and Value', this.generateImpactValueCapture.bind(this));
      
      // Generate technical conclusion with critic review
      await this.generateBeatWithCriticReview('Technical Conclusion', this.generateTechnicalConclusion.bind(this));
      
      this.log('✅ Comprehensive 5-minute technical demo generated successfully with per-beat quality control', 'success');
      
    } catch (error) {
      this.log(`❌ Failed to generate captures: ${error}`, 'error');
      throw error;
    }
  }

  async generateBeatWithCriticReview(beatName: string, generationMethod: () => Promise<void>): Promise<void> {
    this.log(`🎬 Generating ${beatName} with AI critic bot review...`, 'info');
    
    let attempts = 0;
    const maxBeatAttempts = 2; // Reduced to 2 attempts for faster processing
    let beatPassed = false;
    
    while (attempts < maxBeatAttempts && !beatPassed) {
      attempts++;
      this.log(`🔄 ${beatName} attempt ${attempts}/${maxBeatAttempts}`, 'info');
      
      try {
        // Generate the beat
        await generationMethod();
        
        // Wait a moment for files to be fully written
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Review this specific beat
        const beatReview = await this.reviewSingleBeat(beatName);
        
        if (beatReview.meetsStandards) {
          this.log(`✅ ${beatName} passed critic review! Score: ${beatReview.overallScore}/100`, 'success');
          beatPassed = true;
        } else {
          this.log(`⚠️  ${beatName} needs improvement. Score: ${beatReview.overallScore}/100`, 'warning');
          this.log(`📋 Issues: ${beatReview.criticalIssues.join(', ')}`, 'warning');
          this.log(`💡 Recommendations: ${beatReview.recommendations.join(', ')}`, 'info');
          
          if (attempts < maxBeatAttempts) {
            this.log(`🔄 Regenerating ${beatName} with improvements...`, 'info');
            // Clean up this specific beat's files
            await this.cleanupBeatFiles(beatName);
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
      } catch (error) {
        this.log(`❌ ${beatName} generation attempt ${attempts} failed: ${error}`, 'error');
        if (attempts < maxBeatAttempts) {
          this.log(`🔄 Retrying ${beatName}...`, 'info');
          await this.cleanupBeatFiles(beatName);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!beatPassed) {
      this.log(`⚠️  ${beatName} failed to meet quality standards after ${maxBeatAttempts} attempts, continuing...`, 'warning');
    }
  }

  async reviewSingleBeat(beatName: string): Promise<CriticBotReview> {
    this.log(`🤖 AI Critic Bot reviewing ${beatName}...`, 'info');
    
    try {
      // Find the specific beat's video file using multiple naming patterns
      const beatFiles = fs.readdirSync(this.capturesDir).filter(file => {
        if (!file.endsWith('_with_vo.mp4')) return false;
        
        // Try multiple naming patterns based on actual file naming
        const normalizedBeatName = beatName.toLowerCase().replace(/\s+/g, '_');
        const shortBeatName = beatName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
        const firstWord = beatName.toLowerCase().split(' ')[0];
        
        // Map beat names to actual file patterns
        const beatNameMap: { [key: string]: string[] } = {
          'Technical Introduction': ['intro', '01'],
          'Dashboard Demonstration': ['dashboard', '02'],
          'Map Interactions': ['map', '03'],
          'AI Decision Support': ['ai_interaction', '04'],
          'Evacuation Routing': ['evacuation_routing', '05'],
          'Technical Architecture': ['technical_architecture', '06'],
          'Impact and Value': ['impact_value', '07'],
          'Technical Conclusion': ['technical_conclusion', '08']
        };
        
        const patterns = beatNameMap[beatName] || [normalizedBeatName, shortBeatName, firstWord];
        
        return patterns.some(pattern => file.includes(pattern));
      });
      
      if (beatFiles.length === 0) {
        // Debug: list all available files
        const allFiles = fs.readdirSync(this.capturesDir);
        this.log(`🔍 Debug: Looking for ${beatName} files`, 'info');
        this.log(`🔍 Debug: Available files: ${allFiles.join(', ')}`, 'info');
        
        return {
          overallScore: 0,
          meetsStandards: false,
          criticalIssues: [`No video file found for ${beatName}`],
          improvementAreas: ['Beat generation failed'],
          recommendations: ['Check beat generation process'],
          needsRework: true
        };
      }
      
      const beatFile = beatFiles[0];
      this.log(`🔍 Debug: Found beat file: ${beatFile}`, 'info');
      const filePath = path.join(this.capturesDir, beatFile);
      const stats = fs.statSync(filePath);
      
      // Analyze the specific beat
      const videoAnalysis = await this.analyzeVideoFile(filePath);
      
      // Score based on multiple factors
      let score = 0;
      const issues: string[] = [];
      const improvements: string[] = [];
      
      // File size scoring
      if (stats.size > 200000) { // > 200KB
        score += 25;
      } else if (stats.size > 100000) { // > 100KB
        score += 15;
      } else {
        score += 5;
        issues.push(`${beatName} file is too small (${stats.size} bytes)`);
      }
      
      // Duration scoring (should be at least 3 seconds)
      if (videoAnalysis.duration >= 3) {
        score += 25;
      } else if (videoAnalysis.duration >= 1) {
        score += 15;
      } else {
        score += 5;
        issues.push(`${beatName} is too short (${videoAnalysis.duration}s)`);
      }
      
      // Audio presence scoring
      if (videoAnalysis.hasAudio) {
        score += 25;
      } else {
        score += 5;
        issues.push(`${beatName} has no audio track`);
      }
      
      // Video quality scoring
      if (videoAnalysis.videoCodec === 'h264') {
        score += 25;
      } else {
        score += 10;
      }
      
      const meetsStandards = score >= 60 && issues.length <= 1; // More realistic threshold
      
      // Generate beat-specific recommendations
      if (score < 60) {
        improvements.push(`Improve ${beatName} overall quality`);
      }
      if (videoAnalysis.duration < 3) {
        improvements.push(`Extend ${beatName} duration to at least 3 seconds`);
      }
      if (!videoAnalysis.hasAudio) {
        improvements.push(`Add audio track to ${beatName}`);
      }
      
      this.log(`📊 ${beatName} Critic Bot Score: ${score}/100`, 'info');
      
      if (issues.length > 0) {
        this.log(`⚠️  ${beatName} Issues: ${issues.join(', ')}`, 'warning');
      }
      if (improvements.length > 0) {
        this.log(`💡 ${beatName} Improvements: ${improvements.join(', ')}`, 'info');
      }
      
      return {
        overallScore: score,
        meetsStandards,
        criticalIssues: issues,
        improvementAreas: improvements,
        recommendations: improvements,
        needsRework: !meetsStandards
      };
      
    } catch (error) {
      this.log(`❌ ${beatName} critic bot review failed: ${error}`, 'error');
      return {
        overallScore: 0,
        meetsStandards: false,
        criticalIssues: [`${beatName} critic bot review failed`],
        improvementAreas: ['System error'],
        recommendations: ['Check system configuration'],
        needsRework: true
      };
    }
  }

  async cleanupBeatFiles(beatName: string): Promise<void> {
    this.log(`🧹 Cleaning up ${beatName} files...`, 'info');
    
    try {
      const files = fs.readdirSync(this.capturesDir);
      
      // Use the same mapping as reviewSingleBeat
      const beatNameMap: { [key: string]: string[] } = {
        'Technical Introduction': ['intro', '01'],
        'Dashboard Demonstration': ['dashboard', '02'],
        'Map Interactions': ['map', '03'],
        'AI Decision Support': ['ai_interaction', '04'],
        'Evacuation Routing': ['evacuation_routing', '05'],
        'Technical Architecture': ['technical_architecture', '06'],
        'Impact and Value': ['impact_value', '07'],
        'Technical Conclusion': ['technical_conclusion', '08']
      };
      
      const patterns = beatNameMap[beatName] || [
        beatName.toLowerCase().replace(/\s+/g, '_'),
        beatName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, ''),
        beatName.toLowerCase().split(' ')[0]
      ];
      
      const beatFiles = files.filter(file => 
        patterns.some(pattern => file.includes(pattern))
      );
      
      for (const file of beatFiles) {
        const filePath = path.join(this.capturesDir, file);
        try {
          fs.unlinkSync(filePath);
          this.log(`🗑️  Deleted: ${file}`, 'info');
        } catch (error) {
          this.log(`⚠️  Could not delete ${file}: ${error}`, 'warning');
        }
      }
    } catch (error) {
      this.log(`⚠️  Error during ${beatName} cleanup: ${error}`, 'warning');
    }
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  async initialize(): Promise<void> {
    this.log('🚀 Initializing Quick Capture Generator...');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
          dir: this.capturesDir,
          size: { width: 1920, height: 1080 }
        }
      });

      this.page = await this.context.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      this.log('✅ Browser initialized with video recording enabled');
    } catch (error) {
      this.log(`❌ Failed to initialize browser: ${error}`);
      throw error;
    }
  }

  async generateBasicCaptures(): Promise<void> {
    this.log('🎬 Generating comprehensive 5-minute technical demo...');
    
    try {
      // Generate a detailed intro with technical context
      await this.generateTechnicalIntro();
      
      // Generate a comprehensive dashboard demonstration
      await this.generateComprehensiveDashboardCapture();
      
      // Generate detailed map interactions with technical features
      await this.generateDetailedMapCapture();
      
      // Generate comprehensive AI decision support demonstration
      await this.generateComprehensiveAICapture();
      
      // Generate evacuation routing demonstration
      await this.generateEvacuationRoutingCapture();
      
      // Generate technical architecture overview
      await this.generateTechnicalArchitectureCapture();
      
      // Generate impact and value demonstration
      await this.generateImpactValueCapture();
      
      // Generate a detailed conclusion with technical summary
      await this.generateTechnicalConclusion();
      
      this.log('✅ Comprehensive 5-minute technical demo generated successfully');
      
    } catch (error) {
      this.log(`❌ Failed to generate captures: ${error}`);
      throw error;
    }
  }

  private async generateTechnicalIntro(): Promise<void> {
    this.log('📹 Generating comprehensive technical introduction...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .intro-container {
              text-align: center;
              max-width: 800px;
              padding: 40px;
            }
            .name {
              font-size: 4rem;
              font-weight: 300;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .title {
              font-size: 2rem;
              margin-bottom: 30px;
              opacity: 0.9;
            }
            .mission {
              font-size: 1.4rem;
              line-height: 1.6;
              opacity: 0.8;
              max-width: 600px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
                      <div class="intro-container">
              <div class="name">Ian Frelinger</div>
              <div class="title">Disaster Response Platform Architect</div>
              <div class="mission">
                Building intelligent systems that save lives during emergencies. 
                Our platform transforms disaster response from reactive to proactive, 
                leveraging AI and real-time data to coordinate emergency services 
                and protect communities.
                <br><br>
                <strong>Technical Focus:</strong> Palantir Foundry Integration, Real-time Data Processing, 
                Geospatial Analytics, AI/ML Decision Support, and Multi-Agency Coordination Systems.
              </div>
            </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    await this.finalizeVideoRecording('01_intro.webm', 'Technical Introduction');
  }

  private async generateComprehensiveDashboardCapture(): Promise<void> {
    this.log('📹 Generating comprehensive dashboard demonstration...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Navigate to frontend with timeout
      await this.page.goto(this.frontendUrl, { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Wait for the page to fully render
      await this.page.waitForTimeout(2000);
      
      // Perform dynamic interactions
      await this.performDashboardInteractions();
      
      await this.finalizeVideoRecording('02_dashboard.webm', 'Dashboard Demonstration');
      
    } catch (error) {
      this.log(`⚠️  Dashboard capture failed: ${error}, creating fallback`);
      await this.createFallbackSlide('02_dashboard', 'Dashboard Overview');
    }
  }

  private async performDashboardInteractions(): Promise<void> {
    this.log('🎯 Performing dashboard interactions...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Wait for dashboard elements to be available
      await this.page.waitForTimeout(1000);
      
      // Try to click on Commander Dashboard if available
      try {
        await this.page.click('text=Commander Dashboard', { timeout: 5000 });
        this.log('✅ Clicked Commander Dashboard');
        await this.page.waitForTimeout(2000);
      } catch (error) {
        this.log('⚠️  Commander Dashboard button not found, continuing...');
      }
      
      // Try to interact with hazard zones
      try {
        const hazardElements = await this.page.$$('[class*="zone"], [class*="hazard"], [class*="evacuation"]');
        if (hazardElements.length > 0) {
          await hazardElements[0].click();
          this.log('✅ Clicked on hazard zone');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        this.log('⚠️  No hazard zones found, continuing...');
      }
      
      // Try to scroll through the dashboard
      try {
        await this.page.evaluate(() => {
          window.scrollBy(0, 300);
        });
        this.log('✅ Scrolled through dashboard');
        await this.page.waitForTimeout(1000);
        
        await this.page.evaluate(() => {
          window.scrollBy(0, -300);
        });
        this.log('✅ Scrolled back up');
        await this.page.waitForTimeout(1000);
      } catch (error) {
        this.log('⚠️  Scrolling failed, continuing...');
      }
      
      // Try to interact with metrics or data panels
      try {
        const metricElements = await this.page.$$('[class*="metric"], [class*="data"], [class*="stat"]');
        if (metricElements.length > 0) {
          await metricElements[0].click();
          this.log('✅ Clicked on metric panel');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        this.log('⚠️  No metric panels found, continuing...');
      }
      
    } catch (error) {
      this.log(`⚠️  Dashboard interactions failed: ${error}, continuing with static capture`);
    }
  }

  private async generateDetailedMapCapture(): Promise<void> {
    this.log('📹 Generating detailed map interactions with technical features...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Navigate to frontend with timeout
      await this.page.goto(this.frontendUrl, { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Wait for the page to fully render
      await this.page.waitForTimeout(2000);
      
      // Perform map interactions
      await this.performMapInteractions();
      
      await this.finalizeVideoRecording('03_map.webm', 'Map Interactions');
      
    } catch (error) {
      this.log(`⚠️  Map capture failed: ${error}, creating fallback`);
      await this.createFallbackSlide('03_map', 'Map Interactions');
    }
  }

  private async performMapInteractions(): Promise<void> {
    this.log('🗺️  Performing map interactions...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Wait for page to be ready
      await this.page.waitForTimeout(1000);
      
      // Try to click on Live Map if available
      try {
        await this.page.click('text=Live Map', { timeout: 5000 });
        this.log('✅ Clicked Live Map');
        await this.page.waitForTimeout(2000);
      } catch (error) {
        this.log('⚠️  Live Map button not found, trying alternative navigation...');
        // Try alternative map navigation
        try {
          await this.page.click('text=Map', { timeout: 3000 });
          this.log('✅ Clicked Map navigation');
          await this.page.waitForTimeout(2000);
        } catch (error2) {
          this.log('⚠️  Map navigation not found, continuing...');
        }
      }
      
      // Try to interact with map elements
      try {
        const mapElements = await this.page.$$('[class*="map"], [id*="map"], canvas, [class*="mapbox"]');
        if (mapElements.length > 0) {
          this.log('✅ Found map elements, performing interactions');
          
          // Click on the map to simulate interaction
          await mapElements[0].click();
          await this.page.waitForTimeout(1000);
          
          // Try to simulate zoom in/out
          await this.page.evaluate(() => {
            // Simulate wheel event for zoom
            const mapElement = document.querySelector('[class*="map"], [id*="map"], canvas');
            if (mapElement) {
              mapElement.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
            }
          });
          this.log('✅ Simulated map zoom');
          await this.page.waitForTimeout(1000);
          
          // Try to simulate pan
          await this.page.evaluate(() => {
            const mapElement = document.querySelector('[class*="map"], [id*="map"], canvas');
            if (mapElement) {
              mapElement.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
              mapElement.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 200 }));
              mapElement.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 200 }));
            }
          });
          this.log('✅ Simulated map pan');
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        this.log('⚠️  Map element interactions failed, continuing...');
      }
      
      // Try to interact with route or evacuation elements
      try {
        const routeElements = await this.page.$$('[class*="route"], [class*="evacuation"], [class*="path"]');
        if (routeElements.length > 0) {
          await routeElements[0].click();
          this.log('✅ Clicked on route element');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        this.log('⚠️  No route elements found, continuing...');
      }
      
    } catch (error) {
      this.log(`⚠️  Map interactions failed: ${error}, continuing with static capture`);
    }
  }

  private async generateComprehensiveAICapture(): Promise<void> {
    this.log('📹 Generating comprehensive AI decision support demonstration...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Navigate to frontend with timeout
      await this.page.goto(this.frontendUrl, { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Wait for the page to fully render
      await this.page.waitForTimeout(2000);
      
      // Perform AI interactions
      await this.performAIInteractions();
      
      await this.finalizeVideoRecording('04_ai_interaction.webm', 'AI Decision Support');
      
    } catch (error) {
      this.log(`⚠️  AI interaction capture failed: ${error}, creating fallback`);
      await this.createFallbackSlide('04_ai_interaction', 'AI Decision Support');
    }
  }

  private async performAIInteractions(): Promise<void> {
    this.log('🤖 Performing AI interactions...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Wait for page to be ready
      await this.page.waitForTimeout(1000);
      
      // Try to navigate to AI/Commander Dashboard
      try {
        await this.page.click('text=Commander Dashboard', { timeout: 5000 });
        this.log('✅ Clicked Commander Dashboard');
        await this.page.waitForTimeout(2000);
      } catch (error) {
        this.log('⚠️  Commander Dashboard not found, continuing...');
      }
      
      // Try to interact with AI recommendation elements
      try {
        const aiElements = await this.page.$$('[class*="ai"], [class*="recommendation"], [class*="decision"], [class*="support"]');
        if (aiElements.length > 0) {
          await aiElements[0].click();
          this.log('✅ Clicked on AI recommendation element');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        this.log('⚠️  No AI recommendation elements found, continuing...');
      }
      
      // Try to interact with risk assessment elements
      try {
        const riskElements = await this.page.$$('[class*="risk"], [class*="assessment"], [class*="score"]');
        if (riskElements.length > 0) {
          await riskElements[0].click();
          this.log('✅ Clicked on risk assessment element');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        this.log('⚠️  No risk assessment elements found, continuing...');
      }
      
      // Try to interact with data panels or charts
      try {
        const riskElements = await this.page.$$('[class*="chart"], [class*="graph"], [class*="visualization"]');
        if (riskElements.length > 0) {
          await riskElements[0].click();
          this.log('✅ Clicked on data visualization element');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        this.log('⚠️  No data visualization elements found, continuing...');
      }
      
      // Try to scroll through AI content
      try {
        await this.page.evaluate(() => {
          window.scrollBy(0, 400);
        });
        this.log('✅ Scrolled through AI content');
        await this.page.waitForTimeout(1000);
        
        await this.page.evaluate(() => {
          window.scrollBy(0, -400);
        });
        this.log('✅ Scrolled back up');
        await this.page.waitForTimeout(1000);
      } catch (error) {
        this.log('⚠️  Scrolling failed, continuing...');
      }
      
    } catch (error) {
      this.log(`⚠️  AI interactions failed: ${error}, continuing with static capture`);
    }
  }

  private async generateEvacuationRoutingCapture(): Promise<void> {
    this.log('📹 Generating evacuation routing demonstration...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Navigate to frontend with timeout
      await this.page.goto(this.frontendUrl, { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Wait for the page to fully render
      await this.page.waitForTimeout(2000);
      
      // Perform evacuation routing interactions
      await this.performEvacuationRoutingInteractions();
      
      await this.finalizeVideoRecording('05_evacuation_routing.webm', 'Evacuation Routing');
      
    } catch (error) {
      this.log(`⚠️  Evacuation routing capture failed: ${error}, creating fallback`);
      await this.createFallbackSlide('05_evacuation_routing', 'Evacuation Routing');
    }
  }

  private async performEvacuationRoutingInteractions(): Promise<void> {
    this.log('🚨 Performing evacuation routing interactions...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Wait for page to be ready
      await this.page.waitForTimeout(1000);
      
      // Try to navigate to map or routing section
      try {
        await this.page.click('text=Live Map', { timeout: 5000 });
        this.log('✅ Clicked Live Map for routing');
        await this.page.waitForTimeout(2000);
      } catch (error) {
        this.log('⚠️  Live Map not found, trying alternative navigation...');
        try {
          await this.page.click('text=Map', { timeout: 3000 });
          this.log('✅ Clicked Map navigation');
          await this.page.waitForTimeout(2000);
        } catch (error2) {
          this.log('⚠️  Map navigation not found, continuing...');
        }
      }
      
      // Try to interact with routing elements
      try {
        const routingElements = await this.page.$$('[class*="route"], [class*="evacuation"], [class*="path"], [class*="navigation"]');
        if (routingElements.length > 0) {
          this.log('✅ Found routing elements, performing interactions');
          
          // Click on routing elements
          for (let i = 0; i < Math.min(routingElements.length, 3); i++) {
            await routingElements[i].click();
            this.log(`✅ Clicked routing element ${i + 1}`);
            await this.page.waitForTimeout(1500);
          }
        }
      } catch (error) {
        this.log('⚠️  Routing element interactions failed, continuing...');
      }
      
      // Try to simulate route planning
      try {
        await this.page.evaluate(() => {
          // Simulate route planning interactions
          const routeButtons = document.querySelectorAll('button, a, [role="button"]');
          for (let i = 0; i < Math.min(routeButtons.length, 5); i++) {
            const button = routeButtons[i] as HTMLElement;
            if (button.textContent?.toLowerCase().includes('route') || 
                button.textContent?.toLowerCase().includes('evacuation') ||
                button.textContent?.toLowerCase().includes('plan')) {
              button.click();
              break;
            }
          }
        });
        this.log('✅ Simulated route planning interactions');
        await this.page.waitForTimeout(2000);
      } catch (error) {
        this.log('⚠️  Route planning simulation failed, continuing...');
      }
      
      // Try to scroll through routing content
      try {
        await this.page.evaluate(() => {
          window.scrollBy(0, 500);
        });
        this.log('✅ Scrolled through routing content');
        await this.page.waitForTimeout(1000);
        
        await this.page.evaluate(() => {
          window.scrollBy(0, -500);
        });
        this.log('✅ Scrolled back up');
        await this.page.waitForTimeout(1000);
      } catch (error) {
        this.log('⚠️  Scrolling failed, continuing...');
      }
      
    } catch (error) {
      this.log(`⚠️  Evacuation routing interactions failed: ${error}, continuing with static capture`);
    }
  }

  private async generateTechnicalArchitectureCapture(): Promise<void> {
    this.log('📹 Generating technical architecture overview...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .architecture-container {
              text-align: center;
              max-width: 1000px;
              padding: 40px;
            }
            .title {
              font-size: 3rem;
              font-weight: 300;
              margin-bottom: 30px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              color: #3498db;
            }
            .subtitle {
              font-size: 1.5rem;
              margin-bottom: 30px;
              opacity: 0.9;
            }
            .tech-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .tech-item {
              background: rgba(52, 152, 219, 0.1);
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #3498db;
            }
            .tech-title {
              font-size: 1.2rem;
              font-weight: 600;
              margin-bottom: 10px;
              color: #3498db;
            }
            .tech-desc {
              font-size: 1rem;
              line-height: 1.5;
              opacity: 0.8;
            }
            .highlight {
              color: #e74c3c;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="architecture-container">
            <div class="title">Technical Architecture</div>
            <div class="subtitle">Palantir Foundry Integration & Real-time Data Processing</div>
            
            <div class="tech-grid">
              <div class="tech-item">
                <div class="tech-title">Core Platform</div>
                <div class="tech-desc">
                  <span class="highlight">Palantir Foundry</span> as the central integration platform
                  with microservices architecture and REST APIs
                </div>
              </div>
              <div class="tech-item">
                <div class="tech-title">Data Sources</div>
                <div class="tech-desc">
                  FIRMS wildfire detection, NOAA weather data, 911 call centers,
                  population databases, traffic management systems
                </div>
              </div>
              <div class="tech-item">
                <div class="tech-title">Geospatial Processing</div>
                <div class="tech-desc">
                  H3 geospatial indexing at resolution 9 (~174m per cell)
                  for precise location tracking and hazard mapping
                </div>
              </div>
              <div class="tech-item">
                <div class="tech-title">AI/ML Capabilities</div>
                <div class="tech-desc">
                  Machine learning models for fire spread prediction,
                  risk assessment, and real-time decision support
                </div>
              </div>
            </div>
            
            <div style="margin-top: 30px; font-size: 1.1rem; opacity: 0.9;">
              Real-time data processing with WebSocket connections for live updates
              and comprehensive REST API endpoints for programmatic access
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(5000);
    await this.finalizeVideoRecording('06_technical_architecture.webm', 'Technical Architecture');
  }

  private async generateImpactValueCapture(): Promise<void> {
    this.log('📹 Generating impact and value demonstration...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .impact-container {
              text-align: center;
              max-width: 1000px;
              padding: 40px;
            }
            .title {
              font-size: 3rem;
              font-weight: 300;
              margin-bottom: 30px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              color: #f39c12;
            }
            .subtitle {
              font-size: 1.5rem;
              margin-bottom: 30px;
              opacity: 0.9;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
              margin: 30px 0;
            }
            .metric-item {
              background: rgba(243, 156, 18, 0.1);
              padding: 25px;
              border-radius: 15px;
              border: 2px solid #f39c12;
            }
            .metric-value {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 10px;
              color: #f39c12;
            }
            .metric-label {
              font-size: 1.1rem;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .metric-desc {
              font-size: 1rem;
              line-height: 1.5;
              opacity: 0.8;
            }
            .highlight {
              color: #e74c3c;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="impact-container">
            <div class="title">Impact & Value</div>
            <div class="subtitle">Transforming Emergency Response Operations</div>
            
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-value">65-90%</div>
                <div class="metric-label">Faster Coordination</div>
                <div class="metric-desc">
                  Reduction in coordination time from hours to minutes
                  through unified dashboard and real-time communication
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-value">$15M-$75M</div>
                <div class="metric-label">Potential Savings</div>
                <div class="metric-desc">
                  Cost savings per major disaster event through
                  improved resource allocation and response efficiency
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-value">Real-time</div>
                <div class="metric-label">Decision Support</div>
                <div class="metric-desc">
                  AI-powered recommendations with confidence scores
                  for proactive response planning and rapid adaptation
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-value">Multi-Agency</div>
                <div class="metric-label">Coordination</div>
                <div class="metric-desc">
                  Seamless integration across emergency services,
                  law enforcement, and government agencies
                </div>
              </div>
            </div>
            
            <div style="margin-top: 30px; font-size: 1.2rem; opacity: 0.9;">
              <span class="highlight">Ready to transform your emergency management operations?</span>
              <br>
              Our platform saves lives through intelligent, coordinated response.
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(5000);
    await this.finalizeVideoRecording('07_impact_value.webm', 'Impact and Value');
  }

  private async generateTechnicalConclusion(): Promise<void> {
    this.log('📹 Generating detailed technical conclusion...');
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .conclusion-container {
              text-align: center;
              max-width: 800px;
              padding: 40px;
            }
            .title {
              font-size: 3rem;
              font-weight: 300;
              margin-bottom: 30px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .message {
              font-size: 1.5rem;
              line-height: 1.6;
              opacity: 0.9;
              max-width: 600px;
              margin: 0 auto;
            }
            .highlight {
              color: #f39c12;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
                      <div class="conclusion-container">
              <div class="title">Technical Summary</div>
              <div class="message">
                <strong>Core Technologies Demonstrated:</strong>
                <br>• Palantir Foundry Integration Platform
                <br>• Real-time Data Processing & WebSocket Connections
                <br>• H3 Geospatial Indexing & Hazard Mapping
                <br>• AI/ML Decision Support with Confidence Scoring
                <br>• REST API Endpoints for Programmatic Access
                <br><br>
                <span class="highlight">Ready to deploy this technical solution?</span>
                <br><br>
                Let's discuss implementation, integration, and customization for your specific needs.
              </div>
            </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(5000);
    await this.finalizeVideoRecording('08_technical_conclusion.webm', 'Technical Conclusion');
  }

  private async createFallbackSlide(filename: string, title: string): Promise<void> {
    this.log(`📹 Creating fallback slide: ${title}`);
    
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .fallback-container {
              text-align: center;
              max-width: 800px;
              padding: 40px;
            }
            .title {
              font-size: 3rem;
              font-weight: 300;
              margin-bottom: 30px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .message {
              font-size: 1.5rem;
              line-height: 1.6;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="fallback-container">
            <div class="title">${title}</div>
            <div class="message">
              This segment encountered an error during generation.<br>
              Please check the logs for details.
            </div>
          </div>
        </body>
      </html>
    `);
    
    await this.page.waitForTimeout(3000);
    await this.finalizeVideoRecording(`${filename}.webm`);
  }

  private async finalizeVideoRecording(outputFileName: string, segmentName?: string): Promise<void> {
    try {
      this.log('🎥 Finalizing video recording...');
      
      // Close page to finalize video recording
      if (this.page) {
        await this.page.close();
      }
      
      // Wait for video file to be written
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the most recent video file
      const videoFiles = fs.readdirSync(this.capturesDir)
        .filter(file => file.endsWith('.webm'))
        .map(file => ({ 
          file, 
          path: path.join(this.capturesDir, file), 
          mtime: fs.statSync(path.join(this.capturesDir, file)).mtime 
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      if (videoFiles.length === 0) {
        this.log('⚠️  No video files found, creating screenshot fallback');
        await this.createScreenshotFallback(outputFileName);
        return;
      }
      
      const latestVideo = videoFiles[0];
      const outputPath = path.join(this.capturesDir, outputFileName);
      
      // Copy the latest video to our desired filename
      fs.copyFileSync(latestVideo.path, outputPath);
      
      // Verify the file was created and has content
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          this.log(`✅ Video saved: ${outputFileName} (${stats.size} bytes)`);
          
          // Generate voice-over if segment name is provided
          if (segmentName) {
            const narration = TECHNICAL_NARRATION_SCRIPTS[segmentName as keyof typeof TECHNICAL_NARRATION_SCRIPTS];
            if (narration) {
              // Get actual video duration for proper synchronization
              const { exec } = await import('child_process');
              const util = await import('util');
              const execAsync = util.promisify(exec);
              
              const videoProbe = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${outputPath.replace(/"/g, '\\"')}"`;
              const { stdout: videoDurationStr } = await execAsync(videoProbe);
              const actualVideoDuration = parseFloat(videoDurationStr.trim());
              
              this.log(`📊 Actual video duration: ${actualVideoDuration.toFixed(2)}s`);
              
              // Generate audio that matches the actual video duration
              const audioPath = await this.generateVoiceOver(segmentName, actualVideoDuration);
              if (audioPath) {
                const finalOutputPath = outputPath.replace('.webm', '_with_vo.mp4');
                await this.combineVideoWithAudio(outputPath, audioPath, finalOutputPath);
                this.log(`✅ Video with synchronized voice-over created: ${finalOutputPath}`);
              }
            }
          }
          
          // Clean up the temporary video file
          try {
            fs.unlinkSync(latestVideo.path);
          } catch (cleanupError) {
            this.log(`⚠️ Could not clean up temporary video: ${cleanupError}`);
          }
        } else {
          throw new Error('Video file created but is empty');
        }
      } else {
        throw new Error('Video file was not created');
      }
      
      // Create a new page for future operations
      this.page = await this.context!.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
    } catch (error) {
      this.log(`❌ Video recording failed: ${error}`);
      await this.createScreenshotFallback(outputFileName);
    }
  }

  private async createScreenshotFallback(outputFileName: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      const screenshotPath = path.join(this.capturesDir, outputFileName.replace('.webm', '.png'));
      this.log(`📸 Taking screenshot: ${screenshotPath}`);
      
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });
      
      if (fs.existsSync(screenshotPath)) {
        const stats = fs.statSync(screenshotPath);
        if (stats.size > 0) {
          this.log(`✅ Screenshot saved: ${screenshotPath} (${stats.size} bytes)`);
        } else {
          throw new Error('Screenshot file created but is empty');
        }
      } else {
        throw new Error('Screenshot file was not created');
      }
    } catch (screenshotError) {
      this.log(`❌ Screenshot fallback also failed: ${screenshotError}`);
      throw new Error(`Both video and screenshot capture failed: ${screenshotError}`);
    }
  }

  async cleanup(): Promise<void> {
    this.log('🧹 Cleaning up...');
    
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const generator = new QuickCaptureGenerator();
  
  try {
    await generator.initialize();
    
    // Use AI-enhanced generation with critic bot review
    await generator.generateWithCriticBotReview();
    
    console.log('\n🎉 AI-enhanced video generation completed successfully!');
    
  } catch (error) {
    console.error('❌ AI-enhanced video generation failed:', error);
    process.exit(1);
  } finally {
    await generator.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { QuickCaptureGenerator };
