#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FrameExtractor {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output');
        this.animaticPath = path.join(this.outputDir, 'animatic', 'disaster-response-animatic.mp4');
        this.framesDir = path.join(this.outputDir, 'extracted-frames');
    }

    async init() {
        console.log(chalk.cyan.bold('\n🖼️  Frame Extractor for Scene Verification'));
        console.log(chalk.cyan('=============================================\n'));

        // Check if ffmpeg is available
        try {
            execSync('ffmpeg -version', { stdio: 'ignore' });
            console.log(chalk.green('✅ FFmpeg available for frame extraction'));
        } catch (error) {
            console.log(chalk.red('❌ FFmpeg not found. Please install FFmpeg.'));
            throw new Error('FFmpeg is required for frame extraction');
        }

        // Create frames directory
        await fs.ensureDir(this.framesDir);
    }

    async extractKeyFrames() {
        console.log(chalk.blue.bold('\n📸 Extracting Key Frames'));
        console.log(chalk.blue('========================\n'));

        if (!await fs.pathExists(this.animaticPath)) {
            console.log(chalk.red(`❌ Animatic not found: ${this.animaticPath}`));
            return false;
        }

        try {
            // Extract key frames at specific timestamps to verify scene changes
            const timestamps = [
                0,      // Scene 1 start
                15,     // Scene 2 start  
                30,     // Scene 3 start
                45,     // Scene 4 start
                60,     // Scene 5 start
                75,     // Scene 6 start
                90,     // Scene 7 start
                105,    // Scene 8 start
                120,    // Scene 9 start
                135,    // Scene 10 start
                150,    // Scene 11 start
                165,    // Scene 12 start
                180,    // Scene 13 start
                195,    // Scene 14 start
                210     // Scene 15 start
            ];

            console.log(chalk.blue('🎬 Extracting frames at scene transition points...\n'));

            for (let i = 0; i < timestamps.length; i++) {
                const timestamp = timestamps[i];
                const sceneNumber = i + 1;
                const paddedNumber = sceneNumber.toString().padStart(2, '0');
                const outputFile = path.join(this.framesDir, `scene-${paddedNumber}-${timestamp}s.png`);

                try {
                    execSync(`ffmpeg -i "${this.animaticPath}" -ss ${timestamp} -vframes 1 -q:v 2 -y "${outputFile}"`, { stdio: 'pipe' });
                    
                    // Check if file was created and has content
                    if (await fs.pathExists(outputFile)) {
                        const stats = await fs.stat(outputFile);
                        if (stats.size > 1000) { // More than 1KB
                            console.log(chalk.green(`   ✅ Scene ${paddedNumber} (${timestamp}s): ${outputFile}`));
                        } else {
                            console.log(chalk.yellow(`   ⚠️  Scene ${paddedNumber} (${timestamp}s): File too small`));
                        }
                    } else {
                        console.log(chalk.red(`   ❌ Scene ${paddedNumber} (${timestamp}s): Failed to extract`));
                    }
                } catch (error) {
                    console.log(chalk.red(`   ❌ Scene ${paddedNumber} (${timestamp}s): ${error.message}`));
                }
            }

            // Also extract frames at the actual key frame timings we detected
            console.log(chalk.blue('\n🔍 Extracting frames at detected key frame timings...\n'));
            
            const keyFrameTimings = [0.04, 10.04, 20.04, 30.08, 40.08, 50.12, 60.16, 70.16, 80.20, 90.20, 100.20, 110.20, 120.20, 130.20, 140.20, 150.20, 160.20, 170.24, 180.24, 190.24, 200.28, 210.28, 220.28];

            for (let i = 0; i < keyFrameTimings.length; i++) {
                const timestamp = keyFrameTimings[i];
                const frameNumber = i + 1;
                const paddedNumber = frameNumber.toString().padStart(2, '0');
                const outputFile = path.join(this.framesDir, `keyframe-${paddedNumber}-${timestamp.toFixed(2)}s.png`);

                try {
                    execSync(`ffmpeg -i "${this.animaticPath}" -ss ${timestamp} -vframes 1 -q:v 2 -y "${outputFile}"`, { stdio: 'pipe' });
                    
                    if (await fs.pathExists(outputFile)) {
                        const stats = await fs.stat(outputFile);
                        if (stats.size > 1000) {
                            console.log(chalk.green(`   ✅ Key Frame ${paddedNumber} (${timestamp.toFixed(2)}s): ${outputFile}`));
                        } else {
                            console.log(chalk.yellow(`   ⚠️  Key Frame ${paddedNumber} (${timestamp.toFixed(2)}s): File too small`));
                        }
                    } else {
                        console.log(chalk.red(`   ❌ Key Frame ${paddedNumber} (${timestamp.toFixed(2)}s): Failed to extract`));
                    }
                } catch (error) {
                    console.log(chalk.red(`   ❌ Key Frame ${paddedNumber} (${timestamp.toFixed(2)}s): ${error.message}`));
                }
            }

            return true;

        } catch (error) {
            console.log(chalk.red(`❌ Error extracting frames: ${error.message}`));
            return false;
        }
    }

    async analyzeFrameDifferences() {
        console.log(chalk.blue.bold('\n🔍 Analyzing Frame Differences'));
        console.log(chalk.blue('================================\n'));

        try {
            const files = await fs.readdir(this.framesDir);
            const pngFiles = files.filter(f => f.endsWith('.png')).sort();

            if (pngFiles.length < 2) {
                console.log(chalk.yellow('⚠️  Need at least 2 frames to compare'));
                return;
            }

            console.log(chalk.blue('📊 Frame Analysis Summary:'));
            console.log(`   Total frames extracted: ${pngFiles.length}`);
            console.log(`   Frame directory: ${this.framesDir}\n`);

            // Check if frames are different by comparing file sizes
            const frameSizes = [];
            for (const file of pngFiles) {
                const filePath = path.join(this.framesDir, file);
                const stats = await fs.stat(filePath);
                frameSizes.push({ file, size: stats.size });
            }

            console.log(chalk.blue('📏 Frame Size Analysis:'));
            const uniqueSizes = [...new Set(frameSizes.map(f => f.size))];
            
            if (uniqueSizes.length > 1) {
                console.log(chalk.green(`   ✅ Multiple frame sizes detected: ${uniqueSizes.length} different sizes`));
                console.log(chalk.green('   ✅ This suggests different visual content in scenes'));
                
                frameSizes.forEach(frame => {
                    console.log(`      ${frame.file}: ${frame.size} bytes`);
                });
            } else {
                console.log(chalk.yellow(`   ⚠️  All frames have the same size: ${uniqueSizes[0]} bytes`));
                console.log(chalk.yellow('   ⚠️  This might indicate identical content across scenes'));
            }

            // Generate analysis report
            const report = {
                timestamp: new Date().toISOString(),
                file: path.basename(this.animaticPath),
                totalFrames: pngFiles.length,
                uniqueSizes: uniqueSizes.length,
                frameSizes,
                frameFiles: pngFiles,
                analysis: uniqueSizes.length > 1 ? 'Different visual content detected' : 'Identical content across scenes'
            };

            const reportPath = path.join(this.outputDir, 'frame-analysis-report.json');
            await fs.writeJson(reportPath, report, { spaces: 2 });
            console.log(chalk.green(`\n📄 Frame analysis report saved: ${reportPath}`));

        } catch (error) {
            console.log(chalk.red(`❌ Error analyzing frames: ${error.message}`));
        }
    }

    async run() {
        try {
            await this.init();
            const extractionSuccess = await this.extractKeyFrames();
            
            if (extractionSuccess) {
                await this.analyzeFrameDifferences();
                
                console.log(chalk.cyan.bold('\n🎯 Frame Extraction Summary'));
                console.log(chalk.cyan('================================\n'));
                console.log(chalk.green('✅ Frame extraction completed'));
                console.log(chalk.blue(`📁 Frames saved to: ${this.framesDir}`));
                console.log(chalk.blue('💡 Check the extracted frames to verify scene changes'));
            } else {
                console.log(chalk.red('❌ Frame extraction failed'));
            }

            return extractionSuccess;
        } catch (error) {
            console.log(chalk.red(`❌ Frame extraction failed: ${error.message}`));
            return false;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const extractor = new FrameExtractor();
    extractor.run().catch(console.error);
}

export default FrameExtractor;
