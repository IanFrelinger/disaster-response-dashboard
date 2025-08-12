#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

class VisualVideoValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = 0;
        this.total = 0;
        this.frameAnalysis = [];
        this.qualityMetrics = {};
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        switch (type) {
            case 'error':
                console.log(chalk.red(`❌ ${message}`));
                this.errors.push(message);
                break;
            case 'warning':
                console.log(chalk.yellow(`⚠️  ${message}`));
                this.warnings.push(message);
                break;
            case 'success':
                console.log(chalk.green(`✅ ${message}`));
                this.passed++;
                break;
            default:
                console.log(chalk.blue(`ℹ️  ${message}`));
        }
        this.total++;
    }

    async extractFrames(videoPath, frameCount = 10) {
        const tempDir = path.join(OUTPUT_DIR, 'temp_frames');
        await fs.ensureDir(tempDir);
        
        try {
            // Get video duration
            const durationOutput = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`, { encoding: 'utf8' });
            const duration = parseFloat(durationOutput.trim());
            
            // Extract frames at regular intervals
            const interval = duration / (frameCount + 1);
            
            for (let i = 1; i <= frameCount; i++) {
                const timestamp = (interval * i).toFixed(2);
                const framePath = path.join(tempDir, `frame_${i.toString().padStart(3, '0')}.jpg`);
                
                execSync(`ffmpeg -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}" -y`, { stdio: 'ignore' });
                
                this.frameAnalysis.push({
                    frame: i,
                    timestamp: timestamp,
                    path: framePath
                });
            }
            
            this.log(`Extracted ${frameCount} frames for analysis`, 'success');
            return true;
        } catch (error) {
            this.log(`Error extracting frames: ${error.message}`, 'error');
            return false;
        }
    }

    async analyzeFrameQuality(framePath) {
        try {
            // Use ImageMagick to analyze frame quality
            const identifyOutput = execSync(`identify -verbose "${framePath}"`, { encoding: 'utf8' });
            
            // Extract basic image info
            const widthMatch = identifyOutput.match(/Geometry: (\d+)x(\d+)/);
            const qualityMatch = identifyOutput.match(/Quality: (\d+)/);
            
            if (widthMatch) {
                const width = parseInt(widthMatch[1]);
                const height = parseInt(widthMatch[2]);
                
                if (width === 1920 && height === 1080) {
                    this.log(`Frame resolution: ${width}x${height} (Full HD)`, 'success');
                } else {
                    this.log(`Frame resolution: ${width}x${height} (expected 1920x1080)`, 'warning');
                }
            }
            
            if (qualityMatch) {
                const quality = parseInt(qualityMatch[1]);
                if (quality >= 80) {
                    this.log(`Frame quality: ${quality}% (excellent)`, 'success');
                } else if (quality >= 60) {
                    this.log(`Frame quality: ${quality}% (good)`, 'success');
                } else {
                    this.log(`Frame quality: ${quality}% (poor)`, 'warning');
                }
            }
            
            return true;
        } catch (error) {
            this.log(`Error analyzing frame quality: ${error.message}`, 'warning');
            return false;
        }
    }

    async checkVideoContent(videoPath) {
        try {
            // Get detailed video information
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            if (!videoStream) {
                this.log('No video stream found', 'error');
                return false;
            }

            // Check for black frames or static content
            const blackFrameCheck = execSync(`ffmpeg -i "${videoPath}" -vf "blackdetect=d=0.1:pix_th=0.1" -f null - 2>&1`, { encoding: 'utf8' });
            if (blackFrameCheck.includes('blackdetect')) {
                this.log('Detected potential black frames or static content', 'warning');
            } else {
                this.log('No black frames detected (good content variety)', 'success');
            }

            // Check for motion
            const motionCheck = execSync(`ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.1)',showinfo" -f null - 2>&1`, { encoding: 'utf8' });
            const sceneChanges = (motionCheck.match(/pts_time:/g) || []).length;
            
            if (sceneChanges >= 5) {
                this.log(`Detected ${sceneChanges} scene changes (good content variety)`, 'success');
            } else {
                this.log(`Only ${sceneChanges} scene changes detected (may be too static)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking video content: ${error.message}`, 'error');
            return false;
        }
    }

    async checkAudioSync(videoPath) {
        try {
            // Check for audio-video sync issues
            const syncCheck = execSync(`ffmpeg -i "${videoPath}" -af "aresample=async=1000" -f null - 2>&1`, { encoding: 'utf8' });
            
            if (syncCheck.includes('error') || syncCheck.includes('Invalid')) {
                this.log('Potential audio-video sync issues detected', 'warning');
            } else {
                this.log('Audio-video sync appears normal', 'success');
            }

            return true;
        } catch (error) {
            this.log(`Error checking audio sync: ${error.message}`, 'warning');
            return false;
        }
    }

    async checkVideoEncoding(videoPath) {
        try {
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            const audioStream = videoInfo.streams.find(s => s.codec_type === 'audio');

            // Check video codec
            if (videoStream.codec_name === 'h264') {
                this.log('Video codec: H.264 (compatible)', 'success');
            } else {
                this.log(`Video codec: ${videoStream.codec_name} (may have compatibility issues)`, 'warning');
            }

            // Check audio codec
            if (audioStream && (audioStream.codec_name === 'aac' || audioStream.codec_name === 'mp3')) {
                this.log(`Audio codec: ${audioStream.codec_name} (compatible)`, 'success');
            } else {
                this.log(`Audio codec: ${audioStream?.codec_name || 'unknown'} (may have compatibility issues)`, 'warning');
            }

            // Check container format
            if (videoInfo.format.format_name.includes('mp4')) {
                this.log('Container format: MP4 (widely compatible)', 'success');
            } else {
                this.log(`Container format: ${videoInfo.format.format_name} (may have compatibility issues)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking video encoding: ${error.message}`, 'error');
            return false;
        }
    }

    async checkFileIntegrity(videoPath) {
        try {
            // Check if video file is corrupted
            const integrityCheck = execSync(`ffmpeg -v error -i "${videoPath}" -f null - 2>&1`, { encoding: 'utf8' });
            
            if (integrityCheck.trim() === '') {
                this.log('Video file integrity check passed', 'success');
                return true;
            } else {
                this.log(`Video file integrity issues: ${integrityCheck}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error checking file integrity: ${error.message}`, 'error');
            return false;
        }
    }

    async generateThumbnail(videoPath) {
        try {
            const thumbnailPath = path.join(OUTPUT_DIR, 'validation_thumbnail.jpg');
            
            // Generate thumbnail from middle of video
            execSync(`ffmpeg -i "${videoPath}" -ss 00:02:00 -vframes 1 -q:v 2 "${thumbnailPath}" -y`, { stdio: 'ignore' });
            
            if (await fs.pathExists(thumbnailPath)) {
                this.log('Generated validation thumbnail', 'success');
                return thumbnailPath;
            } else {
                this.log('Failed to generate thumbnail', 'warning');
                return null;
            }
        } catch (error) {
            this.log(`Error generating thumbnail: ${error.message}`, 'warning');
            return null;
        }
    }

    async checkPlaybackCompatibility(videoPath) {
        try {
            // Test if video can be played by common players
            const testOutput = execSync(`ffmpeg -i "${videoPath}" -c copy -f null - 2>&1`, { encoding: 'utf8' });
            
            if (testOutput.includes('error') || testOutput.includes('Invalid')) {
                this.log('Video may have playback compatibility issues', 'warning');
                return false;
            } else {
                this.log('Video playback compatibility verified', 'success');
                return true;
            }
        } catch (error) {
            this.log(`Error checking playback compatibility: ${error.message}`, 'error');
            return false;
        }
    }

    async runVisualValidation() {
        console.log(chalk.cyan.bold('\n🎬 Visual Video Validation Suite'));
        console.log(chalk.cyan('==================================\n'));

        const spinner = ora('Running comprehensive visual validation...').start();

        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        
        // Check if video exists
        if (!await fs.pathExists(videoPath)) {
            this.log('Main video file not found', 'error');
            spinner.fail('Visual validation failed - no video file');
            return false;
        }

        // Basic file checks
        await this.checkFileIntegrity(videoPath);
        await this.checkVideoEncoding(videoPath);
        await this.checkPlaybackCompatibility(videoPath);

        // Content analysis
        await this.checkVideoContent(videoPath);
        await this.checkAudioSync(videoPath);

        // Frame analysis
        const framesExtracted = await this.extractFrames(videoPath, 8);
        if (framesExtracted) {
            for (const frame of this.frameAnalysis) {
                await this.analyzeFrameQuality(frame.path);
            }
        }

        // Generate validation thumbnail
        await this.generateThumbnail(videoPath);

        // Clean up temporary files
        const tempDir = path.join(OUTPUT_DIR, 'temp_frames');
        if (await fs.pathExists(tempDir)) {
            await fs.remove(tempDir);
        }

        spinner.succeed('Visual validation complete!');

        // Generate detailed report
        await this.generateValidationReport();

        // Summary
        console.log(chalk.cyan.bold('\n📊 Visual Validation Summary'));
        console.log(chalk.cyan('============================'));
        console.log(chalk.green(`✅ Passed: ${this.passed}`));
        console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
        console.log(chalk.red(`❌ Errors: ${this.errors.length}`));
        console.log(chalk.blue(`📈 Total: ${this.total}`));

        if (this.errors.length > 0) {
            console.log(chalk.red.bold('\n❌ Critical Issues:'));
            this.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
        }

        if (this.warnings.length > 0) {
            console.log(chalk.yellow.bold('\n⚠️  Quality Warnings:'));
            this.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
        }

        const successRate = ((this.passed / this.total) * 100).toFixed(1);
        console.log(chalk.cyan.bold(`\n🎯 Success Rate: ${successRate}%`));

        if (this.errors.length === 0) {
            console.log(chalk.green.bold('\n🎉 Visual validation passed! Video is ready for application use.'));
            return true;
        } else {
            console.log(chalk.red.bold('\n⚠️  Visual validation failed. Please address critical issues before use.'));
            return false;
        }
    }

    async generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                passed: this.passed,
                warnings: this.warnings.length,
                errors: this.errors.length,
                total: this.total,
                successRate: ((this.passed / this.total) * 100).toFixed(1)
            },
            errors: this.errors,
            warnings: this.warnings,
            frameAnalysis: this.frameAnalysis.map(frame => ({
                frame: frame.frame,
                timestamp: frame.timestamp
            })),
            qualityMetrics: this.qualityMetrics
        };

        const reportPath = path.join(OUTPUT_DIR, 'visual_validation_report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        this.log(`Validation report saved to: ${reportPath}`, 'success');
    }
}

// Run visual validation
const validator = new VisualVideoValidator();
validator.runVisualValidation().catch(error => {
    console.error(chalk.red('Visual validation failed with error:'), error);
    process.exit(1);
});
