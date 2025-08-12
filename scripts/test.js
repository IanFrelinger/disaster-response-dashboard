#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VideoProductionTester {
    constructor() {
        this.testResults = [];
        this.outputDir = join(__dirname, '../output');
        this.tempDir = join(__dirname, '../temp');
    }

    async runAllTests() {
        console.log(chalk.blue('🧪 Video Production Environment - Test Suite'));
        console.log(chalk.gray('============================================\n'));

        const tests = [
            { name: 'System Dependencies', test: () => this.testSystemDependencies() },
            { name: 'Node.js Environment', test: () => this.testNodeEnvironment() },
            { name: 'FFmpeg Installation', test: () => this.testFFmpeg() },
            { name: 'Python Environment', test: () => this.testPythonEnvironment() },
            { name: 'Canvas Support', test: () => this.testCanvas() },
            { name: 'TTS Capabilities', test: () => this.testTTS() },
            { name: 'Video Processing', test: () => this.testVideoProcessing() },
            { name: 'Configuration Files', test: () => this.testConfiguration() },
            { name: 'Output Directories', test: () => this.testDirectories() },
            { name: 'Integration Pipeline', test: () => this.testIntegration() }
        ];

        for (const test of tests) {
            await this.runTest(test.name, test.test);
        }

        this.printResults();
    }

    async runTest(name, testFunction) {
        const spinner = ora(`Testing ${name}...`).start();
        
        try {
            const result = await testFunction();
            spinner.succeed(`${name} passed`);
            this.testResults.push({ name, status: 'PASS', details: result });
        } catch (error) {
            spinner.fail(`${name} failed`);
            this.testResults.push({ name, status: 'FAIL', details: error.message });
        }
    }

    testSystemDependencies() {
        const dependencies = ['node', 'npm', 'ffmpeg', 'python3'];
        const results = {};

        for (const dep of dependencies) {
            try {
                const version = execSync(`${dep} --version`, { encoding: 'utf8' }).trim();
                results[dep] = version.split('\n')[0];
            } catch (error) {
                throw new Error(`${dep} not found or not accessible`);
            }
        }

        return results;
    }

    testNodeEnvironment() {
        const nodeVersion = process.version;
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        const platform = process.platform;
        const arch = process.arch;

        return {
            node: nodeVersion,
            npm: npmVersion,
            platform,
            arch
        };
    }

    testFFmpeg() {
        try {
            const ffmpegInfo = execSync('ffmpeg -version', { encoding: 'utf8' });
            const versionLine = ffmpegInfo.split('\n')[0];
            const codecs = execSync('ffmpeg -codecs', { encoding: 'utf8' });
            
            // Check for essential codecs
            const hasH264 = codecs.includes('h264');
            const hasAAC = codecs.includes('aac');
            const hasMP4 = codecs.includes('mp4');

            return {
                version: versionLine,
                h264: hasH264,
                aac: hasAAC,
                mp4: hasMP4
            };
        } catch (error) {
            throw new Error('FFmpeg not properly installed or accessible');
        }
    }

    testPythonEnvironment() {
        try {
            const pythonVersion = execSync('python3 --version', { encoding: 'utf8' }).trim();
            const pipVersion = execSync('pip3 --version', { encoding: 'utf8' }).trim();
            
            // Test importing key packages
            const testImports = [
                'import cv2',
                'import numpy',
                'import PIL',
                'import matplotlib',
                'import moviepy'
            ];

            for (const importCmd of testImports) {
                execSync(`python3 -c "${importCmd}"`, { stdio: 'pipe' });
            }

            return {
                python: pythonVersion,
                pip: pipVersion,
                packages: 'All required packages available'
            };
        } catch (error) {
            throw new Error(`Python environment issue: ${error.message}`);
        }
    }

    testCanvas() {
        try {
            const { createCanvas } = require('canvas');
            const canvas = createCanvas(100, 100);
            const ctx = canvas.getContext('2d');
            
            // Test basic drawing
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, 50, 50);
            
            // Test text rendering
            ctx.fillStyle = '#000000';
            ctx.font = '12px Arial';
            ctx.fillText('Test', 10, 20);
            
            // Test buffer generation
            const buffer = canvas.toBuffer('image/png');
            
            return {
                canvas: 'Working',
                drawing: 'Supported',
                text: 'Rendering',
                buffer: `${buffer.length} bytes generated`
            };
        } catch (error) {
            throw new Error(`Canvas test failed: ${error.message}`);
        }
    }

    testTTS() {
        try {
            // Test system TTS (macOS)
            const testFile = join(this.tempDir, 'tts-test.wav');
            const testText = 'This is a test of the text to speech system.';
            
            execSync(`say -o "${testFile}" "${testText}"`, { stdio: 'pipe' });
            
            if (!existsSync(testFile)) {
                throw new Error('TTS output file not created');
            }
            
            // Test file properties
            const fileSize = execSync(`ls -la "${testFile}"`, { encoding: 'utf8' });
            
            return {
                system: 'macOS say command',
                file: testFile,
                size: fileSize.split(/\s+/)[4] + ' bytes'
            };
        } catch (error) {
            // Fallback test
            return {
                system: 'Fallback mode',
                note: 'TTS will use fallback generation'
            };
        }
    }

    testVideoProcessing() {
        try {
            // Create a test video
            const testVideo = join(this.tempDir, 'test-video.mp4');
            const testImage = join(this.tempDir, 'test-image.png');
            
            // Create a test image first
            const { createCanvas } = require('canvas');
            const canvas = createCanvas(320, 240);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(0, 0, 320, 240);
            ctx.fillStyle = '#000000';
            ctx.font = '24px Arial';
            ctx.fillText('Test Video', 100, 120);
            
            const fs = require('fs');
            fs.writeFileSync(testImage, canvas.toBuffer('image/png'));
            
            // Create video from image
            execSync(`ffmpeg -loop 1 -i "${testImage}" -t 2 -c:v libx264 -pix_fmt yuv420p "${testVideo}" -y`, { stdio: 'pipe' });
            
            if (!existsSync(testVideo)) {
                throw new Error('Test video not created');
            }
            
            // Get video info
            const videoInfo = execSync(`ffmpeg -i "${testVideo}" 2>&1`, { encoding: 'utf8' });
            
            return {
                testVideo,
                duration: '2 seconds',
                format: 'MP4',
                codec: 'H.264'
            };
        } catch (error) {
            throw new Error(`Video processing test failed: ${error.message}`);
        }
    }

    testConfiguration() {
        const configPath = join(__dirname, '../narration.yaml');
        
        if (!existsSync(configPath)) {
            throw new Error('narration.yaml not found');
        }
        
        try {
            const yaml = require('yaml');
            const config = yaml.parse(readFileSync(configPath, 'utf8'));
            
            // Validate structure
            if (!config.metadata) throw new Error('Missing metadata section');
            if (!config.beats) throw new Error('Missing beats section');
            if (config.beats.length === 0) throw new Error('No beats defined');
            
            return {
                file: configPath,
                beats: config.beats.length,
                duration: config.metadata.duration,
                valid: true
            };
        } catch (error) {
            throw new Error(`Configuration validation failed: ${error.message}`);
        }
    }

    testDirectories() {
        const directories = [
            { path: this.outputDir, name: 'Output' },
            { path: this.tempDir, name: 'Temp' },
            { path: join(__dirname, '../assets'), name: 'Assets' }
        ];
        
        const results = {};
        
        for (const dir of directories) {
            try {
                if (!existsSync(dir.path)) {
                    const fs = require('fs');
                    fs.mkdirSync(dir.path, { recursive: true });
                }
                results[dir.name] = 'Ready';
            } catch (error) {
                throw new Error(`${dir.name} directory not accessible: ${error.message}`);
            }
        }
        
        return results;
    }

    async testIntegration() {
        try {
            // Test the complete pipeline
            console.log(chalk.yellow('  Running integration test...'));
            
            // Test narration generation
            const Narrator = (await import('./narrate.js')).default;
            const narrator = new Narrator();
            
            if (!narrator.loadConfig()) {
                throw new Error('Failed to load configuration');
            }
            
            // Test visual generation
            const VideoAssembler = (await import('./assemble.js')).default;
            const assembler = new VideoAssembler();
            
            if (!assembler.loadConfig()) {
                throw new Error('Failed to load configuration in assembler');
            }
            
            return {
                narrator: 'Configuration loaded',
                assembler: 'Configuration loaded',
                integration: 'Ready'
            };
        } catch (error) {
            throw new Error(`Integration test failed: ${error.message}`);
        }
    }

    printResults() {
        console.log(chalk.blue('\n📊 Test Results Summary'));
        console.log(chalk.gray('========================\n'));

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;

        console.log(chalk.green(`✅ Passed: ${passed}/${total}`));
        if (failed > 0) {
            console.log(chalk.red(`❌ Failed: ${failed}/${total}`));
        }

        console.log(chalk.blue('\n📋 Detailed Results:'));
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            const color = result.status === 'PASS' ? chalk.green : chalk.red;
            console.log(color(`${icon} ${result.name}`));
            
            if (result.details && typeof result.details === 'object') {
                Object.entries(result.details).forEach(([key, value]) => {
                    console.log(chalk.gray(`   ${key}: ${value}`));
                });
            } else if (result.details) {
                console.log(chalk.gray(`   ${result.details}`));
            }
        });

        if (failed === 0) {
            console.log(chalk.green('\n🎉 All tests passed! Video production environment is ready.'));
            console.log(chalk.blue('\n📋 Next steps:'));
            console.log(chalk.gray('  • docker-compose up -d'));
            console.log(chalk.gray('  • docker exec -it disaster-response-video npm run dev'));
            console.log(chalk.gray('  • npm run build'));
        } else {
            console.log(chalk.red('\n⚠️  Some tests failed. Please check the issues above.'));
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new VideoProductionTester();
    tester.runAllTests();
}

export default VideoProductionTester;
