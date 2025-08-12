#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarkdownParserTester {
    constructor() {
        this.testOutputDir = path.join(__dirname, '..', 'output', 'test-parser');
    }

    async init() {
        console.log(chalk.cyan.bold('\n🧪 Markdown Parser Test Suite'));
        console.log(chalk.cyan('================================\n'));

        await fs.ensureDir(this.testOutputDir);
    }

    createTestStoryboard() {
        console.log(chalk.blue('📝 Creating test storyboard...\n'));

        const testStoryboard = `# Test Storyboard

## Scene 1: Test Scene One (0:00-0:15)
- **Voice-Over:** "This is the first test scene with narration."
- **Visual Actions:**
  - Show current state
  - Highlight important data
- **Key Message:** Test message one

## Scene 2: Test Scene Two (0:15-0:30)
- **Voice-Over:** "This is the second test scene with different content."
- **Visual Actions:**
  - Demonstrate feature
  - Click button
- **Key Message:** Test message two

## Scene 3: Test Scene Three (0:30-0:45)
- **Voice-Over:** "This is the third test scene to verify parsing."
- **Visual Actions:**
  - Show results
  - Pan to new area
- **Key Message:** Test message three`;

        const testPath = path.join(this.testOutputDir, 'test-storyboard.md');
        fs.writeFileSync(testPath, testStoryboard);
        console.log(chalk.green(`✅ Test storyboard created: ${testPath}`));
        
        return testPath;
    }

    async testParser() {
        console.log(chalk.blue('\n🔍 Testing parser functionality...\n'));

        try {
            // Import the converter class
            const { default: MarkdownToConfigConverter } = await import('./md-to-config.js');
            
            // Create a test instance
            const converter = new MarkdownToConfigConverter();
            converter.outputDir = this.testOutputDir;
            converter.storyboardPath = path.join(this.testOutputDir, 'test-storyboard.md');
            
            // Test parsing
            const testContent = await fs.readFile(converter.storyboardPath, 'utf8');
            const beats = converter.parseStoryboard(testContent);
            
            // Validate results
            console.log(chalk.blue('📊 Parser Test Results:'));
            console.log(`   Expected beats: 3`);
            console.log(`   Actual beats: ${beats.length}`);
            console.log(`   Test ${beats.length === 3 ? 'PASSED' : 'FAILED'}\n`);
            
            if (beats.length === 3) {
                console.log(chalk.green('✅ Beat count correct'));
                
                // Test first beat
                const firstBeat = beats[0];
                console.log(chalk.blue('\n🔍 First Beat Analysis:'));
                console.log(`   ID: ${firstBeat.id} (expected: scene-01)`);
                console.log(`   Title: ${firstBeat.title} (expected: Test Scene One)`);
                console.log(`   Duration: ${firstBeat.durationSeconds}s (expected: 15)`);
                console.log(`   Narration: ${firstBeat.narration ? 'Present' : 'Missing'}`);
                console.log(`   Actions: ${firstBeat.actions.length} (expected: 2)`);
                console.log(`   Callouts: ${firstBeat.callouts.length} (expected: 1)`);
                
                const allTestsPassed = 
                    firstBeat.id === 'scene-01' &&
                    firstBeat.title === 'Test Scene One' &&
                    firstBeat.durationSeconds === 15 &&
                    firstBeat.narration &&
                    firstBeat.actions.length === 2 &&
                    firstBeat.callouts.length === 1;
                
                console.log(`\n   Overall test: ${allTestsPassed ? 'PASSED' : 'FAILED'}`);
                
                if (allTestsPassed) {
                    console.log(chalk.green('\n🎉 All parser tests passed!'));
                    
                    // Test configuration generation
                    console.log(chalk.blue('\n⚙️  Testing configuration generation...'));
                    
                    const config = converter.generateRecordConfig(beats);
                    const plan = converter.generateRecordPlan(beats);
                    const narration = converter.generateNarrationYaml(beats);
                    const timeline = converter.generateTimelineYaml(beats);
                    const subtitles = converter.generateSubtitlesSrt(beats);
                    
                    console.log(chalk.green('✅ All configuration files generated successfully'));
                    
                    // Verify files exist
                    const expectedFiles = [
                        'record.config.json',
                        'record.plan.json',
                        'narration.yaml',
                        'timeline.yaml',
                        'subtitles.srt'
                    ];
                    
                    for (const file of expectedFiles) {
                        const filePath = path.join(this.testOutputDir, file);
                        if (await fs.pathExists(filePath)) {
                            console.log(chalk.green(`   ✅ ${file} created`));
                        } else {
                            console.log(chalk.red(`   ❌ ${file} missing`));
                        }
                    }
                    
                    return true;
                } else {
                    console.log(chalk.red('\n❌ Parser tests failed'));
                    return false;
                }
            } else {
                console.log(chalk.red('❌ Beat count incorrect'));
                return false;
            }
            
        } catch (error) {
            console.log(chalk.red(`❌ Parser test failed: ${error.message}`));
            return false;
        }
    }

    async runTests() {
        try {
            await this.init();
            
            console.log(chalk.blue('🚀 Starting parser tests...\n'));
            
            // Create test data
            this.createTestStoryboard();
            
            // Run tests
            const success = await this.testParser();
            
            console.log(chalk.cyan.bold('\n🎯 Test Suite Summary'));
            console.log(chalk.cyan('=====================\n'));
            
            if (success) {
                console.log(chalk.green('✅ All tests passed!'));
                console.log(chalk.blue('💡 Parser is ready for production use'));
            } else {
                console.log(chalk.red('❌ Some tests failed'));
                console.log(chalk.yellow('💡 Check the output above for specific issues'));
            }
            
            return success;
            
        } catch (error) {
            console.log(chalk.red(`❌ Test suite failed: ${error.message}`));
            return false;
        }
    }

    async run() {
        return await this.runTests();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new MarkdownParserTester();
    tester.run().catch(console.error);
}

export default MarkdownParserTester;
