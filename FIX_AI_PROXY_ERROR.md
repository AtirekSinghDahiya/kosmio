# FIX AI PROXY ERROR - Step by Step

## Current Issue
You're seeing: **"AI Proxy Error: Authentication required"**

This happens because the `ai-proxy` Edge Function needs the OpenRouter API key to be set in Supabase.

---

## ⚡ SOLUTION (Follow These Steps)

### Step 1: Open Supabase Dashboard
1. Click this link: https://supabase.com/dashboard/project/infzofivgbtzdcpzkypt
2. Log in if prompted

### Step 2: Navigate to Edge Functions Settings
In the left sidebar:
1. Click **"Edge Functions"**
2. Then click **"Settings"** (or look for "Environment Variables" section)

Alternatively:
- Go to **Project Settings** → **Edge Functions** → **Secrets**

### Step 3: Add the API Key
Click **"Add new secret"** or **"New environment variable"**

Enter:
```
Name: OPENROUTER_API_KEY
Value: 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
```

**CRITICAL:**
- ❌ Do NOT include `VITE_` prefix
- ❌ Do NOT add quotes
- ✅ Just paste the raw key value

### Step 4: Save
1. Click **"Save"** or **"Create secret"**
2. Wait 10-30 seconds for the Edge Function to restart

### Step 5: Test
1. Go back to your KroniQ AI app
2. Press **Ctrl+Shift+R** to hard refresh
3. Try sending a message
4. Should work! ✅

---

## Visual Guide

```
Supabase Dashboard
└── Your Project (infzofivgbtzdcpzkypt)
    └── Edge Functions (left sidebar)
        └── Settings
            └── Environment Variables
                └── [Add new secret] button
                    ├── Name: OPENROUTER_API_KEY
                    └── Value: sk-or-v1-8edccd1202...
```

---

## Why This is Required

The Edge Function code is deployed, but it needs the API key to make calls to OpenRouter. The key must be stored as an environment variable in Supabase's servers (not in your code).

**Your local `.env` file → Only works for frontend (browser)**
**Supabase Secrets → Works for Edge Functions (server)**

---

## Verification

After setting the environment variable, you can verify it worked:

### Method 1: Check the list
- Go to Edge Functions → Settings
- You should see `OPENROUTER_API_KEY` in the list (value hidden)

### Method 2: Check Function Logs
- Go to Edge Functions → ai-proxy → Logs
- Send a message in your app
- Logs should show: "🤖 AI Proxy: openrouter - [model-name]"
- Should NOT show: "OpenRouter API key not configured"

### Method 3: Try the App
- Send message in AI chat
- Should get response
- No error notification

---

## Still Not Working?

If you still see the error after 30 seconds:

### Check 1: Verify Key Format
Your key should look like: `sk-or-v1-` followed by alphanumeric characters
- ✅ Correct: `sk-or-v1-8edccd1202f072ed...`
- ❌ Wrong: `"sk-or-v1-..."` (no quotes)
- ❌ Wrong: `VITE_OPENROUTER_API_KEY` (wrong name)

### Check 2: Redeploy Function (if needed)
```bash
# In terminal
npx supabase functions deploy ai-proxy
```

### Check 3: Test API Key Directly
Open terminal and run:
```bash
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer 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"
```

Should return your key info. If it returns an error, the key might be invalid.

---

## Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Went to Edge Functions → Settings
- [ ] Clicked "Add new secret"
- [ ] Entered name: `OPENROUTER_API_KEY` (no VITE_ prefix)
- [ ] Pasted value: `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`
- [ ] Clicked Save
- [ ] Waited 30 seconds
- [ ] Hard refreshed app (Ctrl+Shift+R)
- [ ] Tested AI chat

---

## After This Works

Once the API key is set, everything will work:
- ✅ AI chat with all models
- ✅ Code generation
- ✅ Image generation
- ✅ Video generation
- ✅ Voice synthesis
- ✅ Token tracking
- ✅ Rate limiting

Your security fixes are already deployed and working. This is just the configuration step.

---

**This is a ONE-TIME setup.** Once you set the environment variable, it stays there permanently and works for all Edge Function calls.
