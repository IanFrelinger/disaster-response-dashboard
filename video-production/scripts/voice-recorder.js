#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VoiceRecorder {
    constructor() {
        this.recordings = [];
        this.outputDir = path.join(__dirname, '..', 'output', 'voice-recordings');
        this.scenes = [
            {
                scene: 1,
                time: '0:00-0:15',
                screenshot: '01-main-dashboard-overview.png',
                voiceOver: "When disasters strike, emergency managers face a nightmare: fragmented data, slow coordination, and dangerous routing that puts lives at risk.",
                filename: 'scene-01-problem-fragmented-response.wav'
            },
            {
                scene: 2,
                time: '0:15-0:30',
                screenshot: '02-dashboard-with-metrics.png',
                voiceOver: "Every minute of delay costs lives. Traditional systems take hours to coordinate - we cut that to minutes.",
                filename: 'scene-02-problem-time-costs-lives.wav'
            },
            {
                scene: 3,
                time: '0:30-0:45',
                screenshot: '03-navigation-menu-open.png',
                voiceOver: "Our unified dashboard gives emergency commanders, first responders, and agencies one platform for coordinated action.",
                filename: 'scene-03-solution-unified-platform.wav'
            },
            {
                scene: 4,
                time: '0:45-1:00',
                screenshot: '04-multi-hazard-map.png',
                voiceOver: "See all threats in real-time. Our multi-hazard map integrates data from multiple sources instantly.",
                filename: 'scene-04-real-time-threat-assessment.wav'
            },
            {
                scene: 5,
                time: '1:00-1:15',
                screenshot: '06-map-evacuation-routes.png',
                voiceOver: "Generate safe evacuation routes with one click. Our system automatically avoids danger zones and optimizes for safety.",
                filename: 'scene-05-one-click-evacuation-planning.wav'
            },
            {
                scene: 6,
                time: '1:15-1:30',
                screenshot: '05-map-hazard-layers-active.png',
                voiceOver: "Routes update automatically as conditions change. What took hours now happens in seconds.",
                filename: 'scene-06-dynamic-route-updates.wav'
            },
            {
                scene: 7,
                time: '1:30-1:45',
                screenshot: '07-3d-terrain-view.png',
                voiceOver: "3D terrain visualization reveals critical elevation data that affects evacuation planning and resource deployment.",
                filename: 'scene-07-3d-terrain-intelligence.wav'
            },
            {
                scene: 8,
                time: '1:45-2:00',
                screenshot: '08-evacuation-dashboard-main.png',
                voiceOver: "Manage mass evacuations efficiently. Our dashboard coordinates thousands of people with precision.",
                filename: 'scene-08-mass-evacuation-management.wav'
            },
            {
                scene: 9,
                time: '2:00-2:15',
                screenshot: '14-aip-decision-support-main.png',
                voiceOver: "AI analyzes patterns and provides real-time recommendations. Make informed decisions when seconds count.",
                filename: 'scene-09-ai-powered-decisions.wav'
            },
            {
                scene: 10,
                time: '2:15-2:30',
                screenshot: '17-weather-panel-main.png',
                voiceOver: "Real-time weather data from NOAA predicts how conditions will affect your response. Plan ahead, not react.",
                filename: 'scene-10-weather-integrated-planning.wav'
            },
            {
                scene: 11,
                time: '2:30-2:45',
                screenshot: '11-commander-view.png',
                voiceOver: "Commanders get strategic overviews with high-level decision tools. Allocate resources where they're needed most.",
                filename: 'scene-11-commanders-strategic-view.wav'
            },
            {
                scene: 12,
                time: '2:45-3:00',
                screenshot: '12-first-responder-view.png',
                voiceOver: "First responders see tactical details for immediate action. Get the information you need, when you need it.",
                filename: 'scene-12-first-responder-tactical-view.wav'
            },
            {
                scene: 13,
                time: '3:00-3:15',
                screenshot: '13-public-information-view.png',
                voiceOver: "Keep citizens informed with real-time updates. Clear communication saves lives and reduces panic.",
                filename: 'scene-13-public-communication.wav'
            },
            {
                scene: 14,
                time: '3:15-3:30',
                screenshot: '24-alert-center.png',
                voiceOver: "Our system reduces response time by 80%, improves evacuation efficiency by 60%, and saves lives.",
                filename: 'scene-14-measurable-impact.wav'
            },
            {
                scene: 15,
                time: '3:30-3:45',
                screenshot: '01-main-dashboard-overview.png',
                voiceOver: "Transform your emergency response today. When minutes matter, our dashboard delivers coordinated action.",
                filename: 'scene-15-call-to-action.wav'
            }
        ];
    }

    async init() {
        console.log(chalk.cyan.bold('\n🎤 Voice Recording System'));
        console.log(chalk.cyan('========================\n'));

        // Create output directory
        await fs.ensureDir(this.outputDir);
        console.log(chalk.green(`✅ Output directory: ${this.outputDir}`));

        // Check if ffmpeg is available
        try {
            execSync('ffmpeg -version', { stdio: 'ignore' });
            console.log(chalk.green('✅ FFmpeg available for audio processing'));
        } catch (error) {
            console.log(chalk.yellow('⚠️  FFmpeg not found. Please install FFmpeg for audio processing.'));
        }
    }

    generateScripts() {
        console.log(chalk.cyan.bold('\n📝 Generating Voice Recording Scripts'));
        console.log(chalk.cyan('=====================================\n'));

        const scriptPath = path.join(this.outputDir, 'voice-recording-script.txt');
        const individualScriptsDir = path.join(this.outputDir, 'individual-scripts');

        // Create individual scripts directory
        fs.ensureDirSync(individualScriptsDir);

        let fullScript = '# Disaster Response Dashboard - Voice Recording Script\n\n';
        fullScript += 'Total Duration: 3:45 minutes\n';
        fullScript += 'Scenes: 15\n';
        fullScript += 'Target Duration per Scene: 15 seconds\n\n';
        fullScript += 'Recording Guidelines:\n';
        fullScript += '- Tone: Professional, urgent, confident\n';
        fullScript += '- Pace: Clear, measured, impactful\n';
        fullScript += '- Focus: Problem-solving and user benefits\n';
        fullScript += '- Length: 15 seconds per scene maximum\n\n';
        fullScript += 'Technical Requirements:\n';
        fullScript += '- Audio Quality: High (44.1kHz, stereo)\n';
        fullScript += '- Format: WAV\n';
        fullScript += '- Noise Reduction: Minimal background noise\n\n';

        this.scenes.forEach((scene, index) => {
            const sceneNumber = index + 1;
            const paddedNumber = sceneNumber.toString().padStart(2, '0');
            
            fullScript += `=== SCENE ${paddedNumber} (${scene.time}) ===\n`;
            fullScript += `Screenshot: ${scene.screenshot}\n`;
            fullScript += `Filename: ${scene.filename}\n`;
            fullScript += `Duration: 15 seconds\n\n`;
            fullScript += `VOICE-OVER:\n"${scene.voiceOver}"\n\n`;
            fullScript += `NOTES:\n`;
            fullScript += `- Match tone to scene purpose\n`;
            fullScript += `- Emphasize key benefits\n`;
            fullScript += `- Clear pronunciation\n`;
            fullScript += `- Natural pacing\n\n`;

            // Create individual script file
            const individualScriptPath = path.join(individualScriptsDir, `scene-${paddedNumber}-script.txt`);
            let individualScript = `# Scene ${paddedNumber} - ${scene.time}\n\n`;
            individualScript += `Screenshot: ${scene.screenshot}\n`;
            individualScript += `Target Duration: 15 seconds\n`;
            individualScript += `Output File: ${scene.filename}\n\n`;
            individualScript += `VOICE-OVER TEXT:\n"${scene.voiceOver}"\n\n`;
            individualScript += `RECORDING NOTES:\n`;
            individualScript += `- Professional, confident tone\n`;
            individualScript += `- Clear, measured pace\n`;
            individualScript += `- Emphasize problem-solving\n`;
            individualScript += `- Focus on user benefits\n\n`;
            individualScript += `VISUAL CUES:\n`;
            individualScript += `- Show ${scene.screenshot}\n`;
            individualScript += `- Highlight key UI elements\n`;
            individualScript += `- Demonstrate functionality\n`;

            fs.writeFileSync(individualScriptPath, individualScript);
        });

        fs.writeFileSync(scriptPath, fullScript);
        console.log(chalk.green(`✅ Full script saved: ${scriptPath}`));
        console.log(chalk.green(`✅ Individual scripts saved: ${individualScriptsDir}`));

        return scriptPath;
    }

    generateRecordingCommands() {
        console.log(chalk.cyan.bold('\n🎙️  Generating Recording Commands'));
        console.log(chalk.cyan('===============================\n'));

        const commandsPath = path.join(this.outputDir, 'recording-commands.sh');
        let commands = '#!/bin/bash\n\n';
        commands += '# Disaster Response Dashboard - Voice Recording Commands\n\n';
        commands += 'echo "🎤 Starting voice recording session..."\n\n';

        this.scenes.forEach((scene, index) => {
            const sceneNumber = index + 1;
            const paddedNumber = sceneNumber.toString().padStart(2, '0');
            
            commands += `echo "📝 Recording Scene ${paddedNumber} (${scene.time})..."\n`;
            commands += `echo "Voice-over: ${scene.voiceOver.substring(0, 50)}..."\n`;
            commands += `echo "Press Enter when ready to record..."\n`;
            commands += `read\n`;
            commands += `ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "${scene.filename}"\n`;
            commands += `echo "✅ Scene ${paddedNumber} recorded: ${scene.filename}"\n\n`;
        });

        commands += 'echo "🎉 All scenes recorded successfully!"\n';
        commands += 'echo "📁 Check the output directory for all audio files."\n';

        fs.writeFileSync(commandsPath, commands);
        fs.chmodSync(commandsPath, '755');
        console.log(chalk.green(`✅ Recording commands saved: ${commandsPath}`));

        return commandsPath;
    }

    generateSceneMapping() {
        console.log(chalk.cyan.bold('\n🗂️  Generating Scene Mapping'));
        console.log(chalk.cyan('==========================\n'));

        const mappingPath = path.join(this.outputDir, 'scene-mapping.json');
        const mapping = {
            metadata: {
                totalDuration: '3:45',
                totalScenes: 15,
                averageSceneDuration: 15,
                timestamp: new Date().toISOString()
            },
            scenes: this.scenes.map((scene, index) => ({
                sceneNumber: index + 1,
                timestamp: scene.time,
                screenshot: {
                    filename: scene.screenshot,
                    path: `../frontend/screenshots/${scene.screenshot}`,
                    description: this.getScreenshotDescription(scene.screenshot)
                },
                voiceOver: {
                    text: scene.voiceOver,
                    filename: scene.filename,
                    duration: 15,
                    tone: this.getSceneTone(index)
                },
                visualActions: this.getVisualActions(scene.screenshot),
                keyMessage: this.getKeyMessage(index)
            }))
        };

        fs.writeJsonSync(mappingPath, mapping, { spaces: 2 });
        console.log(chalk.green(`✅ Scene mapping saved: ${mappingPath}`));

        return mapping;
    }

    getScreenshotDescription(filename) {
        const descriptions = {
            '01-main-dashboard-overview.png': 'Main dashboard with overview panels and navigation',
            '02-dashboard-with-metrics.png': 'Dashboard showing key performance metrics and status indicators',
            '03-navigation-menu-open.png': 'Navigation menu expanded showing all available sections',
            '04-multi-hazard-map.png': 'Interactive map with multiple hazard layers and data visualization',
            '05-map-hazard-layers-active.png': 'Map with hazard layers toggled on showing fire, flood, and weather data',
            '06-map-evacuation-routes.png': 'Map displaying evacuation routes and safe passage corridors',
            '07-3d-terrain-view.png': '3D terrain visualization with elevation and topographic data',
            '08-evacuation-dashboard-main.png': 'Main evacuation management interface with route planning tools',
            '09-route-planning-interface.png': 'Route planning interface with origin, destination, and optimization settings',
            '10-evacuation-zones.png': 'Map showing evacuation zones and affected areas',
            '11-commander-view.png': 'Strategic commander interface with high-level overview and decision tools',
            '12-first-responder-view.png': 'Tactical first responder interface with detailed operational information',
            '13-public-information-view.png': 'Public information interface with citizen-facing alerts and updates',
            '14-aip-decision-support-main.png': 'AI-powered decision support interface with recommendations and insights',
            '15-ai-recommendations-panel.png': 'Panel showing AI-generated recommendations for resource allocation',
            '16-risk-analysis-view.png': 'Risk analysis interface with threat assessment and probability modeling',
            '17-weather-panel-main.png': 'Weather information panel with current conditions and forecasts',
            '18-weather-forecast-view.png': 'Extended weather forecast with multiple time periods and conditions',
            '19-environmental-conditions.png': 'Environmental monitoring with air quality, wind patterns, and other factors',
            '20-button-interactions.png': 'Various interactive buttons and controls throughout the interface',
            '21-panel-interactions.png': 'Expandable panels and collapsible sections in the interface',
            '22-search-functionality.png': 'Search interface with filters and query capabilities',
            '23-settings-configuration.png': 'Settings panel with user preferences and system configuration',
            '24-alert-center.png': 'Central alert management system with active notifications',
            '25-emergency-notifications.png': 'Emergency notification system with priority alerts and status tracking'
        };
        return descriptions[filename] || 'Screenshot of dashboard interface';
    }

    getSceneTone(sceneIndex) {
        if (sceneIndex < 2) return 'urgent, concerned';
        if (sceneIndex < 4) return 'confident, solution-focused';
        if (sceneIndex < 10) return 'professional, demonstrating';
        if (sceneIndex < 13) return 'benefit-focused, reassuring';
        if (sceneIndex < 14) return 'impressive, results-focused';
        return 'confident, call-to-action';
    }

    getVisualActions(filename) {
        const actions = {
            '01-main-dashboard-overview.png': ['Show main dashboard', 'Highlight key metrics', 'Demonstrate interface design'],
            '02-dashboard-with-metrics.png': ['Point to metrics', 'Show coordination challenges', 'Highlight routing problems'],
            '03-navigation-menu-open.png': ['Open navigation menu', 'Show all sections', 'Demonstrate comprehensive coverage'],
            '04-multi-hazard-map.png': ['Show map interface', 'Demonstrate data integration', 'Highlight real-time feeds'],
            '05-map-hazard-layers-active.png': ['Toggle hazard layers', 'Show layers activating', 'Demonstrate multiple hazards'],
            '06-map-evacuation-routes.png': ['Generate evacuation routes', 'Show route optimization', 'Highlight safety features'],
            '07-3d-terrain-view.png': ['Activate 3D view', 'Show terrain elevation', 'Demonstrate topographic features'],
            '08-evacuation-dashboard-main.png': ['Show evacuation dashboard', 'Demonstrate management tools', 'Highlight coordination'],
            '09-route-planning-interface.png': ['Show planning interface', 'Demonstrate optimization', 'Highlight real-time adjustments'],
            '10-evacuation-zones.png': ['Show evacuation zones', 'Demonstrate zone updates', 'Highlight affected areas'],
            '11-commander-view.png': ['Show commander interface', 'Highlight strategic tools', 'Demonstrate decision support'],
            '12-first-responder-view.png': ['Switch to responder view', 'Show tactical details', 'Highlight operational tools'],
            '13-public-information-view.png': ['Show public interface', 'Demonstrate citizen alerts', 'Highlight communication'],
            '14-aip-decision-support-main.png': ['Show AI interface', 'Demonstrate recommendations', 'Highlight intelligent insights'],
            '15-ai-recommendations-panel.png': ['Show recommendations panel', 'Demonstrate AI insights', 'Highlight optimization'],
            '16-risk-analysis-view.png': ['Show risk analysis interface', 'Demonstrate threat assessment', 'Highlight probability modeling'],
            '17-weather-panel-main.png': ['Show weather panel', 'Demonstrate weather data', 'Highlight forecast integration'],
            '18-weather-forecast-view.png': ['Show extended forecast', 'Demonstrate time periods', 'Highlight condition changes'],
            '19-environmental-conditions.png': ['Show environmental data', 'Demonstrate monitoring tools', 'Highlight critical factors'],
            '20-button-interactions.png': ['Show interactive controls', 'Demonstrate button interactions', 'Highlight user-friendly design'],
            '21-panel-interactions.png': ['Show panel interactions', 'Demonstrate expandable sections', 'Highlight organized layout'],
            '22-search-functionality.png': ['Show search interface', 'Demonstrate filtering', 'Highlight query capabilities'],
            '23-settings-configuration.png': ['Show settings panel', 'Demonstrate configuration options', 'Highlight customization'],
            '24-alert-center.png': ['Show alert center', 'Demonstrate notification system', 'Highlight communication tools'],
            '25-emergency-notifications.png': ['Show emergency notifications', 'Demonstrate priority system', 'Highlight status tracking']
        };
        return actions[filename] || ['Show interface', 'Demonstrate functionality', 'Highlight features'];
    }

    getKeyMessage(sceneIndex) {
        const messages = [
            'Current systems fail when minutes matter',
            'Time equals lives in emergencies',
            'One platform, coordinated response',
            'Instant situational awareness',
            'Instant, safe evacuation planning',
            'Adaptive, real-time response',
            'Strategic terrain intelligence',
            'Scale without chaos',
            'AI-enhanced decision making',
            'Proactive, not reactive',
            'Strategic resource optimization',
            'Tactical precision',
            'Clear public communication',
            'Proven results',
            'Take action now'
        ];
        return messages[sceneIndex] || 'Key message for this scene';
    }

    async run() {
        try {
            await this.init();
            this.generateScripts();
            this.generateRecordingCommands();
            this.generateSceneMapping();

            console.log(chalk.cyan.bold('\n🎯 Voice Recording Setup Complete'));
            console.log(chalk.cyan('================================\n'));
            
            console.log(chalk.green('✅ Generated files:'));
            console.log(chalk.blue(`  • Voice recording script: ${path.join(this.outputDir, 'voice-recording-script.txt')}`));
            console.log(chalk.blue(`  • Individual scene scripts: ${path.join(this.outputDir, 'individual-scripts/')}`));
            console.log(chalk.blue(`  • Recording commands: ${path.join(this.outputDir, 'recording-commands.sh')}`));
            console.log(chalk.blue(`  • Scene mapping: ${path.join(this.outputDir, 'scene-mapping.json')}`));
            
            console.log(chalk.yellow('\n📋 Next Steps:'));
            console.log(chalk.yellow('  1. Review the voice recording script'));
            console.log(chalk.yellow('  2. Set up audio recording equipment'));
            console.log(chalk.yellow('  3. Run the recording commands script'));
            console.log(chalk.yellow('  4. Record each scene following the individual scripts'));
            console.log(chalk.yellow('  5. Use the scene mapping for video production'));

        } catch (error) {
            console.error('❌ Error setting up voice recording:', error);
            throw error;
        }
    }
}

// Run the voice recorder setup
const recorder = new VoiceRecorder();
recorder.run().catch(console.error);
