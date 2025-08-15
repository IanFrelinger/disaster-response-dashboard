#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CustomVisualsIntegrator {
    constructor() {
        this.assetsDir = path.join(__dirname, '../assets');
        this.outputDir = path.join(__dirname, '../output');
        this.tempDir = path.join(__dirname, '../temp');
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.tempDir, this.assetsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async listAvailableAssets() {
        console.log('📁 Available assets in assets directory:');
        
        if (!fs.existsSync(this.assetsDir)) {
            console.log('❌ Assets directory does not exist');
            return [];
        }
        
        const files = fs.readdirSync(this.assetsDir);
        const supportedFormats = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.mov', '.avi'];
        
        const assets = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return supportedFormats.includes(ext);
        });
        
        if (assets.length === 0) {
            console.log('ℹ️  No supported assets found');
            return [];
        }
        
        assets.forEach((asset, index) => {
            const filePath = path.join(this.assetsDir, asset);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`  ${index + 1}. ${asset} (${size}MB)`);
        });
        
        return assets;
    }

    async createVisualsConfiguration() {
        console.log('🎨 Creating visuals configuration...');
        
        const config = {
            metadata: {
                title: "Custom Visuals Configuration",
                description: "Configuration for custom visuals integration",
                created: new Date().toISOString()
            },
            visuals: {
                // Add your custom visuals here
                architecture_diagram: {
                    filename: "architecture-diagram.png",
                    start: 60,  // Start time in seconds
                    end: 90,    // End time in seconds
                    x: 100,     // X position
                    y: 200,     // Y position
                    scale: 0.8, // Scale factor
                    opacity: 0.9 // Opacity (0.0 to 1.0)
                },
                api_flow_diagram: {
                    filename: "api-flow-diagram.png",
                    start: 90,
                    end: 120,
                    x: 150,
                    y: 250,
                    scale: 0.7,
                    opacity: 0.9
                },
                user_roles_chart: {
                    filename: "user-roles-chart.png",
                    start: 40,
                    end: 60,
                    x: 200,
                    y: 150,
                    scale: 0.6,
                    opacity: 0.9
                },
                value_proposition: {
                    filename: "value-proposition.png",
                    start: 175,
                    end: 205,
                    x: 100,
                    y: 300,
                    scale: 0.8,
                    opacity: 0.9
                }
            },
            overlays: {
                // Custom overlay graphics
                logo: {
                    filename: "logo.png",
                    start: 0,
                    end: 240, // Entire video
                    x: "w-150", // Right side, 150px from edge
                    y: 50,
                    scale: 0.3,
                    opacity: 0.8
                },
                watermark: {
                    filename: "watermark.png",
                    start: 0,
                    end: 240,
                    x: 50,
                    y: "h-100", // Bottom, 100px from edge
                    scale: 0.2,
                    opacity: 0.6
                }
            },
            callouts: {
                // Animated callout boxes
                highlight_1: {
                    text: "Key Feature",
                    start: 30,
                    end: 45,
                    x: 100,
                    y: 200,
                    color: "yellow",
                    animation: "fade_in"
                },
                highlight_2: {
                    text: "Important Note",
                    start: 120,
                    end: 135,
                    x: 300,
                    y: 250,
                    color: "red",
                    animation: "slide_in"
                }
            }
        };
        
        const configPath = path.join(__dirname, '../custom-visuals-config.yaml');
        fs.writeFileSync(configPath, yaml.stringify(config, { indent: 2 }));
        
        console.log(`✅ Configuration created: ${configPath}`);
        return configPath;
    }

    async addImageOverlays(videoPath, visualsConfig) {
        console.log('🖼️  Adding image overlays...');
        
        const outputPath = path.join(this.outputDir, 'disaster-response-with-custom-visuals.mp4');
        
        // Check if input video exists
        if (!fs.existsSync(videoPath)) {
            console.error(`❌ Input video not found: ${videoPath}`);
            return null;
        }
        
        // Build FFmpeg command with image overlays
        let command = `ffmpeg -i "${videoPath}"`;
        let filterComplex = '';
        let currentInput = '0:v';
        let inputIndex = 1;
        let hasValidAssets = false;
        
        // Add all visual assets as inputs
        const allVisuals = { ...visualsConfig.visuals, ...visualsConfig.overlays };
        
        for (const [key, visual] of Object.entries(allVisuals)) {
            const imagePath = path.join(this.assetsDir, visual.filename);
            if (fs.existsSync(imagePath)) {
                command += ` -i "${imagePath}"`;
                hasValidAssets = true;
                
                // Add overlay filter
                const enableCondition = `between(t,${visual.start},${visual.end})`;
                const x = visual.x === 'w-150' ? 'w-150' : visual.x;
                const y = visual.y === 'h-100' ? 'h-100' : visual.y;
                
                filterComplex += `[${currentInput}][${inputIndex}:v]overlay=${x}:${y}:enable='${enableCondition}'[v${inputIndex}];`;
                currentInput = `v${inputIndex}`;
                inputIndex++;
            } else {
                console.log(`⚠️  Warning: Image file not found: ${visual.filename}`);
            }
        }
        
        // Add callout text overlays only if we have image assets (simplified for now)
        // TODO: Fix callout processing
        const callouts = Object.entries(visualsConfig.callouts || {});
        if (callouts.length > 0 && hasValidAssets) {
            console.log('ℹ️  Callouts are currently disabled for stability');
        }
        
        // Remove trailing semicolon
        if (filterComplex.endsWith(';')) {
            filterComplex = filterComplex.slice(0, -1);
        }
        
        // Don't add final output label - FFmpeg will use the last output automatically
        
        // If no valid assets, just copy the video
        if (!hasValidAssets) {
            console.log('ℹ️  No valid assets found, copying original video...');
            const copyCommand = `ffmpeg -i "${videoPath}" -c copy -y "${outputPath}"`;
            try {
                execSync(copyCommand, { stdio: 'inherit' });
                return outputPath;
            } catch (error) {
                console.error('❌ Failed to copy video:', error.message);
                return videoPath;
            }
        }
        
        command += ` -filter_complex "${filterComplex}" -c:a copy -y "${outputPath}"`;
        
        try {
            console.log('🎬 Applying custom visuals...');
            execSync(command, { stdio: 'inherit' });
            console.log('✅ Custom visuals added successfully!');
            return outputPath;
        } catch (error) {
            console.error('❌ Failed to add custom visuals:', error.message);
            return videoPath;
        }
    }

    async createPlaceholderAssets() {
        console.log('🎨 Creating placeholder assets for testing...');
        
        const placeholders = [
            { name: 'architecture-diagram.png', text: 'Architecture Diagram' },
            { name: 'api-flow-diagram.png', text: 'API Flow Diagram' },
            { name: 'user-roles-chart.png', text: 'User Roles Chart' },
            { name: 'value-proposition.png', text: 'Value Proposition' },
            { name: 'logo.png', text: 'Logo' },
            { name: 'watermark.png', text: 'Watermark' }
        ];
        
        for (const placeholder of placeholders) {
            const outputPath = path.join(this.assetsDir, placeholder.name);
            
            // Create a simple colored rectangle with text using ImageMagick
            const command = `convert -size 400x300 xc:lightblue -fill black -pointsize 24 -gravity center -draw "text 0,0 '${placeholder.text}'" "${outputPath}"`;
            
            try {
                execSync(command, { stdio: 'pipe' });
                console.log(`✅ Created placeholder: ${placeholder.name}`);
            } catch (error) {
                console.log(`⚠️  Could not create placeholder for ${placeholder.name} (ImageMagick not available)`);
            }
        }
    }

    async run(inputVideoPath, options = {}) {
        console.log('🎨 Custom Visuals Integration');
        console.log('=============================\n');
        
        try {
            // Check if input video path is valid
            if (!inputVideoPath || inputVideoPath === '--help' || inputVideoPath === '--create-placeholders') {
                console.log('Usage: node scripts/integrate-custom-visuals.js <input-video> [options]');
                console.log('');
                console.log('Options:');
                console.log('  --create-placeholders    Create placeholder assets for testing');
                console.log('  --config=<path>         Use custom configuration file');
                console.log('');
                console.log('Examples:');
                console.log('  node scripts/integrate-custom-visuals.js output/disaster-response-demo.mp4');
                console.log('  node scripts/integrate-custom-visuals.js output/disaster-response-demo.mp4 --create-placeholders');
                console.log('  node scripts/integrate-custom-visuals.js output/disaster-response-demo.mp4 --config=my-config.yaml');
                return null;
            }
            
            // Step 1: List available assets
            const availableAssets = await this.listAvailableAssets();
            
            // Step 2: Create placeholder assets if none exist
            if (availableAssets.length === 0 && options.createPlaceholders !== false) {
                await this.createPlaceholderAssets();
            }
            
            // Step 3: Create or load visuals configuration
            let configPath = options.configPath;
            if (!configPath) {
                configPath = path.join(__dirname, '../custom-visuals-config.yaml');
                if (!fs.existsSync(configPath)) {
                    await this.createVisualsConfiguration();
                }
            }
            const visualsConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Step 4: Add custom visuals to video
            const outputPath = await this.addImageOverlays(inputVideoPath, visualsConfig);
            
            if (outputPath && fs.existsSync(outputPath)) {
                console.log('\n🎉 Custom visuals integration completed!');
                console.log(`📁 Output: ${outputPath}`);
                console.log(`📊 Size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)}MB`);
                
                console.log('\n📝 Next steps:');
                console.log('1. Replace placeholder assets in video-production/assets/ with your actual visuals');
                console.log('2. Update video-production/custom-visuals-config.yaml with your specific timing and positioning');
                console.log('3. Re-run this script to apply your custom visuals');
            } else {
                console.log('\n⚠️  Custom visuals integration completed but no output file was created');
            }
            
            return outputPath;
            
        } catch (error) {
            console.error('\n❌ Custom visuals integration failed:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const integrator = new CustomVisualsIntegrator();
    
    const inputVideo = process.argv[2] || path.join(__dirname, '../output/disaster-response-demo.mp4');
    const options = {
        createPlaceholders: process.argv.includes('--create-placeholders'),
        configPath: process.argv.find(arg => arg.startsWith('--config='))?.split('=')[1]
    };
    
    integrator.run(inputVideo, options).catch(error => {
        console.error('Custom visuals integration failed:', error);
        process.exit(1);
    });
}

export default CustomVisualsIntegrator;
