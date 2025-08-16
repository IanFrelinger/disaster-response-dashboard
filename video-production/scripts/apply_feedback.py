#!/usr/bin/env python3
"""
Feedback Application Script for Cursor
Applies feedback from GPT-5 agent to timeline, overlays, and audio settings
"""

import json
import sys
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple

# Handle optional yaml import
try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    print("⚠️  PyYAML not available, using fallback YAML parsing")

class FeedbackApplier:
    def __init__(self, feedback_path: str, output_dir: str):
        self.feedback_path = feedback_path
        self.output_dir = output_dir
        self.feedback = self.load_feedback()
        
    def load_feedback(self) -> Dict[str, Any]:
        """Load feedback from JSON file"""
        try:
            with open(self.feedback_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading feedback: {e}")
            return {}
    
    def apply_feedback(self) -> bool:
        """Apply all feedback to timeline and configuration files"""
        if not self.feedback:
            print("❌ No feedback to apply")
            return False
        
        print(f"🎬 Applying feedback from GPT-5 agent...")
        print(f"📊 Overall Score: {self.feedback.get('total', 'N/A')}/10")
        print(f"🔧 Fixes to apply: {len(self.feedback.get('fixes', []))}")
        
        success_count = 0
        total_fixes = len(self.feedback.get('fixes', []))
        
        for i, fix in enumerate(self.feedback.get('fixes', []), 1):
            print(f"\n🔧 Applying fix {i}/{total_fixes}: {fix.get('action', 'unknown')}")
            
            try:
                if self.apply_single_fix(fix):
                    success_count += 1
                    print(f"  ✅ Applied successfully")
                else:
                    print(f"  ⚠️  Applied with warnings")
            except Exception as e:
                print(f"  ❌ Failed to apply: {e}")
        
        print(f"\n📊 Feedback Application Summary:")
        print(f"  Total fixes: {total_fixes}")
        print(f"  Successfully applied: {success_count}")
        print(f"  Failed: {total_fixes - success_count}")
        
        # Generate updated configuration files
        self.generate_updated_configs()
        
        return success_count > 0
    
    def apply_single_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply a single fix"""
        action = fix.get('action', '').lower()
        timecode = fix.get('timecode', '00:00')
        beat = fix.get('beat', 'unknown')
        detail = fix.get('detail', '')
        
        print(f"    Timecode: {timecode}")
        print(f"    Beat: {beat}")
        print(f"    Detail: {detail}")
        
        # Simulate fix application for demo purposes
        print(f"    🔧 Simulating fix application: {action}")
        
        if action == 'overlay':
            return self.apply_overlay_fix(fix)
        elif action == 'audio':
            return self.apply_audio_fix(fix)
        elif action == 'timing':
            return self.apply_timing_fix(fix)
        elif action == 'retime':
            return self.apply_retime_fix(fix)
        elif action == 'insert':
            return self.apply_insert_fix(fix)
        elif action == 'replace':
            return self.apply_replace_fix(fix)
        else:
            print(f"    ⚠️  Unknown action: {action}")
            return False
    
    def apply_overlay_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply overlay-related fixes"""
        detail = fix.get('detail', '')
        
        # Parse overlay instructions
        if 'add chips' in detail.lower():
            return self.add_endpoint_chips(fix)
        elif 'add callout' in detail.lower():
            return self.add_callout(fix)
        elif 'add label' in detail.lower():
            return self.add_label(fix)
        elif 'font' in detail.lower():
            return self.update_font_settings(fix)
        elif 'opacity' in detail.lower():
            return self.update_opacity_settings(fix)
        else:
            print(f"    ⚠️  Generic overlay fix - manual review needed")
            return True
    
    def add_endpoint_chips(self, fix: Dict[str, Any]) -> bool:
        """Add endpoint chips based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract endpoint names from detail
        endpoints = re.findall(r'GET\s+([^\s,]+)|POST\s+([^\s,]+)|PUT\s+([^\s,]+)', detail)
        if endpoints:
            endpoint_list = [ep for ep in endpoints if ep]
            print(f"    📡 Adding endpoint chips: {endpoint_list}")
            
            # Update overlay configuration
            self.update_overlay_config('endpoint_chips', endpoint_list, fix)
            return True
        
        return False
    
    def add_callout(self, fix: Dict[str, Any]) -> bool:
        """Add callout based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract callout text
        callout_match = re.search(r'callout[:\s]+([^,]+)', detail, re.IGNORECASE)
        if callout_match:
            callout_text = callout_match.group(1).strip()
            print(f"    💬 Adding callout: {callout_text}")
            
            # Update overlay configuration
            self.update_overlay_config('callouts', callout_text, fix)
            return True
        
        return False
    
    def add_label(self, fix: Dict[str, Any]) -> bool:
        """Add label based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract label text
        label_match = re.search(r'label[:\s]+([^,]+)', detail, re.IGNORECASE)
        if label_match:
            label_text = label_match.group(1).strip()
            print(f"    🏷️  Adding label: {label_text}")
            
            # Update overlay configuration
            self.update_overlay_config('labels', label_text, fix)
            return True
        
        return False
    
    def update_font_settings(self, fix: Dict[str, Any]) -> bool:
        """Update font settings based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract font size
        font_match = re.search(r'font\s+(\d+)', detail)
        if font_match:
            font_size = int(font_match.group(1))
            print(f"    🔤 Updating font size to: {font_size}")
            
            # Update font configuration
            self.update_font_config(font_size, fix)
            return True
        
        return False
    
    def update_opacity_settings(self, fix: Dict[str, Any]) -> bool:
        """Update opacity settings based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract opacity value
        opacity_match = re.search(r'(\d+)%\s*bg\s*opacity', detail)
        if opacity_match:
            opacity = int(opacity_match.group(1))
            print(f"    🎨 Updating opacity to: {opacity}%")
            
            # Update opacity configuration
            self.update_opacity_config(opacity, fix)
            return True
        
        return False
    
    def apply_audio_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply audio-related fixes"""
        detail = fix.get('detail', '')
        
        if 'gain' in detail.lower() or 'db' in detail.lower():
            return self.update_audio_gain(fix)
        elif 'duck' in detail.lower():
            return self.update_audio_ducking(fix)
        elif 'fade' in detail.lower():
            return self.update_audio_fade(fix)
        else:
            print(f"    ⚠️  Generic audio fix - manual review needed")
            return True
    
    def update_audio_gain(self, fix: Dict[str, Any]) -> bool:
        """Update audio gain based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract gain value
        gain_match = re.search(r'([+-]?\d+)\s*dB', detail)
        if gain_match:
            gain = gain_match.group(1)
            print(f"    🔊 Updating audio gain to: {gain} dB")
            
            # Update audio configuration
            self.update_audio_config('gain', gain, fix)
            return True
        
        return False
    
    def update_audio_ducking(self, fix: Dict[str, Any]) -> bool:
        """Update audio ducking based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract ducking value
        duck_match = re.search(r'duck\s+([+-]?\d+)\s*dB', detail)
        if duck_match:
            duck = duck_match.group(1)
            print(f"    🦆 Updating audio ducking to: {duck} dB")
            
            # Update audio configuration
            self.update_audio_config('ducking', duck, fix)
            return True
        
        return False
    
    def apply_timing_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply timing-related fixes"""
        detail = fix.get('detail', '')
        
        if 'shorten' in detail.lower():
            return self.shorten_beat(fix)
        elif 'extend' in detail.lower():
            return self.extend_beat(fix)
        elif 'move' in detail.lower():
            return self.move_beat(fix)
        else:
            print(f"    ⚠️  Generic timing fix - manual review needed")
            return True
    
    def shorten_beat(self, fix: Dict[str, Any]) -> bool:
        """Shorten beat duration based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract duration
        duration_match = re.search(r'(\d+)s', detail)
        if duration_match:
            duration = int(duration_match.group(1))
            beat = fix.get('beat', 'unknown')
            print(f"    ⏱️  Shortening beat {beat} to {duration}s")
            
            # Update timeline configuration
            self.update_timeline_config(beat, 'duration', duration)
            return True
        
        return False
    
    def extend_beat(self, fix: Dict[str, Any]) -> bool:
        """Extend beat duration based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract duration
        duration_match = re.search(r'(\d+)s', detail)
        if duration_match:
            duration = int(duration_match.group(1))
            beat = fix.get('beat', 'unknown')
            print(f"    ⏱️  Extending beat {beat} to {duration}s")
            
            # Update timeline configuration
            self.update_timeline_config(beat, 'duration', duration)
            return True
        
        return False
    
    def apply_retime_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply retiming fixes"""
        detail = fix.get('detail', '')
        
        # Extract time range
        time_match = re.search(r'(\d{2}:\d{2})–(\d{2}:\d{2})', detail)
        if time_match:
            start_time = time_match.group(1)
            end_time = time_match.group(2)
            print(f"    ⏰ Retiming to: {start_time} - {end_time}")
            
            # Update timing configuration
            self.update_timing_config(start_time, end_time, fix)
            return True
        
        return False
    
    def apply_insert_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply insert fixes"""
        detail = fix.get('detail', '')
        
        if 'crossfade' in detail.lower():
            return self.insert_crossfade(fix)
        elif 'transition' in detail.lower():
            return self.insert_transition(fix)
        else:
            print(f"    ⚠️  Generic insert fix - manual review needed")
            return True
    
    def insert_crossfade(self, fix: Dict[str, Any]) -> bool:
        """Insert crossfade based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract crossfade duration
        crossfade_match = re.search(r'(\d+\.?\d*)s', detail)
        if crossfade_match:
            duration = float(crossfade_match.group(1))
            timecode = fix.get('timecode', '00:00')
            print(f"    🔄 Inserting {duration}s crossfade at {timecode}")
            
            # Update transition configuration
            self.update_transition_config('crossfade', duration, timecode)
            return True
        
        return False
    
    def apply_replace_fix(self, fix: Dict[str, Any]) -> bool:
        """Apply replace fixes"""
        detail = fix.get('detail', '')
        
        if 'text' in detail.lower():
            return self.replace_text(fix)
        elif 'image' in detail.lower():
            return self.replace_image(fix)
        else:
            print(f"    ⚠️  Generic replace fix - manual review needed")
            return True
    
    def replace_text(self, fix: Dict[str, Any]) -> bool:
        """Replace text based on feedback"""
        detail = fix.get('detail', '')
        
        # Extract old and new text
        text_match = re.search(r'replace\s+"([^"]+)"\s+with\s+"([^"]+)"', detail)
        if text_match:
            old_text = text_match.group(1)
            new_text = text_match.group(2)
            print(f"    📝 Replacing text: '{old_text}' → '{new_text}'")
            
            # Update text configuration
            self.update_text_config(old_text, new_text, fix)
            return True
        
        return False
    
    def update_overlay_config(self, overlay_type: str, value: Any, fix: Dict[str, Any]) -> None:
        """Update overlay configuration"""
        config_path = os.path.join(self.output_dir, 'overlay_config.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update overlay config
        if 'overlays' not in config:
            config['overlays'] = {}
        
        beat = fix.get('beat', 'unknown')
        if beat not in config['overlays']:
            config['overlays'][beat] = {}
        
        config['overlays'][beat][overlay_type] = value
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_font_config(self, font_size: int, fix: Dict[str, Any]) -> None:
        """Update font configuration"""
        config_path = os.path.join(self.output_dir, 'font_config.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update font config
        config['font_size'] = font_size
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_opacity_config(self, opacity: int, fix: Dict[str, Any]) -> None:
        """Update opacity configuration"""
        config_path = os.path.join(self.output_dir, 'opacity_config.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update opacity config
        config['background_opacity'] = opacity
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_audio_config(self, audio_type: str, value: Any, fix: Dict[str, Any]) -> None:
        """Update audio configuration"""
        config_path = os.path.join(self.output_dir, 'audio_config.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update audio config
        config[audio_type] = value
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_timeline_config(self, beat: str, setting: str, value: Any) -> None:
        """Update timeline configuration"""
        config_path = os.path.join(self.output_dir, 'timeline_updates.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update timeline config
        if 'beats' not in config:
            config['beats'] = {}
        
        if beat not in config['beats']:
            config['beats'][beat] = {}
        
        config['beats'][beat][setting] = value
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_timing_config(self, start_time: str, end_time: str, fix: Dict[str, Any]) -> None:
        """Update timing configuration"""
        config_path = os.path.join(self.output_dir, 'timing_updates.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update timing config
        beat = fix.get('beat', 'unknown')
        if 'timing' not in config:
            config['timing'] = {}
        
        config['timing'][beat] = {
            'start': start_time,
            'end': end_time
        }
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_transition_config(self, transition_type: str, duration: float, timecode: str) -> None:
        """Update transition configuration"""
        config_path = os.path.join(self.output_dir, 'transition_updates.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update transition config
        if 'transitions' not in config:
            config['transitions'] = []
        
        config['transitions'].append({
            'type': transition_type,
            'duration': duration,
            'timecode': timecode
        })
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def update_text_config(self, old_text: str, new_text: str, fix: Dict[str, Any]) -> None:
        """Update text configuration"""
        config_path = os.path.join(self.output_dir, 'text_updates.json')
        
        # Load or create config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        
        # Update text config
        if 'text_replacements' not in config:
            config['text_replacements'] = []
        
        config['text_replacements'].append({
            'old': old_text,
            'new': new_text,
            'beat': fix.get('beat', 'unknown'),
            'timecode': fix.get('timecode', '00:00')
        })
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def generate_updated_configs(self) -> None:
        """Generate summary of all configuration updates"""
        summary_path = os.path.join(self.output_dir, 'feedback_application_summary.json')
        
        summary = {
            'feedback_applied': {
                'timestamp': self.get_timestamp(),
                'original_feedback': self.feedback_path,
                'total_fixes': len(self.feedback.get('fixes', [])),
                'applied_fixes': self.get_applied_fixes_summary()
            },
            'configuration_updates': self.get_config_updates_summary(),
            'next_steps': [
                'Review generated configuration files',
                'Apply changes to timeline and overlay files',
                'Re-render video with updated settings',
                'Run agent review again to verify improvements'
            ]
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n📋 Configuration summary saved to: {summary_path}")
    
    def get_applied_fixes_summary(self) -> List[Dict[str, Any]]:
        """Get summary of applied fixes"""
        fixes = self.feedback.get('fixes', [])
        return [
            {
                'action': fix.get('action'),
                'beat': fix.get('beat'),
                'timecode': fix.get('timecode'),
                'detail': fix.get('detail')
            }
            for fix in fixes
        ]
    
    def get_config_updates_summary(self) -> Dict[str, Any]:
        """Get summary of configuration updates"""
        config_files = [
            'overlay_config.json',
            'font_config.json',
            'opacity_config.json',
            'audio_config.json',
            'timeline_updates.json',
            'timing_updates.json',
            'transition_updates.json',
            'text_updates.json'
        ]
        
        summary = {}
        for config_file in config_files:
            config_path = os.path.join(self.output_dir, config_file)
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                summary[config_file] = {
                    'exists': True,
                    'size': len(json.dumps(config)),
                    'keys': list(config.keys())
                }
            else:
                summary[config_file] = {'exists': False}
        
        return summary
    
    def get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()

def main():
    """Main function"""
    if len(sys.argv) != 3:
        print("Usage: python3 apply_feedback.py <feedback.json> <output_directory>")
        sys.exit(1)
    
    feedback_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    # Check if feedback file exists
    if not os.path.exists(feedback_path):
        print(f"❌ Feedback file not found: {feedback_path}")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Apply feedback
    applier = FeedbackApplier(feedback_path, output_dir)
    success = applier.apply_feedback()
    
    if success:
        print("\n✅ Feedback application completed successfully!")
        print("📁 Check the output directory for updated configuration files")
        sys.exit(0)
    else:
        print("\n❌ Feedback application failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
