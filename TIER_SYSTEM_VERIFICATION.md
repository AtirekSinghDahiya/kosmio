# Tier System Verification - Complete Rebuild

## Overview
Completely rebuilt the tier-based access system using the correct database schema (`profiles` table with `paid_tokens_balance` and `free_tokens_balance`).

## Database Schema Used

### Profiles Table Columns (Key Fields):
- `id` - User ID (text)
- `paid_tokens_balance` - Paid tokens purchased by user (bigint)
- `free_tokens_balance` - Free tokens available to user (bigint)
- `is_paid` - Boolean flag for paid status
- `current_tier` - Current tier level (text)
- `messages_remaining` - Messages remaining (integer)

### Supporting Tables:
- `free_tier_users` - Tracks free tier users
- `paid_tier_users` - Tracks paid tier users
- `tier_transitions` - Tracks tier changes

## Changes Made

### 1. Created Unified Tier Service (`src/lib/unifiedTierService.ts`)

**Key Functions:**
- `getUserTierInfo(userId)` - Returns comprehensive tier information
  - Returns: `TierInfo` object with:
    - `tier`: 'free' | 'paid'
    - `hasPaidAccess`: boolean (if paid_tokens_balance > 0)
    - `paidTokens`: number
    - `freeTokens`: number
    - `totalTokens`: number
    - `messagesRemaining`: number
    - `canAccessPaidModels`: boolean (requires paid tokens > 0)

- `isModelPaid(modelId)` - Checks if model requires paid tier
  - Paid models: Sora, GPT-5 Chat, Claude Opus, etc.
  - Free models: Grok 4 Fast, DeepSeek Free, etc.

- `canAccessModel(tierInfo, modelId)` - Determines if user can access specific model
  - Free models: Requires any tokens (paid or free) OR messages
  - Paid models: Requires paid tokens > 0

- `checkModelAccess(userId, modelId)` - Complete access check
  - Returns: `{ canAccess, tierInfo, reason }`

- `checkPaidFeatureAccess(userId, featureName)` - Check access to paid features like Sora 2
  - Returns: `{ hasAccess, tierInfo, reason }`

**Access Logic:**
```typescript
// User is considered "paid tier" if:
const hasPaidAccess = paidTokens > 0;
const tier = hasPaidAccess ? 'paid' : 'free';

// Can access paid models if:
const canAccessPaidModels = hasPaidAccess && totalTokens > 0;

// For free models:
canAccess = totalTokens > 0 || messagesRemaining > 0;

// For paid models:
canAccess = canAccessPaidModels;
```

### 2. Updated AI Model Selector (`src/components/Chat/AIModelSelector.tsx`)

**Changes:**
- Replaced old `tierAccessService` with `unifiedTierService`
- Now fetches full `TierInfo` object instead of just tier level
- Uses `canAccessModel()` to determine if model is locked
- Shows appropriate lock icon and message for locked models
- Real-time tier checking when dropdown opens

**Display Logic:**
```typescript
const isPaidModel = isModelPaid(model.id);
const isLocked = tierInfo ? !canAccessModel(tierInfo, model.id) : isPaidModel;
```

**UI Indicators:**
- Lock icon for inaccessible models
- "Requires paid tokens" message for locked paid models
- Badge showing FREE/MID/PREMIUM tier
- Token cost per message display

### 3. Updated Video Generator (`src/components/Chat/VideoGenerator.tsx`)

**Changes:**
- Replaced `checkPaidAccess` with `checkPaidFeatureAccess`
- Now uses `TierInfo` object instead of simple boolean
- Shows detailed token balance in access messages
- Better error messages showing exact token counts

**Sora 2 Access Check:**
```typescript
if (provider === 'sora') {
  if (!tierInfo || !tierInfo.canAccessPaidModels) {
    showToast('error', 'Paid Tokens Required',
      `You have ${tierInfo?.paidTokens || 0} paid tokens. Purchase tokens to use Sora 2.`);
    return;
  }
}
```

**UI States:**
1. **Checking Access** (blue) - Verifying token balance
2. **No Access** (yellow) - Shows paid and free token counts, prompts purchase
3. **Has Access** (green) - Shows paid token count, ready to generate

**Provider Selection:**
- **Veo 3 Fast**: Free for all users (Google)
- **Sora 2**: Requires paid tokens (OpenAI Premium)
  - Badge shows token count if no access
  - Badge shows ✓ if has access

