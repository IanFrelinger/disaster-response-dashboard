#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AITTSGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output', 'voice-recordings');
        this.scenes = [
            {
                scene: 1,
                time: '0:00-0:15',
                text: "When disasters strike, emergency managers face a nightmare: fragmented data, slow coordination, and dangerous routing that puts lives at risk.",
                filename: 'scene-01-problem-fragmented-response.wav',
                tone: 'urgent'
            },
            {
                scene: 2,
                time: '0:15-0:30',
                text: "Every minute of delay costs lives. Traditional systems take hours to coordinate - we cut that to minutes.",
                filename: 'scene-02-problem-time-costs-lives.wav',
                tone: 'urgent'
            },
            {
                scene: 3,
                time: '0:30-0:45',
                text: "Our unified dashboard gives emergency commanders, first responders, and agencies one platform for coordinated action.",
                filename: 'scene-03-solution-unified-platform.wav',
                tone: 'confident'
            },
            {
                scene: 4,
                time: '0:45-1:00',
                text: "See all threats in real-time. Our multi-hazard map integrates data from multiple sources instantly.",
                filename: 'scene-04-real-time-threat-assessment.wav',
                tone: 'confident'
            },
            {
                scene: 5,
                time: '1:00-1:15',
                text: "Generate safe evacuation routes with one click. Our system automatically avoids danger zones and optimizes for safety.",
                filename: 'scene-05-one-click-evacuation-planning.wav',
                tone: 'professional'
            },
            {
                scene: 6,
                time: '1:15-1:30',
                text: "Routes update automatically as conditions change. What took hours now happens in seconds.",
                filename: 'scene-06-dynamic-route-updates.wav',
                tone: 'professional'
            },
            {
                scene: 7,
                time: '1:30-1:45',
                text: "3D terrain visualization reveals critical elevation data that affects evacuation planning and resource deployment.",
                filename: 'scene-07-3d-terrain-intelligence.wav',
                tone: 'professional'
            },
            {
                scene: 8,
                time: '1:45-2:00',
                text: "Manage mass evacuations efficiently. Our dashboard coordinates thousands of people with precision.",
                filename: 'scene-08-mass-evacuation-management.wav',
                tone: 'professional'
            },
            {
                scene: 9,
                time: '2:00-2:15',
                text: "AI analyzes patterns and provides real-time recommendations. Make informed decisions when seconds count.",
                filename: 'scene-09-ai-powered-decisions.wav',
                tone: 'professional'
            },
            {
                scene: 10,
                time: '2:15-2:30',
                text: "Real-time weather data from NOAA predicts how conditions will affect your response. Plan ahead, not react.",
                filename: 'scene-10-weather-integrated-planning.wav',
                tone: 'professional'
            },
            {
                scene: 11,
                time: '2:30-2:45',
                text: "Commanders get strategic overviews with high-level decision tools. Allocate resources where they're needed most.",
                filename: 'scene-11-commanders-strategic-view.wav',
                tone: 'benefit'
            },
            {
                scene: 12,
                time: '2:45-3:00',
                text: "First responders see tactical details for immediate action. Get the information you need, when you need it.",
                filename: 'scene-12-first-responder-tactical-view.wav',
                tone: 'benefit'
            },
            {
                scene: 13,
                time: '3:00-3:15',
                text: "Keep citizens informed with real-time updates. Clear communication saves lives and reduces panic.",
                filename: 'scene-13-public-communication.wav',
                tone: 'benefit'
            },
            {
                scene: 14,
                time: '3:15-3:30',
                text: "Our system reduces response time by 80%, improves evacuation efficiency by 60%, and saves lives.",
                filename: 'scene-14-measurable-impact.wav',
                tone: 'impressive'
            },
            {
                scene: 15,
                time: '3:30-3:45',
                text: "Transform your emergency response today. When minutes matter, our dashboard delivers coordinated action.",
                filename: 'scene-15-call-to-action.wav',
                tone: 'confident'
            }
        ];
    }

    async init() {
        console.log(chalk.cyan.bold('\n🤖 AI Text-to-Speech Generator'));
        console.log(chalk.cyan('================================\n'));

        // Create output directory
        await fs.ensureDir(this.outputDir);
        console.log(chalk.green(`✅ Output directory: ${this.outputDir}`));

        // Check if Python and required packages are available
        try {
            execSync('python3 --version', { stdio: 'ignore' });
            console.log(chalk.green('✅ Python3 available'));
        } catch (error) {
            console.log(chalk.red('❌ Python3 not found'));
            throw new Error('Python3 is required for TTS generation');
        }
    }

    async generatePythonTTS() {
        console.log(chalk.cyan.bold('\n🐍 Generating Python TTS Script'));
        console.log(chalk.cyan('===============================\n'));

        const pythonScript = path.join(__dirname, '..', 'scripts', 'generate_tts.py');
        
        let script = `#!/usr/bin/env python3
"""
AI Text-to-Speech Generator for Disaster Response Dashboard
Generates voice-overs for all 15 scenes using multiple TTS engines
"""

import os
import sys
import json
import subprocess
from pathlib import Path

try:
    from gtts import gTTS
    import pyttsx3
    from pydub import AudioSegment
    import requests
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Installing required packages...")
    subprocess.run([sys.executable, "-m", "pip", "install", "gTTS", "pyttsx3", "pydub", "requests"], check=True)
    from gtts import gTTS
    import pyttsx3
    from pydub import AudioSegment
    import requests

class TTSGenerator:
    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize pyttsx3 engine
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 150)  # Speed of speech
            self.engine.setProperty('volume', 0.9)  # Volume level
        except Exception as e:
            print(f"Warning: Could not initialize pyttsx3: {e}")
            self.engine = None

    def generate_gtts(self, text, filename, lang='en'):
        """Generate TTS using Google Text-to-Speech"""
        try:
            print(f"Generating gTTS: {filename}")
            tts = gTTS(text=text, lang=lang, slow=False)
            output_path = self.output_dir / filename
            tts.save(str(output_path))
            return str(output_path)
        except Exception as e:
            print(f"Error generating gTTS for {filename}: {e}")
            return None

    def generate_pyttsx3(self, text, filename):
        """Generate TTS using pyttsx3"""
        if not self.engine:
            return None
            
        try:
            print(f"Generating pyttsx3: {filename}")
            output_path = self.output_dir / filename
            self.engine.save_to_file(text, str(output_path))
            self.engine.runAndWait()
            return str(output_path)
        except Exception as e:
            print(f"Error generating pyttsx3 for {filename}: {e}")
            return None

    def generate_espeak(self, text, filename):
        """Generate TTS using espeak"""
        try:
            print(f"Generating espeak: {filename}")
            output_path = self.output_dir / filename
            cmd = [
                'espeak', 
                '-w', str(output_path),
                '-s', '150',  # Speed
                '-v', 'en-us',  # Voice
                '-a', '200',  # Amplitude
                text
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return str(output_path)
        except Exception as e:
            print(f"Error generating espeak for {filename}: {e}")
            return None

    def optimize_audio(self, input_path, target_duration=15):
        """Optimize audio to target duration"""
        try:
            audio = AudioSegment.from_wav(input_path)
            current_duration = len(audio) / 1000  # Convert to seconds
            
            if current_duration > target_duration:
                # Speed up audio
                speed_factor = current_duration / target_duration
                audio = audio.speedup(playback_speed=speed_factor)
            elif current_duration < target_duration:
                # Add silence to reach target duration
                silence_duration = (target_duration - current_duration) * 1000
                silence = AudioSegment.silent(duration=silence_duration)
                audio = audio + silence
            
            # Export optimized audio
            audio.export(input_path, format="wav")
            return True
        except Exception as e:
            print(f"Error optimizing audio {input_path}: {e}")
            return False

def main():
    # Scene data
    scenes = ${JSON.stringify(this.scenes)}
    
    # Initialize TTS generator
    output_dir = "${this.outputDir}"
    tts_gen = TTSGenerator(output_dir)
    
    print("🎤 Starting AI TTS generation...")
    
    results = []
    
    for scene in scenes:
        print(f"\\n📝 Processing Scene {scene['scene']} ({scene['time']})...")
        print(f"Text: {scene['text'][:50]}...")
        
        filename = scene['filename']
        text = scene['text']
        
        # Try different TTS engines in order of preference
        success = False
        
        # Try gTTS first (best quality)
        if not success:
            result = tts_gen.generate_gtts(text, filename)
            if result:
                success = tts_gen.optimize_audio(result, 15)
                if success:
                    print(f"✅ Generated with gTTS: {filename}")
                    results.append({"scene": scene['scene'], "method": "gTTS", "file": filename, "success": True})
        
        # Try pyttsx3 as backup
        if not success:
            result = tts_gen.generate_pyttsx3(text, filename)
            if result:
                success = tts_gen.optimize_audio(result, 15)
                if success:
                    print(f"✅ Generated with pyttsx3: {filename}")
                    results.append({"scene": scene['scene'], "method": "pyttsx3", "file": filename, "success": True})
        
        # Try espeak as last resort
        if not success:
            result = tts_gen.generate_espeak(text, filename)
            if result:
                success = tts_gen.optimize_audio(result, 15)
                if success:
                    print(f"✅ Generated with espeak: {filename}")
                    results.append({"scene": scene['scene'], "method": "espeak", "file": filename, "success": True})
        
        if not success:
            print(f"❌ Failed to generate TTS for {filename}")
            results.append({"scene": scene['scene'], "method": "none", "file": filename, "success": False})
    
    # Save results
    results_file = os.path.join(output_dir, "tts_generation_results.json")
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    successful = sum(1 for r in results if r['success'])
    total = len(results)
    
    print(f"\\n🎯 TTS Generation Summary:")
    print(f"✅ Successful: {successful}/{total}")
    print(f"❌ Failed: {total - successful}/{total}")
    print(f"📁 Results saved: {results_file}")
    
    if successful == total:
        print("🎉 All voice-overs generated successfully!")
        sys.exit(0)
    else:
        print("⚠️  Some voice-overs failed to generate")
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

        fs.writeFileSync(pythonScript, script);
        fs.chmodSync(pythonScript, '755');
        console.log(chalk.green(`✅ Python TTS script saved: ${pythonScript}`));

        return pythonScript;
    }

    async generateTTS() {
        console.log(chalk.cyan.bold('\n🎤 Generating AI Voice-Overs'));
        console.log(chalk.cyan('============================\n'));

        const pythonScript = path.join(__dirname, '..', 'scripts', 'generate_tts.py');
        
        try {
            console.log(chalk.blue('🚀 Running AI TTS generation...'));
            execSync(`python3 "${pythonScript}"`, { 
                stdio: 'inherit',
                cwd: path.dirname(pythonScript)
            });
            console.log(chalk.green('✅ AI TTS generation completed successfully!'));
            return true;
        } catch (error) {
            console.log(chalk.red(`❌ Error during TTS generation: ${error.message}`));
            return false;
        }
    }

    async validateTTS() {
        console.log(chalk.cyan.bold('\n🔍 Validating TTS Generation'));
        console.log(chalk.cyan('=============================\n'));

        const resultsFile = path.join(this.outputDir, 'tts_generation_results.json');
        const validationResults = [];

        if (!await fs.pathExists(resultsFile)) {
            console.log(chalk.red('❌ TTS generation results not found'));
            return false;
        }

        const results = await fs.readJson(resultsFile);
        
        for (const result of results) {
            const filePath = path.join(this.outputDir, result.file);
            const exists = await fs.pathExists(filePath);
            
            if (exists) {
                const stats = await fs.stat(filePath);
                const fileSize = stats.size;
                const isValidSize = fileSize > 1000; // At least 1KB
                
                validationResults.push({
                    scene: result.scene,
                    file: result.file,
                    exists: true,
                    size: fileSize,
                    validSize: isValidSize,
                    method: result.method,
                    success: result.success && isValidSize
                });
                
                if (isValidSize) {
                    console.log(chalk.green(`✅ Scene ${result.scene}: ${result.file} (${fileSize} bytes)`));
                } else {
                    console.log(chalk.yellow(`⚠️  Scene ${result.scene}: ${result.file} (too small: ${fileSize} bytes)`));
                }
            } else {
                validationResults.push({
                    scene: result.scene,
                    file: result.file,
                    exists: false,
                    size: 0,
                    validSize: false,
                    method: result.method,
                    success: false
                });
                console.log(chalk.red(`❌ Scene ${result.scene}: ${result.file} (not found)`));
            }
        }

        // Save validation results
        const validationFile = path.join(this.outputDir, 'tts_validation_results.json');
        await fs.writeJson(validationFile, validationResults, { spaces: 2 });

        const successful = validationResults.filter(r => r.success).length;
        const total = validationResults.length;

        console.log(chalk.cyan.bold('\n📊 Validation Summary:'));
        console.log(chalk.cyan('=====================\n'));
        console.log(chalk.green(`✅ Successful: ${successful}/${total}`));
        console.log(chalk.red(`❌ Failed: ${total - successful}/${total}`));
        console.log(chalk.blue(`📁 Validation results: ${validationFile}`));

        return successful === total;
    }

    async run() {
        try {
            await this.init();
            await this.generatePythonTTS();
            
            const ttsSuccess = await this.generateTTS();
            if (!ttsSuccess) {
                throw new Error('TTS generation failed');
            }

            const validationSuccess = await this.validateTTS();
            
            console.log(chalk.cyan.bold('\n🎯 AI TTS Generation Complete'));
            console.log(chalk.cyan('==============================\n'));
            
            if (validationSuccess) {
                console.log(chalk.green('✅ All voice-overs generated and validated successfully!'));
                console.log(chalk.blue(`📁 Voice-overs saved in: ${this.outputDir}`));
                console.log(chalk.yellow('\n📋 Next Steps:'));
                console.log(chalk.yellow('  1. Review the generated voice-overs'));
                console.log(chalk.yellow('  2. Regenerate the animatic with voice-overs'));
                console.log(chalk.yellow('  3. Test the final video'));
            } else {
                console.log(chalk.red('❌ Some voice-overs failed validation'));
                console.log(chalk.yellow('Check the validation results for details'));
            }

            return validationSuccess;

        } catch (error) {
            console.error('❌ Error during AI TTS generation:', error);
            throw error;
        }
    }
}

// Run the AI TTS generator
const generator = new AITTSGenerator();
generator.run().catch(console.error);
