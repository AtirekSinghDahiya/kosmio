# Token Initialization Fix - Complete Solution

## Problem Summary

New users signing up were not receiving their initial token allocation:
- ❌ Not getting the 150,000 base free tokens
- ❌ Not getting the 5,000,000 tokens for first 101 users promotion
- ❌ Received 0 tokens or sometimes only 5,000 tokens

## Root Causes Identified

### 1. Conflicting Database Triggers
- **`handle_new_user()` trigger** on `auth.users` table set tokens to 5,000
- **`grant_first_101_bonus_atomic()` trigger** on `profiles` table tried to add 5M tokens
- These triggers ran at different times causing race conditions
- The auth.users trigger ran BEFORE the frontend created the profile

### 2. Wrong Default Values
- Latest migration set `free_tokens_balance DEFAULT 1000` instead of 150,000
- `tokens_balance DEFAULT 1000` instead of 150,000
- Defaults were overridden multiple times by different migrations

### 3. Frontend Duplication
- `AuthContext.tsx` was manually setting token values during profile creation
- This duplicated (and sometimes conflicted with) database trigger logic
- Hard-coded values could get out of sync with database defaults

### 4. Multiple Token Systems
- **Base allocation**: 150k tokens for all users
- **First 101 bonus**: 5M tokens for first 101 users
- **FIRST100 promo**: Separate promotional campaign
- These systems weren't properly coordinated

## Solution Implemented

### Migration: `20251114000000_fix_token_initialization_comprehensive.sql`

This comprehensive migration does the following:

#### Part 1: Clean Up Conflicting Systems
```sql
-- Dropped all conflicting triggers:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TRIGGER IF EXISTS trigger_grant_first_101_bonus_atomic ON profiles;
DROP FUNCTION IF EXISTS grant_first_101_bonus_atomic();
```

#### Part 2: Set Correct Defaults
```sql
ALTER TABLE profiles
  ALTER COLUMN tokens_balance SET DEFAULT 150000,
  ALTER COLUMN free_tokens_balance SET DEFAULT 150000,
  ALTER COLUMN paid_tokens_balance SET DEFAULT 0,
  ALTER COLUMN monthly_token_limit SET DEFAULT 150000;
```

#### Part 3: Create Unified Initialization Trigger
Created a single `unified_profile_initialization()` function that:
1. **Sets base allocation** - 150,000 tokens for ALL new users
2. **Checks first 101 bonus** - Atomically increments counter and grants 5M tokens if user is in first 101
3. **Marks premium status** - Users who get first 101 bonus are marked as premium
4. **Logs everything** - Detailed logging for debugging

```sql
CREATE TRIGGER trigger_unified_profile_init
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION unified_profile_initialization();
```

#### Part 4: Backfill Existing Users
```sql
UPDATE profiles
SET
  tokens_balance = GREATEST(COALESCE(tokens_balance, 0), 150000),
  free_tokens_balance = GREATEST(COALESCE(free_tokens_balance, 0), 150000)
WHERE
  tokens_balance < 150000
  AND paid_tokens_balance = 0;  -- Only fix free users
```

#### Part 5: Add Safety Constraints
```sql
ALTER TABLE profiles ADD CONSTRAINT check_tokens_not_null
  CHECK (tokens_balance IS NOT NULL AND tokens_balance >= 0);
```

### Frontend Changes: `AuthContext.tsx`

#### Before (Problematic)
```typescript
// Hard-coded token values that could get out of sync
const result = await supabase.from('profiles').insert({
  id: userId,
  email,
  tokens_balance: 150000,        // Hard-coded
  free_tokens_balance: 150000,   // Hard-coded
  paid_tokens_balance: 0,        // Hard-coded
  // ... many more fields
});
```

#### After (Clean)
```typescript
// Database trigger handles ALL token initialization
const result = await supabase.from('profiles').insert({
  id: userId,
  email,
  display_name: displayName || email.split('@')[0],
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
  // No token fields - database trigger handles everything
});
```

## How It Works Now

### New User Signup Flow

1. **User signs up** (email/password or Google OAuth)
2. **Frontend creates profile** with minimal data (just ID, email, display name)
3. **Database trigger fires** (`unified_profile_initialization`)
   - Sets 150,000 base tokens
   - Checks if user is in first 101 (atomic counter check)
   - If yes: adds 5,000,000 bonus tokens and marks as premium
   - If no: just gets the 150,000 base tokens
