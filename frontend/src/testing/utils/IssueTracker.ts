/**
 * IssueTracker - Tracks and manages test failures and issues
 */

export interface Issue {
  id: string;
  timestamp: Date;
  testName: string;
  suiteName: string;
  error: string;
  remediation: string;
  status: 'open' | 'addressed' | 'ignored';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

export interface IssueReport {
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  issues: Issue[];
  summary: string;
}

export class IssueTracker {
  private issues: Issue[] = [];
  private readonly maxIssues = 100; // Prevent memory issues

  /**
   * Record a test failure as an issue
   */
  recordIssue(
    testName: string,
    suiteName: string,
    error: string,
    remediation: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata: Record<string, any> = {}
  ): string {
    const issue: Issue = {
      id: `ISSUE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      testName,
      suiteName,
      error,
      remediation,
      status: 'open',
      priority,
      metadata
    };

    this.issues.unshift(issue); // Add to beginning
    
    // Keep only the most recent issues
    if (this.issues.length > this.maxIssues) {
      this.issues = this.issues.slice(0, this.maxIssues);
    }

    console.log(`📋 Issue recorded: ${issue.id}`);
    console.log(`🔧 Remediation: ${remediation}`);
    
    return issue.id;
  }

  /**
   * Mark an issue as addressed
   */
  markAsAddressed(issueId: string): boolean {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'addressed';
      console.log(`✅ Issue ${issueId} marked as addressed`);
      return true;
    }
    return false;
  }

  /**
   * Mark an issue as ignored
   */
  markAsIgnored(issueId: string): boolean {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'ignored';
      console.log(`⏭️ Issue ${issueId} marked as ignored`);
      return true;
    }
    return false;
  }

  /**
   * Get all open issues
   */
  getOpenIssues(): Issue[] {
    return this.issues.filter(i => i.status === 'open');
  }

  /**
   * Get critical issues
   */
  getCriticalIssues(): Issue[] {
    return this.issues.filter(i => i.priority === 'critical' && i.status === 'open');
  }

  /**
   * Generate issue report
   */
  generateReport(): IssueReport {
    const openIssues = this.getOpenIssues();
    const criticalIssues = this.getCriticalIssues();
    
    const summary = this.generateSummary(openIssues, criticalIssues);
    
    return {
      totalIssues: this.issues.length,
      openIssues: openIssues.length,
      criticalIssues: criticalIssues.length,
      issues: this.issues,
      summary
    };
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(openIssues: Issue[], criticalIssues: Issue[]): string {
    if (openIssues.length === 0) {
      return '✅ No open issues';
    }

    if (criticalIssues.length > 0) {
      return `🚨 ${criticalIssues.length} critical issues require immediate attention`;
    }

    if (openIssues.length <= 3) {
      return `⚠️ ${openIssues.length} issues need attention`;
    }

    return `⚠️ ${openIssues.length} issues need attention (${criticalIssues.length} critical)`;
  }

  /**
   * Clear all issues
   */
  clear(): void {
    this.issues = [];
    console.log('🗑️ All issues cleared');
  }

  /**
   * Export issues to JSON
   */
  exportToJson(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      issues: this.issues,
      report: this.generateReport()
    }, null, 2);
  }

  /**
   * Import issues from JSON
   */
  importFromJson(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.issues && Array.isArray(data.issues)) {
        this.issues = data.issues;
        console.log(`📥 Imported ${this.issues.length} issues`);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to import issues:', error);
    }
    return false;
  }
}

// Global issue tracker instance
export const issueTracker = new IssueTracker();
