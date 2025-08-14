# 🔑 API Key Setup - Direct Links & Step-by-Step Guide

This guide provides direct links to all the services you need to set up API keys for the video production pipeline.

## 🎤 Text-to-Speech Services (Choose One)

### 1. **ElevenLabs** (Recommended for high-quality voices)
- **Website**: https://elevenlabs.io/
- **Sign Up**: https://elevenlabs.io/sign-up
- **API Keys**: https://elevenlabs.io/app/api-keys
- **Setup Steps**:
  1. Create account at ElevenLabs
  2. Go to Profile → API Keys
  3. Generate new API key
  4. Copy the key (40+ characters)
  5. Add to `config.env`: `ELEVEN_API_KEY=your_key_here`

### 2. **OpenAI** (GPT-4 TTS)
- **Website**: https://openai.com/
- **Sign Up**: https://platform.openai.com/signup
- **API Keys**: https://platform.openai.com/api-keys
- **Setup Steps**:
  1. Create OpenAI account
  2. Add billing information (credit card required)
  3. Go to API Keys section
  4. Create new secret key
  5. Copy the key (starts with `sk-`, 51 characters)
  6. Add to `config.env`: `OPENAI_API_KEY=your_key_here`

### 3. **Azure Speech Services**
- **Website**: https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/
- **Portal**: https://portal.azure.com/
- **Setup Steps**:
  1. Sign in to Azure Portal
  2. Create new Speech Service resource
  3. Go to Keys and Endpoint
  4. Copy Key 1 or Key 2 (32 characters)
  5. Note the Region (e.g., eastus, westus)
  6. Add to `config.env`:
     ```
     AZURE_SPEECH_KEY=your_key_here
     AZURE_SPEECH_REGION=your_region_here
     ```

## 🎵 Music Generation Services

### 4. **Loudly** (Required for music generation)
- **Website**: https://www.loudly.com/
- **Sign Up**: https://www.loudly.com/signup
- **API Access**: https://www.loudly.com/api
- **Setup Steps**:
  1. Create Loudly account
  2. Go to API section
  3. Generate API key
  4. Copy the key (10+ characters)
  5. Add to `config.env`: `LOUDLY_API_KEY=your_key_here`

## 🔧 Optional Services

### 5. **Mubert** (Alternative music generation)
- **Website**: https://mubert.com/
- **API Access**: https://mubert.com/api
- **Setup Steps**:
  1. Create Mubert account
  2. Go to API section
  3. Generate token
  4. Add to `config.env`: `MUBERT_TOKEN=your_token_here`

### 6. **Stability AI** (Alternative music generation)
- **Website**: https://stability.ai/
- **API Keys**: https://platform.stability.ai/
- **Setup Steps**:
  1. Create Stability AI account
  2. Go to API Keys section
  3. Generate new key
  4. Add to `config.env`: `STABILITY_API_KEY=your_key_here`

## 🚀 Quick Setup Commands

### 1. **Copy configuration template**
```bash
cp config.env.example config.env
```

### 2. **Edit with your API keys**
```bash
# Using VS Code
code config.env

# Using nano
nano config.env

# Using vim
vim config.env
```

### 3. **Restart Docker container**
```bash
docker-compose restart
```

### 4. **Validate your keys**
```bash
docker-compose exec video-pipeline npm run validate:api
```

## 💰 Cost Information

| Service | Free Tier | Paid Plans | Notes |
|---------|-----------|------------|-------|
| **ElevenLabs** | 10,000 characters/month | $5/month+ | High-quality voices |
| **OpenAI** | $0.015/1K characters | Pay-per-use | GPT-4 TTS quality |
| **Azure Speech** | 5 hours/month | $16/month+ | Enterprise-grade |
| **Loudly** | Limited free | $9/month+ | Professional music |
| **Mubert** | Limited free | $9/month+ | AI-generated music |
| **Stability AI** | Limited free | Pay-per-use | High-quality generation |

## 🔒 Security Best Practices

1. **Never share your API keys**
2. **Don't commit keys to version control**
3. **Use environment variables**
4. **Rotate keys regularly**
5. **Monitor usage and costs**

## 📱 Mobile-Friendly Links

If you're setting up from a mobile device:

- **ElevenLabs Mobile**: https://elevenlabs.io/
- **OpenAI Mobile**: https://platform.openai.com/
- **Azure Mobile**: https://portal.azure.com/
- **Loudly Mobile**: https://www.loudly.com/

## 🆘 Need Help?

### Service Support
- **ElevenLabs**: https://elevenlabs.io/support
- **OpenAI**: https://help.openai.com/
- **Azure**: https://azure.microsoft.com/en-us/support/
- **Loudly**: https://www.loudly.com/contact

### Local Support
- **Run setup script**: `npm run setup:docker`
- **Check validation**: `npm run validate:api`
- **View logs**: `docker-compose logs video-pipeline`

## 🎯 Recommended Setup Order

1. **Start with ElevenLabs** (best voice quality)
2. **Add Loudly** (required for music)
3. **Configure OpenAI** (backup TTS option)
4. **Test the pipeline**: `npm run narrate:eleven`

## 📋 Checklist

- [ ] ElevenLabs account created
- [ ] ElevenLabs API key generated
- [ ] Loudly account created
- [ ] Loudly API key generated
- [ ] OpenAI account created (optional)
- [ ] OpenAI API key generated (optional)
- [ ] Azure Speech account created (optional)
- [ ] Azure Speech key generated (optional)
- [ ] Keys added to `config.env`
- [ ] Docker container restarted
- [ ] API keys validated
- [ ] TTS tested successfully

---

**Ready to get started?** Begin with ElevenLabs at https://elevenlabs.io/sign-up for the best voice quality experience!
