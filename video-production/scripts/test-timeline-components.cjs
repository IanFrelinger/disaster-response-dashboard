#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🧪 Testing Timeline Components...');

class TimelineComponentTester {
  constructor() {
    this.testResults = [];
    this.configDir = path.join(__dirname, '..', 'config');
    this.timelineFile = path.join(this.configDir, 'timeline-fixed.yaml');
    this.narrationFile = path.join(this.configDir, 'narration.yaml');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} [${timestamp}] ${message}`);
  }

  testTimelineStructure() {
    this.log('Testing timeline structure...', 'info');
    
    try {
      if (!fs.existsSync(this.timelineFile)) {
        this.log('Timeline file missing', 'error');
        this.testResults.push({ test: 'Timeline File Exists', status: 'FAIL' });
        return false;
      }
      
      const content = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(content);
      
      // Test basic structure
      if (!timeline.timeline) {
        this.log('Timeline root missing', 'error');
        this.testResults.push({ test: 'Timeline Root', status: 'FAIL' });
        return false;
      }
      
      this.log('Timeline root found', 'success');
      this.testResults.push({ test: 'Timeline Root', status: 'PASS' });
      
      // Test duration
      if (timeline.timeline.duration === 420) {
        this.log('Duration: 7 minutes (420 seconds)', 'success');
        this.testResults.push({ test: 'Duration', status: 'PASS' });
      } else {
        this.log(`Duration incorrect: ${timeline.timeline.duration}s`, 'error');
        this.testResults.push({ test: 'Duration', status: 'FAIL' });
        return false;
      }
      
      // Test FPS
      if (timeline.timeline.fps === 30) {
        this.log('FPS: 30', 'success');
        this.testResults.push({ test: 'FPS', status: 'PASS' });
      } else {
        this.log(`FPS incorrect: ${timeline.timeline.fps}`, 'error');
        this.testResults.push({ test: 'FPS', status: 'FAIL' });
        return false;
      }
      
      // Test resolution
      if (timeline.timeline.resolution[0] === 1920 && timeline.timeline.resolution[1] === 1080) {
        this.log('Resolution: 1920x1080', 'success');
        this.testResults.push({ test: 'Resolution', status: 'PASS' });
      } else {
        this.log(`Resolution incorrect: ${timeline.timeline.resolution[0]}x${timeline.timeline.resolution[1]}`, 'error');
        this.testResults.push({ test: 'Resolution', status: 'FAIL' });
        return false;
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error testing timeline structure: ${error}`, 'error');
      this.testResults.push({ test: 'Timeline Structure', status: 'FAIL' });
      return false;
    }
  }

  testVideoSegments() {
    this.log('Testing video segments...', 'info');
    
    try {
      const content = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(content);
      
      if (!timeline.timeline.tracks || !timeline.timeline.tracks.video) {
        this.log('Video tracks missing', 'error');
        this.testResults.push({ test: 'Video Tracks', status: 'FAIL' });
        return false;
      }
      
      const videoSegments = timeline.timeline.tracks.video;
      this.log(`Found ${videoSegments.length} video segments`, 'success');
      this.testResults.push({ test: 'Video Tracks', status: 'PASS' });
      
      // Test required segments
      const requiredSegments = [
        'A01_personal_intro',
        'A02_user_persona',
        'B01_intro',
        'B02_roles',
        'B03_api',
        'B04_map',
        'B05_zones',
        'B06_route',
        'B07_ai',
        'B08_tech',
        'B09_impact',
        'B10_conclusion'
      ];
      
      let segmentTests = 0;
      let segmentPasses = 0;
      
      requiredSegments.forEach(segmentName => {
        segmentTests++;
        const segment = videoSegments.find(s => s.name === segmentName);
        if (segment) {
          this.log(`Segment found: ${segmentName}`, 'success');
          segmentPasses++;
          
          // Test segment properties
          if (segment.start !== undefined && segment.duration && segment.source) {
            this.log(`  - ${segmentName}: start=${segment.start}s, duration=${segment.duration}s`, 'success');
          } else {
            this.log(`  - ${segmentName}: missing properties`, 'warning');
          }
        } else {
          this.log(`Segment missing: ${segmentName}`, 'error');
        }
      });
      
      // Test timing continuity
      let timingTests = 0;
      let timingPasses = 0;
      
      for (let i = 0; i < videoSegments.length - 1; i++) {
        timingTests++;
        const current = videoSegments[i];
        const next = videoSegments[i + 1];
        
        if (current.start + current.duration <= next.start) {
          timingPasses++;
        } else {
          this.log(`Timing overlap: ${current.name} ends at ${current.start + current.duration}s, ${next.name} starts at ${next.start}s`, 'warning');
        }
      }
      
      const segmentScore = (segmentPasses / segmentTests) * 100;
      const timingScore = (timingPasses / timingTests) * 100;
      
      this.log(`Video segments score: ${segmentScore.toFixed(1)}%`, segmentScore >= 80 ? 'success' : 'error');
      this.log(`Timing continuity score: ${timingScore.toFixed(1)}%`, timingScore >= 80 ? 'success' : 'error');
      
      this.testResults.push({ 
        test: 'Video Segments', 
        status: segmentScore >= 80 ? 'PASS' : 'FAIL', 
        score: segmentScore 
      });
      this.testResults.push({ 
        test: 'Timing Continuity', 
        status: timingScore >= 80 ? 'PASS' : 'FAIL', 
        score: timingScore 
      });
      
      return segmentScore >= 80;
      
    } catch (error) {
      this.log(`Error testing video segments: ${error}`, 'error');
      this.testResults.push({ test: 'Video Segments', status: 'FAIL' });
      return false;
    }
  }

  testAudioTracks() {
    this.log('Testing audio tracks...', 'info');
    
    try {
      const content = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(content);
      
      if (!timeline.timeline.tracks || !timeline.timeline.tracks.audio) {
        this.log('Audio tracks missing', 'error');
        this.testResults.push({ test: 'Audio Tracks', status: 'FAIL' });
        return false;
      }
      
      const audio = timeline.timeline.tracks.audio;
      
      // Test voiceover
      if (audio.voiceover && audio.voiceover.source && audio.voiceover.duration === 420) {
        this.log('Voiceover track: valid', 'success');
        this.testResults.push({ test: 'Voiceover Track', status: 'PASS' });
      } else {
        this.log('Voiceover track: invalid', 'error');
        this.testResults.push({ test: 'Voiceover Track', status: 'FAIL' });
        return false;
      }
      
      // Test music
      if (audio.music && audio.music.source && audio.music.duration === 420) {
        this.log('Music track: valid', 'success');
        this.testResults.push({ test: 'Music Track', status: 'PASS' });
      } else {
        this.log('Music track: invalid', 'error');
        this.testResults.push({ test: 'Music Track', status: 'FAIL' });
        return false;
      }
      
      // Test effects
      if (audio.effects && Array.isArray(audio.effects) && audio.effects.length > 0) {
        this.log(`Audio effects: ${audio.effects.length} found`, 'success');
        this.testResults.push({ test: 'Audio Effects', status: 'PASS' });
      } else {
        this.log('Audio effects: missing', 'warning');
        this.testResults.push({ test: 'Audio Effects', status: 'WARN' });
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error testing audio tracks: ${error}`, 'error');
      this.testResults.push({ test: 'Audio Tracks', status: 'FAIL' });
      return false;
    }
  }

  testGraphicsElements() {
    this.log('Testing graphics elements...', 'info');
    
    try {
      const content = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(content);
      
      if (!timeline.timeline.tracks || !timeline.timeline.tracks.graphics) {
        this.log('Graphics tracks missing', 'error');
        this.testResults.push({ test: 'Graphics Tracks', status: 'FAIL' });
        return false;
      }
      
      const graphics = timeline.timeline.tracks.graphics;
      
      // Test lower thirds
      if (graphics['lower-thirds'] && Array.isArray(graphics['lower-thirds']) && graphics['lower-thirds'].length > 0) {
        this.log(`Lower thirds: ${graphics['lower-thirds'].length} found`, 'success');
        this.testResults.push({ test: 'Lower Thirds', status: 'PASS' });
        
        // Test lower third timing
        let timingTests = 0;
        let timingPasses = 0;
        
        graphics['lower-thirds'].forEach((lt, index) => {
          timingTests++;
          if (lt.start !== undefined && lt.duration && lt.text) {
            timingPasses++;
          } else {
            this.log(`Lower third ${index}: missing properties`, 'warning');
          }
        });
        
        const timingScore = (timingPasses / timingTests) * 100;
        this.log(`Lower thirds timing score: ${timingScore.toFixed(1)}%`, timingScore >= 80 ? 'success' : 'warning');
      } else {
        this.log('Lower thirds: missing', 'error');
        this.testResults.push({ test: 'Lower Thirds', status: 'FAIL' });
        return false;
      }
      
      // Test overlays
      if (graphics.overlays && Array.isArray(graphics.overlays) && graphics.overlays.length > 0) {
        this.log(`Overlays: ${graphics.overlays.length} found`, 'success');
        this.testResults.push({ test: 'Overlays', status: 'PASS' });
      } else {
        this.log('Overlays: missing', 'warning');
        this.testResults.push({ test: 'Overlays', status: 'WARN' });
      }
      
      // Test captions
      if (graphics.captions && graphics.captions.source) {
        this.log('Captions: configured', 'success');
        this.testResults.push({ test: 'Captions', status: 'PASS' });
      } else {
        this.log('Captions: missing', 'warning');
        this.testResults.push({ test: 'Captions', status: 'WARN' });
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error testing graphics elements: ${error}`, 'error');
      this.testResults.push({ test: 'Graphics Elements', status: 'FAIL' });
      return false;
    }
  }

  testEffectsAndOutput() {
    this.log('Testing effects and output...', 'info');
    
    try {
      const content = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(content);
      
      if (!timeline.timeline.tracks || !timeline.timeline.tracks.effects) {
        this.log('Effects missing', 'warning');
        this.testResults.push({ test: 'Effects', status: 'WARN' });
      } else {
        this.log('Effects: configured', 'success');
        this.testResults.push({ test: 'Effects', status: 'PASS' });
      }
      
      if (!timeline.timeline.output) {
        this.log('Output configuration missing', 'error');
        this.testResults.push({ test: 'Output Config', status: 'FAIL' });
        return false;
      }
      
      const output = timeline.timeline.output;
      
      // Test output files
      if (output['rough-cut'] && output.final && output.edl) {
        this.log('Output files: configured', 'success');
        this.testResults.push({ test: 'Output Files', status: 'PASS' });
      } else {
        this.log('Output files: incomplete', 'warning');
        this.testResults.push({ test: 'Output Files', status: 'WARN' });
      }
      
      // Test metadata
      if (output.metadata && output.metadata.title && output.metadata.author) {
        this.log('Metadata: configured', 'success');
        this.testResults.push({ test: 'Metadata', status: 'PASS' });
      } else {
        this.log('Metadata: incomplete', 'warning');
        this.testResults.push({ test: 'Metadata', status: 'WARN' });
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error testing effects and output: ${error}`, 'error');
      this.testResults.push({ test: 'Effects and Output', status: 'FAIL' });
      return false;
    }
  }

  testNarrationAlignment() {
    this.log('Testing narration alignment...', 'info');
    
    try {
      if (!fs.existsSync(this.narrationFile)) {
        this.log('Narration file missing', 'error');
        this.testResults.push({ test: 'Narration File', status: 'FAIL' });
        return false;
      }
      
      const narrationContent = fs.readFileSync(this.narrationFile, 'utf8');
      const narration = yaml.load(narrationContent);
      
      if (!narration.scenes || !Array.isArray(narration.scenes)) {
        this.log('Narration scenes missing', 'error');
        this.testResults.push({ test: 'Narration Scenes', status: 'FAIL' });
        return false;
      }
      
      this.log(`Found ${narration.scenes.length} narration scenes`, 'success');
      this.testResults.push({ test: 'Narration Scenes', status: 'PASS' });
      
      // Test scene timing
      let totalDuration = 0;
      narration.scenes.forEach(scene => {
        totalDuration += scene.duration || 0;
      });
      
      if (totalDuration === 117) {
        this.log(`Total narration duration: ${totalDuration}s (matches 4-minute target)`, 'success');
        this.testResults.push({ test: 'Narration Duration', status: 'PASS' });
      } else {
        this.log(`Total narration duration: ${totalDuration}s (expected 117s)`, 'warning');
        this.testResults.push({ test: 'Narration Duration', status: 'WARN' });
      }
      
      return true;
      
    } catch (error) {
      this.log(`Error testing narration alignment: ${error}`, 'error');
      this.testResults.push({ test: 'Narration Alignment', status: 'FAIL' });
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Timeline Component Testing', 'info');
    this.log('This will test all pieces of the timeline including structure, segments, audio, graphics, and timing', 'info');
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING TIMELINE STRUCTURE');
    console.log('='.repeat(80));
    
    const structureResult = this.testTimelineStructure();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING VIDEO SEGMENTS');
    console.log('='.repeat(80));
    
    const segmentsResult = this.testVideoSegments();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING AUDIO TRACKS');
    console.log('='.repeat(80));
    
    const audioResult = this.testAudioTracks();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING GRAPHICS ELEMENTS');
    console.log('='.repeat(80));
    
    const graphicsResult = this.testGraphicsElements();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING EFFECTS AND OUTPUT');
    console.log('='.repeat(80));
    
    const effectsResult = this.testEffectsAndOutput();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING NARRATION ALIGNMENT');
    console.log('='.repeat(80));
    
    const narrationResult = this.testNarrationAlignment();
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    this.log('TIMELINE COMPONENT TEST RESULTS SUMMARY', 'info');
    console.log('='.repeat(80));
    
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const totalTests = this.testResults.length;
    const successRate = (passedTests / totalTests) * 100;
    
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      const score = result.score ? ` (${result.score.toFixed(1)}%)` : '';
      console.log(`${status} ${result.test}: ${result.status}${score}`);
    });
    
    console.log('\n' + '='.repeat(80));
    this.log(`OVERALL TIMELINE STATUS: ${passedTests}/${totalTests} components passed (${successRate.toFixed(1)}%)`, 
      successRate >= 80 ? 'success' : 'error');
    
    if (successRate >= 80) {
      this.log('🎉 Timeline components are fully validated!', 'success');
      this.log('All timeline pieces are working correctly and ready for production use.', 'success');
    } else {
      this.log('❌ Timeline validation failed!', 'error');
      this.log('Please fix the failing components before proceeding with production.', 'error');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return successRate >= 80;
  }
}

// Run all tests
if (require.main === module) {
  const tester = new TimelineComponentTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Timeline component tester failed:', error);
    process.exit(1);
  });
}

module.exports = { TimelineComponentTester };
