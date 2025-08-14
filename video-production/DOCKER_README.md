# Docker Setup for Video Pipeline

This document explains how to set up and use the headless video pipeline inside Docker containers.

## 🐳 Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for the container
- 10GB+ free disk space

### 2. Build and Start
```bash
# Build the container
./run-in-container.sh build

# Start the container
./run-in-container.sh start

# Check status
./run-in-container.sh status
```

### 3. Run the Pipeline
```bash
# Run preflight check
./run-in-container.sh preflight

# Generate TTS audio
./run-in-container.sh narrate

# Record screen captures
./run-in-container.sh record

# Assemble video
./run-in-container.sh assemble

# Create final video
./run-in-container.sh final

# Or run the full pipeline
./run-in-container.sh pipeline:full
```

## 📁 Directory Structure

The Docker setup uses volume mounts to persist data:

```
video-production/
├── captures/          # Screen recordings (mounted)
├── audio/            # TTS and music files (mounted)
├── subs/             # Subtitles (mounted)
├── luts/             # Color grading LUTs (mounted)
├── out/              # Final videos (mounted)
├── voices/           # Piper TTS voices (mounted)
├── config.env        # Environment variables
├── narration.yaml    # Voiceover configuration
├── timeline.yaml     # Video timeline
├── record.config.json # Recording configuration
└── run-in-container.sh # Container runner script
```

## ⚙️ Configuration

### Environment Variables
Edit `config.env` to set your API keys:

```bash
# Required for OpenAI TTS
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Other TTS providers
ELEVEN_API_KEY=your_elevenlabs_api_key_here
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus

# Optional: Music generation
LOUDLY_API_KEY=your_loudly_api_key_here
```

### Recording Configuration
Edit `record.config.json` to configure screen recording:

```json
{
  "app": {
    "url": "http://localhost:3000",
    "viewport": {"width": 1920, "height": 1080}
  },
  "beats": [
    {
      "id": "intro",
      "duration": 8,
      "actions": ["waitForSelector('.dashboard')"]
    }
  ]
}
```

## 🚀 Container Commands

### Basic Container Management
```bash
# Build container
./run-in-container.sh build

# Start container
./run-in-container.sh start

# Stop container
./run-in-container.sh stop

# Restart container
./run-in-container.sh restart

# Show status
./run-in-container.sh status

# Show logs
./run-in-container.sh logs

# Enter shell
./run-in-container.sh shell
```

### Pipeline Commands
```bash
# Preflight check
./run-in-container.sh preflight

# Generate TTS (OpenAI)
./run-in-container.sh narrate

# Record screen captures
./run-in-container.sh record

# Assemble video
./run-in-container.sh assemble

# Create final video
./run-in-container.sh final

# Full pipeline
./run-in-container.sh pipeline:full

# Local pipeline (no upload)
./run-in-container.sh pipeline:local
```

### Custom Commands
```bash
# Run any command in the container
./run-in-container.sh run "npm run help"
./run-in-container.sh run "python3 scripts/tts_providers.py --help"
./run-in-container.sh run "ffmpeg -version"
```

## 🔧 Advanced Usage

### Manual Docker Commands
```bash
# Build manually
docker-compose build

# Start manually
docker-compose up -d

# Run command manually
docker exec -it disaster-response-video-pipeline bash

# View logs manually
docker logs -f disaster-response-video-pipeline
```

### Development Mode
For development, you can mount the source code:

```yaml
# In docker-compose.yml, add:
volumes:
  - .:/app
  - /app/node_modules
```

### GPU Support
To enable GPU acceleration (optional):

```yaml
# In docker-compose.yml, uncomment:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check Docker logs
docker-compose logs

# Check system resources
docker system df
```

**Permission issues:**
```bash
# Fix file permissions
chmod +x run-in-container.sh
chmod +x scripts/*.py scripts/*.js scripts/*.ts
```

**API key errors:**
```bash
# Check environment variables
./run-in-container.sh run "env | grep API"
```

**FFmpeg not found:**
```bash
# Check FFmpeg installation
./run-in-container.sh run "ffmpeg -version"
```

### Debug Mode
```bash
# Enter container shell for debugging
./run-in-container.sh shell

# Inside container:
npm run preflight
python3 scripts/tts_providers.py --debug
```

### Resource Issues
If the container runs out of memory:

```bash
# Increase memory limit in docker-compose.yml
mem_limit: 8g  # Increase from 4g to 8g
```

## 📊 Monitoring

### Container Health
```bash
# Check container health
docker ps --filter "name=disaster-response-video-pipeline"

# View resource usage
docker stats disaster-response-video-pipeline
```

### Output Monitoring
```bash
# Monitor output directory
watch -n 1 "ls -la out/"

# Monitor captures
watch -n 1 "ls -la captures/"
```

## 🔒 Security

### Best Practices
- Never commit API keys to version control
- Use environment variables for sensitive data
- Run container as non-root user (already configured)
- Regularly update base images

### Network Security
The container runs in an isolated network by default. No ports are exposed unless needed.

## 📈 Performance

### Optimization Tips
- Use SSD storage for better I/O performance
- Allocate sufficient RAM (4GB+ recommended)
- Use GPU acceleration if available
- Close other applications during video processing

### Resource Requirements
- **CPU**: 2 cores minimum, 4+ recommended
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 10GB+ free space
- **Network**: Stable internet for API calls

## 🔄 Updates

### Updating the Container
```bash
# Pull latest changes
git pull

# Rebuild container
./run-in-container.sh build

# Restart with new image
./run-in-container.sh restart
```

### Updating Dependencies
```bash
# Update Node.js dependencies
./run-in-container.sh run "npm update"

# Update Python dependencies
./run-in-container.sh run "pip install --upgrade -r requirements.txt"
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Playwright Documentation](https://playwright.dev/)

## 🆘 Support

For issues with the Docker setup:

1. Check the troubleshooting section above
2. Review container logs: `./run-in-container.sh logs`
3. Run preflight check: `./run-in-container.sh preflight`
4. Check system resources and Docker status
5. Open an issue with detailed error information

---

**Ready to create videos? Start with: `./run-in-container.sh build && ./run-in-container.sh start`**
