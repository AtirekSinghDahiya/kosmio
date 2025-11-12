# Get the CORRECT OpenRouter API Key

## Current Status:
- ✅ You have $1.44 in credits (account is valid)
- ❌ Both keys tried return "User not found" error
- ⚠️ You might be copying the key from the wrong place

---

## Step-by-Step Guide:

### Step 1: Make Sure You're in the Right Account
1. Go to: https://openrouter.ai/settings/credits
2. Verify you see **$1.44** in credits (matching your screenshot)
3. If yes, you're in the right account

### Step 2: Navigate to API Keys Section
**Direct link:** https://openrouter.ai/settings/keys

OR manually:
1. Click your profile icon (top right)
2. Click **"API Keys"** in the left sidebar
3. NOT "Credits", NOT "Usage" - specifically **"API Keys"**

### Step 3: Look for Existing Keys
On the API Keys page, you should see:
- A button: "Create Key" or "+ New Key"
- OR a list of existing keys

### Step 4: Create a NEW Key (Recommended)
1. Click **"Create Key"** or **"+ New Key"**
2. Give it a name (e.g., "KroniQ AI App")
3. Leave other settings as default
4. Click **"Create"**
5. **IMPORTANT:** Copy the key IMMEDIATELY (it's shown only once!)

### Step 5: Copy the FULL Key
- The key is LONG (80+ characters)
- Starts with: `sk-or-v1-`
- Make sure you copy the ENTIRE string
- Don't add any spaces or line breaks

---

## Common Mistakes:

### ❌ Wrong Section:
- Don't copy from "Credits" page
- Don't copy from "Usage" page
- Don't copy from "Models" page

### ❌ Wrong Key Type:
- Don't copy organization keys
- Don't copy read-only keys
- Use a standard API key

### ❌ Expired or Deleted Key:
- If you see old keys, they might be revoked
- Create a BRAND NEW key

---

## Alternative: Share Screenshot

If you're still having trouble:
1. Go to: https://openrouter.ai/settings/keys
2. Take a screenshot (blur out the actual key value if shown)
3. Share the screenshot so I can see what you're seeing
4. This will help me identify what's wrong

---

## After You Get the Correct Key:

Once you have a valid key that starts with `sk-or-v1-...`:

1. **Update .env file:**
   ```bash
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-new-key-here
   ```

2. **Stop the dev server:**
   - In terminal, press `Ctrl+C`

3. **Start it again:**
   ```bash
   npm run dev
   ```

4. **Hard refresh browser:**
   - Windows: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

5. **Test AI chat**

---

## Quick Test (Without Updating):

You can test if a key is valid BEFORE updating your .env file:

```bash
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer YOUR-KEY-HERE"
```

**Valid key response:**
```json
{
  "data": {
    "label": "Your Key Name",
    "usage": 1.44,
    ...
  }
}
```

**Invalid key response:**
```json
{"error":{"message":"User not found.","code":401}}
```

---

## Need Help?

If you're still stuck:
1. Share a screenshot of the OpenRouter API Keys page
2. OR tell me exactly what you see when you click "API Keys"
3. I can help troubleshoot from there
