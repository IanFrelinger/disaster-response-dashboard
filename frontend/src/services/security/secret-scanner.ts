/**
 * Secret Scanning Service
 * 
 * Scans code and configuration files for potential secrets, API keys,
 * and sensitive information that should not be committed to version control.
 */

export interface SecretMatch {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  example: string;
}

export interface ScanResult {
  file: string;
  line: number;
  column: number;
  match: SecretMatch;
  content: string;
  context: string;
}

export class SecretScanner {
  private static readonly SECRET_PATTERNS: SecretMatch[] = [
    // API Keys
    {
      type: 'api-key',
      pattern: /(?:api[_-]?key|apikey|access[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
      severity: 'high',
      description: 'API Key detected',
      example: 'API_KEY=sk-1234567890abcdef'
    },
    {
      type: 'mapbox-token',
      pattern: /pk\.([a-zA-Z0-9_-]{20,})/g,
      severity: 'high',
      description: 'Mapbox public token detected',
      example: 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNpejY4M29iazA2Z2gycW4...'
    },
    {
      type: 'mapbox-secret',
      pattern: /sk\.([a-zA-Z0-9_-]{20,})/g,
      severity: 'critical',
      description: 'Mapbox secret token detected',
      example: 'sk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNpejY4M29iazA2Z2gycW4...'
    },
    
    // Database credentials
    {
      type: 'database-url',
      pattern: /(?:database[_-]?url|db[_-]?url|postgres[_-]?url|mysql[_-]?url)\s*[:=]\s*['"]?([a-zA-Z0-9+.-]+:\/\/[^'"]+)['"]?/gi,
      severity: 'critical',
      description: 'Database connection string detected',
      example: 'DATABASE_URL=postgresql://user:password@localhost:5432/dbname'
    },
    {
      type: 'database-password',
      pattern: /(?:db[_-]?password|database[_-]?password|postgres[_-]?password)\s*[:=]\s*['"]?([^'"]{8,})['"]?/gi,
      severity: 'critical',
      description: 'Database password detected',
      example: 'DB_PASSWORD=mySecretPassword123'
    },
    
    // JWT secrets
    {
      type: 'jwt-secret',
      pattern: /(?:jwt[_-]?secret|jwt[_-]?key|secret[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9+/=]{32,})['"]?/gi,
      severity: 'critical',
      description: 'JWT secret detected',
      example: 'JWT_SECRET=your-super-secret-jwt-key-here'
    },
    
    // AWS credentials
    {
      type: 'aws-access-key',
      pattern: /(?:aws[_-]?access[_-]?key[_-]?id|accesskeyid)\s*[:=]\s*['"]?([A-Z0-9]{20})['"]?/gi,
      severity: 'high',
      description: 'AWS Access Key ID detected',
      example: 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE'
    },
    {
      type: 'aws-secret-key',
      pattern: /(?:aws[_-]?secret[_-]?access[_-]?key|secretaccesskey)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
      severity: 'critical',
      description: 'AWS Secret Access Key detected',
      example: 'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    },
    
    // OAuth secrets
    {
      type: 'oauth-client-secret',
      pattern: /(?:oauth[_-]?client[_-]?secret|client[_-]?secret)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
      severity: 'high',
      description: 'OAuth client secret detected',
      example: 'OAUTH_CLIENT_SECRET=your-oauth-client-secret-here'
    },
    
    // Generic secrets
    {
      type: 'generic-secret',
      pattern: /(?:secret|password|passwd|pwd)\s*[:=]\s*['"]?([^'"]{8,})['"]?/gi,
      severity: 'medium',
      description: 'Generic secret detected',
      example: 'SECRET=mySecretValue'
    },
    
    // Private keys
    {
      type: 'private-key',
      pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
      severity: 'critical',
      description: 'Private key detected',
      example: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...'
    },
    
    // Environment variables with sensitive values
    {
      type: 'env-secret',
      pattern: /(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*['"]?([^'"]{12,})['"]?/g,
      severity: 'low',
      description: 'Environment variable with potentially sensitive value',
      example: 'export MY_SECRET_VAR=very-long-sensitive-value-here'
    }
  ];

  /**
   * Scan a file for secrets
   */
  static scanFile(content: string, filename: string): ScanResult[] {
    const results: ScanResult[] = [];
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      this.SECRET_PATTERNS.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
        
        while ((match = regex.exec(line)) !== null) {
          // Skip if it's in a comment or string literal that's clearly not a secret
          if (this.isInComment(line, match.index) || this.isInStringLiteral(line, match.index)) {
            continue;
          }

          // Skip common false positives
          if (this.isFalsePositive(match[0], pattern.type)) {
            continue;
          }

          results.push({
            file: filename,
            line: lineIndex + 1,
            column: match.index + 1,
            match: pattern,
            content: match[0],
            context: this.getContext(lines, lineIndex, match.index)
          });
        }
      });
    });

    return results;
  }

  /**
   * Scan multiple files
   */
  static scanFiles(files: { name: string; content: string }[]): ScanResult[] {
    const allResults: ScanResult[] = [];
    
    files.forEach(file => {
      const results = this.scanFile(file.content, file.name);
      allResults.push(...results);
    });

    return allResults;
  }

  /**
   * Check if a match is in a comment
   */
  private static isInComment(line: string, index: number): boolean {
    const beforeMatch = line.substring(0, index);
    return beforeMatch.includes('//') || beforeMatch.includes('/*') || beforeMatch.includes('#');
  }

  /**
   * Check if a match is in a string literal
   */
  private static isInStringLiteral(line: string, index: number): boolean {
    const beforeMatch = line.substring(0, index);
    const singleQuotes = (beforeMatch.match(/'/g) || []).length;
    const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
    const backticks = (beforeMatch.match(/`/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
  }

  /**
   * Check for common false positives
   */
  private static isFalsePositive(match: string, type: string): boolean {
    const lowerMatch = match.toLowerCase();
    
    // Skip common example values
    const exampleValues = [
      'example', 'test', 'demo', 'sample', 'placeholder',
      'your-', 'my-', 'change-', 'replace-', 'update-',
      'xxx', 'yyy', 'zzz', '123', 'abc', 'def'
    ];
    
    if (exampleValues.some(example => lowerMatch.includes(example))) {
      return true;
    }
    
    // Skip if it's clearly a variable name or function call
    if (type === 'generic-secret' && (lowerMatch.includes('=') && (lowerMatch.split('=')[0]?.trim().length || 0) < 20)) {
      return true;
    }
    
    return false;
  }

  /**
   * Get context around a match
   */
  private static getContext(lines: string[], lineIndex: number, columnIndex: number): string {
    const start = Math.max(0, lineIndex - 2);
    const end = Math.min(lines.length, lineIndex + 3);
    const contextLines = lines.slice(start, end);
    
    return contextLines.map((line, index) => {
      const actualLineNumber = start + index + 1;
      const prefix = actualLineNumber === lineIndex + 1 ? '>>> ' : '    ';
      return `${prefix}${actualLineNumber}: ${line}`;
    }).join('\n');
  }

  /**
   * Generate a security report
   */
  static generateReport(results: ScanResult[]): string {
    if (results.length === 0) {
      return '✅ No secrets detected in scanned files.';
    }

    const groupedResults = results.reduce((acc, result) => {
      const severity = result.match?.severity;
      if (severity) {
        if (!acc[severity]) {
          acc[severity] = [];
        }
        acc[severity].push(result);
      }
      return acc;
    }, {} as Record<string, ScanResult[]>);

    let report = '🚨 Secret Scanning Report\n';
    report += '========================\n\n';

    const severityOrder = ['critical', 'high', 'medium', 'low'];
    severityOrder.forEach(severity => {
      if (groupedResults[severity]) {
        const count = groupedResults[severity].length;
        const emoji = severity === 'critical' ? '🔴' : 
                     severity === 'high' ? '🟠' : 
                     severity === 'medium' ? '🟡' : '🟢';
        
        report += `${emoji} ${severity.toUpperCase()} (${count} issues)\n`;
        report += '-'.repeat(20) + '\n';
        
        groupedResults[severity].forEach(result => {
          report += `File: ${result.file}:${result.line}:${result.column}\n`;
          report += `Type: ${result.match.type}\n`;
          report += `Description: ${result.match.description}\n`;
          report += `Content: ${result.content}\n`;
          report += `Context:\n${result.context}\n\n`;
        });
      }
    });

    return report;
  }

  /**
   * Get security recommendations
   */
  static getRecommendations(): string[] {
    return [
      'Use environment variables for all secrets and API keys',
      'Never commit .env files or configuration files with secrets',
      'Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)',
      'Implement proper access controls and authentication',
      'Regularly rotate API keys and secrets',
      'Use least privilege principle for API access',
      'Monitor and audit secret usage',
      'Implement proper error handling to avoid secret leakage in logs',
      'Use different secrets for different environments (dev, staging, prod)',
      'Consider using short-lived tokens instead of long-term secrets'
    ];
  }
}

