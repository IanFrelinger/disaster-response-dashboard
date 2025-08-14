# Disaster Response Dashboard - Headless Video Pipeline

A fully automated, headless video production pipeline that creates professional demo videos from your web application using AI voiceover, dynamic music, and automated screen recording.

## 🚀 Features

- **AI Voiceover**: Multiple TTS providers (OpenAI, ElevenLabs, Azure, Piper)
- **Dynamic Music**: AI-generated background music via Loudly API
- **Automated Recording**: Playwright-based screen capture with configurable actions
- **Professional Assembly**: FFmpeg-based video assembly with transitions and effects
- **YouTube Upload**: Automated upload with privacy controls
- **Cross-Platform**: Works on macOS, Windows, and Linux

## 📋 Prerequisites

### System Requirements
- **OS**: macOS 12+, Windows 10+, or Ubuntu 20.04+
- **Node.js**: 18+ (LTS recommended)
- **Python**: 3.10+ (3.11+ recommended)
- **FFmpeg**: 6.0+ with libx264, aac, and subtitles filter
- **Memory**: 8GB+ RAM recommended
- **Storage**: 10GB+ free space

### Dependencies
- **pnpm** (or npm) for Node.js package management
- **pip** for Python package management
- **Playwright** for browser automation
- **OpenTimelineIO** for timeline management

## 🛠️ Installation

1. **Clone and navigate to the video-production directory:**
   ```bash
   cd video-production
   ```

2. **Install Node.js dependencies:**
   ```bash
   pnpm install
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

5. **Verify installation:**
   ```bash
   pnpm run preflight
   ```

## ⚙️ Configuration

### 1. Environment Variables
Copy the example configuration and fill in your API keys:
```bash
cp config.env.example config.env
# Edit config.env with your actual API keys
```

### 2. Required API Keys
- **OpenAI API Key**: For TTS generation (`narrate:openai`)
- **ElevenLabs API Key**: For premium voice synthesis (`narrate:eleven`)
- **Azure Speech Key**: For Microsoft Neural voices (`narrate:azure`)
- **Loudly API Key**: For dynamic music generation (`genmusic`)

### 3. YouTube Upload Setup
For automated YouTube uploads, you'll need:
1. Google Cloud Console project
2. YouTube Data API v3 enabled
3. OAuth 2.0 credentials in `client_secrets.json`

## 🎬 Pipeline Commands

### Core Commands
```bash
# Generate dynamic background music
pnpm run genmusic

# Generate AI voiceover (choose provider)
pnpm run narrate:openai      # OpenAI TTS
pnpm run narrate:eleven      # ElevenLabs
pnpm run narrate:azure       # Azure Speech
pnpm run narrate:piper       # Local Piper TTS

# Record screen captures
pnpm run record

# Assemble video
pnpm run assemble

# Final render
pnpm run final

# Upload to YouTube
pnpm run submit
```

### Pipeline Automation
```bash
# Full pipeline (OpenAI TTS)
pnpm run pipeline:full

# Local pipeline (Piper TTS, no upload)
pnpm run pipeline:local
```

## 📁 Directory Structure

```
video-production/
├── captures/           # Recorded screen captures (.webm)
├── audio/             # Voiceover and music files
├── subs/              # Subtitles and captions
├── luts/              # Color grading LUTs
├── out/               # Final video outputs
├── scripts/           # Pipeline scripts
├── narration.yaml     # Voiceover configuration
├── timeline.yaml      # Video timeline and effects
├── record.config.json # Recording configuration
└── requirements.txt   # Python dependencies
```

## 🎯 Configuration Files

### `narration.yaml`
Defines voiceover content, TTS providers, and audio settings:
```yaml
scenes:
  - id: "intro"
    title: "Dashboard Overview"
    duration: 8
    narration: "When disasters strike..."
    voice: "alloy"
```

### `timeline.yaml`
Configures video assembly, transitions, and effects:
```yaml
tracks:
  video:
    - name: "intro"
      source: "captures/intro.webm"
      start: 0
      duration: 8
      transitions:
        in: "fade"
        out: "fade"
```

### `record.config.json`
Defines screen recording behavior and actions:
```json
{
  "app": {
    "url": "http://localhost:3000",
    "viewport": {"width": 1920, "height": 1080}
  },
  "beats": [
    {
      "id": "intro",
      "duration": 8,
      "actions": ["waitForSelector('.dashboard')"]
    }
  ]
}
```

## 🔧 Customization

### Adding New Scenes
1. Add scene to `narration.yaml`
2. Add corresponding beat to `record.config.json`
3. Add video track to `timeline.yaml`

### Custom Transitions
Modify the `timeline.yaml` file to add custom transition effects:
```yaml
transitions:
  in: "custom-transition"
  out: "fade"
  custom_transition:
    type: "slide"
    direction: "left"
    duration: 0.5
```

### Voice Customization
Adjust TTS parameters in `narration.yaml`:
```yaml
voice_settings:
  speed: 1.0
  pitch: 0
  volume: 1.0
```

## 🚨 Troubleshooting

### Common Issues

**FFmpeg not found:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
winget install Gyan.FFmpeg
```

**Playwright browser issues:**
```bash
npx playwright install --force chromium
```

**Python dependencies:**
```bash
pip install --upgrade -r requirements.txt
```

**API key errors:**
- Verify API keys are set in `config.env`
- Check API quotas and billing
- Ensure proper environment variable loading

### Debug Mode
Run individual components with verbose output:
```bash
# Debug TTS generation
python3 scripts/tts.py --debug

# Debug recording
DEBUG=1 pnpm run record

# Debug assembly
python3 scripts/assemble_ffmpeg.py --verbose
```

## 📊 Performance Tips

- **Recording**: Use SSD storage for captures
- **Processing**: Close other applications during video assembly
- **Memory**: Ensure sufficient RAM for large video files
- **Network**: Stable internet for API calls and uploads

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor API usage and quotas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the preflight check results
3. Check API provider status pages
4. Open an issue with detailed error information

---

**Ready to create professional demo videos? Run `pnpm run pipeline:full` to get started!**
