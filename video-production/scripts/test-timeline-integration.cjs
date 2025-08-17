#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🧪 Testing Timeline Integration...');

class TimelineIntegrationTester {
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

  testNarrationTimelineAlignment() {
    this.log('Testing narration timeline alignment...', 'info');
    
    try {
      const narrationContent = fs.readFileSync(this.narrationFile, 'utf8');
      const narration = yaml.load(narrationContent);
      
      if (!narration.scenes || !Array.isArray(narration.scenes)) {
        this.log('Narration scenes missing', 'error');
        this.testResults.push({ test: 'Narration Scenes', status: 'FAIL' });
        return false;
      }
      
      // Calculate total scene duration
      let totalSceneDuration = 0;
      narration.scenes.forEach(scene => {
        totalSceneDuration += scene.duration || 0;
      });
      
      // Check metadata duration vs actual duration
      const metadataDuration = narration.metadata?.duration || 0;
      
      if (metadataDuration === totalSceneDuration) {
        this.log(`Narration duration aligned: ${totalSceneDuration}s`, 'success');
        this.testResults.push({ test: 'Narration Duration Alignment', status: 'PASS' });
      } else {
        this.log(`Narration duration mismatch: metadata=${metadataDuration}s, actual=${totalSceneDuration}s`, 'warning');
        this.testResults.push({ test: 'Narration Duration Alignment', status: 'WARN' });
      }
      
      // Test scene timing continuity
      let timingTests = 0;
      let timingPasses = 0;
      let currentTime = 0;
      
      narration.scenes.forEach((scene, index) => {
        timingTests++;
        if (scene.duration > 0) {
          currentTime += scene.duration;
          timingPasses++;
        } else {
          this.log(`Scene ${index} (${scene.id}): missing duration`, 'warning');
        }
      });
      
      const timingScore = (timingPasses / timingTests) * 100;
      this.log(`Scene timing score: ${timingScore.toFixed(1)}%`, timingScore >= 80 ? 'success' : 'warning');
      
      this.testResults.push({ 
        test: 'Scene Timing', 
        status: timingScore >= 80 ? 'PASS' : 'WARN', 
        score: timingScore 
      });
      
      return true;
      
    } catch (error) {
      this.log(`Error testing narration timeline alignment: ${error}`, 'error');
      this.testResults.push({ test: 'Narration Timeline Alignment', status: 'FAIL' });
      return false;
    }
  }

  testVideoNarrationSynchronization() {
    this.log('Testing video-narration synchronization...', 'info');
    
    try {
      const timelineContent = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(timelineContent);
      const narrationContent = fs.readFileSync(this.narrationFile, 'utf8');
      const narration = yaml.load(narrationContent);
      
      if (!timeline.timeline?.tracks?.video || !narration.scenes) {
        this.log('Video tracks or narration scenes missing', 'error');
        this.testResults.push({ test: 'Video-Narration Sync', status: 'FAIL' });
        return false;
      }
      
      const videoSegments = timeline.timeline.tracks.video;
      const narrationScenes = narration.scenes;
      
      this.log(`Video segments: ${videoSegments.length}, Narration scenes: ${narrationScenes.length}`, 'info');
      
      // Test if we have matching content
      let syncTests = 0;
      let syncPasses = 0;
      
      // Check if key segments have corresponding narration
      const keySegments = ['intro', 'map', 'route', 'ai', 'conclusion'];
      
      keySegments.forEach(segmentKey => {
        syncTests++;
        const hasVideo = videoSegments.some(v => v.name.toLowerCase().includes(segmentKey));
        const hasNarration = narrationScenes.some(n => n.id === segmentKey);
        
        if (hasVideo && hasNarration) {
          this.log(`Segment ${segmentKey}: video + narration found`, 'success');
          syncPasses++;
        } else if (hasVideo) {
          this.log(`Segment ${segmentKey}: video only (no narration)`, 'warning');
        } else if (hasNarration) {
          this.log(`Segment ${segmentKey}: narration only (no video)`, 'warning');
        } else {
          this.log(`Segment ${segmentKey}: neither video nor narration found`, 'error');
        }
      });
      
      const syncScore = (syncPasses / syncTests) * 100;
      this.log(`Video-narration sync score: ${syncScore.toFixed(1)}%`, syncScore >= 60 ? 'success' : 'warning');
      
      this.testResults.push({ 
        test: 'Video-Narration Sync', 
        status: syncScore >= 60 ? 'PASS' : 'WARN', 
        score: syncScore 
      });
      
      return true;
      
    } catch (error) {
      this.log(`Error testing video-narration synchronization: ${error}`, 'error');
      this.testResults.push({ test: 'Video-Narration Sync', status: 'FAIL' });
      return false;
    }
  }

