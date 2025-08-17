#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VideoMarketingStandards {
  audienceAndPersona: {
    required: boolean;
    weight: number;
    standards: any;
  };
  narrativeStructure: {
    required: boolean;
    weight: number;
    standards: any;
  };
  softwareDemonstration: {
    required: boolean;
    weight: number;
    standards: any;
  };
  productionQuality: {
    required: boolean;
    weight: number;
    standards: any;
  };
  technologyMention: {
    required: boolean;
    weight: number;
    standards: any;
  };
  callToAction: {
    required: boolean;
    weight: number;
    standards: any;
  };
}

interface VideoMarketingValidation {
  overallScore: number;
  categoryScores: {
    audienceAndPersona: number;
    narrativeStructure: number;
    softwareDemonstration: number;
    productionQuality: number;
    technologyMention: number;
    callToAction: number;
  };
  meetsRecruiterStandards: boolean;
  criticalIssues: string[];
  improvementAreas: string[];
  recommendations: string[];
  bestPracticeCompliance: {
    atlassian: string[];
    wyzowl: string[];
    userguiding: string[];
    recruiter: string[];
  };
}

interface ContentAnalysis {
  transcript: string;
  timestamps: Array<{ time: number; text: string }>;
  foundryMentions: number;
  personalIntroduction: boolean;
  callToAction: boolean;
  problemStatement: boolean;
  solutionDemonstration: boolean;
  valueProposition: boolean;
}

