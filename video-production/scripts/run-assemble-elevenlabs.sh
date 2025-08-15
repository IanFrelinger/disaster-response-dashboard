#!/bin/bash

# ElevenLabs Presentation Assembly Script
# This script assembles all synced beats into a complete presentation

set -e

echo "🎬 Disaster Response Dashboard - ElevenLabs Presentation Assembly"
echo "================================================================="

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

# Check if synced beats exist
if [ ! -d "synced-beats" ] || [ -z "$(ls synced-beats/*.mp4 2>/dev/null)" ]; then
    echo "❌ Error: No synced beat files found in synced-beats directory"
    echo "   Please run the beat synchronization first: ./scripts/run-beat-sync-elevenlabs.sh"
    exit 1
fi

# Create output directory
mkdir -p final-presentation

# Run the presentation assembly
echo "🚀 Starting ElevenLabs presentation assembly..."
echo "   This will:"
echo "   - Combine all synced beat files into one presentation"
echo "   - Maintain perfect video-audio synchronization"
echo "   - Create a professional MP4 file with your cloned voice"
echo "   - Generate a complete presentation ready for submission"
echo ""

tsx scripts/assemble-elevenlabs-presentation.ts

echo ""
echo "✅ ElevenLabs presentation assembly finished!"
echo "🎬 Check the 'final-presentation' directory for the complete presentation"
echo "📊 Check 'final-presentation/assembly-report.json' for detailed results"
echo ""
echo "🎬 Final Presentation Features:"
echo "  - Complete disaster response dashboard demo"
echo "  - ElevenLabs audio with your cloned voice throughout"
echo "  - Professional MP4 format"
echo "  - Perfect video-audio synchronization"
echo "  - Ready for submission or sharing"
echo ""
echo "🎬 Next Steps:"
echo "1. Review the final presentation in final-presentation/"
echo "2. The presentation is ready for submission"
echo "3. Share or upload as needed"
