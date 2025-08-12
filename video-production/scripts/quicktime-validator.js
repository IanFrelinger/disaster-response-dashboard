#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuickTimeValidator {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output');
        this.animaticPath = path.join(this.outputDir, 'animatic', 'disaster-response-animatic.mp4');
    }

    async init() {
        console.log(chalk.cyan.bold('\n🍎 QuickTime Compatibility Validator'));
        console.log(chalk.cyan('=====================================\n'));

        // Check if ffprobe is available
        try {
            execSync('ffprobe -version', { stdio: 'ignore' });
            console.log(chalk.green('✅ FFprobe available for video analysis'));
        } catch (error) {
            console.log(chalk.red('❌ FFprobe not found. Please install FFmpeg.'));
            throw new Error('FFprobe is required for video validation');
        }
    }

    async validateQuickTimeCompatibility() {
        console.log(chalk.blue.bold('\n🔍 Validating QuickTime Compatibility'));
        console.log(chalk.blue('=====================================\n'));

        if (!await fs.pathExists(this.animaticPath)) {
            console.log(chalk.red(`❌ Animatic not found: ${this.animaticPath}`));
            return false;
        }

        try {
            // Get detailed video information
            const videoInfo = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${this.animaticPath}"`, { encoding: 'utf8' });
            const info = JSON.parse(videoInfo);

            console.log(chalk.blue('📊 Video Analysis:'));
            console.log(`   File: ${path.basename(this.animaticPath)}`);
            console.log(`   Size: ${(info.format.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Duration: ${parseFloat(info.format.duration).toFixed(2)}s`);

            let compatibilityScore = 0;
            const maxScore = 10;
            const issues = [];

            // Check video stream
            const videoStream = info.streams.find(s => s.codec_type === 'video');
            if (videoStream) {
                console.log(chalk.blue('\n🎬 Video Stream:'));
                console.log(`   Codec: ${videoStream.codec_name}`);
                console.log(`   Profile: ${videoStream.profile || 'N/A'}`);
                console.log(`   Level: ${videoStream.level || 'N/A'}`);
                console.log(`   Resolution: ${videoStream.width}x${videoStream.height}`);
                console.log(`   Pixel Format: ${videoStream.pix_fmt}`);
                console.log(`   Frame Rate: ${videoStream.r_frame_rate}`);

                // QuickTime compatibility checks
                if (videoStream.codec_name === 'h264') {
                    compatibilityScore += 2;
                    console.log(chalk.green('   ✅ H.264 codec (QuickTime compatible)'));
                } else {
                    issues.push('Non-H.264 video codec');
                }

                if (videoStream.profile === 'Baseline' || videoStream.profile === 'Main' || videoStream.profile === 'High') {
                    compatibilityScore += 2;
                    console.log(chalk.green('   ✅ Compatible H.264 profile'));
                } else {
                    issues.push('Incompatible H.264 profile');
                }

                if (videoStream.level <= 4.1) {
                    compatibilityScore += 1;
                    console.log(chalk.green('   ✅ Compatible H.264 level'));
                } else {
                    issues.push('H.264 level may be too high');
                }

                if (videoStream.pix_fmt === 'yuv420p') {
                    compatibilityScore += 2;
                    console.log(chalk.green('   ✅ YUV420P pixel format (QuickTime compatible)'));
                } else {
                    issues.push('Non-YUV420P pixel format');
                }
            } else {
                issues.push('No video stream found');
            }

            // Check audio stream
            const audioStream = info.streams.find(s => s.codec_type === 'audio');
            if (audioStream) {
                console.log(chalk.blue('\n🎵 Audio Stream:'));
                console.log(`   Codec: ${audioStream.codec_name}`);
                console.log(`   Sample Rate: ${audioStream.sample_rate} Hz`);
                console.log(`   Channels: ${audioStream.channels}`);
                console.log(`   Bit Rate: ${audioStream.bit_rate} bps`);

                if (audioStream.codec_name === 'aac') {
                    compatibilityScore += 2;
                    console.log(chalk.green('   ✅ AAC codec (QuickTime compatible)'));
                } else {
                    issues.push('Non-AAC audio codec');
                }

                if (audioStream.sample_rate <= 48000) {
                    compatibilityScore += 1;
                    console.log(chalk.green('   ✅ Compatible sample rate'));
                } else {
                    issues.push('Sample rate too high');
                }
            } else {
                issues.push('No audio stream found');
            }

            // Check container format
            console.log(chalk.blue('\n📦 Container Format:'));
            console.log(`   Format: ${info.format.format_name}`);
            console.log(`   Major Brand: ${info.format.tags?.major_brand || 'N/A'}`);

            if (info.format.format_name.includes('mp4') || info.format.format_name.includes('mov')) {
                compatibilityScore += 1;
                console.log(chalk.green('   ✅ MP4/MOV container (QuickTime compatible)'));
            } else {
                issues.push('Non-MP4/MOV container');
            }

            // Check for faststart flag
            const hasFaststart = info.format.tags?.encoder?.includes('faststart') || 
                               info.format.tags?.compatible_brands?.includes('isom');
            if (hasFaststart) {
                compatibilityScore += 1;
                console.log(chalk.green('   ✅ Faststart enabled (streaming compatible)'));
            } else {
                issues.push('Faststart not enabled');
            }

            // Final assessment
            console.log(chalk.blue.bold('\n📋 QuickTime Compatibility Assessment:'));
            console.log(`   Score: ${compatibilityScore}/${maxScore}`);
            
            const percentage = (compatibilityScore / maxScore) * 100;
            if (percentage >= 90) {
                console.log(chalk.green(`   ✅ Excellent QuickTime compatibility (${percentage.toFixed(1)}%)`));
            } else if (percentage >= 70) {
                console.log(chalk.yellow(`   ⚠️  Good QuickTime compatibility (${percentage.toFixed(1)}%)`));
            } else {
                console.log(chalk.red(`   ❌ Poor QuickTime compatibility (${percentage.toFixed(1)}%)`));
            }

            if (issues.length > 0) {
                console.log(chalk.red('\n❌ Issues Found:'));
                issues.forEach(issue => console.log(chalk.red(`   • ${issue}`)));
            } else {
                console.log(chalk.green('\n✅ No compatibility issues found!'));
            }

            // Generate compatibility report
            const report = {
                timestamp: new Date().toISOString(),
                file: path.basename(this.animaticPath),
                compatibilityScore,
                maxScore,
                percentage,
                issues,
                videoInfo: info
            };

            const reportPath = path.join(this.outputDir, 'quicktime-compatibility-report.json');
            await fs.writeJson(reportPath, report, { spaces: 2 });
            console.log(chalk.green(`\n📄 Compatibility report saved: ${reportPath}`));

            return percentage >= 70;

        } catch (error) {
            console.log(chalk.red(`❌ Error analyzing video: ${error.message}`));
            return false;
        }
    }

    async run() {
        try {
            await this.init();
            const isCompatible = await this.validateQuickTimeCompatibility();
            
            console.log(chalk.cyan.bold('\n🎯 QuickTime Validation Summary'));
            console.log(chalk.cyan('==============================\n'));
            
            if (isCompatible) {
                console.log(chalk.green('✅ Video should be compatible with QuickTime'));
                console.log(chalk.blue('💡 Try opening the video in QuickTime Player'));
            } else {
                console.log(chalk.red('❌ Video may have QuickTime compatibility issues'));
                console.log(chalk.yellow('💡 Consider regenerating with different encoding settings'));
            }

            return isCompatible;
        } catch (error) {
            console.log(chalk.red(`❌ Validation failed: ${error.message}`));
            return false;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new QuickTimeValidator();
    validator.run().catch(console.error);
}

export default QuickTimeValidator;
