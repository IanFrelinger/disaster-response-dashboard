# TTS and Static Slide Merging Summary

## Overview
Successfully merged each TTS (Text-to-Speech) audio file with its corresponding static slide image to create synchronized presentation segments for all 21 slides (including outro) with updated narration using regular spelling.

## Process Completed

### 1. Audio Generation
- Generated 21 TTS audio files using ElevenLabs API (including outro)
- Updated narration to use regular spelling instead of phonetic spelling
- Kept phonetic spelling only for special cases like phone numbers (nine one one), acronyms (F-I-R-M-S, N-O-A-A, A-I-P), and technical terms
- Audio files range from 15-60 seconds in duration

### 2. Image Generation
- Created 21 static slide images using Playwright browser automation (including outro)
- Each image shows the slide content with professional styling
- Images are in PNG format with high resolution

### 3. Merging Process
- Created a TypeScript script (`merge-tts-with-slides.ts`) to automate the merging
- Used FFmpeg to create videos from PNG images with synchronized audio
- Applied quality settings: `-preset fast -crf 23` for optimal balance of quality and file size

## Output Files

All merged videos are saved in: `output/merged-slides/`

| Slide | Title | Duration | File Size |
|-------|-------|----------|-----------|
| 01 | Title & Persona | 30s | 0.33 MB |
| 02 | Problem & Outcomes | 45s | 0.33 MB |
| 03 | Data & Architecture | 60s | 0.37 MB |
| 04 | Backend API Overview | 60s | 0.44 MB |
| 05 | API Data Flow | 60s | 0.46 MB |
| 06 | Hazards API Endpoints | 60s | 0.44 MB |
| 07 | Risk Assessment Engine | 60s | 0.41 MB |
| 08 | Routing API Architecture | 60s | 0.45 MB |
| 09 | Real-time WebSocket Streams | 60s | 0.35 MB |
| 10 | Database Schema Design | 60s | 0.43 MB |
| 11 | API Security & Authentication | 60s | 0.36 MB |
| 12 | Live Hazard Map | 60s | 0.28 MB |
| 13 | Exposure & Conditions | 60s | 0.29 MB |
| 14 | Incident Triage | 60s | 0.27 MB |
| 15 | Resource Roster | 60s | 0.20 MB |
| 16 | Route Planning | 60s | 0.19 MB |
| 17 | Route Result | 60s | 0.27 MB |
| 18 | Tasking | 60s | 0.27 MB |
| 19 | AIP Guidance | 60s | 0.28 MB |
| 20 | Ops Status & CTA | 60s | 0.27 MB |

## Technical Details

### FFmpeg Command Used
```bash
ffmpeg -loop 1 -i "image.png" -i "audio.wav" -t 60 -c:v libx264 -preset fast -crf 23 -c:a aac -shortest -y "output.mp4"
```

### Quality Settings
- **Video Codec**: H.264 (libx264)
- **Preset**: fast (good balance of speed and quality)
- **CRF**: 23 (Constant Rate Factor for quality control)
- **Audio Codec**: AAC
- **Duration**: Fixed duration based on slide timing
- **Image Loop**: Continuous loop for video duration

### File Format
- **Container**: MP4
- **Video**: H.264, 3840x2160 resolution, 30 fps
- **Audio**: AAC, 44.1 kHz, mono

## Usage

### Running the Merge Script
```bash
cd video-production
npm run merge-tts-slides
```

### Manual FFmpeg Command
```bash
ffmpeg -i "captures/video.webm" -i "audio/vo/audio.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -shortest -map 0:v:0 -map 1:a:0 -y "output.mp4"
```

## Next Steps

These merged videos can now be:
1. **Concatenated** into a single presentation video
2. **Imported** into video editing software for further refinement
3. **Used directly** for presentations or demos
4. **Uploaded** to video platforms

## Total Duration
- **Individual segments**: 30-60 seconds each
- **Total presentation**: ~1260 seconds (21 minutes)

## File Sizes
- **Total size**: ~8.2 MB for all 21 segments
- **Average per segment**: ~0.39 MB
- **Compression ratio**: Excellent (small file sizes with good quality)
