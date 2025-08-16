import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CriticBotConfig {
  strictMode: boolean;
  requireAllBeats: boolean;
  minDuration: number; // in seconds
  maxDuration: number; // in seconds
}

interface BeatAnalysis {
  beatId: string;
  duration: number;
  hasNarration: boolean;
  hasOverlays: boolean;
  actionCount: number;
  issues: string[];
  score: number; // 0-100
}

interface VideoAnalysis {
  totalDuration: number;
  totalBeats: number;
  overallScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  beatAnalyses: BeatAnalysis[];
}

export class EnhancedCriticBot {
  private config: CriticBotConfig;
  private requiredBeats: string[] = [
    'intro',
    'problem_statement',
    'user_roles',
    'api_architecture', 
    'hazard_interaction',
    'zone_interaction',
    'route_concept',
    'ai_support',
    'impact_metrics',
    'conclusion'
  ];

  private requiredElements = {
    userRoles: ['Incident Commander', 'planners', 'dispatchers', 'field units'],
    apiEndpoints: ['/api/hazards', '/api/hazard_zones', '/api/routes', '/api/risk', '/api/evacuations', '/api/units', '/api/public_safety'],
    technicalConcepts: ['FIRMS', 'NOAA', '911', 'H3 res9', 'ML spread horizon', 'risk polygons', 'A Star routing'],
    hazardInteractions: ['hazard click', 'risk scoring', 'population at risk'],
    zoneInteractions: ['zone card click', 'building status', 'evacuation progress'],
    conceptualOverlays: ['route profiles', 'AI decision support', 'scenario planning']
  };

  constructor(config: CriticBotConfig = {
    strictMode: true,
    requireAllBeats: true,
    minDuration: 300, // 5 minutes
    maxDuration: 360  // 6 minutes
  }) {
    this.config = config;
  }

  async analyzeVideo(videoPath: string, configPath: string): Promise<VideoAnalysis> {
    console.log('🎭 Enhanced CriticBot analyzing video...');
    
    const analysis: VideoAnalysis = {
      totalDuration: 0,
      totalBeats: 0,
      overallScore: 0,
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      beatAnalyses: []
    };

    try {
      // Analyze video file
      const videoInfo = await this.analyzeVideoFile(videoPath);
      analysis.totalDuration = videoInfo.duration;
      
      // Analyze configuration
      const configInfo = await this.analyzeConfiguration(configPath);
      analysis.totalBeats = configInfo.beats.length;
      
      // Analyze each beat
      for (const beat of configInfo.beats) {
        const beatAnalysis = await this.analyzeBeat(beat, configInfo);
        analysis.beatAnalyses.push(beatAnalysis);
      }
      
      // Generate overall analysis
      this.generateOverallAnalysis(analysis, configInfo);
      
      // Apply strict mode checks
      if (this.config.strictMode) {
        this.applyStrictModeChecks(analysis, configInfo);
      }
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing video:', error);
      analysis.criticalIssues.push(`Analysis failed: ${error}`);
      return analysis;
    }
  }

  private async analyzeVideoFile(videoPath: string): Promise<{duration: number, size: number}> {
    try {
      // Use ffprobe to get video information
      const ffprobeOutput = execSync(`ffprobe -v quiet -show_entries format=duration,size -of csv=p=0 "${videoPath}"`, { encoding: 'utf8' });
      const [duration, size] = ffprobeOutput.trim().split(',');
      
      return {
        duration: parseFloat(duration) || 0,
        size: parseInt(size) || 0
      };
    } catch (error) {
      console.warn('⚠️ Could not analyze video file, using defaults');
      return { duration: 0, size: 0 };
    }
  }

