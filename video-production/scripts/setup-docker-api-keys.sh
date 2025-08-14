#!/bin/bash

# Docker API Keys Setup Script
# This script helps configure API keys for the video production pipeline

set -e

echo "🐳 Docker API Keys Setup for Video Production Pipeline"
echo "======================================================"
echo ""

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "📋 Creating config.env from template..."
    if [ -f "config.env.example" ]; then
        cp config.env.example config.env
        echo "✅ config.env created from template"
    else
        echo "❌ config.env.example not found. Please create config.env manually."
        exit 1
    fi
else
    echo "✅ config.env already exists"
fi

echo ""
echo "🔑 Please configure the following API keys in config.env:"
echo ""

# Check current configuration
echo "📊 Current API Key Status:"
echo "---------------------------"

# ElevenLabs
if grep -q "ELEVEN_API_KEY=your_elevenlabs_api_key_here" config.env; then
    echo "❌ ELEVEN_API_KEY: Not configured"
else
    echo "✅ ELEVEN_API_KEY: Configured"
fi

# OpenAI
if grep -q "OPENAI_API_KEY=your_openai_api_key_here" config.env; then
    echo "❌ OPENAI_API_KEY: Not configured"
else
    echo "✅ OPENAI_API_KEY: Configured"
fi

# Azure
if grep -q "AZURE_SPEECH_KEY=your_azure_speech_key_here" config.env; then
    echo "❌ AZURE_SPEECH_KEY: Not configured"
else
    echo "✅ AZURE_SPEECH_KEY: Configured"
fi

# Loudly
if grep -q "LOUDLY_API_KEY=your_loudly_api_key_here" config.env; then
    echo "❌ LOUDLY_API_KEY: Not configured"
else
    echo "✅ LOUDLY_API_KEY: Configured"
fi

echo ""
echo "📝 To configure API keys:"
echo "1. Edit config.env file with your actual API keys"
echo "2. Save the file"
echo "3. Run: docker-compose restart"
echo "4. Validate with: docker-compose exec video-pipeline npm run validate:api"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Please start Docker first."
    exit 1
fi

# Check if container exists
if docker ps -a --format "table {{.Names}}" | grep -q "disaster-response-video-pipeline"; then
    echo "🐳 Container exists. Current status:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "disaster-response-video-pipeline"
    
    echo ""
    echo "🔄 To restart container with new config:"
    echo "   docker-compose restart"
    
    echo ""
    echo "🔍 To check container logs:"
    echo "   docker-compose logs video-pipeline"
    
    echo ""
    echo "✅ To validate API keys:"
    echo "   docker-compose exec video-pipeline npm run validate:api"
else
    echo "🐳 Container not found. To start:"
    echo "   docker-compose up -d"
fi

echo ""
echo "📚 For detailed setup instructions, see: DOCKER_API_KEYS_GUIDE.md"
echo ""

# Offer to open config.env in editor
if command -v code >/dev/null 2>&1; then
    read -p "💻 Open config.env in VS Code? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        code config.env
    fi
elif command -v nano >/dev/null 2>&1; then
    read -p "💻 Open config.env in nano? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano config.env
    fi
fi

echo ""
echo "🎯 Next steps:"
echo "1. Configure API keys in config.env"
echo "2. Restart Docker container"
echo "3. Run validation: npm run validate:api"
echo "4. Test TTS: npm run narrate:eleven (or other provider)"
echo ""