class VideoMarketingCriticBot {
  private projectRoot: string;
  private configDir: string;
  private outputDir: string;
  private videoMarketingStandards: VideoMarketingStandards;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.configDir = path.join(this.projectRoot, 'config');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.videoMarketingStandards = this.loadVideoMarketingStandards();
  }

  private loadVideoMarketingStandards(): VideoMarketingStandards {
    const standardsPath = path.join(this.configDir, 'video-marketing-standards.json');
    if (fs.existsSync(standardsPath)) {
      return JSON.parse(fs.readFileSync(standardsPath, 'utf8'));
    }
    throw new Error('Video marketing standards configuration not found');
  }

  async validateVideoMarketing(videoPath: string): Promise<VideoMarketingValidation> {
    console.log('🎬 Validating video marketing standards...');
    
    // Analyze video content
    const contentAnalysis = await this.analyzeVideoContent(videoPath);
    
    // Validate against each category
    const audienceScore = this.validateAudienceAndPersona(contentAnalysis);
    const narrativeScore = this.validateNarrativeStructure(contentAnalysis);
    const demoScore = this.validateSoftwareDemonstration(contentAnalysis);
    const qualityScore = await this.validateProductionQuality(videoPath);
    const techScore = this.validateTechnologyMention(contentAnalysis);
    const ctaScore = this.validateCallToAction(contentAnalysis);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      audienceAndPersona: audienceScore,
      narrativeStructure: narrativeScore,
      softwareDemonstration: demoScore,
      productionQuality: qualityScore,
      technologyMention: techScore,
      callToAction: ctaScore
    });
    
    // Check if meets recruiter standards
    const meetsRecruiterStandards = this.checkRecruiterStandards({
      audienceScore,
      narrativeScore,
      demoScore,
      qualityScore,
      techScore,
      ctaScore
    });
    
    // Generate feedback
    const { criticalIssues, improvementAreas, recommendations } = this.generateFeedback({
      audienceScore,
      narrativeScore,
      demoScore,
      qualityScore,
      techScore,
      ctaScore
    });
    
    // Check best practice compliance
    const bestPracticeCompliance = this.checkBestPracticeCompliance(contentAnalysis);
    
    const validation: VideoMarketingValidation = {
      overallScore,
      categoryScores: {
        audienceAndPersona: audienceScore,
        narrativeStructure: narrativeScore,
        softwareDemonstration: demoScore,
        productionQuality: qualityScore,
        technologyMention: techScore,
        callToAction: ctaScore
      },
      meetsRecruiterStandards,
      criticalIssues,
      improvementAreas,
      recommendations,
      bestPracticeCompliance
    };

    console.log(`✅ Video marketing validation complete: ${overallScore}/100`);
    
    return validation;
  }

  private async analyzeVideoContent(videoPath: string): Promise<ContentAnalysis> {
    console.log('🔍 Analyzing video content...');
    
    // For now, we'll simulate content analysis
    // In a real implementation, this would use speech-to-text and video analysis
    const mockAnalysis: ContentAnalysis = {
      transcript: "This is a demo of our fire incident response application...",
      timestamps: [
        { time: 0, text: "Introduction" },
        { time: 30, text: "Problem statement" },
        { time: 60, text: "Solution demonstration" },
        { time: 120, text: "Foundry integration" },
        { time: 180, text: "Call to action" }
      ],
      foundryMentions: 3,
      personalIntroduction: true,
      callToAction: true,
      problemStatement: true,
      solutionDemonstration: true,
      valueProposition: true
    };
    
    return mockAnalysis;
  }

  private validateAudienceAndPersona(contentAnalysis: ContentAnalysis): number {
    let score = 100;
    
    // Check personal introduction
    if (!contentAnalysis.personalIntroduction) {
      score -= 30;
    }
    
    // Check persona definition (would need more sophisticated analysis)
    // For now, we'll assume it's present if introduction exists
    if (contentAnalysis.personalIntroduction) {
      score += 10;
    }
    
    // Check problem statement
    if (!contentAnalysis.problemStatement) {
      score -= 25;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private validateNarrativeStructure(contentAnalysis: ContentAnalysis): number {
    let score = 100;
    
    // Check problem-solution-value structure
    if (!contentAnalysis.problemStatement) {
      score -= 20;
    }
    
    if (!contentAnalysis.solutionDemonstration) {
      score -= 20;
    }
    
    if (!contentAnalysis.valueProposition) {
      score -= 20;
    }
    
    // Check narrative flow
    const hasGoodFlow = contentAnalysis.problemStatement && 
                       contentAnalysis.solutionDemonstration && 
                       contentAnalysis.valueProposition;
    
    if (hasGoodFlow) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private validateSoftwareDemonstration(contentAnalysis: ContentAnalysis): number {
    let score = 100;
    
    // Check if solution is demonstrated
    if (!contentAnalysis.solutionDemonstration) {
      score -= 40;
    }
    
    // Check demonstration quality (would need video analysis)
    // For now, assume good quality if demonstration exists
    if (contentAnalysis.solutionDemonstration) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private async validateProductionQuality(videoPath: string): Promise<number> {
    let score = 100;
    
    try {
      // Use ffprobe to analyze video quality
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`);
      const videoData = JSON.parse(stdout);
      
      const videoStream = videoData.streams.find((s: any) => s.codec_type === 'video');
      const audioStream = videoData.streams.find((s: any) => s.codec_type === 'audio');
      
      // Check resolution
      if (videoStream) {
        const width = videoStream.width;
        const height = videoStream.height;
        
        if (width >= 1920 && height >= 1080) {
          score += 10;
        } else if (width >= 1280 && height >= 720) {
          score += 5;
        } else {
          score -= 20;
        }
      }
      
      // Check framerate
      if (videoStream && videoStream.r_frame_rate) {
        const framerate = eval(videoStream.r_frame_rate);
        if (framerate >= 30) {
          score += 5;
        } else if (framerate < 24) {
          score -= 10;
        }
      }
      
      // Check bitrate
      if (videoData.format.bit_rate) {
        const bitrate = parseInt(videoData.format.bit_rate) / 1000; // kbps
        if (bitrate >= 2000) {
          score += 10;
        } else if (bitrate >= 1000) {
          score += 5;
        } else {
          score -= 15;
        }
      }
      
    } catch (error) {
      console.warn('⚠️  Could not analyze video quality:', error);
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private validateTechnologyMention(contentAnalysis: ContentAnalysis): number {
    let score = 100;
    
    // Check Foundry mentions
    if (contentAnalysis.foundryMentions === 0) {
      score -= 50; // Critical failure - recruiter specifically asked for this
    } else if (contentAnalysis.foundryMentions === 1) {
      score -= 20;
    } else if (contentAnalysis.foundryMentions >= 3) {
      score += 10;
    }
    
    // Check technical details (would need more sophisticated analysis)
    // For now, assume good if Foundry is mentioned multiple times
    if (contentAnalysis.foundryMentions >= 2) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private validateCallToAction(contentAnalysis: ContentAnalysis): number {
    let score = 100;
    
    // Check if call to action exists
    if (!contentAnalysis.callToAction) {
      score -= 40;
    }
    
    // Check CTA quality (would need more sophisticated analysis)
    if (contentAnalysis.callToAction) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateOverallScore(categoryScores: any): number {
    const weights = this.videoMarketingStandards.scoringWeights;
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (const [category, score] of Object.entries(categoryScores)) {
      const weight = weights[category as keyof typeof weights] || 0;
      weightedScore += score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  private checkRecruiterStandards(categoryScores: any): boolean {
    const thresholds = this.videoMarketingStandards.qualityThresholds;
    
    // Check if all critical categories meet thresholds
    const criticalCategories = ['technologyMention', 'narrativeStructure', 'softwareDemonstration'];
    
    for (const category of criticalCategories) {
      const threshold = thresholds[category as keyof typeof thresholds];
      const score = categoryScores[category];
      
      if (score < threshold) {
        return false;
      }
    }
    
    return true;
  }

  private generateFeedback(categoryScores: any): {
    criticalIssues: string[];
    improvementAreas: string[];
    recommendations: string[];
  } {
    const criticalIssues: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];
    
    const thresholds = this.videoMarketingStandards.qualityThresholds;
    
    for (const [category, score] of Object.entries(categoryScores)) {
      const threshold = thresholds[category as keyof typeof thresholds];
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      if (score < threshold - 10) {
        criticalIssues.push(`${categoryName} score (${score}/100) is critically below threshold (${threshold})`);
      } else if (score < threshold) {
        improvementAreas.push(`${categoryName} score (${score}/100) needs improvement to meet threshold (${threshold})`);
      }
      
      // Generate specific recommendations
      if (category === 'technologyMention' && score < 90) {
        recommendations.push('Increase Foundry mentions and technical architecture details');
      }
      
      if (category === 'narrativeStructure' && score < 90) {
        recommendations.push('Strengthen problem-solution-value narrative flow');
      }
      
      if (category === 'softwareDemonstration' && score < 90) {
        recommendations.push('Enhance live software demonstration with clear step-by-step walkthrough');
      }
      
      if (category === 'callToAction' && score < 90) {
        recommendations.push('Strengthen call to action with clear next steps');
      }
    }
    
    return { criticalIssues, improvementAreas, recommendations };
  }

  private checkBestPracticeCompliance(contentAnalysis: ContentAnalysis): {
    atlassian: string[];
    wyzowl: string[];
    userguiding: string[];
    recruiter: string[];
  } {
    const compliance = {
      atlassian: [] as string[],
      wyzowl: [] as string[],
      userguiding: [] as string[],
      recruiter: [] as string[]
    };
    
    // Check Atlassian guidelines
    if (contentAnalysis.personalIntroduction) {
      compliance.atlassian.push('✅ Personal introduction and audience understanding');
    } else {
      compliance.atlassian.push('❌ Missing personal introduction');
    }
    
    // Check Wyzowl guidelines
    if (contentAnalysis.problemStatement && contentAnalysis.solutionDemonstration) {
      compliance.wyzowl.push('✅ Problem-solution demonstration structure');
    } else {
      compliance.wyzowl.push('❌ Incomplete problem-solution structure');
    }
    
    if (contentAnalysis.callToAction) {
      compliance.wyzowl.push('✅ Call to action included');
    } else {
      compliance.wyzowl.push('❌ Missing call to action');
    }
    
    // Check UserGuiding guidelines
    if (contentAnalysis.solutionDemonstration) {
      compliance.userguiding.push('✅ Software demonstration included');
    } else {
      compliance.userguiding.push('❌ Missing software demonstration');
    }
    
    // Check recruiter requirements
    if (contentAnalysis.foundryMentions > 0) {
      compliance.recruiter.push('✅ Foundry technology mentioned');
    } else {
      compliance.recruiter.push('❌ Missing Foundry mention (critical requirement)');
    }
    
    if (contentAnalysis.solutionDemonstration) {
      compliance.recruiter.push('✅ Live functionality demonstrated');
    } else {
      compliance.recruiter.push('❌ Missing live functionality demonstration');
    }
    
    if (contentAnalysis.callToAction) {
      compliance.recruiter.push('✅ Call to action included');
    } else {
      compliance.recruiter.push('❌ Missing call to action');
    }
    
    return compliance;
  }

  async generateMarketingReport(videoPath: string): Promise<string> {
    console.log('📊 Generating video marketing report...');
    
    const validation = await this.validateVideoMarketing(videoPath);
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'Video Marketing Critic Bot',
        version: '1.0.0',
        videoPath: videoPath
      },
      validation: validation,
      summary: {
        overallScore: validation.overallScore,
        meetsRecruiterStandards: validation.meetsRecruiterStandards,
        criticalIssues: validation.criticalIssues.length,
        improvementAreas: validation.improvementAreas.length,
        recommendations: validation.recommendations.length
      }
    };
    
    const reportPath = path.join(this.outputDir, `video-marketing-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Marketing report generated: ${reportPath}`);
    return reportPath;
  }
}

// Example usage and demonstration
async function demonstrateVideoMarketingCriticBot() {
  const criticBot = new VideoMarketingCriticBot();
  
  try {
    // Example video path (replace with actual path)
    const videoPath = './output/final-video.mp4';
    
    if (fs.existsSync(videoPath)) {
      const reportPath = await criticBot.generateMarketingReport(videoPath);
      console.log(`📁 Marketing report saved to: ${reportPath}`);
    } else {
      console.log('⚠️  Example video not found, creating sample report...');
      // Create sample validation for demonstration
      const sampleValidation = await criticBot.validateVideoMarketing('./sample-video.mp4');
      console.log('🎯 Sample validation results:', JSON.stringify(sampleValidation, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error demonstrating Video Marketing Critic Bot:', error);
  }
}

// Main execution
if (require.main === module) {
  demonstrateVideoMarketingCriticBot().catch(console.error);
}

export { VideoMarketingCriticBot, VideoMarketingValidation, ContentAnalysis };
