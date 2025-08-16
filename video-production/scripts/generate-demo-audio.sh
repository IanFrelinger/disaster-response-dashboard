#!/bin/bash

# Demo Audio Generation Script
# Generates audio snippets for the Disaster Response Dashboard demo video

set -e

echo "🎤 Generating Demo Audio Snippets..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  Warning: ffmpeg not found. Audio conversion may fail."
    echo "   Install ffmpeg for better audio processing:"
    echo "   - macOS: brew install ffmpeg"
    echo "   - Ubuntu: sudo apt-get install ffmpeg"
    echo "   - Windows: Download from https://ffmpeg.org/"
fi

# Check if macOS say command is available (for TTS)
if ! command -v say &> /dev/null; then
    echo "❌ Error: macOS 'say' command not found. This script requires macOS for TTS."
    echo "   For other platforms, you may need to modify the script to use different TTS engines."
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Run the TypeScript script
echo "🚀 Starting audio generation..."
npx tsx scripts/generate-demo-audio-snippets.ts

echo ""
echo "🎉 Audio generation completed!"
echo ""
echo "📁 Generated files:"
echo "   • Individual segments: audio/vo/demo-*.wav"
echo "   • Complete audio: audio/vo/demo-voiceover-complete.wav"
echo "   • Narration script: output/demo-narration-script.md"
echo ""
echo "🎬 Next steps:"
echo "   1. Review the generated audio files"
echo "   2. Use the narration script for video editing"
echo "   3. Sync audio with video segments"
echo ""
