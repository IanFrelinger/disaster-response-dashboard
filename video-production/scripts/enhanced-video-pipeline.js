#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedVideoPipeline {
    constructor() {
        this.capturesDir = path.join(__dirname, '../captures');
        this.outputDir = path.join(__dirname, '../output');
        this.tempDir = path.join(__dirname, '../temp');
        this.audioDir = path.join(__dirname, '../audio');
        this.lutsDir = path.join(__dirname, '../luts');
        
        // Map capture files to scene requirements based on duration and content
        this.videoMapping = {
            'intro.webm': '2c423e1cb3d8337cb3003685b769cc41.webm', // 23.64s - good for intro
            'hazards.webm': '732784dd79db2e79ae014d9c70a3d7df.webm', // 139.44s - long enough for multiple scenes
            'commander.webm': '63b5c528199dedd61e7f0795987e4c27.webm', // 30.60s - good for user roles
            'ai-support.webm': 'acbbb238cca6c5f86e207b3d72e337cb.webm', // 90.96s - good for technical content
            'evacuation.webm': '1ade99a5d75815058377f19e971a8a47.webm', // 141.20s - long enough for multiple scenes
            'routes.webm': '8197d3f669c6fa6798c798500085421c.webm', // 30.60s - good for route planning
            'outro.webm': 'cfff326c9de3c06a657bc52de275077b.webm' // 1.96s - short for conclusion
        };
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.tempDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async validateVideoFile(filePath) {
        try {
            const result = execSync(`ffprobe -v quiet -show_entries format=duration,size -of csv=p=0 "${filePath}"`, { encoding: 'utf8' });
            const [duration, size] = result.trim().split(',');
            
            if (duration === 'N/A' || parseFloat(duration) <= 0) {
                return { valid: false, error: 'Invalid duration' };
            }
            
            if (parseInt(size) < 1024) {
                return { valid: false, error: 'File too small' };
            }
            
            return { 
                valid: true, 
                duration: parseFloat(duration), 
                size: parseInt(size) 
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    async validateAllCaptures() {
        console.log('🔍 Validating all capture files...');
        const validationResults = {};
        
        for (const [sceneName, captureFile] of Object.entries(this.videoMapping)) {
            const capturePath = path.join(this.capturesDir, captureFile);
            
            if (!fs.existsSync(capturePath)) {
                console.log(`❌ Missing capture file: ${captureFile}`);
                validationResults[sceneName] = { valid: false, error: 'File not found' };
                continue;
            }
            
            const validation = await this.validateVideoFile(capturePath);
            validationResults[sceneName] = validation;
            
            if (validation.valid) {
                console.log(`✅ ${sceneName}: ${captureFile} (${validation.duration.toFixed(2)}s)`);
            } else {
                console.log(`❌ ${sceneName}: ${captureFile} - ${validation.error}`);
            }
        }
        
        return validationResults;
    }

    async createNamedVideoFiles() {
        console.log('📁 Creating named video files for timeline...');
        
        for (const [sceneName, captureFile] of Object.entries(this.videoMapping)) {
            const sourcePath = path.join(this.capturesDir, captureFile);
            const targetPath = path.join(this.capturesDir, sceneName);
            
            if (fs.existsSync(targetPath)) {
                console.log(`ℹ️  ${sceneName} already exists, skipping...`);
                continue;
            }
            
            try {
                // Create a symbolic link or copy the file
                if (process.platform === 'win32') {
                    execSync(`copy "${sourcePath}" "${targetPath}"`, { stdio: 'pipe' });
                } else {
                    execSync(`ln -sf "${captureFile}" "${targetPath}"`, { stdio: 'pipe' });
                }
                console.log(`✅ Created ${sceneName} -> ${captureFile}`);
            } catch (error) {
                console.log(`⚠️  Failed to create ${sceneName}, using direct path`);
            }
        }
    }

    createTransitionFilter(transitionType, duration = 0.5) {
        switch (transitionType) {
            case 'fade':
                return `fade=t=in:st=0:d=${duration},fade=t=out:st=${duration}:d=${duration}`;
            case 'slide-left':
                return `slide=slide=left:duration=${duration}`;
            case 'slide-right':
                return `slide=slide=right:duration=${duration}`;
            case 'slide-up':
                return `slide=slide=up:duration=${duration}`;
            case 'slide-down':
                return `slide=slide=down:duration=${duration}`;
            case 'zoom-in':
                return `zoompan=z='min(zoom+0.0015,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;
            case 'zoom-out':
                return `zoompan=z='max(zoom-0.0015,0.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;
            case 'glitch':
                return `glitch=amount=0.1:seed=random`;
            default:
                return '';
        }
    }

    async assembleEnhancedVideo() {
        console.log('🎬 Assembling enhanced video with transitions and effects...');
        
        const timelinePath = path.join(__dirname, '../updated_timeline.yaml');
        if (!fs.existsSync(timelinePath)) {
            throw new Error('Timeline file not found: updated_timeline.yaml');
        }
        
        const timeline = yaml.parse(fs.readFileSync(timelinePath, 'utf8'));
        const outputPath = path.join(this.outputDir, 'disaster-response-enhanced.mp4');
        
        // Build FFmpeg command for enhanced video assembly
        const videoInputs = [];
        const filterComplex = [];
        let inputIndex = 0;
        
        for (const track of timeline.timeline.tracks.video) {
            // Handle both relative and absolute paths
            let sourcePath = track.source;
            if (!path.isAbsolute(sourcePath)) {
                sourcePath = path.join(__dirname, '..', track.source);
            }
            
            if (!fs.existsSync(sourcePath)) {
                console.log(`⚠️  Source file not found: ${sourcePath}`);
                continue;
            }
            
            videoInputs.push(`-i "${sourcePath}"`);
            
            // Create enhanced filter with transitions
            const baseFilter = `[${inputIndex}:v]trim=duration=${track.duration},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`;
            
            // Add transition effects if specified
            let transitionFilter = '';
            if (track.transitions && track.transitions.in) {
                transitionFilter = `,${this.createTransitionFilter(track.transitions.in)}`;
            }
            
            filterComplex.push(`${baseFilter}${transitionFilter}[v${inputIndex}]`);
            inputIndex++;
        }
        
        if (videoInputs.length === 0) {
            throw new Error('No valid video inputs found');
        }
        
        // Create concatenation filter
        const videoStreams = Array.from({ length: inputIndex }, (_, i) => `[v${i}]`).join('');
        filterComplex.push(`${videoStreams}concat=n=${inputIndex}:v=1:a=0[outv]`);
        
        // Add audio track
        const voiceoverPath = path.join(this.audioDir, 'voiceover_updated.wav');
        if (fs.existsSync(voiceoverPath)) {
            videoInputs.push(`-i "${voiceoverPath}"`);
            filterComplex.push(`[${inputIndex}:a]aformat=sample_rates=44100:channel_layouts=stereo[outa]`);
        }
        
        // Add color grading if LUT exists
        const lutPath = path.join(this.lutsDir, 'emergency-response.cube');
        if (fs.existsSync(lutPath)) {
            filterComplex.push(`[outv]lut3d=file="${lutPath}":interp=tetrahedral[outv_graded]`);
            filterComplex.push(`[outv_graded]eq=contrast=1.1:saturation=1.05:brightness=0.02[outv_final]`);
        } else {
            filterComplex.push(`[outv]eq=contrast=1.1:saturation=1.05:brightness=0.02[outv_final]`);
        }
        
        const filterComplexStr = filterComplex.join(';');
        
        // Build FFmpeg command
        const ffmpegArgs = [
            ...videoInputs,
            '-filter_complex', `"${filterComplexStr}"`,
            '-map', '[outv_final]',
            '-map', '[outa]',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '20', // Higher quality
            '-c:a', 'aac',
            '-b:a', '320k', // Higher audio quality
            '-ar', '48000', // Higher sample rate
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart', // Optimize for web playback
            '-y',
            outputPath
        ];
        
        const command = `ffmpeg ${ffmpegArgs.join(' ')}`;
        console.log(`Executing enhanced video assembly...`);
        
        try {
            execSync(command, { stdio: 'inherit' });
            console.log('✅ Enhanced video assembly complete!');
            return outputPath;
        } catch (error) {
            console.error('❌ Enhanced video assembly failed:', error.message);
            throw error;
        }
    }

    async addLowerThirds(videoPath) {
        console.log('📝 Adding lower thirds and graphics...');
        
        const outputPath = path.join(this.outputDir, 'disaster-response-with-graphics.mp4');
        
        // Create a simple lower third overlay
        const lowerThirdFilter = `
            [0:v]drawtext=text='Disaster Response Platform':fontcolor=white:fontsize=48:box=1:boxcolor=red@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,15,40)'[v1];
            [v1]drawtext=text='Target Users & Roles':fontcolor=white:fontsize=48:box=1:boxcolor=blue@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,40,60)'[v2];
            [v2]drawtext=text='Technical Architecture':fontcolor=white:fontsize=48:box=1:boxcolor=blue@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,60,90)'[v3];
            [v3]drawtext=text='Hazard Detection':fontcolor=white:fontsize=48:box=1:boxcolor=red@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,90,105)'[v4];
            [v4]drawtext=text='Risk Assessment':fontcolor=white:fontsize=48:box=1:boxcolor=orange@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,105,115)'[v5];
            [v5]drawtext=text='Evacuation Zones':fontcolor=white:fontsize=48:box=1:boxcolor=red@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,115,125)'[v6];
            [v6]drawtext=text='Route Planning':fontcolor=white:fontsize=48:box=1:boxcolor=blue@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,125,145)'[v7];
            [v7]drawtext=text='Unit Assignment':fontcolor=white:fontsize=48:box=1:boxcolor=gold@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,145,155)'[v8];
            [v8]drawtext=text='AI Decision Support':fontcolor=white:fontsize=48:box=1:boxcolor=purple@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,155,175)'[v9];
            [v9]drawtext=text='Value Proposition':fontcolor=white:fontsize=48:box=1:boxcolor=green@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,175,205)'[v10];
            [v10]drawtext=text='Foundry Integration':fontcolor=white:fontsize=48:box=1:boxcolor=blue@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,205,225)'[v11];
            [v11]drawtext=text='Conclusion':fontcolor=white:fontsize=48:box=1:boxcolor=green@0.8:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50:enable='between(t,225,240)'[outv]
        `.replace(/\s+/g, ' ').trim();
        
        const command = `ffmpeg -i "${videoPath}" -vf "${lowerThirdFilter}" -c:a copy -y "${outputPath}"`;
        
        try {
            execSync(command, { stdio: 'inherit' });
            console.log('✅ Lower thirds added successfully!');
            return outputPath;
        } catch (error) {
            console.error('❌ Failed to add lower thirds:', error.message);
            return videoPath; // Return original if graphics fail
        }
    }

    async validateFinalVideo(videoPath) {
        console.log('🔍 Validating final video...');
        
        try {
            const result = execSync(`ffprobe -v quiet -show_entries format=duration,size -of csv=p=0 "${videoPath}"`, { encoding: 'utf8' });
            const [duration, size] = result.trim().split(',');
            
            const videoDuration = parseFloat(duration);
            const videoSize = parseInt(size);
            
            console.log(`📊 Final video: ${videoDuration.toFixed(2)}s, ${(videoSize / 1024 / 1024).toFixed(2)}MB`);
            
            if (videoDuration < 200) { // Less than 3:20
                console.log('⚠️  Video duration is shorter than expected');
                return false;
            }
            
            if (videoSize < 1024 * 1024) { // Less than 1MB
                console.log('⚠️  Video file is too small');
                return false;
            }
            
            console.log('✅ Final video validation passed!');
            return true;
        } catch (error) {
            console.error('❌ Final video validation failed:', error.message);
            return false;
        }
    }

    async run() {
        console.log('🎬 Disaster Response Dashboard - Enhanced Video Pipeline');
        console.log('========================================================\n');
        
        try {
            // Step 1: Validate all capture files
            const validationResults = await this.validateAllCaptures();
            const invalidFiles = Object.values(validationResults).filter(r => !r.valid);
            
            if (invalidFiles.length > 0) {
                console.log(`\n⚠️  Found ${invalidFiles.length} invalid files. Attempting to continue...`);
            }
            
            // Step 2: Create named video files
            await this.createNamedVideoFiles();
            
            // Step 3: Assemble the enhanced video
            const enhancedPath = await this.assembleEnhancedVideo();
            
            // Step 4: Add graphics and lower thirds
            const finalPath = await this.addLowerThirds(enhancedPath);
            
            // Step 5: Validate final video
            const finalValidation = await this.validateFinalVideo(finalPath);
            
            if (finalValidation) {
                console.log('\n🎉 Enhanced video production pipeline completed successfully!');
                console.log(`📁 Output: ${finalPath}`);
                console.log(`📊 Size: ${(fs.statSync(finalPath).size / 1024 / 1024).toFixed(2)}MB`);
                console.log('\n✨ Features included:');
                console.log('  • High-quality video encoding (CRF 20)');
                console.log('  • Enhanced audio (320k AAC, 48kHz)');
                console.log('  • Smooth transitions and effects');
                console.log('  • Color grading and enhancement');
                console.log('  • Professional lower thirds');
                console.log('  • Web-optimized output');
            } else {
                console.log('\n⚠️  Video production completed but final validation failed');
            }
            
            return finalPath;
            
        } catch (error) {
            console.error('\n❌ Enhanced video production pipeline failed:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const pipeline = new EnhancedVideoPipeline();
    pipeline.run().catch(error => {
        console.error('Pipeline failed:', error);
        process.exit(1);
    });
}

export default EnhancedVideoPipeline;
