#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoStoryboardGenerator {
    constructor() {
        this.screenshots = [];
        this.storyboard = [];
        this.scenes = [];
    }

    async loadScreenshots() {
        console.log(chalk.cyan.bold('\n📸 Loading Screenshots for Storyboard'));
        console.log(chalk.cyan('==========================================\n'));

        const reportPath = path.join(__dirname, '..', '..', 'frontend', 'screenshots', 'comprehensive-screenshot-report.json');
        
        if (await fs.pathExists(reportPath)) {
            const report = await fs.readJson(reportPath);
            this.screenshots = report.screenshots;
            console.log(chalk.green(`✅ Loaded ${this.screenshots.length} screenshots`));
        } else {
            console.log(chalk.yellow('⚠️  No screenshot report found'));
        }
    }

    generateStoryboard() {
        console.log(chalk.cyan.bold('\n🎬 Generating Video Storyboard'));
        console.log(chalk.cyan('==============================\n'));

        this.storyboard = [
            {
                scene: 1,
                timestamp: '0:00-0:15',
                title: 'Opening - Problem Statement',
                screenshot: '01-main-dashboard-overview',
                description: 'Main dashboard overview showing the central command interface',
                narration: 'In fast-moving disasters, minutes matter. Here\'s how our disaster response dashboard cuts decision time dramatically.',
                visualActions: [
                    'Show main dashboard with overview panels',
                    'Highlight key metrics and status indicators',
                    'Demonstrate clean, professional interface design'
                ],
                cameraMovement: 'Static overview shot',
                duration: 15
            },
            {
                scene: 2,
                timestamp: '0:15-0:30',
                title: 'Current Challenges',
                screenshot: '02-dashboard-with-metrics',
                description: 'Dashboard showing current emergency management challenges',
                narration: 'Emergency managers face fragmented data, slow coordination, and dangerous routing that puts evacuees in harm\'s way.',
                visualActions: [
                    'Point to fragmented data indicators',
                    'Show coordination challenges',
                    'Highlight routing problems'
                ],
                cameraMovement: 'Zoom in on specific metrics',
                duration: 15
            },
            {
                scene: 3,
                timestamp: '0:30-0:45',
                title: 'Unified Platform Introduction',
                screenshot: '03-navigation-menu-open',
                description: 'Navigation menu showing all available system sections',
                narration: 'Our unified dashboard provides emergency commanders, first responders, and government agencies with a single platform for coordinated action.',
                visualActions: [
                    'Open navigation menu',
                    'Show all available sections',
                    'Demonstrate comprehensive system coverage'
                ],
                cameraMovement: 'Menu expansion animation',
                duration: 15
            },
            {
                scene: 4,
                timestamp: '0:45-1:00',
                title: 'Multi-Hazard Map Overview',
                screenshot: '04-multi-hazard-map',
                description: 'Interactive map with multiple hazard layers and data visualization',
                narration: 'The multi-hazard map integrates real-time data from multiple sources, providing a comprehensive view of current threats.',
                visualActions: [
                    'Show map interface',
                    'Demonstrate hazard layer integration',
                    'Highlight real-time data feeds'
                ],
                cameraMovement: 'Map zoom and pan',
                duration: 15
            },
            {
                scene: 5,
                timestamp: '1:00-1:15',
                title: 'Hazard Layer Activation',
                screenshot: '05-map-hazard-layers-active',
                description: 'Map with hazard layers toggled on showing fire, flood, and weather data',
                narration: 'With one click, we can activate hazard layers showing fire perimeters, flood zones, and weather patterns.',
                visualActions: [
                    'Click hazard layers button',
                    'Show layers activating',
                    'Demonstrate multiple hazard types'
                ],
                cameraMovement: 'Layer toggle animation',
                duration: 15
            },
            {
                scene: 6,
                timestamp: '1:15-1:30',
                title: 'Evacuation Route Planning',
                screenshot: '06-map-evacuation-routes',
                description: 'Map displaying evacuation routes and safe passage corridors',
                narration: 'With one click, we generate safe evacuation routes that avoid danger zones. Routes dynamically adjust based on real-time conditions.',
                visualActions: [
                    'Show evacuation route generation',
                    'Demonstrate route optimization',
                    'Highlight safety considerations'
                ],
                cameraMovement: 'Route drawing animation',
                duration: 15
            },
            {
                scene: 7,
                timestamp: '1:30-1:45',
                title: '3D Terrain Visualization',
                screenshot: '07-3d-terrain-view',
                description: '3D terrain visualization with elevation and topographic data',
                narration: 'Our 3D terrain visualization provides critical elevation data that affects evacuation planning and resource deployment.',
                visualActions: [
                    'Activate 3D view',
                    'Show terrain elevation',
                    'Demonstrate topographic features'
                ],
                cameraMovement: '3D rotation and zoom',
                duration: 15
            },
            {
                scene: 8,
                timestamp: '1:45-2:00',
                title: 'Evacuation Management',
                screenshot: '08-evacuation-dashboard-main',
                description: 'Main evacuation management interface with route planning tools',
                narration: 'The evacuation dashboard provides comprehensive tools for managing mass evacuations and coordinating safe passage.',
                visualActions: [
                    'Show evacuation dashboard',
                    'Demonstrate management tools',
                    'Highlight coordination features'
                ],
                cameraMovement: 'Dashboard overview',
                duration: 15
            },
            {
                scene: 9,
                timestamp: '2:00-2:15',
                title: 'Route Planning Interface',
                screenshot: '09-route-planning-interface',
                description: 'Route planning interface with origin, destination, and optimization settings',
                narration: 'Advanced route planning tools allow emergency managers to optimize evacuation paths based on current conditions.',
                visualActions: [
                    'Show route planning interface',
                    'Demonstrate optimization settings',
                    'Highlight real-time adjustments'
                ],
                cameraMovement: 'Interface interaction',
                duration: 15
            },
            {
                scene: 10,
                timestamp: '2:15-2:30',
                title: 'Evacuation Zones',
                screenshot: '10-evacuation-zones',
                description: 'Map showing evacuation zones and affected areas',
                narration: 'Evacuation zones are dynamically updated based on threat progression and changing conditions.',
                visualActions: [
                    'Show evacuation zones',
                    'Demonstrate zone updates',
                    'Highlight affected areas'
                ],
                cameraMovement: 'Zone highlighting',
                duration: 15
            },
            {
                scene: 11,
                timestamp: '2:30-2:45',
                title: 'Commander Strategic View',
                screenshot: '11-commander-view',
                description: 'Strategic commander interface with high-level overview and decision tools',
                narration: 'Commanders get strategic overviews with high-level decision support tools for resource allocation.',
                visualActions: [
                    'Show commander interface',
                    'Highlight strategic tools',
                    'Demonstrate decision support'
                ],
                cameraMovement: 'Strategic overview',
                duration: 15
            },
            {
                scene: 12,
                timestamp: '2:45-3:00',
                title: 'First Responder Tactical View',
                screenshot: '12-first-responder-view',
                description: 'Tactical first responder interface with detailed operational information',
                narration: 'First responders see tactical details and operational information needed for immediate response.',
                visualActions: [
                    'Switch to responder view',
                    'Show tactical details',
                    'Highlight operational tools'
                ],
                cameraMovement: 'View transition',
                duration: 15
            },
            {
                scene: 13,
                timestamp: '3:00-3:15',
                title: 'Public Information Interface',
                screenshot: '13-public-information-view',
                description: 'Public information interface with citizen-facing alerts and updates',
                narration: 'Public information interfaces provide citizens with real-time updates and evacuation instructions.',
                visualActions: [
                    'Show public interface',
                    'Demonstrate citizen alerts',
                    'Highlight public communication'
                ],
                cameraMovement: 'Public view overview',
                duration: 15
            },
            {
                scene: 14,
                timestamp: '3:15-3:30',
                title: 'AI Decision Support',
                screenshot: '14-aip-decision-support-main',
                description: 'AI-powered decision support interface with recommendations and insights',
                narration: 'Our AI system analyzes patterns and provides real-time recommendations for resource allocation and response strategies.',
                visualActions: [
                    'Show AI interface',
                    'Demonstrate recommendations',
                    'Highlight intelligent insights'
                ],
                cameraMovement: 'AI panel focus',
                duration: 15
            },
            {
                scene: 15,
                timestamp: '3:30-3:45',
                title: 'AI Recommendations',
                screenshot: '15-ai-recommendations-panel',
                description: 'Panel showing AI-generated recommendations for resource allocation',
                narration: 'AI-generated recommendations help optimize resource deployment and improve response effectiveness.',
                visualActions: [
                    'Show recommendations panel',
                    'Demonstrate AI insights',
                    'Highlight optimization suggestions'
                ],
                cameraMovement: 'Recommendation display',
                duration: 15
            },
            {
                scene: 16,
                timestamp: '3:45-4:00',
                title: 'Risk Analysis',
                screenshot: '16-risk-analysis-view',
                description: 'Risk analysis interface with threat assessment and probability modeling',
                narration: 'Advanced risk analysis provides threat assessment and probability modeling for informed decision-making.',
                visualActions: [
                    'Show risk analysis interface',
                    'Demonstrate threat assessment',
                    'Highlight probability modeling'
                ],
                cameraMovement: 'Risk analysis focus',
                duration: 15
            },
            {
                scene: 17,
                timestamp: '4:00-4:15',
                title: 'Weather Integration',
                screenshot: '17-weather-panel-main',
                description: 'Weather information panel with current conditions and forecasts',
                narration: 'Real-time weather data from NOAA and other sources helps predict how conditions will affect response operations.',
                visualActions: [
                    'Show weather panel',
                    'Demonstrate weather data',
                    'Highlight forecast integration'
                ],
                cameraMovement: 'Weather data display',
                duration: 15
            },
            {
                scene: 18,
                timestamp: '4:15-4:30',
                title: 'Weather Forecasting',
                screenshot: '18-weather-forecast-view',
                description: 'Extended weather forecast with multiple time periods and conditions',
                narration: 'Extended weather forecasts help emergency managers plan for changing conditions and adjust response strategies.',
                visualActions: [
                    'Show extended forecast',
                    'Demonstrate time periods',
                    'Highlight condition changes'
                ],
                cameraMovement: 'Forecast timeline',
                duration: 15
            },
            {
                scene: 19,
                timestamp: '4:30-4:45',
                title: 'Environmental Monitoring',
                screenshot: '19-environmental-conditions',
                description: 'Environmental monitoring with air quality, wind patterns, and other factors',
                narration: 'Environmental monitoring provides critical data on air quality, wind patterns, and other factors affecting response operations.',
                visualActions: [
                    'Show environmental data',
                    'Demonstrate monitoring tools',
                    'Highlight critical factors'
                ],
                cameraMovement: 'Environmental data focus',
                duration: 15
            },
            {
                scene: 20,
                timestamp: '4:45-5:00',
                title: 'Interactive Controls',
                screenshot: '20-button-interactions',
                description: 'Various interactive buttons and controls throughout the interface',
                narration: 'Intuitive controls and interactions make the system accessible to users of all technical levels.',
                visualActions: [
                    'Show interactive controls',
                    'Demonstrate button interactions',
                    'Highlight user-friendly design'
                ],
                cameraMovement: 'Control interaction',
                duration: 15
            },
            {
                scene: 21,
                timestamp: '5:00-5:15',
                title: 'Panel Interactions',
                screenshot: '21-panel-interactions',
                description: 'Expandable panels and collapsible sections in the interface',
                narration: 'Expandable panels and collapsible sections provide organized access to detailed information without cluttering the interface.',
                visualActions: [
                    'Show panel interactions',
                    'Demonstrate expandable sections',
                    'Highlight organized layout'
                ],
                cameraMovement: 'Panel expansion',
                duration: 15
            },
            {
                scene: 22,
                timestamp: '5:15-5:30',
                title: 'Search and Filtering',
                screenshot: '22-search-functionality',
                description: 'Search interface with filters and query capabilities',
                narration: 'Advanced search and filtering capabilities help users quickly find relevant information and data.',
                visualActions: [
                    'Show search interface',
                    'Demonstrate filtering',
                    'Highlight query capabilities'
                ],
                cameraMovement: 'Search interaction',
                duration: 15
            },
            {
                scene: 23,
                timestamp: '5:30-5:45',
                title: 'System Configuration',
                screenshot: '23-settings-configuration',
                description: 'Settings panel with user preferences and system configuration',
                narration: 'Flexible system configuration allows customization to meet specific organizational needs and user preferences.',
                visualActions: [
                    'Show settings panel',
                    'Demonstrate configuration options',
                    'Highlight customization features'
                ],
                cameraMovement: 'Settings overview',
                duration: 15
            },
            {
                scene: 24,
                timestamp: '5:45-6:00',
                title: 'Alert Management',
                screenshot: '24-alert-center',
                description: 'Central alert management system with active notifications',
                narration: 'Centralized alert management ensures timely communication and coordinated response to emergency situations.',
                visualActions: [
                    'Show alert center',
                    'Demonstrate notification system',
                    'Highlight communication tools'
                ],
                cameraMovement: 'Alert center focus',
                duration: 15
            },
            {
                scene: 25,
                timestamp: '6:00-6:15',
                title: 'Emergency Notifications',
                screenshot: '25-emergency-notifications',
                description: 'Emergency notification system with priority alerts and status tracking',
                narration: 'Priority emergency notifications with status tracking ensure critical information reaches the right people at the right time.',
                visualActions: [
                    'Show emergency notifications',
                    'Demonstrate priority system',
                    'Highlight status tracking'
                ],
                cameraMovement: 'Notification display',
                duration: 15
            }
        ];

        console.log(chalk.green(`✅ Generated ${this.storyboard.length} storyboard scenes`));
        return this.storyboard;
    }

    generateSceneBreakdown() {
        console.log(chalk.cyan.bold('\n📋 Scene Breakdown'));
        console.log(chalk.cyan('================\n'));

        const breakdown = {
            introduction: this.storyboard.slice(0, 3),
            coreFeatures: this.storyboard.slice(3, 10),
            roleBasedViews: this.storyboard.slice(10, 13),
            aiFeatures: this.storyboard.slice(13, 16),
            environmentalData: this.storyboard.slice(16, 19),
            userInterface: this.storyboard.slice(19, 23),
            communication: this.storyboard.slice(23, 25)
        };

        console.log(chalk.blue.bold('Scene Categories:'));
        console.log(chalk.blue(`  • Introduction (${breakdown.introduction.length} scenes): Problem statement and overview`));
        console.log(chalk.blue(`  • Core Features (${breakdown.coreFeatures.length} scenes): Map, evacuation, and planning tools`));
        console.log(chalk.blue(`  • Role-Based Views (${breakdown.roleBasedViews.length} scenes): Different user interfaces`));
        console.log(chalk.blue(`  • AI Features (${breakdown.aiFeatures.length} scenes): Decision support and recommendations`));
        console.log(chalk.blue(`  • Environmental Data (${breakdown.environmentalData.length} scenes): Weather and monitoring`));
        console.log(chalk.blue(`  • User Interface (${breakdown.userInterface.length} scenes): Controls and interactions`));
        console.log(chalk.blue(`  • Communication (${breakdown.communication.length} scenes): Alerts and notifications`));

        return breakdown;
    }

    generateProductionNotes() {
        console.log(chalk.cyan.bold('\n🎬 Production Notes'));
        console.log(chalk.cyan('==================\n'));

        const notes = {
            totalDuration: '6:15 minutes',
            totalScenes: this.storyboard.length,
            averageSceneDuration: 15,
            technicalRequirements: {
                resolution: '1920x1080',
                frameRate: '30fps',
                audioQuality: 'High (44.1kHz, stereo)',
                format: 'MP4 (H.264)',
                aspectRatio: '16:9'
            },
            recordingGuidelines: [
                'Use smooth mouse movements and clear interactions',
                'Pause briefly between scenes for editing',
                'Ensure narration matches visual actions',
                'Highlight key UI elements being discussed',
                'Show actual functionality, not placeholder content',
                'Demonstrate real user workflows'
            ],
            postProduction: [
                'Add smooth transitions between scenes',
                'Include captions for accessibility',
                'Add background music (optional)',
                'Include system architecture diagrams',
                'Add impact metrics and cost savings',
                'Include call-to-action at the end'
            ]
        };

        console.log(chalk.green(`📊 Total Duration: ${notes.totalDuration}`));
        console.log(chalk.green(`🎬 Total Scenes: ${notes.totalScenes}`));
        console.log(chalk.green(`⏱️  Average Scene: ${notes.averageSceneDuration} seconds`));

        return notes;
    }

    async generateStoryboardReport() {
        console.log(chalk.cyan.bold('\n📄 Generating Storyboard Report'));
        console.log(chalk.cyan('==============================\n'));

        const report = {
            timestamp: new Date().toISOString(),
            storyboard: this.storyboard,
            sceneBreakdown: this.generateSceneBreakdown(),
            productionNotes: this.generateProductionNotes(),
            screenshots: this.screenshots.map(s => ({
                name: s.name,
                description: s.description,
                path: s.path
            })),
            summary: {
                totalScenes: this.storyboard.length,
                totalDuration: '6:15',
                keyFeatures: [
                    'Multi-hazard map visualization',
                    'Evacuation route planning',
                    'Role-based user interfaces',
                    'AI decision support',
                    'Real-time weather integration',
                    'Alert and notification system'
                ]
            }
        };

        const reportPath = path.join(__dirname, '..', 'output', 'video-storyboard.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });

        console.log(chalk.green(`✅ Storyboard report saved: ${reportPath}`));
        return report;
    }

    async run() {
        try {
            await this.loadScreenshots();
            this.generateStoryboard();
            this.generateSceneBreakdown();
            this.generateProductionNotes();
            const report = await this.generateStoryboardReport();

            console.log(chalk.cyan.bold('\n🎯 Storyboard Summary'));
            console.log(chalk.cyan('==================\n'));
            
            console.log(chalk.green('✅ Complete storyboard generated with:'));
            console.log(chalk.blue(`  • ${this.storyboard.length} detailed scenes`));
            console.log(chalk.blue(`  • ${this.screenshots.length} supporting screenshots`));
            console.log(chalk.blue(`  • 6:15 minute total duration`));
            console.log(chalk.blue(`  • Comprehensive production notes`));
            
            console.log(chalk.yellow('\n📋 Next Steps:'));
            console.log(chalk.yellow('  1. Review the storyboard scenes'));
            console.log(chalk.yellow('  2. Adjust timing and content as needed'));
            console.log(chalk.yellow('  3. Begin recording following the scene breakdown'));
            console.log(chalk.yellow('  4. Use the production notes for guidance'));
            
            return report;

        } catch (error) {
            console.error('❌ Error generating storyboard:', error);
            throw error;
        }
    }
}

// Generate the storyboard
const generator = new VideoStoryboardGenerator();
generator.run().catch(console.error);
