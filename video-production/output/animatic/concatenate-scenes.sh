#!/bin/bash

# Concatenate Scene Videos

echo "🔗 Concatenating scene videos..."

cat > filelist.txt << EOF
file 'scene-videos/scene-01.mp4'
file 'scene-videos/scene-02.mp4'
file 'scene-videos/scene-03.mp4'
file 'scene-videos/scene-04.mp4'
file 'scene-videos/scene-05.mp4'
file 'scene-videos/scene-06.mp4'
file 'scene-videos/scene-07.mp4'
file 'scene-videos/scene-08.mp4'
file 'scene-videos/scene-09.mp4'
file 'scene-videos/scene-10.mp4'
file 'scene-videos/scene-11.mp4'
file 'scene-videos/scene-12.mp4'
file 'scene-videos/scene-13.mp4'
file 'scene-videos/scene-14.mp4'
file 'scene-videos/scene-15.mp4'
EOF

ffmpeg -f concat -safe 0 -i filelist.txt -c copy -y "disaster-response-animatic.mp4"

echo "✅ Animatic created: disaster-response-animatic.mp4"
echo "⏱️  Duration: 3:45 minutes"
