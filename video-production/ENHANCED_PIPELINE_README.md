# Enhanced Video Pipeline - Production Ready

This enhanced video pipeline creates professional demo videos with advanced overlay capabilities, robust error handling, and production-grade quality.

## 🚀 Features

- **Professional Video Quality**: High-resolution recording with optimized encoding
- **Advanced Overlay Engine**: Dynamic overlays for titles, diagrams, callouts, and more
- **Robust Error Handling**: Graceful failure recovery and detailed logging
- **Performance Monitoring**: Real-time metrics and performance tracking
- **Configuration Management**: Environment-based configuration system
- **Comprehensive Testing**: Automated test suite for validation
- **Production Reporting**: Detailed reports and analytics

## 📁 Project Structure

```
video-production/
├── scripts/
│   ├── create-proper-demo-video.ts      # Enhanced main pipeline
│   ├── test-enhanced-pipeline.ts        # Comprehensive test suite
│   └── run-production-pipeline.ts       # Production-ready runner
├── config.env                           # Configuration file
├── record.config.json                   # Timeline configuration
├── tts-cue-sheet.json                   # Narration cues
├── assets/                              # Graphics and media
│   ├── diagrams/                        # Technical diagrams
│   ├── slides/                          # Presentation slides
│   └── art/                             # Visual assets
├── output/                              # Generated videos
└── test-results/                        # Test reports
```

## 🛠️ Prerequisites

### System Requirements
- Node.js 18+ with TypeScript support
- FFmpeg installed and accessible in PATH
- Modern browser (Chrome/Chromium recommended)

### Dependencies
```bash
npm install playwright @types/node
```

### FFmpeg Installation
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## ⚙️ Configuration

### Environment Configuration
Copy `config.env.example` to `config.env` and customize:

```bash
# Application Configuration
APP_URL=http://localhost:3000
WAIT_FOR_SELECTOR=#root
TIMEOUT=30000

# Recording Configuration
RECORDING_FORMAT=webm
RECORDING_CODEC=vp9
RECORDING_QUALITY=high
RECORDING_FPS=30

# Output Configuration
OUTPUT_DIR=./output
OUTPUT_FILENAME=production-demo-video
CLEANUP=true
```

### Timeline Configuration
The `record.config.json` defines the video timeline with beats and actions:

```json
{
  "beats": [
    {
      "id": "intro",
      "duration": 30,
      "actions": [
        "overlay(intro.fullscreen,in,0)",
        "overlay(title:Disaster Response Platform,in,200)",
        "wait(2500)",
        "overlay(*,out,800)"
      ]
    }
  ]
}
```

### Overlay Types
- `intro.fullscreen`: Full-screen introduction overlay
- `title`: Centered title overlay
- `subtitle`: Bottom subtitle overlay
- `lowerThird`: Lower third information bar
- `diagram`: Technical diagram display
- `callout`: Highlighted information callout
- `chip`: Code/API endpoint chip
- `status`: Status indicator overlay
- `badge`: Achievement/status badge
- `routeOverlay`: Route visualization overlay
- `panel`: Information panel
- `type`: Question/type overlay
- `card`: Information card
- `label`: Technical label
- `slide`: Full-screen slide
- `conclusion`: Conclusion overlay

## 🎬 Usage

### 1. Basic Demo Video Creation
```bash
# Run the enhanced pipeline
npx tsx scripts/create-proper-demo-video.ts
```

### 2. Production Pipeline
```bash
# Run production-ready pipeline
npx tsx scripts/run-production-pipeline.ts
```

### 3. Testing
```bash
# Run comprehensive tests
npx tsx scripts/test-enhanced-pipeline.ts
```

## 🔧 Customization

### Adding New Overlay Types
Extend the `OverlayEngine` class in `create-proper-demo-video.ts`:

