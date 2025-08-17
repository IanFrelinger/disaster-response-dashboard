# Video Pipeline Validation and Timeout Guide

This document explains the comprehensive validation and timeout mechanisms implemented to prevent the video production pipeline from getting stuck during any step.

## Overview

The enhanced video pipeline now includes multiple layers of protection:

1. **Global Timeouts** - Prevents the entire pipeline from hanging indefinitely
2. **Step Timeouts** - Prevents individual steps from getting stuck
3. **Automatic Retries** - Handles transient failures gracefully
4. **Health Monitoring** - Continuously validates system state
5. **Progress Tracking** - Monitors execution progress in real-time
6. **Resource Cleanup** - Ensures proper cleanup even on failures

## Timeout Mechanisms

### Global Timeouts

#### Enhanced Production Pipeline
- **Global Timeout**: 15 minutes (900,000ms)
- **Step Timeout**: 2 minutes (120,000ms) per step
- **Retry Attempts**: 2 retries per step

#### Enhanced Frontend Captures
- **Global Timeout**: 10 minutes (600,000ms)
- **Step Timeout**: 30 seconds (30,000ms) per step
- **Browser Health Checks**: Every operation

### Timeout Implementation

```typescript
private async withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation '${operationName}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([operation, timeoutPromise]);
    return result;
  } catch (error) {
    this.log(`Operation '${operationName}' failed: ${error}`, 'error');
    throw error;
  }
}
```

## Validation Mechanisms

### 1. Environment Validation

#### Node.js Version Check
- **Requirement**: Node.js 18+
- **Validation**: Checks `process.version`
- **Timeout**: 2 minutes
- **Failure Action**: Pipeline stops immediately

#### Required Tools Validation
- **Tools Checked**: `ts-node`, `tsc`, `playwright`
- **Method**: Executes `npx tool --version`
- **Timeout**: 30 seconds per tool
- **Failure Action**: Pipeline stops immediately

#### Directory Structure Validation
- **Required Directories**: `output`, `temp`, `captures`, `audio`, `config`
- **Method**: Checks existence and permissions
- **Timeout**: 30 seconds
- **Failure Action**: Creates missing directories or stops pipeline

#### Write Permission Validation
- **Test**: Creates and deletes temporary files
- **Timeout**: 10 seconds
- **Failure Action**: Pipeline stops immediately

### 2. Configuration Validation

#### YAML Configuration Validation
- **File**: `config/narration.yaml`
- **Checks**: Required sections exist (`metadata`, `scenes`, `voice_providers`)
- **Timeout**: 30 seconds
- **Failure Action**: Pipeline stops immediately

#### Package.json Validation
- **File**: `package.json`
- **Checks**: Required sections exist (`scripts`, `dependencies`)
- **Timeout**: 30 seconds
- **Failure Action**: Pipeline stops immediately

### 3. Browser Health Monitoring

#### Connection Health Check
```typescript
private async validateBrowserHealth(): Promise<ValidationResult> {
  // Check if browser is still responsive
  const isConnected = this.browser.isConnected();
  if (!isConnected) {
    return {
      success: false,
      message: 'Browser connection lost',
      duration: Date.now() - startTime
    };
  }

  // Check if page is responsive
  try {
    await this.page.evaluate(() => document.readyState);
  } catch (error) {
    return {
      success: false,
      message: 'Page not responsive',
      details: error.toString(),
      duration: Date.now() - startTime
    };
  }
}
```

#### Health Check Frequency
- **Initialization**: After browser setup
- **Before Each Operation**: Before capture generation
- **After Each Operation**: After capture completion
- **Cleanup**: Before resource cleanup

### 4. Progress Monitoring

#### Real-time Progress Tracking
- **Step Start**: Logs when each step begins
- **Step Progress**: Shows intermediate progress
- **Step Completion**: Logs successful completion
- **Step Failure**: Logs detailed error information

#### Duration Tracking
- **Individual Steps**: Measures time per step
- **Total Pipeline**: Measures overall execution time
- **Performance Metrics**: Reports execution efficiency

## Retry Mechanisms

### Automatic Retry Logic

#### Retry Configuration
```typescript
private async generateCaptures(): Promise<void> {
  let retries = 0;
  const maxRetries = 2;
  
  while (retries <= maxRetries) {
    try {
      await this.withTimeout(
        this.runCaptureGeneration(),
        this.stepTimeout,
        'Capture Generation'
      );
      
      // Success - exit retry loop
      return;
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        // Max retries exceeded - fail permanently
        throw error;
      }
      
      // Wait before retry
      await this.delay(2000);
    }
  }
}
```

#### Retry Behavior
- **Max Retries**: 2 attempts per step
- **Retry Delay**: 2 seconds between attempts
- **Retry Conditions**: Timeout errors, network failures, temporary issues
- **Permanent Failures**: Configuration errors, missing dependencies

### Retryable vs Non-Retryable Errors

#### Retryable Errors
- **Network Timeouts**: Temporary connectivity issues
- **Browser Crashes**: Browser process failures
- **Resource Locks**: Temporary file system locks
- **Memory Pressure**: Temporary system resource issues

#### Non-Retryable Errors
- **Configuration Errors**: Invalid YAML, missing files
- **Dependency Errors**: Missing Node.js, TypeScript
- **Permission Errors**: File system access denied
- **Validation Errors**: Invalid data structures

## Error Handling

### Error Classification

#### Critical Errors
- **Environment Issues**: Missing Node.js, TypeScript
- **Configuration Issues**: Invalid YAML, missing files
- **Permission Issues**: Cannot write to directories
- **Dependency Issues**: Missing Playwright, tools

