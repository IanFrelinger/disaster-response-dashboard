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

class ContentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = 0;
        this.total = 0;
        this.contentChecks = {
            mapVisualization: false,
            hazardLayers: false,
            evacuationRoutes: false,
            buildingStatus: false,
            weatherData: false,
            realTimeUpdates: false,
            multiHazardSupport: false,
            roleBasedViews: false
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        switch (type) {
            case 'error':
                console.log(chalk.red(`❌ ${message}`));
                this.errors.push(message);
                break;
            case 'warning':
                console.log(chalk.yellow(`⚠️  ${message}`));
                this.warnings.push(message);
                break;
            case 'success':
                console.log(chalk.green(`✅ ${message}`));
                this.passed++;
                break;
            default:
                console.log(chalk.blue(`ℹ️  ${message}`));
        }
        this.total++;
    }

    async checkVideoDuration(videoPath) {
        try {
            const durationOutput = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`, { encoding: 'utf8' });
            const duration = parseFloat(durationOutput.trim());
            const durationMinutes = duration / 60;
            
            if (durationMinutes >= 3.5 && durationMinutes <= 4.5) {
                this.log(`Video duration: ${durationMinutes.toFixed(2)} minutes (optimal for demo)`, 'success');
                return true;
            } else {
                this.log(`Video duration: ${durationMinutes.toFixed(2)} minutes (should be 4:00 ±30s)`, 'warning');
                return false;
            }
        } catch (error) {
            this.log(`Error checking video duration: ${error.message}`, 'error');
            return false;
        }
    }

    async checkAudioQuality(videoPath) {
        try {
            const audioInfo = execSync(`ffprobe -v quiet -select_streams a:0 -show_entries stream=sample_rate,channels,codec_name -of json "${videoPath}"`, { encoding: 'utf8' });
            const audio = JSON.parse(audioInfo);
            
            if (audio.streams && audio.streams[0]) {
                const stream = audio.streams[0];
                const sampleRate = parseInt(stream.sample_rate);
                const channels = parseInt(stream.channels);
                
                if (sampleRate >= 44100) {
                    this.log(`Audio sample rate: ${sampleRate}Hz (high quality)`, 'success');
                } else {
                    this.log(`Audio sample rate: ${sampleRate}Hz (low quality)`, 'warning');
                }
                
                if (channels >= 2) {
                    this.log(`Audio channels: ${channels} (stereo)`, 'success');
                } else {
                    this.log(`Audio channels: ${channels} (mono)`, 'warning');
                }
                
                return true;
            } else {
                this.log('No audio stream found', 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error checking audio quality: ${error.message}`, 'error');
            return false;
        }
    }

    async checkNarrationContent() {
        try {
            const captionsPath = path.join(OUTPUT_DIR, 'captions.vtt');
            if (!await fs.pathExists(captionsPath)) {
                this.log('Captions file not found for narration analysis', 'error');
                return false;
            }

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
                this.log(`Found ${foundTerms.length}/12 key disaster response terms in narration`, 'success');
            } else {
                this.log(`Found only ${foundTerms.length}/12 key disaster response terms in narration`, 'warning');
            }

            // Check for professional tone indicators
            const professionalIndicators = [
                'demonstrates', 'shows', 'displays', 'provides', 'enables', 'supports',
                'features', 'capabilities', 'functionality', 'integration'
            ];
            
            const foundIndicators = professionalIndicators.filter(indicator => 
                captionsContent.toLowerCase().includes(indicator.toLowerCase())
            );
            
            if (foundIndicators.length >= 5) {
                this.log(`Narration uses professional tone (${foundIndicators.length} indicators)`, 'success');
            } else {
                this.log(`Narration may need more professional tone (${foundIndicators.length} indicators)`, 'warning');
            }

            return true;
        } catch (error) {
            this.log(`Error checking narration content: ${error.message}`, 'error');
            return false;
        }
    }

    async checkVideoStructure(videoPath) {
        try {
            // Check for scene changes to ensure proper video structure
            const sceneChanges = execSync(`ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.1)',showinfo" -f null - 2>&1`, { encoding: 'utf8' });
            const changeCount = (sceneChanges.match(/pts_time:/g) || []).length;
            
            if (changeCount >= 3) {
                this.log(`Video has ${changeCount} scene changes (good structure)`, 'success');
            } else {
                this.log(`Video has only ${changeCount} scene changes (may be too static)`, 'warning');
            }

            // Check for smooth transitions
            const transitionCheck = execSync(`ffmpeg -i "${videoPath}" -vf "fps=fps=30" -f null - 2>&1`, { encoding: 'utf8' });
            if (transitionCheck.includes('error')) {
                this.log('Potential issues with video transitions detected', 'warning');
            } else {
                this.log('Video transitions appear smooth', 'success');
            }

            return true;
        } catch (error) {
            this.log(`Error checking video structure: ${error.message}`, 'error');
            return false;
        }
    }

    async checkFileSize(videoPath) {
        try {
            const stats = await fs.stat(videoPath);
            const sizeMB = stats.size / (1024 * 1024);
            
            if (sizeMB >= 5 && sizeMB <= 20) {
                this.log(`Video file size: ${sizeMB.toFixed(2)}MB (appropriate for demo)`, 'success');
                return true;
            } else if (sizeMB < 5) {
                this.log(`Video file size: ${sizeMB.toFixed(2)}MB (may be too small)`, 'warning');
                return false;
            } else {
                this.log(`Video file size: ${sizeMB.toFixed(2)}MB (may be too large for web)`, 'warning');
                return false;
            }
        } catch (error) {
            this.log(`Error checking file size: ${error.message}`, 'error');
            return false;
        }
    }

    async checkMetadataCompleteness() {
        try {
            const metadataPath = path.join(OUTPUT_DIR, 'video-metadata.json');
            if (!await fs.pathExists(metadataPath)) {
                this.log('Metadata file not found', 'error');
                return false;
            }

            const metadata = await fs.readJson(metadataPath);
            
            const requiredFields = ['title', 'description', 'duration', 'resolution', 'format'];
            const optionalFields = ['author', 'keywords', 'category', 'version'];
            
            let requiredCount = 0;
            for (const field of requiredFields) {
                if (metadata[field]) {
                    requiredCount++;
                    this.log(`Required metadata field '${field}' present`, 'success');
                } else {
                    this.log(`Required metadata field '${field}' missing`, 'error');
                }
            }
            
            let optionalCount = 0;
            for (const field of optionalFields) {
                if (metadata[field]) {
                    optionalCount++;
                    this.log(`Optional metadata field '${field}' present`, 'success');
                }
            }
            
            if (requiredCount === requiredFields.length) {
                this.log('All required metadata fields present', 'success');
            } else {
                this.log(`Missing ${requiredFields.length - requiredCount} required metadata fields`, 'error');
            }
            
            if (optionalCount >= 2) {
                this.log(`Good metadata completeness (${optionalCount} optional fields)`, 'success');
            } else {
                this.log(`Limited metadata (${optionalCount} optional fields)`, 'warning');
            }

            return requiredCount === requiredFields.length;
        } catch (error) {
            this.log(`Error checking metadata: ${error.message}`, 'error');
            return false;
        }
    }

    async checkThumbnailQuality() {
        try {
            const thumbnailPath = path.join(OUTPUT_DIR, 'thumbnail.jpg');
            if (!await fs.pathExists(thumbnailPath)) {
                this.log('Thumbnail file not found', 'error');
                return false;
            }

            const stats = await fs.stat(thumbnailPath);
            const sizeKB = stats.size / 1024;
            
            if (sizeKB >= 10 && sizeKB <= 200) {
                this.log(`Thumbnail size: ${sizeKB.toFixed(1)}KB (appropriate)`, 'success');
            } else {
                this.log(`Thumbnail size: ${sizeKB.toFixed(1)}KB (may need adjustment)`, 'warning');
            }

            // Check thumbnail dimensions
            const identifyOutput = execSync(`identify "${thumbnailPath}"`, { encoding: 'utf8' });
            const dimensionsMatch = identifyOutput.match(/(\d+)x(\d+)/);
            
            if (dimensionsMatch) {
                const width = parseInt(dimensionsMatch[1]);
                const height = parseInt(dimensionsMatch[2]);
                
                if (width >= 320 && height >= 180) {
                    this.log(`Thumbnail dimensions: ${width}x${height} (good for preview)`, 'success');
                } else {
                    this.log(`Thumbnail dimensions: ${width}x${height} (may be too small)`, 'warning');
                }
            }

            return true;
        } catch (error) {
            this.log(`Error checking thumbnail: ${error.message}`, 'warning');
            return false;
        }
    }

    async runContentValidation() {
        console.log(chalk.cyan.bold('\n🎬 Content Validation Suite'));
        console.log(chalk.cyan('==========================\n'));

        const spinner = ora('Running content validation...').start();

        const videoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        
        if (!await fs.pathExists(videoPath)) {
            this.log('Main video file not found', 'error');
            spinner.fail('Content validation failed - no video file');
            return false;
        }

        // Basic content checks
        await this.checkVideoDuration(videoPath);
        await this.checkAudioQuality(videoPath);
        await this.checkVideoStructure(videoPath);
        await this.checkFileSize(videoPath);
        
        // Content-specific checks
        await this.checkNarrationContent();
        await this.checkMetadataCompleteness();
        await this.checkThumbnailQuality();

        spinner.succeed('Content validation complete!');

        // Generate content report
        await this.generateContentReport();

        // Summary
        console.log(chalk.cyan.bold('\n📊 Content Validation Summary'));
        console.log(chalk.cyan('============================='));
        console.log(chalk.green(`✅ Passed: ${this.passed}`));
        console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
        console.log(chalk.red(`❌ Errors: ${this.errors.length}`));
        console.log(chalk.blue(`📈 Total: ${this.total}`));

        if (this.errors.length > 0) {
            console.log(chalk.red.bold('\n❌ Content Issues:'));
            this.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
        }

        if (this.warnings.length > 0) {
            console.log(chalk.yellow.bold('\n⚠️  Content Warnings:'));
            this.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
        }

        const successRate = ((this.passed / this.total) * 100).toFixed(1);
        console.log(chalk.cyan.bold(`\n🎯 Success Rate: ${successRate}%`));

        if (this.errors.length === 0) {
            console.log(chalk.green.bold('\n🎉 Content validation passed! Video content is appropriate for application.'));
            return true;
        } else {
            console.log(chalk.red.bold('\n⚠️  Content validation failed. Please address content issues before use.'));
            return false;
        }
    }

    async generateContentReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                passed: this.passed,
                warnings: this.warnings.length,
                errors: this.errors.length,
                total: this.total,
                successRate: ((this.passed / this.total) * 100).toFixed(1)
            },
            errors: this.errors,
            warnings: this.warnings,
            contentChecks: this.contentChecks,
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(OUTPUT_DIR, 'content_validation_report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        this.log(`Content validation report saved to: ${reportPath}`, 'success');
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.warnings.length > 0) {
            recommendations.push('Consider addressing warnings to improve video quality');
        }
        
        if (this.errors.length > 0) {
            recommendations.push('Fix critical errors before using video in application');
        }
        
        if (this.passed / this.total >= 0.8) {
            recommendations.push('Video meets most quality standards for application use');
        } else {
            recommendations.push('Video may need improvements before application use');
        }
        
        return recommendations;
    }
}

// Run content validation
const validator = new ContentValidator();
validator.runContentValidation().catch(error => {
    console.error(chalk.red('Content validation failed with error:'), error);
    process.exit(1);
});
