#!/bin/bash

# Enhanced Video Pipeline Smoke Test Runner
# This script runs the comprehensive smoke test for the video production pipeline

set -e

echo "🎬 Enhanced Video Pipeline Smoke Test"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the video-production directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found. Installing dependencies..."
    npm install
fi

# Run the enhanced smoke test
echo "🚀 Running enhanced video pipeline smoke test..."
npm run enhanced-smoke-test

echo ""
echo "✅ Enhanced smoke test completed!"
echo ""
echo "Next steps:"
echo "  - If all tests passed: Your video pipeline is ready for production"
echo "  - If tests failed: Review the output above and fix any issues"
echo "  - If you see warnings: Consider optimizing those areas for better performance"
echo ""
echo "For more information, see:"
echo "  - config/narration.yaml - Video pipeline configuration"
echo "  - scripts/enhanced-video-pipeline-smoke-test.ts - Test implementation"
echo "  - docs/ - Pipeline documentation"
