# Remove .env Files from Git History

If you accidentally committed `.env` files containing API keys to GitHub, follow this guide immediately.

## ⚠️ CRITICAL FIRST STEP

**Before removing from Git, rotate ALL API keys immediately!**

Once a secret is pushed to GitHub (even for a second), consider it compromised. Rotate keys first, then clean history.

## Quick Fix (Recommended)

### Using BFG Repo-Cleaner

1. **Download BFG** from https://rsc.github.io/bfg-repo-cleaner/

2. **Clone a fresh copy** of your repo:
   ```bash
   git clone --mirror https://github.com/yourusername/yourrepo.git
   cd yourrepo.git
   ```

3. **Run BFG** to remove .env files:
   ```bash
   java -jar bfg.jar --delete-files '.env'
   java -jar bfg.jar --delete-files '.env.production'
   java -jar bfg.jar --delete-files '.env.local'
   ```

4. **Clean up** the repository:
   ```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

5. **Force push** to GitHub:
   ```bash
   git push --force
   ```

6. **Delete the mirror** and clone normally:
   ```bash
   cd ..
   rm -rf yourrepo.git
   git clone https://github.com/yourusername/yourrepo.git
   ```

## Alternative: Using git filter-repo (Fastest)

1. **Install git-filter-repo**:
   ```bash
   pip install git-filter-repo
   ```

2. **Remove .env files**:
   ```bash
   git filter-repo --path .env --invert-paths
   git filter-repo --path .env.production --invert-paths
   git filter-repo --path .env.local --invert-paths
   ```

3. **Force push**:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

## After Cleaning

### 1. Verify .gitignore

Ensure `.gitignore` contains:
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
.env*.local
```

### 2. Rotate All API Keys

**You MUST rotate every API key that was exposed:**

- [ ] Firebase API Key & Config
- [ ] Supabase URL & Anon Key
- [ ] OpenAI API Key
- [ ] OpenRouter API Key
- [ ] Claude API Key
- [ ] Gemini API Key
- [ ] HeyGen API Key
- [ ] ElevenLabs API Key
- [ ] DeepSeek API Key
- [ ] Suno API Key
- [ ] Fal.ai API Key
- [ ] Stripe Secret & Webhook Keys
- [ ] Any other service API keys

### 3. Update .env with New Keys

```bash
cp .env.example .env
# Fill in your NEW API keys
```

### 4. Notify Your Team

If working with a team:
```bash
# Everyone must re-clone the repo
git clone https://github.com/yourusername/yourrepo.git
```

### 5. Update Deployment

If you have existing deployments (Vercel, Netlify, etc.):
- Update all environment variables with new keys
- Trigger a new deployment

## Prevention

### Before Every Commit

```bash
# Check what you're committing
git status
git diff --cached

# If you see .env files, DON'T COMMIT!
git reset .env
git reset .env.production
```

### Use Pre-commit Hooks

Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh

# Check for .env files
if git diff --cached --name-only | grep -E '^\.env'; then
    echo "Error: Attempting to commit .env file!"
    echo "Please remove .env from staging: git reset .env"
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### GitHub Secret Scanning

- Enable secret scanning in repo settings
- Review and close any secret scanning alerts
- Set up notifications for new alerts

## Need Help?

If you're unsure about any step:
1. Stop and don't push anything else
2. Rotate all API keys immediately
3. Seek help from a senior developer
4. Review [SECURITY.md](./SECURITY.md) for detailed guidelines

## Verification

After cleaning, verify .env is gone:
```bash
git log --all --full-history --oneline -- .env
# Should return nothing

git log --all --full-history --oneline -- .env.production
# Should return nothing
```

If you still see results, the files are still in history. Repeat the removal process.
