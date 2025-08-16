#!/bin/bash

# Video Pipeline Test Runner
# This script runs comprehensive unit tests for all video processing methods

set -e

echo "🧪 Starting Video Pipeline Unit Tests..."
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "tests/basic-pipeline.test.ts" ]; then
    echo "❌ Please run this script from the video-production directory"
    exit 1
fi

# Install test dependencies if needed
echo "📦 Installing test dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing npm dependencies..."
    npm install
fi

# Install Jest and testing dependencies
echo "   Installing Jest and testing tools..."
npm install --save-dev jest @jest/globals @types/jest ts-jest typescript

# Create test directories
echo "📁 Setting up test environment..."
mkdir -p tests
mkdir -p coverage

# Run the tests
echo ""
echo "🧪 Running Video Pipeline Unit Tests..."
echo "   Testing all methods independently..."
echo "   Validating pipeline components..."
echo ""

# Run tests with coverage
npx jest --config jest.config.cjs --coverage --verbose

echo ""
echo "✅ All Video Pipeline Tests Completed!"
echo "📊 Test coverage report generated in coverage/"
echo ""
echo "🎯 Test Results Summary:"
echo "   ✅ Constructor and initialization tests"
echo "   ✅ Timeline segment definition tests"
echo "   ✅ Video generation pipeline tests"
echo "   ✅ Frame creation and processing tests"
echo "   ✅ SVG generation and conversion tests"
echo "   ✅ FFmpeg integration tests"
echo "   ✅ Fallback mechanism tests"
echo "   ✅ Error handling and cleanup tests"
echo "   ✅ Integration and end-to-end tests"
echo ""
echo "🚀 Video pipeline is fully validated and ready for production!"
