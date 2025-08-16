#!/bin/bash
# Interactive Video with TTS Pipeline Runner
# This script creates a professional video with real interactions and ElevenLabs TTS narration

set -e

echo "🎬 Interactive Video with TTS Pipeline"
echo "======================================"
echo "This will create a professional video based on 'Video presentation plan-3'"
echo "Features: Real interactions + ElevenLabs TTS narration"
echo ""

# Check if we're in the right directory
if [ ! -f "timeline-3.yaml" ]; then
    echo "❌ Error: timeline-3.yaml not found in current directory"
    echo "Please run this script from the video-production directory"
    exit 1
fi

# Check if frontend is running
echo "🔍 Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Error: Frontend is not running on http://localhost:3000"
    echo "Please start the frontend first:"
    echo "  cd ../frontend && npm run dev"
    exit 1
fi
echo "✅ Frontend is running"

# Check dependencies
echo "🔍 Checking dependencies..."

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
fi

# Check if FFmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: FFmpeg is not installed"
    echo "Please install FFmpeg: brew install ffmpeg"
    exit 1
fi
echo "✅ FFmpeg is available"

# Check if ImageMagick is available (for graphics)
if ! command -v convert &> /dev/null; then
    echo "⚠️  Warning: ImageMagick not found (convert command)"
    echo "Graphics generation may be limited"
else
    echo "✅ ImageMagick is available"
fi

# Check if we have the required audio directory
if [ ! -d "audio/vo" ]; then
    echo "📁 Creating audio directory..."
    mkdir -p audio/vo
fi

# Check if we have the required output directory
if [ ! -d "output" ]; then
    echo "📁 Creating output directory..."
    mkdir -p output
fi

echo ""
echo "🚀 Starting Interactive Video with TTS Creation..."
echo ""

# Run the enhanced interactive video script
npx tsx scripts/create-interactive-video-with-tts.ts

echo ""
echo "🎬 Pipeline completed!"
echo ""
echo "📁 Generated files:"
echo "  - output/timeline-3-interactive-with-tts.mp4 (main video with TTS)"
echo "  - output/timeline-3-screenshots-with-tts.mp4 (fallback with TTS)"
echo "  - audio/vo/ (TTS audio files)"
echo ""
echo "🎯 Next steps:"
echo "  1. Review the generated video with TTS"
echo "  2. Check audio quality and timing"
echo "  3. Adjust narration timing if needed"
echo "  4. Use the video for your presentation"
echo ""
echo "✨ Your professional interactive video with TTS is ready!"
