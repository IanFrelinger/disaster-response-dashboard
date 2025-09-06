#!/usr/bin/env node

/**
 * Error Correlation Analysis Tool
 * Analyzes error correlations between frontend, backend, and UI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ErrorCorrelationAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      analysis: {
        frontend: { errors: [], patterns: [] },
        backend: { errors: [], patterns: [] },
        correlations: [],
        recommendations: []
      },
      summary: {
        totalErrors: 0,
        criticalIssues: 0,
        resolvedIssues: 0,
        correlationStrength: 0
      }
    };
  }

  async analyze() {
    console.log('🔍 Starting error correlation analysis...');
    
    try {
      // Analyze frontend errors
      await this.analyzeFrontendErrors();
      
      // Analyze backend errors
      await this.analyzeBackendErrors();
      
      // Find correlations
      this.findCorrelations();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Generate summary
      this.generateSummary();
      
      // Save results
      this.saveResults();
      
      console.log('✅ Analysis complete!');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeFrontendErrors() {
    console.log('📱 Analyzing frontend errors...');
    
    try {
      // Run frontend linting
      const lintResult = this.runCommand('cd frontend && pnpm lint 2>&1', false);
      this.parseLintOutput(lintResult, 'frontend');
      
      // Run frontend type checking
      const typeResult = this.runCommand('cd frontend && pnpm typecheck 2>&1', false);
      this.parseTypeCheckOutput(typeResult, 'frontend');
      
      // Check for runtime errors in console
      const consoleErrors = this.extractConsoleErrors();
      this.results.analysis.frontend.errors.push(...consoleErrors);
      
    } catch (error) {
      console.warn('⚠️  Frontend analysis failed:', error.message);
    }
  }

  async analyzeBackendErrors() {
    console.log('🐍 Analyzing backend errors...');
    
    try {
      // Run backend type checking
      const mypyResult = this.runCommand('cd backend && mypy --exclude="ontology/" . 2>&1', false);
      this.parseMypyOutput(mypyResult, 'backend');
      
      // Run backend linting
      const ruffResult = this.runCommand('cd backend && ruff check . 2>&1', false);
      this.parseRuffOutput(ruffResult, 'backend');
      
      // Check for import errors
      const importErrors = this.checkImportErrors();
      this.results.analysis.backend.errors.push(...importErrors);
      
    } catch (error) {
      console.warn('⚠️  Backend analysis failed:', error.message);
    }
  }

  runCommand(command, throwOnError = true) {
    try {
      return execSync(command, { encoding: 'utf8', timeout: 30000 });
    } catch (error) {
      if (throwOnError) throw error;
      return error.stdout || error.stderr || error.message;
    }
  }

  parseLintOutput(output, source) {
    const lines = output.split('\n');
    let currentFile = '';
    
    for (const line of lines) {
      if (line.includes('✖') && line.includes('problems')) {
        const match = line.match(/(\d+)\s+problems/);
        if (match) {
          this.results.analysis[source].errors.push({
            type: 'lint',
            count: parseInt(match[1]),
            severity: 'warning',
            message: `Linting issues found: ${match[1]} problems`
          });
        }
      }
      
      if (line.includes('.tsx:') || line.includes('.ts:')) {
        const match = line.match(/([^:]+):(\d+):(\d+)\s+(error|warning)\s+(.+)/);
        if (match) {
          const [, file, lineNum, col, severity, message] = match;
          currentFile = file;
          
          this.results.analysis[source].errors.push({
            type: 'lint',
            file: currentFile,
            line: parseInt(lineNum),
            column: parseInt(col),
            severity: severity,
            message: message,
            category: this.categorizeError(message)
          });
        }
      }
    }
  }

  parseTypeCheckOutput(output, source) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS') || line.includes('error:')) {
        const match = line.match(/([^:]+):(\d+):(\d+)[\s-]+(error|warning)[\s-]+(TS\d+)?[\s-]*(.+)/);
        if (match) {
          const [, file, lineNum, col, severity, code, message] = match;
          
          this.results.analysis[source].errors.push({
            type: 'type',
            file: file,
            line: parseInt(lineNum),
            column: parseInt(col),
            severity: severity,
            code: code,
            message: message,
            category: this.categorizeError(message)
          });
        }
      }
    }
  }

  parseMypyOutput(output, source) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error:') || line.includes('warning:')) {
        const match = line.match(/([^:]+):(\d+):\s+(error|warning):\s+(.+)/);
        if (match) {
          const [, file, lineNum, severity, message] = match;
          
          this.results.analysis[source].errors.push({
            type: 'type',
            file: file,
            line: parseInt(lineNum),
            severity: severity,
            message: message,
            category: this.categorizeError(message)
          });
        }
      }
    }
  }

  parseRuffOutput(output, source) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('.py:') && (line.includes('error') || line.includes('warning'))) {
        const match = line.match(/([^:]+):(\d+):(\d+):\s+(error|warning)\s+([A-Z]\d+)\s+(.+)/);
        if (match) {
          const [, file, lineNum, col, severity, code, message] = match;
          
          this.results.analysis[source].errors.push({
            type: 'lint',
            file: file,
            line: parseInt(lineNum),
            column: parseInt(col),
            severity: severity,
            code: code,
            message: message,
            category: this.categorizeError(message)
          });
        }
      }
    }
  }

  extractConsoleErrors() {
    // This would typically read from browser console logs
    // For now, return empty array as we don't have access to runtime logs
    return [];
  }

  checkImportErrors() {
    const errors = [];
    
    // Check for common import issues
    const commonImports = [
      'palantir.ontology',
      'palantir.aip',
      'palantir.transforms',
      'geopandas',
      'shapely',
      'networkx'
    ];
    
    for (const importName of commonImports) {
      try {
        const result = this.runCommand(`cd backend && python -c "import ${importName}" 2>&1`, false);
        if (result.includes('ModuleNotFoundError') || result.includes('ImportError')) {
          errors.push({
            type: 'import',
            module: importName,
            severity: 'error',
            message: `Module not found: ${importName}`,
            category: 'ontology'
          });
        }
      } catch (error) {
        // Module not available
      }
    }
    
    return errors;
  }

  categorizeError(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('ontology') || msg.includes('palantir')) {
      return 'ontology';
    }
    if (msg.includes('type') || msg.includes('mypy') || msg.includes('typescript')) {
      return 'type';
    }
    if (msg.includes('import') || msg.includes('module')) {
      return 'import';
    }
    if (msg.includes('validation') || msg.includes('schema')) {
      return 'validation';
    }
    if (msg.includes('network') || msg.includes('connection')) {
      return 'network';
    }
    if (msg.includes('performance') || msg.includes('timeout')) {
      return 'performance';
    }
    
    return 'runtime';
  }

  findCorrelations() {
    console.log('🔗 Finding error correlations...');
    
    const frontendErrors = this.results.analysis.frontend.errors;
    const backendErrors = this.results.analysis.backend.errors;
    
    // Find cross-stack correlations
    for (const frontendError of frontendErrors) {
      for (const backendError of backendErrors) {
        if (this.areCorrelated(frontendError, backendError)) {
          this.results.analysis.correlations.push({
            type: 'cross-stack',
            confidence: this.calculateCorrelationConfidence(frontendError, backendError),
            frontend: frontendError,
            backend: backendError,
            description: this.generateCorrelationDescription(frontendError, backendError)
          });
        }
      }
    }
    
    // Find pattern correlations within each stack
    this.findPatternCorrelations(frontendErrors, 'frontend');
    this.findPatternCorrelations(backendErrors, 'backend');
  }

  areCorrelated(error1, error2) {
    // Same category
    if (error1.category === error2.category) {
      return true;
    }
    
    // Similar message content
    if (this.similarity(error1.message, error2.message) > 0.7) {
      return true;
    }
    
    // Same file (if both have file info)
    if (error1.file && error2.file && error1.file === error2.file) {
      return true;
    }
    
    return false;
  }

  similarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(s1, s2) {
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[s2.length][s1.length];
  }

  calculateCorrelationConfidence(error1, error2) {
    let confidence = 0;
    
    // Category match
    if (error1.category === error2.category) confidence += 0.4;
    
    // Message similarity
    confidence += this.similarity(error1.message, error2.message) * 0.3;
    
    // File match
    if (error1.file && error2.file && error1.file === error2.file) confidence += 0.3;
    
    return Math.min(confidence, 1.0);
  }

  generateCorrelationDescription(error1, error2) {
    if (error1.category === error2.category) {
      return `Cross-stack ${error1.category} errors detected`;
    }
    
    if (error1.file && error2.file && error1.file === error2.file) {
      return `Same file errors in both frontend and backend`;
    }
    
    return `Similar error patterns across stacks`;
  }

  findPatternCorrelations(errors, source) {
    const patterns = new Map();
    
    for (const error of errors) {
      const key = `${error.category}-${error.type}`;
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key).push(error);
    }
    
    for (const [pattern, patternErrors] of patterns) {
      if (patternErrors.length > 1) {
        this.results.analysis.correlations.push({
          type: 'pattern',
          source: source,
          pattern: pattern,
          count: patternErrors.length,
          confidence: 0.8,
          description: `Multiple ${pattern} errors in ${source}`,
          errors: patternErrors
        });
      }
    }
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Ontology errors
    const ontologyErrors = [
      ...this.results.analysis.frontend.errors,
      ...this.results.analysis.backend.errors
    ].filter(e => e.category === 'ontology');
    
    if (ontologyErrors.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'ontology',
        title: 'Implement Palantir Foundry Integration',
        description: `${ontologyErrors.length} ontology-related errors found. Consider implementing proper Foundry platform integration or enhanced mock services.`,
        actions: [
          'Set up Palantir Foundry development environment',
          'Implement proper ontology object definitions',
          'Create comprehensive mock services for demo environment',
          'Add error handling for missing Foundry dependencies'
        ]
      });
    }
    
    // Type errors
    const typeErrors = [
      ...this.results.analysis.frontend.errors,
      ...this.results.analysis.backend.errors
    ].filter(e => e.category === 'type');
    
    if (typeErrors.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'type',
        title: 'Improve Type Safety',
        description: `${typeErrors.length} type-related errors found. Improve type definitions and add missing annotations.`,
        actions: [
          'Add missing TypeScript type annotations',
          'Create comprehensive type definitions for external libraries',
          'Fix mypy type checking issues',
          'Implement stricter type checking in CI/CD'
        ]
      });
    }
    
    // Import errors
    const importErrors = this.results.analysis.backend.errors.filter(e => e.category === 'import');
    
    if (importErrors.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'import',
        title: 'Resolve Import Dependencies',
        description: `${importErrors.length} import-related errors found. Install missing dependencies or create proper stubs.`,
        actions: [
          'Install missing Python packages',
          'Create type stubs for external libraries',
          'Update requirements.txt with all dependencies',
          'Implement proper error handling for missing imports'
        ]
      });
    }
    
    // Cross-stack correlations
    const crossStackCorrelations = this.results.analysis.correlations.filter(c => c.type === 'cross-stack');
    
    if (crossStackCorrelations.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'correlation',
        title: 'Investigate Cross-Stack Error Correlations',
        description: `${crossStackCorrelations.length} cross-stack error correlations found. These may indicate shared root causes.`,
        actions: [
          'Investigate shared data structures between frontend and backend',
          'Review API contracts and data validation',
          'Check for common configuration issues',
          'Implement unified error handling across stacks'
        ]
      });
    }
    
    this.results.analysis.recommendations = recommendations;
  }

  generateSummary() {
    const frontendErrors = this.results.analysis.frontend.errors;
    const backendErrors = this.results.analysis.backend.errors;
    const correlations = this.results.analysis.correlations;
    
    this.results.summary = {
      totalErrors: frontendErrors.length + backendErrors.length,
      criticalIssues: [...frontendErrors, ...backendErrors].filter(e => e.severity === 'error').length,
      resolvedIssues: 0, // Would need to track resolution status
      correlationStrength: correlations.length > 0 ? correlations.reduce((sum, c) => sum + c.confidence, 0) / correlations.length : 0,
      frontendErrors: frontendErrors.length,
      backendErrors: backendErrors.length,
      correlations: correlations.length,
      recommendations: this.results.analysis.recommendations.length
    };
  }

  saveResults() {
    const outputDir = 'error-analysis-results';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error-correlation-analysis-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Results saved to: ${filepath}`);
  }

  printSummary() {
    console.log('\n📊 ERROR CORRELATION ANALYSIS SUMMARY');
    console.log('=====================================');
    console.log(`Total Errors: ${this.results.summary.totalErrors}`);
    console.log(`  Frontend: ${this.results.summary.frontendErrors}`);
    console.log(`  Backend: ${this.results.summary.backendErrors}`);
    console.log(`Critical Issues: ${this.results.summary.criticalIssues}`);
    console.log(`Correlations Found: ${this.results.summary.correlations}`);
    console.log(`Correlation Strength: ${(this.results.summary.correlationStrength * 100).toFixed(1)}%`);
    console.log(`Recommendations: ${this.results.summary.recommendations}`);
    
    if (this.results.analysis.recommendations.length > 0) {
      console.log('\n💡 TOP RECOMMENDATIONS:');
      this.results.analysis.recommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 3)
        .forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
          console.log(`   ${rec.description}`);
        });
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new ErrorCorrelationAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = ErrorCorrelationAnalyzer;
