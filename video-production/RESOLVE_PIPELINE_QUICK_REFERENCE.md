# Resolve Pipeline Quick Reference

## 🚀 Quick Start
```bash
cd video-production
./scripts/run-resolve-export.sh
```

## 📋 Pipeline Checklist

### 1. Export Assets ✅
- [ ] Run export script
- [ ] Verify `resolve-export/` directory created
- [ ] Check video, audio, graphics files

### 2. Resolve Import ✅
- [ ] Create new project (1920x1080, 30fps)
- [ ] Import rough cut MP4
- [ ] Import TTS WAV files
- [ ] Import graphics assets

### 3. Audio Pass (Fairlight) ✅
- [ ] Dialogue Leveler: Light
- [ ] Voice Isolation: ≤ 30%
- [ ] Loudness: -16 LUFS
- [ ] Music ducking: -6 to -9 dB

### 4. Graphics Pass ✅
- [ ] Place lower-thirds/callouts
- [ ] Animate 200-300ms ease
- [ ] Position strategically
- [ ] Set opacity 85-90%

### 5. Color Pass ✅
- [ ] Small S-curve
- [ ] Saturation: 105-110%
- [ ] Optional neutral LUT
- [ ] Check exposure levels

### 6. Export ✅
- [ ] H.264 format
- [ ] 16-24 Mbps bitrate
- [ ] Keyframe distance: 60
- [ ] 1920x1080, 30fps

## 🎛️ Key Settings

### Audio Settings
```
Dialogue Leveler: Light
Voice Isolation: ≤ 30%
Loudness Target: -16 LUFS
Music Ducking: -6 to -9 dB
```

### Video Settings
```
Resolution: 1920x1080
Frame Rate: 30fps
Color Space: Rec.709
Gamma: 2.4
```

### Export Settings
```
Format: H.264
Bitrate: 16-24 Mbps
Keyframe Distance: 60
Audio: AAC, 128kbps
```

## 📁 File Structure
```
resolve-export/
├── video/final.mp4
├── audio/*.wav
├── graphics/*.png
└── project/IMPORT_GUIDE.md
```

## ⚡ Quick Commands

### Check Frontend
```bash
curl -s http://localhost:3000
```

### Run Export
```bash
./scripts/run-resolve-export.sh
```

### Check Assets
```bash
ls -la resolve-export/
```

## 🔧 Troubleshooting

### Frontend Not Running
```bash
cd ../frontend
npm run dev
```

### Missing Config Files
```bash
# Check if files exist
ls -la record.config.json tts-cue-sheet.json
```

### Export Errors
```bash
# Check disk space
df -h
# Check permissions
ls -la scripts/
```

## 📞 Support
- Full guide: `RESOLVE_FINISHING_GUIDE.md`
- Import guide: `resolve-export/project/IMPORT_GUIDE.md`
- Export summary: `resolve-export/export-summary.json`

