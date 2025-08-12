#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

class QuickValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = 0;
        this.total = 0;
    }

    log(message, type = 'info') {
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
                this.log(`${description} exists`);
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

    async checkVideoProperties(videoPath) {
        try {
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            if (!videoStream) {
                this.log('No video stream found', 'error');
                return false;
            }

            // Check resolution
            const width = parseInt(videoStream.width);
            const height = parseInt(videoStream.height);
            if (width === 1920 && height === 1080) {
                this.log(`Resolution: ${width}x${height} (Full HD)`);
            } else {
                this.log(`Resolution: ${width}x${height} (expected 1920x1080)`, 'warning');
            }

            // Check duration
            const duration = parseFloat(videoInfo.format.duration);
            const durationMinutes = duration / 60;
            if (durationMinutes >= 3.5 && durationMinutes <= 4.5) {
                this.log(`Duration: ${durationMinutes.toFixed(2)} minutes`);
            } else {
                this.log(`Duration: ${durationMinutes.toFixed(2)} minutes (expected 4:00 ±30s)`, 'warning');
            }

            // Check file size
            const stats = await fs.stat(videoPath);
            const sizeMB = stats.size / (1024 * 1024);
            if (sizeMB >= 5 && sizeMB <= 20) {
                this.log(`File size: ${sizeMB.toFixed(2)}MB (appropriate)`);
            } else {
                this.log(`File size: ${sizeMB.toFixed(2)}MB (may need adjustment)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking video properties: ${error.message}`, 'error');
            return false;
        }
    }

    async checkAudioQuality(videoPath) {
        try {
            const audioInfo = execSync(`ffprobe -v quiet -select_streams a:0 -show_entries stream=sample_rate,channels,codec_name -of json "${videoPath}"`, { encoding: 'utf8' });
            const audio = JSON.parse(audioInfo);
            
            if (audio.streams && audio.streams[0]) {
                const stream = audio.streams[0];
                const sampleRate = parseInt(stream.sample_rate);
                
                if (sampleRate >= 44100) {
                    this.log(`Audio quality: ${sampleRate}Hz (high quality)`);
                } else {
                    this.log(`Audio quality: ${sampleRate}Hz (low quality)`, 'warning');
                }
                
                return true;
            } else {
                this.log('No audio stream found', 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error checking audio quality: ${error.message}`, 'error');
            return false;
        }
    }

    async checkContentRelevance() {
        try {
            const captionsPath = path.join(OUTPUT_DIR, 'captions.vtt');
            if (await fs.pathExists(captionsPath)) {
                const captionsContent = await fs.readFile(captionsPath, 'utf8');
                
                const keyTerms = [
                    'disaster', 'response', 'dashboard', 'hazard', 'evacuation', 'emergency',
                    'map', 'route', 'building', 'weather', 'real-time', 'monitoring'
                ];
                
                const foundTerms = keyTerms.filter(term => 
                    captionsContent.toLowerCase().includes(term.toLowerCase())
                );
                
                if (foundTerms.length >= 8) {
                    this.log(`Content relevance: ${foundTerms.length}/12 key terms found`);
                } else {
                    this.log(`Content relevance: Only ${foundTerms.length}/12 key terms found`, 'warning');
                }
                
                return true;
            } else {
                this.log('Captions file not found for content analysis', 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error checking content relevance: ${error.message}`, 'error');
            return false;
        }
    }

    async runQuickValidation() {
        console.log(chalk.cyan.bold('\n🎬 Quick Video Validation'));
        console.log(chalk.cyan('========================\n'));

        const spinner = ora('Running quick validation...').start();

        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        
        if (!await fs.pathExists(videoPath)) {
            this.log('Main video file not found', 'error');
            spinner.fail('Quick validation failed - no video file');
            return false;
        }

        // Essential checks
        await this.checkVideoProperties(videoPath);
        await this.checkAudioQuality(videoPath);
        await this.checkContentRelevance();
        
        // Check supporting files
        await this.checkFileExists(path.join(OUTPUT_DIR, 'captions.vtt'), 'Captions file');
        await this.checkFileExists(path.join(OUTPUT_DIR, 'video-metadata.json'), 'Metadata file');
        await this.checkFileExists(path.join(OUTPUT_DIR, 'thumbnail.jpg'), 'Thumbnail file');

        spinner.succeed('Quick validation complete!');

        // Summary
        console.log(chalk.cyan.bold('\n📊 Quick Validation Summary'));
        console.log(chalk.cyan('==========================='));
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
            console.log(chalk.green.bold('\n🎉 Video is ready for application use!'));
            if (this.warnings.length > 0) {
                console.log(chalk.yellow('   Consider addressing warnings for optimal quality.'));
            }
            return true;
        } else {
            console.log(chalk.red.bold('\n⚠️  Video needs fixes before application use.'));
            return false;
        }
    }
}

// Run quick validation
const validator = new QuickValidator();
validator.runQuickValidation().catch(error => {
    console.error(chalk.red('Quick validation failed with error:'), error);
    process.exit(1);
});
