#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EnhancedTTSGenerator from './enhanced-tts-generator.js';
import VideoGenerator from './video-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveVideoPipeline {
    constructor() {
        this.outputDir = path.join(__dirname, '../output');
        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async runEnhancedTTS() {
        console.log('🎤 Step 1: Generating Enhanced TTS...');
        const ttsGenerator = new EnhancedTTSGenerator();
        return await ttsGenerator.run();
    }

    async runVideoGeneration() {
        console.log('🎬 Step 2: Generating Dynamic Video...');
        const videoGenerator = new VideoGenerator();
        return await videoGenerator.run();
    }

    async integrateAudioWithVideo(ttsResults, videoPath) {
        console.log('🔗 Step 3: Integrating Audio with Video...');
        
        if (!ttsResults || ttsResults.length === 0) {
            console.log('⚠️  No TTS results, skipping audio integration');
            return videoPath;
        }

        const finalOutputPath = path.join(this.outputDir, 'disaster-response-complete.mp4');
        
        try {
            // Create a complex filter to mix all audio tracks with the video
            const audioInputs = ttsResults.map((result, index) => `-i "${result.path}"`).join(' ');
            const audioMix = ttsResults.map((result, index) => `[${index + 1}:a]`).join('');
            
            // Calculate timing for each audio track
            let currentTime = 0;
            const audioTimings = ttsResults.map(result => {
                const start = currentTime;
                currentTime += result.duration;
                return { start, duration: result.duration };
            });

            // Create complex filter for audio mixing with timing
            const filterComplex = [
                // Mix all audio tracks
                `${audioMix}amix=inputs=${ttsResults.length}:duration=longest:weights=${ttsResults.map(() => '1').join(':')}[mixed_audio]`,
                // Add background music if available
                '[0:a][mixed_audio]amix=inputs=2:duration=longest:weights=0.3:0.7[final_audio]'
            ].join(';');

            const integrateCommand = [
                'ffmpeg',
                '-i', `"${videoPath}"`,
                audioInputs,
                '-filter_complex', `"${filterComplex}"`,
                '-map', '0:v',
                '-map', '[final_audio]',
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-b:a', '256k',
                '-ar', '44100',
                '-shortest',
                '-y',
                `"${finalOutputPath}"`
            ].join(' ');

            execSync(integrateCommand, { stdio: 'inherit' });
            console.log('✅ Audio integration complete');
            
            return finalOutputPath;
        } catch (error) {
            console.error('❌ Audio integration failed:', error.message);
            return videoPath;
        }
    }

    async addSubtitles(videoPath) {
        console.log('📝 Step 4: Adding Subtitles...');
        
        const subtitlesPath = path.join(this.outputDir, 'subtitles.srt');
        const finalOutputPath = path.join(this.outputDir, 'disaster-response-with-subtitles.mp4');
        
        if (!fs.existsSync(subtitlesPath)) {
            console.log('⚠️  No subtitles file found, skipping subtitle addition');
            return videoPath;
        }

        try {
            const subtitleCommand = [
                'ffmpeg',
                '-i', `"${videoPath}"`,
                '-vf', `subtitles="${subtitlesPath}":force_style='FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,BackColour=&H80000000,Bold=1'`,
                '-c:a', 'copy',
                '-y',
                `"${finalOutputPath}"`
            ].join(' ');

            execSync(subtitleCommand, { stdio: 'inherit' });
            console.log('✅ Subtitles added');
            
            return finalOutputPath;
        } catch (error) {
            console.error('❌ Subtitle addition failed:', error.message);
            return videoPath;
        }
    }

    async finalizeVideo(videoPath) {
        console.log('🎯 Step 5: Finalizing Video...');
        
        const finalOutputPath = path.join(this.outputDir, 'disaster-response-final.mp4');
        
        try {
            const finalizeCommand = [
                'ffmpeg',
                '-i', `"${videoPath}"`,
                '-c:v', 'libx264',
                '-preset', 'slow',
                '-crf', '18',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-ar', '44100',
                '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p',
                '-profile:v', 'high',
                '-level', '4.1',
                '-y',
                `"${finalOutputPath}"`
            ].join(' ');

            execSync(finalizeCommand, { stdio: 'inherit' });
            console.log('✅ Video finalized');
            
            return finalOutputPath;
        } catch (error) {
            console.error('❌ Video finalization failed:', error.message);
            return videoPath;
        }
    }

    async validateFinalVideo(videoPath) {
        console.log('🔍 Step 6: Validating Final Video...');
        
        try {
            const probeCommand = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                `"${videoPath}"`
            ].join(' ');

            const output = execSync(probeCommand, { encoding: 'utf8' });
            const metadata = JSON.parse(output);
            
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
            
            const validation = {
                timestamp: new Date().toISOString(),
                fileExists: fs.existsSync(videoPath),
                fileSize: fs.statSync(videoPath).size,
                duration: parseFloat(metadata.format.duration),
                videoCodec: videoStream?.codec_name || 'unknown',
                videoResolution: `${videoStream?.width || 0}x${videoStream?.height || 0}`,
                audioCodec: audioStream?.codec_name || 'unknown',
                audioSampleRate: audioStream?.sample_rate || 0,
                audioChannels: audioStream?.channels || 0
            };
            
            const validationPath = path.join(this.outputDir, 'final-video-validation.json');
            fs.writeFileSync(validationPath, JSON.stringify(validation, null, 2));
            
            console.log('✅ Video validation complete');
            console.log(`📊 Video: ${validation.videoCodec} ${validation.videoResolution}`);
            console.log(`📊 Audio: ${validation.audioCodec} ${validation.audioSampleRate}Hz ${validation.audioChannels}ch`);
            console.log(`📊 Duration: ${validation.duration.toFixed(1)}s`);
            console.log(`📊 File Size: ${(validation.fileSize / 1024 / 1024).toFixed(2)} MB`);
            
            return validation;
        } catch (error) {
            console.error('❌ Video validation failed:', error.message);
            return null;
        }
    }

    async run() {
        console.log('🎬 Comprehensive Video Pipeline');
        console.log('================================');
        
        try {
            // Step 1: Generate enhanced TTS
            const ttsResults = await this.runEnhancedTTS();
            
            // Step 2: Generate dynamic video
            const videoPath = await this.runVideoGeneration();
            
            // Step 3: Integrate audio with video
            const audioIntegratedPath = await this.integrateAudioWithVideo(ttsResults, videoPath);
            
            // Step 4: Add subtitles
            const subtitledPath = await this.addSubtitles(audioIntegratedPath);
            
            // Step 5: Finalize video
            const finalizedPath = await this.finalizeVideo(subtitledPath);
            
            // Step 6: Validate final video
            const validation = await this.validateFinalVideo(finalizedPath);
            
            console.log('🎉 Comprehensive Video Pipeline Complete!');
            console.log(`📹 Final video: ${finalizedPath}`);
            
            // Generate comprehensive summary
            const summary = {
                timestamp: new Date().toISOString(),
                pipeline: 'comprehensive',
                steps: {
                    tts: ttsResults ? 'completed' : 'failed',
                    video: videoPath ? 'completed' : 'failed',
                    audio: audioIntegratedPath ? 'completed' : 'failed',
                    subtitles: subtitledPath ? 'completed' : 'failed',
                    finalization: finalizedPath ? 'completed' : 'failed',
                    validation: validation ? 'completed' : 'failed'
                },
                ttsResults: ttsResults || [],
                videoPath: videoPath,
                audioIntegratedPath: audioIntegratedPath,
                subtitledPath: subtitledPath,
                finalizedPath: finalizedPath,
                validation: validation
            };
            
            const summaryPath = path.join(this.outputDir, 'comprehensive-pipeline-summary.json');
            fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
            console.log(`📋 Comprehensive summary saved: ${summaryPath}`);
            
            return {
                success: true,
                finalVideo: finalizedPath,
                validation: validation,
                summary: summary
            };
            
        } catch (error) {
            console.error('❌ Comprehensive pipeline failed:', error.message);
            
            const errorSummary = {
                timestamp: new Date().toISOString(),
                pipeline: 'comprehensive',
                error: error.message,
                stack: error.stack
            };
            
            const errorPath = path.join(this.outputDir, 'pipeline-error-summary.json');
            fs.writeFileSync(errorPath, JSON.stringify(errorSummary, null, 2));
            
            return {
                success: false,
                error: error.message,
                errorSummary: errorSummary
            };
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const pipeline = new ComprehensiveVideoPipeline();
    pipeline.run().catch(console.error);
}

export default ComprehensiveVideoPipeline;
