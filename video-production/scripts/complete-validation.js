#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteValidator {
    constructor() {
        this.screenshotsDir = path.join(__dirname, '..', '..', 'frontend', 'screenshots');
        this.voiceRecordingsDir = path.join(__dirname, '..', 'output', 'voice-recordings');
        this.animaticDir = path.join(__dirname, '..', 'output', 'animatic');
        this.validationResults = {
            screenshots: { passed: 0, failed: 0, total: 0, details: [] },
            voiceOvers: { passed: 0, failed: 0, total: 0, details: [] },
            animatic: { passed: 0, failed: 0, total: 0, details: [] },
            overall: { passed: 0, failed: 0, total: 0 }
        };
        this.requiredScreenshots = [
            '01-main-dashboard-overview.png',
            '02-dashboard-with-metrics.png',
            '03-navigation-menu-open.png',
            '04-multi-hazard-map.png',
            '05-map-hazard-layers-active.png',
            '06-map-evacuation-routes.png',
            '07-3d-terrain-view.png',
            '08-evacuation-dashboard-main.png',
            '09-aip-decision-support.png',
            '10-weather-panel.png',
            '11-commander-view.png',
            '12-first-responder-view.png',
            '13-public-information-view.png',
            '08-role-based-routing.png'
        ];
        this.requiredVoiceOvers = [
            'scene-01-problem-fragmented-response.wav',
            'scene-02-problem-time-costs-lives.wav',
            'scene-03-solution-unified-platform.wav',
            'scene-04-real-time-threat-assessment.wav',
            'scene-05-one-click-evacuation-planning.wav',
            'scene-06-dynamic-route-updates.wav',
            'scene-07-3d-terrain-intelligence.wav',
            'scene-08-mass-evacuation-management.wav',
            'scene-09-ai-powered-decisions.wav',
            'scene-10-weather-integrated-planning.wav',
            'scene-11-commanders-strategic-view.wav',
            'scene-12-first-responder-tactical-view.wav',
            'scene-13-public-communication.wav',
            'scene-14-measurable-impact.wav',
            'scene-15-call-to-action.wav'
        ];
    }

    async init() {
        console.log(chalk.cyan.bold('\n🔍 Complete Pipeline Validation'));
        console.log(chalk.cyan('================================\n'));

        // Ensure directories exist
        await fs.ensureDir(this.screenshotsDir);
        await fs.ensureDir(this.voiceRecordingsDir);
        await fs.ensureDir(this.animaticDir);

        console.log(chalk.green('✅ Validation system initialized'));
    }

    async validateScreenshots() {
        console.log(chalk.cyan.bold('\n📸 Validating Screenshots'));
        console.log(chalk.cyan('========================\n'));

        this.validationResults.screenshots.total = this.requiredScreenshots.length;

        for (const screenshot of this.requiredScreenshots) {
            const filePath = path.join(this.screenshotsDir, screenshot);
            const exists = await fs.pathExists(filePath);
            
            if (exists) {
                const stats = await fs.stat(filePath);
                const fileSize = stats.size;
                const isValidSize = fileSize > 10000; // At least 10KB
                const isValidFormat = screenshot.endsWith('.png');
                
                const isValid = isValidSize && isValidFormat;
                
                this.validationResults.screenshots.details.push({
                    file: screenshot,
                    exists: true,
                    size: fileSize,
                    validSize: isValidSize,
                    validFormat: isValidFormat,
                    success: isValid
                });

                if (isValid) {
                    this.validationResults.screenshots.passed++;
                    console.log(chalk.green(`✅ ${screenshot} (${fileSize} bytes)`));
                } else {
                    this.validationResults.screenshots.failed++;
                    console.log(chalk.yellow(`⚠️  ${screenshot} (${fileSize} bytes) - size or format issue`));
                }
            } else {
                this.validationResults.screenshots.failed++;
                this.validationResults.screenshots.details.push({
                    file: screenshot,
                    exists: false,
                    size: 0,
                    validSize: false,
                    validFormat: false,
                    success: false
                });
                console.log(chalk.red(`❌ ${screenshot} (not found)`));
            }
        }

        console.log(chalk.blue(`\n📊 Screenshots: ${this.validationResults.screenshots.passed}/${this.validationResults.screenshots.total} passed`));
    }

    async validateVoiceOvers() {
        console.log(chalk.cyan.bold('\n🎤 Validating Voice-Overs'));
        console.log(chalk.cyan('========================\n'));

        this.validationResults.voiceOvers.total = this.requiredVoiceOvers.length;

        for (const voiceOver of this.requiredVoiceOvers) {
            const filePath = path.join(this.voiceRecordingsDir, voiceOver);
            const exists = await fs.pathExists(filePath);
            
            if (exists) {
                const stats = await fs.stat(filePath);
                const fileSize = stats.size;
                const isValidSize = fileSize > 1000; // At least 1KB
                const isValidFormat = voiceOver.endsWith('.wav');
                
                const isValid = isValidSize && isValidFormat;
                
                this.validationResults.voiceOvers.details.push({
                    file: voiceOver,
                    exists: true,
                    size: fileSize,
                    validSize: isValidSize,
                    validFormat: isValidFormat,
                    success: isValid
                });

                if (isValid) {
                    this.validationResults.voiceOvers.passed++;
                    console.log(chalk.green(`✅ ${voiceOver} (${fileSize} bytes)`));
                } else {
                    this.validationResults.voiceOvers.failed++;
                    console.log(chalk.yellow(`⚠️  ${voiceOver} (${fileSize} bytes) - size or format issue`));
                }
            } else {
                this.validationResults.voiceOvers.failed++;
                this.validationResults.voiceOvers.details.push({
                    file: voiceOver,
                    exists: false,
                    size: 0,
                    validSize: false,
                    validFormat: false,
                    success: false
                });
                console.log(chalk.red(`❌ ${voiceOver} (not found)`));
            }
        }

        console.log(chalk.blue(`\n📊 Voice-Overs: ${this.validationResults.voiceOvers.passed}/${this.validationResults.voiceOvers.total} passed`));
    }

    async validateAnimatic() {
        console.log(chalk.cyan.bold('\n🎬 Validating Animatic'));
        console.log(chalk.cyan('===================\n'));

        const animaticFile = path.join(this.animaticDir, 'disaster-response-animatic.mp4');
        const exists = await fs.pathExists(animaticFile);
        
        if (exists) {
            const stats = await fs.stat(animaticFile);
            const fileSize = stats.size;
            const isValidSize = fileSize > 100000; // At least 100KB
            const isValidFormat = animaticFile.endsWith('.mp4');
            
            // Check video properties using ffprobe
            let videoProperties = null;
            try {
                const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${animaticFile}"`, { encoding: 'utf8' });
                videoProperties = JSON.parse(ffprobeOutput);
            } catch (error) {
                console.log(chalk.yellow(`⚠️  Could not analyze video properties: ${error.message}`));
            }
            
            const isValid = isValidSize && isValidFormat;
            
            this.validationResults.animatic.details.push({
                file: 'disaster-response-animatic.mp4',
                exists: true,
                size: fileSize,
                validSize: isValidSize,
                validFormat: isValidFormat,
                videoProperties: videoProperties,
                success: isValid
            });

            if (isValid) {
                this.validationResults.animatic.passed++;
                console.log(chalk.green(`✅ disaster-response-animatic.mp4 (${fileSize} bytes)`));
                
                if (videoProperties) {
                    const format = videoProperties.format;
                    const videoStream = videoProperties.streams.find(s => s.codec_type === 'video');
                    
                    if (format && videoStream) {
                        console.log(chalk.blue(`   Duration: ${format.duration}s`));
                        console.log(chalk.blue(`   Resolution: ${videoStream.width}x${videoStream.height}`));
                        console.log(chalk.blue(`   Codec: ${videoStream.codec_name}`));
                    }
                }
            } else {
                this.validationResults.animatic.failed++;
                console.log(chalk.yellow(`⚠️  disaster-response-animatic.mp4 (${fileSize} bytes) - size or format issue`));
            }
        } else {
            this.validationResults.animatic.failed++;
            this.validationResults.animatic.details.push({
                file: 'disaster-response-animatic.mp4',
                exists: false,
                size: 0,
                validSize: false,
                validFormat: false,
                videoProperties: null,
                success: false
            });
            console.log(chalk.red(`❌ disaster-response-animatic.mp4 (not found)`));
        }

        this.validationResults.animatic.total = 1;
        console.log(chalk.blue(`\n📊 Animatic: ${this.validationResults.animatic.passed}/${this.validationResults.animatic.total} passed`));
    }

    async validatePipeline() {
        console.log(chalk.cyan.bold('\n🔗 Validating Pipeline Integration'));
        console.log(chalk.cyan('==================================\n'));

        // Check if all components work together
        const screenshotsValid = this.validationResults.screenshots.passed === this.validationResults.screenshots.total;
        const voiceOversValid = this.validationResults.voiceOvers.passed === this.validationResults.voiceOvers.total;
        const animaticValid = this.validationResults.animatic.passed === this.validationResults.animatic.total;

        const pipelineValid = screenshotsValid && voiceOversValid && animaticValid;

        console.log(chalk.blue('Pipeline Integration Check:'));
        console.log(chalk.blue(`  Screenshots: ${screenshotsValid ? '✅' : '❌'}`));
        console.log(chalk.blue(`  Voice-Overs: ${voiceOversValid ? '✅' : '❌'}`));
        console.log(chalk.blue(`  Animatic: ${animaticValid ? '✅' : '❌'}`));
        console.log(chalk.blue(`  Overall: ${pipelineValid ? '✅' : '❌'}`));

        return pipelineValid;
    }

    async generateValidationReport() {
        console.log(chalk.cyan.bold('\n📄 Generating Validation Report'));
        console.log(chalk.cyan('==============================\n'));

        const reportPath = path.join(__dirname, '..', 'output', 'complete-validation-report.json');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                screenshots: {
                    passed: this.validationResults.screenshots.passed,
                    failed: this.validationResults.screenshots.failed,
                    total: this.validationResults.screenshots.total,
                    success: this.validationResults.screenshots.passed === this.validationResults.screenshots.total
                },
                voiceOvers: {
                    passed: this.validationResults.voiceOvers.passed,
                    failed: this.validationResults.voiceOvers.failed,
                    total: this.validationResults.voiceOvers.total,
                    success: this.validationResults.voiceOvers.passed === this.validationResults.voiceOvers.total
                },
                animatic: {
                    passed: this.validationResults.animatic.passed,
                    failed: this.validationResults.animatic.failed,
                    total: this.validationResults.animatic.total,
                    success: this.validationResults.animatic.passed === this.validationResults.animatic.total
                },
                overall: {
                    success: this.validationResults.screenshots.passed === this.validationResults.screenshots.total &&
                            this.validationResults.voiceOvers.passed === this.validationResults.voiceOvers.total &&
                            this.validationResults.animatic.passed === this.validationResults.animatic.total
                }
            },
            details: this.validationResults
        };

        await fs.writeJson(reportPath, report, { spaces: 2 });
        console.log(chalk.green(`✅ Validation report saved: ${reportPath}`));

        return report;
    }

    async run() {
        try {
            await this.init();
            
            await this.validateScreenshots();
            await this.validateVoiceOvers();
            await this.validateAnimatic();
            
            const pipelineValid = await this.validatePipeline();
            const report = await this.generateValidationReport();

            console.log(chalk.cyan.bold('\n🎯 Complete Validation Summary'));
            console.log(chalk.cyan('============================\n'));
            
            const totalPassed = this.validationResults.screenshots.passed + 
                               this.validationResults.voiceOvers.passed + 
                               this.validationResults.animatic.passed;
            const totalChecks = this.validationResults.screenshots.total + 
                               this.validationResults.voiceOvers.total + 
                               this.validationResults.animatic.total;

            console.log(chalk.green(`✅ Total Passed: ${totalPassed}/${totalChecks}`));
            console.log(chalk.red(`❌ Total Failed: ${totalChecks - totalPassed}/${totalChecks}`));
            
            if (pipelineValid) {
                console.log(chalk.green('\n🎉 Complete pipeline validation successful!'));
                console.log(chalk.blue('Your animatic is ready for use.'));
            } else {
                console.log(chalk.red('\n⚠️  Pipeline validation failed'));
                console.log(chalk.yellow('Check the validation report for details.'));
            }

            return pipelineValid;

        } catch (error) {
            console.error('❌ Error during validation:', error);
            throw error;
        }
    }
}

// Run the complete validation
const validator = new CompleteValidator();
validator.run().catch(console.error);
