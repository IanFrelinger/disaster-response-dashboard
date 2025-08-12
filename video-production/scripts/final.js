#!/usr/bin/env node

import { existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FinalProcessor {
    constructor() {
        this.outputDir = join(__dirname, '../output');
        this.tempDir = join(__dirname, '../temp');
    }

    async addPolish() {
        const spinner = ora('Adding final polish...').start();
        
        try {
            // Check if rough cut exists
            const roughCutFile = join(this.outputDir, 'roughcut.mp4');
            if (!existsSync(roughCutFile)) {
                throw new Error('Rough cut not found. Run npm run assemble first.');
            }
            
            // Get rough cut duration
            const ffprobeCommand = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${roughCutFile}"`;
            const roughCutDuration = parseFloat(execSync(ffprobeCommand, { encoding: 'utf8' }).trim());
            
            console.log(chalk.blue(`Rough cut duration: ${roughCutDuration.toFixed(2)} seconds`));
            
            // Create final video with better quality settings
            const finalFile = join(this.outputDir, 'disaster-response-demo.mp4');
            
            // Simple copy with quality improvements
            const command = `ffmpeg -i "${roughCutFile}" -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -movflags +faststart "${finalFile}" -y`;
            
            console.log(chalk.gray(`Executing: ${command}`));
            execSync(command, { stdio: 'pipe' });
            
            // Verify the output file was created and has content
            if (!existsSync(finalFile)) {
                throw new Error('FFmpeg did not create final file');
            }
            
            const { statSync } = await import('fs');
            const stats = statSync(finalFile);
            if (stats.size < 1024) {
                throw new Error(`Final file is too small: ${stats.size} bytes`);
            }
            
            console.log(chalk.green(`Final video size: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`));
            
            spinner.succeed('Final video created!');
            return finalFile;
            
        } catch (error) {
            spinner.fail('Final processing failed');
            console.error(chalk.red('Error:'), error.message);
            throw error;
        }
    }

    async createThumbnail() {
        const spinner = ora('Creating thumbnail...').start();
        
        try {
            const videoFile = join(this.outputDir, 'disaster-response-demo.mp4');
            const thumbnailFile = join(this.outputDir, 'thumbnail.jpg');
            
            // Extract thumbnail from 2 seconds into the video
            const command = `ffmpeg -i "${videoFile}" -ss 00:00:02 -vframes 1 -q:v 2 "${thumbnailFile}" -y`;
            execSync(command, { stdio: 'pipe' });
            
            spinner.succeed('Thumbnail created!');
            return thumbnailFile;
            
        } catch (error) {
            spinner.fail('Thumbnail creation failed');
            console.error(chalk.red('Error:'), error.message);
            return null;
        }
    }

    async generateMetadata() {
        const metadataFile = join(this.outputDir, 'video-metadata.json');
        const metadata = {
            title: "Disaster Response Dashboard Demo",
            description: "A comprehensive disaster response management system with 3D terrain visualization, real-time hazard monitoring, and automated testing capabilities.",
            duration: "4:00",
            resolution: "1920x1080",
            format: "MP4",
            created: new Date().toISOString(),
            tags: [
                "disaster-response",
                "emergency-management",
                "3d-visualization",
                "real-time-monitoring",
                "palantir-foundry",
                "building-challenge"
            ],
            features: [
                "Real-time hazard detection",
                "3D terrain visualization",
                "Route optimization",
                "Resource management",
                "Foundry integration"
            ]
        };
        
        const fs = await import('fs');
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        
        return metadataFile;
    }

    async run() {
        console.log(chalk.blue('🎬 Disaster Response Dashboard - Final Processor'));
        console.log(chalk.gray('==============================================\n'));
        
        try {
            // Add polish and create final video
            const finalVideo = await this.addPolish();
            
            // Create thumbnail
            const thumbnail = await this.createThumbnail();
            
            // Generate metadata
            const metadata = await this.generateMetadata();
            
            console.log(chalk.green('\n✅ Final video processing complete!'));
            console.log(chalk.blue('\n📁 Output files:'));
            console.log(chalk.gray(`  • ${finalVideo}`));
            if (thumbnail) {
                console.log(chalk.gray(`  • ${thumbnail}`));
            }
            console.log(chalk.gray(`  • ${metadata}`));
            
            console.log(chalk.blue('\n🎯 Video ready for submission!'));
            console.log(chalk.gray('  • Duration: 4:00'));
            console.log(chalk.gray('  • Resolution: 1920x1080'));
            console.log(chalk.gray('  • Format: MP4'));
            console.log(chalk.gray('  • Quality: High (CRF 18)'));
            
            console.log(chalk.blue('\n📋 Next steps:'));
            console.log(chalk.gray('  • Upload to YouTube as unlisted'));
            console.log(chalk.gray('  • Email link to recruiter'));
            console.log(chalk.gray('  • Include in Palantir Building Challenge submission'));
            
            return {
                video: finalVideo,
                thumbnail: thumbnail,
                metadata: metadata
            };
            
        } catch (error) {
            console.error(chalk.red('\n❌ Final processing failed'));
            process.exit(1);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const processor = new FinalProcessor();
    processor.run();
}

export default FinalProcessor;
