#!/usr/bin/env python3
"""
Validate Refined Timeline Video
Comprehensive validation of the 5-minute refined timeline video
"""

import os
import json
import subprocess
import yaml
from pathlib import Path

def validate_video_file(video_path):
    """Validate the video file properties"""
    print("🎬 Video File Validation")
    print("=======================")
    
    if not video_path.exists():
        print(f"❌ Video file not found: {video_path}")
        return False
    
    # Get video info
    cmd = [
        'ffprobe', '-v', 'quiet',
        '-print_format', 'json',
        '-show_format', '-show_streams',
        str(video_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        info = json.loads(result.stdout)
        
        # Extract key properties
        format_info = info['format']
        video_stream = next((s for s in info['streams'] if s['codec_type'] == 'video'), None)
        audio_stream = next((s for s in info['streams'] if s['codec_type'] == 'audio'), None)
        
        print(f"✅ File exists: {video_path.name}")
        print(f"📁 Size: {int(format_info['size']) / (1024*1024):.1f}MB")
        print(f"⏱️  Duration: {float(format_info['duration']):.1f}s ({int(float(format_info['duration'])//60)}:{int(float(format_info['duration'])%60):02d})")
        print(f"🎥 Resolution: {video_stream['width']}x{video_stream['height']}")
        print(f"🎵 Audio: {audio_stream['codec_name'].upper()} ({audio_stream['channels']} channel)")
        print(f"📊 Bitrate: {int(format_info['bit_rate']) / 1000:.0f}kbps")
        
        # Validate quality metrics
        issues = []
        
        if float(format_info['duration']) < 120:  # Less than 2 minutes
            issues.append("Duration is shorter than expected (should be ~5 minutes)")
        
        if video_stream['width'] < 1920 or video_stream['height'] < 1080:
            issues.append("Resolution is lower than Full HD (1920x1080)")
        
        if audio_stream['channels'] != 1:
            issues.append("Audio should be mono for narration")
        
        if issues:
            print("\n⚠️  Quality Issues:")
            for issue in issues:
                print(f"   • {issue}")
        else:
            print("\n✅ All quality metrics pass")
        
        return True, issues
        
    except Exception as e:
        print(f"❌ Error validating video: {e}")
        return False, [str(e)]

def validate_audio_files():
    """Validate TTS audio files"""
    print("\n🎤 Audio Files Validation")
    print("=========================")
    
    audio_dir = Path("audio/vo")
    if not audio_dir.exists():
        print(f"❌ Audio directory not found: {audio_dir}")
        return False
    
    # Expected audio files for refined timeline (actual generated filenames)
    expected_files = [
        "shot-01-introduction-introduction.wav",
        "shot-02-user_roles-user-roles.wav", 
        "shot-03-technical_architecture-technical-architecture.wav",
        "shot-04-commander_dashboard-commander-dashboard.wav",
        "shot-05-live_map_hazards-live-map-hazards.wav",
        "shot-06-route_optimization-route-optimization.wav",
        "shot-07-ai_decision_support-ai-decision-support.wav",
        "shot-08-technical_deep_dive-technical-deep-dive.wav",
        "shot-09-impact_value-impact-value.wav",
        "shot-10-conclusion-conclusion.wav"
    ]
    
    found_files = []
    missing_files = []
    total_duration = 0
    
    for expected_file in expected_files:
        file_path = audio_dir / expected_file
        if file_path.exists():
            found_files.append(expected_file)
            
            # Get audio duration
            cmd = [
                'ffprobe', '-v', 'quiet',
                '-show_entries', 'format=duration',
                '-of', 'csv=p=0',
                str(file_path)
            ]
            
            try:
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                duration = float(result.stdout.strip())
                total_duration += duration
                print(f"✅ {expected_file}: {duration:.1f}s")
            except:
                print(f"⚠️  {expected_file}: duration unknown")
        else:
            missing_files.append(expected_file)
            print(f"❌ {expected_file}: missing")
    
    print(f"\n📊 Audio Summary:")
    print(f"   • Found: {len(found_files)}/{len(expected_files)} files")
    print(f"   • Missing: {len(missing_files)} files")
    print(f"   • Total duration: {total_duration:.1f}s ({int(total_duration//60)}:{int(total_duration%60):02d})")
    
    if missing_files:
        print(f"\n❌ Missing audio files:")
        for file in missing_files:
            print(f"   • {file}")
        return False
    
    return True

def validate_subtitles():
    """Validate subtitle file"""
    print("\n📝 Subtitles Validation")
    print("=======================")
    
    subtitle_file = Path("subs/vo.srt")
    if not subtitle_file.exists():
        print(f"❌ Subtitle file not found: {subtitle_file}")
        return False
    
    try:
        with open(subtitle_file, 'r') as f:
            content = f.read()
        
        # Basic validation
        lines = content.strip().split('\n')
        subtitle_count = len([line for line in lines if line.strip().isdigit()])
        
        print(f"✅ Subtitle file exists: {subtitle_file.name}")
        print(f"📊 Subtitle count: {subtitle_count}")
        print(f"📁 File size: {subtitle_file.stat().st_size} bytes")
        
        if subtitle_count < 5:
            print("⚠️  Warning: Few subtitle entries found")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading subtitle file: {e}")
        return False

def validate_timeline_structure():
    """Validate timeline configuration"""
    print("\n⏰ Timeline Structure Validation")
    print("===============================")
    
    timeline_file = Path("timeline-5-minute-refined.yaml")
    narration_file = Path("timeline-5-minute-refined-narration.yaml")
    
    if not timeline_file.exists():
        print(f"❌ Timeline file not found: {timeline_file}")
        return False
    
    if not narration_file.exists():
        print(f"❌ Narration file not found: {narration_file}")
        return False
    
    try:
        # Load timeline
        with open(timeline_file, 'r') as f:
            timeline = yaml.safe_load(f)
        
        # Load narration
        with open(narration_file, 'r') as f:
            narration = yaml.safe_load(f)
        
        # Validate timeline structure
        timeline_config = timeline.get('timeline', {})
        video_tracks = timeline_config.get('tracks', {}).get('video', [])
        
        print(f"✅ Timeline file: {timeline_file.name}")
        print(f"✅ Narration file: {narration_file.name}")
        print(f"📊 Video segments: {len(video_tracks)}")
        print(f"📝 Narration scenes: {len(narration.get('scenes', []))}")
        
        # Check segment alignment
        timeline_segments = {track['name'] for track in video_tracks}
        narration_scenes = {scene['id'] for scene in narration.get('scenes', [])}
        
        missing_in_narration = timeline_segments - narration_scenes
        missing_in_timeline = narration_scenes - timeline_segments
        
        if missing_in_narration:
            print(f"⚠️  Timeline segments missing from narration: {missing_in_narration}")
        
        if missing_in_timeline:
            print(f"⚠️  Narration scenes missing from timeline: {missing_in_timeline}")
        
        if not missing_in_narration and not missing_in_timeline:
            print("✅ Timeline and narration are aligned")
        
        # Check total duration
        total_duration = sum(track.get('duration', 0) for track in video_tracks)
        print(f"⏱️  Total timeline duration: {total_duration}s ({total_duration//60}:{total_duration%60:02d})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error validating timeline structure: {e}")
        return False

def main():
    """Main validation function"""
    print("🔍 Refined Timeline Video Validation")
    print("====================================")
    print("Comprehensive validation of the 5-minute refined timeline video")
    print("")
    
    # Validate video file
    video_path = Path("output/timeline-5-minute-refined-final.mp4")
    video_valid, video_issues = validate_video_file(video_path)
    
    # Validate audio files
    audio_valid = validate_audio_files()
    
    # Validate subtitles
    subtitle_valid = validate_subtitles()
    
    # Validate timeline structure
    timeline_valid = validate_timeline_structure()
    
    # Overall validation summary
    print("\n" + "="*50)
    print("📋 VALIDATION SUMMARY")
    print("="*50)
    
    all_valid = video_valid and audio_valid and subtitle_valid and timeline_valid
    
    print(f"🎬 Video File: {'✅ PASS' if video_valid else '❌ FAIL'}")
    print(f"🎤 Audio Files: {'✅ PASS' if audio_valid else '❌ FAIL'}")
    print(f"📝 Subtitles: {'✅ PASS' if subtitle_valid else '❌ FAIL'}")
    print(f"⏰ Timeline Structure: {'✅ PASS' if timeline_valid else '❌ FAIL'}")
    
    if video_issues:
        print(f"\n⚠️  Video Issues:")
        for issue in video_issues:
            print(f"   • {issue}")
    
    if all_valid:
        print(f"\n🎉 VALIDATION PASSED!")
        print(f"✅ The refined timeline video is ready for presentation")
        print(f"📁 Final video: {video_path}")
        return 0
    else:
        print(f"\n❌ VALIDATION FAILED!")
        print(f"Please address the issues above before using the video")
        return 1

if __name__ == "__main__":
    exit(main())
