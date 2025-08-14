# Docker API Keys Setup Guide

This guide explains how to configure API keys for the video production pipeline when running in Docker containers.

## Quick Start

1. **Copy the example configuration:**
   ```bash
   cp config.env.example config.env
   ```

2. **Edit config.env with your actual API keys:**
   ```bash
   # Required for TTS (choose one)
   ELEVEN_API_KEY=your_actual_elevenlabs_key_here
   OPENAI_API_KEY=your_actual_openai_key_here
   AZURE_SPEECH_KEY=your_actual_azure_key_here
   
   # Required for music generation
   LOUDLY_API_KEY=your_actual_loudly_key_here
   ```

3. **Restart the container:**
   ```bash
   docker-compose restart
   ```

4. **Validate the keys:**
   ```bash
   docker-compose exec video-pipeline npm run validate:api
   ```

## API Key Requirements

### Text-to-Speech (Required - choose one)

| Service | Key Format | Required Fields |
|---------|------------|-----------------|
| **ElevenLabs** | 40+ characters | `ELEVEN_API_KEY`, `ELEVEN_VOICE_ID` |
| **OpenAI** | `sk-` + 51 chars | `OPENAI_API_KEY` |
| **Azure Speech** | 32 characters | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` |
| **Piper (Local)** | None | No API key needed |

### Music Generation (Required)

| Service | Key Format | Required Fields |
|---------|------------|-----------------|
| **Loudly** | 10+ characters | `LOUDLY_API_KEY` |

### Optional Services

| Service | Key Format | Purpose |
|---------|------------|---------|
| **Mubert** | Variable | Alternative music generation |
| **Stability AI** | Variable | Alternative music generation |

## Docker Configuration Methods

### Method 1: Environment File (Recommended)

1. **Edit config.env on host machine**
2. **Mount in docker-compose.yml:**
   ```yaml
   env_file:
     - config.env
   ```
3. **Restart container**

### Method 2: Direct Environment Variables

Add to docker-compose.yml:
```yaml
environment:
  - ELEVEN_API_KEY=your_key_here
  - OPENAI_API_KEY=your_key_here
  - LOUDLY_API_KEY=your_key_here
```

### Method 3: Host Environment Variables

Pass from host to container:
```bash
export ELEVEN_API_KEY=your_key_here
docker-compose up
```

## Validation Commands

### Inside Container
```bash
# Validate all API keys
npm run validate:api

# Check preflight status
npm run preflight

# Test specific TTS provider
npm run narrate:eleven
npm run narrate:openai
npm run narrate:azure
```

### From Host
```bash
# Execute commands in running container
docker-compose exec video-pipeline npm run validate:api

# Run container with validation
docker-compose run --rm video-pipeline npm run validate:api
```

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check config.env file exists and has correct keys
   - Ensure container is restarted after config changes
   - Verify key format matches requirements

2. **"Invalid API key (401 Unauthorized)"**
   - Verify API key is correct and active
   - Check account status and billing
   - Ensure key has proper permissions

3. **"Network error"**
   - Check container internet connectivity
   - Verify firewall/proxy settings
   - Test API endpoints from host machine

### Debug Steps

1. **Check container logs:**
   ```bash
   docker-compose logs video-pipeline
   ```

2. **Inspect environment:**
   ```bash
   docker-compose exec video-pipeline env | grep -E "(ELEVEN|OPENAI|AZURE|LOUDLY)"
   ```

3. **Test API connectivity:**
   ```bash
   docker-compose exec video-pipeline curl -I https://api.elevenlabs.io/v1/voices
   ```

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use .env files for local development**
3. **Rotate keys regularly**
4. **Use least-privilege API keys**
5. **Monitor API usage and costs**

## Environment File Template

```bash
# Copy and customize this template
cp config.env.example config.env

# Required for TTS (choose one)
ELEVEN_API_KEY=your_elevenlabs_api_key_here
ELEVEN_VOICE_ID=21m00Tcm4TlvDq8ikWAM

OPENAI_API_KEY=your_openai_api_key_here

AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus

# Required for music generation
LOUDLY_API_KEY=your_loudly_api_key_here

# Optional
MUBERT_TOKEN=your_mubert_token_here
STABILITY_API_KEY=your_stability_api_key_here
```

## Next Steps

After configuring API keys:

1. **Run validation:** `npm run validate:api`
2. **Test TTS:** `npm run narrate:eleven` (or other provider)
3. **Test music:** `npm run genmusic`
4. **Full pipeline:** `npm run pipeline:full`

## Support

- Check validation reports in `out/api-key-validation-report.json`
- Review container logs for detailed error messages
- Ensure all required dependencies are installed
- Verify network connectivity from container
