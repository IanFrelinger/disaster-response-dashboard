#!/bin/bash

# Final Presentation Assembly Script
# This script assembles all synced beats into a complete presentation

set -e

echo "🎬 Disaster Response Dashboard - Final Presentation Assembly"
echo "============================================================"

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
    echo "   Please run the beat synchronization first: ./scripts/run-beat-sync.sh"
    exit 1
fi

# Create output directory
mkdir -p final-presentation

# Run the final assembly
echo "🚀 Starting final presentation assembly..."
echo "   This will:"
echo "   - Combine all 13 synced beat files"
echo "   - Create a seamless final presentation"
echo "   - Maintain video and audio quality"
echo "   - Output: disaster-response-presentation.mp4"
echo ""

tsx scripts/assemble-final-presentation.ts

echo ""
echo "✅ Final presentation assembly finished!"
echo "🎬 Check the 'final-presentation' directory for the complete video"
echo "📊 Check 'final-presentation/final-presentation-report.json' for details"
echo ""
echo "🎉 Your disaster-response presentation is ready!"
echo "The final video includes:"
echo "  - Professional video interactions"
echo "  - Synchronized text-to-speech narration"
echo "  - Perfect timing and transitions"
echo "  - High-quality MP4 format"
echo "  - Ready for sharing or further editing"
