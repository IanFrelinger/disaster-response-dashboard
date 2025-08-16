#!/usr/bin/env python3
"""
Simple Timeline 3 Video Creator
Creates a video from VideoPresentation assets with TTS audio
"""

import os
import subprocess
import json
from pathlib import Path

def create_simple_timeline_3_video():
    print("🎬 Simple Timeline 3 Video Creation")
    print("===================================")
    print("Creating video from VideoPresentation assets with TTS audio")
    print("")
    
    # Paths
    video_presentation_dir = Path("VideoPresentation")
    audio_dir = Path("audio/vo")
    output_dir = Path("output")
    
    # Ensure output directory exists
    output_dir.mkdir(exist_ok=True)
    
    # Asset mapping
    asset_mapping = {
        'introduction': 'introduction_generated_new.png',
        'user_persona': 'user_persona_generated_new.png',
        'live_map_hazard': 'hazard_detection.png',
        'technical_architecture': 'api_dataflow_diagram.png',
        'commander_dashboard': 'asset_management.png',
        'ai_support': 'ai_support.png',
        'conclusion': 'conclusion_generated_new.png'
    }
    
    # Audio mapping
    audio_mapping = {
        'introduction': 'shot-01-introduction-introduction.wav',
        'problem_statement': 'shot-02-problem_statement-problem-statement.wav',
        'user_persona': 'shot-03-user_persona-user-persona.wav',
        'technical_architecture': 'shot-04-technical_architecture-technical-architecture.wav',
        'commander_dashboard': 'shot-05-commander_dashboard-commander-dashboard.wav',
        'live_map_hazard': 'shot-06-live_map_hazard-live-map--hazard-view.wav',
        'simplified_flow': 'shot-07-simplified_flow-simplified-flow.wav',
        'conclusion': 'shot-08-conclusion-conclusion.wav'
    }
    
    # Segment durations (in seconds)
    segment_durations = {
        'introduction': 10,
        'problem_statement': 15,
        'user_persona': 10,
        'technical_architecture': 15,
        'commander_dashboard': 20,
        'live_map_hazard': 20,
        'simplified_flow': 15,
        'conclusion': 22
    }
    
    # Check assets and audio
    print("📁 Checking assets and audio...")
    
    available_segments = []
    for segment_name in asset_mapping.keys():
        asset_path = video_presentation_dir / asset_mapping[segment_name]
        
        # Check if audio exists for this segment
        audio_file = audio_mapping.get(segment_name)
        if audio_file:
            audio_path = audio_dir / audio_file
        else:
            audio_path = None
        
        if asset_path.exists() and audio_path and audio_path.exists():
            available_segments.append(segment_name)
            print(f"✅ {segment_name}: asset and audio available")
        elif asset_path.exists() and not audio_path:
            print(f"⚠️  {segment_name}: asset available, no audio mapping")
        elif asset_path.exists() and audio_path and not audio_path.exists():
            print(f"⚠️  {segment_name}: asset available, audio file missing")
        else:
            print(f"⚠️  {segment_name}: missing asset or audio")
    
    if not available_segments:
        print("❌ No complete segments found")
        return
    
    print(f"📊 Found {len(available_segments)} complete segments")
    print("")
    
    # Create video segments
    print("🎬 Creating video segments...")
    
    segment_videos = []
    for segment_name in available_segments:
        print(f"📹 Creating segment: {segment_name}")
        
        asset_path = video_presentation_dir / asset_mapping[segment_name]
        audio_file = audio_mapping.get(segment_name)
        audio_path = audio_dir / audio_file if audio_file else None
        duration = segment_durations.get(segment_name, 10)
        
        # Create video from image with duration
        segment_video = output_dir / f"{segment_name}.mp4"
        
        try:
            # Create video from image with specified duration
            cmd = [
                'ffmpeg',
                '-loop', '1',
                '-i', str(asset_path),
                '-i', str(audio_path),
                '-c:v', 'libx264',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-pix_fmt', 'yuv420p',
                '-shortest',
                '-y',
                str(segment_video)
            ]
            
            subprocess.run(cmd, check=True, capture_output=True)
            segment_videos.append(segment_video)
            print(f"✅ Created: {segment_video}")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error creating {segment_name}: {e}")
            continue
    
    if not segment_videos:
        print("❌ No video segments created")
        return
    
    print(f"✅ Created {len(segment_videos)} video segments")
    print("")
    
    # Combine video segments
    print("🎬 Combining video segments...")
    
    # Create input list for ffmpeg
    input_list_path = output_dir / "input_list.txt"
    with open(input_list_path, 'w') as f:
        for video in segment_videos:
            # Use relative path from the input list location
            relative_path = video.name
            f.write(f"file '{relative_path}'\n")
    
    # Combine videos
    final_video = output_dir / "timeline-3-simple-final.mp4"
    
    try:
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(input_list_path),
            '-c', 'copy',
            '-y',
            str(final_video)
        ]
        
        subprocess.run(cmd, check=True)
        print(f"✅ Final video created: {final_video}")
        
        # Clean up input list
        input_list_path.unlink()
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error combining videos: {e}")
        return
    
    # Get video info
    try:
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            str(final_video)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        video_info = json.loads(result.stdout)
        
        duration = float(video_info['format']['duration'])
        print(f"📊 Video duration: {duration:.2f} seconds")
        
    except subprocess.CalledProcessError:
        print("⚠️  Could not get video info")
    
    print("")
    print("✅ Simple Timeline 3 video creation completed!")
    print(f"🎬 Final video: {final_video}")
    print("")
    print("📁 Files created:")
    for video in segment_videos:
        print(f"   - {video}")
    print(f"   - {final_video}")
    print("")
    print("🎯 The video includes:")
    print("   - VideoPresentation assets as video frames")
    print("   - ElevenLabs TTS audio synchronized")
    print("   - Professional presentation timing")
    print("")

if __name__ == "__main__":
    create_simple_timeline_3_video()
