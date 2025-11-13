# OpenRouter API Key Fix - Complete Guide

## Problem Identified

Your OpenRouter API key is **LOADED CORRECTLY** but it's **INVALID or EXPIRED**. The debug panel shows:
- ✅ Environment variable `VITE_OPENROUTER_API_KEY` is SET
- ✅ Key has correct format: `sk-or-v1-...`
- ❌ OpenRouter returns "User not found" authentication error

## The Fix: Get a New API Key

### Step 1: Get Your API Key from OpenRouter

1. Go to **https://openrouter.ai/keys**
2. Sign in or create an account
3. Click "Create Key" to generate a new API key
4. Copy the entire key (starts with `sk-or-v1-`)

### Step 2: Update Your Environment Variables

Since you're using **bolt.new**, you have TWO options:

#### Option A: Update via Bolt.new Settings (Recommended)
1. Look for a settings/configuration panel in bolt.new
2. Find "Environment Variables" or similar section
3. Update `VITE_OPENROUTER_API_KEY` with your new key
4. Save and restart the application

#### Option B: Update the .env file
1. Open `/tmp/cc-agent/58453417/project/.env`
2. Replace the value of `VITE_OPENROUTER_API_KEY` with your new key
3. Note: Bolt.new may require additional configuration to read this file

### Step 3: Verify the Fix

After updating the key:

1. **Refresh your browser** (you may need a hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Look for the **blue "API Key Validator"** panel at the top-right
3. Click **"Test OpenRouter API Key"** button
4. If successful, you'll see ✅ and key details
5. Try sending a message in the chat

## Debug Tools Available

We've added TWO debug panels to help you:

### 1. Environment Variables Debug Panel (Bottom-Right, Red)
- Shows all VITE_ environment variables
- Displays which keys are SET vs MISSING
- Shows key lengths (masked for security)

### 2. API Key Validator (Top-Right, Blue)
- Tests your OpenRouter API key in real-time
- Makes an actual API call to verify authentication
- Shows detailed success/error messages
- Provides step-by-step fix instructions

## Current Key Information

Your current key in the .env file is:
```
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
```

This key is being loaded but **OpenRouter rejects it** with "User not found" error.

## Why This Happened

Possible reasons:
1. The API key was deleted from your OpenRouter account
2. The key expired or was revoked
3. The key belongs to a different account
4. OpenRouter had an issue with this specific key

## Next Steps

1. **Get a new API key** from https://openrouter.ai/keys
2. **Update the environment variable** (see Step 2 above)
3. **Test the new key** using the API Key Validator panel
4. **Once verified**, remove the debug panels (we can do this for you)

## Need Help?

If you continue to see authentication errors after updating the key:
1. Check the browser console (F12) for detailed error logs
2. Verify the key is correctly copied (no extra spaces)
3. Make sure you're signed in to the correct OpenRouter account
4. Try creating a completely new key instead of reusing an old one

---

**Status:** Environment setup is correct ✅ | API key needs replacement ⚠️
