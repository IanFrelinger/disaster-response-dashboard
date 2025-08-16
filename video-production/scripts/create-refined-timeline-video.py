#!/usr/bin/env python3
"""
Create Refined Timeline Video
Generates the final 5-minute video from the refined timeline using existing assets and TTS audio
"""

import os
import subprocess
import json
import yaml
from pathlib import Path

def create_refined_timeline_video():
    """Create the refined timeline video"""
    
    print("🎬 Creating Refined Timeline Video")
    print("==================================")
    print("Generating 5-minute video with refined narrative and TTS audio")
    print("")
    
    # Paths
    timeline_file = "../timeline-5-minute-refined.yaml"
    audio_dir = Path("../audio/vo")
    output_dir = Path("../output")
    video_presentation_dir = Path("../VideoPresentation")
    
    # Ensure output directory exists
    output_dir.mkdir(exist_ok=True)
    
    # Load timeline configuration
    with open(timeline_file, 'r') as f:
        timeline_config = yaml.safe_load(f)
    
    # Asset mapping for refined timeline
    asset_mapping = {
        'introduction': 'introduction_generated_new.png',
        'user_roles': 'user_persona_generated_new.png', 
        'technical_architecture': 'api_dataflow_diagram.png',
        'commander_dashboard': 'asset_management.png',
        'live_map_hazards': 'hazard_detection.png',
        'route_optimization': 'hazard_detection.png',  # Reuse for routes
        'ai_decision_support': 'ai_support.png',
        'technical_deep_dive': 'api_dataflow_diagram.png',  # Reuse for deep dive
        'impact_value': 'asset_management.png',  # Reuse for impact
        'conclusion': 'conclusion_generated_new.png'
    }
    
    # Audio mapping for refined timeline (actual generated filenames)
    audio_mapping = {
        'introduction': 'shot-01-introduction-introduction.wav',
        'user_roles': 'shot-02-user_roles-user-roles.wav',
        'technical_architecture': 'shot-03-technical_architecture-technical-architecture.wav',
        'commander_dashboard': 'shot-04-commander_dashboard-commander-dashboard.wav',
        'live_map_hazards': 'shot-05-live_map_hazards-live-map-hazards.wav',
        'route_optimization': 'shot-06-route_optimization-route-optimization.wav',
        'ai_decision_support': 'shot-07-ai_decision_support-ai-decision-support.wav',
        'technical_deep_dive': 'shot-08-technical_deep_dive-technical-deep-dive.wav',
        'impact_value': 'shot-09-impact_value-impact-value.wav',
        'conclusion': 'shot-10-conclusion-conclusion.wav'
    }
    
    # Get segment durations from timeline
    segment_durations = {}
    for track in timeline_config['timeline']['tracks']['video']:
        segment_durations[track['name']] = track['duration']
    
    # Check assets and audio
    print("📁 Checking assets and audio for refined timeline...")
    
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
            duration = segment_durations.get(segment_name, 30)
            print(f"✅ {segment_name}: asset and audio available ({duration}s)")
        elif asset_path.exists() and not audio_path:
            print(f"⚠️  {segment_name}: asset available, no audio mapping")
        elif asset_path.exists() and audio_path and not audio_path.exists():
            print(f"⚠️  {segment_name}: asset available, audio file missing")
        else:
            print(f"⚠️  {segment_name}: missing asset or audio")
    
    if not available_segments:
        print("❌ No complete segments found")
        return False
    
    print(f"📊 Found {len(available_segments)} complete segments")
    total_duration = sum(segment_durations.get(seg, 30) for seg in available_segments)
    print(f"⏱️  Total duration: {total_duration} seconds ({total_duration//60}:{total_duration%60:02d})")
    print("")
    
    # Create video segments
    print("🎥 Creating video segments...")
    segment_files = []
    
    for segment_name in available_segments:
        asset_path = video_presentation_dir / asset_mapping[segment_name]
        audio_path = audio_dir / audio_mapping[segment_name]
        duration = segment_durations.get(segment_name, 30)
        
        output_segment = output_dir / f"{segment_name}_refined.mp4"
        
        print(f"🎬 Creating {segment_name} ({duration}s)...")
        
        # Create video from image with audio
        cmd = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-i', str(asset_path),
            '-i', str(audio_path),
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            '-t', str(duration),
            str(output_segment)
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            segment_files.append(output_segment)
            print(f"✅ Created {output_segment.name}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create {segment_name}: {e}")
            print(f"   stderr: {e.stderr}")
            return False
    
    # Create file list for concatenation
    filelist_path = output_dir / "refined_filelist.txt"
    with open(filelist_path, 'w') as f:
        for segment_file in segment_files:
            f.write(f"file '{segment_file.absolute()}'\n")
    
    # Concatenate all segments
    print("\n🔗 Concatenating video segments...")
    final_video = output_dir / "timeline-5-minute-refined-final.mp4"
    
    concat_cmd = [
        'ffmpeg', '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(filelist_path),
        '-c', 'copy',
        str(final_video)
    ]
    
    try:
        result = subprocess.run(concat_cmd, capture_output=True, text=True, check=True)
        print(f"✅ Created final video: {final_video.name}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to concatenate video: {e}")
        print(f"   stderr: {e.stderr}")
        return False
    
    # Get final video info
    try:
        info_cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            str(final_video)
        ]
        
        result = subprocess.run(info_cmd, capture_output=True, text=True, check=True)
        video_info = json.loads(result.stdout)
        
        duration = float(video_info['format']['duration'])
        size_mb = int(video_info['format']['size']) / (1024 * 1024)
        
        print(f"\n📊 Final Video Information:")
        print(f"   • File: {final_video.name}")
        print(f"   • Duration: {duration:.1f}s ({duration//60}:{duration%60:02d})")
        print(f"   • Size: {size_mb:.1f}MB")
        print(f"   • Segments: {len(segment_files)}")
        
    except Exception as e:
        print(f"⚠️  Could not get video info: {e}")
    
    # Clean up temporary files
    print("\n🧹 Cleaning up temporary files...")
    for segment_file in segment_files:
        try:
            segment_file.unlink()
            print(f"🗑️  Removed {segment_file.name}")
        except Exception as e:
            print(f"⚠️  Could not remove {segment_file.name}: {e}")
    
    try:
        filelist_path.unlink()
        print("🗑️  Removed filelist.txt")
    except Exception as e:
        print(f"⚠️  Could not remove filelist.txt: {e}")
    
    print(f"\n🎉 Refined timeline video creation complete!")
    print(f"📁 Final video: {final_video}")
    return True

def main():
    """Main function"""
    success = create_refined_timeline_video()
    
    if success:
        print("\n🎯 Timeline setup complete!")
        print("   • TTS audio generated")
        print("   • Video segments created")
        print("   • Final video assembled")
        print("   • Ready for presentation")
    else:
        print("\n❌ Timeline setup failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
