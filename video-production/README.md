# Video Production Directory

This directory contains the essential tools and assets for creating disaster response dashboard demo videos.

## Core Structure

### Scripts (`/scripts`)
- **Main Production Scripts**: Core video creation and automation scripts
- **Pipeline Scripts**: Automated workflows for video production
- **Utility Scripts**: Helper scripts for various video production tasks

### Assets (`/assets`)
- **Diagrams**: Technical diagrams and flowcharts
- **Slides**: Presentation slides and graphics
- **Art**: Visual assets and artwork

### Configuration (`/config`)
- **Timeline Files**: Video timeline definitions
- **TTS Configs**: Text-to-speech configuration files
- **Recording Configs**: Video recording settings

## Essential Files

### Core Scripts
- `create-proper-demo-video.ts` - Main video creation script
- `run-production-pipeline.ts` - Production pipeline automation
- `enhanced-critic-bot.ts` - Quality control automation

### Configuration
- `timeline.yaml` - Main video timeline
- `record.config.json` - Recording configuration
- `tts-cue-sheet.json` - Text-to-speech timing

### Assets
- `/assets/diagrams/` - Technical diagrams
- `/assets/slides/` - Presentation materials
- `/assets/art/` - Visual assets

## Quick Start

1. **Setup**: Install dependencies with `npm install`
2. **Configure**: Update timeline and recording settings
3. **Run**: Execute main production script
4. **Export**: Use resolve export pipeline for final output

## Dependencies

- Node.js and npm
- Playwright for browser automation
- FFmpeg for video processing
- DaVinci Resolve for final editing

## Notes

- This directory has been simplified from the original complex structure
- Only essential production files are retained
- Test files and excessive documentation have been removed
- Focus is on maintainable, production-ready scripts
