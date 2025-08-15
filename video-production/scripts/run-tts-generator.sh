#!/bin/bash

# TTS Generator Script
# This script generates text-to-speech audio files for the presentation

set -e

echo "🎤 Disaster Response Dashboard - TTS Generator"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if required dependencies are installed
echo "🔍 Checking dependencies..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed."
    exit 1
fi

# Check if required Python packages are installed
echo "🔍 Checking Python dependencies..."
# Activate virtual environment
source venv/bin/activate
python3 -c "import yaml, requests" 2>/dev/null || {
    echo "❌ Error: Required Python packages not installed."
    echo "   Please install: pip install pyyaml requests"
    exit 1
}

# Check if ElevenLabs package is installed
python3 -c "from elevenlabs import text_to_speech" 2>/dev/null || {
    echo "❌ Error: ElevenLabs package not installed."
    echo "   Please install: pip install elevenlabs"
    exit 1
}

# Load environment variables
if [ -f "config.env" ]; then
    echo "🔑 Loading configuration..."
    source config.env
else
    echo "❌ Error: config.env not found"
    echo "   Please copy config.env.example to config.env and fill in your API keys"
    exit 1
fi

# Create audio directory
mkdir -p audio

# Run the TTS generator
echo "🚀 Starting TTS generation..."
echo "   This will:"
echo "   - Generate WAV audio files for each scene from narration.yaml"
echo "   - Use ElevenLabs with your cloned voice"
echo "   - Create audio files for all scenes in the narration"
echo ""

source venv/bin/activate && ELEVEN_API_KEY="$ELEVEN_API_KEY" ELEVEN_VOICE_ID="$ELEVEN_VOICE_ID" python3 scripts/generate-narration-tts.py

echo ""
echo "✅ TTS generation finished!"
echo "🎤 Check the 'audio/vo' directory for generated audio files"
echo "📊 Check 'audio/vo/narration-tts-report.json' for detailed results"
echo ""
echo "🎬 Next Steps:"
echo "1. Review the generated audio files in the audio/vo directory"
echo "2. Use video editing software to combine video and audio"
echo "3. Adjust timing if needed to sync audio with video"
echo "4. Add any additional sound effects or music as needed"