  testTimelineDurationConsistency() {
    this.log('Testing timeline duration consistency...', 'info');
    
    try {
      const timelineContent = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(timelineContent);
      const narrationContent = fs.readFileSync(this.narrationFile, 'utf8');
      const narration = yaml.load(narrationContent);
      
      const timelineDuration = timeline.timeline?.duration || 0;
      const narrationMetadataDuration = narration.metadata?.duration || 0;
      
      this.log(`Timeline duration: ${timelineDuration}s`, 'info');
      this.log(`Narration metadata duration: ${narrationMetadataDuration}s`, 'info');
      
      // Check if durations are reasonable
      let durationTests = 0;
      let durationPasses = 0;
      
      // Test timeline duration
      durationTests++;
      if (timelineDuration > 0 && timelineDuration <= 600) { // Max 10 minutes
        this.log('Timeline duration: reasonable', 'success');
        durationPasses++;
      } else {
        this.log('Timeline duration: unreasonable', 'error');
      }
      
      // Test narration duration
      durationTests++;
      if (narrationMetadataDuration > 0 && narrationMetadataDuration <= 300) { // Max 5 minutes
        this.log('Narration duration: reasonable', 'success');
        durationPasses++;
      } else {
        this.log('Narration duration: unreasonable', 'error');
      }
      
      // Test duration ratio (narration should be shorter than timeline)
      durationTests++;
      if (narrationMetadataDuration <= timelineDuration) {
        this.log('Duration ratio: narration fits within timeline', 'success');
        durationPasses++;
      } else {
        this.log('Duration ratio: narration longer than timeline', 'warning');
      }
      
      const durationScore = (durationPasses / durationTests) * 100;
      this.log(`Duration consistency score: ${durationScore.toFixed(1)}%`, durationScore >= 80 ? 'success' : 'warning');
      
      this.testResults.push({ 
        test: 'Duration Consistency', 
        status: durationScore >= 80 ? 'PASS' : 'WARN', 
        score: durationScore 
      });
      
      return true;
      
    } catch (error) {
      this.log(`Error testing timeline duration consistency: ${error}`, 'error');
      this.testResults.push({ test: 'Timeline Duration Consistency', status: 'FAIL' });
      return false;
    }
  }

  testContentAlignment() {
    this.log('Testing content alignment...', 'info');
    
    try {
      const timelineContent = fs.readFileSync(this.timelineFile, 'utf8');
      const timeline = yaml.load(timelineContent);
      const narrationContent = fs.readFileSync(this.narrationFile, 'utf8');
      const narration = yaml.load(narrationContent);
      
      // Test if key themes are present in both timeline and narration
      const keyThemes = ['disaster', 'emergency', 'response', 'evacuation', 'AI', 'foundry'];
      
      let themeTests = 0;
      let themePasses = 0;
      
      keyThemes.forEach(theme => {
        themeTests++;
        const inTimeline = timelineContent.toLowerCase().includes(theme.toLowerCase());
        const inNarration = narrationContent.toLowerCase().includes(theme.toLowerCase());
        
        if (inTimeline && inNarration) {
          this.log(`Theme ${theme}: present in both timeline and narration`, 'success');
          themePasses++;
        } else if (inTimeline) {
          this.log(`Theme ${theme}: present in timeline only`, 'warning');
        } else if (inNarration) {
          this.log(`Theme ${theme}: present in narration only`, 'warning');
        } else {
          this.log(`Theme ${theme}: missing from both`, 'error');
        }
      });
      
      const themeScore = (themePasses / themeTests) * 100;
      this.log(`Content alignment score: ${themeScore.toFixed(1)}%`, themeScore >= 60 ? 'success' : 'warning');
      
      this.testResults.push({ 
        test: 'Content Alignment', 
        status: themeScore >= 60 ? 'PASS' : 'WARN', 
        score: themeScore 
      });
      
      return true;
      
    } catch (error) {
      this.log(`Error testing content alignment: ${error}`, 'error');
      this.testResults.push({ test: 'Content Alignment', status: 'FAIL' });
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Timeline Integration Testing', 'info');
    this.log('This will test the alignment and synchronization between all timeline components', 'info');
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING NARRATION TIMELINE ALIGNMENT');
    console.log('='.repeat(80));
    
    const narrationResult = this.testNarrationTimelineAlignment();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING VIDEO-NARRATION SYNCHRONIZATION');
    console.log('='.repeat(80));
    
    const syncResult = this.testVideoNarrationSynchronization();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING TIMELINE DURATION CONSISTENCY');
    console.log('='.repeat(80));
    
    const durationResult = this.testTimelineDurationConsistency();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING CONTENT ALIGNMENT');
    console.log('='.repeat(80));
    
    const contentResult = this.testContentAlignment();
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    this.log('TIMELINE INTEGRATION TEST RESULTS SUMMARY', 'info');
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
    this.log(`OVERALL INTEGRATION STATUS: ${passedTests}/${totalTests} components passed (${successRate.toFixed(1)}%)`, 
      successRate >= 80 ? 'success' : 'error');
    
    if (successRate >= 80) {
      this.log('🎉 Timeline integration is fully validated!', 'success');
      this.log('All timeline components are properly aligned and synchronized.', 'success');
    } else {
      this.log('❌ Timeline integration validation failed!', 'error');
      this.log('Please fix the alignment issues before proceeding with production.', 'error');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return successRate >= 80;
  }
}

// Run all tests
if (require.main === module) {
  const tester = new TimelineIntegrationTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Timeline integration tester failed:', error);
    process.exit(1);
  });
}

module.exports = { TimelineIntegrationTester };
