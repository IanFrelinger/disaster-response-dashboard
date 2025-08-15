#!/bin/bash

# Extended Narrative Demo Recorder Script
# This script runs a comprehensive demo recording with real interactions driving the narrative

set -e

echo "🎬 Disaster Response Dashboard - Extended Narrative Demo Recorder"
echo "================================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if frontend is running
echo "🔍 Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Warning: Frontend doesn't appear to be running on localhost:3000"
    echo "   You may need to start the frontend first:"
    echo "   cd ../frontend && npm run dev"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if required dependencies are installed
echo "🔍 Checking dependencies..."
if ! command -v tsx &> /dev/null; then
    echo "❌ Error: tsx is not installed. Please install it:"
    echo "   npm install -g tsx"
    exit 1
fi

# Check if macOS say command is available (for TTS)
if ! command -v say &> /dev/null; then
    echo "⚠️  Warning: macOS 'say' command not found. TTS may not work."
    echo "   This script uses macOS built-in text-to-speech."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create output directories
mkdir -p captures
mkdir -p audio

# Run the extended narrative demo recorder
echo "🚀 Starting extended narrative demo recording..."
echo "   This will:"
echo "   - Use REAL UI interactions to drive the narrative"
echo "   - Demonstrate the complete golden path from detection to conclusion"
echo "   - Show hazard detection, zone definition, route planning, unit assignment"
echo "   - Include AI decision support and Foundry integration"
echo "   - Generate professional TTS audio for each beat"
echo "   - Create screenshots for each presentation beat"
echo "   - Total duration: ~6 minutes with 13 detailed narrative beats"
echo ""
echo "🎭 Narrative Flow:"
echo "   1. Introduction - Dual Context Setup"
echo "   2. Hazard Detection & Triage"
echo "   3. Risk Scoring & Decision Making"
echo "   4. Zone Definition & Drill-Down"
echo "   5. Building Evacuation Tracking"
echo "   6. Route Planning with Role-Based Profiles"
echo "   7. Unit Assignment & Status Tracking"
echo "   8. AI Decision Support & Replanning"
echo "   9. Search & Filter Efficiency"
echo "   10. Modal & Form Interactions"
echo "   11. Foundry Integration & Value Proposition"
echo "   12. Conclusion & Call to Action"
echo ""

tsx scripts/extended-narrative-recorder.ts

echo ""
echo "✅ Extended narrative demo recording finished!"
echo "📁 Check the 'captures' directory for recorded videos and screenshots"
echo "🎤 Check the 'audio' directory for generated TTS audio files"
echo "📊 Check 'captures/extended-narrative-report.json' for detailed results"
echo ""
echo "🎬 What This Demo Accomplishes:"
echo "   ✅ Real UI interactions driving the narrative (not static views)"
echo "   ✅ Complete golden path demonstration with actual functionality"
echo "   ✅ Hazard detection, zone drawing, route planning, unit assignment"
echo "   ✅ AI assistant queries and recommendation acceptance"
echo "   ✅ Foundry integration and data pipeline visualization"
echo "   ✅ Professional emergency response workflow demonstration"
echo ""
echo "🎬 Next Steps:"
echo "1. Review the recorded extended narrative video in the captures directory"
echo "2. Check the generated audio files in the audio directory"
echo "3. Use video editing software to combine video and audio"
echo "4. Add professional graphics, transitions, and polish"
echo "5. The video now shows the complete golden path with real interactions!"
echo ""
echo "🎯 This demo addresses all the feedback about showing real functionality"
echo "   instead of just static screenshots. Viewers will see actual decision-making"
echo "   and how the system supports emergency response operations."
