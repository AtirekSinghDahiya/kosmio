# Kroniq AI - Vercel Deployment Guide

## 🚀 Quick Deploy Steps

### Step 1: Get Your API Keys Ready

You need to add your actual API keys to the project. Replace the placeholder values in `.env` file:

```bash
# AI API Keys - GET THESE FROM YOUR ACCOUNTS:

# OpenAI (https://platform.openai.com/api-keys)
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Claude (https://console.anthropic.com/settings/keys)
VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# Google Gemini (https://makersuite.google.com/app/apikey)
VITE_GEMINI_API_KEY=AIzaxxxxxxxxxxxxx

# Groq (https://console.groq.com/keys)
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# HeyGen (https://app.heygen.com/settings/api)
VITE_HEYGEN_API_KEY=xxxxxxxxxxxxx

# ElevenLabs (https://elevenlabs.io/app/settings/api-keys)
VITE_ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx

# DeepSeek (https://platform.deepseek.com/api_keys)
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx

# Kimi (https://platform.moonshot.cn/console/api-keys)
VITE_KIMI_API_KEY=sk-xxxxxxxxxxxxx
```

---

## 📋 Pre-Deployment Checklist

### ✅ Already Configured (No Action Needed):
- [x] Firebase Authentication setup
- [x] Supabase database configured
- [x] Supabase Edge Functions deployed
- [x] Build configuration ready

### 🔑 You Need To Add:
- [ ] OpenAI API Key (for GPT models)
- [ ] Claude API Key (for Claude models)
- [ ] Gemini API Key (for Google models)
- [ ] Groq API Key (for Llama models)
- [ ] HeyGen API Key (for video generation)
- [ ] ElevenLabs API Key (for voice generation)
- [ ] DeepSeek API Key (optional)
- [ ] Kimi API Key (optional)

---

## 🌐 Vercel Deployment Methods

### Method 1: Deploy via GitHub (Recommended)

#### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Deploy Kroniq AI to Vercel"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/kroniq-ai.git
git branch -M main
git push -u origin main
```

#### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your `kroniq-ai` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Step 3: Add Environment Variables in Vercel

**CRITICAL**: You MUST add these environment variables in Vercel dashboard:

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable below (copy-paste carefully):

##### Firebase Variables:
```
VITE_FIREBASE_API_KEY=AIzaSyAgD7C055XQLjZZCLaiCKfsZYz8r5XDqEQ
VITE_FIREBASE_AUTH_DOMAIN=kroniq-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kroniq-ai
VITE_FIREBASE_STORAGE_BUCKET=kroniq-ai.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=171097290073
VITE_FIREBASE_APP_ID=1:171097290073:web:7135cd156467ffff63c848
VITE_FIREBASE_MEASUREMENT_ID=G-B24HV8XE06
```

##### Supabase Variables:
```
VITE_SUPABASE_URL=https://infzofivgbtzdcpzkypt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnpvZml2Z2J0emRjcHpreXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzgwOTQsImV4cCI6MjA3NTc1NDA5NH0.Vt7rIQ9AybIxAXszsvXAdk0c8lEHAXr8cbNHGJWTKbI
```

##### AI API Keys (ADD YOUR ACTUAL KEYS):
```
VITE_OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
VITE_CLAUDE_API_KEY=sk-ant-YOUR-KEY-HERE
VITE_GEMINI_API_KEY=AIza-YOUR-KEY-HERE
VITE_GROQ_API_KEY=gsk_YOUR-KEY-HERE
VITE_HEYGEN_API_KEY=YOUR-KEY-HERE
VITE_ELEVENLABS_API_KEY=sk_YOUR-KEY-HERE
VITE_DEEPSEEK_API_KEY=sk-YOUR-KEY-HERE
VITE_KIMI_API_KEY=sk-YOUR-KEY-HERE
```

**Important**:
- Check all 3 environments: Production, Preview, Development
- Click "Save" after adding each variable

#### Step 4: Deploy
- Click "Deploy" button
- Wait 2-3 minutes
- Your app will be live at: `https://your-project.vercel.app`

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
# From project directory
vercel

# Follow prompts:
# Set up and deploy? Y
# Which scope? (select your account)
# Link to existing project? N
# What's your project's name? kroniq-ai
# In which directory is your code located? ./
# Want to override settings? N
```

#### Step 4: Add Environment Variables via CLI
```bash
# Firebase
vercel env add VITE_FIREBASE_API_KEY production
# Paste: AIzaSyAgD7C055XQLjZZCLaiCKfsZYz8r5XDqEQ

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Paste: kroniq-ai.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Paste: kroniq-ai

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Paste: kroniq-ai.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Paste: 171097290073

vercel env add VITE_FIREBASE_APP_ID production
# Paste: 1:171097290073:web:7135cd156467ffff63c848

vercel env add VITE_FIREBASE_MEASUREMENT_ID production
# Paste: G-B24HV8XE06

# Supabase
vercel env add VITE_SUPABASE_URL production
# Paste: https://infzofivgbtzdcpzkypt.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnpvZml2Z2J0emRjcHpreXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzgwOTQsImV4cCI6MjA3NTc1NDA5NH0.Vt7rIQ9AybIxAXszsvXAdk0c8lEHAXr8cbNHGJWTKbI

