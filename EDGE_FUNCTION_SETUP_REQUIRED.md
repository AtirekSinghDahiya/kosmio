# Edge Function Setup Guide

## Current Issue

**Error:** "AI Proxy Error: Authentication required"

**Cause:** The Edge Function needs environment variables set in Supabase Dashboard. Your API keys in the local `.env` file aren't accessible to Edge Functions running on Supabase servers.

---

## Quick Fix (2 Minutes)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions → Settings → Environment Variables**

### Step 2: Add API Key
Add this required variable:

```
Name: OPENROUTER_API_KEY
Value: [Your API key from .env file]
```

**Important:** Remove the `VITE_` prefix. Use `OPENROUTER_API_KEY`, not `VITE_OPENROUTER_API_KEY`.

### Step 3: Save and Test
1. Click **Save**
2. Wait 10-30 seconds for changes to apply
3. Refresh your app and test

---

## Optional: Additional API Keys

For full functionality, you can also add:

```
CLAUDE_API_KEY=[Your Claude API key]
OPENAI_API_KEY=[Your OpenAI API key]
GEMINI_API_KEY=[Your Gemini API key]
```

**Note:** `OPENROUTER_API_KEY` alone is sufficient since OpenRouter supports most models.

---

## Alternative: Using CLI

If you prefer command line:

```bash
npx supabase login
npx supabase link --project-ref [your-project-ref]
npx supabase secrets set OPENROUTER_API_KEY=[your-key]
npx supabase secrets list
```

---

## Troubleshooting

### Still Getting Errors?

**Check Variable is Set:**
- Go to Supabase Dashboard → Edge Functions → Settings
- Confirm `OPENROUTER_API_KEY` appears in list

**Check Function Logs:**
- Edge Functions → ai-proxy → Logs
- Look for "OpenRouter API key not configured"

**Verify Key Format:**
- Should start with `sk-or-v1-`
- No quotes around it
- No `VITE_` prefix

---

## Why This is Necessary

### Frontend (.env file)
- Used during local development
- Variables with `VITE_` prefix exposed to browser
- Not accessible by Edge Functions

### Edge Functions (Supabase Dashboard)
- Run on Supabase servers
- Need separate environment variables
- Keep API keys secure (never exposed to users)

**This separation is intentional for security.**

---

## Security Notes

✅ **This is secure:**
- API keys stored on Supabase servers
- Never exposed to users
- Only accessible by Edge Functions
- Encrypted at rest

✅ **Correct architecture:**
- Frontend → Edge Function → AI Provider
- API keys never touch the browser

---

## Common Mistakes

❌ Don't add `VITE_` prefix
❌ Don't add quotes around values
❌ Don't use values from local `.env` (must set in Supabase)

---

## After Setup

Once configured:
- ✅ AI chat works
- ✅ All models accessible
- ✅ Security fixes active
- ✅ Rate limiting operational
- ✅ Token system functional

---

**Time Required:** 2 minutes
**Difficulty:** Easy
**Required:** Yes (app won't work without this)
