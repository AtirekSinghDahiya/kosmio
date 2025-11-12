# Quick Setup Guide

## 1. Get OpenRouter API Key

Visit: https://openrouter.ai/settings/keys

Create a new key and copy it.

## 2. Add to .env File

```bash
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

## 3. Build & Run

```bash
npm run build
npm run dev
```

## That's It!

Your app now uses:
- **Firebase** for user authentication
- **Supabase** for database (already configured by Bolt)
- **OpenRouter** for AI chat (using your key)

All models use the correct OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`

## Available Models

- Grok 4 Fast (x-ai/grok-4-fast)
- DeepSeek v3.2 (deepseek/deepseek-v3.2-exp)
- Claude Sonnet 4.5 (anthropic/claude-sonnet-4.5)
- Gemini Flash (google/gemini-2.5-flash-image)
- Perplexity Sonar (perplexity/sonar)
- And 15+ more in MODEL_MAP

## Files Modified

- `.env` - Added VITE_OPENROUTER_API_KEY
- `.env.production` - Added VITE_OPENROUTER_API_KEY

## Files Already Configured

- `src/lib/openRouterDirect.ts` - Direct API calls with correct endpoint
- `src/lib/openRouterService.ts` - Edge function proxy fallback
- `src/lib/aiProviders.ts` - AI provider abstraction

## Need Help?

See `OPENROUTER_SETUP.md` for detailed documentation.
