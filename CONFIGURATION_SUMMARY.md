# Configuration Summary

## Current Architecture

Your application uses a hybrid authentication and database approach:

1. **Firebase** - Authentication only
   - Handles user login/signup
   - Provides user.uid for identification
   - Configuration in `src/lib/firebase.ts`

2. **Supabase** - Database for all data persistence
   - User profiles, projects, messages
   - Token balances, billing, subscriptions
   - Analytics, promotions, and all app data
   - Configuration in `src/lib/supabase.ts`

This is the **correct and recommended** architecture for your use case.

## Environment Variables Setup

### Required Variables

Add to both `.env` and `.env.production`:

```bash
# Firebase Auth
VITE_FIREBASE_API_KEY=AIzaSyAgD7C055XQLjZZCLaiCKfsZYz8r5XDqEQ
VITE_FIREBASE_AUTH_DOMAIN=kosmio-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kosmio-ai
VITE_FIREBASE_STORAGE_BUCKET=kosmio-ai.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=171097290073
VITE_FIREBASE_APP_ID=1:171097290073:web:7135cd156467ffff63c848

# Supabase Database (Bolt-provided)
VITE_SUPABASE_URL=https://infzofivgbtzdcpzkypt.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenRouter API (for AI chat)
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## OpenRouter Configuration

### Current Setup

- **Service File**: `src/lib/openRouterDirect.ts`
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **API Key Source**: `VITE_OPENROUTER_API_KEY` environment variable

### Supported Models

All models route through OpenRouter with correct model IDs:

| Friendly Name | OpenRouter Model ID |
|--------------|-------------------|
| grok-4-fast | x-ai/grok-4-fast |
| deepseek-v3.2 | deepseek/deepseek-v3.2-exp |
| claude-sonnet | anthropic/claude-sonnet-4.5 |
| gemini-flash-image | google/gemini-2.5-flash-image |
| perplexity-sonar | perplexity/sonar |

See `MODEL_MAP` in `openRouterDirect.ts` for full list.

### Get Your API Key

1. Visit: https://openrouter.ai/settings/keys
2. Create a new API key
3. Add to `.env`: `VITE_OPENROUTER_API_KEY=sk-or-v1-...`

## How It Works Together

```
User Login (Firebase)
    ↓
Get user.uid
    ↓
Create/Fetch Profile (Supabase)
    ↓
User sends chat message
    ↓
Call OpenRouter API (with env key)
    ↓
Save message to Supabase
    ↓
Deduct tokens (Supabase)
```

## Testing

```bash
# Build the project
npm run build

# Start dev server
npm run dev
```

## Next Steps

1. Add your OpenRouter API key to `.env`
2. Test chat functionality
3. Verify token deduction works
4. Check all AI models respond correctly

## Common Issues

### "OpenRouter API key not configured"
- Add `VITE_OPENROUTER_API_KEY` to your `.env` file

### "User not found" from OpenRouter
- Generate a new API key
- Wait 5-10 minutes for propagation

### Chat not working
- Check browser console for errors
- Verify API key is set correctly
- Ensure you're signed in (Firebase Auth)

## Documentation

- Full OpenRouter setup: `OPENROUTER_SETUP.md`
- Token system guide: `TOKEN_SYSTEM_GUIDE.md`
- Security audit: `COMPREHENSIVE_SECURITY_AUDIT_2025.md`

## Architecture Decision

**Why Firebase + Supabase?**

- Firebase: Best-in-class authentication with Google OAuth, email/password
- Supabase: Full PostgreSQL database with RLS, real-time subscriptions
- OpenRouter: Unified API for multiple AI providers

This gives you the best of all three platforms without vendor lock-in.
