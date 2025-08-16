# DaVinci Resolve Import Guide

## Project Overview
- **Project Name**: Disaster Response Demo
- **Duration**: ~5:40 (340 seconds)
- **Resolution**: 1920×1080
- **Frame Rate**: 30 FPS

## Import Steps

### 1. Create New Project
- Open DaVinci Resolve
- Create new project: "Disaster Response Demo"
- Set timeline resolution to 1920×1080, 30 FPS

### 2. Import Media
- **Video**: Import 'video/final.mp4' to Media Pool
- **Audio**: Import all files from 'audio/' folder
- **Graphics**: Import all files from 'graphics/' folder

### 3. Timeline Setup
- Create new timeline: "Disaster Response Demo"
- Drag video to timeline
- Add audio tracks for each beat (B01_intro.wav through B10_conclusion.wav)

### 4. Audio Processing (Fairlight)
- Apply Dialogue Leveler (light settings)
- Apply Voice Isolation (≤ 30%)
- Set Loudness to –16 LUFS
- Add music track with side-chain duck (–6 to –9 dB under VO)

### 5. Graphics Integration
- Place lower-thirds and callouts from graphics folder
- Animate with 200–300 ms ease
- Position according to timeline.yaml specifications

### 6. Color Grading
- Apply small S-curve
- Slight saturation bump (105–110%)
- Optional neutral LUT

### 7. Export Settings
- Format: H.264
- Bitrate: 16–24 Mbps
- Keyframe distance: 60
- Resolution: 1920×1080

## File Structure
```
resolve-export/
├── video/
│   └── final.mp4              # Main video file
├── audio/
│   ├── B01_intro.wav          # Beat 1 audio
│   ├── B02_roles.wav          # Beat 2 audio
│   ├── B03_api.wav            # Beat 3 audio
│   ├── B04_map.wav            # Beat 4 audio
│   ├── B05_zones.wav          # Beat 5 audio
│   ├── B06_route.wav          # Beat 6 audio
│   ├── B07_ai.wav             # Beat 7 audio
│   ├── B08_tech.wav           # Beat 8 audio
│   ├── B09_impact.wav         # Beat 9 audio
│   └── B10_conclusion.wav     # Beat 10 audio
├── graphics/
│   ├── art/
│   │   ├── intro.png          # Intro graphic
│   │   └── conclusion.png     # Conclusion graphic
│   ├── diagrams/
│   │   ├── api_data_flow.png  # API diagram
│   │   ├── operational_overview.png
│   │   └── route_concept_overlay.png
│   └── slides/
│       └── impact_value.png   # Impact slide
└── project-files/
    ├── record.config.json     # Beat configuration
    ├── timeline.yaml          # Timeline specification
    └── tts-cue-sheet.json     # Narration scripts
```

## Timeline Reference
- **B01_intro**: 0:00-0:30 (30s)
- **B02_roles**: 0:30-1:00 (30s)
- **B03_api**: 1:00-1:40 (40s)
- **B04_map**: 1:40-2:20 (40s)
- **B05_zones**: 2:20-3:00 (40s)
- **B06_route**: 3:00-3:40 (40s)
- **B07_ai**: 3:40-4:10 (30s)
- **B08_tech**: 4:10-4:50 (40s)
- **B09_impact**: 4:50-5:20 (30s)
- **B10_conclusion**: 5:20-5:40 (20s)

## Notes
- All audio files are professional TTS generated with ElevenLabs
- Graphics are placeholder files - replace with final assets
- Video contains real UI interactions, not static screenshots
- Timeline is designed for smooth transitions between beats

## Next Steps
1. Import all media into Resolve
2. Sync audio with video timeline
3. Add graphics and animations
4. Apply audio processing
5. Color grade
6. Export final video
