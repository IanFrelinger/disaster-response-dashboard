#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DevTools {
    constructor() {
        this.config = null;
        this.outputDir = join(__dirname, '../output');
    }

    loadConfig() {
        const configPath = join(__dirname, '../narration.yaml');
        try {
            const yamlContent = readFileSync(configPath, 'utf8');
            this.config = yaml.parse(yamlContent);
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Failed to load narration.yaml:'), error.message);
            return false;
        }
    }

    async showMenu() {
        console.log(chalk.blue('🎬 Disaster Response Dashboard - Development Tools'));
        console.log(chalk.gray('================================================\n'));

        const choices = [
            { name: '📝 Preview narration script', value: 'preview' },
            { name: '🎵 Test TTS generation', value: 'tts' },
            { name: '🎨 Preview visual elements', value: 'visuals' },
            { name: '📊 Show timing breakdown', value: 'timing' },
            { name: '🔧 Validate configuration', value: 'validate' },
            { name: '🚀 Run full pipeline', value: 'full' },
            { name: '❌ Exit', value: 'exit' }
        ];

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: choices
            }
        ]);

        switch (action) {
            case 'preview':
                await this.previewScript();
                break;
            case 'tts':
                await this.testTTS();
                break;
            case 'visuals':
                await this.previewVisuals();
                break;
            case 'timing':
                await this.showTiming();
                break;
            case 'validate':
                await this.validateConfig();
                break;
            case 'full':
                await this.runFullPipeline();
                break;
            case 'exit':
                console.log(chalk.gray('Goodbye!'));
                process.exit(0);
        }

        // Show menu again
        await this.showMenu();
    }

    async previewScript() {
        console.log(chalk.blue('\n📝 Narration Script Preview'));
        console.log(chalk.gray('========================\n'));

        this.config.beats.forEach((beat, index) => {
            console.log(chalk.yellow(`${beat.start_time} - ${beat.end_time}: ${beat.name}`));
            console.log(chalk.white(`"${beat.narration}"`));
            console.log(chalk.gray(`Visual cues: ${beat.visual_cues?.join(', ') || 'None'}`));
            console.log(chalk.gray(`Labels: ${beat.on_screen_labels?.join(', ') || 'None'}`));
            console.log('');
        });
    }

    async testTTS() {
        console.log(chalk.blue('\n🎵 TTS Test'));
        console.log(chalk.gray('==========\n'));

        const testText = "This is a test of the text-to-speech system for the disaster response dashboard demo.";
        console.log(chalk.white(`Test text: "${testText}"`));
        
        const spinner = ora('Testing TTS...').start();
        
        try {
            const { execSync } = await import('child_process');
            const testFile = join(this.outputDir, 'tts-test.wav');
            const command = `say -o "${testFile}" "${testText}"`;
            execSync(command, { stdio: 'pipe' });
            
            spinner.succeed('TTS test successful!');
            console.log(chalk.gray(`Audio saved to: ${testFile}`));
            
        } catch (error) {
            spinner.fail('TTS test failed');
            console.error(chalk.red('Error:'), error.message);
        }
    }

    async previewVisuals() {
        console.log(chalk.blue('\n🎨 Visual Elements Preview'));
        console.log(chalk.gray('========================\n'));

        this.config.beats.forEach((beat, index) => {
            console.log(chalk.yellow(`Beat ${index + 1}: ${beat.name}`));
            console.log(chalk.white(`Duration: ${beat.start_time} - ${beat.end_time}`));
            
            if (beat.visual_cues && beat.visual_cues.length > 0) {
                console.log(chalk.green('Visual cues:'));
                beat.visual_cues.forEach(cue => {
                    console.log(chalk.gray(`  • ${cue}`));
                });
            }
            
            if (beat.on_screen_labels && beat.on_screen_labels.length > 0) {
                console.log(chalk.cyan('On-screen labels:'));
                beat.on_screen_labels.forEach(label => {
                    console.log(chalk.gray(`  • ${label}`));
                });
            }
            console.log('');
        });
    }

    async showTiming() {
        console.log(chalk.blue('\n📊 Timing Breakdown'));
        console.log(chalk.gray('================\n'));

        let totalDuration = 0;
        
        this.config.beats.forEach((beat, index) => {
            const startSeconds = this.timeToSeconds(beat.start_time);
            const endSeconds = this.timeToSeconds(beat.end_time);
            const duration = endSeconds - startSeconds;
            totalDuration += duration;
            
            const words = beat.narration.split(' ').length;
            const wpm = Math.round(words / (duration / 60));
            
            console.log(chalk.yellow(`${beat.name}:`));
            console.log(chalk.gray(`  Duration: ${duration.toFixed(1)}s`));
            console.log(chalk.gray(`  Words: ${words}`));
            console.log(chalk.gray(`  WPM: ${wpm}`));
            console.log('');
        });

        console.log(chalk.blue(`Total duration: ${totalDuration.toFixed(1)}s (${(totalDuration/60).toFixed(1)} minutes)`));
    }

    timeToSeconds(timeStr) {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 60 + parts[1];
    }

    async validateConfig() {
        console.log(chalk.blue('\n🔧 Configuration Validation'));
        console.log(chalk.gray('========================\n'));

        const issues = [];
        
        // Check metadata
        if (!this.config.metadata) {
            issues.push('Missing metadata section');
        }
        
        // Check beats
        if (!this.config.beats || this.config.beats.length === 0) {
            issues.push('No beats defined');
        }
        
        // Check each beat
        this.config.beats?.forEach((beat, index) => {
            if (!beat.name) issues.push(`Beat ${index + 1}: Missing name`);
            if (!beat.narration) issues.push(`Beat ${index + 1}: Missing narration`);
            if (!beat.start_time) issues.push(`Beat ${index + 1}: Missing start_time`);
            if (!beat.end_time) issues.push(`Beat ${index + 1}: Missing end_time`);
        });
        
        if (issues.length === 0) {
            console.log(chalk.green('✅ Configuration is valid!'));
        } else {
            console.log(chalk.red('❌ Configuration issues found:'));
            issues.forEach(issue => {
                console.log(chalk.red(`  • ${issue}`));
            });
        }
    }

    async runFullPipeline() {
        console.log(chalk.blue('\n🚀 Running Full Pipeline'));
        console.log(chalk.gray('=====================\n'));

        const { execSync } = await import('child_process');
        
        try {
            console.log(chalk.yellow('Step 1: Generating narration...'));
            execSync('npm run narrate', { stdio: 'inherit' });
            
            console.log(chalk.yellow('\nStep 2: Assembling video...'));
            execSync('npm run assemble', { stdio: 'inherit' });
            
            console.log(chalk.yellow('\nStep 3: Final processing...'));
            execSync('npm run final', { stdio: 'inherit' });
            
            console.log(chalk.green('\n✅ Full pipeline completed successfully!'));
            
        } catch (error) {
            console.error(chalk.red('\n❌ Pipeline failed:'), error.message);
        }
    }

    async run() {
        if (!this.loadConfig()) {
            process.exit(1);
        }

        await this.showMenu();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const devTools = new DevTools();
    devTools.run();
}

export default DevTools;
