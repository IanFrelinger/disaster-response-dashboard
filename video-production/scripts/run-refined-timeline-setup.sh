#!/bin/bash

# Refined Timeline Setup Script
# Complete setup for the 5-minute refined timeline video

set -e  # Exit on any error

echo "🎬 Refined Timeline Setup"
echo "========================="
echo "Setting up complete 5-minute refined timeline video"
echo ""

# Check if we're in the right directory
if [ ! -f "timeline-5-minute-refined.yaml" ]; then
    echo "❌ Error: timeline-5-minute-refined.yaml not found"
    echo "   Please run this script from the video-production directory"
    exit 1
fi

# Check if required tools are available
echo "🔧 Checking required tools..."
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg not found. Please install ffmpeg first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install python3 first."
    exit 1
fi

echo "✅ All required tools available"
echo ""

# Load environment variables from config.env
if [ -f "config.env" ]; then
    echo "📁 Loading configuration from config.env..."
    source config.env
    echo "✅ Configuration loaded"
else
    echo "⚠️  Warning: config.env not found"
fi

# Check if ElevenLabs API key is set
if [ -z "$ELEVEN_API_KEY" ]; then
    echo "⚠️  Warning: ELEVEN_API_KEY not set"
    echo "   TTS generation may fail. Please set your API key in config.env:"
    echo "   ELEVEN_API_KEY=your-api-key-here"
    echo ""
else
    echo "✅ ElevenLabs API key is configured"
fi

# Step 1: Generate TTS Audio
echo "🎤 Step 1: Generating TTS Audio"
echo "================================"
cd scripts
conda run -n base python generate-refined-timeline-tts.py
if [ $? -ne 0 ]; then
    echo "❌ TTS generation failed"
    exit 1
fi
cd ..
echo ""

# Step 2: Create Video
echo "🎥 Step 2: Creating Video"
echo "========================="
cd scripts
conda run -n base python create-refined-timeline-video.py
if [ $? -ne 0 ]; then
    echo "❌ Video creation failed"
    exit 1
fi
cd ..
echo ""

# Step 3: Verify Output
echo "✅ Step 3: Verifying Output"
echo "==========================="

if [ -f "output/timeline-5-minute-refined-final.mp4" ]; then
    echo "✅ Final video created successfully"
    
    # Get video info
    if command -v ffprobe &> /dev/null; then
        duration=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "output/timeline-5-minute-refined-final.mp4")
        size=$(ls -lh "output/timeline-5-minute-refined-final.mp4" | awk '{print $5}')
        echo "   • Duration: ${duration}s"
        echo "   • Size: ${size}"
    fi
else
    echo "❌ Final video not found"
    exit 1
fi

echo ""
echo "🎉 Refined Timeline Setup Complete!"
echo "=================================="
echo "📁 Final video: output/timeline-5-minute-refined-final.mp4"
echo "🎯 Ready for presentation!"
echo ""
echo "📋 Summary:"
echo "   • TTS audio generated for all 10 segments"
echo "   • Video segments created with professional assets"
echo "   • Final 5-minute video assembled"
echo "   • Timeline follows refined narrative structure"
echo ""
