#!/bin/bash

# Test ElevenLabs TTS Integration
# This script tests the ElevenLabs TTS integration with your cloned voice

set -e

echo "🧪 Testing ElevenLabs TTS Integration"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed"
    exit 1
fi

# Check if required packages are installed
echo "🔍 Checking dependencies..."
# Activate virtual environment
source venv/bin/activate
python3 -c "from elevenlabs import client" 2>/dev/null || {
    echo "❌ Error: ElevenLabs package not installed"
    echo "   Please install: pip install elevenlabs"
    exit 1
}

# Check if config.env is loaded
if [ ! -f "config.env" ]; then
    echo "❌ Error: config.env not found"
    echo "   Please copy config.env.example to config.env and fill in your API keys"
    exit 1
fi

# Load environment variables
echo "🔑 Loading configuration..."
source config.env

# Check if API key is set
if [ -z "$ELEVEN_API_KEY" ]; then
    echo "❌ Error: ELEVEN_API_KEY not set in config.env"
    exit 1
fi

if [ -z "$ELEVEN_VOICE_ID" ]; then
    echo "❌ Error: ELEVEN_VOICE_ID not set in config.env"
    exit 1
fi

echo "✅ Configuration loaded"
echo "🔑 API Key: ${ELEVEN_API_KEY:0:10}..."
echo "🎤 Voice ID: $ELEVEN_VOICE_ID"

# Run the test
echo ""
echo "🚀 Running ElevenLabs TTS test..."
source venv/bin/activate && ELEVEN_API_KEY="$ELEVEN_API_KEY" ELEVEN_VOICE_ID="$ELEVEN_VOICE_ID" python3 scripts/test-elevenlabs-tts.py

echo ""
echo "✅ Test completed!"
echo "🎤 If successful, you should see a test audio file in audio/vo/"
