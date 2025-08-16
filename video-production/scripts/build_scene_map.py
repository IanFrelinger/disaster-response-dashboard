#!/usr/bin/env python3
"""
Scene Map Builder for Video Review Agent
Builds JSON scene maps from timeline and TTS data for GPT-5 analysis
"""

import json
import yaml
import sys
import os
from pathlib import Path
from typing import Dict, List, Any

class SceneMapBuilder:
    def __init__(self, timeline_path: str, tts_path: str, output_path: str):
        self.timeline_path = timeline_path
        self.tts_path = tts_path
        self.output_path = output_path
        
    def build_scene_map(self) -> Dict[str, Any]:
        """Build scene map from timeline and TTS data"""
        try:
            # Load timeline data
            timeline_data = self.load_timeline()
            
            # Load TTS data
            tts_data = self.load_tts()
            
            # Build scene map
            scene_map = self.create_scene_map(timeline_data, tts_data)
            
            # Save to output file
            self.save_scene_map(scene_map)
            
            print(f"✅ Scene map built successfully: {self.output_path}")
            return scene_map
            
        except Exception as e:
            print(f"❌ Error building scene map: {e}")
            # Return fallback scene map
            return self.get_fallback_scene_map()
    
    def load_timeline(self) -> Dict[str, Any]:
        """Load timeline data from YAML file"""
        try:
            with open(self.timeline_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Try to parse as YAML first
            try:
                return yaml.safe_load(content)
            except yaml.YAMLError:
                # Fallback: parse as simple text
                return self.parse_text_timeline(content)
                
        except FileNotFoundError:
            print(f"⚠️  Timeline file not found: {self.timeline_path}")
            return {}
    
    def parse_text_timeline(self, content: str) -> Dict[str, Any]:
        """Parse timeline content as text if YAML parsing fails"""
        timeline = {"beats": []}
        
        lines = content.split('\n')
        current_beat = None
        
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
        
        return timeline
    
    def load_tts(self) -> Dict[str, Any]:
        """Load TTS cue sheet data"""
        try:
            with open(self.tts_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️  TTS file not found: {self.tts_path}")
            return {"beats": []}
        except json.JSONDecodeError as e:
            print(f"⚠️  Invalid JSON in TTS file: {e}")
            return {"beats": []}
    
    def create_scene_map(self, timeline_data: Dict[str, Any], tts_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create scene map from timeline and TTS data"""
        beats = []
        current_time = 0
        
        # Get timeline beats
        timeline_beats = timeline_data.get("beats", [])
        if not timeline_beats:
            # Try to extract from other timeline formats
            timeline_beats = self.extract_beats_from_timeline(timeline_data)
        
        # Get TTS beats
        tts_beats = tts_data.get("beats", [])
        
        # Create scene map
        for beat in timeline_beats:
            beat_id = beat.get("id", "unknown")
            duration = beat.get("duration", 30)
            
            # Find corresponding TTS data
            tts_beat = next((b for b in tts_beats if b.get("id") == beat_id), None)
            
            scene_beat = {
                "id": beat_id,
                "start": current_time,
                "end": current_time + duration,
                "expect": self.get_expected_visuals(beat_id),
                "narration": tts_beat.get("text", "No narration") if tts_beat else "No narration"
            }
            
            beats.append(scene_beat)
            current_time += duration
        
        return {
            "beats": beats,
            "total_duration": current_time,
            "metadata": {
                "source": "scene_map_builder",
                "timeline_file": self.timeline_path,
                "tts_file": self.tts_path
            }
        }
    
    def extract_beats_from_timeline(self, timeline_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract beats from various timeline formats"""
        beats = []
        
        # Try different possible structures
        if isinstance(timeline_data, dict):
            # Look for beats in various locations
            for key in ["beats", "segments", "scenes", "timeline"]:
                if key in timeline_data and isinstance(timeline_data[key], list):
                    return timeline_data[key]
            
            # Handle timeline structure with video tracks
            if 'timeline' in timeline_data:
                timeline = timeline_data['timeline']
                if 'tracks' in timeline and 'video' in timeline['tracks']:
                    video_tracks = timeline['tracks']['video']
                    for track in video_tracks:
                        if isinstance(track, dict) and 'name' in track and 'duration' in track:
                            beats.append({
                                "id": track['name'],
                                "duration": track['duration']
                            })
            
            # Look for beat-like keys
            for key, value in timeline_data.items():
                if key.startswith("beat_") or key.endswith("_beat"):
                    if isinstance(value, dict):
                        beats.append({"id": key, "duration": value.get("duration", 30)})
                    else:
                        beats.append({"id": key, "duration": 30})
        
        return beats
    
    def get_expected_visuals(self, beat_id: str) -> List[str]:
        """Get expected visuals for a beat"""
        visual_map = {
            'intro': ['title', 'subtitle', 'intro_art'],
            'roles': ['dashboard', 'roles_lower_third'],
            'api_overview': ['api_diagram', 'endpoint_labels'],
            'map_triage': ['live_map', 'hazard_click', 'status_callout'],
            'zones': ['hazard_zones', 'evacuation_status'],
            'route_concept': ['route_overlay', 'profiles_panel'],
            'ai_concept': ['ai_question', 'ai_response_card'],
            'tech_deep_dive': ['technical_diagram', 'labels', 'endpoint_chips'],
            'impact': ['impact_slide', 'value_proposition'],
            'conclusion': ['conclusion_art', 'contact_info']
        }
        
        # Try exact match first
        if beat_id in visual_map:
            return visual_map[beat_id]
        
        # Try partial matches
        for key, visuals in visual_map.items():
            if key in beat_id or beat_id in key:
                return visuals
        
        # Default visuals
        return ['general_content']
    
    def get_fallback_scene_map(self) -> Dict[str, Any]:
        """Get fallback scene map if building fails"""
        fallback_map = {
            "beats": [
                {"id": "intro", "start": 0, "end": 30, "expect": ["title", "subtitle", "intro_art"], "narration": "Introduction"},
                {"id": "roles", "start": 30, "end": 60, "expect": ["dashboard", "roles_lower_third"], "narration": "User roles"},
                {"id": "api_overview", "start": 60, "end": 100, "expect": ["api_diagram", "endpoint_labels"], "narration": "API overview"},
                {"id": "map_triage", "start": 100, "end": 140, "expect": ["live_map", "hazard_click", "status_callout"], "narration": "Map exploration"},
                {"id": "zones", "start": 140, "end": 180, "expect": ["hazard_zones", "evacuation_status"], "narration": "Hazard zones"},
                {"id": "route_concept", "start": 180, "end": 220, "expect": ["route_overlay", "profiles_panel"], "narration": "Route concept"},
                {"id": "ai_concept", "start": 220, "end": 250, "expect": ["ai_question", "ai_response_card"], "narration": "AI concept"},
                {"id": "tech_deep_dive", "start": 250, "end": 290, "expect": ["technical_diagram", "labels", "endpoint_chips"], "narration": "Technical details"},
                {"id": "impact", "start": 290, "end": 320, "expect": ["impact_slide", "value_proposition"], "narration": "Impact and value"},
                {"id": "conclusion", "start": 320, "end": 340, "expect": ["conclusion_art", "contact_info"], "narration": "Conclusion"}
            ],
            "total_duration": 340,
            "metadata": {
                "source": "fallback_scene_map",
                "note": "Generated fallback due to parsing errors"
            }
        }
        
        # Save fallback
        self.save_scene_map(fallback_map)
        return fallback_map
    
    def save_scene_map(self, scene_map: Dict[str, Any]) -> None:
        """Save scene map to output file"""
        try:
            # Ensure output directory exists
            output_dir = os.path.dirname(self.output_path)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
            
            with open(self.output_path, 'w', encoding='utf-8') as f:
                json.dump(scene_map, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"❌ Error saving scene map: {e}")

def main():
    """Main function"""
    if len(sys.argv) != 4:
        print("Usage: python3 build_scene_map.py <timeline.yaml> <tts-cue-sheet.json> <output.json>")
        sys.exit(1)
    
    timeline_path = sys.argv[1]
    tts_path = sys.argv[2]
    output_path = sys.argv[3]
    
    # Check if input files exist
    if not os.path.exists(timeline_path):
        print(f"❌ Timeline file not found: {timeline_path}")
        sys.exit(1)
    
    if not os.path.exists(tts_path):
        print(f"❌ TTS file not found: {tts_path}")
        sys.exit(1)
    
    # Build scene map
    builder = SceneMapBuilder(timeline_path, tts_path, output_path)
    scene_map = builder.build_scene_map()
    
    # Print summary
    print(f"\n📊 Scene Map Summary:")
    print(f"  Total beats: {len(scene_map['beats'])}")
    print(f"  Total duration: {scene_map['total_duration']}s")
    print(f"  Output file: {output_path}")
    
    # Print beat details
    print(f"\n🎬 Beat Details:")
    for beat in scene_map['beats']:
        print(f"  {beat['id']}: {beat['start']:03d}s - {beat['end']:03d}s ({beat['end'] - beat['start']}s)")
        print(f"    Expected: {', '.join(beat['expect'])}")
        print(f"    Narration: {beat['narration'][:50]}{'...' if len(beat['narration']) > 50 else ''}")

if __name__ == "__main__":
    main()
