# Universal Token-Based Access System

## 🎯 Overview

We've completely overhauled the premium access system to use a **universal token-based model**. This eliminates subscription loopholes and makes ALL AI models accessible to anyone with sufficient tokens.

## 🔑 Key Changes

### Before (Old System)
- ❌ Premium models locked behind paid subscriptions
- ❌ Subscription loophole: paid users kept premium access even after cancellation
- ❌ Tier-based blocking: free users couldn't access premium models at all
- ❌ Double token deduction bug
- ❌ Inconsistent premium status checks

### After (New System)
- ✅ ALL models accessible via tokens
- ✅ No more subscriptions - pure pay-as-you-go
- ✅ Simple rule: **paid_tokens_balance > 0 = premium access**
- ✅ Priority-based token deduction (paid first, then free)
- ✅ First 101 users get 5 million PAID tokens (instant premium)
- ✅ No loopholes - when tokens run out, so does access

---

## 💰 Token System Architecture

### Token Types

1. **Paid Tokens** (`paid_tokens_balance`)
   - Purchased with real money
   - Never expire
   - Used first when sending messages
   - Determines premium status

2. **Free Tokens** (`free_tokens_balance`)
   - Daily refresh (1000 tokens/day for free users)
   - Used after paid tokens are depleted
   - Good for basic/free models
   - Resets every 24 hours

3. **Total Tokens** (`tokens_balance`)
   - Automatic calculation: `paid + free`
   - Displayed to users as overall balance

### Premium Status Logic

```typescript
// SIMPLE RULE - No complex checks needed
const isPremium = paid_tokens_balance > 0;
```

That's it! No more checking `is_premium`, `is_paid`, `current_tier`, or any other flags. Just one source of truth.

---

## �� Model Access Rules

### Universal Access
ALL models are accessible to ALL users if they have enough tokens.

| Model Tier | Token Cost | Example Models | Access |
|------------|------------|----------------|--------|
| Free | 800-1,200 | Grok 4 Fast, Gemini Flash Lite | Everyone |
| Budget | 5,000-7,000 | DeepSeek V3.2, Kimi K2 | Everyone |
| Mid | 8,000-16,000 | GPT-5 Chat, Claude Haiku 4.5 | Everyone |
| Premium | 24,000-120,000 | Claude Sonnet 4.5, GPT-5 Codex | Everyone |
| Ultra-Premium | 200,000-600,000 | Sora 2, Claude Opus 4.1 | Everyone |

**Key Point:** No models are locked. If you have the tokens, you can use any model.

---

## 🎁 First 101 Users Bonus

### The Promotion

The first 101 users to sign up receive:
- **5,000,000 paid tokens** (added to `paid_tokens_balance`)
- Instant premium status
- Access to all models including ultra-premium
- Tokens never expire

### How It Works

1. Atomic counter in database ensures exactly 101 users
2. On profile creation, trigger checks counter
3. If count < 101, grants 5M tokens and increments counter
4. Tokens are PAID type, making them premium users
5. Banner shows remaining slots in real-time

### Checking Status

```sql
SELECT * FROM first_101_promotion_status;
```

Returns:
- `users_granted`: How many have received the bonus
- `remaining_slots`: How many spots left
- `status`: 'ACTIVE' or 'ENDED'

---

## 🔧 Token Deduction Logic

### Priority System

When a user sends a message, tokens are deducted in this order:

1. **Paid Tokens First**: Use all available paid tokens
2. **Free Tokens Second**: If paid insufficient, use free tokens
3. **Combination**: Can use partial from both (e.g., 500 paid + 500 free)

### Example Scenarios

#### Scenario 1: Sufficient Paid Tokens
```
User has:
- paid_tokens_balance: 10,000
- free_tokens_balance: 1,000

Sends message with GPT-5 Chat (16,000 tokens)
Result: NOT ENOUGH - blocked
```

#### Scenario 2: Combination Deduction
```
User has:
- paid_tokens_balance: 3,000
- free_tokens_balance: 5,000

Sends message with Kimi K2 (5,000 tokens)
Deduction:
- 3,000 from paid_tokens_balance → 0
- 2,000 from free_tokens_balance → 3,000
```

