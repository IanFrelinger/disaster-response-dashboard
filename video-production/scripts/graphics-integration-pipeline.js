#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GraphicsIntegrationPipeline {
    constructor() {
        this.capturesDir = path.join(__dirname, '../captures');
        this.outputDir = path.join(__dirname, '../output');
        this.assetsDir = path.join(__dirname, '../assets');
        this.tempDir = path.join(__dirname, '../temp');
        this.audioDir = path.join(__dirname, '../audio');
        
        // Graphics configuration based on narration script
        this.graphicsConfig = {
            intro: {
                duration: 15,
                graphics: [
                    { type: 'title', text: 'Disaster Response Platform', start: 0, end: 15, position: 'center' },
                    { type: 'subtitle', text: 'Palantir Building Challenge Project', start: 2, end: 13, position: 'center' }
                ]
            },
            problem: {
                duration: 25,
                graphics: [
                    { type: 'title', text: 'Problem Statement', start: 0, end: 25, position: 'top' },
                    { type: 'callout', text: 'Fragmented Response Systems', start: 5, end: 15, position: 'right' },
                    { type: 'callout', text: 'Limited Access to Tools', start: 15, end: 25, position: 'left' }
                ]
            },
            users: {
                duration: 20,
                graphics: [
                    { type: 'title', text: 'Target Users', start: 0, end: 20, position: 'top' },
                    { type: 'role', text: 'Incident Commanders', start: 3, end: 8, position: 'top-left' },
                    { type: 'role', text: 'Operations Chiefs', start: 8, end: 13, position: 'top-right' },
                    { type: 'role', text: 'Field Units', start: 13, end: 18, position: 'bottom-left' },
                    { type: 'role', text: 'Dispatchers', start: 18, end: 20, position: 'bottom-right' }
                ]
            },
            architecture: {
                duration: 30,
                graphics: [
                    { type: 'title', text: 'Technical Architecture', start: 0, end: 30, position: 'top' },
                    { type: 'component', text: 'React + Mapbox', start: 5, end: 10, position: 'top-left' },
                    { type: 'component', text: 'Python/Flask', start: 10, end: 15, position: 'top-right' },
                    { type: 'component', text: 'Palantir Foundry', start: 15, end: 20, position: 'center' },
                    { type: 'component', text: 'NOAA/NASA/USGS', start: 20, end: 25, position: 'bottom-left' },
                    { type: 'component', text: 'AIP Assistant', start: 25, end: 30, position: 'bottom-right' }
                ]
            },
            detect: {
                duration: 15,
                graphics: [
                    { type: 'title', text: 'Detect & Verify', start: 0, end: 15, position: 'top' },
                    { type: 'alert', text: 'SATELLITE FIRE DETECTED', start: 3, end: 12, position: 'center' },
                    { type: 'status', text: 'Risk Assessment: HIGH', start: 8, end: 15, position: 'bottom' }
                ]
            },
            triage: {
                duration: 10,
                graphics: [
                    { type: 'title', text: 'Risk Scoring', start: 0, end: 10, position: 'top' },
                    { type: 'decision', text: 'EVACUATE', start: 3, end: 10, position: 'center', color: 'red' },
                    { type: 'reason', text: 'Near Critical Infrastructure', start: 5, end: 10, position: 'bottom' }
                ]
            },
            zones: {
                duration: 10,
                graphics: [
                    { type: 'title', text: 'Define Evacuation Zones', start: 0, end: 10, position: 'top' },
                    { type: 'tool', text: 'Drawing Tool Active', start: 2, end: 8, position: 'top-right' },
                    { type: 'zone', text: 'Priority Zone Set', start: 6, end: 10, position: 'center' }
                ]
            },
            routes: {
                duration: 20,
                graphics: [
                    { type: 'title', text: 'Route Planning', start: 0, end: 20, position: 'top' },
                    { type: 'profile', text: 'Civilian Route', start: 3, end: 8, position: 'top-left' },
                    { type: 'profile', text: 'EMS Route', start: 8, end: 13, position: 'top-right' },
                    { type: 'profile', text: 'Fire Tactical', start: 13, end: 18, position: 'bottom-left' },
                    { type: 'profile', text: 'Police Route', start: 18, end: 20, position: 'bottom-right' }
                ]
            },
            units: {
                duration: 10,
                graphics: [
                    { type: 'title', text: 'Unit Assignment', start: 0, end: 10, position: 'top' },
                    { type: 'unit', text: 'Engine 1', start: 2, end: 6, position: 'left' },
                    { type: 'unit', text: 'Medic 2', start: 4, end: 8, position: 'right' },
                    { type: 'status', text: 'Building Status: Evacuated', start: 6, end: 10, position: 'bottom' }
                ]
            },
            ai_support: {
                duration: 20,
                graphics: [
                    { type: 'title', text: 'AI Decision Support', start: 0, end: 20, position: 'top' },
                    { type: 'query', text: 'What if Highway 30 closes?', start: 3, end: 12, position: 'center' },
                    { type: 'response', text: 'Alternative Routes Generated', start: 10, end: 18, position: 'bottom' }
                ]
            },
            value: {
                duration: 30,
                graphics: [
                    { type: 'title', text: 'Value Proposition', start: 0, end: 30, position: 'top' },
                    { type: 'benefit', text: 'Faster Decisions', start: 5, end: 12, position: 'top-left' },
                    { type: 'benefit', text: 'Reduced Staffing', start: 12, end: 19, position: 'top-right' },
                    { type: 'benefit', text: 'Common Operating Picture', start: 19, end: 26, position: 'bottom-left' },
                    { type: 'benefit', text: 'Save Lives & Property', start: 26, end: 30, position: 'bottom-right' }
                ]
            },
            foundry: {
                duration: 20,
                graphics: [
                    { type: 'title', text: 'Foundry Integration', start: 0, end: 20, position: 'top' },
                    { type: 'feature', text: 'Data Pipelines', start: 3, end: 8, position: 'top-left' },
                    { type: 'feature', text: 'Ontology', start: 8, end: 13, position: 'top-right' },
                    { type: 'feature', text: 'Context-Aware AI', start: 13, end: 18, position: 'bottom-left' },
                    { type: 'feature', text: 'Predictive Analytics', start: 18, end: 20, position: 'bottom-right' }
                ]
            },
            conclusion: {
                duration: 20,
                graphics: [
                    { type: 'title', text: 'Conclusion', start: 0, end: 20, position: 'top' },
                    { type: 'highlight', text: 'Real-time Data + AI', start: 3, end: 10, position: 'center' },
                    { type: 'highlight', text: 'Streamlined Command', start: 10, end: 17, position: 'center' },
                    { type: 'cta', text: 'Let\'s Pilot This Together', start: 15, end: 20, position: 'bottom' }
                ]
            }
        };
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.tempDir, this.assetsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    createGraphicsFilter(sceneName, sceneConfig, startTime) {
        let filterChain = '[0:v]';
        let currentInput = '0:v';
        let filterIndex = 1;
        
        sceneConfig.graphics.forEach((graphic, index) => {
            const graphicStart = startTime + graphic.start;
            const graphicEnd = startTime + graphic.end;
            const enableCondition = `between(t,${graphicStart},${graphicEnd})`;
            
            let drawtextFilter = '';
            
            switch (graphic.type) {
                case 'title':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=72:box=1:boxcolor=black@0.7:boxborderw=10:x=(w-text_w)/2:y=50:enable='${enableCondition}'`;
                    break;
                    
                case 'subtitle':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=150:enable='${enableCondition}'`;
                    break;
                    
                case 'callout':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=36:box=1:boxcolor=red@0.8:boxborderw=5:x=w-text_w-50:y=200:enable='${enableCondition}'`;
                    break;
                    
                case 'role':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=32:box=1:boxcolor=blue@0.8:boxborderw=5:x=50:y=200:enable='${enableCondition}'`;
                    break;
                    
                case 'component':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=28:box=1:boxcolor=green@0.8:boxborderw=5:x=50:y=300:enable='${enableCondition}'`;
                    break;
                    
                case 'alert':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=red:fontsize=48:box=1:boxcolor=yellow@0.9:boxborderw=8:x=(w-text_w)/2:y=(h-text_h)/2:enable='${enableCondition}'`;
                    break;
                    
                case 'decision':
                    const color = graphic.color || 'red';
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=56:box=1:boxcolor=${color}@0.9:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)/2:enable='${enableCondition}'`;
                    break;
                    
                case 'tool':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=32:box=1:boxcolor=orange@0.8:boxborderw=5:x=w-text_w-200:y=100:enable='${enableCondition}'`;
                    break;
                    
                case 'zone':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=40:box=1:boxcolor=red@0.8:boxborderw=8:x=(w-text_w)/2:y=(h-text_h)/2:enable='${enableCondition}'`;
                    break;
                    
                case 'profile':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=28:box=1:boxcolor=blue@0.8:boxborderw=5:x=50:y=400:enable='${enableCondition}'`;
                    break;
                    
                case 'unit':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=32:box=1:boxcolor=gold@0.8:boxborderw=5:x=50:y=300:enable='${enableCondition}'`;
                    break;
                    
                case 'status':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=28:box=1:boxcolor=green@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='${enableCondition}'`;
                    break;
                    
                case 'query':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=36:box=1:boxcolor=purple@0.8:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2-50:enable='${enableCondition}'`;
                    break;
                    
                case 'response':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=32:box=1:boxcolor=green@0.8:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2+50:enable='${enableCondition}'`;
                    break;
                    
                case 'benefit':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=32:box=1:boxcolor=green@0.8:boxborderw=5:x=50:y=300:enable='${enableCondition}'`;
                    break;
                    
                case 'feature':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=28:box=1:boxcolor=blue@0.8:boxborderw=5:x=50:y=300:enable='${enableCondition}'`;
                    break;
                    
                case 'highlight':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=44:box=1:boxcolor=blue@0.8:boxborderw=8:x=(w-text_w)/2:y=(h-text_h)/2:enable='${enableCondition}'`;
                    break;
                    
                case 'cta':
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=48:box=1:boxcolor=green@0.9:boxborderw=10:x=(w-text_w)/2:y=h-text_h-100:enable='${enableCondition}'`;
                    break;
                    
                default:
                    drawtextFilter = `drawtext=text='${graphic.text}':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.7:boxborderw=5:x=(w-text_w)/2:y=200:enable='${enableCondition}'`;
            }
            
            filterChain += `[${currentInput}]${drawtextFilter}[v${filterIndex}]`;
            currentInput = `v${filterIndex}`;
            filterIndex++;
        });
        
        return filterChain;
    }

    async addCustomGraphics(videoPath, narrationPath) {
        console.log('🎨 Adding custom graphics based on narration script...');
        
        try {
            // Load narration script
            const narrationContent = fs.readFileSync(narrationPath, 'utf8');
            const narration = yaml.parse(narrationContent);
            
            const outputPath = path.join(this.outputDir, 'disaster-response-with-custom-graphics.mp4');
            
            // Build comprehensive graphics filter
            let totalFilter = '[0:v]';
            let currentInput = '0:v';
            let filterIndex = 1;
            let currentTime = 0;
            
            // Add graphics for each scene
            for (const scene of narration.scenes) {
                const sceneConfig = this.graphicsConfig[scene.id];
                if (sceneConfig) {
                    const sceneFilter = this.createGraphicsFilter(scene.id, sceneConfig, currentTime);
                    
                    // Extract the drawtext filters from the scene filter
                    const drawtextFilters = sceneFilter.match(/drawtext=[^[]+/g);
                    if (drawtextFilters) {
                        drawtextFilters.forEach(filter => {
                            totalFilter += `[${currentInput}]${filter}[v${filterIndex}]`;
                            currentInput = `v${filterIndex}`;
                            filterIndex++;
                        });
                    }
                }
                currentTime += scene.duration;
            }
            
            // Final output
            totalFilter += `[${currentInput}]`;
            
            const command = `ffmpeg -i "${videoPath}" -vf "${totalFilter}" -c:a copy -y "${outputPath}"`;
            
            console.log('🎬 Applying custom graphics...');
            execSync(command, { stdio: 'inherit' });
            
            console.log('✅ Custom graphics added successfully!');
            return outputPath;
            
        } catch (error) {
            console.error('❌ Failed to add custom graphics:', error.message);
            return videoPath; // Return original if graphics fail
        }
    }

    async addImageOverlays(videoPath, imageAssets) {
        console.log('🖼️  Adding image overlays...');
        
        const outputPath = path.join(this.outputDir, 'disaster-response-with-images.mp4');
        
        // Create image overlay filter
        let filterChain = '[0:v]';
        let currentInput = '0:v';
        let filterIndex = 1;
        
        imageAssets.forEach((asset, index) => {
            const imagePath = path.join(this.assetsDir, asset.filename);
            if (fs.existsSync(imagePath)) {
                filterChain += `[${currentInput}][${index + 1}:v]overlay=${asset.x}:${asset.y}:enable='between(t,${asset.start},${asset.end})'[v${filterIndex}]`;
                currentInput = `v${filterIndex}`;
                filterIndex++;
            }
        });
        
        // Build FFmpeg command with image inputs
        let command = `ffmpeg -i "${videoPath}"`;
        imageAssets.forEach(asset => {
            const imagePath = path.join(this.assetsDir, asset.filename);
            if (fs.existsSync(imagePath)) {
                command += ` -i "${imagePath}"`;
            }
        });
        
        command += ` -filter_complex "${filterChain}" -c:a copy -y "${outputPath}"`;
        
        try {
            execSync(command, { stdio: 'inherit' });
            console.log('✅ Image overlays added successfully!');
            return outputPath;
        } catch (error) {
            console.error('❌ Failed to add image overlays:', error.message);
            return videoPath;
        }
    }

    async createTransitionGraphics(videoPath) {
        console.log('✨ Adding transition graphics...');
        
        const outputPath = path.join(this.outputDir, 'disaster-response-with-transitions.mp4');
        
        // Create transition effects between scenes
        const transitionFilter = `
            [0:v]fade=t=in:st=0:d=1,fade=t=out:st=14:d=1[v1];
            [v1]fade=t=in:st=15:d=1,fade=t=out:st=39:d=1[v2];
            [v2]fade=t=in:st=40:d=1,fade=t=out:st=59:d=1[v3];
            [v3]fade=t=in:st=60:d=1,fade=t=out:st=89:d=1[v4];
            [v4]fade=t=in:st=90:d=1,fade=t=out:st=104:d=1[v5];
            [v5]fade=t=in:st=105:d=1,fade=t=out:st=114:d=1[v6];
            [v6]fade=t=in:st=115:d=1,fade=t=out:st=124:d=1[v7];
            [v7]fade=t=in:st=125:d=1,fade=t=out:st=144:d=1[v8];
            [v8]fade=t=in:st=145:d=1,fade=t=out:st=154:d=1[v9];
            [v9]fade=t=in:st=155:d=1,fade=t=out:st=174:d=1[v10];
            [v10]fade=t=in:st=175:d=1,fade=t=out:st=204:d=1[v11];
            [v11]fade=t=in:st=205:d=1,fade=t=out:st=224:d=1[v12];
            [v12]fade=t=in:st=225:d=1,fade=t=out:st=239:d=1[outv]
        `.replace(/\s+/g, ' ').trim();
        
        const command = `ffmpeg -i "${videoPath}" -vf "${transitionFilter}" -c:a copy -y "${outputPath}"`;
        
        try {
            execSync(command, { stdio: 'inherit' });
            console.log('✅ Transition graphics added successfully!');
            return outputPath;
        } catch (error) {
            console.error('❌ Failed to add transition graphics:', error.message);
            return videoPath;
        }
    }

    async run(inputVideoPath, narrationPath, options = {}) {
        console.log('🎨 Graphics Integration Pipeline');
        console.log('================================\n');
        
        try {
            let currentVideoPath = inputVideoPath;
            
            // Step 1: Add custom graphics based on narration
            if (options.addCustomGraphics !== false) {
                currentVideoPath = await this.addCustomGraphics(currentVideoPath, narrationPath);
            }
            
            // Step 2: Add image overlays if provided
            if (options.imageAssets && options.imageAssets.length > 0) {
                currentVideoPath = await this.addImageOverlays(currentVideoPath, options.imageAssets);
            }
            
            // Step 3: Add transition graphics
            if (options.addTransitions !== false) {
                currentVideoPath = await this.createTransitionGraphics(currentVideoPath);
            }
            
            console.log('\n🎉 Graphics integration completed successfully!');
            console.log(`📁 Output: ${currentVideoPath}`);
            console.log(`📊 Size: ${(fs.statSync(currentVideoPath).size / 1024 / 1024).toFixed(2)}MB`);
            
            return currentVideoPath;
            
        } catch (error) {
            console.error('\n❌ Graphics integration failed:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const pipeline = new GraphicsIntegrationPipeline();
    
    const inputVideo = process.argv[2] || path.join(__dirname, '../output/disaster-response-demo.mp4');
    const narrationFile = process.argv[3] || path.join(__dirname, '../updated_narration.yaml');
    
    pipeline.run(inputVideo, narrationFile).catch(error => {
        console.error('Graphics integration failed:', error);
        process.exit(1);
    });
}

export default GraphicsIntegrationPipeline;

