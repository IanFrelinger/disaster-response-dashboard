#!/bin/bash

# Simple wrapper script for running the demo automation
# This script is designed to be run from within the Docker container

echo "🎬 Disaster Response Dashboard Demo Automation"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/run-demo-automation.sh" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Run the demo automation with cleanup
./scripts/run-demo-automation.sh --cleanup

echo ""
echo "✅ Demo automation completed!"
echo "📹 Check the 'captures' directory for video files"
echo "📊 Check the 'out' directory for validation reports"
