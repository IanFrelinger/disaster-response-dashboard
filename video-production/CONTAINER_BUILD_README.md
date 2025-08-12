# Disaster Response Dashboard - Container Build Guide

This guide covers building and running the complete video production container with AI text-to-speech and animatic generation capabilities.

## 🐳 Container Features

### **AI Text-to-Speech Integration**
- **gTTS (Google Text-to-Speech):** High-quality voice synthesis
- **pyttsx3:** Offline TTS engine for backup
- **espeak:** Command-line TTS for system-level generation
- **Audio Optimization:** Automatic duration adjustment and quality enhancement

### **Complete Animatic Pipeline**
- **Screenshot Capture:** Automated frontend screenshot generation
- **Storyboard Creation:** Professional storyboard with problem-solution focus
- **Voice-Over Generation:** AI-powered narration for all 15 scenes
- **Video Assembly:** FFmpeg-based video production with transitions
- **Validation System:** Comprehensive quality assurance

## 🚀 Quick Start

### **1. Build the Container**
```bash
# Build from source with all dependencies
docker build -t disaster-response-video-production .

# Build with specific stage (development recommended)
docker build --target development -t disaster-response-video-production:dev .
```

### **2. Run the Complete Pipeline**
```bash
# Run the entire pipeline in one command
docker run -it --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/../frontend:/app/frontend \
  disaster-response-video-production:dev \
  npm run build:pipeline
```

### **3. Individual Steps**
```bash
# Run individual pipeline steps
docker run -it --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/../frontend:/app/frontend \
  disaster-response-video-production:dev \
  npm run screenshots

docker run -it --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/../frontend:/app/frontend \
  disaster-response-video-production:dev \
  npm run tts

docker run -it --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/../frontend:/app/frontend \
  disaster-response-video-production:dev \
  npm run animatic
```

## 📋 Pipeline Steps

### **1. Screenshots (📸)**
- **Script:** `comprehensive-screenshots.js`
- **Output:** 15 high-quality screenshots in `frontend/screenshots/`
- **Duration:** ~2-3 minutes
- **Requirements:** Frontend running on localhost:3000

### **2. Storyboard (📋)**
- **Script:** `video-storyboard-generator.js`
- **Output:** Complete storyboard with screenshots and voice-over mapping
- **Files:** `VIDEO_STORYBOARD_WITH_SCREENSHOTS.md`, `STORYBOARD_4MIN_QUICK_REFERENCE.md`

### **3. AI TTS (🎤)**
- **Script:** `ai-tts-generator.js`
- **Output:** 15 voice-over files in `output/voice-recordings/`
- **Engines:** gTTS → pyttsx3 → espeak (fallback order)
- **Duration:** ~5-10 minutes
- **Quality:** Professional-grade audio optimized to 15 seconds per scene

### **4. Animatic Generation (🎬)**
- **Script:** `animatic-generator.js`
- **Output:** Complete animatic video production system
- **Files:** FFmpeg scripts, scene videos, concatenation tools

### **5. Video Assembly (🎥)**
- **Script:** `generate-animatic.sh`
- **Output:** `disaster-response-animatic.mp4`
- **Format:** MP4 (H.264), 1920x1080, 3:45 duration
- **Features:** Smooth transitions, synchronized audio

### **6. Validation (🔍)**
- **Script:** `complete-validation.js`
- **Output:** Comprehensive validation report
- **Checks:** Screenshots, voice-overs, video quality, pipeline integration

## 🎯 AI TTS Configuration

### **Voice-Over Scripts**
Each scene has a specific voice-over with optimized text:

```javascript
{
  scene: 1,
  text: "When disasters strike, emergency managers face a nightmare: fragmented data, slow coordination, and dangerous routing that puts lives at risk.",
  filename: 'scene-01-problem-fragmented-response.wav',
  tone: 'urgent'
}
```

### **TTS Engine Priority**
1. **gTTS (Google Text-to-Speech):** Best quality, requires internet
2. **pyttsx3:** Offline engine, good quality
3. **espeak:** System-level TTS, always available

### **Audio Optimization**
- **Duration:** Automatically adjusted to 15 seconds per scene
- **Quality:** High-quality WAV format (44.1kHz, stereo)
- **Speed:** Optimized for natural speech patterns

## 📁 Output Structure

