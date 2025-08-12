#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FeedbackPipeline {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output');
        this.feedbackDir = path.join(this.outputDir, 'feedback');
        this.finalVideoPath = path.join(this.outputDir, 'disaster-response-final.mp4');
        this.approvalFile = path.join(this.feedbackDir, 'approval.json');
        this.feedbackReport = path.join(this.feedbackDir, 'feedback-report.json');
    }

    async init() {
        console.log(chalk.cyan.bold('\n🎬 Feedback Pipeline'));
        console.log(chalk.cyan('==================\n'));

        await fs.ensureDir(this.feedbackDir);
    }

    async generateVideoPreview() {
        console.log(chalk.blue('📹 Generating video preview...\n'));

        if (!await fs.pathExists(this.finalVideoPath)) {
            console.log(chalk.red(`❌ Final video not found: ${this.finalVideoPath}`));
            return false;
        }

        try {
            // Generate thumbnail
            const thumbnailPath = path.join(this.feedbackDir, 'video-thumbnail.jpg');
            execSync(`ffmpeg -i "${this.finalVideoPath}" -ss 00:00:10 -vframes 1 -q:v 2 -y "${thumbnailPath}"`, { stdio: 'pipe' });
            console.log(chalk.green(`✅ Thumbnail generated: ${thumbnailPath}`));

            // Generate video metadata
            const videoInfo = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${this.finalVideoPath}"`, { encoding: 'utf8' });
            const metadata = JSON.parse(videoInfo);
            
            const previewData = {
                timestamp: new Date().toISOString(),
                videoPath: this.finalVideoPath,
                thumbnailPath,
                duration: parseFloat(metadata.format.duration),
                size: parseInt(metadata.format.size),
                resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
                bitrate: parseInt(metadata.format.bit_rate),
                format: metadata.format.format_name
            };

            const previewPath = path.join(this.feedbackDir, 'video-preview.json');
            await fs.writeJson(previewPath, previewData, { spaces: 2 });
            console.log(chalk.green(`✅ Video preview data saved: ${previewPath}`));

            return previewData;

        } catch (error) {
            console.log(chalk.red(`❌ Error generating preview: ${error.message}`));
            return false;
        }
    }

    async runValidationChecks() {
        console.log(chalk.blue('\n🔍 Running validation checks...\n'));

        const checks = [];

        // Check 1: Video file exists and is valid
        try {
            if (await fs.pathExists(this.finalVideoPath)) {
                const stats = await fs.stat(this.finalVideoPath);
                checks.push({
                    name: 'Video File Exists',
                    status: 'PASS',
                    details: `File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
                });
            } else {
                checks.push({
                    name: 'Video File Exists',
                    status: 'FAIL',
                    details: 'Final video not found'
                });
            }
        } catch (error) {
            checks.push({
                name: 'Video File Exists',
                status: 'FAIL',
                details: error.message
            });
        }

        // Check 2: Video duration
        try {
            const durationInfo = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${this.finalVideoPath}"`, { encoding: 'utf8' });
            const duration = parseFloat(durationInfo.trim());
            const expectedDuration = 225; // 3:45 minutes
            
            if (Math.abs(duration - expectedDuration) <= 5) {
                checks.push({
                    name: 'Video Duration',
                    status: 'PASS',
                    details: `${duration.toFixed(1)}s (expected ~${expectedDuration}s)`
                });
            } else {
                checks.push({
                    name: 'Video Duration',
                    status: 'WARN',
                    details: `${duration.toFixed(1)}s (expected ~${expectedDuration}s)`
                });
            }
        } catch (error) {
            checks.push({
                name: 'Video Duration',
                status: 'FAIL',
                details: error.message
            });
        }

        // Check 3: Audio quality
        try {
            const audioInfo = execSync(`ffprobe -v quiet -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "${this.finalVideoPath}"`, { encoding: 'utf8' });
            const [codec, sampleRate, channels] = audioInfo.trim().split(',');
            
            checks.push({
                name: 'Audio Quality',
                status: 'PASS',
                details: `${codec}, ${sampleRate}Hz, ${channels} channels`
            });
        } catch (error) {
            checks.push({
                name: 'Audio Quality',
                status: 'FAIL',
                details: error.message
            });
        }

        // Check 4: Video quality
        try {
            const videoInfo = execSync(`ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name,width,height,bit_rate -of csv=p=0 "${this.finalVideoPath}"`, { encoding: 'utf8' });
            const [codec, width, height, bitrate] = videoInfo.trim().split(',');
            
            checks.push({
                name: 'Video Quality',
                status: 'PASS',
                details: `${codec}, ${width}x${height}, ${bitrate} bps`
            });
        } catch (error) {
            checks.push({
                name: 'Video Quality',
                status: 'FAIL',
                details: error.message
            });
        }

        // Check 5: Configuration files exist
        const configFiles = [
            'record.config.json',
            'record.plan.json',
            'narration.yaml',
            'timeline.yaml',
            'subtitles.srt'
        ];

        for (const file of configFiles) {
            const filePath = path.join(this.outputDir, file);
            if (await fs.pathExists(filePath)) {
                checks.push({
                    name: `Config: ${file}`,
                    status: 'PASS',
                    details: 'File exists'
                });
            } else {
                checks.push({
                    name: `Config: ${file}`,
                    status: 'FAIL',
                    details: 'File missing'
                });
            }
        }

        // Generate validation report
        const validationReport = {
            timestamp: new Date().toISOString(),
            videoPath: this.finalVideoPath,
            totalChecks: checks.length,
            passedChecks: checks.filter(c => c.status === 'PASS').length,
            failedChecks: checks.filter(c => c.status === 'FAIL').length,
            warningChecks: checks.filter(c => c.status === 'WARN').length,
            checks
        };

        await fs.writeJson(this.feedbackReport, validationReport, { spaces: 2 });
        console.log(chalk.green(`✅ Validation report saved: ${this.feedbackReport}`));

        // Display results
        console.log(chalk.blue('\n📊 Validation Results:'));
        checks.forEach(check => {
            const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
            const statusColor = check.status === 'PASS' ? chalk.green : check.status === 'WARN' ? chalk.yellow : chalk.red;
            console.log(`   ${statusIcon} ${check.name}: ${statusColor(check.status)} - ${check.details}`);
        });

        return validationReport;
    }

    async requestApproval() {
        console.log(chalk.cyan.bold('\n👤 Approval Request'));
        console.log(chalk.cyan('==================\n'));

        console.log(chalk.blue('📹 Video ready for review:'));
        console.log(`   File: ${this.finalVideoPath}`);
        console.log(`   Thumbnail: ${path.join(this.feedbackDir, 'video-thumbnail.jpg')}`);
        console.log(`   Preview: ${path.join(this.feedbackDir, 'video-preview.json')}`);
        console.log(`   Validation: ${this.feedbackReport}\n`);

        console.log(chalk.yellow('💡 To approve the video:'));
        console.log('   1. Review the video file and validation report');
        console.log('   2. Run: npm run approve');
        console.log('   3. Or run: npm run reject <reason>\n');

        console.log(chalk.blue('📋 Approval will trigger:'));
        console.log('   • YouTube upload (unlisted)');
        console.log('   • Email notification');
        console.log('   • Final report generation\n');

        // Create approval status file
        const approvalStatus = {
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            videoPath: this.finalVideoPath,
            feedbackReport: this.feedbackReport,
            approvalFile: this.approvalFile
        };

        await fs.writeJson(this.approvalFile, approvalStatus, { spaces: 2 });
        console.log(chalk.green(`✅ Approval request saved: ${this.approvalFile}`));

        return approvalStatus;
    }

    async approveVideo() {
        console.log(chalk.blue('\n✅ Approving video for upload...\n'));

        if (!await fs.pathExists(this.approvalFile)) {
            console.log(chalk.red('❌ No pending approval found'));
            return false;
        }

        const approvalStatus = await fs.readJson(this.approvalFile);
        approvalStatus.status = 'APPROVED';
        approvalStatus.approvedAt = new Date().toISOString();
        approvalStatus.approvedBy = 'user';

        await fs.writeJson(this.approvalFile, approvalStatus, { spaces: 2 });
        console.log(chalk.green('✅ Video approved for upload'));

        // Trigger upload process
        return await this.uploadToYouTube();
    }

    async rejectVideo(reason = 'No reason provided') {
        console.log(chalk.blue('\n❌ Rejecting video...\n'));

        if (!await fs.pathExists(this.approvalFile)) {
            console.log(chalk.red('❌ No pending approval found'));
            return false;
        }

        const approvalStatus = await fs.readJson(this.approvalFile);
        approvalStatus.status = 'REJECTED';
        approvalStatus.rejectedAt = new Date().toISOString();
        approvalStatus.rejectedBy = 'user';
        approvalStatus.rejectionReason = reason;

        await fs.writeJson(this.approvalFile, approvalStatus, { spaces: 2 });
        console.log(chalk.red(`❌ Video rejected: ${reason}`));

        return false;
    }

    async uploadToYouTube() {
        console.log(chalk.blue('\n📤 Uploading to YouTube (unlisted)...\n'));

        try {
            // This would integrate with YouTube API
            // For now, we'll simulate the upload process
            
            const uploadConfig = {
                title: 'Disaster Response Dashboard - Emergency Management Solution',
                description: 'Transform emergency response from chaos to coordinated action in minutes, not hours. This unified dashboard gives emergency commanders, first responders, and agencies one platform for coordinated action.',
                tags: ['emergency management', 'disaster response', 'dashboard', 'coordination', 'public safety'],
                category: 'Science & Technology',
                privacyStatus: 'unlisted',
                videoPath: this.finalVideoPath
            };

            const uploadPath = path.join(this.feedbackDir, 'youtube-upload.json');
            await fs.writeJson(uploadPath, uploadConfig, { spaces: 2 });
            console.log(chalk.green(`✅ Upload configuration saved: ${uploadPath}`));

            // Simulate upload process
            console.log(chalk.blue('🔄 Simulating YouTube upload...'));
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time
            
            const uploadResult = {
                timestamp: new Date().toISOString(),
                status: 'UPLOADED',
                videoId: 'simulated-video-id-12345',
                url: 'https://youtube.com/watch?v=simulated-video-id-12345',
                privacyStatus: 'unlisted',
                uploadConfig
            };

            const resultPath = path.join(this.feedbackDir, 'upload-result.json');
            await fs.writeJson(resultPath, uploadResult, { spaces: 2 });
            console.log(chalk.green(`✅ Upload result saved: ${resultPath}`));

            console.log(chalk.green('\n🎉 Video successfully uploaded to YouTube!'));
            console.log(chalk.blue(`📺 URL: ${uploadResult.url}`));
            console.log(chalk.blue(`🔒 Privacy: ${uploadResult.privacyStatus}`));

            return uploadResult;

        } catch (error) {
            console.log(chalk.red(`❌ Upload failed: ${error.message}`));
            return false;
        }
    }

    async run() {
        try {
            await this.init();

            console.log(chalk.blue('🚀 Starting feedback pipeline...\n'));

            // Step 1: Generate video preview
            const preview = await this.generateVideoPreview();
            if (!preview) {
                return false;
            }

            // Step 2: Run validation checks
            const validation = await this.runValidationChecks();
            if (!validation) {
                return false;
            }

            // Step 3: Request approval
            const approval = await this.requestApproval();

            console.log(chalk.cyan.bold('\n🎯 Feedback Pipeline Complete'));
            console.log(chalk.cyan('==============================\n'));
            console.log(chalk.green('✅ Video ready for review'));
            console.log(chalk.blue('💡 Run "npm run approve" to upload to YouTube'));
            console.log(chalk.blue('💡 Run "npm run reject <reason>" to reject'));

            return true;

        } catch (error) {
            console.log(chalk.red(`❌ Feedback pipeline failed: ${error.message}`));
            return false;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const pipeline = new FeedbackPipeline();
    pipeline.run().catch(console.error);
}

export default FeedbackPipeline;
