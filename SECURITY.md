# Security Guidelines

## Environment Variables

This project uses environment variables to manage sensitive configuration like API keys. **Never commit real API keys to version control.**

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API keys in `.env`

3. The `.env` file is already in `.gitignore` and will not be committed

### Removing .env from Git History

If you accidentally committed `.env` files to Git, follow these steps to remove them from history:

#### Option 1: Using BFG Repo-Cleaner (Recommended)

1. Download BFG from https://rsc.github.io/bfg-repo-cleaner/

2. Make a backup of your repository

3. Remove .env files from history:
   ```bash
   java -jar bfg.jar --delete-files .env
   java -jar bfg.jar --delete-files .env.production
   java -jar bfg.jar --delete-files .env.local
   ```

4. Clean up and force push:
   ```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all
   git push origin --force --tags
   ```

#### Option 2: Using git filter-branch

```bash
# Remove .env from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.production .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote
git push origin --force --all
git push origin --force --tags
```

#### Option 3: Using git filter-repo (Fastest)

1. Install git-filter-repo:
   ```bash
   pip install git-filter-repo
   ```

2. Remove .env files:
   ```bash
   git filter-repo --path .env --invert-paths
   git filter-repo --path .env.production --invert-paths
   git filter-repo --path .env.local --invert-paths
   ```

3. Force push:
   ```bash
   git push origin --force --all
   ```

### After Removing from History

**IMPORTANT:** After removing sensitive files from Git history, you MUST:

1. **Rotate all exposed API keys immediately**
2. **Generate new API keys** from each service provider
3. **Update your `.env` file** with the new keys
4. **Notify your team** to pull the cleaned repository
5. **Update deployment environments** with new keys

### API Key Rotation Checklist

If your API keys were exposed, rotate them in this order:

- [ ] Firebase Configuration (Project Settings → General)
- [ ] Supabase Keys (Project Settings → API)
- [ ] OpenAI API Key (https://platform.openai.com/api-keys)
- [ ] OpenRouter API Key (https://openrouter.ai/keys)
- [ ] Claude API Key (https://console.anthropic.com/settings/keys)
- [ ] Google Gemini API Key (https://makersuite.google.com/app/apikey)
- [ ] HeyGen API Key (https://app.heygen.com/settings/api-keys)
- [ ] ElevenLabs API Key (https://elevenlabs.io/app/settings/api-keys)
- [ ] DeepSeek API Key
- [ ] Suno API Key
- [ ] Fal.ai API Key (https://fal.ai/dashboard/keys)
- [ ] Stripe Keys (https://dashboard.stripe.com/apikeys)
- [ ] All other service API keys

## Best Practices

1. **Never hardcode API keys** in source code
2. **Always use environment variables** via `import.meta.env.VITE_*` or `Deno.env.get()`
3. **Use different keys** for development and production
4. **Rotate keys regularly** (every 90 days minimum)
5. **Use key restrictions** when available (IP allowlists, referrer restrictions)
6. **Monitor API usage** for suspicious activity
7. **Use secret scanning tools** like GitHub's secret scanning or GitGuardian

## Supabase Edge Functions

Edge functions use Supabase's built-in secret management:

1. Set secrets via Supabase CLI:
   ```bash
   supabase secrets set OPENAI_API_KEY=your_key_here
   supabase secrets set ELEVENLABS_API_KEY=your_key_here
   ```

2. Or via Supabase Dashboard:
   - Go to Project Settings → Edge Functions → Secrets
   - Add your secrets there

3. Access in functions via:
   ```typescript
   const apiKey = Deno.env.get("OPENAI_API_KEY");
   ```

## Reporting Security Issues

If you discover a security vulnerability, please email security@kroniq.ai instead of using the issue tracker.

Do NOT:
- Post API keys in issues, pull requests, or discussions
- Share production credentials in Slack, Discord, or other chat platforms
- Commit any files containing secrets to the repository
