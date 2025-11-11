# 🔐 API Keys Removal Guide

## CRITICAL: Remove All Exposed API Keys from Frontend

This guide explains how to secure your API keys by moving them to Supabase Edge Functions.

---

## Step 1: Set Secrets in Supabase

```bash
# Using Supabase CLI (recommended)
supabase secrets set OPENROUTER_API_KEY="your-new-key-here"
supabase secrets set CLAUDE_API_KEY="your-new-key-here"
supabase secrets set OPENAI_API_KEY="your-new-key-here"
supabase secrets set GEMINI_API_KEY="your-new-key-here"
supabase secrets set STRIPE_SECRET_KEY="your-new-key-here"
supabase secrets set ELEVENLABS_API_KEY="your-new-key-here"
supabase secrets set HEYGEN_API_KEY="your-new-key-here"
supabase secrets set SUNO_API_KEY="your-new-key-here"
supabase secrets set FAL_API_KEY="your-new-key-here"
supabase secrets set DEEPSEEK_API_KEY="your-new-key-here"

# Or via Supabase Dashboard:
# 1. Go to Project Dashboard
# 2. Edge Functions → Secrets
# 3. Add each secret one by one
```

---

## Step 2: Deploy Edge Functions

```bash
# Deploy the AI proxy function
supabase functions deploy ai-proxy

# Verify it's deployed
supabase functions list
```

---

## Step 3: Update .env File

**REMOVE all VITE_*_API_KEY entries except Supabase:**

```bash
# .env - KEEP ONLY THESE:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_FIREBASE_API_KEY=your-firebase-key (public, safe to keep)

# DELETE ALL OF THESE (now in Supabase secrets):
# VITE_OPENROUTER_API_KEY=...
# VITE_CLAUDE_API_KEY=...
# VITE_OPENAI_API_KEY=...
# VITE_GEMINI_API_KEY=...
# VITE_DEEPSEEK_API_KEY=...
# VITE_KIMI_API_KEY=...
# VITE_SUNO_API_KEY=...
# VITE_KIE_API_KEY=...
# VITE_AIMLAPI_KEY=...
# VITE_FAL_KEY=...
# VITE_ELEVENLABS_API_KEY=...
# VITE_HEYGEN_API_KEY=...
# STRIPE_SECRET_KEY=... (CRITICAL - move to Edge Function)
```

---

## Step 4: Rotate All Compromised Keys

**ALL keys in .env are considered compromised. Generate new ones:**

### OpenRouter
1. Go to https://openrouter.ai/keys
2. Delete old key
3. Generate new key
4. Set in Supabase secrets

### Claude (Anthropic)
1. Go to https://console.anthropic.com/settings/keys
2. Delete old key
3. Create new key
4. Set in Supabase secrets

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Revoke old key
3. Create new key
4. Set in Supabase secrets

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Delete old secret key
3. Create new secret key
4. Set in Supabase secrets
5. **Update webhook signing secret too**

### Other Services
- Follow similar process for each service
- Delete old keys first (they're exposed)
- Generate new keys
- Store in Supabase secrets only

---

## Step 5: Update Service Files

### Files Already Updated:
- ✅ `src/lib/openRouterService.ts` - Now uses Edge Function
- ✅ `src/lib/sora2Service.ts` - Hardcoded key removed
- ✅ `src/lib/veo3ServiceNew.ts` - Hardcoded key removed

### Files That Need Updates:

#### src/lib/imageService.ts
```typescript
// BEFORE:
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || '';

// AFTER:
// Remove direct API calls, use Edge Function or Supabase Storage
```

#### src/lib/heygenService.ts
```typescript
// Create new Edge Function for HeyGen
// Move all HeyGen logic to supabase/functions/heygen-proxy/index.ts
```

#### src/lib/sunoService.ts
```typescript
// Create new Edge Function for Suno
// Move all Suno logic to supabase/functions/suno-proxy/index.ts
```

---

## Step 6: Verification

### Check 1: No API Keys in Frontend Bundle
```bash
npm run build
cd dist/assets
grep -r "sk-" . || echo "✅ No API keys found"
grep -r "VITE_.*_API_KEY" . || echo "✅ No VITE API keys found"
```

### Check 2: Edge Functions Work
```bash
# Test AI proxy
curl -X POST https://your-project.supabase.co/functions/v1/ai-proxy \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openrouter","model":"x-ai/grok-4-fast","messages":[{"role":"user","content":"test"}]}'
```

### Check 3: Frontend Can't Access Keys
```javascript
// In browser console, try:
console.log(import.meta.env.VITE_OPENROUTER_API_KEY);
// Should be: undefined

console.log(import.meta.env.VITE_CLAUDE_API_KEY);
// Should be: undefined
```

---

## Step 7: Update Stripe Integration

### Current Issue:
`STRIPE_SECRET_KEY` is in .env and accessible to frontend

### Fix:
All Stripe operations must go through Edge Functions:

```bash
# Already have these Edge Functions:
# - stripe-checkout (creates checkout sessions)
# - stripe-webhook (handles payment events)

# Verify they use secrets:
cat supabase/functions/stripe-webhook/index.ts | grep "Deno.env"
# Should see: const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
```

Update `src/services/stripe.ts` if needed to ensure it only calls Edge Functions.

---

## Common Errors & Solutions

### Error: "Edge Function returned 401"
**Solution:** Make sure you're passing the Supabase session token:
```typescript
const { data: { session } } = await supabase.auth.getSession();
fetch(edgeFunctionUrl, {
  headers: { 'Authorization': `Bearer ${session.access_token}` }
});
```

### Error: "API key not configured"
**Solution:** Verify secret is set in Supabase:
```bash
supabase secrets list
# Should show all your secrets
```

### Error: "CORS preflight failed"
**Solution:** Ensure Edge Function handles OPTIONS:
```typescript
if (req.method === "OPTIONS") {
  return new Response(null, { status: 200, headers: corsHeaders });
}
```

---

## Security Checklist

After completing all steps:

- [ ] All API keys rotated (old ones deleted)
- [ ] New keys stored in Supabase secrets only
- [ ] `.env` file contains ONLY Supabase URL/Anon Key
- [ ] Edge Functions deployed and working
- [ ] Frontend build contains no API keys
- [ ] All service files updated to use Edge Functions
- [ ] Stripe operations use Edge Functions only
- [ ] Tested in production environment

---

## Estimated Timeline

- **Step 1-2:** 30 minutes (set secrets, deploy)
- **Step 3-4:** 30 minutes (update .env, rotate keys)
- **Step 5:** 2-4 hours (update service files)
- **Step 6-7:** 1 hour (verification and testing)

**Total:** 4-6 hours for complete security overhaul

---

## Support

If you encounter issues:

1. Check Supabase Edge Function logs in Dashboard
2. Check browser console for errors
3. Verify secrets are set: `supabase secrets list`
4. Test Edge Functions individually before updating frontend

---

**Status:** 🟡 IN PROGRESS
**Priority:** 🔴 CRITICAL
**Risk if not completed:** All API keys are exposed in production bundle
