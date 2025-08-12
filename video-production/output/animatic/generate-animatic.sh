#!/bin/bash

# Disaster Response Dashboard - Animatic Generator

set -e

echo "🎬 Starting animatic generation..."

TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

echo "🎥 Generating individual scene videos..."

echo "📹 Processing Scene 01 (0:00-0:15)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-01-problem-fragmented-response.wav" ]; then
    echo "  Using voice recording: scene-01-problem-fragmented-response.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/01-main-dashboard-overview.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-01-problem-fragmented-response.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-01.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/01-main-dashboard-overview.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-01.mp4"
fi

echo "📹 Processing Scene 02 (0:15-0:30)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-02-problem-time-costs-lives.wav" ]; then
    echo "  Using voice recording: scene-02-problem-time-costs-lives.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/02-dashboard-with-metrics.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-02-problem-time-costs-lives.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-02.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/02-dashboard-with-metrics.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-02.mp4"
fi

echo "📹 Processing Scene 03 (0:30-0:45)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-03-solution-unified-platform.wav" ]; then
    echo "  Using voice recording: scene-03-solution-unified-platform.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/03-navigation-menu-open.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-03-solution-unified-platform.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-03.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/03-navigation-menu-open.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-03.mp4"
fi

echo "📹 Processing Scene 04 (0:45-1:00)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-04-real-time-threat-assessment.wav" ]; then
    echo "  Using voice recording: scene-04-real-time-threat-assessment.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/04-multi-hazard-map.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-04-real-time-threat-assessment.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-04.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/04-multi-hazard-map.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-04.mp4"
fi

echo "📹 Processing Scene 05 (1:00-1:15)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-05-one-click-evacuation-planning.wav" ]; then
    echo "  Using voice recording: scene-05-one-click-evacuation-planning.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/06-map-evacuation-routes.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-05-one-click-evacuation-planning.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-05.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/06-map-evacuation-routes.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-05.mp4"
fi

echo "📹 Processing Scene 06 (1:15-1:30)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-06-dynamic-route-updates.wav" ]; then
    echo "  Using voice recording: scene-06-dynamic-route-updates.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/05-map-hazard-layers-active.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-06-dynamic-route-updates.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-06.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/05-map-hazard-layers-active.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-06.mp4"
fi

echo "📹 Processing Scene 07 (1:30-1:45)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-07-3d-terrain-intelligence.wav" ]; then
    echo "  Using voice recording: scene-07-3d-terrain-intelligence.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/07-3d-terrain-view.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-07-3d-terrain-intelligence.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-07.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/07-3d-terrain-view.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-07.mp4"
fi

echo "📹 Processing Scene 08 (1:45-2:00)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-08-mass-evacuation-management.wav" ]; then
    echo "  Using voice recording: scene-08-mass-evacuation-management.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/08-evacuation-dashboard-main.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-08-mass-evacuation-management.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-08.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/08-evacuation-dashboard-main.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-08.mp4"
fi

echo "📹 Processing Scene 09 (2:00-2:15)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-09-ai-powered-decisions.wav" ]; then
    echo "  Using voice recording: scene-09-ai-powered-decisions.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/09-aip-decision-support.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-09-ai-powered-decisions.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-09.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/09-aip-decision-support.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-09.mp4"
fi

echo "📹 Processing Scene 10 (2:15-2:30)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-10-weather-integrated-planning.wav" ]; then
    echo "  Using voice recording: scene-10-weather-integrated-planning.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/10-weather-panel.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-10-weather-integrated-planning.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-10.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/10-weather-panel.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-10.mp4"
fi

echo "📹 Processing Scene 11 (2:30-2:45)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-11-commanders-strategic-view.wav" ]; then
    echo "  Using voice recording: scene-11-commanders-strategic-view.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/11-commander-view.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-11-commanders-strategic-view.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-11.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/11-commander-view.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-11.mp4"
fi

echo "📹 Processing Scene 12 (2:45-3:00)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-12-first-responder-tactical-view.wav" ]; then
    echo "  Using voice recording: scene-12-first-responder-tactical-view.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/12-first-responder-view.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-12-first-responder-tactical-view.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-12.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/12-first-responder-view.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-12.mp4"
fi

echo "📹 Processing Scene 13 (3:00-3:15)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-13-public-communication.wav" ]; then
    echo "  Using voice recording: scene-13-public-communication.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/13-public-information-view.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-13-public-communication.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-13.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/13-public-information-view.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-13.mp4"
fi

echo "📹 Processing Scene 14 (3:15-3:30)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-14-measurable-impact.wav" ]; then
    echo "  Using voice recording: scene-14-measurable-impact.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/08-role-based-routing.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-14-measurable-impact.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-14.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/08-role-based-routing.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-14.mp4"
fi

echo "📹 Processing Scene 15 (3:30-3:45)..."
# Check if voice recording exists
if [ -f "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-15-call-to-action.wav" ]; then
    echo "  Using voice recording: scene-15-call-to-action.wav"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/01-main-dashboard-overview.png" -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/video-production/output/voice-recordings/scene-15-call-to-action.wav" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -t 15 -y "$TEMP_DIR/scene-15.mp4"
else
    echo "  No voice recording found, using silent video"
    ffmpeg -loop 1 -i "/Users/ianfrelinger/PycharmProjects/disaster-response-dashboard/frontend/screenshots/01-main-dashboard-overview.png" -c:v libx264 -preset fast -crf 23 -t 15 -y "$TEMP_DIR/scene-15.mp4"
fi

echo "📋 Creating file list for concatenation..."
cat > "$TEMP_DIR/filelist.txt" << EOF
file 'scene-01.mp4'
file 'scene-02.mp4'
file 'scene-03.mp4'
file 'scene-04.mp4'
file 'scene-05.mp4'
file 'scene-06.mp4'
file 'scene-07.mp4'
file 'scene-08.mp4'
file 'scene-09.mp4'
file 'scene-10.mp4'
file 'scene-11.mp4'
file 'scene-12.mp4'
file 'scene-13.mp4'
file 'scene-14.mp4'
file 'scene-15.mp4'
EOF

echo "🔗 Concatenating all scenes..."
ffmpeg -f concat -safe 0 -i "$TEMP_DIR/filelist.txt" -c copy -y "$TEMP_DIR/animatic-raw.mp4"

echo "✨ Adding fade transitions..."
ffmpeg -i "$TEMP_DIR/animatic-raw.mp4" -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=225:d=0.5" -c:a copy -y "$TEMP_DIR/animatic-with-fades.mp4"

echo "🎯 Final processing..."
ffmpeg -i "$TEMP_DIR/animatic-with-fades.mp4" -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 192k -movflags +faststart -y "disaster-response-animatic.mp4"

echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "✅ Animatic generation complete!"
echo "📁 Output: disaster-response-animatic.mp4"
echo "⏱️  Duration: 3:45 minutes"
echo "📊 Resolution: 1920x1080"
