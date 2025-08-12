# 🎬 Disaster Response Dashboard - Video Production Tools

Complete video production pipeline for creating the 4-minute Palantir Building Challenge demo video.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the complete pipeline
npm run build

# Or run individual steps
npm run narrate    # Generate voiceover
npm run assemble   # Create rough cut
npm run final      # Create final MP4
```

## 📋 Prerequisites

- **Node.js 18+** and npm
- **FFmpeg** (for video processing)
- **macOS** (for TTS - other platforms supported with fallback)

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [FFmpeg website](https://ffmpeg.org/download.html)

## 🎯 Features

### **Complete Video Pipeline**
- ✅ **Text-to-Speech Generation** - Professional voiceover from YAML script
- ✅ **Visual Generation** - Dynamic visuals for each beat
- ✅ **Video Assembly** - Automatic timing and synchronization
- ✅ **Final Polish** - Captions, background music, high-quality encoding
- ✅ **Thumbnail Generation** - Auto-generated video thumbnail

### **Professional Quality**
- **Resolution**: 1920x1080 (Full HD)
- **Format**: MP4 with H.264 encoding
- **Audio**: AAC 192kbps
- **Quality**: CRF 18 (high quality)
- **Duration**: Exactly 4:00 for Palantir submission

### **Development Tools**
- **Script Preview** - Review narration before generation
- **TTS Testing** - Test voice synthesis
- **Timing Analysis** - Word-per-minute calculations
- **Configuration Validation** - Ensure YAML is correct
- **Interactive Menu** - Easy development workflow

## 📁 Project Structure

```
video-production/
├── package.json              # Dependencies and scripts
├── narration.yaml            # Video script and configuration
├── scripts/
│   ├── narrate.js           # Voiceover generation
│   ├── assemble.js          # Video assembly
│   ├── final.js             # Final processing
│   └── dev.js               # Development tools
├── output/                   # Generated files
│   ├── voiceover.wav        # Merged audio
│   ├── captions.vtt         # Subtitles
│   ├── roughcut.mp4         # Intermediate video
│   ├── disaster-response-demo.mp4  # Final video
│   ├── thumbnail.jpg        # Video thumbnail
│   └── video-metadata.json  # Video metadata
├── temp/                     # Temporary files
└── assets/                   # Background music, images
```

## 🎬 Usage

### **1. Generate Voiceover**
```bash
npm run narrate
```
- Reads `narration.yaml` configuration
- Generates individual audio files for each beat
- Merges into single `voiceover.wav` file
- Creates `captions.vtt` subtitles

### **2. Assemble Video**
```bash
npm run assemble
```
- Creates visual elements for each beat
- Synchronizes visuals with audio timing
- Generates `roughcut.mp4` intermediate video

### **3. Final Processing**
```bash
npm run final
```
- Adds captions and background music
- Applies high-quality encoding
- Creates final `disaster-response-demo.mp4`
- Generates thumbnail and metadata

### **4. Complete Pipeline**
```bash
npm run build
```
- Runs all three steps in sequence
- Creates production-ready video

## 🛠️ Development

### **Interactive Development Tools**
```bash
npm run dev
```
Provides menu with options:
- 📝 Preview narration script
- 🎵 Test TTS generation
- 🎨 Preview visual elements
- 📊 Show timing breakdown
- 🔧 Validate configuration
- 🚀 Run full pipeline

### **Configuration Validation**
```bash
npm run dev
# Select "Validate configuration"
```
Checks for:
- Required YAML structure
- Missing narration text
- Timing consistency
- Visual cue definitions

### **TTS Testing**
```bash
npm run dev
# Select "Test TTS generation"
```
Tests text-to-speech system and saves sample audio.

## 📝 Configuration

### **narration.yaml Structure**

```yaml
metadata:
  title: "Disaster Response Dashboard Demo"
  duration: "4:00"
  voice_style: "professional_authoritative"
  speed: 0.95
  language: "en-US"

beats:
  - name: "Hook"
    start_time: "0:00"
    end_time: "0:15"
    narration: "In fast-moving disasters, minutes matter..."
    visual_cues:
      - "3D terrain visualization"
      - "Timer countdown"
    on_screen_labels:
      - "Command Center"
      - "Real-time Monitoring"

