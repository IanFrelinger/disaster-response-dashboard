#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BuildPipeline {
    constructor() {
        this.steps = [
            { name: 'Screenshots', script: 'screenshots', required: true },
            { name: 'Storyboard', script: 'storyboard', required: true },
            { name: 'AI TTS', script: 'tts', required: true },
            { name: 'Animatic Generation', script: 'animatic', required: true },
            { name: 'Video Assembly', script: 'video-assembly', required: true },
            { name: 'Complete Validation', script: 'validate:complete', required: true }
        ];
        this.results = [];
    }

    async init() {
        console.log(chalk.cyan.bold('\n🚀 Disaster Response Dashboard - Complete Build Pipeline'));
        console.log(chalk.cyan('==========================================================\n'));

        // Check if we're in the right directory
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        if (!await fs.pathExists(packageJsonPath)) {
            throw new Error('Must run from video-production directory');
        }

        console.log(chalk.green('✅ Build pipeline initialized'));
    }

    async runStep(step, index) {
        console.log(chalk.cyan.bold(`\n${index + 1}/${this.steps.length} - ${step.name}`));
        console.log(chalk.cyan('='.repeat(50)));

        const startTime = Date.now();

        try {
            switch (step.script) {
                case 'screenshots':
                    await this.runScreenshots();
                    break;
                case 'storyboard':
                    await this.runStoryboard();
                    break;
                case 'tts':
                    await this.runTTS();
                    break;
                case 'animatic':
                    await this.runAnimatic();
                    break;
                case 'video-assembly':
                    await this.runVideoAssembly();
                    break;
                case 'validate:complete':
                    await this.runValidation();
                    break;
                default:
                    throw new Error(`Unknown step: ${step.script}`);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.results.push({
                step: step.name,
                success: true,
                duration: duration,
                error: null
            });

            console.log(chalk.green(`✅ ${step.name} completed successfully (${duration}s)`));

        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.results.push({
                step: step.name,
                success: false,
                duration: duration,
                error: error.message
            });

            console.log(chalk.red(`❌ ${step.name} failed (${duration}s): ${error.message}`));

            if (step.required) {
                throw new Error(`Required step '${step.name}' failed: ${error.message}`);
            } else {
                console.log(chalk.yellow(`⚠️  Continuing despite failure of optional step '${step.name}'`));
            }
        }
    }

    async runScreenshots() {
        console.log(chalk.blue('📸 Capturing comprehensive screenshots...'));
        
        const screenshotScript = path.join(__dirname, '..', '..', 'frontend', 'scripts', 'comprehensive-screenshots.js');
        if (!await fs.pathExists(screenshotScript)) {
            throw new Error('Screenshot script not found');
        }

        execSync(`node "${screenshotScript}"`, { 
            stdio: 'inherit',
            cwd: path.dirname(screenshotScript)
        });
    }

    async runStoryboard() {
        console.log(chalk.blue('📋 Generating video storyboard...'));
        
        const storyboardScript = path.join(__dirname, 'video-storyboard-generator.js');
        execSync(`node "${storyboardScript}"`, { 
            stdio: 'inherit',
            cwd: __dirname
        });
    }

    async runTTS() {
        console.log(chalk.blue('🎤 Generating AI voice-overs...'));
        
        const ttsScript = path.join(__dirname, 'ai-tts-generator.js');
        execSync(`node "${ttsScript}"`, { 
            stdio: 'inherit',
            cwd: __dirname
        });
    }

    async runAnimatic() {
        console.log(chalk.blue('🎬 Setting up animatic generation...'));
        
        const animaticScript = path.join(__dirname, 'animatic-generator.js');
        execSync(`node "${animaticScript}"`, { 
            stdio: 'inherit',
            cwd: __dirname
        });
    }

    async runVideoAssembly() {
        console.log(chalk.blue('🎥 Assembling final video...'));
        
        const animaticDir = path.join(__dirname, '..', 'output', 'animatic');
        const generateScript = path.join(animaticDir, 'generate-animatic.sh');
        
        if (!await fs.pathExists(generateScript)) {
            throw new Error('Animatic generation script not found');
        }

        execSync(`./generate-animatic.sh`, { 
            stdio: 'inherit',
            cwd: animaticDir
        });
    }

    async runValidation() {
        console.log(chalk.blue('🔍 Running complete validation...'));
        
        const validationScript = path.join(__dirname, 'complete-validation.js');
        execSync(`node "${validationScript}"`, { 
            stdio: 'inherit',
            cwd: __dirname
        });
    }

    async generateBuildReport() {
        console.log(chalk.cyan.bold('\n📄 Generating Build Report'));
        console.log(chalk.cyan('==========================\n'));

        const reportPath = path.join(__dirname, '..', 'output', 'build-pipeline-report.json');
        
        const successfulSteps = this.results.filter(r => r.success).length;
        const totalSteps = this.results.length;
        const totalDuration = this.results.reduce((sum, r) => sum + parseFloat(r.duration), 0);

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                successfulSteps,
                totalSteps,
                totalDuration: totalDuration.toFixed(2),
                success: successfulSteps === totalSteps
            },
            steps: this.results,
            finalOutput: {
                screenshots: path.join(__dirname, '..', '..', 'frontend', 'screenshots'),
                voiceOvers: path.join(__dirname, '..', 'output', 'voice-recordings'),
                animatic: path.join(__dirname, '..', 'output', 'animatic', 'disaster-response-animatic.mp4'),
                storyboard: path.join(__dirname, '..', 'output', 'VIDEO_STORYBOARD_WITH_SCREENSHOTS.md')
            }
        };

        await fs.writeJson(reportPath, report, { spaces: 2 });
        console.log(chalk.green(`✅ Build report saved: ${reportPath}`));

        return report;
    }

    async run() {
        try {
            await this.init();

            console.log(chalk.blue(`🚀 Starting build pipeline with ${this.steps.length} steps...\n`));

            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                await this.runStep(step, i);
            }

            const report = await this.generateBuildReport();

            console.log(chalk.cyan.bold('\n🎯 Build Pipeline Complete'));
            console.log(chalk.cyan('========================\n'));
            
            const successfulSteps = this.results.filter(r => r.success).length;
            const totalSteps = this.results.length;
            const totalDuration = this.results.reduce((sum, r) => sum + parseFloat(r.duration), 0);

            console.log(chalk.green(`✅ Build completed successfully!`));
            console.log(chalk.blue(`📊 Steps completed: ${successfulSteps}/${totalSteps}`));
            console.log(chalk.blue(`⏱️  Total duration: ${totalDuration.toFixed(2)}s`));
            
            if (successfulSteps === totalSteps) {
                console.log(chalk.green('\n🎉 All steps completed successfully!'));
                console.log(chalk.blue('Your animatic is ready for use.'));
                console.log(chalk.yellow('\n📁 Final outputs:'));
                console.log(chalk.yellow(`  • Animatic: ${report.finalOutput.animatic}`));
                console.log(chalk.yellow(`  • Storyboard: ${report.finalOutput.storyboard}`));
                console.log(chalk.yellow(`  • Voice-overs: ${report.finalOutput.voiceOvers}`));
                console.log(chalk.yellow(`  • Screenshots: ${report.finalOutput.screenshots}`));
            } else {
                console.log(chalk.red('\n⚠️  Some steps failed'));
                console.log(chalk.yellow('Check the build report for details.'));
            }

            return successfulSteps === totalSteps;

        } catch (error) {
            console.error(chalk.red('\n❌ Build pipeline failed:'), error.message);
            
            // Generate partial report
            if (this.results.length > 0) {
                await this.generateBuildReport();
            }
            
            throw error;
        }
    }
}

// Run the build pipeline
const pipeline = new BuildPipeline();
pipeline.run().catch(console.error);
