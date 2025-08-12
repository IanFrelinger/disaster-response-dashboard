#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const OUTPUT_DIR = '/app/output';
const TEMP_DIR = '/app/temp';

class IntegrationTester {
    constructor() {
        this.testResults = [];
        this.passed = 0;
        this.failed = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        switch (type) {
            case 'error':
                console.log(chalk.red(`❌ ${message}`));
                this.testResults.push({ test: message, status: 'FAILED' });
                this.failed++;
                break;
            case 'success':
                console.log(chalk.green(`✅ ${message}`));
                this.testResults.push({ test: message, status: 'PASSED' });
                this.passed++;
                break;
            default:
                console.log(chalk.blue(`ℹ️  ${message}`));
        }
    }

    async testEnvironment() {
        console.log(chalk.cyan.bold('\n🔧 Testing Environment'));
        console.log(chalk.cyan('===================='));

        // Test FFmpeg availability
        try {
            execSync('ffmpeg -version', { stdio: 'pipe' });
            this.log('FFmpeg is available', 'success');
        } catch (error) {
            this.log('FFmpeg is not available', 'error');
        }

        // Test Node.js version
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            this.log(`Node.js version: ${nodeVersion}`, 'success');
        } catch (error) {
            this.log('Node.js version check failed', 'error');
        }

