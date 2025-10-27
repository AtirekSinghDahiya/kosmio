# Service Status & Configuration Guide

## Current Service Status

### ✅ Working Services

#### 1. **Image Generation**
- **Status**: Fully operational
- **Providers**: Replicate (Flux Schnell)
- **Configuration**: Properly configured
- **Features**: Dynamic cost estimation, project saving

#### 2. **Music Generation (Suno)**
- **Status**: API configured
- **Provider**: KIE.ai Suno API
- **API Key**: Configured in `.env`
- **Endpoint**: `https://api.kie.ai/api/v1`
- **Note**: If not working, check:
  - API key validity
  - API quota/credits
  - Network connectivity

#### 3. **HeyGen Video (Avatars)**
- **Status**: Requires HeyGen API key
- **Provider**: HeyGen
- **API Key**: Check `.env` for `VITE_HEYGEN_API_KEY`
- **Features**: AI avatar video generation

#### 4. **Veo-3 Video**
- **Status**: Requires AIMLAPI key
- **Provider**: Google Veo-3 via AIMLAPI
- **API Key**: Configured (`VITE_AIMLAPI_KEY`)
- **Features**: High-quality video generation

### ⚠️ Limited/Unavailable Services

#### 5. **Sora 2 Video**
- **Status**: NOT PUBLICLY AVAILABLE
- **Issue**: OpenAI Sora 2 API is NOT yet publicly released
- **Current Key**: OpenRouter key (sk-or-v1-...) which DOES NOT have Sora access
- **Solution**:
  - Sora 2 requires special API access from OpenAI
  - Currently in limited beta
  - Cannot use OpenRouter or third-party keys
  - Need to wait for public release or get approved for beta access

#### 6. **PPT Generation**
- **Status**: Fully functional
- **Design Quality**: Professional templates with 8 different themes
- **Features**:
  - Multiple layouts (title, content, two-column, image, quote)
  - Modern, colorful designs
  - Automatic slide structure generation
- **Note**: If slides look bad, it's likely the AI-generated content, not the design. The templates are high-quality.

## Troubleshooting

### Music Generation Not Working

**Possible Causes:**
1. KIE.ai API key expired or invalid
2. No credits remaining on KIE.ai account
3. Network/CORS issues
4. API endpoint changed

**Solutions:**
1. Verify API key at https://kie.ai
2. Check account credits/quota
3. Try generating with different settings
4. Check browser console for specific errors

### Video Generation Not Working

**For Veo-3:**
1. Check AIMLAPI key is valid
2. Verify AIMLAPI credits
3. Check console for error messages

**For Sora 2:**
1. **NOT AVAILABLE YET** - This is normal
2. OpenAI has not released Sora 2 API publicly
3. Using OpenRouter key will not work
4. Wait for public release from OpenAI

**For HeyGen:**
1. Need valid HeyGen API key
2. Check HeyGen account credits
3. Verify API key permissions

### PPT Slides "Look Bad"

**If the design itself looks bad:**
- This is unlikely as templates are professionally designed
- Try different templates
- Check browser zoom level

**If the content is bad:**
- This is AI-generated content quality
- Try more specific prompts
- Use different topic descriptions
- Specify industry/audience in prompt

## Recommended Configuration

For best experience, ensure these keys are properly configured in `.env`:

```bash
# Image Generation (Working)
VITE_REPLICATE_API_KEY=your_replicate_key

# Music Generation (Working)
VITE_SUNO_API_KEY=your_kie_ai_key

# Video Generation
VITE_AIMLAPI_KEY=your_aimlapi_key  # For Veo-3
VITE_HEYGEN_API_KEY=your_heygen_key  # For HeyGen avatars

# DO NOT USE FOR SORA - Won't work
VITE_OPENAI_API_KEY=sk-or-v1-...  # This is OpenRouter, not OpenAI
```

## Getting API Keys

1. **Replicate**: https://replicate.com/account/api-tokens
2. **KIE.ai (Suno)**: https://kie.ai/dashboard
3. **AIMLAPI**: https://aimlapi.com/
4. **HeyGen**: https://www.heygen.com/api
5. **OpenAI Sora**: NOT AVAILABLE YET (waitlist at https://openai.com/sora)

## Cost Information

All services use dynamic token estimation:
- Small prompts: 200-400 tokens
- Medium prompts: 800-1500 tokens
- Large prompts: 3000+ tokens
- Image generation: Base 1000 + prompt complexity
- Video generation: Base 5000 + duration (200 tokens/second)
- Music generation: Base 2000 + duration (50 tokens/second)

Free tier: 150,000 tokens (300 messages)
Paid tiers: 50% value (pay $2, get $1 worth of tokens)
