# Testing Guide: Token Deduction Flow

## Expected Behavior

When you send a message "hi", here's what should happen:

### 1. Before Sending Message
```
Token Balance Display: "10,000 tokens" (if new user)
Console: "💰 Balance check: Paid=0, Free=10000, Total=10000"
```

### 2. During Message Send
```
Console Logs:
🚀 handleSendMessage CALLED!
📤 Sending: hi
🔐 Access check: {canAccess: true, tier: 'free', ...}
🔵 [OpenRouter] Calling model: x-ai/grok-4-fast
🔵 [OpenRouter] Response status: 200
✅ [OpenRouter] Response received (X chars)
🔵 [OpenRouter] Usage: X tokens, Cost: $0.0001XX
```

### 3. Token Deduction
```
Console Logs:
💰 Processing token deduction...
💰 aiResponse.usage: {prompt_tokens: X, completion_tokens: Y, total_tokens: Z, total_cost: 0.0001}
💰 Base cost from OpenRouter: $0.0001
💰 User will be charged: $0.0002 (2x multiplier)
✅ Tokens deducted! Paid: 0, Free: 9998, Tier: free
```

### 4. After 3 Seconds
```
Token Balance Display: "9,998 tokens"
Console: "💰 Balance check: Paid=0, Free=9998, Total=9998"
```

## Cost Breakdown Example

For a simple "hi" message with Grok 4 Fast:

```
OpenRouter Cost:     $0.0001
KroniQ 2x Multiplier: × 2
Total Cost:          $0.0002

Conversion (10,000 tokens = $1):
$0.0002 × 10,000 = 2 tokens deducted
```

## Testing Steps

1. **Create New Account or Sign In**
   - Open browser console (F12)
   - Sign up with new email
   - Should see: "✅ Supabase profile created successfully"

2. **Check Initial Balance**
   - Look at sidebar: Should show "10,000 tokens"
   - Console should show: "💰 Balance check: Paid=0, Free=10000, Total=10000"

3. **Send a Test Message**
   - Type "hi" and send
   - Watch console for token deduction logs
   - Wait 3 seconds

4. **Verify Balance Updated**
   - Sidebar should show "9,998 tokens" (or similar, depends on actual cost)
   - Console shows new balance

## Troubleshooting

### Balance Still Shows 0
- **Issue**: Existing user profile wasn't migrated
- **Fix**: Run this SQL in Supabase dashboard:
  ```sql
  UPDATE profiles 
  SET free_tokens_balance = 10000,
      paid_tokens_balance = 0,
      current_tier = 'free'
  WHERE free_tokens_balance IS NULL OR free_tokens_balance = 0;
  ```

### Balance Not Updating After Message
- Check browser console for error logs
- Look for "💰 Token deduction" logs
- Verify OpenRouter API key is configured

### OpenRouter Errors
- Verify `VITE_OPENROUTER_API_KEY` in .env file
- Check OpenRouter account has credits
- Try a free model like "grok-4-fast"

## Success Indicators

✅ New users start with 10,000 tokens
✅ Token balance visible in sidebar
✅ Balance decreases after each message (1-10 tokens typically)
✅ Console shows detailed deduction logs
✅ Balance updates within 3 seconds
✅ Build passes without errors

## Support

If issues persist:
1. Check browser console for detailed error logs
2. Verify all migration files have been applied to Supabase
3. Ensure OpenRouter API key is valid
4. Check network tab for API request/response details
