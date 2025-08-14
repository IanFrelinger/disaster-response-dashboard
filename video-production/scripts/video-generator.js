#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '../output');
        this.voiceDir = path.join(this.outputDir, 'voice-recordings');
        this.musicDir = path.join(this.outputDir, 'background-music');
        this.videoDir = path.join(this.outputDir, 'generated-videos');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.voiceDir, this.musicDir, this.videoDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async runFFmpeg(args) {
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', args, { stdio: 'inherit' });
            
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });
            
            ffmpeg.on('error', (err) => {
                reject(err);
            });
        });
    }

    async generateBackgroundMusic() {
        console.log('🎵 Generating background music...');
        
        // Create a simple ambient background track using FFmpeg
        const musicPath = path.join(this.musicDir, 'ambient-background.wav');
        
        try {
            // Generate 4 minutes of ambient music (240 seconds)
            const ffmpegArgs = [
                '-f', 'lavfi',
                '-i', 'sine=frequency=440:duration=240',
                '-f', 'lavfi',
                '-i', 'sine=frequency=220:duration=240',
                '-filter_complex', '[0][1]amix=inputs=2:duration=longest:weights=0.7:0.3',
                '-af', 'lowpass=f=800,highpass=f=200,volume=0.3',
                '-ar', '44100',
                '-ac', '2',
                '-y',
                musicPath
            ];

            await this.runFFmpeg(ffmpegArgs);
            console.log('✅ Background music generated');
            return musicPath;
        } catch (error) {
            console.log('⚠️  Background music generation failed, continuing without music');
            return null;
        }
    }

    async generateSceneVideo(sceneNumber, duration, narration, screenshotPath = null) {
        console.log(`🎬 Generating scene ${sceneNumber} (${duration}s)...`);
        
        const sceneDir = path.join(this.videoDir, `scene-${sceneNumber.toString().padStart(2, '0')}`);
        if (!fs.existsSync(sceneDir)) {
            fs.mkdirSync(sceneDir, { recursive: true });
        }

        // Create a dynamic scene with color transitions and effects
        const outputPath = path.join(sceneDir, 'scene.mp4');
        
        try {
            // Create a dynamic scene with color transitions and visual effects
            const ffmpegArgs = [
                '-f', 'lavfi',
                '-i', `color=c=0x1a1a2e:size=1920x1080:duration=${duration}`,
                '-f', 'lavfi',
                '-i', `sine=frequency=1000:duration=${duration}`,
                '-vf', `hue=h=30*t,scale=1920:1080:zoom=1+0.1*sin(t/2)`,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-ar', '44100',
                '-shortest',
                '-y',
                outputPath
            ];

            await this.runFFmpeg(ffmpegArgs);
            console.log(`✅ Scene ${sceneNumber} generated`);
            return outputPath;
        } catch (error) {
            console.error(`❌ Failed to generate scene ${sceneNumber}:`, error.message);
            return null;
        }
    }

    async generateAllScenes() {
        console.log('🎬 Generating all scenes...');
        
        const scenes = [
            { number: 1, duration: 15, narration: 'When disasters strike, emergency managers face a nightmare of fragmented systems and delayed responses.' },
            { number: 2, duration: 15, narration: 'Every minute of delay costs lives. Traditional systems take hours to coordinate - we don\'t have hours.' },
            { number: 3, duration: 15, narration: 'Our unified dashboard gives emergency commanders, first responders, and agencies one platform for coordinated action.' },
            { number: 4, duration: 15, narration: 'See all threats in real-time. Our multi-hazard map integrates wildfire, flood, earthquake, and severe weather data.' },
            { number: 5, duration: 15, narration: 'Generate safe evacuation routes with one click. Our AI analyzes terrain, hazards, and traffic to find the safest path.' },
            { number: 6, duration: 15, narration: 'Routes update automatically as conditions change. What was safe 10 minutes ago might be deadly now.' },
            { number: 7, duration: 15, narration: '3D terrain visualization reveals critical elevation changes, flood zones, and escape routes invisible on flat maps.' },
            { number: 8, duration: 15, narration: 'Manage mass evacuations efficiently. Our dashboard tracks every vehicle, person, and resource in real-time.' },
            { number: 9, duration: 15, narration: 'AI analyzes patterns and provides real-time recommendations. Make data-driven decisions under pressure.' },
            { number: 10, duration: 15, narration: 'Real-time weather data from NOAA predicts how conditions will change, helping you stay ahead of the storm.' },
            { number: 11, duration: 15, narration: 'Commanders get strategic overviews with high-level metrics and resource allocation at a glance.' },
            { number: 12, duration: 15, narration: 'First responders see tactical details for immediate action - turn-by-turn directions, hazard alerts, and team status.' },
            { number: 13, duration: 15, narration: 'Keep citizens informed with real-time updates. Clear communication saves lives and reduces panic.' },
            { number: 14, duration: 15, narration: 'Our system reduces response time by 80%, improves coordination by 90%, and saves countless lives.' },
            { number: 15, duration: 15, narration: 'Transform your emergency response today. When minutes matter, every second counts.' }
        ];

        const scenePaths = [];
        
        for (const scene of scenes) {
            const scenePath = await this.generateSceneVideo(scene.number, scene.duration, scene.narration);
            if (scenePath) {
                scenePaths.push({
                    path: scenePath,
                    duration: scene.duration,
                    number: scene.number
                });
            }
        }

        return scenePaths;
    }

    async concatenateScenes(scenePaths, backgroundMusicPath) {
        console.log('🔗 Concatenating scenes...');
        
        const fileListPath = path.join(this.videoDir, 'filelist.txt');
        const outputPath = path.join(this.outputDir, 'disaster-response-dynamic.mp4');
        
        // Create file list for FFmpeg concatenation
        const fileList = scenePaths.map(scene => `file '${scene.path}'`).join('\n');
        fs.writeFileSync(fileListPath, fileList);
        
        try {
            // Concatenate all scenes
            const concatArgs = [
                '-f', 'concat',
                '-safe', '0',
                '-i', fileListPath,
                '-c', 'copy',
                '-y',
                outputPath
            ];

            await this.runFFmpeg(concatArgs);
            console.log('✅ Scenes concatenated');
            
            // Now add background music
            if (backgroundMusicPath && fs.existsSync(backgroundMusicPath)) {
                const finalOutputPath = path.join(this.outputDir, 'disaster-response-final.mp4');
                
                const musicArgs = [
                    '-i', outputPath,
                    '-i', backgroundMusicPath,
                    '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=longest:weights=0.8:0.2',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    '-ar', '44100',
                    '-shortest',
                    '-y',
                    finalOutputPath
                ];

                await this.runFFmpeg(musicArgs);
                console.log('✅ Background music added');
                
                // Clean up intermediate file
                fs.unlinkSync(outputPath);
                
                return finalOutputPath;
            }
            
            return outputPath;
        } catch (error) {
            console.error('❌ Failed to concatenate scenes:', error.message);
            return null;
        }
    }

    async run() {
        console.log('🎬 Dynamic Video Generator');
        console.log('==========================');
        
        try {
            // Generate background music
            const backgroundMusicPath = await this.generateBackgroundMusic();
            
            // Generate all scenes
            const scenePaths = await this.generateAllScenes();
            
            if (scenePaths.length === 0) {
                throw new Error('No scenes were generated successfully');
            }
            
            // Concatenate scenes and add music
            const finalVideoPath = await this.concatenateScenes(scenePaths, backgroundMusicPath);
            
            if (finalVideoPath) {
                console.log('🎉 Video generation complete!');
                console.log(`📹 Final video: ${finalVideoPath}`);
                
                // Generate summary report
                const summary = {
                    timestamp: new Date().toISOString(),
                    scenesGenerated: scenePaths.length,
                    totalDuration: scenePaths.reduce((sum, scene) => sum + scene.duration, 0),
                    backgroundMusic: backgroundMusicPath ? 'Generated' : 'None',
                    finalVideo: finalVideoPath,
                    fileSize: fs.existsSync(finalVideoPath) ? fs.statSync(finalVideoPath).size : 0
                };
                
                const summaryPath = path.join(this.outputDir, 'video-generation-summary.json');
                fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
                console.log(`📋 Summary saved: ${summaryPath}`);
                
                return finalVideoPath;
            } else {
                throw new Error('Failed to create final video');
            }
        } catch (error) {
            console.error('❌ Video generation failed:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new VideoGenerator();
    generator.run().catch(console.error);
}

export default VideoGenerator;
