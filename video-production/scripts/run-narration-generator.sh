#!/bin/bash

# ElevenLabs Narration Generator for Disaster Response Demo
# This script generates professional voiceover for each video segment

set -e

echo "🎙️ Starting ElevenLabs Narration Generation..."
echo "=============================================="
echo ""
echo "🎯 This will create:"
echo "   🎙️ Professional voiceover for each segment"
echo "   📝 Complete narration script"
echo "   🎬 Audio files ready for video editing"
echo "   🎭 Professional pacing and timing"
echo ""
echo "📹 Narration Segments:"
echo "   1. Discovery (15s) - Platform introduction"
echo "   2. Operations Exploration (20s) - Evacuation zones"
echo "   3. Weather Integration (18s) - Risk assessment"
echo "   4. Asset Management (16s) - Building data"
echo "   5. AI Experience (22s) - Decision support"
echo "   6. Live Map Exploration (14s) - Geographic features"
echo "   7. Comprehensive Overview (12s) - Final summary"
echo ""
echo "📊 Total Duration: 117 seconds (~2 minutes)"
echo "🎙️ Professional voiceover with Adam voice"
echo "📁 Audio files saved to output/audio/"
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/generate-narration.ts" ]; then
    echo "❌ Please run this script from the video-production directory"
    exit 1
fi

# Load config file if it exists
if [ -f "config.env" ]; then
    echo "📋 Loading configuration from config.env..."
    source config.env
    echo "✅ Configuration loaded"
fi

# Check for ElevenLabs API key
if [ -z "$ELEVEN_API_KEY" ]; then
    echo "❌ ELEVEN_API_KEY environment variable is not set"
    echo ""
    echo "🔑 Please check your config.env file contains:"
    echo "   ELEVEN_API_KEY=your_actual_api_key_here"
    echo ""
    echo "📖 You can get your API key from: https://elevenlabs.io/"
    echo "   (Sign up for a free account to get started)"
    exit 1
fi

echo "✅ ElevenLabs API key found: ${ELEVEN_API_KEY:0:20}..."

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Install ElevenLabs package if not present
if ! npm list elevenlabs-node > /dev/null 2>&1; then
    echo "   Installing ElevenLabs package..."
    npm install elevenlabs-node
fi

# Create output directories
echo "📁 Preparing output directories..."
mkdir -p output/audio

# Run the narration generator
echo ""
echo "🎙️ Starting narration generation..."
echo "   This will create professional voiceover for each segment"
echo "   Using ElevenLabs Adam voice for clear, professional delivery"
echo ""

# Pass environment variables to the Node.js process
ELEVEN_API_KEY="$ELEVEN_API_KEY" npx tsx scripts/generate-narration.ts

echo ""
echo "✅ Narration generation completed!"
echo "🎙️ Professional voiceover files created for each segment"
echo "📝 Complete script file generated for video production"
echo ""
echo "🎯 Next steps for video production:"
echo "   1. Audio files are ready in output/audio/"
echo "   2. Import into video editing software"
echo "   3. Sync with video segments"
echo "   4. Add lower thirds and callouts"
echo "   5. Apply professional transitions"
echo "   6. Export final narrated video"
echo ""
echo "🚀 Professional narration ready for video production!"
echo "🎬 Complete audio-visual experience created"
