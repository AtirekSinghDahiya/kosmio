-- Fix for Existing Users Who Have 0 Token Balance
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state
SELECT 
  id,
  email,
  free_tokens_balance,
  paid_tokens_balance,
  current_tier,
  (free_tokens_balance + paid_tokens_balance) as total_balance
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Update profiles with missing or zero token balances
UPDATE profiles 
SET 
  free_tokens_balance = COALESCE(free_tokens_balance, 10000),
  paid_tokens_balance = COALESCE(paid_tokens_balance, 0),
  current_tier = COALESCE(current_tier, 'free'),
  updated_at = now()
WHERE 
  free_tokens_balance IS NULL 
  OR free_tokens_balance = 0
  OR paid_tokens_balance IS NULL
  OR current_tier IS NULL;

-- Step 3: Verify the fix
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN free_tokens_balance > 0 THEN 1 END) as users_with_free_tokens,
  COUNT(CASE WHEN paid_tokens_balance > 0 THEN 1 END) as users_with_paid_tokens,
  AVG(free_tokens_balance + paid_tokens_balance) as avg_total_balance
FROM profiles;

-- Step 4: Check specific user (replace with your user ID)
-- SELECT 
--   id,
--   email,
--   free_tokens_balance,
--   paid_tokens_balance,
--   current_tier,
--   (free_tokens_balance + paid_tokens_balance) as total_balance,
--   created_at
-- FROM profiles
-- WHERE email = 'your-email@example.com';