        // Test required directories
        const requiredDirs = [OUTPUT_DIR, TEMP_DIR];
        for (const dir of requiredDirs) {
            try {
                await fs.ensureDir(dir);
                this.log(`Directory exists: ${dir}`, 'success');
            } catch (error) {
                this.log(`Directory creation failed: ${dir}`, 'error');
            }
        }
    }

    async testNarrationPipeline() {
        console.log(chalk.cyan.bold('\n🎵 Testing Narration Pipeline'));
        console.log(chalk.cyan('============================'));

        // Test narration script execution
        try {
            execSync('npm run narrate', { stdio: 'pipe' });
            this.log('Narration script executed successfully', 'success');
        } catch (error) {
            this.log('Narration script execution failed', 'error');
        }

        // Check narration outputs
        const narrationFiles = ['voiceover.wav', 'captions.vtt'];
        for (const file of narrationFiles) {
            const filePath = path.join(OUTPUT_DIR, file);
            if (await fs.pathExists(filePath)) {
                const stats = await fs.stat(filePath);
                if (stats.size > 0) {
                    this.log(`Narration file generated: ${file}`, 'success');
                } else {
                    this.log(`Narration file is empty: ${file}`, 'error');
                }
            } else {
                this.log(`Narration file missing: ${file}`, 'error');
            }
        }
    }

    async testAssemblyPipeline() {
        console.log(chalk.cyan.bold('\n🎬 Testing Assembly Pipeline'));
        console.log(chalk.cyan('============================'));

        // Test assembly script execution
        try {
            execSync('npm run assemble', { stdio: 'pipe' });
            this.log('Assembly script executed successfully', 'success');
        } catch (error) {
            this.log('Assembly script execution failed', 'error');
        }

        // Check assembly output
        const roughcutPath = path.join(OUTPUT_DIR, 'roughcut.mp4');
        if (await fs.pathExists(roughcutPath)) {
            const stats = await fs.stat(roughcutPath);
            if (stats.size > 1024 * 1024) { // At least 1MB
                this.log('Rough cut video generated successfully', 'success');
            } else {
                this.log('Rough cut video is too small', 'error');
            }
        } else {
            this.log('Rough cut video missing', 'error');
        }
    }

    async testFinalPipeline() {
        console.log(chalk.cyan.bold('\n🎯 Testing Final Pipeline'));
        console.log(chalk.cyan('==========================='));

        // Test final script execution
        try {
            execSync('npm run final', { stdio: 'pipe' });
            this.log('Final script executed successfully', 'success');
        } catch (error) {
            this.log('Final script execution failed', 'error');
        }

        // Check final outputs
        const finalFiles = ['disaster-response-demo.mp4', 'video-metadata.json'];
        for (const file of finalFiles) {
            const filePath = path.join(OUTPUT_DIR, file);
            if (await fs.pathExists(filePath)) {
                const stats = await fs.stat(filePath);
                if (stats.size > 0) {
                    this.log(`Final file generated: ${file}`, 'success');
                } else {
                    this.log(`Final file is empty: ${file}`, 'error');
                }
            } else {
                this.log(`Final file missing: ${file}`, 'error');
            }
        }
    }

    async testVideoQuality() {
        console.log(chalk.cyan.bold('\n📹 Testing Video Quality'));
        console.log(chalk.cyan('========================'));

        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        if (!await fs.pathExists(videoPath)) {
            this.log('Video file not found for quality testing', 'error');
            return;
        }

        try {
            // Test video properties
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            // Check video stream
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            if (videoStream) {
                this.log('Video stream present', 'success');
                
                // Check resolution
                const width = parseInt(videoStream.width);
                const height = parseInt(videoStream.height);
                if (width >= 1280 && height >= 720) {
                    this.log(`Video resolution: ${width}x${height} (HD or better)`, 'success');
                } else {
                    this.log(`Video resolution: ${width}x${height} (below HD)`, 'error');
                }
            } else {
                this.log('No video stream found', 'error');
            }

            // Check audio stream
            const audioStream = videoInfo.streams.find(s => s.codec_type === 'audio');
            if (audioStream) {
                this.log('Audio stream present', 'success');
            } else {
                this.log('No audio stream found', 'error');
            }

            // Check duration
            const duration = parseFloat(videoInfo.format.duration);
            if (duration >= 180 && duration <= 300) { // 3-5 minutes
                this.log(`Video duration: ${(duration / 60).toFixed(2)} minutes (within range)`, 'success');
            } else {
                this.log(`Video duration: ${(duration / 60).toFixed(2)} minutes (outside expected range)`, 'error');
            }

        } catch (error) {
            this.log(`Video quality testing failed: ${error.message}`, 'error');
        }
    }

    async testMetadataIntegrity() {
        console.log(chalk.cyan.bold('\n📋 Testing Metadata Integrity'));
        console.log(chalk.cyan('============================='));

        const metadataPath = path.join(OUTPUT_DIR, 'video-metadata.json');
        if (!await fs.pathExists(metadataPath)) {
            this.log('Metadata file not found', 'error');
            return;
        }

        try {
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent);

            // Test required fields
            const requiredFields = ['title', 'description', 'duration', 'resolution', 'format'];
            for (const field of requiredFields) {
                if (metadata[field] && typeof metadata[field] === 'string') {
                    this.log(`Metadata field '${field}' is valid`, 'success');
                } else {
                    this.log(`Metadata field '${field}' is missing or invalid`, 'error');
                }
            }

            // Test tags
            if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
                this.log('Metadata tags are present', 'success');
            } else {
                this.log('Metadata tags are missing or empty', 'error');
            }

            // Test features
            if (metadata.features && Array.isArray(metadata.features) && metadata.features.length > 0) {
                this.log('Metadata features are present', 'success');
            } else {
                this.log('Metadata features are missing or empty', 'error');
            }

        } catch (error) {
            this.log(`Metadata integrity testing failed: ${error.message}`, 'error');
        }
    }

    async runIntegrationTests() {
        console.log(chalk.cyan.bold('\n🧪 Video Production Integration Test Suite'));
        console.log(chalk.cyan('==============================================\n'));

        const spinner = ora('Running integration tests...').start();

        await this.testEnvironment();
        await this.testNarrationPipeline();
        await this.testAssemblyPipeline();
        await this.testFinalPipeline();
        await this.testVideoQuality();
        await this.testMetadataIntegrity();

        spinner.succeed('Integration tests complete!');

        // Summary
        console.log(chalk.cyan.bold('\n📊 Integration Test Summary'));
        console.log(chalk.cyan('=========================='));
        console.log(chalk.green(`✅ Passed: ${this.passed}`));
        console.log(chalk.red(`❌ Failed: ${this.failed}`));
        console.log(chalk.blue(`📈 Total: ${this.passed + this.failed}`));

        const successRate = ((this.passed / (this.passed + this.failed)) * 100).toFixed(1);
        console.log(chalk.cyan.bold(`\n🎯 Success Rate: ${successRate}%`));

        if (this.failed === 0) {
            console.log(chalk.green.bold('\n🎉 All integration tests passed! Video production pipeline is working correctly.'));
            return true;
        } else {
            console.log(chalk.red.bold('\n⚠️  Some integration tests failed. Please review the errors above.'));
            return false;
        }
    }
}

// Run integration tests
const tester = new IntegrationTester();
tester.runIntegrationTests().catch(error => {
    console.error(chalk.red('Integration testing failed with error:'), error);
    process.exit(1);
});
