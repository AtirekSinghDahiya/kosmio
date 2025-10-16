# 🚀 Kroniq AI Deployment Checklist

## Pre-Deployment (Do This First!)

### ✅ Get Your API Keys
- [ ] **OpenAI** - Get key from https://platform.openai.com/api-keys
- [ ] **Claude** - Get key from https://console.anthropic.com/settings/keys
- [ ] **Gemini** - Get key from https://makersuite.google.com/app/apikey
- [ ] **Groq** - Get key from https://console.groq.com/keys (FREE!)
- [ ] **HeyGen** - Get key from https://app.heygen.com/settings/api
- [ ] **ElevenLabs** - Get key from https://elevenlabs.io/app/settings/api-keys
- [ ] DeepSeek - Optional from https://platform.deepseek.com/api_keys
- [ ] Kimi - Optional from https://platform.moonshot.cn/console/api-keys

**Note**: At minimum, you need ONE AI provider key (Groq is free!).

---

## Deployment Steps

### Step 1: Push to GitHub
```bash
# Run these commands in your terminal:

git init
git add .
git commit -m "Deploy Kroniq AI"
git remote add origin https://github.com/YOUR_USERNAME/kroniq-ai.git
git push -u origin main
```

- [ ] Code pushed to GitHub successfully

---

### Step 2: Import to Vercel

1. [ ] Go to https://vercel.com/new
2. [ ] Sign in with GitHub
3. [ ] Click "Import Project"
4. [ ] Select your `kroniq-ai` repository
5. [ ] Keep default settings:
   - Framework: Vite ✓
   - Build Command: `npm run build` ✓
   - Output Directory: `dist` ✓
