#!/usr/bin/env python3
"""
Review Artifacts Generator for Editor-in-the-Loop System
Generates frames, scene maps, and transcripts for GPT-5 analysis
"""

import json
import sys
import os
import subprocess
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Handle optional yaml import
try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    print("⚠️  PyYAML not available, using fallback YAML parsing")

class ReviewArtifactsGenerator:
    def __init__(self, video_path: str, timeline_path: str, tts_path: str, output_dir: str):
        self.video_path = video_path
        self.timeline_path = timeline_path
        self.tts_path = tts_path
        self.output_dir = Path(output_dir)
        self.frames_dir = self.output_dir / "frames"
        self.artifacts_dir = self.output_dir / "artifacts"
        
        # Ensure directories exist
        self.frames_dir.mkdir(parents=True, exist_ok=True)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_all_artifacts(self) -> Dict[str, Any]:
        """Generate all review artifacts"""
        print("🎬 Generating Review Artifacts for GPT-5 Analysis")
        print("=" * 60)
        
        artifacts = {}
        
        try:
            # 1. Generate frames every 10 seconds
            print("\n📸 Step 1: Generating video frames...")
            frames_info = self.generate_frames()
            artifacts['frames'] = frames_info
            
            # 2. Build scene map
            print("\n🗺️  Step 2: Building scene map...")
            scene_map = self.build_scene_map()
            artifacts['scene_map'] = scene_map
            
            # 3. Generate transcript
            print("\n📝 Step 3: Generating transcript...")
            transcript = self.generate_transcript()
            artifacts['transcript'] = transcript
            
            # 4. Generate metadata
            print("\n📊 Step 4: Generating metadata...")
            metadata = self.generate_metadata()
            artifacts['metadata'] = metadata
            
            # 5. Save artifacts summary
            self.save_artifacts_summary(artifacts)
            
            print("\n✅ All review artifacts generated successfully!")
            print(f"📁 Output directory: {self.output_dir}")
            print(f"🖼️  Frames generated: {len(frames_info.get('frames', []))}")
            print(f"🎬 Scene map beats: {len(scene_map.get('beats', []))}")
            
            return artifacts
            
        except Exception as e:
            print(f"❌ Error generating artifacts: {e}")
            return self.get_fallback_artifacts()
    
    def generate_frames(self) -> Dict[str, Any]:
        """Generate frames every 10 seconds from video"""
        try:
            # Get video duration first
            duration_cmd = [
                'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                '-of', 'csv=p=0', self.video_path
            ]
            
            result = subprocess.run(duration_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Failed to get video duration: {result.stderr}")
            
            duration = float(result.stdout.strip())
            print(f"  📹 Video duration: {duration:.2f} seconds")
            
            # Generate frames every 10 seconds
            frame_cmd = [
                'ffmpeg', '-i', self.video_path,
                '-vf', f'fps=1/10,scale=1920:-2',
                '-y',  # Overwrite existing files
                str(self.frames_dir / 'frame_%03d.png')
            ]
            
            print(f"  🎬 Generating frames with command: {' '.join(frame_cmd)}")
            result = subprocess.run(frame_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"  ⚠️  Frame generation warning: {result.stderr}")
            
            # Count generated frames
            frame_files = list(self.frames_dir.glob('frame_*.png'))
            frame_files.sort()
            
            frames_info = {
                'total_frames': len(frame_files),
                'frame_interval': 10,
                'frames': [f.name for f in frame_files],
                'duration': duration,
                'frames_dir': str(self.frames_dir)
            }
            
            print(f"  ✅ Generated {len(frame_files)} frames")
            return frames_info
            
        except Exception as e:
            print(f"  ❌ Frame generation failed: {e}")
            return {'error': str(e), 'frames': []}
    
    def build_scene_map(self) -> Dict[str, Any]:
        """Build comprehensive scene map from timeline and TTS data"""
        try:
            # Load timeline data
            timeline_data = self.load_timeline()
            
            # Load TTS data
            tts_data = self.load_tts()
            
            # Build scene map
            scene_map = self.create_detailed_scene_map(timeline_data, tts_data)
            
            # Save scene map
            scene_map_path = self.artifacts_dir / "scene_map.json"
            with open(scene_map_path, 'w', encoding='utf-8') as f:
                json.dump(scene_map, f, indent=2)
            
            print(f"  ✅ Scene map saved: {scene_map_path}")
            return scene_map
            
        except Exception as e:
            print(f"  ❌ Scene map generation failed: {e}")
            return self.get_fallback_scene_map()
    
    def load_timeline(self) -> Dict[str, Any]:
        """Load timeline data"""
        try:
            with open(self.timeline_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Try YAML first if available
            if YAML_AVAILABLE:
                try:
                    return yaml.safe_load(content)
                except yaml.YAMLError:
                    return self.parse_text_timeline(content)
            else:
                # Use fallback parsing
                return self.parse_text_timeline(content)
                
        except FileNotFoundError:
            print(f"  ⚠️  Timeline file not found: {self.timeline_path}")
            return {"beats": []}
    
    def load_tts(self) -> Dict[str, Any]:
        """Load TTS data"""
        try:
            with open(self.tts_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"  ⚠️  TTS file not found: {self.tts_path}")
            return {"beats": []}
        except json.JSONDecodeError:
            print(f"  ⚠️  Invalid JSON in TTS file")
            return {"beats": []}
    
    def parse_text_timeline(self, content: str) -> Dict[str, Any]:
        """Parse timeline as text if YAML fails"""
        timeline = {"beats": []}
        
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            
            # Look for video track entries with name and duration
            if 'name:' in line and 'duration:' in line:
                # Extract name and duration from YAML-like format
                name_match = re.search(r'name:\s*"([^"]+)"', line)
                duration_match = re.search(r'duration:\s*(\d+)', line)
                
                if name_match and duration_match:
                    beat_id = name_match.group(1)
                    duration = int(duration_match.group(1))
                    timeline["beats"].append({
                        "id": beat_id,
                        "duration": duration
                    })
            
            # Also look for simple beat patterns
            elif 'beat:' in line.lower() or 'segment:' in line.lower():
                # Extract beat information
                parts = line.split(':')
                if len(parts) >= 2:
                    beat_id = parts[1].strip()
                    # Estimate duration (default 30 seconds)
                    timeline["beats"].append({
                        "id": beat_id,
                        "duration": 30
                    })
        
        # If no beats found, create default structure
        if not timeline["beats"]:
            timeline["beats"] = [
                {"id": "intro", "duration": 30},
                {"id": "main_content", "duration": 240},
                {"id": "conclusion", "duration": 30}
            ]
        
        return timeline
    
    def create_detailed_scene_map(self, timeline_data: Dict[str, Any], tts_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed scene map with expected visuals and timing"""
        beats = []
        current_time = 0
        
        timeline_beats = timeline_data.get('beats', [])
        tts_beats = tts_data.get('beats', [])
        
        for i, beat in enumerate(timeline_beats):
            beat_id = beat.get('id', f'beat_{i}')
            duration = beat.get('duration', 30)
            
            # Find corresponding TTS data
            tts_beat = next((b for b in tts_beats if b.get('id') == beat_id), {})
            
            # Determine expected visuals based on beat ID
            expected_visuals = self.get_expected_visuals(beat_id)
            
            beat_info = {
                "id": beat_id,
                "start": current_time,
                "end": current_time + duration,
                "duration": duration,
                "expected_visuals": expected_visuals,
                "narration": tts_beat.get('text', ''),
                "narration_duration": tts_beat.get('duration', duration)
            }
            
            beats.append(beat_info)
            current_time += duration
        
        return {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "total_duration": current_time,
                "total_beats": len(beats)
            },
            "beats": beats
        }
    
    def get_expected_visuals(self, beat_id: str) -> List[str]:
        """Get expected visuals for a beat based on its ID"""
        visual_map = {
            "intro": ["title", "subtitle", "intro_art"],
            "roles": ["dashboard", "roles_lower_third"],
            "api_overview": ["api_diagram", "endpoint_labels:hazards,routes,risk,evacuations,units,public_safety"],
            "tech_deep_dive": ["foundry_functions", "api_endpoints", "technical_diagram"],
            "map_demo": ["live_map", "hazard_click", "status_callout"],
            "route_concept": ["route_overlay", "path_visualization", "optimization_diagram"],
            "ai_integration": ["ai_diagram", "decision_support", "automation_flow"],
            "impact": ["impact_slide", "metrics_display", "value_proposition"],
            "conclusion": ["cta", "contact_info", "final_art"]
        }
        
        # Try exact match first
        if beat_id in visual_map:
            return visual_map[beat_id]
        
        # Try partial matches
        for key, visuals in visual_map.items():
            if key in beat_id.lower():
                return visuals
        
        # Default visuals
        return ["general_visual", "text_overlay"]
    
    def generate_transcript(self) -> Dict[str, Any]:
        """Generate transcript from TTS data"""
        try:
            tts_data = self.load_tts()
            
            transcript = {
                "format": "srt",
                "segments": [],
                "full_text": ""
            }
            
            current_time = 0
            segment_id = 1
            
            for beat in tts_data.get('beats', []):
                text = beat.get('text', '')
                duration = beat.get('duration', 30)
                
                if text.strip():
                    # Create SRT segment
                    start_time = self.seconds_to_srt_time(current_time)
                    end_time = self.seconds_to_srt_time(current_time + duration)
                    
                    segment = {
                        "id": segment_id,
                        "start_time": start_time,
                        "end_time": end_time,
                        "text": text,
                        "beat_id": beat.get('id', 'unknown')
                    }
                    
                    transcript["segments"].append(segment)
                    transcript["full_text"] += text + " "
                    segment_id += 1
                
                current_time += duration
            
            # Save transcript
            transcript_path = self.artifacts_dir / "transcript.json"
            with open(transcript_path, 'w', encoding='utf-8') as f:
                json.dump(transcript, f, indent=2)
            
            print(f"  ✅ Transcript saved: {transcript_path}")
            return transcript
            
        except Exception as e:
            print(f"  ❌ Transcript generation failed: {e}")
            return {"error": str(e), "segments": [], "full_text": ""}
    
    def seconds_to_srt_time(self, seconds: float) -> str:
        """Convert seconds to SRT time format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    def generate_metadata(self) -> Dict[str, Any]:
        """Generate metadata about the review session"""
        return {
            "generated_at": datetime.now().isoformat(),
            "video_path": self.video_path,
            "timeline_path": self.timeline_path,
            "tts_path": self.tts_path,
            "output_dir": str(self.output_dir),
            "artifacts_dir": str(self.artifacts_dir),
            "frames_dir": str(self.frames_dir)
        }
    
    def save_artifacts_summary(self, artifacts: Dict[str, Any]) -> None:
        """Save summary of all generated artifacts"""
        summary_path = self.artifacts_dir / "artifacts_summary.json"
        
        summary = {
            "metadata": artifacts.get('metadata', {}),
            "frames_count": len(artifacts.get('frames', {}).get('frames', [])),
            "beats_count": len(artifacts.get('scene_map', {}).get('beats', [])),
            "transcript_segments": len(artifacts.get('transcript', {}).get('segments', [])),
            "total_duration": artifacts.get('scene_map', {}).get('metadata', {}).get('total_duration', 0)
        }
        
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
        
        print(f"  ✅ Artifacts summary saved: {summary_path}")
    
    def get_fallback_artifacts(self) -> Dict[str, Any]:
        """Return fallback artifacts if generation fails"""
        return {
            "frames": {"error": "Generation failed", "frames": []},
            "scene_map": self.get_fallback_scene_map(),
            "transcript": {"error": "Generation failed", "segments": [], "full_text": ""},
            "metadata": {"error": "Generation failed"}
        }
    
    def get_fallback_scene_map(self) -> Dict[str, Any]:
        """Return fallback scene map"""
        return {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "total_duration": 300,
                "total_beats": 5
            },
            "beats": [
                {
                    "id": "intro",
                    "start": 0,
                    "end": 30,
                    "duration": 30,
                    "expected_visuals": ["title", "subtitle"],
                    "narration": "Introduction to the disaster response dashboard",
                    "narration_duration": 30
                },
                {
                    "id": "demo",
                    "start": 30,
                    "end": 270,
                    "duration": 240,
                    "expected_visuals": ["dashboard", "interactions"],
                    "narration": "Demonstration of key features",
                    "narration_duration": 240
                },
                {
                    "id": "conclusion",
                    "start": 270,
                    "end": 300,
                    "duration": 30,
                    "expected_visuals": ["cta", "contact"],
                    "narration": "Conclusion and call to action",
                    "narration_duration": 30
                }
            ]
        }

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 5:
        print("Usage: python3 generate_review_artifacts.py <video_path> <timeline_path> <tts_path> <output_dir>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    timeline_path = sys.argv[2]
    tts_path = sys.argv[3]
    output_dir = sys.argv[4]
    
    generator = ReviewArtifactsGenerator(video_path, timeline_path, tts_path, output_dir)
    artifacts = generator.generate_all_artifacts()
    
    if artifacts:
        print("\n🎉 Review artifacts generation completed!")
        sys.exit(0)
    else:
        print("\n❌ Review artifacts generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
