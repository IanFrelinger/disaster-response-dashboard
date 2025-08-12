#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Narrator {
    constructor() {
        this.config = null;
        this.outputDir = join(__dirname, '../output');
        this.tempDir = join(__dirname, '../temp');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.tempDir].forEach(dir => {
            try {
                mkdirSync(dir, { recursive: true });
            } catch (error) {
                // Directory already exists
            }
        });
    }

    loadConfig() {
        const configPath = join(__dirname, '../narration.yaml');
        try {
            const yamlContent = readFileSync(configPath, 'utf8');
            this.config = yaml.parse(yamlContent);
            console.log(chalk.green('✅ Loaded narration configuration'));
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Failed to load narration.yaml:'), error.message);
            return false;
        }
    }

    async generateVoiceover() {
        const spinner = ora('Generating voiceover...').start();
        
        try {
            // Generate individual audio files for each beat
            const audioFiles = [];
            
            for (let i = 0; i < this.config.beats.length; i++) {
                const beat = this.config.beats[i];
                const audioFile = await this.generateBeatAudio(beat, i);
                audioFiles.push(audioFile);
                
                spinner.text = `Generated audio for beat ${i + 1}/${this.config.beats.length}`;
            }

            // Merge all audio files
            const mergedAudio = await this.mergeAudioFiles(audioFiles);
            
            // Generate captions
            const captions = await this.generateCaptions();
            
            spinner.succeed('Voiceover generation complete!');
            
            console.log(chalk.blue('📁 Output files:'));
            console.log(chalk.gray('  • voiceover.wav - Merged audio'));
            console.log(chalk.gray('  • captions.vtt - Subtitles'));
            console.log(chalk.gray('  • beats/ - Individual beat audio files'));
            
            return {
                audio: mergedAudio,
                captions: captions,
                beats: audioFiles
            };
            
        } catch (error) {
            spinner.fail('Voiceover generation failed');
            console.error(chalk.red('Error:'), error.message);
            throw error;
        }
    }

    async generateBeatAudio(beat, index) {
        const outputFile = join(this.tempDir, `beat_${index + 1}.wav`);
        
        // Use system TTS for demo (can be replaced with ElevenLabs or OpenAI)
        const text = beat.narration;
        const speed = this.config.metadata.speed || 1.0;
        
        try {
            // macOS say command with speed adjustment
            const command = `say -o "${outputFile}" -r ${Math.floor(175 * speed)} "${text}"`;
            execSync(command, { stdio: 'pipe' });
            
            return outputFile;
        } catch (error) {
            // Fallback to basic TTS
            console.warn(chalk.yellow(`⚠️  Using fallback TTS for beat ${index + 1}`));
            return this.generateFallbackAudio(text, outputFile, speed);
        }
    }

    generateFallbackAudio(text, outputFile, speed) {
        // Simple fallback - create a silent audio file with metadata
        const duration = this.calculateDuration(text, speed);
        const command = `ffmpeg -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" -t ${duration} -c:a pcm_s16le "${outputFile}" -y`;
        
        try {
            execSync(command, { stdio: 'pipe' });
            return outputFile;
        } catch (error) {
            console.error(chalk.red('Fallback audio generation failed:'), error.message);
            throw error;
        }
    }

    calculateDuration(text, speed) {
        // Rough estimate: 150 words per minute, adjusted for speed
        const words = text.split(' ').length;
        const baseDuration = words / 150; // minutes
        return baseDuration / speed;
    }

    async mergeAudioFiles(audioFiles) {
        const outputFile = join(this.outputDir, 'voiceover.wav');
        
        if (audioFiles.length === 1) {
            // Just copy the single file
            const copyCommand = `cp "${audioFiles[0]}" "${outputFile}"`;
            execSync(copyCommand);
            return outputFile;
        }
        
        // Create file list for ffmpeg
        const fileList = join(this.tempDir, 'audio_files.txt');
        const fileListContent = audioFiles.map(file => `file '${file}'`).join('\n');
        writeFileSync(fileList, fileListContent);
        
        // Merge audio files
        const command = `ffmpeg -f concat -safe 0 -i "${fileList}" -c copy "${outputFile}" -y`;
        execSync(command, { stdio: 'pipe' });
        
        return outputFile;
    }

    async generateCaptions() {
        const outputFile = join(this.outputDir, 'captions.vtt');
        let vttContent = 'WEBVTT\n\n';
        
        let currentTime = 0;
        
        for (let i = 0; i < this.config.beats.length; i++) {
            const beat = this.config.beats[i];
            const duration = this.calculateDuration(beat.narration, this.config.metadata.speed || 1.0);
            
            const startTime = this.formatTime(currentTime);
            const endTime = this.formatTime(currentTime + duration);
            
            vttContent += `${i + 1}\n`;
            vttContent += `${startTime} --> ${endTime}\n`;
            vttContent += `${beat.narration}\n\n`;
            
            currentTime += duration;
        }
        
        writeFileSync(outputFile, vttContent);
        return outputFile;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    async run() {
        console.log(chalk.blue('🎬 Disaster Response Dashboard - Narration Generator'));
        console.log(chalk.gray('================================================\n'));
        
        if (!this.loadConfig()) {
            process.exit(1);
        }
        
        try {
            const result = await this.generateVoiceover();
            console.log(chalk.green('\n✅ Narration generation complete!'));
            console.log(chalk.blue('\n📋 Next steps:'));
            console.log(chalk.gray('  • npm run assemble - Build rough cut'));
            console.log(chalk.gray('  • npm run final - Create final MP4'));
            console.log(chalk.gray('  • npm run build - Run all steps'));
            
            return result;
        } catch (error) {
            console.error(chalk.red('\n❌ Narration generation failed'));
            process.exit(1);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const narrator = new Narrator();
    narrator.run();
}

export default Narrator;
