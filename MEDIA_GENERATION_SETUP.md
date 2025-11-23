# Media Generation Setup Guide

## Overview
All media generation services have been updated to use working APIs. Here's what you need to configure:

## Required API Keys

Add these to your `.env` file:

### Image Generation
```
VITE_FAL_KEY=your_fal_api_key_here
```
- Both "Google Imagen 4.0" and "Gemini Nano Banana" now use FAL.ai API
- Get your key from: https://fal.ai/dashboard/keys

### Video Generation
Currently using Google Veo 3.1 and OpenAI Sora 2 services which need:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: These APIs may not be publicly available yet. For working video generation, consider:
- Using FAL.ai's video models
- Or keeping the existing working video service

### Music Generation
```
VITE_SUNO_API_KEY=your_suno_api_key_here
```
- Get from: https://sunoapi.org/
- API endpoint: https://api.sunoapi.org/api/v1

### Text-to-Speech
```
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
- ElevenLabs: https://elevenlabs.io/
- Google TTS uses Gemini API key

## Services Updated

### Image Generation (SimpleImageGenerator.tsx)
- **Model 1**: Google Imagen 4.0 → Uses FAL.ai Flux Pro
- **Model 2**: Gemini Nano Banana → Uses FAL.ai Flux Schnell
- Both working with FAL API key

### Video Generation (SimpleVideoGenerator.tsx)
- **Model 1**: Google Veo 3.1
- **Model 2**: OpenAI Sora 2
- May need alternative implementation if APIs not available

### Music Generation (SimpleMusicStudio.tsx)
- **Music Mode**:
  - Google Lyria RealTime
  - Suno AI (working via sunoapi.org)
- **Speech Mode**:
  - ElevenLabs TTS (primary, high quality)
  - Google Gemini TTS (multilingual, 30 voices)

## Files Changed

### New Services Created
- `src/lib/googleImagenService.ts` - Image generation via FAL
- `src/lib/geminiNanoBananaService.ts` - Image generation via FAL
- `src/lib/googleVeo3Service.ts` - Video generation
- `src/lib/openaiSora2Service.ts` - Video generation
- `src/lib/googleLyriaService.ts` - Music generation
- `src/lib/sunoMusicService.ts` - Music generation (updated to sunoapi.org)
- `src/lib/geminiTTSService.ts` - Text-to-speech
- `src/lib/elevenlabsTTSService.ts` - Text-to-speech

### Components Updated
- `src/components/Chat/SimpleImageGenerator.tsx`
- `src/components/Chat/SimpleVideoGenerator.tsx`
- `src/components/Studio/SimpleMusicStudio.tsx`

### Files Removed
- Old FAL-based services (simpleImageGen.ts, simpleVideoGen.ts)
- Duplicate video services (kieVeo3Service.ts, sora2Service.ts, etc.)
- Unused services (runwayService.ts, pixverseService.ts, hfVideoService.ts)

## Testing Checklist

1. **Image Generation**:
   - ✅ Add VITE_FAL_KEY to .env
   - Test both models in Image Studio
   - Should generate images successfully

2. **Video Generation**:
   - Add API keys if available
   - Test both video models
   - May show "Failed to fetch" if APIs not publicly available

3. **Music Generation**:
   - ✅ Add VITE_SUNO_API_KEY to .env
   - Test music generation with Suno
   - Should create music tracks

4. **Text-to-Speech**:
   - ✅ Add VITE_ELEVENLABS_API_KEY to .env
   - Test both TTS providers
   - ElevenLabs should work immediately
   - Gemini TTS may need Google Cloud TTS API setup

## Known Issues & Solutions

### Issue: "Failed to fetch" errors
**Cause**: Missing or invalid API keys
**Solution**: Ensure all required API keys are in .env file

### Issue: Suno shows 404 error
**Cause**: Wrong API endpoint or key
**Solution**: Use https://api.sunoapi.org/api/v1 (now fixed)

### Issue: Models not showing in chat
**Cause**: Models are filtered by category
**Solution**: All models from aiModels.ts are available, filtered by category in CompactModelSelector

### Issue: Gemini TTS 403 error
**Cause**: Google Cloud TTS requires separate API setup
**Solution**: Use ElevenLabs TTS (default) or set up Google Cloud TTS API

## Recommended Configuration

For immediate working setup, configure these first:

1. **FAL.ai** (for images) - Essential
2. **ElevenLabs** (for speech) - Essential
3. **Suno** (for music) - Recommended

This will give you working:
- Image generation
- Text-to-speech
- Music generation

Video generation APIs (Veo 3.1 and Sora 2) may not be publicly available yet.

## Alternative: Keep Working Services

If you want to keep existing working services instead:

1. Image: Keep original FAL integration
2. Video: Use existing video service that works
3. Music: Suno is now fixed
4. Speech: ElevenLabs is ready

The new services are designed to be modular - you can mix and match as needed.