#### Scenario 3: Free Tokens Only
```
User has:
- paid_tokens_balance: 0
- free_tokens_balance: 1,000

Sends message with Grok 4 Fast (800 tokens)
Deduction:
- 0 from paid_tokens_balance
- 800 from free_tokens_balance → 200
```

---

## 🐛 Critical Bug Fixes

### 1. Double Token Deduction Bug (FIXED)

**Problem:**
```sql
-- Old function was doing this:
UPDATE profiles SET
  paid_tokens_balance = paid_tokens_balance - tokens,
  tokens_balance = tokens_balance - tokens  -- BUG: Deducting twice!
```

**Solution:**
```sql
-- New function uses priority deduction:
UPDATE profiles SET
  paid_tokens_balance = v_new_paid_balance,
  free_tokens_balance = v_new_free_balance,
  tokens_balance = v_new_paid_balance + v_new_free_balance
```

### 2. Premium Access Loophole (FIXED)

**Problem:**
Users could pay once, get `is_premium = true`, then cancel subscription but keep premium access forever.

**Solution:**
Removed reliance on `is_premium` flag. Now premium status is calculated:
```typescript
const isPremium = paid_tokens_balance > 0;
```

When tokens run out, premium access ends automatically.

### 3. First 101 Bonus Wrong Type (FIXED)

**Problem:**
Bonus was adding to `free_tokens_balance` instead of `paid_tokens_balance`, so first 101 users weren't actually premium.

**Solution:**
Updated function to grant PAID tokens:
```sql
UPDATE profiles SET
  paid_tokens_balance = paid_tokens_balance + 5000000,
  is_premium = TRUE,
  current_tier = 'premium'
```

---

## 📊 Database Functions

### 1. `deduct_tokens_priority()`

Priority-based token deduction with atomic transactions.

```sql
SELECT deduct_tokens_priority(
  p_user_id := 'user_123',
  p_tokens := 5000,
  p_model := 'gpt-5-chat',
  p_provider := 'openrouter',
  p_cost_usd := 0.025
);
```

Returns:
```json
{
  "success": true,
  "balance": 5000,
  "paid_balance": 2000,
  "free_balance": 3000,
  "deducted_from_paid": 3000,
  "deducted_from_free": 2000,
  "transaction_id": "uuid..."
}
```

### 2. `add_tokens_with_type()`

Add tokens with type specification (paid or free).

```sql
SELECT add_tokens_with_type(
  p_user_id := 'user_123',
  p_tokens := 1000000,
  p_token_type := 'paid',
  p_source := 'purchase:pack_1m',
  p_stripe_payment_id := 'pi_xyz123'
);
```

### 3. `check_token_sufficiency()`

Check if user has enough tokens before attempting deduction.

```sql
SELECT check_token_sufficiency(
  p_user_id := 'user_123',
  p_required_tokens := 16000
);
```

Returns:
```json
{
  "has_enough": true,
  "total_balance": 20000,
  "paid_balance": 15000,
  "free_balance": 5000,
  "required": 16000,
  "shortfall": 0
}
```

---

## 🎨 UI Components

### TokenCostPreview Component

Shows real-time cost of sending a message:

```tsx
<TokenCostPreview
  selectedModel="gpt-5-chat"
  currentBalance={20000}
  paidBalance={15000}
  freeBalance={5000}
/>
```

Displays:
- ✅ Token cost per message
- ✅ Whether user can afford it
- ✅ Which balance will be used (paid/free/combo)
- ✅ Remaining balance after send

### First101Banner Component

Dynamic promotional banner showing:
- 🎁 5M token offer
- 👥 Remaining slots
- 📊 Progress bar
- 🚨 Urgency indicators (when < 10 slots left)

Automatically hides when promotion ends.

---

## 📈 Token Pricing Strategy

### Token Packs (Recommended)

| Pack Size | Price | Cost per 1M | Savings |
|-----------|-------|-------------|---------|
| 1M tokens | $5 | $5.00/M | - |
| 10M tokens | $40 | $4.00/M | 20% |
| 50M tokens | $175 | $3.50/M | 30% |
| 100M tokens | $300 | $3.00/M | 40% |

