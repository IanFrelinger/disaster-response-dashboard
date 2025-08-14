#!/usr/bin/env python3
"""
Simple Voice Test Script
Tests the cloned voice using the same pattern as the working TTS providers.
"""

import os
from dotenv import load_dotenv
from elevenlabs import client

def main():
    """Test the cloned voice"""
    print("🎤 Simple Voice Test")
    print("=" * 30)
    
    # Load environment
    load_dotenv('config.env')
    
    voice_id = os.getenv('ELEVEN_VOICE_ID')
    api_key = os.getenv('ELEVEN_API_KEY')
    
    if not voice_id:
        print("❌ ELEVEN_VOICE_ID not found in config.env")
        return
    
    if not api_key:
        print("❌ ELEVEN_API_KEY not found in config.env")
        return
    
    print(f"🔑 Using Voice ID: {voice_id}")
    print(f"🔑 API Key: {api_key[:20]}...")
    
    # Test text
    test_text = "Hello, this is a test of my cloned voice for the disaster response dashboard demo."
    
    print(f"\n📝 Test Text: {test_text}")
    print("\n🎤 Generating test audio...")
    
    try:
        # Create client (same pattern as working script)
        elevenlabs_client = client.ElevenLabs(api_key=api_key)
        
        # Generate audio with cloned voice
        audio = elevenlabs_client.text_to_speech.convert(
            text=test_text,
            voice_id=voice_id,
            model_id="eleven_monolingual_v1",
            voice_settings={
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        )
        
        # Save test audio
        test_file = f"test_cloned_voice_{voice_id}.wav"
        
        # Handle generator response
        if hasattr(audio, '__iter__'):
            # If it's a generator, collect all chunks
            audio_data = b''.join(audio)
        else:
            audio_data = audio
            
        with open(test_file, 'wb') as f:
            f.write(audio_data)
        
        print(f"✅ Test audio generated successfully!")
        print(f"📁 File saved as: {test_file}")
        print(f"🔊 Listen to this file to verify your cloned voice quality")
        print(f"\n💡 If the voice sounds good, you can now regenerate all dialogue with:")
        print(f"   python generate_new_dialogue.py")
        
    except Exception as e:
        print(f"❌ Error generating test audio: {e}")
        print(f"   This might indicate an issue with the voice ID or API key")

if __name__ == "__main__":
    main()
