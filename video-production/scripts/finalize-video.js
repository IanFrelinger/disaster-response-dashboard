#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoFinalizer {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output');
        this.assembledPath = path.join(this.outputDir, 'disaster-response-assembled.mp4');
        this.finalPath = path.join(this.outputDir, 'disaster-response-final.mp4');
    }

    async init() {
        console.log(chalk.cyan.bold('\n🎯 Video Finalizer'));
        console.log(chalk.cyan('==================\n'));

        await fs.ensureDir(this.outputDir);
    }

    async finalize() {
        console.log(chalk.blue('✨ Finalizing video...\n'));

        if (!await fs.pathExists(this.assembledPath)) {
            console.log(chalk.red(`❌ Assembled video not found: ${this.assembledPath}`));
            return false;
        }

        try {
            // Final processing with optimization for YouTube
            const ffmpegCommand = [
                'ffmpeg',
                '-i', `"${this.assembledPath}"`,
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
                `"${this.finalPath}"`
            ].join(' ');

            console.log(chalk.blue('🔄 Processing video for final output...'));
            execSync(ffmpegCommand, { stdio: 'pipe' });
            console.log(chalk.green(`✅ Video finalized: ${this.finalPath}`));

            // Generate finalization report
            const stats = await fs.stat(this.finalPath);
            const report = {
                timestamp: new Date().toISOString(),
                sourceVideo: this.assembledPath,
                finalVideo: this.finalPath,
                fileSize: stats.size,
                fileSizeMB: (stats.size / 1024 / 1024).toFixed(2),
                optimization: {
                    codec: 'H.264 High Profile',
                    quality: 'CRF 18 (High Quality)',
                    audio: 'AAC 192k',
                    sampleRate: '44100 Hz',
                    pixelFormat: 'yuv420p',
                    fastStart: true
                }
            };

            const reportPath = path.join(this.outputDir, 'finalization-report.json');
            await fs.writeJson(reportPath, report, { spaces: 2 });
            console.log(chalk.green(`✅ Finalization report saved: ${reportPath}`));

            return true;

        } catch (error) {
            console.log(chalk.red(`❌ Finalization failed: ${error.message}`));
            return false;
        }
    }

    async run() {
        try {
            await this.init();
            return await this.finalize();
        } catch (error) {
            console.log(chalk.red(`❌ Finalizer failed: ${error.message}`));
            return false;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const finalizer = new VideoFinalizer();
    finalizer.run().catch(console.error);
}

export default VideoFinalizer;
