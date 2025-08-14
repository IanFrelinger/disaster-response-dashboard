#!/usr/bin/env python3
"""
Find Cloned Voice Script
Lists all available voices from ElevenLabs account, including cloned voices.
"""

import os
import sys
from dotenv import load_dotenv

try:
    from elevenlabs import client
except ImportError:
    print("❌ ElevenLabs library not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "elevenlabs"])
    from elevenlabs import client

def load_environment():
    """Load environment variables from config.env"""
    load_dotenv('config.env')
    
    api_key = os.getenv('ELEVEN_API_KEY')
    if not api_key:
        print("❌ ELEVEN_API_KEY not found in config.env")
        sys.exit(1)
    
    return api_key

def list_all_voices(api_key):
    """List all available voices from ElevenLabs account"""
    try:
        # Create client
        elevenlabs_client = client.ElevenLabs(api_key=api_key)
        
        # Get all voices
        voices = elevenlabs_client.voices.get_all()
        
        print("🎤 Available Voices in Your ElevenLabs Account:")
        print("=" * 80)
        print(f"Debug: API returned {len(voices)} voices")
        if voices:
            print(f"Debug: First voice object type: {type(voices[0])}")
            print(f"Debug: First voice attributes: {dir(voices[0])}")
            print()
        
        cloned_voices = []
        default_voices = []
        
        for voice in voices:
            # Handle different response formats
            if hasattr(voice, 'voice_id'):
                voice_id = voice.voice_id
            elif hasattr(voice, 'id'):
                voice_id = voice.id
            else:
                voice_id = str(voice)
            
            voice_info = {
                'id': voice_id,
                'name': getattr(voice, 'name', 'Unknown'),
                'category': getattr(voice, 'category', 'Unknown'),
                'description': getattr(voice, 'description', 'No description'),
                'cloned': getattr(voice, 'category', '') == 'cloned'
            }
            
            if voice.category == 'cloned':
                cloned_voices.append(voice_info)
            else:
                default_voices.append(voice_info)
        
        # Display cloned voices first (most important)
        if cloned_voices:
            print("\n🔴 CLONED VOICES (Your Personal Voice):")
            print("-" * 50)
            for voice in cloned_voices:
                print(f"🎯 Voice ID: {voice['id']}")
                print(f"   Name: {voice['name']}")
                print(f"   Description: {voice['description']}")
                print()
        
        # Display default voices
        if default_voices:
            print("\n🔵 DEFAULT VOICES:")
            print("-" * 30)
            for voice in default_voices:
                print(f"🎵 Voice ID: {voice['id']}")
                print(f"   Name: {voice['name']}")
                print(f"   Description: {voice['description']}")
                print()
        
        # Summary
        print("=" * 80)
        print(f"📊 Total Voices: {len(voices)}")
        print(f"🔴 Cloned Voices: {len(cloned_voices)}")
        print(f"🔵 Default Voices: {len(default_voices)}")
        
        if cloned_voices:
            print(f"\n💡 To use your cloned voice, update config.env with:")
            print(f"   ELEVEN_VOICE_ID={cloned_voices[0]['id']}")
            print(f"\n   Then regenerate audio with: python generate_new_dialogue.py")
        
        return voices
        
    except Exception as e:
        print(f"❌ Error accessing ElevenLabs API: {e}")
        return None

def test_voice(api_key, voice_id):
    """Test a specific voice with a short sample"""
    try:
        from elevenlabs import text_to_speech, save
        
        print(f"\n🎤 Testing Voice ID: {voice_id}")
        print("Generating test audio...")
        
        # Generate a short test
        audio = text_to_speech(
            text="Hello, this is a test of my cloned voice for the disaster response dashboard demo.",
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        # Save test audio
        test_file = f"test_voice_{voice_id}.wav"
        save(audio, test_file)
        
        print(f"✅ Test audio saved as: {test_file}")
        print(f"🔊 Listen to this file to verify the voice quality")
        
        return test_file
        
    except Exception as e:
        print(f"❌ Error testing voice: {e}")
        return None

def main():
    """Main function"""
    print("🎤 ElevenLabs Voice Discovery Tool")
    print("=" * 50)
    
    # Load environment
    api_key = load_environment()
    
    # List all voices
    voices = list_all_voices(api_key)
    
    if voices:
        # Ask if user wants to test a specific voice
        print(f"\n🤔 Would you like to test a specific voice?")
        print("Enter a voice ID to test, or press Enter to skip:")
        
        test_voice_id = input("Voice ID: ").strip()
        
        if test_voice_id:
            test_voice(api_key, test_voice_id)
    
    print(f"\n✨ Voice discovery complete!")

if __name__ == "__main__":
    main()
