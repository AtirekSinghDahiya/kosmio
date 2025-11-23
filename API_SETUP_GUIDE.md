# API Setup Guide - How to Get Actual API Keys

This guide explains how to get API keys for all the AI services used in KronIQ AI.

## 🎨 Image Generation Services

### 1. Nano Banana (Google Gemini 2.5 Flash Image)

**What is it?** Google's fast image generation model with Gemini AI

**How to get API key:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new project or select existing
4. Generate API key
5. Add to `.env` as `VITE_GEMINI_API_KEY`

**Cost:** $0.039 per 1024px image (very affordable!)

**Model to use:** `gemini-2.5-flash-image` or `imagen-3.0-generate-002`

**Documentation:** https://ai.google.dev/gemini-api/docs/image-generation

---

### 2. Google Imagen 3

**What is it?** Google's highest quality image generation model

**How to get API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Vertex AI API"
4. Set up billing (required)
5. Go to [Google AI Studio](https://ai.google.dev/) and get API key
6. Add to `.env` as `VITE_GEMINI_API_KEY`

**Cost:** $0.03 per image

**Model to use:** `imagen-3.0-generate-002`

**Documentation:** https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview

---

## 🎥 Video Generation Services

### 3. OpenAI Sora 2

**What is it?** OpenAI's text-to-video AI model

**IMPORTANT:** Sora 2 API is NOT publicly available yet (invitation-only from OpenAI)

**Alternative Options:**

#### Option A: Use AIMLAPI (Recommended)
1. Sign up at [AIMLAPI.com](https://aimlapi.com/)
2. Get API key from dashboard
3. Add to `.env` as `VITE_AIMLAPI_KEY`
4. Cost: ~$0.25-1.00 per 10-second video (much cheaper than official)
5. Model: `openai/sora-2-pro-t2v`

#### Option B: Use muapi.ai
1. Sign up at [muapi.ai](https://muapi.ai/)
2. Get API key
3. Cost: $0.25 per 10-second video
4. Model: `openai-sora-2-text-to-video`

#### Option C: Wait for official access
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Complete organization verification
3. Request API access (invitation-only)
4. Wait for approval from OpenAI

**Documentation:**
- AIMLAPI: https://docs.aimlapi.com/
- Official (when available): https://platform.openai.com/docs

---

### 4. Google Veo 3

**What is it?** Google's high-quality video generation model

**How to get access:**

#### Option A: Use AIMLAPI
1. Sign up at [AIMLAPI.com](https://aimlapi.com/)
2. Get API key
3. Add to `.env` as `VITE_AIMLAPI_KEY`
4. Model: `google/veo-3-1-text-to-video`

#### Option B: Use Replicate
1. Sign up at [Replicate.com](https://replicate.com/)
2. Get API token
3. Add to `.env` as `VITE_REPLICATE_API_KEY`
4. Model: `google-deepmind/veo-2`

**Cost:** Varies by provider (~$0.50-2.00 per video)

---

## 🎵 Audio Generation Services

### 5. ElevenLabs TTS

**What is it?** High-quality text-to-speech with realistic voices

**How to get API key:**
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to Profile → API Keys
3. Generate new API key
4. Add to `.env` as `VITE_ELEVENLABS_API_KEY`

**Free tier:** 10,000 characters/month
**Paid plans:** Start at $5/month

**Documentation:** https://elevenlabs.io/docs/

---

### 6. Suno AI Music Generation

**What is it?** AI music generation from text prompts

**How to get API key:**
1. The official Suno API is not publicly available
2. Use third-party API services like:
   - [SunoAPI.org](https://www.sunoapi.org/)
   - [API.Suno.ai](https://api.suno.ai/)
3. Sign up and get API key
4. Add to `.env` as `VITE_SUNO_API_KEY`

**Cost:** Pay-per-use, typically $0.10-0.50 per song

---

## 💬 Chat/Code AI Models

### 7. OpenRouter (For All AI Models)

**What is it?** Unified API for accessing all major AI models

**How to get API key:**
1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up/login
3. Go to Keys section
4. Create new API key
5. Add to `.env` as `VITE_OPENROUTER_API_KEY`

**Benefits:**
- Access to Claude, GPT-4, Gemini, DeepSeek, and more
- Single API key for all models
- Pay-as-you-go pricing
- Automatic fallbacks

**Models available:**
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4-turbo`
- `openai/gpt-4o`
- `deepseek/deepseek-coder`
- `google/gemini-pro`
- `qwen/qwen-2.5-coder-32b-instruct`
- `mistralai/mixtral-8x7b-instruct`

**Documentation:** https://openrouter.ai/docs

---

## 🎨 Alternative: Replicate (For Multiple Services)

**What is it?** Run AI models via API - hosts Imagen, FLUX, video models, and more

**How to get API key:**
1. Sign up at [Replicate.com](https://replicate.com/)
2. Go to Account → API Tokens
3. Create new token
4. Add to `.env` as `VITE_REPLICATE_API_KEY`

**What you can use it for:**
- Image generation (FLUX Schnell, FLUX Pro, Stable Diffusion)
- Video generation (Veo 3, Hailuo, Kling)
- Many other AI models

**Pricing:** Pay per run, typically $0.01-0.10 per generation

**Documentation:** https://replicate.com/docs

---

## 📋 Complete .env Setup

Here's what your `.env` file should look like with all API keys:

```env
# === AI API Keys ===

# OpenRouter (for chat/code models)
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Google AI (Nano Banana + Imagen)
VITE_GEMINI_API_KEY=AIzaSyxxxxx

# ElevenLabs (Text-to-Speech)
VITE_ELEVENLABS_API_KEY=sk_xxxxx

# AIMLAPI (Sora 2 + Veo 3)
VITE_AIMLAPI_KEY=xxxxx

# Replicate (Alternative for image/video)
VITE_REPLICATE_API_KEY=r8_xxxxx

# Suno Music (Third-party API)
VITE_SUNO_API_KEY=xxxxx
```

---

## 💰 Cost Breakdown

### Free Tiers Available:
- **OpenRouter**: $5 free credits
- **Google Gemini API**: Free tier available
- **ElevenLabs**: 10,000 characters/month free
- **Replicate**: Pay-as-you-go (no subscription)

### Paid Recommendations:
1. **For Image Generation:**
   - Use Google Gemini API ($0.039/image) or Replicate ($0.01-0.05/image)

2. **For Video Generation:**
   - Use AIMLAPI ($0.25-1.00/video) - cheapest option

3. **For Text-to-Speech:**
   - ElevenLabs ($5/month for 30,000 characters)

4. **For AI Chat/Code:**
   - OpenRouter (pay-as-you-go, ~$0.50-2.00 per million tokens)

---

## ⚠️ Important Notes

1. **API Key Security:**
   - Never commit `.env` file to git
   - Keep API keys private
   - Regenerate if compromised

2. **Rate Limits:**
   - Most services have rate limits
   - Implement proper error handling
   - Use exponential backoff for retries

3. **Cost Management:**
   - Set up billing alerts
   - Monitor usage regularly
   - Use cheaper alternatives for testing

4. **API Changes:**
   - APIs may change over time
   - Check documentation regularly
   - Update code as needed

---

## 🚀 Quick Start

1. **Get essential keys first:**
   - OpenRouter (for chat/code)
   - Google Gemini (for images)

2. **Add them to `.env`**

3. **Test each service individually**

4. **Add more services as needed**

---

## 📞 Support

If you need help:
- Check service documentation
- Search for error messages
- Contact service support
- Ask in AI communities

**Service Support Links:**
- OpenRouter: https://openrouter.ai/discord
- Google AI: https://ai.google.dev/support
- ElevenLabs: support@elevenlabs.io
- Replicate: https://replicate.com/discord