#### Recoverable Errors
- **Network Issues**: Temporary connectivity problems
- **Resource Issues**: Temporary file system locks
- **Browser Issues**: Browser crashes, page unresponsiveness
- **Timeout Issues**: Operations taking too long

### Error Recovery Strategies

#### Immediate Recovery
- **Retry Operation**: Attempt the same operation again
- **Wait and Retry**: Delay before retry attempt
- **Resource Cleanup**: Clear temporary resources
- **State Reset**: Reset to known good state

#### Graceful Degradation
- **Skip Non-Critical Steps**: Continue with remaining steps
- **Use Fallback Methods**: Alternative implementation approaches
- **Partial Success**: Report what was accomplished
- **Detailed Logging**: Log all failure details

## Resource Management

### Automatic Cleanup

#### Browser Resources
```typescript
async cleanup(): Promise<void> {
  try {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  } catch (error) {
    this.log(`⚠️ Cleanup warning: ${error}`, 'warning');
  }
}
```

#### File System Resources
- **Temporary Files**: Automatically cleaned up
- **Test Files**: Removed after validation
- **Lock Files**: Released on completion
- **Cache Files**: Cleared between runs

### Resource Monitoring

#### Memory Usage
- **Browser Memory**: Monitored for leaks
- **Node.js Memory**: Tracked for excessive usage
- **File System**: Monitored for disk space

#### Process Management
- **Browser Processes**: Killed on timeout
- **Child Processes**: Terminated on failure
- **Background Tasks**: Cancelled on cleanup

## Monitoring and Logging

### Logging Levels

#### Info Level
- **Step Start**: When operations begin
- **Progress Updates**: Intermediate status
- **Configuration Details**: Settings and parameters

#### Success Level
- **Step Completion**: Successful operations
- **Validation Results**: Passed checks
- **Performance Metrics**: Execution times

#### Warning Level
- **Retry Attempts**: Operation retries
- **Resource Warnings**: Low disk space, memory
- **Performance Issues**: Slow operations

#### Error Level
- **Step Failures**: Failed operations
- **Validation Errors**: Failed checks
- **System Errors**: Critical failures

### Progress Indicators

#### Visual Progress
- **Step Names**: Clear operation identification
- **Duration**: Time taken per step
- **Status Icons**: ✅ ❌ ⚠️ ℹ️
- **Progress Bars**: For long-running operations

#### Performance Metrics
- **Execution Time**: Per step and total
- **Resource Usage**: Memory, CPU, disk
- **Success Rates**: Pass/fail ratios
- **Retry Counts**: Number of retry attempts

## Usage Examples

### Running with Validation

#### Enhanced Production Pipeline
```bash
# Run with full validation
npm run enhanced-pipeline

# Run with custom timeouts (if supported)
ENHANCED_PIPELINE_TIMEOUT=1800000 npm run enhanced-pipeline
```

#### Enhanced Frontend Captures
```bash
# Run with browser health monitoring
npm run enhanced-frontend-captures

# Run with custom step timeout
ENHANCED_CAPTURE_TIMEOUT=60000 npm run enhanced-frontend-captures
```

### Monitoring Execution

#### Real-time Monitoring
```bash
# Watch logs in real-time
npm run enhanced-pipeline | tee pipeline.log

# Monitor specific steps
npm run enhanced-pipeline 2>&1 | grep "Step:"
```

#### Performance Analysis
```bash
# Analyze execution times
grep "Duration:" pipeline.log | awk '{print $2, $4}'

# Check for timeouts
grep "timed out" pipeline.log
```

## Troubleshooting

### Common Timeout Issues

#### Browser Initialization Timeout
**Symptoms**: Browser takes too long to start
**Solutions**:
- Check system resources (memory, CPU)
- Verify Playwright installation
- Clear browser cache and data
- Restart system if needed

#### Capture Generation Timeout
**Symptoms**: Video capture takes too long
**Solutions**:
- Check disk space and write permissions
- Verify frontend application is running
- Monitor system performance
- Adjust timeout values if needed

#### Network Operation Timeout
**Symptoms**: API calls or downloads timeout
**Solutions**:
- Check network connectivity
- Verify API endpoints are accessible
- Check firewall and proxy settings
- Increase timeout values for slow networks

### Performance Optimization

#### Reduce Timeout Values
```typescript
// For faster feedback during development
private stepTimeout: number = 30000; // 30 seconds
private globalTimeout: number = 300000; // 5 minutes
```

#### Optimize Resource Usage
- Use headless browser mode
- Reduce video quality during development
- Limit concurrent operations
- Monitor system resources

#### Parallel Execution
- Run independent steps concurrently
- Use worker threads for heavy operations
- Implement pipeline stages
- Cache intermediate results

## Best Practices

### Development Workflow

1. **Start with Smoke Tests**: Validate environment first
2. **Use Quick Tests**: Fast validation during development
3. **Monitor Progress**: Watch logs for issues
4. **Handle Errors Gracefully**: Implement proper error handling

### Production Deployment

1. **Set Appropriate Timeouts**: Balance speed vs reliability
2. **Monitor Resource Usage**: Track system performance
3. **Implement Logging**: Comprehensive error logging
4. **Plan for Failures**: Design for graceful degradation

### Maintenance

1. **Regular Testing**: Run validation tests regularly
2. **Update Dependencies**: Keep tools and libraries current
3. **Monitor Performance**: Track execution times
4. **Review Logs**: Analyze error patterns

## Conclusion

The enhanced video pipeline now provides comprehensive protection against getting stuck:

- **Multiple timeout layers** prevent indefinite hanging
- **Automatic retries** handle transient failures
- **Health monitoring** detects system issues early
- **Resource cleanup** ensures proper cleanup
- **Progress tracking** provides visibility into execution
- **Error classification** helps with troubleshooting

This makes the pipeline much more reliable and maintainable for both development and production use.
