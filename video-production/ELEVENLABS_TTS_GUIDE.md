# ElevenLabs TTS Integration Guide

This guide explains how to use the updated video production pipeline with ElevenLabs text-to-speech and your cloned voice.

## Overview

The video production pipeline has been updated to use ElevenLabs TTS with your cloned voice instead of the previous macOS-based TTS system. This provides:

- **Higher quality audio** with natural-sounding speech
- **Your cloned voice** for consistent branding
- **Better control** over voice parameters (stability, similarity boost)
- **Cross-platform compatibility** (no longer requires macOS)

## Configuration

### 1. API Keys Setup

Your ElevenLabs configuration is already set up in `config.env`:

```bash
ELEVEN_API_KEY=sk_4d41ada97b972ca77216d2408852056d3f140cb4ad9aa581
ELEVEN_VOICE_ID=LIpBYrITLsIquxoXdSkr
```

### 2. Narration Configuration

The narration is configured in `narration.yaml`:

```yaml
metadata:
  voice_provider: "elevenlabs"  # Set to use ElevenLabs
  voice_settings:
    speed: 1.0
    pitch: 0
    volume: 1.0

voice_providers:
  elevenlabs:
    voice_id: "LIpBYrITLsIquxoXdSkr"  # Your cloned voice ID
    stability: 0.5
    similarity_boost: 0.75
```

## Usage

### 1. Test the Integration

Before generating the full narration, test that everything is working:

```bash
cd video-production
./scripts/test-elevenlabs.sh
```

This will:
- Verify your API key and voice ID
- Test a simple TTS generation
- Create a test audio file in `audio/vo/`

### 2. Generate Full Narration

Generate TTS audio for all scenes in the narration:

```bash
cd video-production
./scripts/run-tts-generator.sh
```

This will:
- Read the `narration.yaml` configuration
- Generate WAV audio files for each scene
- Save files to `audio/vo/` with sequential naming
- Create a detailed report in `audio/vo/narration-tts-report.json`

### 3. Manual Generation

You can also run the TTS generator manually:

```bash
cd video-production
python3 scripts/generate-narration-tts.py --config narration.yaml
```

## Voice Parameters

### Stability (0.0 - 1.0)
- **Lower values (0.0-0.3)**: More expressive, less consistent
- **Higher values (0.7-1.0)**: More consistent, less expressive
- **Recommended**: 0.5 for balanced performance

### Similarity Boost (0.0 - 1.0)
- **Lower values (0.0-0.3)**: Less similar to original voice
- **Higher values (0.7-1.0)**: More similar to original voice
- **Recommended**: 0.75 for good voice cloning

### Speed (0.25 - 4.0)
- **1.0**: Normal speed
- **< 1.0**: Slower speech
- **> 1.0**: Faster speech

## File Structure

Generated audio files follow this naming convention:

```
audio/vo/
├── shot-01-intro-dashboard-overview.wav
├── shot-02-hazards-multi-hazard-map.wav
├── shot-03-routes-evacuation-routes.wav
├── ...
└── narration-tts-report.json
```

## Troubleshooting

### Common Issues

1. **API Key Error**
   ```
   ❌ ELEVEN_API_KEY not found in environment
   ```
   - Check that `config.env` exists and contains your API key
   - Verify the API key is valid in your ElevenLabs account

2. **Voice ID Error**
   ```
   ❌ Error accessing voice: Voice not found
   ```
   - Verify your voice ID in the ElevenLabs dashboard
   - Ensure the voice is accessible with your API key

3. **Package Import Error**
   ```
   ❌ ElevenLabs package not installed
   ```
   - Install the package: `pip install elevenlabs`
   - Or install all requirements: `pip install -r requirements.txt`

4. **Audio Generation Failed**
   ```
   ❌ Test audio generation failed
   ```
   - Check your internet connection
   - Verify your ElevenLabs account has sufficient credits
   - Check the API response for specific error messages

### Debug Mode

For detailed debugging, you can run the test with verbose output:

```bash
cd video-production
python3 -v scripts/test-elevenlabs-tts.py
```

## Integration with Video Pipeline

The generated audio files are automatically integrated with the video pipeline:

1. **Beat Sync**: Audio files are used in `sync-beats.ts`
2. **Video Assembly**: Audio is combined with video in assembly scripts
3. **Final Presentation**: Audio is included in the final video output

## Customization

### Adding New Scenes

To add new scenes, edit `narration.yaml`:

```yaml
scenes:
  - id: "new-scene"
    title: "New Scene Title"
    duration: 10
    narration: "Your narration text here."
    voice: "alloy"  # Optional: override voice per scene
```

### Changing Voice Settings

Modify voice parameters in `narration.yaml`:

```yaml
voice_providers:
  elevenlabs:
    voice_id: "LIpBYrITLsIquxoXdSkr"
    stability: 0.6        # More stable
    similarity_boost: 0.8 # More similar to original
```

### Using Different Voices

You can switch between different ElevenLabs voices by changing the `voice_id`:

```yaml
voice_providers:
  elevenlabs:
    voice_id: "21m00Tcm4TlvDq8ikWAM"  # Rachel voice
    # or
    voice_id: "EXAVITQu4vr4xnSDxMaL"  # Bella voice
```

## Performance Tips

1. **Batch Processing**: The pipeline processes all scenes in sequence
2. **Caching**: Generated audio files are cached and won't be regenerated
3. **Error Recovery**: Failed scenes are reported but don't stop the pipeline
4. **Quality Control**: Review generated audio files before video assembly

## Next Steps

After generating TTS audio:

1. **Review Audio Quality**: Listen to generated files in `audio/vo/`
2. **Adjust Timing**: Modify scene durations in `narration.yaml` if needed
3. **Video Assembly**: Run the video assembly pipeline
4. **Final Review**: Check the complete video with synchronized audio

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the generation report in `audio/vo/narration-tts-report.json`
3. Test with the ElevenLabs test script
4. Verify your ElevenLabs account status and credits
