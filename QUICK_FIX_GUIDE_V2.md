# Quick Fix Guide - Premium Model Access Issue

## Immediate Action Required

Your users with 10M tokens cannot access premium models because of a synchronization issue between token balances and premium status flags.

## What Was Fixed

✅ **3 New Files Created**:
1. `src/lib/unifiedPremiumAccess.ts` - Single source of truth for premium checks
2. `src/lib/tokenPurchaseHandler.ts` - Ensures purchases set all required flags
3. `supabase/migrations/20251031225618_fix_premium_access_complete.sql` - Database fix

✅ **1 File Updated**:
1. `src/components/Chat/AIModelSelector.tsx` - Now uses unified premium check

## How to Apply (3 Steps)

### Step 1: Deploy the Database Migration

The migration file will automatically:
- Create a trigger that syncs premium flags with token balance
- Fix ALL existing users who have tokens but no premium access
- Report how many users were fixed

**To apply**:
```bash
# Build succeeded, migration is ready
# On next deployment, it will run automatically
```

Or manually via Supabase dashboard SQL editor:
- Go to SQL Editor
- Paste contents of `supabase/migrations/20251031225618_fix_premium_access_complete.sql`
- Click "Run"

### Step 2: Restart Your Application

After migration runs:
```bash
# The build already passed
npm run build
# Deploy/restart your app
```

### Step 3: Verify It Works

1. **Check Migration Output**:
Look for this in logs:
```
✅ [EMERGENCY FIX] Fixed N users with premium access
Mismatched Records (should be 0): 0
```

2. **Test in Browser**:
- Log in as user with tokens
- Open AI model selector
- Click refresh icon (🔄)
- Premium models should now be unlocked

3. **Check Console**:
Should see:
```
✅✅✅ [UNIFIED PREMIUM] USER HAS PREMIUM ACCESS ✅✅✅
   Paid Tokens: 10000000
   Premium Status: TRUE
```

## If User Still Has Issues

Run this SQL in Supabase dashboard:

```sql
-- Replace 'USER_FIREBASE_ID' with actual Firebase UID
SELECT fix_user_premium_status('USER_FIREBASE_ID');
```

This manually fixes any specific user account.

## What Changed Under the Hood

### Before (Broken):
```
User purchases tokens
  ↓
paid_tokens_balance = 10000000 ✅
is_premium = null ❌
is_paid = null ❌
current_tier = 'free' ❌
  ↓
Premium check sees flags, not balance
  ↓
Models stay locked 🔒
```

### After (Fixed):
```
User purchases tokens OR has tokens
  ↓
Trigger fires automatically
  ↓
paid_tokens_balance = 10000000 ✅
is_premium = true ✅
is_paid = true ✅
current_tier = 'ultra-premium' ✅
Synced to paid_tier_users table ✅
  ↓
Premium check sees everything
  ↓
Models unlock immediately 🔓
```

## Verification SQL Queries

### Check if fix worked:
```sql
SELECT
  COUNT(*) as users_with_tokens,
  COUNT(*) FILTER (WHERE is_premium = true) as properly_flagged,
  COUNT(*) FILTER (WHERE is_premium IS NOT true) as still_broken
FROM profiles
WHERE paid_tokens_balance > 0;
```

**Expected result**: `still_broken = 0`

### Check specific user:
```sql
SELECT
  email,
  paid_tokens_balance,
  is_premium,
  is_paid,
  current_tier
FROM profiles
WHERE email = 'user@example.com';
```

## Support Script

If you need to fix multiple users manually:

```sql
-- Fix all users with tokens
DO $$
DECLARE
  v_user_id text;
  v_count integer := 0;
BEGIN
  FOR v_user_id IN
    SELECT id FROM profiles WHERE paid_tokens_balance > 0
  LOOP
    PERFORM fix_user_premium_status(v_user_id);
    v_count := v_count + 1;
  END LOOP;
  RAISE NOTICE 'Fixed % users', v_count;
END $$;
```

## What This Fixes

1. ✅ Users with tokens can now access premium models
2. ✅ Premium badge displays correctly
3. ✅ Model selector shows "Premium Access"
4. ✅ All premium models unlock
5. ✅ Token balance displays correctly
6. ✅ Future purchases work automatically
7. ✅ No more cache conflicts
8. ✅ No more auth system conflicts

## Timeline

- **Now**: Deploy migration
- **Immediately**: All existing users fixed automatically
- **Going forward**: All new purchases work correctly

## Monitoring

Add this to your monitoring/alerting:

```sql
-- Run daily - should always return 0
SELECT COUNT(*)
FROM profiles
WHERE paid_tokens_balance > 0
  AND is_premium IS NOT TRUE;
```

If this ever returns > 0, run the emergency fix again.

## Questions?

See `PREMIUM_ACCESS_COMPREHENSIVE_FIX.md` for:
- Complete root cause analysis
- Detailed technical explanation
- All code changes documented
- Rollback procedures
- Advanced troubleshooting

---

**Status**: ✅ Fix complete, ready to deploy
**Risk**: Low - migration is idempotent and non-destructive
**Urgency**: High - affects all premium users
**Downtime**: None - migration runs in background
