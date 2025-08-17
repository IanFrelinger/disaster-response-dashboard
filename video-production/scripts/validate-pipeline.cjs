#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PipelineValidator {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.issues = [];
    this.warnings = [];
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

  validateFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log(`${description} found: ${path.basename(filePath)}`, 'success');
      return true;
    } else {
      this.log(`${description} missing: ${path.basename(filePath)}`, 'error');
      this.issues.push(`Missing file: ${description}`);
      return false;
    }
  }

  validateDirectoryExists(dirPath, description) {
    if (fs.existsSync(dirPath)) {
      this.log(`${description} directory exists`, 'success');
      return true;
    } else {
      this.log(`${description} directory missing`, 'warning');
      this.warnings.push(`Missing directory: ${description}`);
      return false;
    }
  }

  validateTimelineConfig() {
    this.log('Validating timeline configuration...', 'info');
    
    const timelineFile = path.join(this.projectRoot, 'config', 'timeline-fixed.yaml');
    if (!this.validateFileExists(timelineFile, 'Enhanced timeline configuration')) {
      return false;
    }

    try {
      const content = fs.readFileSync(timelineFile, 'utf8');
      
      // Check for required elements
      const requiredElements = [
        'personal_intro',
        'user_persona', 
        'foundry_architecture',
        'action_demonstration',
        'strong_cta'
      ];

      let allElementsPresent = true;
      requiredElements.forEach(element => {
        if (content.includes(element)) {
          this.log(`Required element found: ${element}`, 'success');
        } else {
          this.log(`Required element missing: ${element}`, 'error');
          this.issues.push(`Missing required element: ${element}`);
          allElementsPresent = false;
        }
      });

      // Check duration
      if (content.includes('duration: 420')) {
        this.log('Correct duration: 7 minutes (420 seconds)', 'success');
      } else {
        this.log('Duration not set to 7 minutes', 'warning');
        this.warnings.push('Duration may not be 7 minutes');
      }

      return allElementsPresent;
    } catch (error) {
      this.log(`Error reading timeline file: ${error}`, 'error');
      this.issues.push(`Timeline file read error: ${error}`);
      return false;
    }
  }

  validateNarrationConfig() {
    this.log('Validating narration configuration...', 'info');
    
    const narrationFile = path.join(this.projectRoot, 'config', 'narration-fixed.yaml');
    if (!this.validateFileExists(narrationFile, 'Enhanced narration configuration')) {
      return false;
    }

    try {
      const content = fs.readFileSync(narrationFile, 'utf8');
      
      // Check for required scenes
      const requiredScenes = [
        'personal_intro',
        'user_persona',
        'api_architecture',
        'map_interaction'
      ];

      let allScenesPresent = true;
      requiredScenes.forEach(scene => {
        if (content.includes(scene)) {
          this.log(`Required scene found: ${scene}`, 'success');
        } else {
          this.log(`Required scene missing: ${scene}`, 'error');
          this.issues.push(`Missing required scene: ${scene}`);
          allScenesPresent = false;
        }
      });

      // Check duration
      if (content.includes('duration: 420')) {
        this.log('Correct narration duration: 7 minutes (420 seconds)', 'success');
      } else {
        this.log('Narration duration not set to 7 minutes', 'warning');
        this.warnings.push('Narration duration may not be 7 minutes');
      }

      return allScenesPresent;
    } catch (error) {
      this.log(`Error reading narration file: ${error}`, 'error');
      this.issues.push(`Narration file read error: ${error}`);
      return false;
    }
  }

  validateScripts() {
    this.log('Validating production scripts...', 'info');
    
    const requiredScripts = [
      'generate-enhanced-captures.ts',
      'run-enhanced-production.ts'
    ];

    let allScriptsPresent = true;
    requiredScripts.forEach(script => {
      const scriptPath = path.join(this.projectRoot, 'scripts', script);
      if (this.validateFileExists(scriptPath, `Production script: ${script}`)) {
        // Check if script is readable
        try {
          fs.accessSync(scriptPath, fs.constants.R_OK);
          this.log(`Script is readable: ${script}`, 'success');
        } catch (error) {
          this.log(`Script not readable: ${script}`, 'error');
          this.issues.push(`Script not readable: ${script}`);
          allScriptsPresent = false;
        }
      } else {
        allScriptsPresent = false;
      }
    });

    return allScriptsPresent;
  }

  validateDirectories() {
    this.log('Validating directory structure...', 'info');
    
    const requiredDirs = [
      'captures',
      'output',
      'config'
    ];

    let allDirsPresent = true;
    requiredDirs.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (!this.validateDirectoryExists(dirPath, dir)) {
        allDirsPresent = false;
      }
    });

    return allDirsPresent;
  }

  validateDependencies() {
    this.log('Checking for required dependencies...', 'info');
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      this.log('Node modules directory found', 'success');
      
      // Check for key dependencies
      const keyDeps = ['playwright', 'typescript'];
      keyDeps.forEach(dep => {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
          this.log(`Dependency found: ${dep}`, 'success');
        } else {
          this.log(`Dependency missing: ${dep}`, 'warning');
          this.warnings.push(`Missing dependency: ${dep}`);
        }
      });
    } else {
      this.log('Node modules directory not found', 'warning');
      this.warnings.push('Node modules directory not found - run npm install');
    }

    return true;
  }

  runValidation() {
    this.log('🚀 Starting Enhanced Video Production Pipeline Validation', 'info');
    this.log('This validation checks all components needed for the enhanced demo', 'info');
    
    let validationPassed = true;
    
    // Run all validation checks
    if (!this.validateTimelineConfig()) validationPassed = false;
    if (!this.validateNarrationConfig()) validationPassed = false;
    if (!this.validateScripts()) validationPassed = false;
    if (!this.validateDirectories()) validationPassed = false;
    this.validateDependencies(); // This one can have warnings but not fail validation
    
    // Summary
    console.log('\n' + '='.repeat(60));
    this.log('VALIDATION SUMMARY', 'info');
    console.log('='.repeat(60));
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      this.log('🎉 All validation checks passed! Pipeline is ready to run.', 'success');
    } else {
      if (this.issues.length > 0) {
        this.log(`❌ ${this.issues.length} critical issues found:`, 'error');
        this.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
        validationPassed = false;
      }
      
      if (this.warnings.length > 0) {
        this.log(`⚠️  ${this.warnings.length} warnings:`, 'warning');
        this.warnings.forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
      }
    }
    
    if (validationPassed) {
      this.log('Pipeline validation completed successfully', 'success');
      this.log('Ready to run enhanced video production', 'success');
    } else {
      this.log('Pipeline validation failed - please fix issues before proceeding', 'error');
    }
    
    return validationPassed;
  }
}

// Main execution
if (require.main === module) {
  const validator = new PipelineValidator();
  const success = validator.runValidation();
  process.exit(success ? 0 : 1);
}

module.exports = { PipelineValidator };
