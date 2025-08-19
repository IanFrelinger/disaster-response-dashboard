# Resolve Import Guide

## Step 1: Import Assets
1. Open DaVinci Resolve
2. Create new project: "Disaster Response Dashboard Demo"
3. Import the following:
   - Video: ./video/ (rough cut MP4)
   - Audio: ./audio/ (TTS WAV files)
   - Graphics: ./graphics/ (PNG/SVG assets)

## Step 2: Timeline Setup
1. Create new timeline: 3840x2160, 30fps
2. Import rough cut video to timeline
3. Add audio tracks for TTS narration
4. Add graphics tracks for overlays

## Step 3: Audio Pass (Fairlight)
- Dialogue Leveler: Light
- Voice Isolation: ≤ 30%
- Loudness: -16 LUFS
- Music track: Side-chain duck -6 to -9 dB under VO

## Step 4: Graphics Pass
- Place lower-thirds/callouts
- Animate 200-300ms ease
- Position graphics strategically

## Step 5: Color Pass
- Small S-curve
- Slight saturation bump (105-110%)
- Optional neutral LUT

## Step 6: Export Settings
- Format: H.264
- Bitrate: 32-48 Mbps (4K requires higher bitrate)
- Keyframe distance: 60
- Resolution: 3840x2160 (4K Ultra HD)
- Frame rate: 30fps

## File Structure
```
resolve-export/
├── video/          # Rough cut MP4
├── audio/          # TTS WAV files
├── graphics/       # PNG/SVG assets
└── project/        # Project files
```
