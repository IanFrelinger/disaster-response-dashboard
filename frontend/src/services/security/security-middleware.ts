/**
 * Security Middleware
 * 
 * Provides security headers, request sanitization, and threat detection
 * for API requests and responses.
 */

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

export interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableClickjackingProtection: boolean;
  allowedOrigins: string[];
  trustedDomains: string[];
}

export interface ThreatDetection {
  suspiciousRequests: number;
  blockedRequests: number;
  lastThreat: Date | null;
  threatTypes: string[];
}

export class SecurityMiddleware {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableClickjackingProtection: true,
    allowedOrigins: ['http://localhost:3000', 'http://localhost:5173', 'https://disaster-response-dashboard.com'],
    trustedDomains: ['mapbox.com', 'api.mapbox.com', 'foundry.palantir.com']
  };

  private static config: SecurityConfig = { ...this.DEFAULT_CONFIG };
  private static threatDetection: ThreatDetection = {
    suspiciousRequests: 0,
    blockedRequests: 0,
    lastThreat: null,
    threatTypes: []
  };

  /**
   * Initialize security middleware
   */
  static initialize(config?: Partial<SecurityConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.setupSecurityHeaders();
    this.setupThreatDetection();
  }

  /**
   * Get security headers
   */
  static getSecurityHeaders(): SecurityHeaders {
    const csp = this.config.enableCSP ? this.generateCSP() : '';
    const hsts = this.config.enableHSTS ? 'max-age=31536000; includeSubDomains' : '';

    return {
      'Content-Security-Policy': csp,
      'X-Frame-Options': this.config.enableClickjackingProtection ? 'DENY' : 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': hsts
    };
  }

  /**
   * Generate Content Security Policy
   */
  private static generateCSP(): string {
    const trustedDomains = this.config.trustedDomains.join(' ');
    
    return [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${trustedDomains}`,
      `style-src 'self' 'unsafe-inline' ${trustedDomains}`,
      `img-src 'self' data: blob: ${trustedDomains}`,
      `font-src 'self' ${trustedDomains}`,
      `connect-src 'self' ${trustedDomains}`,
      `frame-src 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`
    ].join('; ');
  }

  /**
   * Sanitize request data
   */
  static sanitizeRequest(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequest(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeRequest(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Sanitize string to prevent XSS
   */
  private static sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/script/gi, 'scri pt') // Break script tags
      .replace(/<script/gi, '&lt;script') // Escape script tags
      .replace(/<\/script>/gi, '&lt;/script&gt;') // Escape closing script tags
      .trim();
  }

  /**
   * Validate request origin
   */
  static validateOrigin(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Check for suspicious patterns in request
   */
  static detectThreats(request: any): string[] {
    const threats: string[] = [];
    
    // Check for SQL injection patterns
    if (this.containsSQLInjection(request)) {
      threats.push('sql_injection');
    }
    
    // Check for XSS patterns
    if (this.containsXSS(request)) {
      threats.push('xss');
    }
    
    // Check for path traversal
    if (this.containsPathTraversal(request)) {
      threats.push('path_traversal');
    }
    
    // Check for command injection
    if (this.containsCommandInjection(request)) {
      threats.push('command_injection');
    }
    
    // Check for suspicious file uploads
    if (this.containsSuspiciousFileUpload(request)) {
      threats.push('malicious_file_upload');
    }
    
    return threats;
  }

  /**
   * Check for SQL injection patterns
   */
  private static containsSQLInjection(data: any): boolean {
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+set/gi,
      /or\s+1\s*=\s*1/gi,
      /and\s+1\s*=\s*1/gi,
      /'\s*or\s*'/gi,
      /"\s*or\s*"/gi
    ];
    
    const dataStr = JSON.stringify(data).toLowerCase();
    return sqlPatterns.some(pattern => pattern.test(dataStr));
  }

  /**
   * Check for XSS patterns
   */
  private static containsXSS(data: any): boolean {
    const xssPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi
    ];
    
    const dataStr = JSON.stringify(data);
    return xssPatterns.some(pattern => pattern.test(dataStr));
  }

  /**
   * Check for path traversal patterns
   */
  private static containsPathTraversal(data: any): boolean {
    const pathPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,
      /\.\.%2f/gi,
      /\.\.%5c/gi
    ];
    
    const dataStr = JSON.stringify(data);
    return pathPatterns.some(pattern => pattern.test(dataStr));
  }

  /**
   * Check for command injection patterns
   */
  private static containsCommandInjection(data: any): boolean {
    const commandPatterns = [
      /;\s*\w+/g,
      /\|\s*\w+/g,
      /&&\s*\w+/g,
      /\|\|\s*\w+/g,
      /`[^`]+`/g,
      /\$\([^)]+\)/g
    ];
    
    const dataStr = JSON.stringify(data);
    return commandPatterns.some(pattern => pattern.test(dataStr));
  }

  /**
   * Check for suspicious file uploads
   */
  private static containsSuspiciousFileUpload(data: any): boolean {
    const suspiciousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.war', '.ear', '.php', '.asp', '.jsp', '.sh', '.ps1'
    ];
    
    const dataStr = JSON.stringify(data).toLowerCase();
    return suspiciousExtensions.some(ext => dataStr.includes(ext));
  }

  /**
   * Log security event
   */
  static logSecurityEvent(event: string, details: Record<string, any>): void {
    console.warn(`Security Event: ${event}`, details);
    
    // In production, this would send to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToSecurityService(event, details);
    }
  }

  /**
   * Send security event to monitoring service
   */
  private static sendToSecurityService(event: string, details: Record<string, any>): void {
    // This would integrate with services like:
    // - AWS CloudWatch
    // - Datadog
    // - Splunk
    // - Custom security dashboard
    
    fetch('/api/security/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(error => {
      console.error('Failed to send security event:', error);
    });
  }

  /**
   * Setup security headers
   */
  private static setupSecurityHeaders(): void {
    // Apply security headers to document
    const headers = this.getSecurityHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', key);
        meta.setAttribute('content', value);
        document.head.appendChild(meta);
      }
    });
  }

  /**
   * Setup threat detection
   */
  private static setupThreatDetection(): void {
    // Monitor for suspicious behavior
    this.monitorSuspiciousActivity();
    
    // Setup request interceptor
    this.setupRequestInterceptor();
  }

  /**
   * Monitor suspicious activity
   */
  private static monitorSuspiciousActivity(): void {
    let requestCount = 0;
    let lastRequestTime = Date.now();
    
    // Monitor rapid requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const now = Date.now();
      const timeDiff = now - lastRequestTime;
      
      if (timeDiff < 100) { // Less than 100ms between requests
        requestCount++;
        if (requestCount > 10) {
          this.logSecurityEvent('rapid_requests', {
            count: requestCount,
            timeDiff
          });
          this.threatDetection.suspiciousRequests++;
        }
      } else {
        requestCount = 1;
      }
      
      lastRequestTime = now;
      return originalFetch.apply(this, args);
    };
  }

  /**
   * Setup request interceptor
   */
  private static setupRequestInterceptor(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Sanitize request data
      if (options?.body) {
        try {
          const data = JSON.parse(options.body as string);
          const sanitized = this.sanitizeRequest(data);
          options.body = JSON.stringify(sanitized);
        } catch {
          // If not JSON, sanitize as string
          options.body = this.sanitizeString(options.body as string);
        }
      }
      
      // Check for threats
      const threats = this.detectThreats({ url, options });
      if (threats.length > 0) {
        this.logSecurityEvent('threat_detected', {
          threats,
          url,
          options
        });
        
        this.threatDetection.blockedRequests++;
        this.threatDetection.lastThreat = new Date();
        this.threatDetection.threatTypes.push(...threats);
        
        throw new Error(`Security threat detected: ${threats.join(', ')}`);
      }
      
      return originalFetch.apply(this, args);
    };
  }

  /**
   * Get threat detection statistics
   */
  static getThreatStats(): ThreatDetection {
    return { ...this.threatDetection };
  }

  /**
   * Reset threat detection statistics
   */
  static resetThreatStats(): void {
    this.threatDetection = {
      suspiciousRequests: 0,
      blockedRequests: 0,
      lastThreat: null,
      threatTypes: []
    };
  }

  /**
   * Validate API response
   */
  static validateResponse(response: Response): boolean {
    // Check for suspicious response headers
    const suspiciousHeaders = ['x-powered-by', 'server', 'x-aspnet-version'];
    const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
      response.headers.has(header)
    );
    
    if (hasSuspiciousHeaders) {
      this.logSecurityEvent('suspicious_response_headers', {
        headers: Array.from(response.headers.entries())
      });
    }
    
    // Check response status
    if (response.status >= 400) {
      this.logSecurityEvent('error_response', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
    }
    
    return true;
  }
}