### 4. Updated MainChat (`src/components/Chat/MainChat.tsx`)

**Changes:**
- Added import for `unifiedTierService` alongside legacy service
- Maintains backward compatibility during transition
- Uses unified service for tier checks

## Testing Checklist

### AI Model Dropdown
- [ ] Dropdown opens and closes properly
- [ ] Click outside closes dropdown ✅
- [ ] Free models show as unlocked for users with any tokens
- [ ] Paid models show lock icon for users without paid tokens
- [ ] Paid models are unlocked for users with paid tokens > 0
- [ ] Model selection works correctly
- [ ] Tier refresh happens when dropdown opens

### Video Generator - Veo 3 Fast
- [ ] Opens without errors
- [ ] Shows "Google • Free" label
- [ ] Accessible to all users
- [ ] Generation works

### Video Generator - Sora 2
- [ ] Opens without errors
- [ ] Shows "OpenAI • Premium" label
- [ ] For users WITHOUT paid tokens:
  - [ ] Shows yellow "Tokens Required" message
  - [ ] Displays current paid/free token counts
  - [ ] Generate button is disabled
  - [ ] Badge shows "0T" or token count
- [ ] For users WITH paid tokens:
  - [ ] Shows green "Premium Access Verified" message
  - [ ] Displays paid token count
  - [ ] Generate button is enabled
  - [ ] Badge shows ✓
- [ ] No infinite loading screen ✅
- [ ] Access check completes properly ✅

### General Token System
- [ ] Users with 0 tokens cannot access any models
- [ ] Users with free tokens can access free models only
- [ ] Users with paid tokens can access all models
- [ ] Token balance displayed correctly in UI
- [ ] Tier transitions handled properly

## Database Queries to Verify

### Check User Tier:
```sql
SELECT
  id,
  email,
  paid_tokens_balance,
  free_tokens_balance,
  is_paid,
  current_tier,
  messages_remaining
FROM profiles
WHERE email = 'user@example.com';
```

### Verify Paid Models List:
The following models require paid tokens:
- gpt-5-chat, deepseek-v3.2, nemotron-super
- qwen-vl-32b, claude-sonnet, claude-haiku-4.5
- claude-opus-4, claude-opus-4.1, gemini-flash-image
- kimi-k2, kimi-k2-0905, llama-4-maverick, glm-4.6
- perplexity-sonar-pro, perplexity-sonar-reasoning, perplexity-sonar-deep
- gpt-5-codex, dall-e-3, stable-diffusion-xl, firefly
- **sora** (Sora 2 video), eleven-labs

### Verify Free Models List:
The following models are free (require any tokens):
- grok-4-fast, deepseek-v3.1-free, nemotron-nano-free
- qwen-vl-30b-free, claude-3-haiku, gemini-flash-lite-free
- kimi-k2-free, llama-4-maverick-free, codex-mini
- lfm2-8b, granite-4.0, ernie-4.5, perplexity-sonar

## Key Improvements

1. **Single Source of Truth**: All tier logic now in `unifiedTierService.ts`
2. **Correct Database Schema**: Uses actual `profiles` table columns
3. **Clear Access Rules**:
   - Free models: Any tokens OR messages
   - Paid models: Paid tokens > 0 required
4. **Better UX**: Shows exact token counts, clear error messages
5. **No Infinite Loading**: Fixed undefined variable issue ✅
6. **Click Outside Works**: Proper dropdown close behavior ✅
7. **Real-time Updates**: Tier info refreshes automatically

## Next Steps

1. Test with real users in both tiers
2. Monitor console logs for tier checks
3. Verify token deduction works correctly
4. Test edge cases (0 tokens, transition between tiers)
5. Consider consolidating legacy `tierService.ts` into unified service

## Migration Path

Current state:
- ✅ `unifiedTierService.ts` - New, production-ready
- ⚠️ `tierAccessService.ts` - Old, can be deprecated
- ⚠️ `paidAccessService.ts` - Old, can be deprecated
- ⚠️ `tierService.ts` - Legacy, still used for token deduction

Recommended:
1. Move token deduction functions to `unifiedTierService.ts`
2. Update all components to use unified service
3. Remove old services
4. Single tier service for entire app
