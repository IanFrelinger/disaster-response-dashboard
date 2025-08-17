# Video Pipeline Smoke Test

This document describes the comprehensive smoke test for the disaster response dashboard video production pipeline.

## Overview

The smoke test validates that all critical components of the video production pipeline are properly configured and ready for use. It performs comprehensive checks across:

- **Core Infrastructure**: Node.js, TypeScript, ts-node, Playwright
- **Video Pipeline Components**: Configuration, scripts, scene definitions
- **Audio Processing**: Voice providers, audio settings, output directories
- **Capture Generation**: Screenshot and video capture capabilities
- **Pipeline Integration**: Script structure, directory permissions, output paths
- **Performance**: Configuration load times, file system performance

## Quick Start

### Option 1: Using the Shell Script (Recommended)
```bash
./run-enhanced-smoke-test.sh
```

### Option 2: Using npm
```bash
npm run enhanced-smoke-test
```

### Option 3: Direct TypeScript Execution
```bash
npx ts-node scripts/enhanced-video-pipeline-smoke-test.ts
```

## Test Categories

### 1. Core Infrastructure Tests
- **Node.js Version**: Ensures Node.js 18+ is available
- **TypeScript**: Validates TypeScript compiler availability
- **ts-node**: Checks ts-node runtime availability
- **Playwright**: Verifies Playwright for capture generation

### 2. Video Pipeline Components
- **Configuration Validation**: Checks narration.yaml structure
- **Script Availability**: Verifies all required pipeline scripts exist
- **Scene Configuration**: Validates video and screenshot scene definitions

### 3. Audio Processing
- **Directory Structure**: Ensures audio output directories exist
- **Voice Providers**: Validates OpenAI, ElevenLabs, Azure, and Piper configurations
- **Audio Settings**: Checks sample rate, format, and processing options

### 4. Capture Generation
- **Output Directories**: Verifies captures/screenshots and captures/videos exist
- **Capture Settings**: Validates screenshot and video capture configurations
- **Scene Methods**: Ensures proper mix of video and screenshot scenes

### 5. Pipeline Integration
- **Script Structure**: Validates main pipeline script architecture
- **Output Directories**: Checks all required output paths exist
- **Write Permissions**: Tests ability to write to output directories

### 6. Performance
- **Configuration Load**: Measures YAML parsing performance
- **File System**: Tests directory listing performance
- **Total Duration**: Reports overall test execution time

## Expected Results

### ✅ All Tests Pass
```
📊 Enhanced Video Pipeline Test Summary:
   Total Tests: 30
   ✅ Passed: 30
   ❌ Failed: 0
   ⏭️  Skipped: 0
   ⚠️  Warnings: 0

🎉 All critical video pipeline tests passed! Pipeline is ready for video production.
```

### ⚠️ Some Tests Failed
```
⚠️  2 test(s) failed. Please fix issues before running the video pipeline.
```

Review the detailed results to identify and fix specific issues.

## Common Issues and Solutions

### Missing Capture Directories
**Issue**: `Capture Directory: captures/screenshots: Capture directory missing`
**Solution**: 
```bash
mkdir -p captures/screenshots captures/videos
```

### Missing Dependencies
**Issue**: `Playwright is not available`
**Solution**: 
```bash
npm install
npx playwright install
```

### Configuration Errors
**Issue**: `Video pipeline configuration is incomplete`
**Solution**: Check `config/narration.yaml` for missing required sections

### Permission Issues
**Issue**: `Cannot write to pipeline output directories`
**Solution**: Ensure write permissions on `output/` and `temp/` directories

## Test Output Interpretation

### Status Indicators
- **✅ PASS**: Test passed successfully
- **❌ FAIL**: Critical issue that must be resolved
- **⏭️ SKIP**: Test was skipped (usually due to missing dependencies)
- **⚠️ WARNING**: Non-critical issue that may affect performance

### Performance Metrics
- **Config Load Performance**: Should be < 100ms
- **File System Performance**: Should be < 50ms
- **Total Test Duration**: Should be < 1000ms

## Integration with CI/CD

The smoke test can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Video Pipeline Smoke Test
  run: |
    cd video-production
    npm run enhanced-smoke-test
```

## Customization

### Adding New Tests
Edit `scripts/enhanced-video-pipeline-smoke-test.ts`:

```typescript
private async testCustomFeature(): Promise<void> {
  this.log('Testing Custom Feature...', 'info');
  
  // Your custom test logic here
  try {
    // Test implementation
    this.addResult('Custom Feature', 'PASS', 'Custom feature works correctly');
  } catch (error) {
    this.addResult('Custom Feature', 'FAIL', 'Custom feature failed', error.toString());
  }
}
```

### Modifying Test Thresholds
Adjust performance thresholds in the performance tests:

```typescript
if (loadTime < 100) {  // Change from 100ms to your preferred threshold
  this.addResult('Config Load Performance', 'PASS', `Configuration loaded in ${loadTime}ms`);
} else {
  this.addResult('Config Load Performance', 'WARNING', `Configuration loaded slowly in ${loadTime}ms`);
}
```

## Troubleshooting

### Test Hangs or Times Out
- Check for infinite loops in test logic
- Verify file system permissions
- Ensure no blocking I/O operations

### Inconsistent Results
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for environment-specific configurations
- Verify file paths are correct for your OS

### Performance Issues
- Monitor system resources during test execution
- Check for antivirus software interference
- Verify disk I/O performance

## Support

For issues with the smoke test:

1. Check this README for common solutions
2. Review the test output for specific error messages
3. Examine the test implementation in `scripts/enhanced-video-pipeline-smoke-test.ts`
4. Check the video pipeline configuration in `config/narration.yaml`

## Related Documentation

- [Video Production Pipeline Guide](../docs/VIDEO_PRODUCTION_PIPELINE.md)
- [Configuration Guide](../docs/CONFIGURATION_GUIDE.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)
