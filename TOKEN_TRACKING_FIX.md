# Token Tracking & Real-Time Display Fix

## Issues Fixed

### 1. Sidebar Token Display Not Updating
**Problem:** Token balance showed "0 tokens" and never updated
**Root Causes:**
- Hardcoded max tokens to 10,000 (should be dynamic)
- Wrong field in realtime subscription (`tokens_balance` doesn't exist)
- Not tracking `paid_tokens_balance + free_tokens_balance` correctly
- Polling too slowly (every 5 seconds)

**Solution:**
- Set dynamic max tokens (10M default)
- Fixed realtime subscription to track correct fields
- Proper calculation: `paid_tokens_balance + free_tokens_balance`
- Faster polling (every 2 seconds) for immediate feedback
- Enhanced logging to verify balance updates

### 2. OpenRouter Cost Tracking
**Problem:** Usage data from OpenRouter not properly logged
**Solution:**
- Added detailed logging of usage data
- Shows cost calculation: Base cost × 2 (margin)
- Shows token conversion: $1 = 1,000,000 tokens
- Warns if no usage data received (uses fallback)

## How It Works

### Token Deduction Flow:
1. User sends message
2. OpenRouter API returns response with usage data:
   ```json
   {
     "usage": {
       "prompt_tokens": 100,
       "completion_tokens": 200,
       "total_tokens": 300,
       "total_cost": 0.0004
     }
   }
   ```
3. System applies 2x multiplier: `$0.0004 × 2 = $0.0008`
4. Converts to tokens: `$0.0008 × 1,000,000 = 800 tokens`
5. Deducts from user's balance (paid first, then free)
6. Updates database
7. Sidebar refreshes automatically (2-second polling + realtime)

### Database Function:
```sql
CREATE OR REPLACE FUNCTION deduct_tokens_with_tier(
  p_user_id text,
  p_model text,
  p_provider text,
  p_base_cost_usd decimal,
  p_request_type text DEFAULT 'chat'
)
```

**Features:**
- Applies 2x multiplier automatically
- Converts USD to tokens: $1 = 1,000,000 tokens
- Deducts from paid tokens first, then free tokens
- Tracks all transactions in `token_transactions` table
- Auto-downgrades user to free tier if paid tokens exhausted

## Verification Checklist

### Check if tokens are being tracked:
1. Open browser console (F12)
2. Send a message
3. Look for these logs:

```
✅ [OpenRouter] 📊 Usage Data: 300 tokens, Cost: $0.000400
✅ [OpenRouter] 💰 User will be charged: $0.000800 (2x multiplier)
✅ [OpenRouter] 💎 Tokens to deduct: 800
✅ Tokens deducted! Paid: 1999200, Free: 6667, Tier: paid
💰 Token balance fetched: 2005867
```

### Check sidebar display:
1. Token balance should show actual number (not 0)
2. Progress bar should move
3. Balance should update within 2 seconds after sending message
4. Realtime updates should trigger automatically

### Check database:
```sql
-- View your token balance
SELECT paid_tokens_balance, free_tokens_balance, current_tier
FROM profiles
WHERE id = 'YOUR_USER_ID';

-- View recent transactions
SELECT * FROM token_transactions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

## Example Costs (with 2x multiplier)

| Model | Base Cost | With Margin | Tokens Deducted |
|-------|-----------|-------------|-----------------|
| Grok 4 Fast | $0.0002 | $0.0004 | 400 |
| DeepSeek V3 | $0.0003 | $0.0006 | 600 |
| Claude Sonnet | $0.30 | $0.60 | 600,000 |
| Claude Opus 4.1 | $0.55 | $1.10 | 1,100,000 |
| GPT-5 Chat | $0.50 | $1.00 | 1,000,000 |

## Free User Tokens

- **Initial**: 6,667 tokens (~10 messages/day)
- **Monthly**: 200,000 tokens (~300 messages/month)
- **Auto-refresh**: Every 24 hours

## Troubleshooting

### Balance shows 0:
1. Check if profile exists in database
2. Check if `free_tokens_balance` is set
3. Try refreshing the page
4. Check browser console for errors

### Balance not updating:
1. Check browser console logs
2. Verify OpenRouter API key is valid
3. Check if `deduct_tokens_with_tier` function exists
4. Verify realtime subscription is active

### Tokens not being deducted:
1. Check if OpenRouter returns usage data
2. Verify database function is working
3. Check token_transactions table
4. Look for error logs in console

## Testing Commands

```javascript
// In browser console:

// Check current balance
await supabase.from('profiles').select('paid_tokens_balance, free_tokens_balance').eq('id', user.uid).single()

// Check recent transactions
await supabase.from('token_transactions').select('*').eq('user_id', user.uid).order('created_at', { ascending: false }).limit(5)

// Manually refresh daily tokens (admin only)
await supabase.rpc('refresh_daily_free_tokens')
```

## Summary

✅ **Fixed:** Sidebar token display now shows real balance
✅ **Fixed:** Real-time updates working (2-second polling + realtime subscription)
✅ **Fixed:** Proper tracking of paid + free tokens
✅ **Fixed:** 2x multiplier applied correctly
✅ **Fixed:** OpenRouter cost conversion (1:1M ratio)
✅ **Added:** Detailed logging for debugging
✅ **Added:** Better error handling

The system now properly tracks all token usage from OpenRouter, applies the 2x margin, converts to tokens, and updates the display in real-time!
