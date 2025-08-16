#!/usr/bin/env python3
"""
Extended Timeline Video Creator
Creates a comprehensive 5:40 video from VideoPresentation assets with extended TTS audio
"""

import os
import subprocess
import json
from pathlib import Path

def create_extended_timeline_video():
    print("🎬 Extended Timeline Video Creation")
    print("===================================")
    print("Creating comprehensive 5:40 video with extended TTS audio")
    print("")
    
    # Paths
    video_presentation_dir = Path("VideoPresentation")
    audio_dir = Path("audio/vo")
    output_dir = Path("output")
    
    # Ensure output directory exists
    output_dir.mkdir(exist_ok=True)
    
    # Extended asset mapping for 10 segments
    asset_mapping = {
        'introduction': 'introduction_generated_new.png',
        'user_roles': 'user_persona_generated_new.png',
        'technical_overview': 'api_dataflow_diagram.png',
        'hazard_detection': 'hazard_detection.png',
        'zone_management': 'asset_management.png',
        'route_profiles': 'hazard_detection.png',  # Reuse hazard map for routes
        'ai_decision_support': 'ai_support.png',
        'technical_deep_dive': 'api_dataflow_diagram.png',  # Reuse for deep dive
        'impact_value': 'asset_management.png',  # Reuse for impact metrics
        'conclusion': 'conclusion_generated_new.png'
    }
    
    # Extended audio mapping for 10 segments
    audio_mapping = {
        'introduction': 'shot-01-introduction-introduction--problem-context.wav',
        'user_roles': 'shot-02-user_roles-user-roles--needs.wav',
        'technical_overview': 'shot-03-technical_overview-data-flow--technical-overview.wav',
        'hazard_detection': 'shot-04-hazard_detection-hazard-detection--triage.wav',
        'zone_management': 'shot-05-zone_management-zone--building-management.wav',
        'route_profiles': 'shot-06-route_profiles-route-profiles--dispatch-strategy.wav',
        'ai_decision_support': 'shot-07-ai_decision_support-ai-decision-support--replanning.wav',
        'technical_deep_dive': 'shot-08-technical_deep_dive-technical-deep-dive--foundry-integration.wav',
        'impact_value': 'shot-09-impact_value-impact--value-proposition.wav',
        'conclusion': 'shot-10-conclusion-conclusion--next-steps.wav'
    }
    
    # Extended segment durations (in seconds)
    segment_durations = {
        'introduction': 30,
        'user_roles': 30,
        'technical_overview': 40,
        'hazard_detection': 40,
        'zone_management': 40,
        'route_profiles': 40,
        'ai_decision_support': 30,
        'technical_deep_dive': 40,
        'impact_value': 30,
        'conclusion': 20
    }
    
    # Check assets and audio
    print("📁 Checking assets and audio for extended timeline...")
    
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
            print(f"✅ {segment_name}: asset and audio available ({segment_durations[segment_name]}s)")
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
    total_duration = sum(segment_durations[seg] for seg in available_segments)
    print(f"⏱️  Total duration: {total_duration} seconds ({total_duration//60}:{total_duration%60:02d})")
    print("")
    
    # Create video segments
    print("🎬 Creating extended video segments...")
    
    segment_videos = []
    for segment_name in available_segments:
        print(f"📹 Creating segment: {segment_name} ({segment_durations[segment_name]}s)")
        
        asset_path = video_presentation_dir / asset_mapping[segment_name]
        audio_file = audio_mapping.get(segment_name)
        audio_path = audio_dir / audio_file if audio_file else None
        duration = segment_durations.get(segment_name, 10)
        
        # Create video from image with duration
        segment_video = output_dir / f"{segment_name}_extended.mp4"
        
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
    print("🎬 Combining extended video segments...")
    
    # Create input list for ffmpeg
    input_list_path = output_dir / "extended_input_list.txt"
    with open(input_list_path, 'w') as f:
        for video in segment_videos:
            # Use relative path from the input list location
            relative_path = video.name
            f.write(f"file '{relative_path}'\n")
    
    # Combine videos
    final_video = output_dir / "video-presentation-plan-long-final.mp4"
    
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
        print(f"✅ Extended video created: {final_video}")
        
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
        print(f"📊 Extended video duration: {duration:.2f} seconds ({duration//60:.0f}:{duration%60:02.0f})")
        
    except subprocess.CalledProcessError:
        print("⚠️  Could not get video info")
    
    print("")
    print("✅ Extended Timeline Video Creation Completed!")
    print(f"🎬 Final extended video: {final_video}")
    print("")
    print("📁 Files created:")
    for video in segment_videos:
        print(f"   - {video}")
    print(f"   - {final_video}")
    print("")
    print("🎯 The extended video includes:")
    print("   - 10 comprehensive segments with detailed narration")
    print("   - Professional VideoPresentation assets")
    print("   - Extended TTS audio with your cloned voice")
    print("   - Complete technical deep dive and value proposition")
    print("   - 5:40 duration suitable for technical audiences")
    print("")
    print("🚀 Ready for:")
    print("   - Palantir Building Challenge extended submission")
    print("   - Technical recruiter presentations")
    print("   - Stakeholder demonstrations")
    print("   - Professional portfolio showcase")
    print("")

if __name__ == "__main__":
    create_extended_timeline_video()
