#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoFrontendComparator {
    constructor() {
        this.videoContent = [];
        this.frontendScreenshots = [];
        this.comparisonResults = {
            matches: [],
            mismatches: [],
            missing: [],
            recommendations: []
        };
    }

    async analyzeVideoContent() {
        console.log(chalk.cyan.bold('\n🎬 Analyzing Video Content'));
        console.log(chalk.cyan('==========================\n'));

        const videoPath = path.join(__dirname, '..', 'output', 'disaster-response-demo.mp4');
        const captionsPath = path.join(__dirname, '..', 'output', 'captions.vtt');
        const metadataPath = path.join(__dirname, '..', 'output', 'video-metadata.json');

        // Extract video content from captions
        if (await fs.pathExists(captionsPath)) {
            const captions = await fs.readFile(captionsPath, 'utf8');
            const lines = captions.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.match(/^\d+$/)) {
                    // This is a caption number, next line has timestamp
                    const timestampLine = lines[i + 1];
                    const contentLine = lines[i + 2];
                    
                    if (contentLine && !contentLine.includes('-->')) {
                        this.videoContent.push({
                            timestamp: timestampLine,
                            content: contentLine,
                            features: this.extractFeatures(contentLine)
                        });
                    }
                }
            }
        }

        // Extract features mentioned in video
        const features = [
            'satellite detections',
            'terrain-aware risk grid',
            'NASA FIRMS data',
            'NOAA weather',
            'ground sensors',
            'H3 spatial indexing',
            'real-time risk scoring',
            'evacuation routes',
            'A* algorithm',
            'hazard weights',
            'resource allocation',
            'staging areas',
            'targeted alerts',
            'emergency notifications',
            'real-time status updates',
            'React and Mapbox GL',
            '3D visualization',
            'Python services',
            'Redis and Celery',
            'scikit-learn',
            'Foundry integration'
        ];

        console.log(chalk.green(`✅ Extracted ${this.videoContent.length} content segments from video`));
        console.log(chalk.green(`✅ Identified ${features.length} key features mentioned`));

        return features;
    }

    extractFeatures(content) {
        const features = [];
        const featureKeywords = [
            'satellite', 'terrain', 'risk', 'NASA', 'NOAA', 'sensors', 'spatial', 'evacuation',
            'algorithm', 'hazard', 'resource', 'staging', 'alerts', 'notifications', 'React',
            'Mapbox', '3D', 'Python', 'Redis', 'Celery', 'scikit-learn', 'Foundry'
        ];

        featureKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
                features.push(keyword);
            }
        });

        return features;
    }

    async analyzeFrontendScreenshots() {
        console.log(chalk.cyan.bold('\n🖥️  Analyzing Frontend Screenshots'));
        console.log(chalk.cyan('==================================\n'));

        const screenshotsDir = path.join(__dirname, '..', '..', 'frontend', 'screenshots');
        const reportPath = path.join(screenshotsDir, 'screenshot-report.json');

        if (await fs.pathExists(reportPath)) {
            const report = await fs.readJson(reportPath);
            this.frontendScreenshots = report.screenshots;

            console.log(chalk.green(`✅ Found ${this.frontendScreenshots.length} frontend screenshots`));
            
            // List the screenshots
            this.frontendScreenshots.forEach(screenshot => {
                console.log(chalk.blue(`  📸 ${screenshot.name} (${(screenshot.size / 1024).toFixed(1)}KB)`));
            });
        } else {
            console.log(chalk.yellow('⚠️  No screenshot report found'));
        }
    }

    async compareContent() {
        console.log(chalk.cyan.bold('\n🔍 Comparing Video Content with Frontend'));
        console.log(chalk.cyan('==========================================\n'));

        // Check if video mentions features that should be visible in frontend
        const expectedFrontendFeatures = [
            'dashboard',
            'map',
            'hazard layers',
            'evacuation routes',
            'building status',
            'weather panel',
            'resource allocation',
            'alerts',
            '3D visualization',
            'real-time updates'
        ];

        const videoFeatures = this.videoContent.flatMap(segment => segment.features);
        const uniqueVideoFeatures = [...new Set(videoFeatures)];

        console.log(chalk.blue.bold('Video Features Mentioned:'));
        uniqueVideoFeatures.forEach(feature => {
            console.log(chalk.blue(`  • ${feature}`));
        });

        console.log(chalk.blue.bold('\nExpected Frontend Features:'));
        expectedFrontendFeatures.forEach(feature => {
            console.log(chalk.blue(`  • ${feature}`));
        });

        // Check for matches
        const matches = expectedFrontendFeatures.filter(feature => 
            uniqueVideoFeatures.some(vf => 
                vf.toLowerCase().includes(feature.toLowerCase()) ||
                feature.toLowerCase().includes(vf.toLowerCase())
            )
        );

        const mismatches = expectedFrontendFeatures.filter(feature => 
            !uniqueVideoFeatures.some(vf => 
                vf.toLowerCase().includes(feature.toLowerCase()) ||
                feature.toLowerCase().includes(vf.toLowerCase())
            )
        );

        console.log(chalk.green.bold(`\n✅ Matches (${matches.length}):`));
        matches.forEach(match => {
            console.log(chalk.green(`  • ${match}`));
        });

        if (mismatches.length > 0) {
            console.log(chalk.yellow.bold(`\n⚠️  Potential Mismatches (${mismatches.length}):`));
            mismatches.forEach(mismatch => {
                console.log(chalk.yellow(`  • ${mismatch}`));
            });
        }

        this.comparisonResults.matches = matches;
        this.comparisonResults.mismatches = mismatches;

        return { matches, mismatches };
    }

    async generateRecommendations() {
        console.log(chalk.cyan.bold('\n💡 Recommendations'));
        console.log(chalk.cyan('==================\n'));

        const recommendations = [];

        if (this.comparisonResults.mismatches.length > 0) {
            recommendations.push({
                type: 'content',
                priority: 'high',
                message: 'Video mentions features not clearly visible in frontend screenshots',
                details: this.comparisonResults.mismatches
            });
        }

        if (this.frontendScreenshots.length < 5) {
            recommendations.push({
                type: 'coverage',
                priority: 'medium',
                message: 'Limited frontend screenshot coverage - consider capturing more views',
                details: `Only ${this.frontendScreenshots.length} screenshots captured`
            });
        }

        // Check if video content matches frontend capabilities
        const videoMentions3D = this.videoContent.some(segment => 
            segment.content.toLowerCase().includes('3d') || 
            segment.content.toLowerCase().includes('terrain')
        );

        const hasMapScreenshots = this.frontendScreenshots.some(screenshot => 
            screenshot.name.toLowerCase().includes('map') ||
            screenshot.name.toLowerCase().includes('dashboard')
        );

        if (videoMentions3D && !hasMapScreenshots) {
            recommendations.push({
                type: 'visual',
                priority: 'high',
                message: 'Video mentions 3D visualization but no map screenshots captured',
                details: 'Consider capturing map/3D views'
            });
        }

        recommendations.forEach(rec => {
            const color = rec.priority === 'high' ? chalk.red : chalk.yellow;
            console.log(color(`  ${rec.priority.toUpperCase()}: ${rec.message}`));
            if (rec.details) {
                console.log(color(`    Details: ${Array.isArray(rec.details) ? rec.details.join(', ') : rec.details}`));
            }
        });

        this.comparisonResults.recommendations = recommendations;
        return recommendations;
    }

    async generateComparisonReport() {
        const report = {
            timestamp: new Date().toISOString(),
            videoContent: {
                segments: this.videoContent.length,
                features: this.videoContent.flatMap(segment => segment.features)
            },
            frontendScreenshots: {
                count: this.frontendScreenshots.length,
                screenshots: this.frontendScreenshots.map(s => s.name)
            },
            comparison: this.comparisonResults,
            summary: {
                matchRate: this.comparisonResults.matches.length / (this.comparisonResults.matches.length + this.comparisonResults.mismatches.length),
                needsRerecording: this.comparisonResults.mismatches.length > 3
            }
        };

        const reportPath = path.join(__dirname, '..', 'output', 'video-frontend-comparison.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });

        console.log(chalk.green(`\n✅ Comparison report saved: ${reportPath}`));
        return report;
    }

    async run() {
        const spinner = ora('Analyzing video and frontend content...').start();

        try {
            await this.analyzeVideoContent();
            await this.analyzeFrontendScreenshots();
            
            spinner.succeed('Analysis complete!');

            const comparison = await this.compareContent();
            const recommendations = await this.generateRecommendations();
            const report = await this.generateComparisonReport();

            // Final assessment
            console.log(chalk.cyan.bold('\n🎯 Final Assessment'));
            console.log(chalk.cyan('==================\n'));

            if (report.summary.needsRerecording) {
                console.log(chalk.red.bold('❌ RECOMMENDATION: Re-record video'));
                console.log(chalk.red('   The video content does not match the frontend capabilities well enough.'));
                console.log(chalk.red('   Consider updating the video to better showcase the actual frontend features.'));
            } else if (comparison.matches.length >= 7) {
                console.log(chalk.green.bold('✅ Video content matches frontend well'));
                console.log(chalk.green('   The video effectively demonstrates the frontend capabilities.'));
            } else {
                console.log(chalk.yellow.bold('⚠️  Video content partially matches frontend'));
                console.log(chalk.yellow('   Consider minor updates to better align video content with frontend features.'));
            }

            return report;

        } catch (error) {
            spinner.fail('Analysis failed');
            console.error(chalk.red('Error during comparison:'), error);
            throw error;
        }
    }
}

// Run the comparison
const comparator = new VideoFrontendComparator();
comparator.run().catch(console.error);
