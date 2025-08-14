#!/usr/bin/env python3
"""
TTS Providers Script - Multi-provider Text-to-Speech generation
Supports OpenAI, ElevenLabs, Azure Speech Services, and local Piper TTS
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any
import yaml
import requests
from datetime import datetime

# Try to import TTS libraries
try:
    import openai
except ImportError:
    openai = None

try:
    from elevenlabs import text_to_speech, save
    from elevenlabs import client
except ImportError:
    text_to_speech = save = client = None

try:
    import azure.cognitiveservices.speech as speechsdk
except ImportError:
    speechsdk = None

class TTSProvider:
    """Base class for TTS providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.output_dir = Path("audio/vo")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_audio(self, text: str, scene_id: str, scene_title: str, duration: int, scene_index: int) -> Optional[str]:
        """Generate audio for a scene"""
        raise NotImplementedError
        
    def get_audio_duration(self, audio_path: str) -> float:
        """Get duration of generated audio file"""
        try:
            result = subprocess.run([
                'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                '-of', 'csv=p=0', audio_path
            ], capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
        except (subprocess.CalledProcessError, ValueError):
            return 0.0
    
    def _get_shot_number(self, scene_id: str, scene_index: int) -> int:
        """Get sequential shot number for a scene"""
        # Return the scene index + 1 for sequential numbering (1, 2, 3, etc.)
        return scene_index + 1

class OpenAITTS(TTSProvider):
    """OpenAI TTS provider using gpt-4o-mini-tts"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        if not openai:
            raise ImportError("OpenAI library not installed. Run: pip install openai")
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        self.client = openai.OpenAI(api_key=api_key)
        self.voice = config.get('voice', 'alloy')
        self.speed = config.get('speed', 1.0)
        
    def generate_audio(self, text: str, scene_id: str, scene_title: str, duration: int, scene_index: int) -> Optional[str]:
        """Generate audio using OpenAI TTS"""
        try:
            # Create filename with shot number and scene title (sanitized for filesystem)
            safe_title = "".join(c for c in scene_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_title = safe_title.replace(' ', '-').lower()
            # Get sequential shot number
            shot_number = self._get_shot_number(scene_id, scene_index)
            output_path = self.output_dir / f"shot-{shot_number:02d}-{scene_id}-{safe_title}.wav"
            
            response = self.client.audio.speech.create(
                model="gpt-4o-mini-tts",
                voice=self.voice,
                input=text,
                speed=self.speed
            )
            
            # Save the audio
            response.stream_to_file(str(output_path))
            
            # Verify file was created
            if output_path.exists():
                print(f"✅ Generated OpenAI TTS: {output_path}")
                return str(output_path)
            else:
                print(f"❌ Failed to save OpenAI TTS: {output_path}")
                return None
                
        except Exception as e:
            print(f"❌ OpenAI TTS error: {e}")
            return None

class ElevenLabsTTS(TTSProvider):
    """ElevenLabs TTS provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        if not text_to_speech:
            raise ImportError("ElevenLabs library not installed. Run: pip install elevenlabs")
        
        api_key = os.getenv('ELEVEN_API_KEY')
        if not api_key:
            raise ValueError("ELEVEN_API_KEY environment variable not set")
        
        # Create client with API key
        self.client = client.ElevenLabs(api_key=api_key)
        self.voice_id = config.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
        self.stability = config.get('stability', 0.5)
        self.similarity_boost = config.get('similarity_boost', 0.75)
        
    def generate_audio(self, text: str, scene_id: str, scene_title: str, duration: int, scene_index: int) -> Optional[str]:
        """Generate audio using ElevenLabs TTS"""
        try:
            # Create filename with shot number and scene title (sanitized for filesystem)
            safe_title = "".join(c for c in scene_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_title = safe_title.replace(' ', '-').lower()
            # Get sequential shot number
            shot_number = self._get_shot_number(scene_id, scene_index)
            output_path = self.output_dir / f"shot-{shot_number:02d}-{scene_id}-{safe_title}.wav"
            
            # Use the client to generate audio
            audio = self.client.text_to_speech.convert(
                text=text,
                voice_id=self.voice_id,
                model_id="eleven_monolingual_v1",
                voice_settings={
                    "stability": self.stability,
                    "similarity_boost": self.similarity_boost
                }
            )
            
            # Save the audio directly - handle generator response
            if hasattr(audio, '__iter__'):
                # If it's a generator, collect all chunks
                audio_data = b''.join(audio)
            else:
                audio_data = audio
                
            with open(output_path, 'wb') as f:
                f.write(audio_data)
            
            if output_path.exists():
                print(f"✅ Generated ElevenLabs TTS: {output_path}")
                return str(output_path)
            else:
                print(f"❌ Failed to save ElevenLabs TTS: {output_path}")
                return None
                
        except Exception as e:
            print(f"❌ ElevenLabs TTS error: {e}")
            return None

class AzureTTS(TTSProvider):
    """Azure Speech Services TTS provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        if not speechsdk:
            raise ImportError("Azure Speech library not installed. Run: pip install azure-cognitiveservices-speech")
        
        api_key = os.getenv('AZURE_SPEECH_KEY')
        region = os.getenv('AZURE_SPEECH_REGION')
        
        if not api_key or not region:
            raise ValueError("AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables not set")
        
        self.voice = config.get('voice', 'en-US-JennyNeural')
        self.speech_config = speechsdk.SpeechConfig(subscription=api_key, region=region)
        self.speech_config.speech_synthesis_voice_name = self.voice
        
    def generate_audio(self, text: str, scene_id: str, scene_title: str, duration: int, scene_index: int) -> Optional[str]:
        """Generate audio using Azure Speech Services"""
        try:
            # Create filename with shot number and scene title (sanitized for filesystem)
            safe_title = "".join(c for c in scene_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_title = safe_title.replace(' ', '-').lower()
            # Get sequential shot number
            shot_number = self._get_shot_number(scene_id, scene_index)
            output_path = self.output_dir / f"shot-{shot_number:02d}-{scene_id}-{safe_title}.wav"
            
            # Configure audio output
            audio_config = speechsdk.audio.AudioOutputConfig(filename=str(output_path))
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config, 
                audio_config=audio_config
            )
            
            # Synthesize speech
            result = synthesizer.speak_text_async(text).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                print(f"✅ Generated Azure TTS: {output_path}")
                return str(output_path)
            else:
                print(f"❌ Azure TTS failed: {result.reason}")
                return None
                
        except Exception as e:
            print(f"❌ Azure TTS error: {e}")
            return None

class PiperTTS(TTSProvider):
    """Local Piper TTS provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        
        # Check if piper binary is available
        try:
            subprocess.run(['piper', '--version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError("Piper binary not found. Install from: https://github.com/rhasspy/piper")
        
        self.voice = config.get('voice', 'en_US-amy-low.onnx')
        self.model_path = config.get('model_path', f"./voices/{self.voice}")
        self.config_path = config.get('config_path', f"./voices/{self.voice}.json")
        self.speed = config.get('speed', 1.0)
        self.noise_scale = config.get('noise_scale', 0.667)
        self.length_scale = config.get('length_scale', 1.0)
        self.noise_w = config.get('noise_w', 0.8)
        
        # Check if voice files exist
        if not Path(self.model_path).exists():
            raise FileNotFoundError(f"Piper voice model not found: {self.model_path}")
        if not Path(self.config_path).exists():
            raise FileNotFoundError(f"Piper config not found: {self.config_path}")
        
    def generate_audio(self, text: str, scene_id: str, scene_title: str, duration: int, scene_index: int) -> Optional[str]:
        """Generate audio using local Piper TTS"""
        try:
            # Create filename with shot number and scene title (sanitized for filesystem)
            safe_title = "".join(c for c in scene_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_title = safe_title.replace(' ', '-').lower()
            # Get sequential shot number
            shot_number = self._get_shot_number(scene_id, scene_index)
            output_path = self.output_dir / f"shot-{shot_number:02d}-{scene_id}-{safe_title}.wav"
            
            # Run piper command
            cmd = [
                'piper',
                '--model', self.model_path,
                '--config', self.config_path,
                '--output_file', str(output_path),
                '--length_scale', str(self.length_scale),
                '--noise_scale', str(self.noise_scale),
                '--noise_w', str(self.noise_w)
            ]
            
            # Add text input
            result = subprocess.run(cmd, input=text, text=True, capture_output=True, check=True)
            
            if output_path.exists():
                print(f"✅ Generated Piper TTS: {output_path}")
                return str(output_path)
            else:
                print(f"❌ Failed to save Piper TTS: {output_path}")
                return None
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Piper TTS command failed: {e}")
            print(f"Command output: {e.stdout}")
            print(f"Error output: {e.stderr}")
            return None
        except Exception as e:
            print(f"❌ Piper TTS error: {e}")
            return None

class TTSManager:
    """Manages multiple TTS providers and generates voiceover"""
    
    def __init__(self, narration_path: str, timeline_path: str):
        self.narration_path = Path(narration_path)
        self.timeline_path = Path(timeline_path)
        
        # Load configuration
        with open(self.narration_path, 'r') as f:
            self.narration = yaml.safe_load(f)
        
        with open(self.timeline_path, 'r') as f:
            self.timeline = yaml.safe_load(f)
        
        # Initialize provider
        self.provider = self._init_provider()
        
        # Clean up old audio files before starting
        self._cleanup_old_files()
        
    def _init_provider(self) -> TTSProvider:
        """Initialize the TTS provider based on configuration"""
        provider_name = self.narration.get('metadata', {}).get('voice_provider', 'openai')
        provider_config = self.narration.get('voice_providers', {}).get(provider_name, {})
        
        if provider_name == 'openai':
            return OpenAITTS(provider_config)
        elif provider_name == 'elevenlabs':
            return ElevenLabsTTS(provider_config)
        elif provider_name == 'azure':
            return AzureTTS(provider_config)
        elif provider_name == 'piper':
            return PiperTTS(provider_config)
        else:
            raise ValueError(f"Unknown TTS provider: {provider_name}")
    
    def _cleanup_old_files(self):
        """Clean up old audio files before generating new ones"""
        try:
            output_dir = Path("audio/vo")
            if output_dir.exists():
                # Remove all .wav files in the output directory
                for audio_file in output_dir.glob("*.wav"):
                    audio_file.unlink()
                    print(f"🗑️  Removed old file: {audio_file}")
                print("🧹 Cleanup completed - old audio files removed")
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up old files: {e}")
    
    def generate_all_audio(self, fit_to_beat: bool = False) -> List[Dict[str, Any]]:
        """Generate audio for all scenes"""
        print(f"🎤 Generating TTS for {len(self.narration['scenes'])} scenes...")
        
        results = []
        audio_files = []
        
        for scene_index, scene in enumerate(self.narration['scenes']):
            scene_id = scene['id']
            text = scene['narration']
            duration = scene['duration']
            
            print(f"\n🎬 Scene: {scene['title']} ({duration}s)")
            print(f"📝 Text: {text[:100]}{'...' if len(text) > 100 else ''}")
            
            # Generate audio
            audio_path = self.provider.generate_audio(text, scene_id, scene['title'], duration, scene_index)
            
            if audio_path:
                # Get actual duration
                actual_duration = self.provider.get_audio_duration(audio_path)
                
                result = {
                    'scene_id': scene_id,
                    'title': scene['title'],
                    'text': text,
                    'target_duration': duration,
                    'actual_duration': actual_duration,
                    'audio_path': audio_path,
                    'success': True
                }
                
                if fit_to_beat and abs(actual_duration - duration) > 0.5:
                    print(f"⚠️  Duration mismatch: {actual_duration:.1f}s vs {duration}s")
                    # Could implement audio stretching here
                
                results.append(result)
                audio_files.append(audio_path)
                
            else:
                result = {
                    'scene_id': scene_id,
                    'title': scene['title'],
                    'text': text,
                    'target_duration': duration,
                    'actual_duration': 0,
                    'audio_path': None,
                    'success': False
                }
                results.append(result)
        
        # Merge all audio files
        if audio_files:
            merged_path = self._merge_audio_files(audio_files)
            if merged_path:
                print(f"\n🎵 Merged audio saved to: {merged_path}")
        
        # Generate subtitles
        subtitle_path = self._generate_subtitles(results)
        if subtitle_path:
            print(f"📝 Subtitles saved to: {subtitle_path}")
        
        return results
    
    def _merge_audio_files(self, audio_files: List[str]) -> Optional[str]:
        """Merge multiple audio files into one"""
        try:
            output_path = Path("audio/voiceover.wav")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Create file list for FFmpeg
            file_list = Path("temp_audio_files.txt")
            with open(file_list, 'w') as f:
                for audio_file in audio_files:
                    f.write(f"file '{audio_file}'\n")
            
            # Merge using FFmpeg
            cmd = [
                'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
                '-i', str(file_list), '-c', 'copy', str(output_path)
            ]
            
            subprocess.run(cmd, check=True, capture_output=True)
            
            # Clean up
            file_list.unlink()
            
            return str(output_path)
            
        except Exception as e:
            print(f"❌ Failed to merge audio files: {e}")
            return None
    
    def _generate_subtitles(self, results: List[Dict[str, Any]]) -> Optional[str]:
        """Generate SRT subtitle file"""
        try:
            output_path = Path("subs/vo.srt")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            current_time = 0.0
            
            with open(output_path, 'w') as f:
                for i, result in enumerate(results, 1):
                    if not result['success']:
                        continue
                    
                    # Calculate timing
                    start_time = current_time
                    end_time = start_time + result['actual_duration']
                    
                    # Format times as SRT
                    start_str = self._format_srt_time(start_time)
                    end_str = self._format_srt_time(end_time)
                    
                    # Write subtitle entry
                    f.write(f"{i}\n")
                    f.write(f"{start_str} --> {end_str}\n")
                    f.write(f"{result['text']}\n\n")
                    
                    current_time = end_time
            
            return str(output_path)
            
        except Exception as e:
            print(f"❌ Failed to generate subtitles: {e}")
            return None
    
    def _format_srt_time(self, seconds: float) -> str:
        """Format seconds as SRT time string (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def main():
    parser = argparse.ArgumentParser(description="Generate TTS audio for video narration")
    parser.add_argument("narration_yaml", help="Path to narration.yaml file")
    parser.add_argument("timeline_yaml", help="Path to timeline.yaml file")
    parser.add_argument("--provider", choices=['openai', 'elevenlabs', 'azure', 'piper'],
                       help="Override TTS provider")
    parser.add_argument("--fit-to-beat", action="store_true",
                       help="Adjust audio to match beat durations")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")
    
    args = parser.parse_args()
    
    try:
        # Initialize TTS manager
        manager = TTSManager(args.narration_yaml, args.timeline_yaml)
        
        # Override provider if specified
        if args.provider:
            manager.narration['metadata']['voice_provider'] = args.provider
            manager.provider = manager._init_provider()
        
        # Generate audio
        results = manager.generate_all_audio(fit_to_beat=args.fit_to_beat)
        
        # Summary
        successful = sum(1 for r in results if r['success'])
        total = len(results)
        
        print(f"\n🎉 TTS Generation Complete!")
        print(f"✅ Successful: {successful}/{total}")
        print(f"📁 Audio files: audio/vo/")
        print(f"🎵 Merged audio: audio/voiceover.wav")
        print(f"📝 Subtitles: subs/vo.srt")
        
        # Save results
        results_path = Path("out/tts-results.json")
        results_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(results_path, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'provider': manager.narration['metadata']['voice_provider'],
                'total_scenes': total,
                'successful': successful,
                'results': results
            }, f, indent=2)
        
        print(f"📋 Results saved to: {results_path}")
        
    except Exception as e:
        print(f"❌ TTS generation failed: {e}")
        if args.debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
