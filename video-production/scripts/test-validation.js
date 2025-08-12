#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

const OUTPUT_DIR = '/app/output';

async function createTestVideo() {
    console.log(chalk.cyan.bold('\n🧪 Creating Test Video for Validation'));
    console.log(chalk.cyan('==========================================\n'));

    try {
        // Create a simple test video using FFmpeg
        const testVideoPath = path.join(OUTPUT_DIR, 'test-video.mp4');
        
        // Generate a 10-second test video with color bars and test tone
        const ffmpegCommand = `ffmpeg -f lavfi -i testsrc=duration=10:size=1920x1080:rate=30 -f lavfi -i sine=frequency=1000:duration=10 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest "${testVideoPath}"`;
        
        console.log('Generating test video...');
        execSync(ffmpegCommand, { stdio: 'pipe' });
        
        // Check if video was created
        if (await fs.pathExists(testVideoPath)) {
            const stats = await fs.stat(testVideoPath);
            const sizeMB = stats.size / (1024 * 1024);
            console.log(chalk.green(`✅ Test video created: ${sizeMB.toFixed(2)}MB`));
            
            // Test video properties
            const ffprobeOutput = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${testVideoPath}"`, { encoding: 'utf8' });
            const videoInfo = JSON.parse(ffprobeOutput);
            
            const duration = parseFloat(videoInfo.format.duration);
            console.log(chalk.green(`✅ Video duration: ${duration.toFixed(2)} seconds`));
            
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            if (videoStream) {
                console.log(chalk.green(`✅ Video resolution: ${videoStream.width}x${videoStream.height}`));
            }
            
            return testVideoPath;
        } else {
            console.log(chalk.red('❌ Test video creation failed'));
            return null;
        }
    } catch (error) {
        console.log(chalk.red(`❌ Error creating test video: ${error.message}`));
        return null;
    }
}

async function createTestMetadata() {
    console.log(chalk.cyan.bold('\n📋 Creating Test Metadata'));
    console.log(chalk.cyan('==========================\n'));

    try {
        const metadata = {
            title: "Test Video for Validation",
            description: "A test video created to validate the video validation system",
            duration: "0:10",
            resolution: "1920x1080",
            format: "MP4",
            created: new Date().toISOString(),
            tags: ["test", "validation", "video"],
            features: ["Test video", "Validation system"]
        };

        const metadataPath = path.join(OUTPUT_DIR, 'test-metadata.json');
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });
        
        console.log(chalk.green('✅ Test metadata created'));
        return metadataPath;
    } catch (error) {
        console.log(chalk.red(`❌ Error creating test metadata: ${error.message}`));
        return null;
    }
}

async function runValidationTest() {
    console.log(chalk.cyan.bold('\n🎬 Running Validation Test'));
    console.log(chalk.cyan('==========================\n'));

    try {
        // Create test files
        const testVideoPath = await createTestVideo();
        const testMetadataPath = await createTestMetadata();
        
        if (!testVideoPath || !testMetadataPath) {
            console.log(chalk.red('❌ Failed to create test files'));
            return false;
        }

        // Temporarily rename test files to match expected names
        const originalVideoPath = path.join(OUTPUT_DIR, 'disaster-response-demo.mp4');
        const originalMetadataPath = path.join(OUTPUT_DIR, 'video-metadata.json');
        
        // Backup original files if they exist
        if (await fs.pathExists(originalVideoPath)) {
            await fs.move(originalVideoPath, originalVideoPath + '.backup');
        }
        if (await fs.pathExists(originalMetadataPath)) {
            await fs.move(originalMetadataPath, originalMetadataPath + '.backup');
        }
        
        // Move test files to expected locations
        await fs.move(testVideoPath, originalVideoPath);
        await fs.move(testMetadataPath, originalMetadataPath);
        
        console.log(chalk.green('✅ Test files prepared for validation'));
        
        // Run validation
        console.log(chalk.cyan('\n🔍 Running validation on test files...'));
        execSync('npm run validate', { stdio: 'inherit' });
        
        // Restore original files
        if (await fs.pathExists(originalVideoPath + '.backup')) {
            await fs.move(originalVideoPath + '.backup', originalVideoPath);
        }
        if (await fs.pathExists(originalMetadataPath + '.backup')) {
            await fs.move(originalMetadataPath + '.backup', originalMetadataPath);
        }
        
        console.log(chalk.green('\n✅ Validation test completed'));
        return true;
        
    } catch (error) {
        console.log(chalk.red(`❌ Validation test failed: ${error.message}`));
        return false;
    }
}

// Run the test
runValidationTest().catch(error => {
    console.error(chalk.red('Test failed with error:'), error);
    process.exit(1);
});
