#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarkdownToConfigConverter {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'output');
        this.storyboardPath = path.join(__dirname, '..', 'output', 'VIDEO_STORYBOARD_WITH_SCREENSHOTS.md');
    }

    async init() {
        console.log(chalk.cyan.bold('\n📝 Markdown to Config Converter'));
        console.log(chalk.cyan('===================================\n'));

        // Ensure output directory exists
        await fs.ensureDir(this.outputDir);
    }

    parseStoryboard(markdownContent) {
        console.log(chalk.blue('🔍 Parsing storyboard content...\n'));

        const beats = [];
        const lines = markdownContent.split('\n');
        let currentBeat = null;
        let currentSection = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Parse beat headers: ## Scene X: Title (duration) or ### Scene X: Title (duration)
            const beatMatch = line.match(/^#{2,3} Scene (\d+):\s*(.+?)\s*\((\d+):(\d+)-(\d+):(\d+)\)/);
            if (beatMatch) {
                if (currentBeat) {
                    beats.push(currentBeat);
                }
                
                const sceneNum = parseInt(beatMatch[1]);
                const title = beatMatch[2].trim();
                const startMin = parseInt(beatMatch[3]);
                const startSec = parseInt(beatMatch[4]);
                const endMin = parseInt(beatMatch[5]);
                const endSec = parseInt(beatMatch[6]);
                
                const startSeconds = startMin * 60 + startSec;
                const endSeconds = endMin * 60 + endSec;
                const durationSeconds = endSeconds - startSeconds;
                
                currentBeat = {
                    id: `scene-${sceneNum.toString().padStart(2, '0')}`,
                    title,
                    startTime: `${startMin}:${startSec.toString().padStart(2, '0')}`,
                    endTime: `${endMin}:${endSec.toString().padStart(2, '0')}`,
                    startSeconds,
                    endSeconds,
                    durationSeconds,
                    narration: '',
                    actions: [],
                    callouts: []
                };
                
                currentSection = null;
                continue;
            }

            // Parse narration
            if (line.startsWith('- **Voice-Over:**')) {
                currentSection = 'narration';
                const narrationMatch = line.match(/- \*\*Voice-Over:\*\*\s*"(.+?)"/);
                if (narrationMatch) {
                    currentBeat.narration = narrationMatch[1];
                }
                continue;
            }

            // Parse actions
            if (line.startsWith('- **Visual Actions:**')) {
                currentSection = 'actions';
                continue;
            }

            // Parse callouts
            if (line.startsWith('- **Key Message:**')) {
                currentSection = 'callouts';
                const messageMatch = line.match(/- \*\*Key Message:\*\*\s*(.+)/);
                if (messageMatch) {
                    currentBeat.callouts.push(messageMatch[1].trim());
                }
                continue;
            }

            // Parse action items (indented with 2 spaces)
            if (currentSection === 'actions' && line.startsWith('  - ')) {
                const action = line.replace('  - ', '').trim();
                if (action) {
                    currentBeat.actions.push(action);
                }
                continue;
            }

            // Parse action items (single dash, no indentation)
            if (currentSection === 'actions' && line.startsWith('- ')) {
                const action = line.replace('- ', '').trim();
                if (action) {
                    currentBeat.actions.push(action);
                }
                continue;
            }

            // Parse action items (indented with 3 spaces)
            if (currentSection === 'actions' && line.startsWith('   - ')) {
                const action = line.replace('   - ', '').trim();
                if (action) {
                    currentBeat.actions.push(action);
                }
                continue;
            }

            // Parse additional callouts (indented with 2 spaces)
            if (currentSection === 'callouts' && line.startsWith('  - ')) {
                const callout = line.replace('  - ', '').trim();
                if (callout) {
                    currentBeat.callouts.push(callout);
                }
                continue;
            }

            // Parse additional callouts (indented with 3 spaces)
            if (currentSection === 'callouts' && line.startsWith('   - ')) {
                const callout = line.replace('   - ', '').trim();
                if (callout) {
                    currentBeat.callouts.push(callout);
                }
                continue;
            }
        }

        // Add the last beat
        if (currentBeat) {
            beats.push(currentBeat);
        }

        console.log(chalk.green(`✅ Parsed ${beats.length} beats from storyboard`));
        return beats;
    }

    generateRecordConfig(beats) {
        console.log(chalk.blue('\n⚙️  Generating record.config.json...\n'));

        const config = {
            project: 'disaster-response-dashboard',
            version: '1.0.0',
            settings: {
                resolution: '1920x1080',
                fps: 30,
                quality: 'high',
                audio: {
                    sampleRate: 44100,
                    channels: 2,
                    bitrate: '192k'
                }
            },
            beats: beats.map(beat => ({
                id: beat.id,
                durationSeconds: beat.durationSeconds,
                startTime: beat.startTime,
                endTime: beat.endTime,
                title: beat.title
            }))
        };

        const configPath = path.join(this.outputDir, 'record.config.json');
        fs.writeJsonSync(configPath, config, { spaces: 2 });
        console.log(chalk.green(`✅ Record config saved: ${configPath}`));
        
        return config;
    }

    generateRecordPlan(beats) {
        console.log(chalk.blue('\n📋 Generating record.plan.json...\n'));

        const plan = {
            totalDuration: beats.reduce((sum, beat) => sum + beat.durationSeconds, 0),
            totalBeats: beats.length,
            beats: beats.map(beat => ({
                id: beat.id,
                durationSeconds: beat.durationSeconds,
                narration: beat.narration,
                actions: beat.actions.map(action => {
                    // Convert action descriptions to Playwright commands
                    if (action.includes('Show')) {
                        return { type: 'display', target: 'current' };
                    } else if (action.includes('Highlight')) {
                        return { type: 'highlight', target: 'data' };
                    } else if (action.includes('Demonstrate')) {
                        return { type: 'demo', target: 'feature' };
                    } else if (action.includes('Click')) {
                        return { type: 'click', target: 'button' };
                    } else {
                        return { type: 'show', target: action.toLowerCase() };
                    }
                }),
                callouts: beat.callouts
            }))
        };

        const planPath = path.join(this.outputDir, 'record.plan.json');
        fs.writeJsonSync(planPath, plan, { spaces: 2 });
        console.log(chalk.green(`✅ Record plan saved: ${planPath}`));
        
        return plan;
    }

    generateNarrationYaml(beats) {
        console.log(chalk.blue('\n🗣️  Generating narration.yaml...\n'));

        const narration = {
            project: 'disaster-response-dashboard',
            language: 'en-US',
            voice: 'professional',
            beats: beats.map(beat => ({
                id: beat.id,
                startTime: beat.startTime,
                durationSeconds: beat.durationSeconds,
                text: beat.narration,
                emphasis: beat.callouts.length > 0 ? 'high' : 'normal'
            }))
        };

        const yamlPath = path.join(this.outputDir, 'narration.yaml');
        fs.writeJsonSync(yamlPath, narration, { spaces: 2 });
        console.log(chalk.green(`✅ Narration YAML saved: ${yamlPath}`));
        
        return narration;
    }

    generateTimelineYaml(beats) {
        console.log(chalk.blue('\n⏰ Generating timeline.yaml...\n'));

        const timeline = {
            project: 'disaster-response-dashboard',
            totalDuration: beats.reduce((sum, beat) => sum + beat.durationSeconds, 0),
            beats: beats.map((beat, index) => ({
                id: beat.id,
                order: index + 1,
                startTime: beat.startSeconds,
                endTime: beat.endSeconds,
                durationSeconds: beat.durationSeconds,
                transitions: {
                    in: index === 0 ? 'fade' : 'cut',
                    out: index === beats.length - 1 ? 'fade' : 'cut'
                }
            }))
        };

        const timelinePath = path.join(this.outputDir, 'timeline.yaml');
        fs.writeJsonSync(timelinePath, timeline, { spaces: 2 });
        console.log(chalk.green(`✅ Timeline YAML saved: ${timelinePath}`));
        
        return timeline;
    }

    generateSubtitlesSrt(beats) {
        console.log(chalk.blue('\n📺 Generating subtitles.srt...\n'));

        let srtContent = '';
        let subtitleIndex = 1;

        beats.forEach(beat => {
            const startTime = this.formatSrtTime(beat.startSeconds);
            const endTime = this.formatSrtTime(beat.endSeconds);
            
            srtContent += `${subtitleIndex}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${beat.narration}\n\n`;
            
            subtitleIndex++;
        });

        const srtPath = path.join(this.outputDir, 'subtitles.srt');
        fs.writeFileSync(srtPath, srtContent);
        console.log(chalk.green(`✅ Subtitles SRT saved: ${srtPath}`));
        
        return srtPath;
    }

    formatSrtTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    }

    async convert() {
        try {
            await this.init();

            if (!await fs.pathExists(this.storyboardPath)) {
                console.log(chalk.red(`❌ Storyboard not found: ${this.storyboardPath}`));
                return false;
            }

            const markdownContent = await fs.readFile(this.storyboardPath, 'utf8');
            const beats = this.parseStoryboard(markdownContent);

            if (beats.length === 0) {
                console.log(chalk.red('❌ No beats found in storyboard'));
                return false;
            }

            // Generate all configuration files
            const config = this.generateRecordConfig(beats);
            const plan = this.generateRecordPlan(beats);
            const narration = this.generateNarrationYaml(beats);
            const timeline = this.generateTimelineYaml(beats);
            const subtitles = this.generateSubtitlesSrt(beats);

            // Generate summary report
            const summary = {
                timestamp: new Date().toISOString(),
                storyboard: path.basename(this.storyboardPath),
                totalBeats: beats.length,
                totalDuration: beats.reduce((sum, beat) => sum + beat.durationSeconds, 0),
                generatedFiles: [
                    'record.config.json',
                    'record.plan.json', 
                    'narration.yaml',
                    'timeline.yaml',
                    'subtitles.srt'
                ],
                beats: beats.map(beat => ({
                    id: beat.id,
                    title: beat.title,
                    durationSeconds: beat.durationSeconds,
                    hasNarration: !!beat.narration,
                    hasActions: beat.actions.length > 0,
                    hasCallouts: beat.callouts.length > 0
                }))
            };

            const summaryPath = path.join(this.outputDir, 'conversion-summary.json');
            await fs.writeJson(summaryPath, summary, { spaces: 2 });
            console.log(chalk.green(`\n📄 Conversion summary saved: ${summaryPath}`));

            console.log(chalk.cyan.bold('\n🎯 Conversion Complete!'));
            console.log(chalk.cyan('========================\n'));
            console.log(chalk.green(`✅ Generated ${beats.length} beats from storyboard`));
            console.log(chalk.green(`✅ Total duration: ${summary.totalDuration} seconds`));
            console.log(chalk.blue(`📁 All config files saved to: ${this.outputDir}`));
            console.log(chalk.blue('💡 Next: Run the recording pipeline with these configs'));

            return true;

        } catch (error) {
            console.log(chalk.red(`❌ Conversion failed: ${error.message}`));
            return false;
        }
    }

    async run() {
        return await this.convert();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const converter = new MarkdownToConfigConverter();
    converter.run().catch(console.error);
}

export default MarkdownToConfigConverter;
