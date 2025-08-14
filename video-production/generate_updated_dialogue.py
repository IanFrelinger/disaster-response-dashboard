#!/usr/bin/env python3
"""
Generate Updated Dialogue Script
Creates dialogue audio files using ElevenLabs TTS service based on the updated narration configuration.
"""

import os
import sys
import yaml
import subprocess
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Add the scripts directory to the path so we can import tts_providers
sys.path.append(str(Path(__file__).parent / 'scripts'))

try:
    from tts_providers import ElevenLabsTTS
except ImportError as e:
    print(f"Error importing TTS providers: {e}")
    print("Make sure you're in the video-production directory and the tts_providers.py file exists.")
    sys.exit(1)

def load_narration_config(config_path: str) -> Dict:
    """Load the narration configuration from YAML file."""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        print(f"✅ Loaded narration configuration from {config_path}")
        return config
    except Exception as e:
        print(f"❌ Failed to load narration configuration: {e}")
        sys.exit(1)

def create_elevenlabs_config(narration_config: Dict) -> Dict:
    """Create ElevenLabs configuration from narration config."""
    voice_settings = narration_config.get('metadata', {}).get('voice_settings', {})
    
    config = {
        'voice_id': voice_settings.get('voice_id', 'LIpBYrITLsIquxoXdSkr'),
        'stability': voice_settings.get('stability', 0.5),
        'similarity_boost': voice_settings.get('similarity_boost', 0.75)
    }
    
    return config

def generate_scene_audio(tts_provider: ElevenLabsTTS, scene: Dict, scene_index: int) -> Optional[str]:
    """Generate audio for a single scene."""
    scene_id = scene['id']
    title = scene['title']
    narration = scene['narration']
    duration = scene['duration']
    
    print(f"\n🎬 Generating audio for Scene {scene_index + 1}: {title}")
    print(f"   Duration: {duration}s")
    print(f"   Text: {narration[:80]}...")
    
    try:
        audio_path = tts_provider.generate_audio(
            text=narration,
            scene_id=scene_id,
            scene_title=title,
            duration=duration,
            scene_index=scene_index
        )
        
        if audio_path:
            print(f"   ✅ Generated: {audio_path}")
            return audio_path
        else:
            print(f"   ❌ Failed to generate audio")
            return None
            
    except Exception as e:
        print(f"   ❌ Error generating audio: {e}")
        return None

def generate_all_dialogue(narration_config: Dict, output_dir: str = "audio/vo"):
    """Generate dialogue for all scenes using ElevenLabs TTS."""
    
    # Ensure output directory exists
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Create ElevenLabs TTS provider
    elevenlabs_config = create_elevenlabs_config(narration_config)
    tts_provider = ElevenLabsTTS(elevenlabs_config)
    
    scenes = narration_config.get('scenes', [])
    total_scenes = len(scenes)
    
    print(f"\n🎤 Starting dialogue generation for {total_scenes} scenes...")
    print(f"📁 Output directory: {output_dir}")
    print(f"🔊 TTS Provider: ElevenLabs (Voice ID: {elevenlabs_config['voice_id']})")
    
    successful_generations = []
    failed_generations = []
    
    for i, scene in enumerate(scenes):
        audio_path = generate_scene_audio(tts_provider, scene, i)
        
        if audio_path:
            successful_generations.append({
                'scene': scene,
                'audio_path': audio_path,
                'index': i
            })
        else:
            failed_generations.append({
                'scene': scene,
                'index': i
            })
    
    # Print summary
    print(f"\n📊 Generation Summary:")
    print(f"   ✅ Successful: {len(successful_generations)}/{total_scenes}")
    print(f"   ❌ Failed: {len(failed_generations)}/{total_scenes}")
    
    if successful_generations:
        print(f"\n🎵 Generated audio files:")
        for gen in successful_generations:
            scene = gen['scene']
            audio_path = gen['audio_path']
            print(f"   • {scene['title']}: {audio_path}")
    
    if failed_generations:
        print(f"\n⚠️  Failed generations:")
        for gen in failed_generations:
            scene = gen['scene']
            print(f"   • {scene['title']}")
    
    return successful_generations, failed_generations

def create_merged_audio_file(successful_generations: List, output_file: str = "audio/voiceover_updated.wav"):
    """Create a merged audio file from all generated scenes."""
    
    if not successful_generations:
        print("❌ No successful generations to merge")
        return None
    
    print(f"\n🔗 Creating merged audio file: {output_file}")
    
    # Ensure output directory exists
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    
    if len(successful_generations) == 1:
        # Just copy the single file
        import shutil
        shutil.copy2(successful_generations[0]['audio_path'], output_file)
        print(f"✅ Copied single audio file to {output_file}")
        return output_file
    
    # Create file list for ffmpeg
    temp_file_list = "temp_audio_files.txt"
    with open(temp_file_list, 'w') as f:
        for gen in successful_generations:
            f.write(f"file '{gen['audio_path']}'\n")
    
    try:
        # Merge audio files using ffmpeg
        cmd = [
            'ffmpeg', '-f', 'concat', '-safe', '0', 
            '-i', temp_file_list, '-c', 'copy', output_file, '-y'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Successfully merged audio files to {output_file}")
        
        # Clean up temp file
        os.remove(temp_file_list)
        
        return output_file
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to merge audio files: {e}")
        print(f"   stderr: {e.stderr}")
        return None
    except Exception as e:
        print(f"❌ Error during merge: {e}")
        return None

def main():
    """Main function to generate dialogue."""
    
    print("🎬 Disaster Response Dashboard - Updated Dialogue Generator")
    print("=" * 65)
    
    # Load environment variables from config.env
    load_dotenv('config.env')
    
    # Load narration configuration
    config_path = "updated_narration.yaml"
    if not os.path.exists(config_path):
        print(f"❌ Configuration file not found: {config_path}")
        print("Please make sure updated_narration.yaml exists in the current directory.")
        sys.exit(1)
    
    narration_config = load_narration_config(config_path)
    
    # Generate dialogue for all scenes
    successful_generations, failed_generations = generate_all_dialogue(narration_config)
    
    if successful_generations:
        # Create merged audio file
        merged_file = create_merged_audio_file(successful_generations)
        
        if merged_file:
            print(f"\n🎉 Updated dialogue generation complete!")
            print(f"📁 Individual files: audio/vo/")
            print(f"🔊 Merged file: {merged_file}")
            print(f"\n💡 Next steps:")
            print(f"   • Review the generated audio files")
            print(f"   • Update timeline.yaml with the new audio paths")
            print(f"   • Run video assembly with: pnpm run assemble")
        else:
            print(f"\n⚠️  Dialogue generated but merge failed")
    else:
        print(f"\n❌ No dialogue was generated successfully")
        sys.exit(1)

if __name__ == "__main__":
    main()
