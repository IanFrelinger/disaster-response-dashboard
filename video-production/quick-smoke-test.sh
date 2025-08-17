#!/bin/bash

# Quick Video Pipeline Smoke Test
# Runs essential tests for fast validation

set -e

echo "🚀 Quick Video Pipeline Smoke Test"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the video-production directory."
    exit 1
fi

# Quick dependency check
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

# Quick configuration check
echo "⚙️  Checking configuration..."
if [ ! -f "config/narration.yaml" ]; then
    echo "❌ Error: config/narration.yaml not found"
    exit 1
fi

# Quick directory check
echo "📁 Checking directories..."
required_dirs=("output" "temp" "assets" "captures" "audio" "scripts")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Error: Required directory '$dir' not found"
        exit 1
    fi
done

# Quick script check
echo "📜 Checking scripts..."
required_scripts=("scripts/run-enhanced-production.ts" "scripts/generate-enhanced-captures.ts")
for script in "${required_scripts[@]}"; do
    if [ ! -f "$script" ]; then
        echo "❌ Error: Required script '$script' not found"
        exit 1
    fi
done

# Quick write permission test
echo "✍️  Testing write permissions..."
test_file="output/quick-test.tmp"
echo "test" > "$test_file" 2>/dev/null || {
    echo "❌ Error: Cannot write to output directory"
    exit 1
}
rm "$test_file"

echo ""
echo "✅ Quick smoke test passed! Basic pipeline structure is valid."
echo ""
echo "For comprehensive testing, run:"
echo "  npm run enhanced-smoke-test"
echo "  or"
echo "  ./run-enhanced-smoke-test.sh"
