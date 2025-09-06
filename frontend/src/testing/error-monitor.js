/**
 * Real-time Error Monitor for Map Layers
 * Helps distinguish between actual errors and normal browser warnings
 */

class MapErrorMonitor {
  constructor() {
    this.errorCounts = {};
    this.warningCounts = {};
    this.criticalErrors = [];
    this.normalWarnings = [];
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Override console methods to capture errors
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    console.error = (...args) => {
      this.categorizeMessage('error', args.join(' '));
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.categorizeMessage('warning', args.join(' '));
      originalWarn.apply(console, args);
    };
    
    console.log = (...args) => {
      this.categorizeMessage('log', args.join(' '));
      originalLog.apply(console, args);
    };
    
    // Monitor for page errors
    window.addEventListener('error', (event) => {
      this.categorizeMessage('pageerror', event.message);
    });
    
    // Monitor for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.categorizeMessage('promise', event.reason);
    });
  }
  
  categorizeMessage(type, message) {
    const timestamp = new Date().toISOString();
    const messageStr = message.toString();
    
    // Check if it's a critical error
    if (this.isCriticalError(messageStr)) {
      this.criticalErrors.push({
        timestamp,
        type,
        message: messageStr
      });
      console.log(`🚨 CRITICAL ERROR: ${messageStr}`);
    }
    // Check if it's a normal browser warning
    else if (this.isNormalWarning(messageStr)) {
      this.normalWarnings.push({
        timestamp,
        type,
        message: messageStr
      });
      // Don't log normal warnings to avoid spam
    }
    // Check if it's a map-related warning
    else if (this.isMapRelated(messageStr)) {
      if (!this.warningCounts[messageStr]) {
        this.warningCounts[messageStr] = 0;
      }
      this.warningCounts[messageStr]++;
      
      // Only log first occurrence of each map warning
      if (this.warningCounts[messageStr] === 1) {
        console.log(`🗺️ MAP WARNING: ${messageStr}`);
      }
    }
    // Count other errors
    else if (type === 'error') {
      if (!this.errorCounts[messageStr]) {
        this.errorCounts[messageStr] = 0;
      }
      this.errorCounts[messageStr]++;
      
      console.log(`❌ ERROR: ${messageStr}`);
    }
  }
  
  isCriticalError(message) {
    const criticalPatterns = [
      /cannot read property/i,
      /undefined is not a function/i,
      /network error/i,
      /failed to load/i,
      /map not ready/i,
      /layer failed to load/i,
      /source not found/i
    ];
    
    return criticalPatterns.some(pattern => pattern.test(message));
  }
  
  isNormalWarning(message) {
    const normalPatterns = [
      /webgl warning/i,
      /gpu stall due to readpixels/i,
      /alpha-premult and y-flip are deprecated/i,
      /webgl_debug_renderer_info is deprecated/i,
      /installtrigger is deprecated/i,
      /mouseevent.mozpressure is deprecated/i,
      /mouseevent.mozinputsource is deprecated/i,
      /after reporting \d+, no further warnings will be reported/i
    ];
    
    return normalPatterns.some(pattern => pattern.test(message));
  }
  
  isMapRelated(message) {
    const mapPatterns = [
      /mapbox/i,
      /map/i,
      /layer/i,
      /terrain/i,
      /source/i,
      /webgl/i
    ];
    
    return mapPatterns.some(pattern => pattern.test(message));
  }
  
  getReport() {
    return {
      criticalErrors: this.criticalErrors,
      normalWarnings: this.normalWarnings,
      errorCounts: this.errorCounts,
      warningCounts: this.warningCounts,
      summary: {
        totalCriticalErrors: this.criticalErrors.length,
        totalNormalWarnings: this.normalWarnings.length,
        uniqueErrors: Object.keys(this.errorCounts).length,
        uniqueWarnings: Object.keys(this.warningCounts).length
      }
    };
  }
  
  printReport() {
    const report = this.getReport();
    
    console.log('\n📊 ERROR MONITORING REPORT');
    console.log('========================');
    console.log(`Critical Errors: ${report.summary.totalCriticalErrors}`);
    console.log(`Normal Warnings: ${report.summary.totalNormalWarnings}`);
    console.log(`Unique Errors: ${report.summary.uniqueErrors}`);
    console.log(`Unique Warnings: ${report.summary.uniqueWarnings}`);
    
    if (report.criticalErrors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
      report.criticalErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
      });
    }
    
    if (report.summary.uniqueWarnings > 0) {
      console.log('\n🗺️ MAP WARNINGS:');
      Object.entries(report.warningCounts).forEach(([warning, count]) => {
        console.log(`${count}x: ${warning}`);
      });
    }
    
    if (report.summary.totalCriticalErrors === 0) {
      console.log('\n✅ NO CRITICAL ERRORS DETECTED - SYSTEM IS HEALTHY!');
    }
  }
  
  clear() {
    this.errorCounts = {};
    this.warningCounts = {};
    this.criticalErrors = [];
    this.normalWarnings = [];
  }
}

// Auto-start monitoring when script loads
window.mapErrorMonitor = new MapErrorMonitor();

// Add global functions for easy access
window.getErrorReport = () => window.mapErrorMonitor.getReport();
window.printErrorReport = () => window.mapErrorMonitor.printReport();
window.clearErrorLogs = () => window.mapErrorMonitor.clear();

console.log('🔍 Map Error Monitor initialized. Use getErrorReport(), printErrorReport(), or clearErrorLogs()');
