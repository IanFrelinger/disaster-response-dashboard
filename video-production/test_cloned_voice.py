#!/usr/bin/env python3
"""
Test Cloned Voice Script
Tests the cloned voice with a short sample to verify quality and functionality.
"""

import os
from dotenv import load_dotenv
from elevenlabs import text_to_speech, save

def main():
    """Test the cloned voice"""
    print("🎤 Testing Your Cloned Voice")
    print("=" * 40)
    
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
    test_text = "Hello, this is a test of my cloned voice for the disaster response dashboard demo. I'm excited to share this project with you."
    
    print(f"\n📝 Test Text: {test_text}")
    print("\n🎤 Generating test audio...")
    
    try:
        # Generate audio with cloned voice
        audio = text_to_speech(
            text=test_text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        # Save test audio
        test_file = f"test_cloned_voice_{voice_id}.wav"
        save(audio, test_file)
        
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
