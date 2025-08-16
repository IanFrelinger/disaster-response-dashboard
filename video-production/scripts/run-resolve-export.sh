#!/bin/bash

# Resolve Export Pipeline Runner
# Option A - Resolve Finishing

echo "🎬 Resolve Export Pipeline - Option A"
echo "📹 Exporting assets for Resolve finishing..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from video-production directory"
    exit 1
fi

# Check if required files exist
if [ ! -f "record.config.json" ] || [ ! -f "tts-cue-sheet.json" ]; then
    echo "❌ Error: Missing required configuration files"
    echo "   - record.config.json"
    echo "   - tts-cue-sheet.json"
    exit 1
fi

# Check if frontend is running
echo "🌐 Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Error: Frontend not running on http://localhost:3000"
    echo "   Please start the frontend first: npm run dev"
    exit 1
fi

echo "✅ Frontend is running"

# Run the Resolve export pipeline
echo "🚀 Starting Resolve export pipeline..."
npx tsx scripts/resolve-export-pipeline.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Resolve export pipeline completed successfully!"
    echo ""
    echo "📁 Exported assets are in: resolve-export/"
    echo "   ├── video/     # Rough cut MP4"
    echo "   ├── audio/     # TTS WAV files"
    echo "   ├── graphics/  # PNG/SVG assets"
    echo "   └── project/   # Project files & import guide"
    echo ""
    echo "🎬 Next steps for Resolve finishing:"
    echo "   1. Import assets into DaVinci Resolve"
    echo "   2. Follow the import guide in resolve-export/project/IMPORT_GUIDE.md"
    echo "   3. Apply audio, graphics, and color passes"
    echo "   4. Export final H.264 at 16-24 Mbps"
    echo ""
else
    echo "❌ Resolve export pipeline failed"
    exit 1
fi

