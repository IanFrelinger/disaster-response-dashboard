#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface QualityStandards {
  overallScore: number; // 0-100
  technicalAccuracy: number; // 0-100
  visualQuality: number; // 0-100
  pacing: number; // 0-100
  engagement: number; // 0-100
  duration: {
    min: number;
    max: number;
    target: number;
  };
  content: {
    requiredTopics: string[];
    forbiddenTopics: string[];
    technicalDepth: 'basic' | 'intermediate' | 'advanced';
  };
}

interface BeatValidation {
  beatId: string;
  name: string;
  duration: number;
  score: number;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  passes: boolean;
  needsRework: boolean;
}

interface VideoValidation {
  overallScore: number;
  beatScores: BeatValidation[];
  totalDuration: number;
  technicalAccuracy: number;
  visualQuality: number;
  pacing: number;
  engagement: number;
  meetsStandards: boolean;
  criticalIssues: string[];
  improvementAreas: string[];
  recommendations: string[];
}

interface IterationPlan {
  iteration: number;
  timestamp: string;
  beatsToRework: string[];
  newBeatsToCreate: string[];
  existingBeatsToModify: BeatModification[];
  qualityTargets: Partial<QualityStandards>;
}

interface BeatModification {
  beatId: string;
  modifications: {
    duration?: number;
    content?: string;
    pacing?: 'slower' | 'faster' | 'maintain';
    technicalDepth?: 'basic' | 'intermediate' | 'advanced';
  };
  reason: string;
}

class EnhancedCriticBot {
  private projectRoot: string;
  private outputDir: string;
  private configDir: string;
  private iterationsDir: string;
  private qualityStandards!: QualityStandards;
  private maxIterations: number;
  private currentIteration: number;