```typescript
private async showCustomOverlay(content: string, page: Page) {
  await page.evaluate((overlayContent) => {
    const overlay = document.createElement('div');
    overlay.id = 'custom-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 20%;
      left: 20%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 10001;
    `;
    overlay.textContent = overlayContent;
    document.body.appendChild(overlay);
  }, content);
}
```

### Custom Actions
Add new action types in the `executeAction` method:

```typescript
} else if (action.startsWith('custom(')) {
  const params = action.match(/custom\(([^)]+)\)/)?.[1];
  if (params) {
    await this.executeCustomAction(params);
  }
}
```

### Timeline Modifications
Edit `record.config.json` to modify the video structure:

```json
{
  "id": "custom_beat",
  "duration": 45,
  "actions": [
    "goto(APP_URL)",
    "click(text=Custom Feature)",
    "overlay(custom:Feature Demo,in,0)",
    "wait(3000)",
    "overlay(*,out,500)"
  ]
}
```

## 📊 Monitoring and Reporting

### Performance Metrics
The pipeline tracks:
- Beat execution times
- Action performance
- Video generation metrics
- Error rates and recovery attempts

### Logging
Comprehensive logging with configurable levels:
- INFO: General pipeline progress
- ERROR: Failures and recovery attempts
- DEBUG: Detailed execution information

### Reports
Generated reports include:
- Pipeline execution summary
- Performance analytics
- Error analysis
- Output file inventory

## 🧪 Testing

### Test Suite Coverage
- Configuration validation
- Overlay engine functionality
- Action execution
- Browser interactions
- Video recording
- Asset integration

### Running Tests
```bash
# Full test suite
npx tsx scripts/test-enhanced-pipeline.ts

# Individual test categories
npm run test:config
npm run test:overlays
npm run test:actions
```

### Test Results
Tests generate detailed reports in `test-results/`:
- Pass/fail status
- Performance metrics
- Error details
- Recommendations

## 🚨 Troubleshooting

### Common Issues

#### FFmpeg Not Found
```bash
# Verify installation
ffmpeg -version

# Add to PATH if needed
export PATH="/usr/local/bin:$PATH"
```

#### Browser Launch Failures
```bash
# Install browser dependencies
npx playwright install chromium

# Check system dependencies
npx playwright install-deps
```

#### Overlay Display Issues
- Verify z-index values in overlay styles
- Check for CSS conflicts
- Ensure proper element positioning

#### Video Quality Issues
- Adjust CRF values in configuration
- Modify encoding presets
- Check input resolution settings

### Debug Mode
Enable detailed logging:
```bash
# Set environment variable
export DEBUG=true

# Or modify config.env
LOG_LEVEL=DEBUG
```

### Recovery Options
The pipeline includes automatic recovery:
- Partial recording preservation
- Error logging and analysis
- Graceful degradation
- Recovery screenshots

## 📈 Performance Optimization

### Recording Optimization
- Use appropriate FPS settings
- Optimize viewport dimensions
- Enable hardware acceleration when available

### Processing Optimization
- Choose appropriate encoding presets
- Balance quality vs. speed
- Use parallel processing where possible

### Memory Management
- Monitor browser memory usage
- Clean up overlay elements
- Optimize asset loading

## 🔒 Security Considerations

### Browser Security
- Disable unnecessary browser features
- Use secure browser arguments
- Limit file system access

### Asset Security
- Validate asset file types
- Sanitize overlay content
- Restrict file access paths

### Configuration Security
- Use environment variables for sensitive data
- Validate configuration inputs
- Implement access controls

## 📚 API Reference

### OverlayEngine Class
```typescript
class OverlayEngine {
  async handleOverlayAction(action: string, page: Page): Promise<void>
  private async showTitleOverlay(text: string, page: Page): Promise<void>
  private async showDiagramOverlay(imagePath: string, page: Page): Promise<void>
  // ... other methods
}
```

### ProductionVideoPipeline Class
```typescript
class ProductionVideoPipeline {
  async runProductionPipeline(): Promise<void>
  private async performPreFlightChecks(): Promise<void>
  private async executeProductionTimeline(): Promise<void>
  // ... other methods
}
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

### Code Standards
- TypeScript strict mode
- Comprehensive error handling
- Performance optimization
- Documentation coverage

### Testing Requirements
- Unit test coverage >90%
- Integration test coverage
- Performance benchmarks
- Error scenario testing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- This README
- Code comments
- TypeScript definitions
- Example configurations

### Issues
- GitHub Issues for bug reports
- Feature requests welcome
- Performance optimization suggestions

### Community
- Development discussions
- Best practices sharing
- Configuration examples

---

**Ready to create professional demo videos?** Start with the enhanced pipeline and customize it for your needs!
