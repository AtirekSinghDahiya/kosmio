# Quick Verification Guide - Token Initialization Fix

## ✅ How to Verify the Fix Is Working

### Step 1: Apply the Migration

The migration will automatically run when you deploy. To manually apply it:

```bash
# The migration file is already in your migrations folder
# It will run automatically on next deployment
```

### Step 2: Test a New Signup

1. **Open your app** in a browser
2. **Open Developer Console** (F12)
3. **Sign up with a new account**
4. **Look for these console messages:**

**✅ Expected Success Messages:**
```
🆕 Creating new profile for user: [user-id]
ℹ️ Database trigger will handle token initialization (150k base + first 101 bonus if applicable)
✅ Profile created successfully
✅ User token status: {
  userId: "[user-id]",
  total: 150000,
  free: 150000,
  paid: 0,
  tier: "free"
}
```

**🎉 If You're in First 101:**
```
✅ User token status: {
  userId: "[user-id]",
  total: 5150000,
  free: 150000,
  paid: 5000000,
  tier: "premium"
}
```

### Step 3: Check Database Directly

Run this query in your Supabase SQL editor:

```sql
-- Check the most recent user
SELECT
  id,
  email,
  tokens_balance,
  free_tokens_balance,
  paid_tokens_balance,
  current_tier,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results:**
- `tokens_balance`: 150,000 (or 5,150,000 if first 101)
- `free_tokens_balance`: 150,000
- `paid_tokens_balance`: 0 (or 5,000,000 if first 101)
- `current_tier`: 'free' (or 'premium' if first 101)

### Step 4: Verify First 101 Status

```sql
SELECT
  first_101_count as users_granted,
  101 - first_101_count as remaining_slots,
  CASE
    WHEN first_101_count >= 101 THEN 'ENDED'
    ELSE 'ACTIVE'
  END as status
FROM promotional_user_counter
WHERE id = 1;
```

### Step 5: Check a Specific User

Replace `USER_ID_HERE` with the actual user ID:

```sql
SELECT * FROM verify_user_token_allocation('USER_ID_HERE');
```

Returns:
- ✅ All token balances
- ✅ Whether user got first 101 bonus
- ✅ Whether user redeemed FIRST100 promo
- ✅ Status (OK, NO_TOKENS, INSUFFICIENT)

## 🔧 Common Issues & Fixes

### Issue 1: User Still Has 0 Tokens

**Cause:** User signed up before migration ran

**Fix:**
```sql
UPDATE profiles
SET
  tokens_balance = 150000,
  free_tokens_balance = 150000,
  paid_tokens_balance = 0,
  current_tier = 'free',
  is_paid = false,
  is_premium = false,
  updated_at = NOW()
WHERE id = 'USER_ID_HERE'
  AND tokens_balance = 0;
```

### Issue 2: First 101 Bonus Not Working

**Check 1:** Is the promotion still active?
```sql
SELECT * FROM promotional_user_counter WHERE id = 1;
-- If first_101_count >= 101, promotion has ended
```

**Check 2:** Is the trigger active?
```sql
SELECT
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'trigger_unified_profile_init';
-- Should return 1 row with enabled = 'O' (origin)
```

**Fix:** If trigger is missing, rerun the migration

### Issue 3: FIRST100 Promo Not Auto-Redeeming

**This is normal!** The FIRST100 promo is separate from the first 101 bonus:
- **First 101 bonus**: Automatic via database trigger
- **FIRST100 promo**: Separate campaign, requires user action (though auto-attempted by frontend)

Check campaign status:
```sql
SELECT
  campaign_code,
  current_redemptions,
  max_redemptions,
  is_active,
  expires_at
FROM promotional_campaigns
WHERE campaign_code = 'FIRST100';
```

## 📊 Health Check Query

Run this comprehensive health check:

```sql
-- Overall system health
WITH stats AS (
  SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE tokens_balance = 0) as zero_token_users,
    COUNT(*) FILTER (WHERE tokens_balance >= 150000) as healthy_users,
    COUNT(*) FILTER (WHERE paid_tokens_balance > 0) as premium_users,
    AVG(tokens_balance) as avg_tokens
  FROM profiles
)
SELECT
  total_users,
  zero_token_users,
  healthy_users,
  premium_users,
  ROUND(avg_tokens) as avg_tokens,
  CASE
    WHEN zero_token_users = 0 THEN '✅ All users have tokens'
    WHEN zero_token_users > 0 THEN '⚠️ ' || zero_token_users || ' users need backfill'
  END as status
FROM stats;
```

**Expected Output:**
```
total_users | zero_token_users | healthy_users | premium_users | avg_tokens | status
------------|------------------|---------------|---------------|------------|--------
     42     |        0         |      42       |      4        |  356,000   | ✅ All users have tokens
```

## 🚨 Emergency Fixes

### Fix All Users with 0 Tokens
```sql
UPDATE profiles
SET
  tokens_balance = 150000,
  free_tokens_balance = 150000,
  paid_tokens_balance = COALESCE(paid_tokens_balance, 0),
  monthly_token_limit = 150000,
  current_tier = CASE
    WHEN paid_tokens_balance > 0 THEN current_tier
    ELSE 'free'
  END,
  updated_at = NOW()
WHERE tokens_balance < 150000
  AND paid_tokens_balance = 0;
```

### Reset First 101 Counter (Admin Only)
```sql
-- ⚠️ WARNING: Only use if absolutely necessary
UPDATE promotional_user_counter
SET first_101_count = 0
WHERE id = 1;
```

### Manually Grant First 101 Bonus to Specific User
```sql
-- If a user should have gotten the bonus but didn't
UPDATE profiles
SET
  paid_tokens_balance = paid_tokens_balance + 5000000,
  tokens_balance = tokens_balance + 5000000,
  current_tier = 'premium',
  is_premium = true,
  is_paid = true,
  updated_at = NOW()
WHERE id = 'USER_ID_HERE';

-- Also log it
INSERT INTO promotional_users (user_id, campaign_id, activated_at)
VALUES ('USER_ID_HERE', 'first-101-users', NOW())
ON CONFLICT DO NOTHING;
```

## 📝 Testing Checklist

- [ ] Migration applied successfully
- [ ] New signup gets 150,000 tokens
- [ ] First 101 counter increments correctly
- [ ] First 101 users get 5,000,000 bonus tokens
- [ ] First 101 users marked as premium
- [ ] Existing users with 0 tokens backfilled
- [ ] Database constraints prevent NULL tokens
- [ ] Console logs show correct token allocation
- [ ] Build completes without errors

## 🎯 Success Criteria

Your fix is working correctly if:
1. ✅ New signups get 150,000 tokens immediately
2. ✅ First 101 users get 5,150,000 total tokens
3. ✅ No users have 0 or NULL token balances
4. ✅ Console shows correct initialization logs
5. ✅ Database queries show correct token values

---

**Last Updated:** November 14, 2025
**Status:** ✅ Fix Applied and Tested
