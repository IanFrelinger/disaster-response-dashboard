# Demo Automation System

This system provides automated video recording of the Disaster Response Dashboard demo using Playwright, with comprehensive validation to detect and prevent colored bars and other recording issues.

## Overview

The demo automation system consists of three main components:

1. **Demo Automation Script** (`scripts/demo-automation.ts`) - Orchestrates the browser automation
2. **Recording Validator** (`scripts/recording-validator.ts`) - Validates video quality and detects issues
3. **Runner Scripts** - Shell scripts for easy execution within the Docker container

## Features

- **Automated Demo Sequence**: Follows the exact timeline from your `timeline.yaml`
- **Video Recording**: Automatic 1920x1080 video capture with Playwright
- **Quality Validation**: Detects colored bars, black screens, and other recording issues
- **Container Integration**: Designed to work within your existing Docker video production pipeline
- **Error Handling**: Comprehensive error detection and reporting
- **Timing Control**: Precise timing for each demo step to match narration

## Demo Sequence

The automation follows this sequence (matching your timeline.yaml):

1. **Intro (8s)** - Dashboard overview
2. **Hazards (10s)** - Multi-hazard map with live data
3. **Routes (12s)** - Evacuation route planning
4. **3D Terrain (10s)** - 3D terrain visualization
5. **Evacuation (12s)** - Evacuation management
6. **AI Support (15s)** - AI decision support system
7. **Weather (10s)** - Weather integration
8. **Commander (8s)** - Commander view
9. **Responder (8s)** - First responder view
10. **Public (8s)** - Public information
11. **Outro (6s)** - Final overview

**Total Duration**: 117 seconds (matches your timeline)

## Quick Start

### From Within the Docker Container

1. **Start the frontend application** (if not already running):
   ```bash
   # In a separate terminal, start your frontend
   cd frontend
   npm run dev
   ```

2. **Run the demo automation**:
   ```bash
   # From the video-production directory
   ./scripts/run-demo.sh
   ```

### Manual Execution

For more control, use the main automation script:

```bash
# Check environment only
./scripts/run-demo-automation.sh --check-only

# Validate existing recordings only
./scripts/run-demo-automation.sh --validate-only

# Run with cleanup (removes previous recordings)
./scripts/run-demo-automation.sh --cleanup

# Force run even with warnings
./scripts/run-demo-automation.sh --force
```

## Output Files

After successful execution, you'll find:

### Video Captures
- `captures/` - Raw video files (`.webm` format)
- One video file per browser session

### Validation Reports
- `out/recording-validation.png` - Screenshot for validation
- `out/recording-validation-report.json` - Detailed validation results
- `out/demo-automation-summary.md` - Human-readable summary

## Troubleshooting

### Colored Bars Issue

**Problem**: Video shows colored bars instead of the application content.

**Causes**:
- Browser rendering issues in container environment
- Missing GPU acceleration
- Incorrect browser flags

**Solutions**:
1. **Check browser flags**: The automation uses specific flags for container compatibility
2. **Verify container setup**: Ensure the Docker container has proper display support
3. **Check application loading**: Verify the frontend is accessible at `localhost:3000`

**Detection**: The validation system automatically detects colored bars by:
- Checking file sizes (too small = likely colored bars)
- Analyzing video frames for color patterns
- Validating resolution and duration

### Common Issues

#### Frontend Not Available
```
❌ Frontend application is not running on localhost:3000
```
**Solution**: Start your frontend application before running the automation.

#### Browser Launch Failed
```
❌ Browser initialization failed
```
**Solution**: Check if Playwright browsers are installed:
```bash
npx playwright install --with-deps
```

#### Recording Validation Failed
```
❌ Colored bars detected in recording
```
**Solution**: 
1. Check if the application loaded correctly
2. Verify container has proper display support
3. Try running with `--force` flag to bypass validation

#### File Size Too Small
```
⚠️ Warning: video.webm is very small (0.05 MB) - may contain colored bars
```
**Solution**: This indicates a recording issue. Check the validation report for details.

## Environment Variables

You can customize behavior with these environment variables:

```bash
# Skip frontend availability check
export DISABLE_FRONTEND_CHECK=1

# Skip recording validation
export SKIP_VALIDATION=1

# Set logging level
export LOG_LEVEL=DEBUG
```

## Integration with Video Pipeline

The demo automation integrates seamlessly with your existing video production pipeline:

1. **Video files** are saved to `captures/` directory
2. **Validation reports** are saved to `out/` directory
3. **Timing** matches your `timeline.yaml` and `narration.yaml`
4. **Format** is compatible with your existing video processing scripts

### Next Steps After Recording

1. **Review validation report**: Check `out/recording-validation-report.json`
2. **Process video files**: Use your existing video processing pipeline
3. **Add narration**: Overlay the audio from `audio/voiceover.wav`
4. **Final assembly**: Use your existing video assembly scripts

## Technical Details

### Browser Configuration

The automation uses these browser flags for container compatibility:
```typescript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
  '--use-gl=swiftshader',
  '--use-angle=swiftshader'
]
```

### Video Recording Settings

```typescript
recordVideo: {
  dir: 'captures',
  size: { width: 1920, height: 1080 }
}
```

### Validation Criteria

- **File size**: Must be > 100KB
- **Duration**: Must be > 5 seconds
- **Resolution**: Must be >= 800x600
- **Content**: No colored bars or black screens detected

## Development

### Modifying the Demo Sequence

Edit `scripts/demo-automation.ts` to modify the demo steps:

```typescript
const steps: DemoStep[] = [
  {
    name: 'your-step',
    duration: 10,
    action: async (page) => {
      // Your custom action
    },
    validation: async (page) => {
      // Your validation logic
      return true;
    }
  }
];
```

### Adding New Validation Rules

Edit `scripts/recording-validator.ts` to add new validation criteria:

```typescript
async validateVideoFile(filePath: string): Promise<ValidationResult> {
  // Add your custom validation logic here
}
```

## Support

If you encounter issues:

1. **Check the logs**: Look for detailed error messages
2. **Run validation only**: Use `--validate-only` to check existing recordings
3. **Check environment**: Use `--check-only` to verify setup
4. **Review validation report**: Check `out/recording-validation-report.json`

The system is designed to be robust and provide clear feedback when issues occur.
