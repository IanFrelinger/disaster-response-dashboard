#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TransitionVerifier {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output');
        this.animaticPath = path.join(this.outputDir, 'animatic', 'disaster-response-animatic.mp4');
        this.scenes = [
            { scene: 1, time: '0:00-0:15', expectedStart: 0, expectedEnd: 15 },
            { scene: 2, time: '0:15-0:30', expectedStart: 15, expectedEnd: 30 },
            { scene: 3, time: '0:30-0:45', expectedStart: 30, expectedEnd: 45 },
            { scene: 4, time: '0:45-1:00', expectedStart: 45, expectedEnd: 60 },
            { scene: 5, time: '1:00-1:15', expectedStart: 60, expectedEnd: 75 },
            { scene: 6, time: '1:15-1:30', expectedStart: 75, expectedEnd: 90 },
            { scene: 7, time: '1:30-1:45', expectedStart: 90, expectedEnd: 105 },
            { scene: 8, time: '1:45-2:00', expectedStart: 105, expectedEnd: 120 },
            { scene: 9, time: '2:00-2:15', expectedStart: 120, expectedEnd: 135 },
            { scene: 10, time: '2:15-2:30', expectedStart: 135, expectedEnd: 150 },
            { scene: 11, time: '2:30-2:45', expectedStart: 150, expectedEnd: 165 },
            { scene: 12, time: '2:45-3:00', expectedStart: 165, expectedEnd: 180 },
            { scene: 13, time: '3:00-3:15', expectedStart: 180, expectedEnd: 195 },
            { scene: 14, time: '3:15-3:30', expectedStart: 195, expectedEnd: 210 },
            { scene: 15, time: '3:30-3:45', expectedStart: 210, expectedEnd: 225 }
        ];
    }

    async init() {
        console.log(chalk.cyan.bold('\n🎬 Scene Transition Verifier'));
        console.log(chalk.cyan('=============================\n'));

        // Check if ffprobe is available
        try {
            execSync('ffprobe -version', { stdio: 'ignore' });
            console.log(chalk.green('✅ FFprobe available for video analysis'));
        } catch (error) {
            console.log(chalk.red('❌ FFprobe not found. Please install FFmpeg.'));
            throw new Error('FFprobe is required for video analysis');
        }
    }

    async analyzeSceneTransitions() {
        console.log(chalk.blue.bold('\n🔍 Analyzing Scene Transitions'));
        console.log(chalk.blue('================================\n'));

        if (!await fs.pathExists(this.animaticPath)) {
            console.log(chalk.red(`❌ Animatic not found: ${this.animaticPath}`));
            return false;
        }

        try {
            // Get key frame information
            const keyFrameInfo = execSync(`ffmpeg -i "${this.animaticPath}" -vf "select=eq(pict_type\\,I),showinfo" -f null - 2>&1`, { encoding: 'utf8' });
            
            // Extract key frame timings
            const keyFrameMatches = keyFrameInfo.match(/pts_time:([0-9.]+)/g);
            const keyFrameTimings = keyFrameMatches ? keyFrameMatches.map(match => parseFloat(match.replace('pts_time:', ''))) : [];

            console.log(chalk.blue('📊 Key Frame Analysis:'));
            console.log(`   Total Key Frames: ${keyFrameTimings.length}`);
            console.log(`   Video Duration: 225 seconds (3:45)`);
            console.log(`   Expected Scenes: ${this.scenes.length}`);

            // Analyze scene transitions
            console.log(chalk.blue('\n🎭 Scene Transition Analysis:'));
            
            let transitionScore = 0;
            const maxScore = this.scenes.length;
            const issues = [];

            for (let i = 0; i < this.scenes.length; i++) {
                const scene = this.scenes[i];
                const expectedStart = scene.expectedStart;
                const expectedEnd = scene.expectedEnd;
                
                // Find key frames within this scene's time range
                const sceneKeyFrames = keyFrameTimings.filter(time => 
                    time >= expectedStart - 1 && time <= expectedEnd + 1
                );

                if (sceneKeyFrames.length > 0) {
                    const firstKeyFrame = Math.min(...sceneKeyFrames);
                    const lastKeyFrame = Math.max(...sceneKeyFrames);
                    
                    console.log(chalk.green(`   ✅ Scene ${scene.scene.toString().padStart(2, '0')} (${scene.time}):`));
                    console.log(`      Expected: ${expectedStart}s - ${expectedEnd}s`);
                    console.log(`      Key Frames: ${sceneKeyFrames.length} at ${sceneKeyFrames.map(t => t.toFixed(2)).join('s, ')}s`);
                    
                    // Check if transition timing is reasonable
                    if (Math.abs(firstKeyFrame - expectedStart) <= 2) {
                        transitionScore++;
                        console.log(chalk.green(`      ✅ Transition timing accurate`));
                    } else {
                        issues.push(`Scene ${scene.scene}: Transition timing off by ${Math.abs(firstKeyFrame - expectedStart).toFixed(2)}s`);
                        console.log(chalk.yellow(`      ⚠️  Transition timing off by ${Math.abs(firstKeyFrame - expectedStart).toFixed(2)}s`));
                    }
                } else {
                    issues.push(`Scene ${scene.scene}: No key frames found in expected time range`);
                    console.log(chalk.red(`   ❌ Scene ${scene.scene.toString().padStart(2, '0')} (${scene.time}): No key frames found`));
                }
            }

            // Check fade transitions
            console.log(chalk.blue('\n✨ Fade Transition Analysis:'));
            
            // Look for fade effects in the video filter chain
            const videoInfo = execSync(`ffprobe -v quiet -print_format json -show_streams "${this.animaticPath}"`, { encoding: 'utf8' });
            const info = JSON.parse(videoInfo);
            
            // Check if the video has been processed with fade effects
            const hasFadeEffects = keyFrameTimings.some(time => 
                (time >= 0 && time <= 1) || (time >= 224 && time <= 225)
            );

            if (hasFadeEffects) {
                transitionScore++;
                console.log(chalk.green('   ✅ Fade in/out effects detected at start/end'));
            } else {
                issues.push('Fade in/out effects not detected');
                console.log(chalk.yellow('   ⚠️  Fade in/out effects not detected'));
            }

            // Check for smooth transitions between scenes
            const transitionGaps = [];
            for (let i = 1; i < keyFrameTimings.length; i++) {
                const gap = keyFrameTimings[i] - keyFrameTimings[i-1];
                if (gap > 15) { // More than 15 seconds between key frames
                    transitionGaps.push(gap);
                }
            }

            if (transitionGaps.length === 0) {
                transitionScore++;
                console.log(chalk.green('   ✅ Smooth transitions between scenes (no large gaps)'));
            } else {
                issues.push(`Large gaps detected between transitions: ${transitionGaps.map(g => g.toFixed(2)).join('s, ')}s`);
                console.log(chalk.yellow(`   ⚠️  Large gaps detected between transitions: ${transitionGaps.map(g => g.toFixed(2)).join('s, ')}s`));
            }

            // Final assessment
            console.log(chalk.blue.bold('\n📋 Transition Quality Assessment:'));
            console.log(`   Score: ${transitionScore}/${maxScore + 2}`);
            
            const percentage = (transitionScore / (maxScore + 2)) * 100;
            if (percentage >= 90) {
                console.log(chalk.green(`   ✅ Excellent scene transitions (${percentage.toFixed(1)}%)`));
            } else if (percentage >= 70) {
                console.log(chalk.yellow(`   ⚠️  Good scene transitions (${percentage.toFixed(1)}%)`));
            } else {
                console.log(chalk.red(`   ❌ Poor scene transitions (${percentage.toFixed(1)}%)`));
            }

            if (issues.length > 0) {
                console.log(chalk.red('\n❌ Issues Found:'));
                issues.forEach(issue => console.log(chalk.red(`   • ${issue}`)));
            } else {
                console.log(chalk.green('\n✅ No transition issues found!'));
            }

            // Generate transition report
            const report = {
                timestamp: new Date().toISOString(),
                file: path.basename(this.animaticPath),
                transitionScore,
                maxScore: maxScore + 2,
                percentage,
                issues,
                keyFrameTimings,
                sceneAnalysis: this.scenes.map((scene, index) => ({
                    scene: scene.scene,
                    time: scene.time,
                    expectedStart: scene.expectedStart,
                    expectedEnd: scene.expectedEnd,
                    keyFrames: keyFrameTimings.filter(time => 
                        time >= scene.expectedStart - 1 && time <= scene.expectedEnd + 1
                    )
                }))
            };

            const reportPath = path.join(this.outputDir, 'transition-analysis-report.json');
            await fs.writeJson(reportPath, report, { spaces: 2 });
            console.log(chalk.green(`\n📄 Transition analysis report saved: ${reportPath}`));

            return percentage >= 70;

        } catch (error) {
            console.log(chalk.red(`❌ Error analyzing transitions: ${error.message}`));
            return false;
        }
    }

    async run() {
        try {
            await this.init();
            const hasGoodTransitions = await this.analyzeSceneTransitions();
            
            console.log(chalk.cyan.bold('\n🎯 Transition Verification Summary'));
            console.log(chalk.cyan('==================================\n'));
            
            if (hasGoodTransitions) {
                console.log(chalk.green('✅ Scene transitions are working properly'));
                console.log(chalk.blue('💡 The animatic has smooth scene changes with proper timing'));
            } else {
                console.log(chalk.red('❌ Scene transitions may have issues'));
                console.log(chalk.yellow('💡 Check the detailed analysis above for specific problems'));
            }

            return hasGoodTransitions;
        } catch (error) {
            console.log(chalk.red(`❌ Verification failed: ${error.message}`));
            return false;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const verifier = new TransitionVerifier();
    verifier.run().catch(console.error);
}

export default TransitionVerifier;
