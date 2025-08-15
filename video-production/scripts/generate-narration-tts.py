#!/usr/bin/env python3
"""
Narration TTS Generator
Generates text-to-speech audio from narration.yaml using ElevenLabs with cloned voice
"""

import os
import sys
import yaml
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

# Add the current directory to Python path to import tts_providers
sys.path.append(str(Path(__file__).parent))
from tts_providers import ElevenLabsTTS, OpenAITTS, AzureTTS

class NarrationTTSGenerator:
    """Generate TTS audio from narration.yaml configuration"""
    
    def __init__(self, config_path: str = "narration.yaml"):
        self.config_path = Path(config_path)
        self.narration_config = self.load_narration_config()
        self.tts_provider = self.create_tts_provider()
        self.output_dir = Path("audio/vo")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def load_narration_config(self) -> Dict[str, Any]:
        """Load narration configuration from YAML file"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Narration config not found: {self.config_path}")
            
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
            
        print(f"✅ Loaded narration config: {self.config_path}")
        return config
        
    def create_tts_provider(self):
        """Create TTS provider based on configuration"""
        voice_provider = self.narration_config.get('metadata', {}).get('voice_provider', 'elevenlabs')
        voice_settings = self.narration_config.get('metadata', {}).get('voice_settings', {})
        
        # Get provider-specific settings
        providers_config = self.narration_config.get('voice_providers', {})
        provider_config = providers_config.get(voice_provider, {})
        
        # Merge voice settings with provider config
        config = {**provider_config, **voice_settings}
        
        print(f"🎤 Using TTS provider: {voice_provider}")
        print(f"⚙️  Provider config: {config}")
        
        if voice_provider == 'elevenlabs':
            return ElevenLabsTTS(config)
        elif voice_provider == 'openai':
            return OpenAITTS(config)
        elif voice_provider == 'azure':
            return AzureTTS(config)
        else:
            raise ValueError(f"Unsupported TTS provider: {voice_provider}")
            
    def generate_audio_for_scene(self, scene: Dict[str, Any], scene_index: int) -> Optional[str]:
        """Generate audio for a single scene"""
        scene_id = scene.get('id', f'scene_{scene_index}')
        title = scene.get('title', f'Scene {scene_index}')
        narration = scene.get('narration', '')
        duration = scene.get('duration', 10)
        
        if not narration:
            print(f"⚠️  No narration text for scene {scene_id}")
            return None
            
        print(f"🎬 Generating audio for scene: {title}")
        print(f"📝 Text: {narration[:100]}{'...' if len(narration) > 100 else ''}")
        
        try:
            audio_path = self.tts_provider.generate_audio(
                text=narration,
                scene_id=scene_id,
                scene_title=title,
                duration=duration,
                scene_index=scene_index
            )
            
            if audio_path:
                print(f"✅ Generated audio: {audio_path}")
                return audio_path
            else:
                print(f"❌ Failed to generate audio for scene {scene_id}")
                return None
                
        except Exception as e:
            print(f"❌ Error generating audio for scene {scene_id}: {e}")
            return None
            
    def generate_all_audio(self) -> Dict[str, Any]:
        """Generate audio for all scenes"""
        scenes = self.narration_config.get('scenes', [])
        
        if not scenes:
            print("❌ No scenes found in narration configuration")
            return {}
            
        print(f"🎬 Generating audio for {len(scenes)} scenes")
        print("=" * 50)
        
        results = {
            'timestamp': datetime.now().isoformat(),
            'config_file': str(self.config_path),
            'total_scenes': len(scenes),
            'successful_scenes': 0,
            'failed_scenes': 0,
            'scenes': []
        }
        
        for i, scene in enumerate(scenes):
            print(f"\n🎬 Scene {i+1}/{len(scenes)}: {scene.get('title', f'Scene {i+1}')}")
            
            audio_path = self.generate_audio_for_scene(scene, i)
            
            scene_result = {
                'index': i,
                'id': scene.get('id', f'scene_{i}'),
                'title': scene.get('title', f'Scene {i}'),
                'duration': scene.get('duration', 10),
                'success': audio_path is not None,
                'audio_path': audio_path,
                'narration_length': len(scene.get('narration', ''))
            }
            
            results['scenes'].append(scene_result)
            
            if audio_path:
                results['successful_scenes'] += 1
            else:
                results['failed_scenes'] += 1
                
        return results
        
    def save_report(self, results: Dict[str, Any]):
        """Save generation report"""
        report_path = self.output_dir / 'narration-tts-report.json'
        
        with open(report_path, 'w') as f:
            json.dump(results, f, indent=2)
            
        print(f"\n📊 Report saved to: {report_path}")
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 NARRATION TTS GENERATION SUMMARY")
        print("=" * 50)
        print(f"Total scenes: {results['total_scenes']}")
        print(f"Successful: {results['successful_scenes']}")
        print(f"Failed: {results['failed_scenes']}")
        print(f"Success rate: {(results['successful_scenes'] / results['total_scenes'] * 100):.1f}%")
        
        if results['failed_scenes'] > 0:
            print("\n❌ Failed scenes:")
            for scene in results['scenes']:
                if not scene['success']:
                    print(f"  - {scene['title']} (ID: {scene['id']})")
                    
        print(f"\n🎤 Audio files saved to: {self.output_dir}")
        print("🎬 Next steps:")
        print("1. Review the generated audio files")
        print("2. Use video editing software to combine with video")
        print("3. Adjust timing if needed for synchronization")

def main():
    parser = argparse.ArgumentParser(description="Generate TTS audio from narration configuration")
    parser.add_argument("--config", default="narration.yaml", help="Path to narration configuration file")
    parser.add_argument("--output-dir", default="audio/vo", help="Output directory for audio files")
    
    args = parser.parse_args()
    
    try:
        generator = NarrationTTSGenerator(args.config)
        results = generator.generate_all_audio()
        generator.save_report(results)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
