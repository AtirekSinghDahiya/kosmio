# Supabase Edge Function Setup Guide

## Critical Security Fix Implemented

Your application now routes all AI API calls through a secure Edge Function proxy to protect API keys.

## What Changed

### 1. Frontend Code Updates
- ✅ `MainChat.tsx` now imports from `openRouterService.ts` (secure) instead of `openRouterDirect.ts`
- ✅ `contentModerationService.ts` now routes through Edge Function instead of direct API calls
- ✅ Removed all `VITE_` prefixed AI API keys from `.env` and `.env.production` files

### 2. Edge Function Configuration Required

**IMPORTANT:** Your Edge Function (`ai-proxy`) needs the following environment secrets configured:

```bash
# Required secrets in Supabase Edge Function environment:
OPENROUTER_API_KEY=your-openrouter-key-here
CLAUDE_API_KEY=your-claude-key-here (if using Claude directly)
OPENAI_API_KEY=your-openai-key-here (if using OpenAI directly)
GEMINI_API_KEY=your-gemini-key-here (if using Gemini directly)
```

## How to Configure Edge Function Secrets

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `infzofivgbtzdcpzkypt`
3. Navigate to: **Edge Functions** → **ai-proxy** → **Settings**
4. Add secrets:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key (get from https://openrouter.ai/settings/keys)
5. Click **Save**

### Option 2: Using Supabase CLI

```bash
# Set environment secrets for the Edge Function
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-your-key-here
supabase secrets set CLAUDE_API_KEY=sk-ant-your-key-here
supabase secrets set OPENAI_API_KEY=sk-your-key-here
supabase secrets set GEMINI_API_KEY=your-gemini-key-here
```

## Verify Edge Function Deployment

Check if your Edge Function is deployed and accessible:

```bash
# Test the Edge Function endpoint
curl -X POST https://infzofivgbtzdcpzkypt.supabase.co/functions/v1/ai-proxy \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openrouter",
    "model": "x-ai/grok-4-fast",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

## Edge Function Endpoints

### Current Edge Function URL
```
https://infzofivgbtzdcpzkypt.supabase.co/functions/v1/ai-proxy
```

### Supported Providers
- `openrouter` - All AI models through OpenRouter unified API
- `claude` - Direct Anthropic Claude API
- `openai` - Direct OpenAI API
- `gemini` - Direct Google Gemini API

## Security Benefits

### Before (Insecure)
- ❌ API keys exposed in frontend JavaScript bundle
- ❌ Anyone could extract keys from browser DevTools
- ❌ Keys visible in source code and network requests
- ❌ Single key shared across all users

### After (Secure)
- ✅ API keys stored server-side only
- ✅ Keys never exposed to frontend
- ✅ All AI requests proxied through Edge Function
- ✅ Proper authentication and rate limiting possible

## Troubleshooting

### Issue: "OpenRouter API key not configured"
**Solution:** Configure `OPENROUTER_API_KEY` in Edge Function secrets (see above)

### Issue: Edge Function returns 404
**Solution:** Verify Edge Function is deployed:
```bash
supabase functions list
supabase functions deploy ai-proxy
```

### Issue: CORS errors
**Solution:** Edge Function already has CORS headers configured. Check browser console for actual error.

### Issue: "User not found" from OpenRouter
**Solution:**
1. This may be an OpenRouter API issue
2. Try creating a new API key at https://openrouter.ai/settings/keys
3. Update the key in Edge Function secrets
4. Rotate exposed keys immediately

## Next Steps

1. **Immediate:** Configure `OPENROUTER_API_KEY` in Supabase Edge Function secrets
2. **Recommended:** Rotate the old OpenRouter key that was in `.env` file (it's now exposed)
3. **Optional:** Add other provider keys if you want to use direct API access
4. **Testing:** Test the chat functionality to ensure everything works

## API Key Rotation

Since the OpenRouter API key was previously in your `.env` file, it should be rotated:

1. Go to https://openrouter.ai/settings/keys
2. Delete the old key: `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`
3. Create a new key
4. Add the new key to Edge Function secrets (not `.env`)

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTPS Request
       │ (No API keys)
       ▼
┌─────────────────────┐
│  Supabase Edge      │
│  Function (ai-proxy)│
│  ├─ OPENROUTER_KEY  │ ← Server-side secrets
│  ├─ CLAUDE_KEY      │
│  └─ OPENAI_KEY      │
└──────┬──────────────┘
       │
       │ Authenticated Request
       │ (With API key)
       ▼
┌─────────────────┐
│   OpenRouter    │
│   AI Provider   │
└─────────────────┘
```

## Support

If you need help:
1. Check Edge Function logs in Supabase Dashboard
2. Review browser console for detailed errors
3. Verify API keys are valid at provider websites
4. Check this guide for common solutions