production_notes:
  voice_settings:
    style: "professional_authoritative"
    speed: 0.95
  visual_style:
    color_scheme: "emergency_blue_red"
    typography: "clean_modern"
```

### **Customization Options**

**Voice Settings:**
- `speed`: 0.5-2.0 (default: 0.95 for gravitas)
- `style`: "professional_authoritative", "news_anchor", "conversational"
- `language`: "en-US", "en-GB", etc.

**Visual Settings:**
- `color_scheme`: "emergency_blue_red", "professional_blue", "dark_theme"
- `typography`: "clean_modern", "bold_impact", "minimal"
- `animations`: "smooth_professional", "dynamic", "subtle"

## 🎵 Audio Options

### **Background Music**
Place background music in `assets/background-music.mp3` for automatic inclusion.

### **TTS Voices**
The system uses macOS `say` command by default. For enhanced voices:

**ElevenLabs Integration:**
```javascript
// In narrate.js, replace generateBeatAudio method
const { ElevenLabs } = require('elevenlabs-node');
const elevenlabs = new ElevenLabs(process.env.ELEVENLABS_API_KEY);
```

**OpenAI TTS:**
```javascript
// In narrate.js, replace generateBeatAudio method
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
```

## 🎨 Visual Customization

### **Custom Visuals**
Replace the canvas-based visuals in `assemble.js` with:

**Screenshots from your app:**
```javascript
// Load actual app screenshots
const screenshot = await loadImage(`../frontend/screenshots/${beat.name}.png`);
ctx.drawImage(screenshot, 0, 0, 1920, 1080);
```

**Screen recordings:**
```javascript
// Use screen recordings instead of static images
const videoInput = `-i "recordings/${beat.name}.mp4"`;
```

## 📊 Output Files

### **Generated Files**
- `voiceover.wav` - Professional voiceover audio
- `captions.vtt` - WebVTT subtitles
- `roughcut.mp4` - Intermediate video with visuals
- `disaster-response-demo.mp4` - Final production video
- `thumbnail.jpg` - Auto-generated thumbnail
- `video-metadata.json` - Video metadata for platforms

### **Video Specifications**
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Codec**: H.264
- **Audio**: AAC 192kbps
- **Duration**: Exactly 4:00
- **File Size**: ~50-100MB (depending on content)

## 🚀 Deployment

### **YouTube Upload**
1. Upload `disaster-response-demo.mp4` to YouTube
2. Set as "Unlisted"
3. Copy video URL
4. Email to recruiter with submission

### **Palantir Submission**
1. Include video URL in Building Challenge submission
2. Attach `video-metadata.json` for reference
3. Include `thumbnail.jpg` if needed

## 🔧 Troubleshooting

### **Common Issues**

**FFmpeg not found:**
```bash
# Install FFmpeg
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Ubuntu
```

**TTS not working:**
```bash
# Test system TTS
say "Hello world"
# If not working, the script will use fallback
```

**Canvas not working:**
```bash
# Reinstall canvas
npm rebuild canvas
```

**Memory issues:**
```bash
# Increase Node.js memory
node --max-old-space-size=4096 scripts/assemble.js
```

### **Performance Optimization**
- Use SSD for faster file I/O
- Close other applications during video processing
- Consider using GPU acceleration for FFmpeg

## 📈 Advanced Features

### **Multi-Language Support**
```yaml
metadata:
  language: "es-ES"  # Spanish
  # or "fr-FR", "de-DE", etc.
```

### **Custom Voice Models**
```javascript
// In narrate.js
const customVoice = {
  name: "Emergency Commander",
  style: "authoritative",
  speed: 0.9
};
```

### **Batch Processing**
```bash
# Process multiple scripts
for script in scripts/*.yaml; do
  cp "$script" narration.yaml
  npm run build
  mv output/disaster-response-demo.mp4 "output/$(basename $script .yaml).mp4"
done
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test with `npm run dev`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to create your Palantir Building Challenge video!** 🎬
