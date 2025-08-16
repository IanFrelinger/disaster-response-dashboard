#!/bin/bash

# Timeline 3 Video Production with TTS
# Creates a complete video presentation with VideoPresentation assets and ElevenLabs TTS

set -e

echo "🎬 Timeline 3 Video Production with TTS"
echo "======================================="
echo "This script creates a complete video presentation with:"
echo "- VideoPresentation assets for professional visuals"
echo "- ElevenLabs TTS with cloned voice"
echo "- Timeline-3.yaml for precise timing"
echo ""

# Check if we're in the right directory
if [ ! -f "timeline-3.yaml" ]; then
    echo "❌ Error: timeline-3.yaml not found"
    echo "Please run this script from the video-production directory"
    exit 1
fi

# Check if VideoPresentation folder exists
if [ ! -d "VideoPresentation" ]; then
    echo "❌ Error: VideoPresentation folder not found"
    echo "This is required for the video production"
    exit 1
else
    echo "✅ Found VideoPresentation folder with assets"
fi

# Check if TTS audio exists
if [ ! -d "audio/vo" ]; then
    echo "⚠️  Warning: TTS audio not found"
    echo "Will generate TTS audio first..."
    
    # Generate TTS audio
    echo "🎤 Generating TTS audio..."
    source venv/bin/activate
    python3 scripts/generate-narration-tts.py --config timeline-3-narration.yaml
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: TTS generation failed"
        exit 1
    fi
    
    echo "✅ TTS audio generated successfully"
else
    echo "✅ Found existing TTS audio files"
fi

# Check if frontend is running
echo "🌐 Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
    echo "   Will use live interactions for segments without assets"
else
    echo "⚠️  Warning: Frontend not running on http://localhost:3000"
    echo "   Will use assets only for video creation"
fi

# Check dependencies
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg not found"
    echo "Please install ffmpeg for video generation"
    exit 1
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Create output directory
mkdir -p output

echo ""
echo "🚀 Starting complete video production with TTS..."
echo ""

# Run the complete video creation with TTS
npx tsx scripts/create-timeline-3-with-tts.ts

echo ""
echo "✅ Timeline 3 video production with TTS completed!"
echo ""
echo "📁 Output files:"
echo "   - output/timeline-3-with-tts-final-with-audio.mp4 (final video with audio)"
echo "   - output/timeline-3-with-tts-final.mp4 (video without audio)"
echo "   - output/*.webm (individual video segments)"
echo "   - output/*.png (fallback screenshots)"
echo "   - audio/vo/*.wav (TTS audio files)"
echo ""
echo "🎬 The complete video presentation includes:"
echo "   - Professional VideoPresentation assets"
echo "   - ElevenLabs TTS with your cloned voice"
echo "   - Timeline-3.yaml timing and narration"
echo "   - Production features and animations"
echo ""
echo "📊 Video details:"
echo "   - Duration: ~2:07 (127 seconds)"
echo "   - Resolution: 1920x1080"
echo "   - FPS: 30"
echo "   - Audio: ElevenLabs TTS with cloned voice"
echo ""
echo "🎯 Next steps:"
echo "   1. Review the final video: output/timeline-3-with-tts-final-with-audio.mp4"
echo "   2. Check audio synchronization"
echo "   3. Share the professional presentation"
echo ""
