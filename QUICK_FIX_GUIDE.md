# Quick Fix Guide - Premium Access Issue

## 🚨 Problem
Premium models appear locked even though you have 10,000,000 tokens.

## ✅ Solution (Choose One)

### Option 1: Apply Migration (Recommended)

The migration file has been created and will automatically fix the issue when deployed.

**Supabase CLI:**
```bash
supabase db push
```

**Supabase Dashboard:**
1. Go to SQL Editor
2. Paste the contents of: `supabase/migrations/20251031211604_fix_premium_access_token_sync.sql`
3. Click "Run"

### Option 2: Quick SQL Fix

Copy and paste this into Supabase SQL Editor:

```sql
-- Fix your account (replace with your email or user ID)
UPDATE profiles
SET
  paid_tokens_balance = GREATEST(
    COALESCE(paid_tokens_balance, 0),
    COALESCE(tokens_balance, 0)
  ),
  is_premium = true,
  current_tier = 'premium',
  is_paid = true,
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';
-- OR
WHERE id = 'YOUR_USER_ID_HERE';
```

### Option 3: Use Diagnostic Function

If migration is already applied:

```sql
-- Run diagnostic
SELECT * FROM diagnose_premium_access('your_user_id');

-- If issues found, fix it
SELECT * FROM fix_premium_access('your_user_id');
```

## 🧪 Verification

After applying fix:

1. **Hard refresh browser:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Check console logs:**
   - Should see: `"User is premium: true"`
   - Should see: `"result: PREMIUM"`
3. **Open model selector:**
   - Premium models should be unlocked
   - No lock icon on Claude Opus, GPT-5, etc.

## 📊 Check Your Status

```sql
-- See your current token status
SELECT
  email,
  tokens_balance,
  paid_tokens_balance,
  is_premium,
  current_tier
FROM profiles
WHERE email = 'your_email@example.com';
```

## 🐛 Still Having Issues?

1. **Clear browser cache completely**
2. **Sign out and sign back in**
3. **Check browser console for errors**
4. **Run diagnostic:**
   ```sql
   SELECT * FROM diagnose_premium_access('your_user_id');
   ```

## 📞 Get Help

If models are still locked after trying all options:

1. Check the `diagnosis` field from diagnostic function
2. Look at browser console logs
3. Verify token columns in database
4. Check if migration was applied successfully

## ⚡ Expected Result

After fix is applied:

- ✅ `paid_tokens_balance`: 10,000,000
- ✅ `is_premium`: true
- ✅ `current_tier`: premium
- ✅ All premium models unlocked
- ✅ Console shows: "PREMIUM"

## 🔄 Automatic Prevention

Once the migration is applied, a database trigger will:
- ✅ Keep token columns in sync automatically
- ✅ Update premium flags when tokens change
- ✅ Prevent this issue from happening again

---

**Estimated Fix Time:** 2-5 minutes
**Requires Database Access:** Yes (Supabase SQL Editor or CLI)
**Requires Code Deploy:** No (migration only)
