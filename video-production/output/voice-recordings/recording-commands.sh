#!/bin/bash

# Disaster Response Dashboard - Voice Recording Commands

echo "🎤 Starting voice recording session..."

echo "📝 Recording Scene 01 (0:00-0:15)..."
echo "Voice-over: When disasters strike, emergency managers face a n..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-01-problem-fragmented-response.wav"
echo "✅ Scene 01 recorded: scene-01-problem-fragmented-response.wav"

echo "📝 Recording Scene 02 (0:15-0:30)..."
echo "Voice-over: Every minute of delay costs lives. Traditional sys..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-02-problem-time-costs-lives.wav"
echo "✅ Scene 02 recorded: scene-02-problem-time-costs-lives.wav"

echo "📝 Recording Scene 03 (0:30-0:45)..."
echo "Voice-over: Our unified dashboard gives emergency commanders, ..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-03-solution-unified-platform.wav"
echo "✅ Scene 03 recorded: scene-03-solution-unified-platform.wav"

echo "📝 Recording Scene 04 (0:45-1:00)..."
echo "Voice-over: See all threats in real-time. Our multi-hazard map..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-04-real-time-threat-assessment.wav"
echo "✅ Scene 04 recorded: scene-04-real-time-threat-assessment.wav"

echo "📝 Recording Scene 05 (1:00-1:15)..."
echo "Voice-over: Generate safe evacuation routes with one click. Ou..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-05-one-click-evacuation-planning.wav"
echo "✅ Scene 05 recorded: scene-05-one-click-evacuation-planning.wav"

echo "📝 Recording Scene 06 (1:15-1:30)..."
echo "Voice-over: Routes update automatically as conditions change. ..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-06-dynamic-route-updates.wav"
echo "✅ Scene 06 recorded: scene-06-dynamic-route-updates.wav"

echo "📝 Recording Scene 07 (1:30-1:45)..."
echo "Voice-over: 3D terrain visualization reveals critical elevatio..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-07-3d-terrain-intelligence.wav"
echo "✅ Scene 07 recorded: scene-07-3d-terrain-intelligence.wav"

echo "📝 Recording Scene 08 (1:45-2:00)..."
echo "Voice-over: Manage mass evacuations efficiently. Our dashboard..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-08-mass-evacuation-management.wav"
echo "✅ Scene 08 recorded: scene-08-mass-evacuation-management.wav"

echo "📝 Recording Scene 09 (2:00-2:15)..."
echo "Voice-over: AI analyzes patterns and provides real-time recomm..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-09-ai-powered-decisions.wav"
echo "✅ Scene 09 recorded: scene-09-ai-powered-decisions.wav"

echo "📝 Recording Scene 10 (2:15-2:30)..."
echo "Voice-over: Real-time weather data from NOAA predicts how cond..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-10-weather-integrated-planning.wav"
echo "✅ Scene 10 recorded: scene-10-weather-integrated-planning.wav"

echo "📝 Recording Scene 11 (2:30-2:45)..."
echo "Voice-over: Commanders get strategic overviews with high-level..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-11-commanders-strategic-view.wav"
echo "✅ Scene 11 recorded: scene-11-commanders-strategic-view.wav"

echo "📝 Recording Scene 12 (2:45-3:00)..."
echo "Voice-over: First responders see tactical details for immediat..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-12-first-responder-tactical-view.wav"
echo "✅ Scene 12 recorded: scene-12-first-responder-tactical-view.wav"

echo "📝 Recording Scene 13 (3:00-3:15)..."
echo "Voice-over: Keep citizens informed with real-time updates. Cle..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-13-public-communication.wav"
echo "✅ Scene 13 recorded: scene-13-public-communication.wav"

echo "📝 Recording Scene 14 (3:15-3:30)..."
echo "Voice-over: Our system reduces response time by 80%, improves ..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-14-measurable-impact.wav"
echo "✅ Scene 14 recorded: scene-14-measurable-impact.wav"

echo "📝 Recording Scene 15 (3:30-3:45)..."
echo "Voice-over: Transform your emergency response today. When minu..."
echo "Press Enter when ready to record..."
read
ffmpeg -f avfoundation -i ":0" -t 20 -ar 44100 -ac 2 "scene-15-call-to-action.wav"
echo "✅ Scene 15 recorded: scene-15-call-to-action.wav"

echo "🎉 All scenes recorded successfully!"
echo "📁 Check the output directory for all audio files."
