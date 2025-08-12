#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const OUTPUT_DIR = '/app/output';

class VideoValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = 0;
        this.total = 0;
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

    async checkFileExists(filePath, description) {
        try {
            const exists = await fs.pathExists(filePath);
            if (exists) {
                this.log(`${description} exists`, 'success');
                return true;
            } else {
                this.log(`${description} missing: ${filePath}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error checking ${description}: ${error.message}`, 'error');
            return false;
        }
    }

    async checkFileSize(filePath, minSize, maxSize, description) {
        try {
            const stats = await fs.stat(filePath);
            const sizeMB = stats.size / (1024 * 1024);
            
            if (sizeMB >= minSize && sizeMB <= maxSize) {
                this.log(`${description} size: ${sizeMB.toFixed(2)}MB (within range ${minSize}-${maxSize}MB)`, 'success');
                return true;
            } else {
                this.log(`${description} size: ${sizeMB.toFixed(2)}MB (expected ${minSize}-${maxSize}MB)`, 'warning');
                return false;
            }
        } catch (error) {
            this.log(`Error checking ${description} size: ${error.message}`, 'error');
            return false;
        }
    }

    async checkVideoProperties(videoPath) {
        try {
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            // Check video stream
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            if (!videoStream) {
                this.log('No video stream found', 'error');
                return false;
            }

            // Check resolution
            const width = parseInt(videoStream.width);
            const height = parseInt(videoStream.height);
            if (width === 1920 && height === 1080) {
                this.log(`Video resolution: ${width}x${height} (Full HD)`, 'success');
            } else {
                this.log(`Video resolution: ${width}x${height} (expected 1920x1080)`, 'warning');
            }

            // Check duration
            const duration = parseFloat(videoInfo.format.duration);
            const durationMinutes = duration / 60;
            if (durationMinutes >= 3.5 && durationMinutes <= 4.5) {
                this.log(`Video duration: ${durationMinutes.toFixed(2)} minutes (within expected range)`, 'success');
            } else {
                this.log(`Video duration: ${durationMinutes.toFixed(2)} minutes (expected 4:00)`, 'warning');
            }

            // Check bitrate
            const bitrate = parseInt(videoInfo.format.bit_rate) / 1000; // kbps
            if (bitrate >= 2000 && bitrate <= 10000) {
                this.log(`Video bitrate: ${bitrate.toFixed(0)} kbps (good quality)`, 'success');
            } else {
                this.log(`Video bitrate: ${bitrate.toFixed(0)} kbps (may need adjustment)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking video properties: ${error.message}`, 'error');
            return false;
        }
    }

    async checkAudioProperties(audioPath) {
        try {
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${audioPath}"`, { encoding: 'utf8' });
            const audioInfo = JSON.parse(ffprobeOutput);
            
            const audioStream = audioInfo.streams.find(s => s.codec_type === 'audio');
            if (!audioStream) {
                this.log('No audio stream found in voiceover', 'error');
                return false;
            }

            // Check audio duration
            const duration = parseFloat(audioInfo.format.duration);
            const durationMinutes = duration / 60;
            if (durationMinutes >= 3.5 && durationMinutes <= 4.5) {
                this.log(`Audio duration: ${durationMinutes.toFixed(2)} minutes (matches video)`, 'success');
            } else {
                this.log(`Audio duration: ${durationMinutes.toFixed(2)} minutes (should match video)`, 'warning');
            }

            // Check audio quality
            const sampleRate = parseInt(audioStream.sample_rate);
            if (sampleRate >= 44100) {
                this.log(`Audio sample rate: ${sampleRate}Hz (good quality)`, 'success');
            } else {
                this.log(`Audio sample rate: ${sampleRate}Hz (low quality)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking audio properties: ${error.message}`, 'error');
            return false;
        }
    }

    async checkCaptions(captionsPath) {
        try {
            const captionsContent = await fs.readFile(captionsPath, 'utf8');
            
            // Check if captions file has content
            if (captionsContent.trim().length === 0) {
                this.log('Captions file is empty', 'error');
                return false;
            }

            // Check for basic VTT format
            if (captionsContent.includes('WEBVTT') && captionsContent.includes('-->')) {
                this.log('Captions file has valid VTT format', 'success');
            } else {
                this.log('Captions file may not be in valid VTT format', 'warning');
            }

            // Count caption entries
            const captionEntries = captionsContent.split('\n\n').filter(entry => entry.trim().length > 0);
            if (captionEntries.length >= 5) {
                this.log(`Captions file has ${captionEntries.length} entries`, 'success');
            } else {
                this.log(`Captions file has only ${captionEntries.length} entries (expected more)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking captions: ${error.message}`, 'error');
            return false;
        }
    }

    async checkMetadata(metadataPath) {
        try {
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent);
            
            // Check required fields
            const requiredFields = ['title', 'description', 'duration', 'resolution', 'format'];
            for (const field of requiredFields) {
                if (metadata[field]) {
                    this.log(`Metadata field '${field}' present`, 'success');
                } else {
                    this.log(`Metadata field '${field}' missing`, 'error');
                }
            }

            // Check duration format
            if (metadata.duration && /^\d+:\d{2}$/.test(metadata.duration)) {
                this.log('Metadata duration format is valid', 'success');
            } else {
                this.log('Metadata duration format is invalid', 'warning');
            }

            // Check resolution format
            if (metadata.resolution && /^\d+x\d+$/.test(metadata.resolution)) {
                this.log('Metadata resolution format is valid', 'success');
            } else {
                this.log('Metadata resolution format is invalid', 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking metadata: ${error.message}`, 'error');
            return false;
        }
    }

    async runValidation() {
        console.log(chalk.cyan.bold('\n🎬 Video Validation Suite'));
        console.log(chalk.cyan('================================\n'));

        const spinner = ora('Running validation tests...').start();

        // Check output directory
        const outputExists = await fs.pathExists(OUTPUT_DIR);
        if (!outputExists) {
            this.log('Output directory does not exist', 'error');
            spinner.fail('Validation failed - no output directory');
            return false;
        }

        // File existence checks
        await this.checkFileExists(path.join(OUTPUT_DIR, 'disaster-response-demo.mp4'), 'Final video file');
        await this.checkFileExists(path.join(OUTPUT_DIR, 'voiceover.wav'), 'Voiceover audio file');
        await this.checkFileExists(path.join(OUTPUT_DIR, 'captions.vtt'), 'Captions file');
        await this.checkFileExists(path.join(OUTPUT_DIR, 'video-metadata.json'), 'Metadata file');

        // File size checks
        await this.checkFileSize(path.join(OUTPUT_DIR, 'disaster-response-demo.mp4'), 1, 100, 'Final video');
        await this.checkFileSize(path.join(OUTPUT_DIR, 'voiceover.wav'), 0.1, 10, 'Voiceover audio');

        // Video properties check
        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        if (await fs.pathExists(videoPath)) {
            await this.checkVideoProperties(videoPath);
        }

        // Audio properties check
        const audioPath = path.join(OUTPUT_DIR, 'voiceover.wav');
        if (await fs.pathExists(audioPath)) {
            await this.checkAudioProperties(audioPath);
        }

        // Captions check
        const captionsPath = path.join(OUTPUT_DIR, 'captions.vtt');
        if (await fs.pathExists(captionsPath)) {
            await this.checkCaptions(captionsPath);
        }

        // Metadata check
        const metadataPath = path.join(OUTPUT_DIR, 'video-metadata.json');
        if (await fs.pathExists(metadataPath)) {
            await this.checkMetadata(metadataPath);
        }

        spinner.succeed('Validation complete!');

        // Summary
        console.log(chalk.cyan.bold('\n📊 Validation Summary'));
        console.log(chalk.cyan('==================='));
        console.log(chalk.green(`✅ Passed: ${this.passed}`));
        console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
        console.log(chalk.red(`❌ Errors: ${this.errors.length}`));
        console.log(chalk.blue(`📈 Total: ${this.total}`));

        if (this.errors.length > 0) {
            console.log(chalk.red.bold('\n❌ Errors Found:'));
            this.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
        }

        if (this.warnings.length > 0) {
            console.log(chalk.yellow.bold('\n⚠️  Warnings:'));
            this.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
        }

        const successRate = ((this.passed / this.total) * 100).toFixed(1);
        console.log(chalk.cyan.bold(`\n🎯 Success Rate: ${successRate}%`));

        if (this.errors.length === 0) {
            console.log(chalk.green.bold('\n🎉 Video validation passed! Ready for submission.'));
            return true;
        } else {
            console.log(chalk.red.bold('\n⚠️  Video validation failed. Please fix errors before submission.'));
            return false;
        }
    }
}

// Run validation
const validator = new VideoValidator();
validator.runValidation().catch(error => {
    console.error(chalk.red('Validation failed with error:'), error);
    process.exit(1);
});