```
video-production/output/
├── voice-recordings/                    # AI-generated voice-overs
│   ├── scene-01-problem-fragmented-response.wav
│   ├── scene-02-problem-time-costs-lives.wav
│   ├── ...
│   ├── tts_generation_results.json
│   └── tts_validation_results.json
├── animatic/                           # Video production files
│   ├── disaster-response-animatic.mp4  # Final video
│   ├── generate-animatic.sh            # Generation script
│   ├── concatenate-scenes.sh           # Assembly script
│   ├── scene-videos/                   # Individual scene videos
│   └── animatic-metadata.json          # Production metadata
├── VIDEO_STORYBOARD_WITH_SCREENSHOTS.md
├── STORYBOARD_4MIN_QUICK_REFERENCE.md
├── build-pipeline-report.json          # Build results
└── complete-validation-report.json     # Validation results
```

## 🔧 Container Configuration

### **Dockerfile Stages**
- **base:** Core dependencies and tools
- **development:** Additional development tools and debugging
- **production:** Minimal production image

### **System Dependencies**
```dockerfile
# Core tools
ffmpeg, imagemagick, python3, git, bash, curl, wget

# TTS engines
espeak, espeak-dev

# Python packages
gTTS, pyttsx3, pydub, requests, beautifulsoup4
```

### **Volume Mounts**
```bash
# Required mounts
-v $(pwd)/output:/app/output              # Output files
-v $(pwd)/../frontend:/app/frontend       # Frontend access

# Optional mounts
-v $(pwd)/temp:/app/temp                  # Temporary files
-v $(pwd)/assets:/app/assets              # Additional assets
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. TTS Generation Fails**
```bash
# Check Python packages
docker run -it disaster-response-video-production:dev python3 -c "import gtts, pyttsx3, pydub"

# Test individual TTS engines
docker run -it disaster-response-video-production:dev espeak "test"
```

#### **2. Screenshots Not Captured**
```bash
# Verify frontend is running
curl http://localhost:3000

# Check Playwright installation
docker run -it disaster-response-video-production:dev npx playwright --version
```

#### **3. Video Assembly Fails**
```bash
# Check FFmpeg
docker run -it disaster-response-video-production:dev ffmpeg -version

# Verify file permissions
docker run -it disaster-response-video-production:dev ls -la output/animatic/
```

### **Debug Mode**
```bash
# Run container in debug mode
docker run -it --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/../frontend:/app/frontend \
  disaster-response-video-production:dev \
  bash

# Inside container
npm run validate:complete  # Check current state
npm run tts               # Generate voice-overs
npm run animatic          # Setup video generation
```

## 📊 Validation Reports

### **Complete Validation**
The validation system checks:
- ✅ Screenshot quality and format
- ✅ Voice-over generation and quality
- ✅ Video assembly and properties
- ✅ Pipeline integration

### **Sample Validation Output**
```json
{
  "summary": {
    "screenshots": { "passed": 14, "failed": 0, "total": 14, "success": true },
    "voiceOvers": { "passed": 15, "failed": 0, "total": 15, "success": true },
    "animatic": { "passed": 1, "failed": 0, "total": 1, "success": true },
    "overall": { "success": true }
  }
}
```

## 🎯 Production Deployment

### **Build Production Image**
```bash
docker build --target production -t disaster-response-video-production:prod .
```

### **Run Production Pipeline**
```bash
docker run --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/../frontend:/app/frontend \
  disaster-response-video-production:prod \
  npm run build:pipeline
```

### **Health Check**
```bash
# Verify container health
docker run --rm disaster-response-video-production:prod \
  node -e "console.log('Container is healthy')"
```

## 📈 Performance Optimization

### **Build Optimization**
- Use multi-stage builds to reduce image size
- Cache npm dependencies
- Optimize Python package installation

### **Runtime Optimization**
- Use volume mounts for persistent data
- Run TTS generation in parallel where possible
- Optimize FFmpeg settings for faster processing

## 🔄 Continuous Integration

### **GitHub Actions Example**
```yaml
name: Build Video Production
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build container
        run: docker build -t disaster-response-video-production .
      - name: Run pipeline
        run: |
          docker run --rm \
            -v ${{ github.workspace }}/output:/app/output \
            -v ${{ github.workspace }}/frontend:/app/frontend \
            disaster-response-video-production \
            npm run build:pipeline
```

---

*Container Build Guide - August 12, 2025*  
*Version: 1.0.0*
