# Resolve Finishing Pipeline - Option A

## Overview
This guide follows the **Option A — Resolve finishing** pipeline for creating a professional demo video with DaVinci Resolve.

## Pipeline Steps

### 1. Export Rough Cut + Assets
```bash
# Run the Resolve export pipeline
cd video-production
./scripts/run-resolve-export.sh
```

This creates:
- `resolve-export/video/` - Rough cut MP4 (final.mp4)
- `resolve-export/audio/` - TTS WAV files
- `resolve-export/graphics/` - PNG/SVG assets
- `resolve-export/project/` - Project files & import guide

### 2. Import into Resolve

#### Project Setup
1. Open DaVinci Resolve
2. Create new project: "Disaster Response Dashboard Demo"
3. Set project settings:
   - Frame rate: 30fps
   - Resolution: 1920x1080
   - Color space: Rec.709
   - Audio sample rate: 48kHz

#### Asset Import
1. **Media Pool**: Import all assets from `resolve-export/`
2. **Video**: Import rough cut MP4 to timeline
3. **Audio**: Import TTS WAV files to separate tracks
4. **Graphics**: Import PNG/SVG assets for overlays

### 3. Transcribe for Text-Based Editing
1. Select timeline
2. Go to **Edit** page
3. Right-click timeline → **Transcribe**
4. Enable text-based editing for precise timing adjustments

### 4. Audio Pass (Fairlight)

#### Dialogue Processing
- **Dialogue Leveler**: Light (subtle leveling)
- **Voice Isolation**: ≤ 30% (reduce background noise)
- **Loudness**: Target -16 LUFS (broadcast standard)

#### Music Integration
- Add background music track
- **Side-chain ducking**: -6 to -9 dB under VO
- Use Fairlight's compressor with side-chain input

#### Audio Settings
```
Track 1: Main VO (TTS)
Track 2: Background Music
Track 3: Sound Effects (if any)
```

### 5. Graphics Pass

#### Lower-Thirds & Callouts
- Place graphics strategically on timeline
- **Animation**: 200-300ms ease in/out
- **Positioning**: Avoid critical UI elements
- **Opacity**: 85-90% for overlays

#### Graphics Animation
- Use **Fusion** page for complex animations
- Apply **Transform** nodes for smooth movement
- **Ease curves**: Smooth acceleration/deceleration

### 6. Color Pass

#### Basic Correction
- **S-curve**: Small adjustment for contrast
- **Saturation**: Bump to 105-110%
- **Exposure**: Ensure proper levels

#### Optional LUT
- Apply neutral LUT for consistent look
- **Input**: Rec.709
- **Output**: Rec.709 (or target display)

### 7. Export Settings

#### H.264 Export Configuration
```
Format: H.264
Codec: H.264
Resolution: 1920x1080
Frame Rate: 30fps
Bitrate: 16-24 Mbps
Keyframe Distance: 60
Audio: AAC, 128kbps
```

#### Export Steps
1. Go to **Deliver** page
2. Select **Custom** export settings
3. Apply above configuration
4. Set output path and filename
5. Add to render queue
6. Start render

## File Structure
```
resolve-export/
├── video/
│   └── final.mp4              # Rough cut for Resolve
├── audio/
│   ├── 01-discovery-narration.wav
│   ├── 02-operations-exploration-narration.wav
│   └── ...                    # All TTS WAV files
├── graphics/
│   ├── slides/
│   ├── diagrams/
│   ├── art/
│   └── *.svg                  # Vector graphics
└── project/
    ├── resolve-project.json   # Project configuration
    └── IMPORT_GUIDE.md        # Detailed import instructions
```

## Quality Checklist

### Audio Quality
- [ ] VO levels consistent (-16 LUFS)
- [ ] Background noise reduced
- [ ] Music properly ducked under VO
- [ ] No clipping or distortion

### Visual Quality
- [ ] Graphics properly positioned
- [ ] Smooth animations (200-300ms)
- [ ] Color correction applied
- [ ] No visual artifacts

### Technical Quality
- [ ] 1920x1080 resolution
- [ ] 30fps frame rate
- [ ] 16-24 Mbps bitrate
- [ ] Keyframe distance: 60

## Troubleshooting

### Common Issues
1. **Audio sync issues**: Check frame rate settings
2. **Graphics not appearing**: Verify import paths
3. **Export errors**: Check disk space and codec support
4. **Performance issues**: Use optimized media

### Performance Tips
- Use **Optimized Media** for better playback
- **Proxy files** for complex graphics
- **Render cache** for smooth editing
- **GPU acceleration** if available

## Final Output
The completed video should be:
- **Duration**: ~5-6 minutes
- **Quality**: Professional broadcast standard
- **Format**: H.264 MP4
- **Size**: Optimized for web delivery

## Next Steps
After Resolve finishing:
1. Review final video quality
2. Test on target platforms
3. Archive project files
4. Document any custom settings for future reference

