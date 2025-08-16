# Recorder-Ready Timeline Guide

## Overview

This guide covers the new recorder-ready timeline for the Disaster Response Platform demo video. The timeline is designed to work with your existing Playwright + record.config.json + overlay engine + timeline.yaml assembly pipeline.

## Timeline Structure

**Total Duration:** 5:40 (340 seconds)
**Format:** 1920×1080, 30 FPS
**Style:** Professional, narrative-driven demo

### Beat Breakdown

| Beat | Duration | Focus | Key Actions |
|------|----------|-------|-------------|
| B01 - Intro | 30s | Problem context | Title overlay, fade transitions |
| B02 - Roles | 30s | User personas | Dashboard navigation, role callouts |
| B03 - API Overview | 40s | Technical architecture | Data flow diagram, endpoint chips |
| B04 - Map Triage | 40s | Live hazard interaction | Map navigation, hazard clicking |
| B05 - Zones | 40s | Zone management | Dashboard cards, status badges |
| B06 - Route Concept | 40s | A-Star routing | Route overlay, profile panels |
| B07 - AI Concept | 30s | Decision support | Type-on overlay, recommendation cards |
| B08 - Tech Deep Dive | 40s | Processing details | Zoom-ins, endpoint flashing |
| B09 - Impact | 30s | Value proposition | Impact slide, animated metrics |
| B10 - Conclusion | 20s | Call to action | Contact info, fade out |

## Configuration Files

### 1. record.config.json
Updated with new beats that use your overlay engine syntax:
- `overlay(type,action,timing)` for dynamic overlays
- `mouseClick(x,y)` for precise interactions
- `screenshot(path)` for captures
- `wait(ms)` for timing control

### 2. timeline.yaml
Updated timeline with:
- 340-second total duration
- Fade transitions between segments
- Updated metadata for Palantir challenge
- Proper audio/video track synchronization

### 3. tts-cue-sheet.json
Voiceover narration for each beat using "alloy" voice:
- Concise, professional tone
- Technical accuracy
- Clear value proposition
- Contact information

## Required Assets

### Art Assets
- `assets/art/intro.png` - 1920×1080 title slide
- `assets/art/conclusion.png` - 1920×1080 conclusion slide

### Diagrams
- `assets/diagrams/api_data_flow.png` - Technical architecture
- `assets/diagrams/operational_overview.png` - System overview
- `assets/diagrams/route_concept_overlay.png` - Blue A* path (PNG with alpha)

### Slides
- `assets/slides/impact_value.png` - Impact metrics slide

## Recording Instructions

### Global Settings
- Viewport: 1920×1080
- Display scale: 110–125% in OS for larger UI
- FPS: 30
- Video: webm/vp9, no audio (TTS muxed later)
- Cursor: Slow moves, 0.3–1.0s pauses after actions

### Key Interactions
1. **Dashboard Navigation**: Use `click("text=Commander Dashboard")` and `click("text=Live Map")`
2. **Hazard Interaction**: `mouseClick(740, 580)` for known hotspot
3. **Map Controls**: `wheel(-120)` for zoom, `mouseDrag()` for pan
4. **Overlays**: Dynamic overlay engine handles callouts, badges, status

### Verification Hooks
- Min file size: ≥ 100 KB per segment
- Min duration: ≥ 5s per segment
- Content sanity: Non-black sample frame check
- Post-mux: Check total runtime ≈ 340s and audio presence

## Integration with Existing Pipeline

### 1. Manual Recording
```bash
cd video-production
npm run record-beats  # Uses updated record.config.json
```

### 2. Automated Assembly
```bash
npm run assemble-video  # Uses updated timeline.yaml
```

### 3. TTS Generation
```bash
npm run generate-tts  # Uses tts-cue-sheet.json
```

## Customization Options

### Timing Adjustments
- Modify `duration` values in record.config.json
- Update `start` times in timeline.yaml accordingly
- Adjust TTS timing in tts-cue-sheet.json

### Content Changes
- Replace placeholder assets with actual graphics
- Modify overlay text in beat actions
- Update narration text in TTS cue sheet

### Style Modifications
- Change transition types in timeline.yaml
- Adjust color grading in effects section
- Modify lower-third styles and positions

## Troubleshooting

### Common Issues
1. **Asset Not Found**: Ensure all placeholder files are replaced with actual PNGs
2. **Timing Mismatch**: Verify beat durations match between config files
3. **Overlay Engine**: Check overlay syntax matches your engine's requirements
4. **Audio Sync**: Ensure TTS timing aligns with video segments

### Verification Steps
1. Run `npm run verify-assets` to check file presence
2. Run `npm run test-beats` to validate beat actions
3. Run `npm run preview-timeline` to check assembly
4. Run `npm run smoke-test` for end-to-end validation

## Next Steps

1. **Replace Placeholder Assets**: Create actual PNG graphics for all placeholder files
2. **Test Beat Recording**: Verify each beat records correctly with your overlay engine
3. **Validate Timeline**: Ensure video assembly works with new timeline structure
4. **Generate TTS**: Create voiceover audio using the cue sheet
5. **Final Assembly**: Combine video, audio, and graphics into final demo

## File Structure

```
video-production/
├── record.config.json          # Updated beat configuration
├── timeline.yaml               # Updated assembly timeline
├── tts-cue-sheet.json          # Voiceover narration
├── assets/
│   ├── art/
│   │   ├── intro.png           # Title slide
│   │   └── conclusion.png      # Conclusion slide
│   ├── diagrams/
│   │   ├── api_data_flow.png   # Technical architecture
│   │   ├── operational_overview.png
│   │   └── route_concept_overlay.png
│   └── slides/
│       └── impact_value.png    # Impact metrics
└── RECORDER_READY_TIMELINE_GUIDE.md
```

This timeline is designed to showcase your Disaster Response Platform effectively while working within your existing technical constraints and using only implemented UI features.