  constructor() {
    // Use process.cwd() instead of import.meta.url for compatibility
    this.projectRoot = process.cwd();
    this.outputDir = path.join(this.projectRoot, 'out');
    this.configDir = path.join(this.projectRoot, 'config');
    this.iterationsDir = path.join(this.projectRoot, 'iterations');
    this.maxIterations = 10;
    this.currentIteration = 1;
    this.ensureDirectories();
    this.initializeQualityStandards();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.configDir, this.iterationsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private initializeQualityStandards(): void {
    this.qualityStandards = {
      overallScore: 85, // Minimum overall score required
      technicalAccuracy: 90, // High technical accuracy required
      visualQuality: 80, // Good visual quality
      pacing: 85, // Good pacing
      engagement: 80, // Engaging content
      duration: {
        min: 300, // 5 minutes minimum
        max: 600, // 10 minutes maximum
        target: 420 // 7 minutes target
      },
      content: {
        requiredTopics: [
          'disaster response',
          'AI decision support',
          'real-time monitoring',
          'evacuation planning',
          'hazard management'
        ],
        forbiddenTopics: [
          'confidential information',
          'unreleased features',
          'internal processes'
        ],
        technicalDepth: 'intermediate'
      }
    };
  }

  async validateIndividualBeat(beatPath: string): Promise<BeatValidation> {
    console.log(`🔍 Validating beat: ${path.basename(beatPath)}`);
    
    const beatId = path.basename(beatPath, path.extname(beatPath));
    const beatName = this.extractBeatName(beatPath);
    
    // Analyze video file properties
    const videoInfo = await this.analyzeVideoFile(beatPath);
    
    // Validate beat content and quality
    const validation = await this.validateBeatContent(beatPath, videoInfo);
    
    // Calculate overall score
    const score = this.calculateBeatScore(validation, videoInfo);
    
    // Determine if beat passes standards
    const passes = score >= this.qualityStandards.overallScore;
    const needsRework = score < (this.qualityStandards.overallScore - 10);
    
    const beatValidation: BeatValidation = {
      beatId,
      name: beatName,
      duration: videoInfo.duration,
      score,
      issues: validation.issues,
      warnings: validation.warnings,
      suggestions: validation.suggestions,
      passes,
      needsRework
    };

    console.log(`✅ Beat validation complete: ${score}/100 (${passes ? 'PASS' : 'FAIL'})`);
    
    return beatValidation;
  }

  private async analyzeVideoFile(videoPath: string): Promise<{
    duration: number;
    resolution: string;
    bitrate: number;
    framerate: number;
    audioQuality: string;
  }> {
    try {
      // Use ffprobe to analyze video file
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`);
      const videoData = JSON.parse(stdout);
      
      const videoStream = videoData.streams.find((s: any) => s.codec_type === 'video');
      const audioStream = videoData.streams.find((s: any) => s.codec_type === 'audio');
      
      return {
        duration: parseFloat(videoData.format.duration),
        resolution: `${videoStream?.width || 0}x${videoStream?.height || 0}`,
        bitrate: parseInt(videoData.format.bit_rate) / 1000, // kbps
        framerate: eval(videoStream?.r_frame_rate || '0'),
        audioQuality: audioStream?.codec_name || 'unknown'
      };
    } catch (error) {
      console.warn(`⚠️  Could not analyze video file: ${error}`);
      return {
        duration: 0,
        resolution: 'unknown',
        bitrate: 0,
        framerate: 0,
        audioQuality: 'unknown'
      };
    }
  }

  private async validateBeatContent(beatPath: string, videoInfo: any): Promise<{
    issues: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Duration validation
    if (videoInfo.duration < 5) {
      issues.push('Beat duration too short (less than 5 seconds)');
    } else if (videoInfo.duration > 120) {
      warnings.push('Beat duration very long (over 2 minutes)');
    }

    // Resolution validation
    if (videoInfo.resolution !== '1920x1080') {
      warnings.push(`Non-standard resolution: ${videoInfo.resolution}`);
    }

    // Bitrate validation
    if (videoInfo.bitrate < 1000) {
      warnings.push('Low bitrate may affect video quality');
    }

    // Framerate validation
    if (videoInfo.framerate < 24) {
      warnings.push('Low framerate may cause choppy playback');
    }

    // Content suggestions
    if (videoInfo.duration > 30) {
      suggestions.push('Consider breaking long beat into smaller segments');
    }

    return { issues, warnings, suggestions };
  }

  private calculateBeatScore(validation: any, videoInfo: any): number {
    let score = 100;
    
    // Deduct points for issues
    score -= validation.issues.length * 15;
    
    // Deduct points for warnings
    score -= validation.warnings.length * 5;
    
    // Bonus for optimal duration
    if (videoInfo.duration >= 10 && videoInfo.duration <= 30) {
      score += 10;
    }
    
    // Bonus for high quality
    if (videoInfo.bitrate >= 2000) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  async validateCombinedVideo(videoPath: string, beatValidations: BeatValidation[]): Promise<VideoValidation> {
    console.log('🎬 Validating combined video...');
    
    const videoInfo = await this.analyzeVideoFile(videoPath);
    const totalDuration = videoInfo.duration;
    
    // Calculate aggregate scores
    const beatScores = beatValidations;
    const averageBeatScore = beatScores.reduce((sum, beat) => sum + beat.score, 0) / beatScores.length;
    
    // Validate overall video quality
    const technicalAccuracy = this.calculateTechnicalAccuracy(beatScores, videoInfo);
    const visualQuality = this.calculateVisualQuality(videoInfo);
    const pacing = this.calculatePacing(beatScores, totalDuration);
    const engagement = this.calculateEngagement(beatScores);
    
    // Calculate overall score
    const overallScore = Math.round(
      (technicalAccuracy + visualQuality + pacing + engagement) / 4
    );
    
    // Determine if video meets standards
    const meetsStandards = this.videoMeetsStandards({
      overallScore,
      technicalAccuracy,
      visualQuality,
      pacing,
      engagement,
      totalDuration
    });
    
    // Generate improvement recommendations
    const { criticalIssues, improvementAreas, recommendations } = this.generateRecommendations({
      overallScore,
      beatScores,
      videoInfo,
      meetsStandards
    });
    
    const videoValidation: VideoValidation = {
      overallScore,
      beatScores,
      totalDuration,
      technicalAccuracy,
      visualQuality,
      pacing,
      engagement,
      meetsStandards,
      criticalIssues,
      improvementAreas,
      recommendations
    };

    console.log(`🎯 Combined video validation complete: ${overallScore}/100 (${meetsStandards ? 'MEETS STANDARDS' : 'NEEDS IMPROVEMENT'})`);
    
    return videoValidation;
  }

  private calculateTechnicalAccuracy(beatScores: BeatValidation[], videoInfo: any): number {
    // Weight beat scores by duration
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    for (const beat of beatScores) {
      const weight = beat.duration;
      totalWeightedScore += beat.score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  }

  private calculateVisualQuality(videoInfo: any): number {
    let score = 100;
    
    // Resolution scoring
    if (videoInfo.resolution === '1920x1080') {
      score += 10;
    } else if (videoInfo.resolution === '1280x720') {
      score += 5;
    } else {
      score -= 20;
    }
    
    // Bitrate scoring
    if (videoInfo.bitrate >= 2000) {
      score += 10;
    } else if (videoInfo.bitrate >= 1000) {
      score += 5;
    } else {
      score -= 15;
    }
    
    // Framerate scoring
    if (videoInfo.framerate >= 30) {
      score += 5;
    } else if (videoInfo.framerate < 24) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculatePacing(beatScores: BeatValidation[], totalDuration: number): number {
    let score = 100;
    
    // Duration scoring
    if (totalDuration >= this.qualityStandards.duration.min && 
        totalDuration <= this.qualityStandards.duration.max) {
      score += 10;
    } else if (totalDuration < this.qualityStandards.duration.min) {
      score -= 20;
    } else {
      score -= 15;
    }
    
    // Beat distribution scoring
    const longBeats = beatScores.filter(beat => beat.duration > 60);
    const shortBeats = beatScores.filter(beat => beat.duration < 5);
    
    if (longBeats.length > 2) {
      score -= 10;
    }
    if (shortBeats.length > 3) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateEngagement(beatScores: BeatValidation[]): number {
    let score = 100;
    
    // Failed beats significantly reduce engagement
    const failedBeats = beatScores.filter(beat => !beat.passes);
    score -= failedBeats.length * 15;
    
    // Low-scoring beats reduce engagement
    const lowScoringBeats = beatScores.filter(beat => beat.score < 70);
    score -= lowScoringBeats.length * 8;
    
    // Variety in beat scores suggests good engagement
    const scoreRange = Math.max(...beatScores.map(b => b.score)) - Math.min(...beatScores.map(b => b.score));
    if (scoreRange > 20) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private videoMeetsStandards(metrics: any): boolean {
    return (
      metrics.overallScore >= this.qualityStandards.overallScore &&
      metrics.technicalAccuracy >= this.qualityStandards.technicalAccuracy &&
      metrics.visualQuality >= this.qualityStandards.visualQuality &&
      metrics.pacing >= this.qualityStandards.pacing &&
      metrics.engagement >= this.qualityStandards.engagement &&
      metrics.totalDuration >= this.qualityStandards.duration.min &&
      metrics.totalDuration <= this.qualityStandards.duration.max
    );
  }

  private generateRecommendations(validation: any): {
    criticalIssues: string[];
    improvementAreas: string[];
    recommendations: string[];
  } {
    const criticalIssues: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    // Critical issues
    if (validation.overallScore < 70) {
      criticalIssues.push('Overall quality below acceptable threshold');
    }
    if (validation.videoInfo.duration < this.qualityStandards.duration.min) {
      criticalIssues.push('Video too short to meet requirements');
    }
    if (validation.videoInfo.duration > this.qualityStandards.duration.max) {
      criticalIssues.push('Video too long for target audience');
    }

    // Improvement areas
    if (validation.technicalAccuracy < this.qualityStandards.technicalAccuracy) {
      improvementAreas.push('Technical accuracy needs improvement');
    }
    if (validation.visualQuality < this.qualityStandards.visualQuality) {
      improvementAreas.push('Visual quality needs enhancement');
    }
    if (validation.pacing < this.qualityStandards.pacing) {
      improvementAreas.push('Pacing needs adjustment');
    }

    // Specific recommendations
    const failedBeats = validation.beatScores.filter((beat: any) => !beat.passes);
    if (failedBeats.length > 0) {
      recommendations.push(`Rework ${failedBeats.length} failed beats`);
    }

    const lowScoringBeats = validation.beatScores.filter((beat: any) => beat.score < 80);
    if (lowScoringBeats.length > 0) {
      recommendations.push(`Improve ${lowScoringBeats.length} low-scoring beats`);
    }

    if (validation.videoInfo.bitrate < 1500) {
      recommendations.push('Increase video bitrate for better quality');
    }

    return { criticalIssues, improvementAreas, recommendations };
  }

  async createIterationPlan(videoValidation: VideoValidation): Promise<IterationPlan> {
    console.log('📋 Creating iteration plan...');
    
    const beatsToRework = videoValidation.beatScores
      .filter(beat => beat.needsRework)
      .map(beat => beat.beatId);
    
    const newBeatsToCreate: string[] = [];
    const existingBeatsToModify: BeatModification[] = [];
    
    // Identify beats that need modification
    for (const beat of videoValidation.beatScores) {
      if (beat.score < 80 && beat.score >= 60) {
        existingBeatsToModify.push({
          beatId: beat.beatId,
          modifications: {
            duration: beat.duration < 10 ? 15 : undefined,
            pacing: beat.duration > 60 ? 'faster' : 'maintain',
            technicalDepth: this.qualityStandards.content.technicalDepth
          },
          reason: `Score ${beat.score}/100 - needs improvement`
        });
      }
    }
    
    // Determine quality targets for next iteration
    const qualityTargets: Partial<QualityStandards> = {};
    if (videoValidation.overallScore < this.qualityStandards.overallScore) {
      qualityTargets.overallScore = Math.min(100, this.qualityStandards.overallScore + 5);
    }
    
    const iterationPlan: IterationPlan = {
      iteration: this.currentIteration + 1,
      timestamp: new Date().toISOString(),
      beatsToRework,
      newBeatsToCreate,
      existingBeatsToModify,
      qualityTargets
    };

    // Save iteration plan
    const planPath = path.join(this.iterationsDir, `iteration-${this.currentIteration + 1}-plan.json`);
    fs.writeFileSync(planPath, JSON.stringify(iterationPlan, null, 2));
    
    console.log(`✅ Iteration plan created: ${planPath}`);
    
    return iterationPlan;
  }

  async runQualityIteration(): Promise<boolean> {
    console.log(`🔄 Starting quality iteration ${this.currentIteration}...`);
    
    try {
      // Find all beat files
      const beatFiles = this.findBeatFiles();
      if (beatFiles.length === 0) {
        console.log('❌ No beat files found');
        return false;
      }
      
      // Validate individual beats
      const beatValidations: BeatValidation[] = [];
      for (const beatFile of beatFiles) {
        const validation = await this.validateIndividualBeat(beatFile);
        beatValidations.push(validation);
      }
      
      // Find combined video
      const combinedVideo = this.findCombinedVideo();
      if (!combinedVideo) {
        console.log('❌ Combined video not found');
        return false;
      }
      
      // Validate combined video
      const videoValidation = await this.validateCombinedVideo(combinedVideo, beatValidations);
      
      // Save validation results
      const validationPath = path.join(this.iterationsDir, `iteration-${this.currentIteration}-validation.json`);
      fs.writeFileSync(validationPath, JSON.stringify(videoValidation, null, 2));
      
      // Check if standards are met
      if (videoValidation.meetsStandards) {
        console.log('🎉 Video meets quality standards!');
        return true;
      }
      
      // Create iteration plan for improvements
      const iterationPlan = await this.createIterationPlan(videoValidation);
      
      // Check if max iterations reached
      if (this.currentIteration >= this.maxIterations) {
        console.log(`⚠️  Maximum iterations (${this.maxIterations}) reached`);
        return false;
      }
      
      // Increment iteration counter
      this.currentIteration++;
      
      console.log(`🔄 Ready for iteration ${this.currentIteration}`);
      return false;
      
    } catch (error) {
      console.error('❌ Error in quality iteration:', error);
      return false;
    }
  }

  private findBeatFiles(): string[] {
    const beatDir = path.join(this.outputDir, 'beats');
    if (!fs.existsSync(beatDir)) {
      return [];
    }
    
    return fs.readdirSync(beatDir)
      .filter(file => file.endsWith('.mp4'))
      .map(file => path.join(beatDir, file));
  }

  private findCombinedVideo(): string | null {
    const combinedVideos = [
      path.join(this.outputDir, 'final-video.mp4'),
      path.join(this.outputDir, 'combined-video.mp4'),
      path.join(this.outputDir, 'output.mp4')
    ];
    
    for (const video of combinedVideos) {
      if (fs.existsSync(video)) {
        return video;
      }
    }
    
    return null;
  }

  private extractBeatName(beatPath: string): string {
    const filename = path.basename(beatPath, path.extname(beatPath));
    return filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async runContinuousQualityLoop(): Promise<void> {
    console.log('🚀 Starting continuous quality improvement loop...');
    console.log(`🎯 Target quality score: ${this.qualityStandards.overallScore}/100`);
    console.log(`⏱️  Duration target: ${this.qualityStandards.duration.target}s`);
    console.log('');
    
    let iteration = 1;
    let standardsMet = false;
    
    while (iteration <= this.maxIterations && !standardsMet) {
      console.log(`\n🔄 Iteration ${iteration}/${this.maxIterations}`);
      console.log('=' .repeat(50));
      
      // Run quality iteration
      standardsMet = await this.runQualityIteration();
      
      if (standardsMet) {
        console.log('\n🎉 SUCCESS: Video meets all quality standards!');
        break;
      }
      
      if (iteration < this.maxIterations) {
        console.log('\n⏳ Waiting for video pipeline to regenerate content...');
        console.log('💡 The system will automatically detect new content and continue validation');
        
        // Wait for file changes (in a real implementation, this would watch for file system changes)
        await this.waitForFileChanges();
      }
      
      iteration++;
    }
    
    if (!standardsMet) {
      console.log('\n⚠️  Maximum iterations reached without meeting standards');
      console.log('📋 Check iteration plans for specific improvement recommendations');
    }
    
    // Generate final report
    await this.generateFinalReport();
  }

  private async waitForFileChanges(): Promise<void> {
    // In a real implementation, this would watch for file system changes
    // For now, we'll simulate a wait
    console.log('⏳ Simulating wait for file changes...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  private async generateFinalReport(): Promise<void> {
    console.log('\n📊 Generating final quality report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalIterations: this.currentIteration,
      qualityStandards: this.qualityStandards,
      finalStatus: this.currentIteration <= this.maxIterations ? 'SUCCESS' : 'MAX_ITERATIONS_REACHED',
      recommendations: [
        'Review iteration plans for specific improvement areas',
        'Consider adjusting quality standards if needed',
        'Analyze failed beats for common patterns',
        'Optimize video generation pipeline for better quality'
      ]
    };
    
    const reportPath = path.join(this.iterationsDir, 'final-quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Final report generated: ${reportPath}`);
  }
}

// Example usage and demonstration
async function demonstrateEnhancedCriticBot() {
  const criticBot = new EnhancedCriticBot();
  
  try {
    // Run continuous quality improvement loop
    await criticBot.runContinuousQualityLoop();
    
  } catch (error) {
    console.error('❌ Error demonstrating Enhanced Critic Bot:', error);
  }
}

// Main execution
// Check if this script is being run directly
if (process.argv[1] && process.argv[1].endsWith('enhanced-critic-bot.ts')) {
  demonstrateEnhancedCriticBot().catch(console.error);
}

export { EnhancedCriticBot };
