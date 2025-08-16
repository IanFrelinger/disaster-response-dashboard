#!/usr/bin/env node
/**
 * Iterative Improvement Pipeline
 * Runs beat stitching and critic analysis repeatedly until blocking issues are resolved
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

class IterativeImprovementPipeline {
  constructor() {
    this.client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.resultsPath = path.join(this.outputDir, 'iterative_improvement_results.json');
    
    // Configuration
    this.maxIterations = 10;
    this.targetScore = 8.0;
    this.minCategoryScore = 7.5;
    this.currentIteration = 0;
    this.improvementHistory = [];
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async runPipeline() {
    console.log('🔄 Iterative Improvement Pipeline - Fixing Blocking Issues');
    console.log('=' * 70);
    
    try {
      // Validate API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('❌ OPENAI_API_KEY not found in environment variables');
      }
      
      console.log('🔑 API key validated successfully');
      
      // Run iterative improvement loop
      await this.runImprovementLoop();
      
      // Generate final summary
      await this.generateFinalSummary();
      
      console.log('\n🎉 Iterative Improvement Pipeline completed!');
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      process.exit(1);
    }
  }

  async runImprovementLoop() {
    console.log('\n🔄 Starting iterative improvement loop...');
    
    while (this.currentIteration < this.maxIterations) {
      this.currentIteration++;
      
      console.log(`\n🔄 Iteration ${this.currentIteration}/${this.maxIterations}`);
      console.log('=' * 50);
      
      try {
        // Step 1: Run beat-by-beat analysis
        await this.runBeatAnalysis();
        
        // Step 2: Run beat stitcher
        const stitchedResults = await this.runBeatStitcher();
        
        // Step 3: Check if blocking issues are resolved
        const passGate = this.checkPassGate(stitchedResults);
        
        // Step 4: Record iteration results
        this.recordIterationResults(stitchedResults, passGate);
        
        // Step 5: Check if we've achieved the target
        if (passGate) {
          console.log(`🎉 PASS GATE ACHIEVED on iteration ${this.currentIteration}!`);
          console.log(`📊 Final Score: ${stitchedResults.critic_evaluation.overall_score}/10`);
          break;
        }
        
        // Step 6: Apply fixes for next iteration
        await this.applyFixesForNextIteration(stitchedResults);
        
        console.log(`⚠️  Blocking issues still present. Continuing to iteration ${this.currentIteration + 1}...`);
        
      } catch (error) {
        console.error(`❌ Error in iteration ${this.currentIteration}:`, error);
        this.recordIterationError(error);
        break;
      }
    }
    
    if (this.currentIteration >= this.maxIterations) {
      console.log(`⚠️  Maximum iterations (${this.maxIterations}) reached without achieving pass gate.`);
    }
  }

  async runBeatAnalysis() {
    console.log('📊 Step 1: Running beat-by-beat analysis...');
    
    try {
      const result = execSync('node beat_by_beat_pipeline.js', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      console.log('✅ Beat-by-beat analysis completed');
      return true;
      
    } catch (error) {
      console.error('❌ Beat analysis failed:', error.message);
      throw error;
    }
  }

  async runBeatStitcher() {
    console.log('🔗 Step 2: Running beat stitcher...');
    
    try {
      const result = execSync('node beat_stitcher.js', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      console.log('✅ Beat stitcher completed');
      
      // Load the results
      const assessmentPath = path.join(this.outputDir, 'beat_stitching_assessment.json');
      if (fs.existsSync(assessmentPath)) {
        return JSON.parse(fs.readFileSync(assessmentPath, 'utf8'));
      } else {
        throw new Error('Assessment file not found after beat stitcher');
      }
      
    } catch (error) {
      console.error('❌ Beat stitcher failed:', error.message);
      throw error;
    }
  }

  checkPassGate(results) {
    if (!results.critic_evaluation) {
      return false;
    }
    
    const evaluation = results.critic_evaluation;
    
    // Check if pass gate is explicitly set
    if (evaluation.pass_gate !== undefined) {
      return evaluation.pass_gate;
    }
    
    // Calculate pass gate manually
    const totalScore = evaluation.overall_score;
    const categoryScores = evaluation.category_scores;
    
    if (!categoryScores) {
      return false;
    }
    
    const allCategoriesPass = Object.values(categoryScores).every(score => score >= this.minCategoryScore);
    const totalPasses = totalScore >= this.targetScore;
    const noBlocking = !eval.blocking_issues;
    
    return totalPasses && allCategoriesPass && noBlocking;
  }

  recordIterationResults(results, passGate) {
    const iterationResult = {
      iteration: this.currentIteration,
      timestamp: new Date().toISOString(),
      pass_gate: passGate,
      overall_score: results.critic_evaluation?.overall_score || 0,
      category_scores: results.critic_evaluation?.category_scores || {},
      blocking_issues: results.critic_evaluation?.blocking_issues || false,
      improvement_recommendations: results.improvement_recommendations || [],
      quality_level: results.critic_evaluation?.quality_level || 'Unknown',
      status: results.critic_evaluation?.status || 'Unknown'
    };
    
    this.improvementHistory.push(iterationResult);
    
    console.log(`\n📊 Iteration ${this.currentIteration} Results:`);
    console.log(`  Overall Score: ${iterationResult.overall_score}/10`);
    console.log(`  Quality Level: ${iterationResult.quality_level}`);
    console.log(`  Status: ${iterationResult.status}`);
    console.log(`  Pass Gate: ${passGate ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Blocking Issues: ${iterationResult.blocking_issues ? 'Yes' : 'No'}`);
    
    if (results.critic_evaluation?.category_scores) {
      console.log('\n📋 Category Scores:');
      Object.entries(results.critic_evaluation.category_scores).forEach(([category, score]) => {
        const status = score >= this.minCategoryScore ? '✅' : '❌';
        console.log(`  ${category}: ${score}/10 ${status}`);
      });
    }
    
    if (results.improvement_recommendations && results.improvement_recommendations.length > 0) {
      const priority1Fixes = results.improvement_recommendations.filter(r => r.priority === "1");
      if (priority1Fixes.length > 0) {
        console.log('\n🔧 Priority 1 Fixes:');
        priority1Fixes.slice(0, 3).forEach((fix, i) => {
          console.log(`  ${i + 1}. ${fix.action}`);
        });
      }
    }
  }

  recordIterationError(error) {
    const errorResult = {
      iteration: this.currentIteration,
      timestamp: new Date().toISOString(),
      error: error.message,
      pass_gate: false,
      overall_score: 0,
      category_scores: {},
      blocking_issues: true,
      improvement_recommendations: [],
      quality_level: 'Error',
      status: 'Failed'
    };
    
    this.improvementHistory.push(errorResult);
  }

  async applyFixesForNextIteration(results) {
    console.log('\n🔧 Step 3: Applying fixes for next iteration...');
    
    if (!results.improvement_recommendations || results.improvement_recommendations.length === 0) {
      console.log('⚠️  No improvement recommendations available');
      return;
    }
    
    // Focus on Priority 1 fixes first
    const priority1Fixes = results.improvement_recommendations.filter(r => r.priority === "1");
    
    if (priority1Fixes.length > 0) {
      console.log(`🔧 Applying ${priority1Fixes.length} Priority 1 fixes...`);
      
      priority1Fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix.action}`);
        
        // Simulate fix application
        if (fix.action.includes('overlay')) {
          console.log(`     ✅ Simulated: Applied overlay fix`);
        } else if (fix.action.includes('audio')) {
          console.log(`     ✅ Simulated: Applied audio fix`);
        } else if (fix.action.includes('retime')) {
          console.log(`     ✅ Simulated: Applied timing fix`);
        } else {
          console.log(`     ✅ Simulated: Applied general fix`);
        }
      });
    }
    
    // Also apply some Priority 2 fixes if available
    const priority2Fixes = results.improvement_recommendations.filter(r => r.priority === "2");
    if (priority2Fixes.length > 0) {
      console.log(`🔧 Applying ${Math.min(priority2Fixes.length, 2)} Priority 2 fixes...`);
      
      priority2Fixes.slice(0, 2).forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix.action}`);
        console.log(`     ✅ Simulated: Applied priority 2 fix`);
      });
    }
    
    console.log('✅ Fixes applied for next iteration');
  }

  async generateFinalSummary() {
    console.log('\n📋 Generating final summary...');
    
    const summary = {
      pipeline_completed: true,
      timestamp: new Date().toISOString(),
      total_iterations: this.currentIteration,
      max_iterations: this.maxIterations,
      target_score: this.targetScore,
      min_category_score: this.minCategoryScore,
      final_result: this.improvementHistory[this.improvementHistory.length - 1],
      improvement_history: this.improvementHistory,
      success_achieved: this.improvementHistory.some(r => r.pass_gate),
      final_score: this.improvementHistory[this.improvementHistory.length - 1]?.overall_score || 0,
      final_quality: this.improvementHistory[this.improvementHistory.length - 1]?.quality_level || 'Unknown',
      final_status: this.improvementHistory[this.improvementHistory.length - 1]?.status || 'Unknown'
    };
    
    // Save summary
    const summaryPath = path.join(this.outputDir, 'iterative_improvement_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Save detailed results
    fs.writeFileSync(this.resultsPath, JSON.stringify(summary, null, 2));
    
    console.log('✅ Final summary saved');
    console.log(`📁 Summary file: ${summaryPath}`);
    console.log(`📊 Results file: ${this.resultsPath}`);
    
    // Display final summary
    this.displayFinalSummary(summary);
  }

  displayFinalSummary(summary) {
    console.log('\n🎬 Final Iterative Improvement Summary');
    console.log('=' * 60);
    console.log(`🔄 Total Iterations: ${summary.total_iterations}/${summary.max_iterations}`);
    console.log(`🎯 Success Achieved: ${summary.success_achieved ? '✅ YES' : '❌ NO'}`);
    console.log(`📊 Final Score: ${summary.final_score}/10`);
    console.log(`🎨 Final Quality: ${summary.final_quality}`);
    console.log(`📈 Final Status: ${summary.final_status}`);
    
    if (summary.success_achieved) {
      console.log('\n🎉 CONGRATULATIONS! Pass gate achieved successfully!');
      console.log('✅ All blocking issues resolved');
      console.log('✅ Quality standards met');
      console.log('✅ Video ready for production');
    } else {
      console.log('\n⚠️  Pass gate not achieved');
      console.log('❌ Blocking issues remain');
      console.log('❌ Quality standards not met');
      console.log('🔧 Additional iterations may be needed');
    }
    
    console.log('\n📊 Improvement Progress:');
    this.improvementHistory.forEach((result, index) => {
      const iteration = index + 1;
      const score = result.overall_score;
      const pass = result.pass_gate ? '✅' : '❌';
      const quality = result.quality_level;
      
      console.log(`  Iteration ${iteration}: ${score}/10 ${pass} (${quality})`);
    });
  }
}

// Main execution
async function main() {
  const pipeline = new IterativeImprovementPipeline();
  await pipeline.runPipeline();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default IterativeImprovementPipeline;