  private async analyzeConfiguration(configPath: string): Promise<any> {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to read configuration: ${error}`);
    }
  }

  private async analyzeBeat(beat: any, configInfo: any): Promise<BeatAnalysis> {
    const analysis: BeatAnalysis = {
      beatId: beat.id,
      duration: beat.duration || 0,
      hasNarration: false,
      hasOverlays: false,
      actionCount: beat.actions?.length || 0,
      issues: [],
      score: 100
    };

    // Check for narration
    if (beat.narration && beat.narration.trim()) {
      analysis.hasNarration = true;
    } else {
      analysis.issues.push('Missing narration');
      analysis.score -= 20;
    }

    // Check for overlays
    const overlayActions = beat.actions?.filter((action: string) => action.includes('overlay(')) || [];
    if (overlayActions.length > 0) {
      analysis.hasOverlays = true;
    } else {
      analysis.issues.push('No visual overlays');
      analysis.score -= 15;
    }

    // Check for required elements based on beat type
    this.checkBeatSpecificRequirements(beat, analysis);

    // Ensure score doesn't go below 0
    analysis.score = Math.max(0, analysis.score);

    return analysis;
  }

  private checkBeatSpecificRequirements(beat: any, analysis: BeatAnalysis): void {
    const beatId = beat.id.toLowerCase();
    
    // Problem Statement Check
    if (beatId.includes('problem') || beatId.includes('intro')) {
      if (!this.hasProblemContext(beat)) {
        analysis.issues.push('Missing problem context (why emergency response coordination is hard)');
        analysis.score -= 25;
      }
    }

    // User Roles Check
    if (beatId.includes('role') || beatId.includes('user')) {
      if (!this.hasUserRoles(beat)) {
        analysis.issues.push('Missing user role definitions (Incident Commander, planners, dispatchers)');
        analysis.score -= 25;
      }
    }

    // API Architecture Check
    if (beatId.includes('api') || beatId.includes('tech') || beatId.includes('architecture')) {
      if (!this.hasApiArchitecture(beat)) {
        analysis.issues.push('Missing API/technical discussion (ingestion, H3, ML, routing, endpoints)');
        analysis.score -= 30;
      }
    }

    // Hazard Interaction Check
    if (beatId.includes('hazard') || beatId.includes('map')) {
      if (!this.hasHazardInteraction(beat)) {
        analysis.issues.push('Missing hazard interaction (click, zoom, toggle layers, risk scoring)');
        analysis.score -= 25;
      }
    }

    // Zone Interaction Check
    if (beatId.includes('zone') || beatId.includes('building')) {
      if (!this.hasZoneInteraction(beat)) {
        analysis.issues.push('Missing zone/building interaction (card clicks, status updates)');
        analysis.score -= 25;
      }
    }

    // Route Concept Check
    if (beatId.includes('route') || beatId.includes('ai')) {
      if (!this.hasRouteConcept(beat)) {
        analysis.issues.push('Missing route concept or AI support (A Star, safe routes, scenario planning)');
        analysis.score -= 25;
      }
    }

    // Conclusion Check
    if (beatId.includes('conclusion') || beatId.includes('impact')) {
      if (!this.hasConclusion(beat)) {
        analysis.issues.push('Missing conclusion with impact metrics and call-to-action');
        analysis.score -= 30;
      }
    }
  }

  private hasProblemContext(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const problemKeywords = ['emergency', 'coordination', 'challenge', 'difficult', 'problem', 'issue'];
    return problemKeywords.some(keyword => text.includes(keyword));
  }

  private hasUserRoles(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const requiredRoles = ['incident commander', 'planner', 'dispatcher', 'field unit'];
    return requiredRoles.some(role => text.includes(role));
  }

  private hasApiArchitecture(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const requiredConcepts = ['firms', 'noaa', '911', 'h3', 'ml spread', 'risk polygon', 'a star', 'routing'];
    const conceptCount = requiredConcepts.filter(concept => text.includes(concept)).length;
    return conceptCount >= 3; // At least 3 technical concepts
  }

  private hasHazardInteraction(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const requiredActions = ['click', 'zoom', 'toggle', 'layer', 'hazard', 'risk'];
    const actionCount = requiredActions.filter(action => text.includes(action)).length;
    return actionCount >= 2; // At least 2 interaction types
  }

  private hasZoneInteraction(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const requiredActions = ['zone', 'building', 'card', 'status', 'evacuation'];
    const actionCount = requiredActions.filter(action => text.includes(action)).length;
    return actionCount >= 2; // At least 2 interaction types
  }

  private hasRouteConcept(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const requiredConcepts = ['route', 'a star', 'safe', 'ai', 'scenario', 'highway'];
    const conceptCount = requiredConcepts.filter(concept => text.includes(concept)).length;
    return conceptCount >= 2; // At least 2 route/AI concepts
  }

  private hasConclusion(beat: any): boolean {
    const text = JSON.stringify(beat).toLowerCase();
    const requiredElements = ['impact', 'metric', 'conclusion', 'call to action', 'pilot'];
    const elementCount = requiredElements.filter(element => text.includes(element)).length;
    return elementCount >= 2; // At least 2 conclusion elements
  }

  private generateOverallAnalysis(analysis: VideoAnalysis, configInfo: any): void {
    // Calculate overall score
    const totalScore = analysis.beatAnalyses.reduce((sum, beat) => sum + beat.score, 0);
    analysis.overallScore = Math.round(totalScore / analysis.beatAnalyses.length);

    // Duration checks
    if (analysis.totalDuration < this.config.minDuration) {
      analysis.criticalIssues.push(`Video too short: ${analysis.totalDuration}s (minimum ${this.config.minDuration}s)`);
    } else if (analysis.totalDuration > this.config.maxDuration) {
      analysis.warnings.push(`Video too long: ${analysis.totalDuration}s (maximum ${this.config.maxDuration}s)`);
    }

    // Beat coverage checks
    if (this.config.requireAllBeats) {
      const missingBeats = this.requiredBeats.filter(required => 
        !configInfo.beats.some((beat: any) => beat.id.toLowerCase().includes(required.toLowerCase()))
      );
      
      if (missingBeats.length > 0) {
        analysis.criticalIssues.push(`Missing required beats: ${missingBeats.join(', ')}`);
      }
    }

    // Generate recommendations
    this.generateRecommendations(analysis);
  }

  private applyStrictModeChecks(analysis: VideoAnalysis, configInfo: any): void {
    // Check for critical missing elements
    const hasAllRequiredElements = this.checkAllRequiredElements(configInfo);
    
    if (!hasAllRequiredElements) {
      analysis.criticalIssues.push('Missing critical narrative elements - video incomplete');
      analysis.overallScore = Math.max(0, analysis.overallScore - 40);
    }

    // Check for proper structure
    if (analysis.beatAnalyses.length < 8) {
      analysis.criticalIssues.push('Insufficient beat coverage - need at least 8 comprehensive beats');
      analysis.overallScore = Math.max(0, analysis.overallScore - 30);
    }
  }

  private checkAllRequiredElements(configInfo: any): boolean {
    const allText = JSON.stringify(configInfo).toLowerCase();
    
    // Check for all required elements
    const hasUserRoles = this.requiredElements.userRoles.some(role => allText.includes(role.toLowerCase()));
    const hasApiEndpoints = this.requiredElements.apiEndpoints.some(endpoint => allText.includes(endpoint.toLowerCase()));
    const hasTechnicalConcepts = this.requiredElements.technicalConcepts.some(concept => allText.includes(concept.toLowerCase()));
    const hasHazardInteractions = this.requiredElements.hazardInteractions.some(interaction => allText.includes(interaction.toLowerCase()));
    const hasZoneInteractions = this.requiredElements.zoneInteractions.some(interaction => allText.includes(interaction.toLowerCase()));
    const hasConceptualOverlays = this.requiredElements.conceptualOverlays.some(overlay => allText.includes(overlay.toLowerCase()));

    return hasUserRoles && hasApiEndpoints && hasTechnicalConcepts && 
           hasHazardInteractions && hasZoneInteractions && hasConceptualOverlays;
  }

  private generateRecommendations(analysis: VideoAnalysis): void {
    if (analysis.criticalIssues.length > 0) {
      analysis.recommendations.push('Address all critical issues before proceeding');
    }

    if (analysis.overallScore < 70) {
      analysis.recommendations.push('Video needs significant improvement to meet requirements');
    } else if (analysis.overallScore < 85) {
      analysis.recommendations.push('Video needs minor improvements to meet all requirements');
    }

    // Specific recommendations based on issues
    if (analysis.beatAnalyses.some(beat => !beat.hasNarration)) {
      analysis.recommendations.push('Add narration to all beats for better engagement');
    }

    if (analysis.beatAnalyses.some(beat => !beat.hasOverlays)) {
      analysis.recommendations.push('Add visual overlays to all beats for clarity');
    }

    if (analysis.totalDuration < this.config.minDuration) {
      analysis.recommendations.push(`Extend video to at least ${this.config.minDuration}s to meet time requirements`);
    }
  }

  generateReport(analysis: VideoAnalysis): string {
    let report = '🎭 Enhanced CriticBot Analysis Report\n';
    report += '=====================================\n\n';

    // Overall Score
    report += `📊 Overall Score: ${analysis.overallScore}/100\n`;
    report += `⏱️ Duration: ${analysis.totalDuration}s\n`;
    report += `🎬 Beats: ${analysis.totalBeats}\n\n`;

    // Critical Issues
    if (analysis.criticalIssues.length > 0) {
      report += '🚨 CRITICAL ISSUES:\n';
      analysis.criticalIssues.forEach(issue => {
        report += `  ❌ ${issue}\n`;
      });
      report += '\n';
    }

    // Warnings
    if (analysis.warnings.length > 0) {
      report += '⚠️ WARNINGS:\n';
      analysis.warnings.forEach(warning => {
        report += `  ⚠️ ${warning}\n`;
      });
      report += '\n';
    }

    // Beat Analysis
    report += '🎬 Beat Analysis:\n';
    analysis.beatAnalyses.forEach(beat => {
      const status = beat.score >= 80 ? '✅' : beat.score >= 60 ? '⚠️' : '❌';
      report += `  ${status} ${beat.beatId}: ${beat.score}/100`;
      if (beat.issues.length > 0) {
        report += ` (${beat.issues.join(', ')})`;
      }
      report += '\n';
    });

    // Recommendations
    if (analysis.recommendations.length > 0) {
      report += '\n💡 RECOMMENDATIONS:\n';
      analysis.recommendations.forEach(rec => {
        report += `  💡 ${rec}\n`;
      });
    }

    // Final Verdict
    report += '\n🏆 FINAL VERDICT:\n';
    if (analysis.overallScore >= 90) {
      report += '  🎉 EXCELLENT - Ready for production!\n';
    } else if (analysis.overallScore >= 80) {
      report += '  ✅ GOOD - Minor improvements needed\n';
    } else if (analysis.overallScore >= 70) {
      report += '  ⚠️ FAIR - Significant improvements needed\n';
    } else {
      report += '  ❌ POOR - Major overhaul required\n';
    }

    return report;
  }
}

// Export for use in other scripts
export default EnhancedCriticBot;
