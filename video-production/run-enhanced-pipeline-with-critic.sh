#!/bin/bash

echo "🎬 Enhanced Production Pipeline with Critic Bot Integration"
echo "=========================================================="
echo ""
echo "🤖 This pipeline will:"
echo "   - Generate captures with critic bot review"
echo "   - Generate narration with critic bot review"
echo "   - Assemble final video with critic bot review"
echo "   - Regenerate content until quality standards are met"
echo "   - Quality threshold: 85/100"
echo "   - Max iterations: 5 per step"
echo ""

# Clear old content
echo "🧹 Clearing old content..."
rm -rf output/* temp/* 2>/dev/null || true

# Run smoke test to validate pipeline readiness
echo "🔍 Running smoke test to validate pipeline readiness..."
if npm run enhanced-smoke-test > /dev/null 2>&1; then
    echo "✅ Smoke test passed - pipeline is ready"
else
    echo "❌ Smoke test failed - pipeline not ready"
    exit 1
fi

echo ""
echo "🚀 Running enhanced production pipeline with critic bot integration..."
echo "   - Global timeout: 30 minutes"
echo "   - Step timeout: 5 minutes per step"
echo "   - Automatic regeneration: 5 attempts per step"
echo "   - Critic bot review: Every beat and final product"
echo "   - Progress monitoring enabled"
echo "   - Comprehensive validation at each step"
echo ""

# Run the enhanced production pipeline with critic bot
if npm run enhanced-pipeline-with-critic; then
    echo ""
    echo "✅ Enhanced production pipeline with critic bot completed!"
    echo ""
    echo "Generated content:"
    echo "  - output/ - Final video and audio files (critic approved)"
    echo "  - captures/ - Screenshots and video captures (critic approved)"
    echo "  - audio/ - Narration audio files (critic approved)"
    echo "  - subs/ - Subtitle files (critic approved)"
    echo ""
    echo "For more information, see:"
    echo "  - scripts/enhanced-production-pipeline-with-critic-bot.ts - Implementation"
    echo "  - scripts/enhanced-critic-bot.ts - Critic bot implementation"
    echo "  - TIMEOUT_IMPROVEMENTS_SUCCESS_SUMMARY.md - Previous improvements"
else
    echo ""
    echo "❌ Enhanced production pipeline with critic bot failed!"
    echo "Check the logs above for details."
    exit 1
fi