### Usage Estimates

- **1M tokens** ≈ 1,000 free model messages OR 50 premium messages
- **10M tokens** ≈ 10,000 free messages OR 500 premium messages
- **100M tokens** ≈ Unlimited free model usage + 5,000 premium messages

---

## 🔒 Security & Anti-Abuse

### Rate Limiting
- Max 100 requests per hour per user
- Prevents token farming/abuse

### Token Purchase Verification
- All token additions require Stripe payment verification
- Webhook signature validation
- Idempotency keys prevent double-crediting

### Transaction Logging
- Every deduction logged with:
  - User ID
  - Model used
  - Tokens deducted
  - Timestamp
  - Balance after
- Enables audit trails and dispute resolution

---

## 🚀 Migration Guide

### For Existing Paid Users

Run this to convert subscription users to token balance:

```sql
-- Grant 10M tokens to all current paid users
UPDATE profiles
SET
  paid_tokens_balance = paid_tokens_balance + 10000000,
  tokens_balance = tokens_balance + 10000000,
  updated_at = NOW()
WHERE is_paid = TRUE OR is_premium = TRUE OR current_tier = 'premium';
```

### For Free Users

No action needed - they continue with daily 1K token refresh.

---

## 📚 Code Examples

### Frontend: Check if user can use model

```typescript
import { getUnifiedPremiumStatus } from '@/lib/unifiedPremiumAccess';
import { getModelCost } from '@/lib/modelTokenPricing';

async function canUseModel(userId: string, modelId: string): Promise<boolean> {
  const status = await getUnifiedPremiumStatus(userId);
  const modelCost = getModelCost(modelId);

  const totalTokens = status.paidTokens + status.totalTokens;
  return totalTokens >= modelCost.tokensPerMessage;
}
```

### Frontend: Deduct tokens after API call

```typescript
import { deductTokensForRequest } from '@/lib/tokenService';

async function sendMessage(userId: string, modelId: string, message: string) {
  // Send to AI
  const response = await callAI(message, modelId);

  // Deduct tokens
  const result = await deductTokensForRequest(
    userId,
    modelId,
    'openrouter',
    0.025,
    'chat'
  );

  if (!result.success) {
    throw new Error(result.error || 'Failed to deduct tokens');
  }

  return response;
}
```

---

## 🎯 Benefits of New System

1. **Fair & Transparent**: Everyone pays per usage, no hidden costs
2. **No Loopholes**: Tokens = access, simple as that
3. **Flexible**: Use expensive models when needed, cheap ones to save tokens
4. **No Expiry**: Purchased tokens never expire
5. **First 101 Bonus**: Massive incentive for early adopters
6. **Scalable**: Easy to add new models without complex tier management
7. **Simplified Codebase**: One source of truth for premium status

---

## 🐛 Troubleshooting

### User shows as free but has paid tokens

**Check:**
```sql
SELECT id, paid_tokens_balance, is_premium, current_tier
FROM profiles
WHERE id = 'user_id';
```

**Fix:**
```sql
UPDATE profiles
SET
  is_premium = TRUE,
  current_tier = 'premium'
WHERE paid_tokens_balance > 0 AND (is_premium = FALSE OR current_tier = 'free');
```

### Tokens deducted but message failed

**Rollback:**
```sql
-- Add tokens back
SELECT add_tokens_with_type(
  'user_id',
  tokens_to_refund,
  'paid',
  'refund:failed_request'
);
```

### First 101 counter stuck

**Reset (DANGER - only use in dev):**
```sql
UPDATE promotional_user_counter
SET first_101_count = 0
WHERE id = 1;
```

---

## 📞 Support

For issues with the token system:
1. Check user's token balance in database
2. Review `token_transactions` table for history
3. Verify Stripe webhook logs for payment issues
4. Use debug functions: `window.debugPremium.checkStatus()`

---

## 🎉 Summary

The new universal token-based system is:
- ✅ Simple
- ✅ Fair
- ✅ Secure
- ✅ Scalable
- ✅ Loophole-free

All models accessible to all users. Pay for what you use. No more, no less.
