#!/usr/bin/env python3
"""
Generate TTS Audio for Refined Timeline
Creates audio files for the 5-minute refined timeline using ElevenLabs
"""

import os
import sys
import yaml
from pathlib import Path

# Add the current directory to the path so we can import tts_providers
sys.path.append(str(Path(__file__).parent))

from tts_providers import TTSManager

def generate_refined_timeline_audio():
    """Generate TTS audio for the refined timeline"""
    
    print("🎤 Generating TTS Audio for Refined Timeline")
    print("============================================")
    
    # Paths
    narration_file = "../timeline-5-minute-refined-narration.yaml"
    timeline_file = "../timeline-5-minute-refined.yaml"
    
    # Check if files exist
    if not Path(narration_file).exists():
        print(f"❌ Narration file not found: {narration_file}")
        return False
    
    if not Path(timeline_file).exists():
        print(f"❌ Timeline file not found: {timeline_file}")
        return False
    
    print(f"✅ Found narration file: {narration_file}")
    print(f"✅ Found timeline file: {timeline_file}")
    print("")
    
    try:
        # Initialize TTS manager
        print("🔧 Initializing TTS Manager...")
        tts_manager = TTSManager(narration_file, timeline_file)
        
        # Generate all audio
        print("🎵 Generating audio files...")
        results = tts_manager.generate_all_audio(fit_to_beat=True)
        
        # Report results
        print("\n📊 Generation Results:")
        print("=====================")
        
        successful = 0
        total_duration = 0
        
        for result in results:
            if result['success']:
                successful += 1
                total_duration += result['actual_duration']
                print(f"✅ {result['title']}: {result['actual_duration']:.1f}s")
            else:
                print(f"❌ {result['title']}: Failed")
        
        print(f"\n📈 Summary:")
        print(f"   • Successful: {successful}/{len(results)}")
        print(f"   • Total duration: {total_duration:.1f}s ({int(total_duration//60)}:{int(total_duration%60):02d})")
        
        if successful == len(results):
            print("🎉 All audio files generated successfully!")
            return True
        else:
            print("⚠️  Some audio files failed to generate")
            return False
            
    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        return False

def main():
    """Main function"""
    success = generate_refined_timeline_audio()
    
    if success:
        print("\n🎯 Next Steps:")
        print("   1. Audio files are ready in audio/vo/")
        print("   2. Run video creation script to combine with visuals")
        print("   3. Final video will be timeline-5-minute-refined-final.mp4")
    else:
        print("\n❌ Audio generation failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
