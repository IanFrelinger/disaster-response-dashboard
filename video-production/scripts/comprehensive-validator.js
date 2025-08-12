#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

class ComprehensiveValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = 0;
        this.total = 0;
        this.validationResults = {
            technical: { passed: 0, warnings: 0, errors: 0, total: 0 },
            visual: { passed: 0, warnings: 0, errors: 0, total: 0 },
            content: { passed: 0, warnings: 0, errors: 0, total: 0 }
        };
    }

    log(message, type = 'info', category = 'general') {
        const timestamp = new Date().toISOString();
        switch (type) {
            case 'error':
                console.log(chalk.red(`❌ [${category.toUpperCase()}] ${message}`));
                this.errors.push({ message, category });
                break;
            case 'warning':
                console.log(chalk.yellow(`⚠️  [${category.toUpperCase()}] ${message}`));
                this.warnings.push({ message, category });
                break;
            case 'success':
                console.log(chalk.green(`✅ [${category.toUpperCase()}] ${message}`));
                this.passed++;
                break;
            default:
                console.log(chalk.blue(`ℹ️  [${category.toUpperCase()}] ${message}`));
        }
        this.total++;
    }

    async runTechnicalValidation() {
        console.log(chalk.cyan.bold('\n🔧 Technical Validation'));
        console.log(chalk.cyan('====================\n'));

        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        
        if (!await fs.pathExists(videoPath)) {
            this.log('Main video file not found', 'error', 'technical');
            return false;
        }

        // File integrity check
        try {
            const integrityCheck = execSync(`ffmpeg -v error -i "${videoPath}" -f null - 2>&1`, { encoding: 'utf8' });
            if (integrityCheck.trim() === '') {
                this.log('Video file integrity check passed', 'success', 'technical');
                this.validationResults.technical.passed++;
            } else {
                this.log(`Video file integrity issues: ${integrityCheck}`, 'error', 'technical');
                this.validationResults.technical.errors++;
            }
            this.validationResults.technical.total++;
        } catch (error) {
            this.log(`Error checking file integrity: ${error.message}`, 'error', 'technical');
            this.validationResults.technical.errors++;
            this.validationResults.technical.total++;
        }

        // Video encoding check
        try {
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            const audioStream = videoInfo.streams.find(s => s.codec_type === 'audio');

            if (videoStream.codec_name === 'h264') {
                this.log('Video codec: H.264 (compatible)', 'success', 'technical');
                this.validationResults.technical.passed++;
            } else {
                this.log(`Video codec: ${videoStream.codec_name} (may have compatibility issues)`, 'warning', 'technical');
                this.validationResults.technical.warnings++;
            }
            this.validationResults.technical.total++;

            if (audioStream && (audioStream.codec_name === 'aac' || audioStream.codec_name === 'mp3')) {
                this.log(`Audio codec: ${audioStream.codec_name} (compatible)`, 'success', 'technical');
                this.validationResults.technical.passed++;
            } else {
                this.log(`Audio codec: ${audioStream?.codec_name || 'unknown'} (may have compatibility issues)`, 'warning', 'technical');
                this.validationResults.technical.warnings++;
            }
            this.validationResults.technical.total++;

            if (videoInfo.format.format_name.includes('mp4')) {
                this.log('Container format: MP4 (widely compatible)', 'success', 'technical');
                this.validationResults.technical.passed++;
            } else {
                this.log(`Container format: ${videoInfo.format.format_name} (may have compatibility issues)`, 'warning', 'technical');
                this.validationResults.technical.warnings++;
            }
            this.validationResults.technical.total++;

        } catch (error) {
            this.log(`Error checking video encoding: ${error.message}`, 'error', 'technical');
            this.validationResults.technical.errors++;
            this.validationResults.technical.total++;
        }

        return true;
    }

    async runVisualValidation() {
        console.log(chalk.cyan.bold('\n🎬 Visual Validation'));
        console.log(chalk.cyan('==================\n'));

        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        
        // Resolution check
        try {
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_streams "${videoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            const width = parseInt(videoStream.width);
            const height = parseInt(videoStream.height);
            
            if (width === 1920 && height === 1080) {
                this.log(`Video resolution: ${width}x${height} (Full HD)`, 'success', 'visual');
                this.validationResults.visual.passed++;
            } else {
                this.log(`Video resolution: ${width}x${height} (expected 1920x1080)`, 'warning', 'visual');
                this.validationResults.visual.warnings++;
            }
            this.validationResults.visual.total++;



            // Bitrate check with better error handling
            try {
                const bitrate = parseInt(videoInfo.format.bit_rate) / 1000; // kbps
                if (!isNaN(bitrate)) {
                    if (bitrate >= 2000 && bitrate <= 10000) {
                        this.log(`Video bitrate: ${bitrate.toFixed(0)} kbps (good quality)`, 'success', 'visual');
                        this.validationResults.visual.passed++;
                    } else {
                        this.log(`Video bitrate: ${bitrate.toFixed(0)} kbps (may need adjustment)`, 'warning', 'visual');
                        this.validationResults.visual.warnings++;
                    }
                } else {
                    this.log('Could not parse video bitrate', 'warning', 'visual');
                    this.validationResults.visual.warnings++;
                }
                this.validationResults.visual.total++;
            } catch (error) {
                this.log(`Error checking video bitrate: ${error.message}`, 'warning', 'visual');
                this.validationResults.visual.warnings++;
                this.validationResults.visual.total++;
            }

        } catch (error) {
            this.log(`Error checking video properties: ${error.message}`, 'error', 'visual');
            this.validationResults.visual.errors++;
            this.validationResults.visual.total++;
        }

        // Duration check with better error handling
        try {
            const durationOutput = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`, { encoding: 'utf8' });
            const duration = parseFloat(durationOutput.trim());
            
            if (!isNaN(duration)) {
                const durationMinutes = duration / 60;
                if (durationMinutes >= 3.5 && durationMinutes <= 4.5) {
                    this.log(`Video duration: ${durationMinutes.toFixed(2)} minutes (within expected range)`, 'success', 'visual');
                    this.validationResults.visual.passed++;
                } else {
                    this.log(`Video duration: ${durationMinutes.toFixed(2)} minutes (expected 4:00 ±30s)`, 'warning', 'visual');
                    this.validationResults.visual.warnings++;
                }
            } else {
                this.log('Could not parse video duration', 'warning', 'visual');
                this.validationResults.visual.warnings++;
            }
            this.validationResults.visual.total++;
        } catch (error) {
            this.log(`Error checking video duration: ${error.message}`, 'warning', 'visual');
            this.validationResults.visual.warnings++;
            this.validationResults.visual.total++;
        }

        // Content variety check
        try {
            const sceneChanges = execSync(`ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.1)',showinfo" -f null - 2>&1`, { encoding: 'utf8' });
            const changeCount = (sceneChanges.match(/pts_time:/g) || []).length;
            
            if (changeCount >= 3) {
                this.log(`Video has ${changeCount} scene changes (good content variety)`, 'success', 'visual');
                this.validationResults.visual.passed++;
            } else {
                this.log(`Video has only ${changeCount} scene changes (may be too static)`, 'warning', 'visual');
                this.validationResults.visual.warnings++;
            }
            this.validationResults.visual.total++;

        } catch (error) {
            this.log(`Error checking content variety: ${error.message}`, 'warning', 'visual');
            this.validationResults.visual.warnings++;
            this.validationResults.visual.total++;
        }

        return true;
    }

    async runContentValidation() {
        console.log(chalk.cyan.bold('\n📝 Content Validation'));
        console.log(chalk.cyan('==================\n'));

        // Check narration content
        try {
            const captionsPath = path.join(OUTPUT_DIR, 'captions.vtt');
            if (await fs.pathExists(captionsPath)) {
                const captionsContent = await fs.readFile(captionsPath, 'utf8');
                
                // Check for key disaster response terms
                const keyTerms = [
                    'disaster', 'response', 'dashboard', 'hazard', 'evacuation', 'emergency',
                    'map', 'route', 'building', 'weather', 'real-time', 'monitoring'
                ];
                
                const foundTerms = keyTerms.filter(term => 
                    captionsContent.toLowerCase().includes(term.toLowerCase())
                );
                
                if (foundTerms.length >= 8) {
                    this.log(`Found ${foundTerms.length}/12 key disaster response terms in narration`, 'success', 'content');
                    this.validationResults.content.passed++;
                } else {
                    this.log(`Found only ${foundTerms.length}/12 key disaster response terms in narration`, 'warning', 'content');
                    this.validationResults.content.warnings++;
                }
                this.validationResults.content.total++;

            } else {
                this.log('Captions file not found for content analysis', 'error', 'content');
                this.validationResults.content.errors++;
                this.validationResults.content.total++;
            }
        } catch (error) {
            this.log(`Error checking narration content: ${error.message}`, 'error', 'content');
            this.validationResults.content.errors++;
            this.validationResults.content.total++;
        }

        // Check metadata
        try {
            const metadataPath = path.join(OUTPUT_DIR, 'video-metadata.json');
            if (await fs.pathExists(metadataPath)) {
                const metadata = await fs.readJson(metadataPath);
                
                const requiredFields = ['title', 'description', 'duration', 'resolution', 'format'];
                let requiredCount = 0;
                
                for (const field of requiredFields) {
                    if (metadata[field]) {
                        requiredCount++;
                    }
                }
                
                if (requiredCount === requiredFields.length) {
                    this.log('All required metadata fields present', 'success', 'content');
                    this.validationResults.content.passed++;
                } else {
                    this.log(`Missing ${requiredFields.length - requiredCount} required metadata fields`, 'error', 'content');
                    this.validationResults.content.errors++;
                }
                this.validationResults.content.total++;

            } else {
                this.log('Metadata file not found', 'error', 'content');
                this.validationResults.content.errors++;
                this.validationResults.content.total++;
            }
        } catch (error) {
            this.log(`Error checking metadata: ${error.message}`, 'error', 'content');
            this.validationResults.content.errors++;
            this.validationResults.content.total++;
        }

        // Check file size
        try {
            const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
            const stats = await fs.stat(videoPath);
            const sizeMB = stats.size / (1024 * 1024);
            
            if (sizeMB >= 5 && sizeMB <= 20) {
                this.log(`Video file size: ${sizeMB.toFixed(2)}MB (appropriate for demo)`, 'success', 'content');
                this.validationResults.content.passed++;
            } else {
                this.log(`Video file size: ${sizeMB.toFixed(2)}MB (may need adjustment)`, 'warning', 'content');
                this.validationResults.content.warnings++;
            }
            this.validationResults.content.total++;

        } catch (error) {
            this.log(`Error checking file size: ${error.message}`, 'error', 'content');
            this.validationResults.content.errors++;
            this.validationResults.content.total++;
        }

        return true;
    }

    async runComprehensiveValidation() {
        console.log(chalk.cyan.bold('\n🎬 Comprehensive Video Validation Suite'));
        console.log(chalk.cyan('==========================================\n'));

        const spinner = ora('Running comprehensive validation...').start();

        // Run all validation types
        await this.runTechnicalValidation();
        await this.runVisualValidation();
        await this.runContentValidation();

        spinner.succeed('Comprehensive validation complete!');

        // Generate comprehensive report
        await this.generateComprehensiveReport();

        // Display summary
        this.displayValidationSummary();

        return this.errors.length === 0;
    }

    displayValidationSummary() {
        console.log(chalk.cyan.bold('\n📊 Comprehensive Validation Summary'));
        console.log(chalk.cyan('====================================='));

        // Technical summary
        const tech = this.validationResults.technical;
        const techRate = tech.total > 0 ? ((tech.passed / tech.total) * 100).toFixed(1) : '0.0';
        console.log(chalk.blue.bold('\n🔧 Technical Validation:'));
        console.log(chalk.green(`  ✅ Passed: ${tech.passed}/${tech.total} (${techRate}%)`));
        console.log(chalk.yellow(`  ⚠️  Warnings: ${tech.warnings}`));
        console.log(chalk.red(`  ❌ Errors: ${tech.errors}`));

        // Visual summary
        const visual = this.validationResults.visual;
        const visualRate = visual.total > 0 ? ((visual.passed / visual.total) * 100).toFixed(1) : '0.0';
        console.log(chalk.blue.bold('\n🎬 Visual Validation:'));
        console.log(chalk.green(`  ✅ Passed: ${visual.passed}/${visual.total} (${visualRate}%)`));
        console.log(chalk.yellow(`  ⚠️  Warnings: ${visual.warnings}`));
        console.log(chalk.red(`  ❌ Errors: ${visual.errors}`));

        // Content summary
        const content = this.validationResults.content;
        const contentRate = content.total > 0 ? ((content.passed / content.total) * 100).toFixed(1) : '0.0';
        console.log(chalk.blue.bold('\n📝 Content Validation:'));
        console.log(chalk.green(`  ✅ Passed: ${content.passed}/${content.total} (${contentRate}%)`));
        console.log(chalk.yellow(`  ⚠️  Warnings: ${content.warnings}`));
        console.log(chalk.red(`  ❌ Errors: ${content.errors}`));

        // Overall summary
        const totalPassed = tech.passed + visual.passed + content.passed;
        const totalTests = tech.total + visual.total + content.total;
        const overallRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
        const totalErrors = tech.errors + visual.errors + content.errors;
        const totalWarnings = tech.warnings + visual.warnings + content.warnings;

        console.log(chalk.cyan.bold('\n🎯 Overall Results:'));
        console.log(chalk.green(`  ✅ Total Passed: ${totalPassed}/${totalTests} (${overallRate}%)`));
        console.log(chalk.yellow(`  ⚠️  Total Warnings: ${totalWarnings}`));
        console.log(chalk.red(`  ❌ Total Errors: ${totalErrors}`));

        if (totalErrors === 0) {
            console.log(chalk.green.bold('\n🎉 Video validation passed! Ready for application use.'));
        } else {
            console.log(chalk.red.bold('\n⚠️  Video validation failed. Please address errors before use.'));
        }

        // Display recommendations
        this.displayRecommendations();
    }

    displayRecommendations() {
        console.log(chalk.cyan.bold('\n💡 Recommendations:'));
        
        const tech = this.validationResults.technical;
        const visual = this.validationResults.visual;
        const content = this.validationResults.content;

        if (tech.errors > 0) {
            console.log(chalk.yellow('  • Fix technical errors for better compatibility'));
        }
        if (visual.warnings > 0) {
            console.log(chalk.yellow('  • Consider addressing visual quality warnings'));
        }
        if (content.warnings > 0) {
            console.log(chalk.yellow('  • Review content warnings for better presentation'));
        }
        if (tech.passed / tech.total >= 0.8 && visual.passed / visual.total >= 0.8 && content.passed / content.total >= 0.8) {
            console.log(chalk.green('  • Video meets high quality standards'));
        }
    }

    async generateComprehensiveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            validationResults: this.validationResults,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                totalPassed: this.validationResults.technical.passed + this.validationResults.visual.passed + this.validationResults.content.passed,
                totalTests: this.validationResults.technical.total + this.validationResults.visual.total + this.validationResults.content.total,
                totalErrors: this.validationResults.technical.errors + this.validationResults.visual.errors + this.validationResults.content.errors,
                totalWarnings: this.validationResults.technical.warnings + this.validationResults.visual.warnings + this.validationResults.content.warnings
            },
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(OUTPUT_DIR, 'comprehensive_validation_report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        this.log(`Comprehensive validation report saved to: ${reportPath}`, 'success', 'general');
    }

    generateRecommendations() {
        const recommendations = [];
        
        const tech = this.validationResults.technical;
        const visual = this.validationResults.visual;
        const content = this.validationResults.content;

        if (tech.errors > 0) {
            recommendations.push('Address technical compatibility issues');
        }
        if (visual.warnings > 0) {
            recommendations.push('Consider improving visual quality');
        }
        if (content.warnings > 0) {
            recommendations.push('Review content for better presentation');
        }
        if (tech.passed / tech.total >= 0.8 && visual.passed / visual.total >= 0.8 && content.passed / content.total >= 0.8) {
            recommendations.push('Video is ready for production use');
        }

        return recommendations;
    }
}

// Run comprehensive validation
const validator = new ComprehensiveValidator();
validator.runComprehensiveValidation().catch(error => {
    console.error(chalk.red('Comprehensive validation failed with error:'), error);
    process.exit(1);
});