6. [ ] Click "Deploy" (will fail - that's OK!)

---

### Step 3: Add Environment Variables

Go to: **Project → Settings → Environment Variables**

#### Group 1: Firebase (7 variables)
- [ ] `VITE_FIREBASE_API_KEY` = `AIzaSyAgD7C055XQLjZZCLaiCKfsZYz8r5XDqEQ`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `kroniq-ai.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `kroniq-ai`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `kroniq-ai.firebasestorage.app`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `171097290073`
- [ ] `VITE_FIREBASE_APP_ID` = `1:171097290073:web:7135cd156467ffff63c848`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` = `G-B24HV8XE06`

#### Group 2: Supabase (2 variables)
- [ ] `VITE_SUPABASE_URL` = `https://infzofivgbtzdcpzkypt.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnpvZml2Z2J0emRjcHpreXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzgwOTQsImV4cCI6MjA3NTc1NDA5NH0.Vt7rIQ9AybIxAXszsvXAdk0c8lEHAXr8cbNHGJWTKbI`

#### Group 3: AI Keys (Add YOUR actual keys)
- [ ] `VITE_OPENAI_API_KEY` = `sk-proj-YOUR-KEY`
- [ ] `VITE_CLAUDE_API_KEY` = `sk-ant-YOUR-KEY`
- [ ] `VITE_GEMINI_API_KEY` = `AIza-YOUR-KEY`
- [ ] `VITE_GROQ_API_KEY` = `gsk_YOUR-KEY`
- [ ] `VITE_HEYGEN_API_KEY` = `YOUR-KEY`
- [ ] `VITE_ELEVENLABS_API_KEY` = `sk_YOUR-KEY`
- [ ] `VITE_DEEPSEEK_API_KEY` = `sk-YOUR-KEY` (optional)
- [ ] `VITE_KIMI_API_KEY` = `sk-YOUR-KEY` (optional)

**IMPORTANT**: For each variable, check ALL 3 environment boxes:
- ✓ Production
- ✓ Preview
- ✓ Development

---

### Step 4: Redeploy

- [ ] Go to **Deployments** tab
- [ ] Click the three dots `...` on latest deployment
- [ ] Click "Redeploy"
- [ ] Wait 2-3 minutes
- [ ] Deployment should succeed!

---

### Step 5: Configure Supabase Edge Functions

1. [ ] Go to https://app.supabase.com
2. [ ] Select project: `infzofivgbtzdcpzkypt`
3. [ ] Navigate to **Edge Functions** → **Settings** → **Secrets**
4. [ ] Add these secrets (use same API keys as Vercel):

```
OPENAI_API_KEY=your-openai-key
CLAUDE_API_KEY=your-claude-key
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
HEYGEN_API_KEY=your-heygen-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

---

### Step 6: Configure Firebase

1. [ ] Go to https://console.firebase.google.com
2. [ ] Select project: `kroniq-ai`
3. [ ] Navigate to **Authentication** → **Settings** → **Authorized domains**
4. [ ] Click "Add domain"
5. [ ] Add your Vercel URL: `your-project-name.vercel.app`
6. [ ] Save

---

## Post-Deployment Testing

### ✅ Test Authentication
1. [ ] Visit your Vercel URL
2. [ ] Click "Sign Up"
3. [ ] Create test account
4. [ ] Verify you can sign in
5. [ ] Check Supabase dashboard - profile should be created

### ✅ Test AI Chat
1. [ ] Send a test message in chat
2. [ ] Verify AI responds
3. [ ] Try different AI models
4. [ ] Check responses are saving

### ✅ Test Video Generation
1. [ ] Go to Video Studio
2. [ ] Enter a test prompt
3. [ ] Verify video generates

### ✅ Test Voiceover Generation
1. [ ] Go to Voice Studio
2. [ ] Enter test text
3. [ ] Verify audio generates

### ✅ Performance Check
- [ ] Page loads in < 3 seconds
- [ ] No console errors (F12 → Console)
- [ ] All images load correctly
- [ ] Mobile responsive (test on phone)

---

## Troubleshooting Guide

### ❌ Build Failed
**Check:**
- [ ] All environment variables added?
- [ ] No TypeScript errors? (run `npm run build` locally)
- [ ] Dependencies installed? (check Vercel build logs)

**Fix:** Review Vercel logs, fix errors, redeploy

---

### ❌ "API Key Not Found"
**Check:**
- [ ] Variable name spelled correctly?
- [ ] All 3 environments checked?
- [ ] No extra spaces in keys?

**Fix:** Re-add variable, ensure exact spelling, redeploy

---

### ❌ Firebase Auth Not Working
**Check:**
- [ ] Vercel domain added to Firebase authorized domains?
- [ ] Firebase config correct in code?

**Fix:** Add domain to Firebase, redeploy

---

### ❌ Supabase Connection Failed
**Check:**
- [ ] Supabase URL correct?
- [ ] Anon key correct?
- [ ] Vercel domain added to Supabase CORS settings?

**Fix:** Verify credentials, add domain to Supabase allowed origins

---

### ❌ AI Not Responding
**Check:**
- [ ] API key valid and active?
- [ ] API key has credits/quota?
- [ ] Edge function secrets added to Supabase?

**Fix:** Check API provider dashboard, verify keys, check usage limits

---

## Success Criteria

### ✅ Deployment Successful When:
- [ ] Site loads at Vercel URL
- [ ] Can create account and sign in
- [ ] AI chat works with at least one model
- [ ] Messages save to database
- [ ] No critical console errors
- [ ] All pages accessible

---

## Optional: Custom Domain

### If You Have a Domain:

1. [ ] In Vercel: Settings → Domains → Add Domain
2. [ ] In domain provider (e.g., Hostinger):
   - Add A record: `@` → `76.76.21.21`
   - Add CNAME: `www` → `cname.vercel-dns.com`
3. [ ] Wait 24-48 hours for DNS propagation
4. [ ] Add custom domain to Firebase authorized domains

---

## 🎉 You're Done!

Your Kroniq AI application is now live and ready to use!

**Your live URL:** `https://your-project-name.vercel.app`

### Next Steps:
- Share with friends/team for testing
- Monitor Vercel analytics
- Check API usage regularly
- Gather user feedback
- Iterate and improve!

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Firebase Docs**: https://firebase.google.com/docs

**Questions?** Check the `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.