# AI Keys - ADD YOUR ACTUAL KEYS
vercel env add VITE_OPENAI_API_KEY production
vercel env add VITE_CLAUDE_API_KEY production
vercel env add VITE_GEMINI_API_KEY production
vercel env add VITE_GROQ_API_KEY production
vercel env add VITE_HEYGEN_API_KEY production
vercel env add VITE_ELEVENLABS_API_KEY production
vercel env add VITE_DEEPSEEK_API_KEY production
vercel env add VITE_KIMI_API_KEY production
```

#### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## 🔐 Supabase Edge Functions Configuration

Your Edge Functions are already deployed, but you need to add API keys to Supabase:

### Step 1: Go to Supabase Dashboard
1. Visit [app.supabase.com](https://app.supabase.com)
2. Select your project: `infzofivgbtzdcpzkypt`
3. Go to **Edge Functions** → **Settings** → **Secrets**

### Step 2: Add API Secrets
Add these secrets (use your actual API keys):

```
OPENAI_API_KEY=sk-proj-xxxxx
CLAUDE_API_KEY=sk-ant-xxxxx
GEMINI_API_KEY=AIzaxxxxx
GROQ_API_KEY=gsk_xxxxx
HEYGEN_API_KEY=xxxxx
ELEVENLABS_API_KEY=sk_xxxxx
DEEPSEEK_API_KEY=sk-xxxxx
KIMI_API_KEY=sk-xxxxx
```

**Note**: These are used by Edge Functions for server-side AI calls.

---

## 🌍 Custom Domain Setup (Optional)

### If you have a custom domain:

#### Step 1: In Vercel
1. Go to project → **Settings** → **Domains**
2. Click "Add Domain"
3. Enter your domain: `kroniq.ai`

#### Step 2: In Domain Provider (e.g., Hostinger)
Add these DNS records:

**For apex domain (kroniq.ai):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### Step 3: Wait for DNS Propagation
- Usually takes 15 minutes to 48 hours
- SSL certificate will be auto-generated

---

## ✅ Post-Deployment Testing

### 1. Test Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Check Supabase dashboard for profile creation

### 2. Test AI Features
- [ ] Chat with GPT-4
- [ ] Chat with Claude
- [ ] Chat with Gemini
- [ ] Generate an image
- [ ] Generate a video
- [ ] Generate a voiceover

### 3. Test Database
- [ ] Send messages (should save to Supabase)
- [ ] Create new project
- [ ] Switch between projects
- [ ] Check messages persist after refresh

### 4. Check Performance
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] All images load correctly
- [ ] Mobile responsive

---

## 🔧 Troubleshooting

### Issue: Build Failed
**Solution:**
```bash
# Test build locally first
npm run build

# Check Vercel logs
vercel logs

# Common fixes:
- Add missing environment variables
- Fix TypeScript errors
- Clear cache and redeploy
```

### Issue: Environment Variables Not Working
**Solution:**
1. Verify all variables are added in Vercel dashboard
2. Ensure variable names match exactly (case-sensitive)
3. Check you selected all 3 environments
4. Redeploy after adding variables

### Issue: Firebase Auth Not Working
**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project → Authentication → Settings
3. **Authorized domains** → Add your Vercel domain:
   - `your-project.vercel.app`
   - Your custom domain if using one

### Issue: API Keys Not Working
**Solution:**
1. Verify keys are correct and active
2. Check API provider dashboards for usage limits
3. Ensure keys have proper permissions
4. Test keys locally first

### Issue: Supabase Connection Failed
**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Project Settings → API
3. **API Settings** → Add your Vercel domain to allowed origins
4. Include both `.vercel.app` and custom domain

---

## 📊 Monitoring & Analytics

### Vercel Dashboard
- **Deployments**: View build logs and status
- **Analytics**: Track page views and performance
- **Logs**: Real-time function logs
- **Usage**: Monitor bandwidth and function invocations

### Supabase Dashboard
- **Database**: Query performance and storage
- **Edge Functions**: Invocation logs
- **Auth**: User signups and activity
- **Storage**: File uploads and usage

---

## 💰 Cost Estimates

### Vercel Free Tier (Sufficient to Start):
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Serverless functions
- ✅ Custom domains
- ✅ Automatic SSL

### Upgrade When Needed:
- **Vercel Pro**: $20/month (more bandwidth & features)
- **Supabase Pro**: $25/month (more DB storage & bandwidth)

### Estimated Monthly Cost: $0 - $45
- Start free, upgrade as you grow

---

## 🎯 Next Steps After Deployment

1. **Test Everything** - Run through full user flow
2. **Add Custom Domain** - Make it professional
3. **Set Up Monitoring** - Track errors and usage
4. **Optimize Performance** - Enable Vercel Analytics
5. **Share & Launch** - Get users and feedback!

---

## 🚨 Important Reminders

1. **Never commit `.env` file to Git**
   - Add to `.gitignore`
   - Use Vercel environment variables

2. **Keep API Keys Secret**
   - Don't share in screenshots
   - Rotate keys if exposed
   - Monitor usage regularly

3. **Test Before Production**
   - Use preview deployments
   - Test all features
   - Check mobile responsive

4. **Monitor Costs**
   - Set up usage alerts
   - Check API provider dashboards
   - Monitor Vercel analytics

---

## 📞 Support

If you encounter issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Visit [Vercel Discord](https://vercel.com/discord)
- Check [Supabase Docs](https://supabase.com/docs)
- Review error logs in dashboards

---

**Your app is ready to deploy! 🚀**

Choose Method 1 (GitHub) for continuous deployment, or Method 2 (CLI) for quick one-time deployment.
