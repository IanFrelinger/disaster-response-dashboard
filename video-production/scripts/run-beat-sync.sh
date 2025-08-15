#!/bin/bash

# Beat Synchronization Script
# This script extracts individual beats from the main video and syncs them with audio

set -e

echo "🎬 Disaster Response Dashboard - Beat Synchronization"
echo "====================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if required dependencies are installed
echo "🔍 Checking dependencies..."
if ! command -v tsx &> /dev/null; then
    echo "❌ Error: tsx is not installed. Please install it:"
    echo "   npm install -g tsx"
    exit 1
fi

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed. Please install it:"
    echo "   brew install ffmpeg"
    exit 1
fi

# Check if ffprobe is available
if ! command -v ffprobe &> /dev/null; then
    echo "❌ Error: ffprobe is not installed. Please install it:"
    echo "   brew install ffmpeg"
    exit 1
fi

# Check if video file exists
if [ ! -d "captures" ] || [ -z "$(ls captures/*.webm 2>/dev/null)" ]; then
    echo "❌ Error: No WebM video files found in captures directory"
    echo "   Please run the video recording first: ./scripts/run-simple-presentation.sh"
    exit 1
fi

# Check if audio files exist
if [ ! -d "audio" ] || [ -z "$(ls audio/*.aiff 2>/dev/null)" ]; then
    echo "❌ Error: No AIFF audio files found in audio directory"
    echo "   Please run the TTS generator first: ./scripts/run-tts-generator.sh"
    exit 1
fi

# Create output directory
mkdir -p synced-beats

# Run the beat synchronization
echo "🚀 Starting beat synchronization..."
echo "   This will:"
echo "   - Extract individual video segments for each beat"
echo "   - Sync each segment with its corresponding audio file"
echo "   - Create 13 MP4 files with perfect video-audio sync"
echo "   - Output format: MP4 with H.264 video and AAC audio"
echo ""

tsx scripts/sync-beats.ts

echo ""
echo "✅ Beat synchronization finished!"
echo "🎬 Check the 'synced-beats' directory for individual beat files"
echo "📊 Check 'synced-beats/beat-sync-report.json' for detailed results"
echo ""
echo "🎬 Synced Beat Files:"
echo "Each file contains:"
echo "  - Video segment from the main recording"
echo "  - Synchronized audio narration"
echo "  - Perfect timing alignment"
echo "  - MP4 format ready for editing"
echo ""
echo "🎬 Next Steps:"
echo "1. Review the synced beat files in the synced-beats directory"
echo "2. Each file contains video + audio perfectly synchronized"
echo "3. Use video editing software to combine all beats into final presentation"
echo "4. Add transitions, graphics, or additional enhancements as needed"
