# Critical Fixes In Progress

## Issues Reported by User

### 1. Token Pricing Display
**Issue:** Models showing very low token costs like 1.0K when they should show realistic costs
**Status:** ✅ FIXED
**Solution:** Updated all 200+ models in `aiModels.ts` with realistic token pricing:
- FREE tier: 300-1500 tokens
- BUDGET tier: 1500-5000 tokens
- MID tier: 5000-12000 tokens
- PREMIUM tier: 12000-20000 tokens
- Image generation: 25000-50000 tokens
- Video generation: 150000+ tokens
- Audio generation: 10000 tokens

### 2. Image Generation (FAL API Error: 403)
**Issue:** Currently using FAL.ai which is giving 403 errors
**Problem:** Should use Google Imagen API directly via Gemini API key
**Current File:** `src/lib/googleImagenService.ts` and `src/lib/geminiNanoBananaService.ts`
**Solution Needed:** Rewrite to use Google's actual Imagen API endpoint

```typescript
// Current (WRONG - using FAL):
const response = await fal.subscribe("fal-ai/flux-pro", {...});

// Needed (CORRECT - using Google):
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY
  },
  body: JSON.stringify({...})
});
```

### 3. Video Generation (Failed to fetch)
**Issue:** Video generation not working
**Problem:** Similar to images - needs to use Google Veo 3 API directly
**Current Files:** `src/lib/googleVeo3Service.ts`, `src/lib/openaiSora2Service.ts`
**Solution Needed:** Use Google's Veo API via Gemini API key

### 4. Audio Generation Issues

#### A. ElevenLabs (401 Error)
**Issue:** Authentication error
**Problem:** API key might be invalid or format incorrect
**File:** `src/lib/elevenlabsTTSService.ts`
**Solution:** Verify API key format and authentication headers

#### B. Suno Music (404 Error)
**Issue:** Endpoint not found
**File:** `src/lib/sunoMusicService.ts` or `src/lib/sunoService.ts`
**Problem:** API endpoint might be incorrect
**Solution:** Update to correct Suno API endpoint

#### C. Gemini TTS (403 Error)
**Issue:** Forbidden error
**File:** `src/lib/geminiTTSService.ts`
**Problem:** Likely incorrect API endpoint or authentication
**Solution:** Use correct Gemini TTS API endpoint with proper auth

### 5. Code Tab Simplification
**Issue:** Too many individual code models showing
**Required:** Should show only:
- Code Studio (main coding interface with model selector inside)
- PPT Maker (presentation maker)
**File:** `src/components/Chat/StudioLandingView.tsx`
**Solution:** Simplify code tab to show just 2 cards, models accessible within Code Studio

### 6. Token Deduction Not Working
**Issue:** Tokens not being deducted when using models
**Problem:** Token deduction service not properly integrated
**Files:** `src/lib/tokenService.ts`, chat components
**Solution:** Integrate token deduction in all API calls

### 7. Display Token Costs in UI
**Issue:** Model cards in StudioLandingView don't show token costs
**File:** `src/components/Chat/StudioLandingView.tsx`
**Solution:** Display `tokensPerMessage` from aiModels.ts on each model card

## Google APIs To Use

According to user, should use Google's services via VITE_GEMINI_API_KEY:

### Google Imagen (Image Generation)
```
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
Auth: x-goog-api-key: {VITE_GEMINI_API_KEY}
```

### Google Veo 3 (Video Generation)
```
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/veo-001:generateVideo
Auth: x-goog-api-key: {VITE_GEMINI_API_KEY}
```

### Google Gemini TTS (Text-to-Speech)
```
Endpoint: https://texttospeech.googleapis.com/v1/text:synthesize
Auth: x-goog-api-key: {VITE_GEMINI_API_KEY}
```

## Implementation Plan

### Phase 1: Fix Media Generation APIs ✅ (Priority 1)
1. Update googleImagenService.ts to use actual Google Imagen API
2. Update geminiNanoBananaService.ts similarly
3. Update googleVeo3Service.ts to use Google Veo 3 API
4. Fix ElevenLabs authentication
5. Fix Suno API endpoint
6. Fix Gemini TTS endpoint

### Phase 2: UI Updates (Priority 2)
1. Update StudioLandingView.tsx to show token costs
2. Simplify Code tab to show only Code Studio and PPT Maker
3. Add model selector INSIDE Code Studio component

### Phase 3: Token System (Priority 3)
1. Integrate token deduction in all API service calls
2. Update token balance after each generation
3. Show token cost preview before generation
4. Add token balance checks before allowing generation

### Phase 4: Testing & Verification
1. Test image generation with Google Imagen
2. Test video generation with Google Veo 3
3. Test all audio generation services
4. Verify token deduction working
5. Verify token costs displaying correctly
6. Run full build to ensure no errors

## API Keys Available

From .env file:
- `VITE_GEMINI_API_KEY`: For Google services (Imagen, Veo, Gemini TTS)
- `VITE_ELEVENLABS_API_KEY`: For ElevenLabs TTS
- `VITE_SUNO_API_KEY`: For Suno music generation
- `VITE_OPENROUTER_API_KEY`: For chat models
- `VITE_HEYGEN_API_KEY`: For HeyGen video (if needed)

## Notes

- User explicitly stated they provided Google docs to use Google APIs directly
- FAL.ai should NOT be used - causing 403 errors
- All media generation should use official provider APIs
- Token costs must be realistic (not 1K-2K for premium models)
- Code tab should be simplified significantly
- Token deduction MUST work for all generations