4. **Profile is inserted** with all token fields properly initialized
5. **Frontend checks FIRST100 promo** (2 seconds later)
   - Separate promotional system
   - Grants additional tokens if available and not already redeemed

### Token Allocation Breakdown

| User Type | Base Tokens | First 101 Bonus | FIRST100 Promo | Total |
|-----------|-------------|-----------------|----------------|-------|
| Regular user | 150,000 | - | - | 150,000 |
| First 101 user | 150,000 | +5,000,000 | - | 5,150,000 |
| Regular + FIRST100 | 150,000 | - | +5,000,000 | 5,150,000 |
| First 101 + FIRST100 | 150,000 | +5,000,000 | +5,000,000 | 10,150,000 |

## Verification

### Check Your Token Allocation
```sql
SELECT * FROM verify_user_token_allocation('YOUR_USER_ID');
```

Returns:
- Your current token balances
- Whether you received the first 101 bonus
- Whether you redeemed the FIRST100 promo
- Status (OK, NO_TOKENS, INSUFFICIENT)

### Check System Statistics
After running the migration, you'll see output like:
```
✅ COMPREHENSIVE TOKEN INITIALIZATION FIX COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database Statistics:
  📊 Total Users: 42
  🆓 Free Users: 38
  💎 Premium Users: 4
  ⚠️  Users with Zero Tokens: 0

First 101 Promotion Status:
  🎁 Users Granted Bonus: 4 / 101
  📍 Remaining Slots: 97
  ⏸️  Status: ACTIVE
```

## Testing New Signups

1. Create a new account
2. Open browser console
3. Look for these log messages:
   ```
   🆕 Creating new profile for user: [user-id]
   ℹ️ Database trigger will handle token initialization
   ✅ Profile created successfully
   ✅ User token status: { total: 150000, free: 150000, paid: 0, tier: 'free' }
   ```

If you're in the first 101:
```
🎉 User [user-id] is within First 101! User number: 5
✅ Granted 5,000,000 bonus tokens
```

## Benefits of This Approach

✅ **Single Source of Truth** - Database trigger handles all initialization
✅ **No Race Conditions** - Atomic counter for first 101 bonus
✅ **Maintainable** - Change defaults in one place (database)
✅ **Reliable** - Constraints prevent NULL or negative tokens
✅ **Auditable** - Detailed logging for debugging
✅ **Backfilled** - Existing users with 0 tokens are fixed

## Files Modified

1. **Migration**: `/supabase/migrations/20251114000000_fix_token_initialization_comprehensive.sql`
2. **Frontend**: `/src/contexts/AuthContext.tsx`

## What Was Deprecated

The following are now superseded by the new unified trigger:
- ❌ `20251029210856_fix_zero_token_balance_on_signup.sql` - handle_new_user trigger
- ❌ `20251111000000_create_first_101_users_bonus_system.sql` - Original first 101 bonus
- ❌ `20251112002523_fix_first_101_bonus_race_condition.sql` - First 101 fix attempt
- ❌ Hard-coded token values in `AuthContext.tsx`

## Troubleshooting

### If a user still has 0 tokens:

1. Check if the migration ran successfully
2. Manually backfill the user:
   ```sql
   UPDATE profiles
   SET
     tokens_balance = 150000,
     free_tokens_balance = 150000,
     paid_tokens_balance = COALESCE(paid_tokens_balance, 0),
     updated_at = NOW()
   WHERE id = 'USER_ID' AND tokens_balance = 0;
   ```

### If first 101 bonus isn't working:

1. Check counter status:
   ```sql
   SELECT * FROM promotional_user_counter WHERE id = 1;
   ```
2. Check if promotion ended (count >= 101)
3. Check trigger is active:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_unified_profile_init';
   ```

## Future Considerations

- Consider adding a scheduled job to refresh free tokens monthly
- Monitor token depletion rates
- Add alerts when first 101 promotion is about to end
- Consider adding more promotional campaigns

---

**Migration Applied**: November 14, 2025
**Status**: ✅ Active and Working
**Next Review**: Check after first 100 signups to ensure first 101 bonus system is working correctly
