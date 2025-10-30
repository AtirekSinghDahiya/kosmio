-- ============================================================================
-- MANUAL TOKEN GRANT SCRIPT
-- Use this to manually give users paid tokens for testing premium features
-- ============================================================================

-- ============================================================================
-- STEP 1: Find Your User ID
-- ============================================================================
-- Run this first to find your user ID from your email or display name
SELECT id, email, created_at, paid_tokens_balance, free_tokens_balance, current_tier
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Or if you know your email:
-- SELECT id, email, paid_tokens_balance, free_tokens_balance, current_tier
-- FROM profiles
-- WHERE email = 'your@email.com';

-- ============================================================================
-- STEP 2: Grant Paid Tokens
-- ============================================================================
-- Replace 'YOUR_USER_ID_HERE' with the actual ID from Step 1

-- Option A: Grant 1 Million tokens (Starter Tier)
UPDATE profiles
SET
  paid_tokens_balance = 1000000,
  current_tier = 'starter'
WHERE id = 'YOUR_USER_ID_HERE';

-- Option B: Grant 5 Million tokens (Pro Tier)
-- UPDATE profiles
-- SET
--   paid_tokens_balance = 5000000,
--   current_tier = 'pro'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Option C: Grant 20 Million tokens (Enterprise Tier)
-- UPDATE profiles
-- SET
--   paid_tokens_balance = 20000000,
--   current_tier = 'enterprise'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- ============================================================================
-- STEP 3: Verify The Update
-- ============================================================================
-- Check that the tokens were granted successfully
SELECT id, email, paid_tokens_balance, free_tokens_balance, current_tier
FROM profiles
WHERE id = 'YOUR_USER_ID_HERE';

-- ============================================================================
-- EXPECTED RESULTS AFTER UPDATE
-- ============================================================================
-- You should see:
-- - paid_tokens_balance: 1000000 (or whatever you set)
-- - free_tokens_balance: 150000 (unchanged)
-- - current_tier: 'starter' (or whatever you set)
--
-- Now when you log into the app:
-- - Premium models should be UNLOCKED (no 🔒 icon)
-- - You can select and use Claude Opus 4, GPT-5, Perplexity models, etc.
-- - Video generation should work
-- - Image generation should work (if API key is valid)

-- ============================================================================
-- STEP 4: (Optional) Reset to Free Tier
-- ============================================================================
-- If you want to test the free tier behavior again:
-- UPDATE profiles
-- SET
--   paid_tokens_balance = 0,
--   current_tier = 'free'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Problem: "Premium models still locked after granting tokens"
-- Solution: Refresh the page completely (Ctrl+Shift+R) or logout and login again

-- Problem: "I don't see my user in the profiles table"
-- Solution: You need to sign up/login first, then the profile is auto-created

-- Problem: "Update succeeded but balance shows 0"
-- Solution: Check RLS policies - they might be blocking the UPDATE
-- Run: SELECT * FROM profiles WHERE id = 'YOUR_USER_ID_HERE';

-- Problem: "Video generation still shows 'Checking Access'"
-- Solution: Clear browser cache and refresh, or check browser console for errors

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Tokens are measured in "AI tokens" not USD
-- 2. 1 message with Claude Opus 4 costs ~220,000 tokens
-- 3. 1 image generation costs ~10,000 tokens
-- 4. 1 video generation (8s) costs ~10,000 tokens
-- 5. Free tier gets 150,000 tokens per month (refreshes daily)
-- 6. Paid tokens never expire until used

-- ============================================================================
-- BULK OPERATIONS (Admin Only)
-- ============================================================================

-- Grant tokens to ALL users (testing only!)
-- UPDATE profiles
-- SET
--   paid_tokens_balance = 1000000,
--   current_tier = 'starter';

-- Reset ALL users to free tier
-- UPDATE profiles
-- SET
--   paid_tokens_balance = 0,
--   current_tier = 'free';

-- Check total tokens across all users
-- SELECT
--   COUNT(*) as total_users,
--   SUM(paid_tokens_balance) as total_paid_tokens,
--   SUM(free_tokens_balance) as total_free_tokens,
--   COUNT(CASE WHEN paid_tokens_balance > 0 THEN 1 END) as paid_users,
--   COUNT(CASE WHEN paid_tokens_balance = 0 THEN 1 END) as free_users
-- FROM profiles;
