#!/usr/bin/env python3
"""
Test ElevenLabs TTS with cloned voice
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

# Load environment variables from config.env
load_dotenv('config.env')

# Load environment variables from config.env
def load_env_file():
    """Load environment variables from config.env file"""
    env_file = Path(__file__).parent.parent / "config.env"
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

# Load environment variables
load_env_file()

def test_elevenlabs_connection():
    """Test basic ElevenLabs connection and voice access"""
    try:
        from elevenlabs import client
        
        # Get API key from environment
        api_key = os.getenv('ELEVEN_API_KEY')
        if not api_key:
            print("❌ ELEVEN_API_KEY not found in environment")
            return False
            
        # Get voice ID from environment
        voice_id = os.getenv('ELEVEN_VOICE_ID')
        if not voice_id:
            print("❌ ELEVEN_VOICE_ID not found in environment")
            return False
            
        print(f"🔑 API Key: {api_key[:10]}...")
        print(f"🎤 Voice ID: {voice_id}")
        
        # Create client
        eleven_client = client.ElevenLabs(api_key=api_key)
        
        # Test voice access
        try:
            voice = eleven_client.voices.get(voice_id)
            print(f"✅ Voice found: {voice.name}")
            print(f"   Description: {voice.description}")
            print(f"   Labels: {voice.labels}")
            return True
        except Exception as e:
            print(f"❌ Error accessing voice: {e}")
            return False
            
    except ImportError:
        print("❌ ElevenLabs package not installed. Run: pip install elevenlabs")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_tts_generation():
    """Test TTS generation with a simple text"""
    try:
        from tts_providers import ElevenLabsTTS
        
        # Test configuration
        config = {
            'voice_id': os.getenv('ELEVEN_VOICE_ID'),
            'stability': 0.5,
            'similarity_boost': 0.75
        }
        
        print("\n🎤 Testing TTS generation...")
        
        # Create TTS provider
        tts = ElevenLabsTTS(config)
        
        # Test text
        test_text = "Hello, this is a test of the ElevenLabs text-to-speech system with my cloned voice."
        
        # Generate audio
        audio_path = tts.generate_audio(
            text=test_text,
            scene_id="test",
            scene_title="Test Scene",
            duration=5,
            scene_index=0
        )
        
        if audio_path and Path(audio_path).exists():
            print(f"✅ Test audio generated: {audio_path}")
            
            # Get duration
            duration = tts.get_audio_duration(audio_path)
            print(f"   Duration: {duration:.2f} seconds")
            
            return True
        else:
            print("❌ Test audio generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Error in TTS generation test: {e}")
        return False

def main():
    print("🧪 ElevenLabs TTS Test")
    print("=" * 40)
    
    # Test connection
    if not test_elevenlabs_connection():
        print("\n❌ Connection test failed")
        sys.exit(1)
        
    # Test TTS generation
    if not test_tts_generation():
        print("\n❌ TTS generation test failed")
        sys.exit(1)
        
    print("\n✅ All tests passed!")
    print("🎤 ElevenLabs TTS is ready to use with your cloned voice")

if __name__ == "__main__":
    main()
