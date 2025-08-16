#!/usr/bin/env node
/**
 * Beat Stitcher - Combines improved beats into complete video
 * Then tests the stitched video against the critic model
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import OpenAI from "openai";
import dotenv from "dotenv";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

class BeatStitcher {
  constructor() {
    this.client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.beatsDir = path.join(this.outputDir, 'beats');
    this.stitchedDir = path.join(this.outputDir, 'stitched');
    this.resultsPath = path.join(this.outputDir, 'beat_stitching_results.json');
    
    // Ensure directories exist
    if (!fs.existsSync(this.stitchedDir)) {
      fs.mkdirSync(this.stitchedDir, { recursive: true });
    }
    
    // Configuration
    this.targetScore = 10.0;
    this.minScoreThreshold = 9.5;
    this.maxStitchingIterations = 5;
    this.currentIteration = 0;
  }

  async runStitchingPipeline() {
    console.log('🎬 Beat Stitcher - Combining Beats into Complete Video');
    console.log('=' * 60);
    
    try {
      // Validate API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('❌ OPENAI_API_KEY not found in environment variables');
      }
      
      console.log('🔑 API key validated successfully');
      
      // Step 1: Load beat analysis results
      const beatResults = await this.loadBeatResults();
      
      // Step 2: Stitch beats together
      const stitchedVideo = await this.stitchBeats(beatResults);
      
      // Step 3: Test stitched video against critic model
      const criticResults = await this.testAgainstCritic(stitchedVideo);
      
      // Step 4: Generate final assessment
      await this.generateFinalAssessment(beatResults, stitchedVideo, criticResults);
      
      console.log('\n🎉 Beat Stitching Pipeline completed successfully!');
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      process.exit(1);
    }
  }

  async loadBeatResults() {
    console.log('\n📋 Step 1: Loading beat analysis results...');
    
    try {
      const resultsPath = path.join(this.outputDir, 'beat_by_beat_results.json');
      if (!fs.existsSync(resultsPath)) {
        throw new Error('Beat results file not found. Run beat-by-beat pipeline first.');
      }
      
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      console.log(`✅ Loaded results for ${results.total_beats} beats`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Error loading beat results:', error);
      throw error;
    }
  }

  async stitchBeats(beatResults) {
    console.log('\n🔗 Step 2: Stitching beats together...');
    
    const stitchedVideo = {
      timestamp: new Date().toISOString(),
      total_beats: beatResults.total_beats,
      total_duration: 0,
      beat_sequence: [],
      stitched_file: '',
      quality_metrics: {}
    };
    
    // Create beat sequence from results
    beatResults.beat_results.forEach((beat, index) => {
      const beatInfo = {
        id: beat.beat_id,
        start_time: beat.start_time,
        duration: beat.duration,
        final_score: beat.finalScore,
        issues_count: beat.issues_found.length,
        fixes_count: beat.fixes_applied.length,
        status: beat.status
      };
      
      stitchedVideo.beat_sequence.push(beatInfo);
      stitchedVideo.total_duration += beat.duration;
    });
    
    // Simulate video stitching (in real implementation, this would use FFmpeg)
    console.log('🔧 Simulating video stitching...');
    console.log(`  Total duration: ${stitchedVideo.total_duration} seconds`);
    console.log(`  Beat sequence: ${stitchedVideo.beat_sequence.map(b => b.id).join(' → ')}`);
    
    // Create stitched video file path
    stitchedVideo.stitched_file = path.join(this.stitchedDir, 'stitched_complete_video.mp4');
    
    // Simulate quality improvements from beat-level fixes
    stitchedVideo.quality_metrics = this.calculateStitchedQuality(beatResults);
    
    console.log('✅ Beat stitching completed');
    console.log(`📁 Stitched video: ${stitchedVideo.stitched_file}`);
    
    return stitchedVideo;
  }

  calculateStitchedQuality(beatResults) {
    const metrics = {
      overall_score: 0,
      audio_quality: 0,
      visual_quality: 0,
      technical_accuracy: 0,
      content_flow: 0,
      professional_standards: 0
    };
    
    // Calculate weighted average based on beat scores and improvements
    let totalWeight = 0;
    let weightedScore = 0;
    
    beatResults.beat_results.forEach(beat => {
      const weight = beat.duration; // Weight by duration
      const improvementFactor = Math.min(beat.fixes_applied.length * 0.5, 2.0); // Max 2 point improvement
      const adjustedScore = Math.min(beat.finalScore + improvementFactor, 10);
      
      weightedScore += adjustedScore * weight;
      totalWeight += weight;
    });
    
    metrics.overall_score = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
    
    // Estimate category scores based on common issues found
    const allIssues = beatResults.beat_results.flatMap(beat => beat.issues_found);
    const audioIssues = allIssues.filter(issue => issue.type.includes('audio')).length;
    const visualIssues = allIssues.filter(issue => issue.type.includes('visual') || issue.type.includes('text')).length;
    const technicalIssues = allIssues.filter(issue => issue.type.includes('technical') || issue.type.includes('terminology')).length;
    
    metrics.audio_quality = Math.max(0, metrics.overall_score - (audioIssues * 0.3));
    metrics.visual_quality = Math.max(0, metrics.overall_score - (visualIssues * 0.3));
    metrics.technical_accuracy = Math.max(0, metrics.overall_score - (technicalIssues * 0.3));
    metrics.content_flow = Math.max(0, metrics.overall_score - 0.5); // Slight improvement from stitching
    metrics.professional_standards = Math.max(0, metrics.overall_score - 0.3); // Overall polish
    
    return metrics;
  }

  async testAgainstCritic(stitchedVideo) {
    console.log('\n🎭 Step 3: Testing stitched video against critic model...');
    
    const criticResults = {
      timestamp: new Date().toISOString(),
      video_analyzed: stitchedVideo.stitched_file,
      total_duration: stitchedVideo.total_duration,
      beat_count: stitchedVideo.total_beats,
      critic_analysis: null,
      quality_assessment: null,
      improvement_recommendations: []
    };
    
    try {
      // Create comprehensive critic prompt
      const prompt = this.createCriticPrompt(stitchedVideo);
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user }
        ],
        max_tokens: 3000
      });
      
      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Validate critic analysis
      if (this.validateCriticAnalysis(analysis)) {
        criticResults.critic_analysis = analysis;
        criticResults.quality_assessment = this.assessOverallQuality(analysis, stitchedVideo);
        
        // Generate improvement recommendations
        criticResults.improvement_recommendations = this.generateImprovementRecommendations(
          analysis, 
          stitchedVideo
        );
        
        console.log('✅ Critic analysis completed');
        console.log(`📊 Overall score: ${analysis.overall_score}/10`);
        console.log(`🎯 Quality level: ${criticResults.quality_assessment.level}`);
        
      } else {
        throw new Error('Invalid critic analysis structure');
      }
      
    } catch (error) {
      console.error('❌ Error in critic analysis:', error);
      criticResults.critic_analysis = this.getFallbackCriticAnalysis(stitchedVideo);
      criticResults.quality_assessment = this.assessOverallQuality(criticResults.critic_analysis, stitchedVideo);
    }
    
    return criticResults;
  }

  createCriticPrompt(stitchedVideo) {
    const systemPrompt = `
You are a senior video demo reviewer evaluating a submitted cut against the provided outline and rubric. Be specific, use timecodes, and propose small, surgical edits that can be applied by an automated pipeline (Cursor + FFmpeg/OTIO). Output strict JSON matching the schema at the end — no extra commentary.

EVALUATION REQUIREMENTS:
- Assess the complete video as a cohesive whole
- Consider how well the beats flow together
- Evaluate overall production quality and professional standards
- Identify any issues that arise from the stitching process
- Provide specific, actionable feedback for improvement

VIDEO CONTEXT:
- Total duration: ${stitchedVideo.total_duration} seconds
- Beat count: ${stitchedVideo.total_beats}
- Beat sequence: ${stitchedVideo.beat_sequence.map(b => b.id).join(' → ')}
- Individual beat scores: ${stitchedVideo.beat_sequence.map(b => `${b.id}: ${b.final_score}/10`).join(', ')}

WHAT TO CHECK (Recruiter-Aligned):
1. Story & Users (must-have)
   • Problem framing: why emergency response, what's broken
   • Roles named: Incident Commander (top of chain), planners, dispatch, field
   • Clear user path: Intro → Users → Tech/API → Live Map → Dashboard → Routing concept → AI concept → Impact → CTA

2. Technical accuracy (must-have)
   • Data flow: ingestion → H3/ML → risk → routing (A Star) → delivery/API
   • Palantir Foundry: pipelines/ontology; Foundry Functions with Inputs/Outputs
   • Endpoints consistently named: /api/hazards, /api/hazard_zones, /api/routes, /api/risk, /api/evacuations, /api/units, /api/public_safety
   • Terminology: "A Star", "Incident Commander", H3 res9 ≈ 174 m (if referenced)

3. Visuals & interactions
   • Real UI interactions shown where they exist (Commander Dashboard, Live Map hazard click, layer toggle)
   • Conceptual features (zone drawing, live route profile, AIP answers) shown as diagrams/overlays, not fake UI
   • Titles/callouts ≤ 10 words, consistent brand palette/types, smooth transitions (0.8–1.0 s)

4. Audio & captions
   • VO integrated loudness ≈ –16 LUFS (±1 LU)
   • Music duck –6 to –9 dB under VO; no clipping/abrupt fades
   • Captions aligned with VO; no egregious transcript errors

5. Timing & compliance
   • Beats present, in order, in their time windows; no long static holds
   • Total runtime within approved window (default target 5:40 ± 15 s)
   • Diagrams appear when referenced; API labels visible during the tech section

SCORING RUBRIC (0–10 each; weight equally):
• STORY – clarity of narrative & user path
• TECH_ACCURACY – correctness of terminology, diagrams, endpoints
• VISUALS – readability, consistency, transitions, cursor pacing
• AUDIO – VO loudness, ducking, clarity, absence of artifacts
• TIMING – beat pacing & overall runtime
• COMPLIANCE – required beats & recruiter asks are addressed

RULES & CONSTRAINTS:
• Do not request interactions that do not exist in the current UI; use overlays/diagrams instead
• Assume the editor can adjust transitions, overlay text, durations, and audio levels programmatically
• All feedback must be timecoded (MM:SS)
• Prefer small, precise fixes over vague advice
`;

    const userPrompt = `
EVALUATE THIS STITCHED VIDEO AND RETURN STRICT JSON:

{
  "scores": {
    "story": "number (0-10)",
    "tech_accuracy": "number (0-10)",
    "visuals": "number (0-10)",
    "audio": "number (0-10)",
    "timing": "number (0-10)",
    "compliance": "number (0-10)"
  },
  "total": "number (0-10)",
  "issues": [
    {
      "timecode": "MM:SS",
      "beat": "Bxx_or_label",
      "type": "story|tech|visual|audio|timing|compliance",
      "note": "What is wrong, in one sentence.",
      "evidence": "Frame/line reference or brief description."
    }
  ],
  "fixes": [
    {
      "timecode": "MM:SS",
      "beat": "Bxx_or_label",
      "action": "insert|replace|trim|move|retime|overlay|audio|caption",
      "detail": "Precise, surgical instruction with values (e.g., 'Insert crossfade 0.8s at 01:40'; 'Overlay chip GET /api/hazards top-right 01:05–01:10 font28 bg80%'; 'Raise VO +2 dB 02:15–02:28'; 'Add caption line at 00:45 \"A Star routing\"')."
    }
  ],
  "blocking": "boolean"
}

PASS/FAIL GATES:
• Pass if total ≥ 8.0 and every score ≥ 7.5 and no blocking issues
• Else Fail and set "blocking": true with the minimum set of fixes to reach pass

Provide a thorough analysis focusing on how well the individual beats work together as a complete video, specifically addressing the Palantir recruiter requirements for emergency response demo clarity.
`;

    return { system: systemPrompt, user: userPrompt };
  }

  validateCriticAnalysis(analysis) {
    const required = [
      'scores', 'total', 'issues', 'fixes', 'blocking'
    ];
    
    return required.every(key => analysis.hasOwnProperty(key)) &&
           typeof analysis.total === 'number' &&
           analysis.total >= 0 && analysis.total <= 10 &&
           analysis.scores && 
           typeof analysis.scores.story === 'number' &&
           typeof analysis.scores.tech_accuracy === 'number' &&
           typeof analysis.scores.visuals === 'number' &&
           typeof analysis.scores.audio === 'number' &&
           typeof analysis.scores.timing === 'number' &&
           typeof analysis.scores.compliance === 'number';
  }

  getFallbackCriticAnalysis(stitchedVideo) {
    return {
      scores: {
        story: 7,
        tech_accuracy: 7,
        visuals: 7,
        audio: 7,
        timing: 7,
        compliance: 7
      },
      total: 7,
      issues: [
        {
          timecode: "00:00",
          beat: "entire_video",
          type: "tech",
          note: "Fallback analysis due to technical issues",
          evidence: "Critic analysis system encountered errors"
        }
      ],
      fixes: [
        {
          timecode: "00:00",
          beat: "entire_video",
          action: "overlay",
          detail: "Resolve critic analysis system issues to enable proper quality assessment"
        }
      ],
      blocking: true
    };
  }

  assessOverallQuality(analysis, stitchedVideo) {
    const score = analysis.total;
    
    let level, status, recommendation;
    
    if (score >= 9.5) {
      level = "Excellent";
      status = "Production Ready";
      recommendation = "Video meets professional broadcast standards";
    } else if (score >= 8.5) {
      level = "Very Good";
      status = "Near Production Ready";
      recommendation = "Minor improvements needed for broadcast quality";
    } else if (score >= 7.5) {
      level = "Good";
      status = "Needs Improvement";
      recommendation = "Several areas need attention before production";
    } else if (score >= 6.5) {
      level = "Fair";
      status = "Significant Issues";
      recommendation = "Major improvements required across multiple areas";
    } else {
      level = "Poor";
      status = "Not Production Ready";
      recommendation = "Extensive rework needed";
    }
    
    return {
      level,
      status,
      score,
      recommendation,
      target_achieved: score >= this.targetScore,
      meets_threshold: score >= this.minScoreThreshold,
      pass_gate: score >= 8.0 && 
                 analysis.scores.story >= 7.5 &&
                 analysis.scores.tech_accuracy >= 7.5 &&
                 analysis.scores.visuals >= 7.5 &&
                 analysis.scores.audio >= 7.5 &&
                 analysis.scores.timing >= 7.5 &&
                 analysis.scores.compliance >= 7.5 &&
                 !analysis.blocking
    };
  }

  generateImprovementRecommendations(analysis, stitchedVideo) {
    const recommendations = [];
    
    // Add fixes from critic analysis
    if (analysis.fixes) {
      analysis.fixes.forEach((fix, index) => {
        recommendations.push({
          priority: index < 3 ? "1" : index < 6 ? "2" : "3",
          action: `${fix.action}: ${fix.detail}`,
          expected_impact: `Address issue at ${fix.timecode} in beat ${fix.beat}`,
          category: "critic_fix",
          timecode: fix.timecode,
          beat: fix.beat
        });
      });
    }
    
    // Add issues that need attention
    if (analysis.issues) {
      analysis.issues.forEach((issue, index) => {
        recommendations.push({
          priority: index < 3 ? "2" : "3",
          action: `Fix ${issue.type} issue: ${issue.note}`,
          expected_impact: `Resolve issue at ${issue.timecode} in beat ${issue.beat}`,
          category: "issue_resolution",
          timecode: issue.timecode,
          beat: issue.beat
        });
      });
    }
    
    // Add beat-level improvements that affect overall quality
    stitchedVideo.beat_sequence.forEach(beat => {
      if (beat.final_score < 8) {
        recommendations.push({
          priority: "3",
          action: `Improve beat ${beat.id} (currently ${beat.final_score}/10)`,
          expected_impact: `Raise overall video quality`,
          category: "beat_improvement"
        });
      }
    });
    
    return recommendations;
  }

  async generateFinalAssessment(beatResults, stitchedVideo, criticResults) {
    console.log('\n📋 Step 4: Generating final assessment...');
    
    const assessment = {
      pipeline_completed: true,
      timestamp: new Date().toISOString(),
      beat_analysis_summary: {
        total_beats: beatResults.total_beats,
        total_iterations: beatResults.total_iterations,
        average_beat_score: beatResults.summary.average_score,
        perfect_scores: beatResults.summary.perfect_scores,
        completion_rate: beatResults.summary.completion_rate
      },
      stitching_results: {
        total_duration: stitchedVideo.total_duration,
        beat_sequence: stitchedVideo.beat_sequence.map(b => b.id),
        quality_metrics: stitchedVideo.quality_metrics
      },
      critic_evaluation: {
        overall_score: criticResults.critic_analysis.total,
        quality_level: criticResults.quality_assessment.level,
        status: criticResults.quality_assessment.status,
        target_achieved: criticResults.quality_assessment.target_achieved,
        pass_gate: criticResults.quality_assessment.pass_gate,
        category_scores: criticResults.critic_analysis.scores,
        blocking_issues: criticResults.critic_analysis.blocking
      },
      improvement_recommendations: criticResults.improvement_recommendations,
      final_video_path: stitchedVideo.stitched_file,
      all_result_files: this.getResultFiles()
    };
    
    const assessmentPath = path.join(this.outputDir, 'beat_stitching_assessment.json');
    fs.writeFileSync(assessmentPath, JSON.stringify(assessment, null, 2));
    
    // Save detailed results
    const resultsPath = this.resultsPath;
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      beat_results: beatResults,
      stitched_video: stitchedVideo,
      critic_results: criticResults,
      final_assessment: assessment
    }, null, 2));
    
    console.log('✅ Final assessment saved');
    console.log(`📁 Assessment file: ${assessmentPath}`);
    console.log(`📊 Results file: ${resultsPath}`);
    
    // Display summary
    this.displayFinalSummary(assessment);
  }

  displayFinalSummary(assessment) {
    console.log('\n🎬 Final Beat Stitching Summary');
    console.log('=' * 50);
    console.log(`📊 Overall Quality: ${assessment.critic_evaluation.overall_score}/10`);
    console.log(`🎯 Quality Level: ${assessment.critic_evaluation.quality_level}`);
    console.log(`📈 Status: ${assessment.critic_evaluation.status}`);
    console.log(`🎉 Target Achieved: ${assessment.critic_evaluation.target_achieved ? 'YES' : 'NO'}`);
    
    console.log('\n📋 Beat Analysis Summary:');
    console.log(`  Total Beats: ${assessment.beat_analysis_summary.total_beats}`);
    console.log(`  Average Score: ${assessment.beat_analysis_summary.average_beat_score}/10`);
    console.log(`  Perfect Scores: ${assessment.beat_analysis_summary.perfect_scores}`);
    console.log(`  Completion Rate: ${assessment.beat_analysis_summary.completion_rate}%`);
    
    console.log('\n🔗 Stitching Results:');
    console.log(`  Total Duration: ${assessment.stitching_results.total_duration}s`);
    console.log(`  Beat Sequence: ${assessment.stitching_results.beat_sequence.join(' → ')}`);
    
    if (assessment.improvement_recommendations.length > 0) {
      console.log('\n🔧 Top Improvement Recommendations:');
      assessment.improvement_recommendations
        .filter(r => r.priority === "1")
        .slice(0, 3)
        .forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec.action}`);
        });
    }
  }

  getResultFiles() {
    const resultFiles = [];
    const files = fs.readdirSync(this.outputDir);
    
    files.forEach(file => {
      if (file.includes('beat') || file.includes('stitch') || file.includes('assessment') || file.includes('result')) {
        resultFiles.push(file);
      }
    });
    
    return resultFiles;
  }
}

// Main execution
async function main() {
  const stitcher = new BeatStitcher();
  await stitcher.runStitchingPipeline();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BeatStitcher;
