#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AnimaticGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output', 'animatic');
        this.screenshotsDir = path.join(__dirname, '..', '..', 'frontend', 'screenshots');
        this.voiceRecordingsDir = path.join(__dirname, '..', 'output', 'voice-recordings');
        this.scenes = [
            {
                scene: 1,
                time: '0:00-0:15',
                screenshot: '01-main-dashboard-overview.png',
                voiceOver: 'scene-01-problem-fragmented-response.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 2,
                time: '0:15-0:30',
                screenshot: '02-dashboard-with-metrics.png',
                voiceOver: 'scene-02-problem-time-costs-lives.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 3,
                time: '0:30-0:45',
                screenshot: '03-navigation-menu-open.png',
                voiceOver: 'scene-03-solution-unified-platform.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 4,
                time: '0:45-1:00',
                screenshot: '04-multi-hazard-map.png',
                voiceOver: 'scene-04-real-time-threat-assessment.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 5,
                time: '1:00-1:15',
                screenshot: '06-map-evacuation-routes.png',
                voiceOver: 'scene-05-one-click-evacuation-planning.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 6,
                time: '1:15-1:30',
                screenshot: '05-map-hazard-layers-active.png',
                voiceOver: 'scene-06-dynamic-route-updates.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 7,
                time: '1:30-1:45',
                screenshot: '07-3d-terrain-view.png',
                voiceOver: 'scene-07-3d-terrain-intelligence.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 8,
                time: '1:45-2:00',
                screenshot: '08-evacuation-dashboard-main.png',
                voiceOver: 'scene-08-mass-evacuation-management.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 9,
                time: '2:00-2:15',
                screenshot: '09-aip-decision-support.png',
                voiceOver: 'scene-09-ai-powered-decisions.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 10,
                time: '2:15-2:30',
                screenshot: '10-weather-panel.png',
                voiceOver: 'scene-10-weather-integrated-planning.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 11,
                time: '2:30-2:45',
                screenshot: '11-commander-view.png',
                voiceOver: 'scene-11-commanders-strategic-view.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 12,
                time: '2:45-3:00',
                screenshot: '12-first-responder-view.png',
                voiceOver: 'scene-12-first-responder-tactical-view.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 13,
                time: '3:00-3:15',
                screenshot: '13-public-information-view.png',
                voiceOver: 'scene-13-public-communication.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 14,
                time: '3:15-3:30',
                screenshot: '08-role-based-routing.png',
                voiceOver: 'scene-14-measurable-impact.wav',
                duration: 15,
                transition: 'fade'
            },
            {
                scene: 15,
                time: '3:30-3:45',
                screenshot: '01-main-dashboard-overview.png',
                voiceOver: 'scene-15-call-to-action.wav',
                duration: 15,
                transition: 'fade'
            }
        ];
    }

    async init() {
        console.log(chalk.cyan.bold('\n🎬 Animatic Generator'));
        console.log(chalk.cyan('==================\n'));

        // Create output directory
        await fs.ensureDir(this.outputDir);
        console.log(chalk.green(`✅ Output directory: ${this.outputDir}`));

        // Check if ffmpeg is available
        try {
            execSync('ffmpeg -version', { stdio: 'ignore' });
            console.log(chalk.green('✅ FFmpeg available for video processing'));
        } catch (error) {
            console.log(chalk.red('❌ FFmpeg not found. Please install FFmpeg for video processing.'));
            throw new Error('FFmpeg is required for video generation');
        }
    }

    async validateAssets() {
        console.log(chalk.cyan.bold('\n🔍 Validating Assets'));
        console.log(chalk.cyan('==================\n'));

        const missingAssets = [];

        // Check screenshots
        for (const scene of this.scenes) {
            const screenshotPath = path.join(this.screenshotsDir, scene.screenshot);
            if (!await fs.pathExists(screenshotPath)) {
                missingAssets.push(`Screenshot: ${scene.screenshot}`);
            }
        }

        // Check voice recordings (optional - will use placeholder if missing)
        for (const scene of this.scenes) {
            const voicePath = path.join(this.voiceRecordingsDir, scene.voiceOver);
            if (!await fs.pathExists(voicePath)) {
                console.log(chalk.yellow(`⚠️  Voice recording not found: ${scene.voiceOver}`));
            }
        }

        if (missingAssets.length > 0) {
            console.log(chalk.red('❌ Missing assets:'));
            missingAssets.forEach(asset => console.log(chalk.red(`  • ${asset}`)));
            throw new Error('Missing required assets');
        }

        console.log(chalk.green('✅ All screenshots found'));
        return true;
    }

    async generateFFmpegScript() {
        console.log(chalk.cyan.bold('\n📝 Generating FFmpeg Script'));
        console.log(chalk.cyan('==========================\n'));

        const scriptPath = path.join(this.outputDir, 'generate-animatic.sh');
        let script = '#!/bin/bash\n\n';
        script += '# Disaster Response Dashboard - Animatic Generator\n\n';
        script += 'set -e\n\n';
        script += 'echo "🎬 Starting animatic generation..."\n\n';

        // Create temporary directory for processing
        script += 'TEMP_DIR=$(mktemp -d)\n';
        script += 'echo "📁 Using temporary directory: $TEMP_DIR"\n\n';

        // Generate individual scene videos
        script += 'echo "🎥 Generating individual scene videos..."\n\n';

        this.scenes.forEach((scene, index) => {
            const sceneNumber = index + 1;
            const paddedNumber = sceneNumber.toString().padStart(2, '0');
            
            script += `echo "📹 Processing Scene ${paddedNumber} (${scene.time})..."\n`;
            
            const screenshotPath = path.join(this.screenshotsDir, scene.screenshot);
            const voicePath = path.join(this.voiceRecordingsDir, scene.voiceOver);
            const outputVideo = `scene-${paddedNumber}.mp4`;
            
            script += `# Check if voice recording exists\n`;
            script += `if [ -f "${voicePath}" ]; then\n`;
            script += `    echo "  Using voice recording: ${scene.voiceOver}"\n`;
            script += `    ffmpeg -loop 1 -i "${screenshotPath}" -i "${voicePath}" -c:v libx264 -preset fast -crf 23 -profile:v baseline -level 3.0 -c:a aac -b:a 128k -ar 44100 -shortest -t ${scene.duration} -y "$TEMP_DIR/${outputVideo}"\n`;
            script += `else\n`;
            script += `    echo "  No voice recording found, using silent video"\n`;
            script += `    ffmpeg -loop 1 -i "${screenshotPath}" -c:v libx264 -preset fast -crf 23 -profile:v baseline -level 3.0 -t ${scene.duration} -y "$TEMP_DIR/${outputVideo}"\n`;
            script += `fi\n\n`;
        });

        // Create file list for concatenation
        script += 'echo "📋 Creating file list for concatenation..."\n';
        script += 'cat > "$TEMP_DIR/filelist.txt" << EOF\n';
        this.scenes.forEach((scene, index) => {
            const sceneNumber = index + 1;
            const paddedNumber = sceneNumber.toString().padStart(2, '0');
            script += `file 'scene-${paddedNumber}.mp4'\n`;
        });
        script += 'EOF\n\n';

        // Concatenate all scenes
        script += 'echo "🔗 Concatenating all scenes..."\n';
        script += 'ffmpeg -f concat -safe 0 -i "$TEMP_DIR/filelist.txt" -c copy -y "$TEMP_DIR/animatic-raw.mp4"\n\n';

        // Add fade transitions
        script += 'echo "✨ Adding fade transitions..."\n';
        script += 'ffmpeg -i "$TEMP_DIR/animatic-raw.mp4" -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=225:d=0.5" -c:a copy -y "$TEMP_DIR/animatic-with-fades.mp4"\n\n';

        // Final processing with QuickTime compatibility
        script += 'echo "🎯 Final processing..."\n';
        script += 'ffmpeg -i "$TEMP_DIR/animatic-with-fades.mp4" -c:v libx264 -preset medium -crf 20 -profile:v baseline -level 3.0 -c:a aac -b:a 192k -ar 44100 -movflags +faststart -pix_fmt yuv420p -y "disaster-response-animatic.mp4"\n\n';

        // Cleanup
        script += 'echo "🧹 Cleaning up temporary files..."\n';
        script += 'rm -rf "$TEMP_DIR"\n\n';

        script += 'echo "✅ Animatic generation complete!"\n';
        script += 'echo "📁 Output: disaster-response-animatic.mp4"\n';
        script += 'echo "⏱️  Duration: 3:45 minutes"\n';
        script += 'echo "📊 Resolution: 1920x1080"\n';

        fs.writeFileSync(scriptPath, script);
        fs.chmodSync(scriptPath, '755');
        console.log(chalk.green(`✅ FFmpeg script saved: ${scriptPath}`));

        return scriptPath;
    }

    async generateSceneVideos() {
        console.log(chalk.cyan.bold('\n🎥 Generating Individual Scene Videos'));
        console.log(chalk.cyan('=====================================\n'));

        const sceneVideosDir = path.join(this.outputDir, 'scene-videos');
        await fs.ensureDir(sceneVideosDir);

        for (const scene of this.scenes) {
            const sceneNumber = scene.scene;
            const paddedNumber = sceneNumber.toString().padStart(2, '0');
            
            console.log(chalk.blue(`📹 Processing Scene ${paddedNumber} (${scene.time})...`));
            
            const screenshotPath = path.join(this.screenshotsDir, scene.screenshot);
            const voicePath = path.join(this.voiceRecordingsDir, scene.voiceOver);
            const outputVideo = path.join(sceneVideosDir, `scene-${paddedNumber}.mp4`);

            try {
                if (await fs.pathExists(voicePath)) {
                    console.log(chalk.green(`  ✅ Using voice recording: ${scene.voiceOver}`));
                    execSync(`ffmpeg -loop 1 -i "${screenshotPath}" -i "${voicePath}" -c:v libx264 -preset fast -crf 23 -profile:v baseline -level 3.0 -c:a aac -b:a 128k -ar 44100 -shortest -t ${scene.duration} -y "${outputVideo}"`, { stdio: 'pipe' });
                } else {
                    console.log(chalk.yellow(`  ⚠️  No voice recording found, creating silent video`));
                    execSync(`ffmpeg -loop 1 -i "${screenshotPath}" -c:v libx264 -preset fast -crf 23 -profile:v baseline -level 3.0 -t ${scene.duration} -y "${outputVideo}"`, { stdio: 'pipe' });
                }
                console.log(chalk.green(`  ✅ Scene ${paddedNumber} video created`));
            } catch (error) {
                console.log(chalk.red(`  ❌ Error creating scene ${paddedNumber}: ${error.message}`));
            }
        }

        console.log(chalk.green(`✅ All scene videos saved to: ${sceneVideosDir}`));
        return sceneVideosDir;
    }

    async generateConcatenationScript() {
        console.log(chalk.cyan.bold('\n🔗 Generating Concatenation Script'));
        console.log(chalk.cyan('==================================\n'));

        const scriptPath = path.join(this.outputDir, 'concatenate-scenes.sh');
        let script = '#!/bin/bash\n\n';
        script += '# Concatenate Scene Videos\n\n';
        script += 'echo "🔗 Concatenating scene videos..."\n\n';

        // Create file list
        script += 'cat > filelist.txt << EOF\n';
        this.scenes.forEach((scene, index) => {
            const sceneNumber = index + 1;
            const paddedNumber = sceneNumber.toString().padStart(2, '0');
            script += `file 'scene-videos/scene-${paddedNumber}.mp4'\n`;
        });
        script += 'EOF\n\n';

        // Concatenate
        script += 'ffmpeg -f concat -safe 0 -i filelist.txt -c copy -y "disaster-response-animatic.mp4"\n\n';
        script += 'echo "✅ Animatic created: disaster-response-animatic.mp4"\n';
        script += 'echo "⏱️  Duration: 3:45 minutes"\n';

        fs.writeFileSync(scriptPath, script);
        fs.chmodSync(scriptPath, '755');
        console.log(chalk.green(`✅ Concatenation script saved: ${scriptPath}`));

        return scriptPath;
    }

    async generateMetadata() {
        console.log(chalk.cyan.bold('\n📊 Generating Metadata'));
        console.log(chalk.cyan('===================\n'));

        const metadataPath = path.join(this.outputDir, 'animatic-metadata.json');
        const metadata = {
            title: 'Disaster Response Dashboard - Animatic',
            description: '4-minute animatic showcasing the disaster response dashboard capabilities',
            duration: '3:45',
            resolution: '1920x1080',
            frameRate: 30,
            format: 'MP4',
            scenes: this.scenes.map((scene, index) => ({
                sceneNumber: index + 1,
                timestamp: scene.time,
                screenshot: scene.screenshot,
                voiceOver: scene.voiceOver,
                duration: scene.duration,
                transition: scene.transition
            })),
            generated: new Date().toISOString(),
            totalScenes: this.scenes.length,
            totalDuration: 225 // 3:45 in seconds
        };

        fs.writeJsonSync(metadataPath, metadata, { spaces: 2 });
        console.log(chalk.green(`✅ Metadata saved: ${metadataPath}`));

        return metadata;
    }

    async run() {
        try {
            await this.init();
            await this.validateAssets();
            
            const ffmpegScript = await this.generateFFmpegScript();
            const sceneVideosDir = await this.generateSceneVideos();
            const concatenationScript = await this.generateConcatenationScript();
            const metadata = await this.generateMetadata();

            console.log(chalk.cyan.bold('\n🎯 Animatic Generation Setup Complete'));
            console.log(chalk.cyan('========================================\n'));
            
            console.log(chalk.green('✅ Generated files:'));
            console.log(chalk.blue(`  • FFmpeg script: ${ffmpegScript}`));
            console.log(chalk.blue(`  • Scene videos: ${sceneVideosDir}`));
            console.log(chalk.blue(`  • Concatenation script: ${concatenationScript}`));
            console.log(chalk.blue(`  • Metadata: ${path.join(this.outputDir, 'animatic-metadata.json')}`));
            
            console.log(chalk.yellow('\n📋 Next Steps:'));
            console.log(chalk.yellow('  1. Record voice-overs using the voice recording system'));
            console.log(chalk.yellow('  2. Run the FFmpeg script to generate the complete animatic'));
            console.log(chalk.yellow('  3. Or run individual scene generation and concatenation'));
            console.log(chalk.yellow('  4. Review the final animatic video'));
            
            console.log(chalk.cyan('\n🚀 Quick Commands:'));
            console.log(chalk.cyan('  cd output/animatic'));
            console.log(chalk.cyan('  ./generate-animatic.sh  # Full generation'));
            console.log(chalk.cyan('  ./concatenate-scenes.sh # If scenes already generated'));

        } catch (error) {
            console.error('❌ Error setting up animatic generation:', error);
            throw error;
        }
    }
}

// Run the animatic generator
const generator = new AnimaticGenerator();
generator.run().catch(console.error);
