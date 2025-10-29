/**
 * Tier Service - Manages user tiers and access control
 */

import { supabase } from './supabase';

export type UserTier = 'free' | 'paid';

export interface TierInfo {
  tier: UserTier;
  paidBalance: number;
  freeBalance: number;
  canAccessPaidModels: boolean;
  totalBalance: number;
}

export interface ModelAccessCheck {
  canAccess: boolean;
  tier: UserTier;
  reason: string;
  paidBalance: number;
  freeBalance: number;
}

// Free models list
const FREE_MODELS = [
  'grok-4-fast',
  'gpt-5-nano',
  'gpt-5-image-mini',
  'deepseek-v3.1-free',
  'nemotron-nano-free',
  'qwen-vl-30b-free',
  'claude-haiku-free',
  'gemini-flash-lite-free',
  'kimi-k2-free',
  'llama-4-maverick-free',
  'codex-mini',
  'lfm2-8b',
  'granite-4.0',
  'ernie-4.5',
];

/**
 * Get user's current tier information
 */
export async function getUserTierInfo(userId: string): Promise<TierInfo | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('current_tier, is_paid, tokens_balance, tokens_remaining, tokens_lifetime_purchased')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tier info:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const totalBalance = data.tokens_balance || 0;
    const tokensRemaining = data.tokens_remaining || 0;
    const isPaidUser = data.is_paid === true || tokensRemaining > 0;

    return {
      tier: isPaidUser ? 'paid' : 'free',
      paidBalance: isPaidUser ? totalBalance : 0,
      freeBalance: isPaidUser ? 0 : totalBalance,
      totalBalance: totalBalance,
      canAccessPaidModels: isPaidUser,
    };
  } catch (error) {
    console.error('Error in getUserTierInfo:', error);
    return null;
  }
}

/**
 * Check if user can access a specific model
 */
export async function checkModelAccess(
  userId: string,
  modelId: string
): Promise<ModelAccessCheck> {
  try {
    // Call database function to check access
    const { data, error } = await supabase.rpc('check_model_access', {
      p_user_id: userId,
      p_model_id: modelId,
    });

    if (error) {
      console.error('Error checking model access:', error);
      return {
        canAccess: FREE_MODELS.includes(modelId),
        tier: 'free',
        reason: 'Error checking access - defaulting to free models only',
        paidBalance: 0,
        freeBalance: 0,
      };
    }

    return {
      canAccess: data.can_access,
      tier: data.tier,
      reason: data.reason,
      paidBalance: data.paid_balance,
      freeBalance: data.free_balance,
    };
  } catch (error) {
    console.error('Error in checkModelAccess:', error);
    return {
      canAccess: FREE_MODELS.includes(modelId),
      tier: 'free',
      reason: 'Error checking access',
      paidBalance: 0,
      freeBalance: 0,
    };
  }
}

/**
 * Check if a model is a free model
 */
export function isModelFree(modelId: string): boolean {
  return FREE_MODELS.includes(modelId);
}

/**
 * Get list of free models
 */
export function getFreeModels(): string[] {
  return [...FREE_MODELS];
}

/**
 * Deduct tokens with tier system (uses database function with 2x multiplier)
 */
export async function deductTokensWithTier(
  userId: string,
  modelName: string,
  provider: string,
  baseCostUSD: number,
  requestType: string = 'chat'
): Promise<{
  success: boolean;
  paidBalance?: number;
  freeBalance?: number;
  tier?: UserTier;
  tokensDeducted?: number;
  downgraded?: boolean;
  error?: string;
}> {
  try {
    console.log(`💰 Deducting tokens for ${modelName} (Base: $${baseCostUSD}, 2x = $${baseCostUSD * 2})`);

    const { data, error } = await supabase.rpc('deduct_tokens_with_tier', {
      p_user_id: userId,
      p_model: modelName,
      p_provider: provider,
      p_base_cost_usd: baseCostUSD,
      p_request_type: requestType,
    });

    if (error) {
      console.error('Error deducting tokens:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.success) {
      console.warn('Token deduction failed:', data.error);
      return {
        success: false,
        error: data.error,
      };
    }

    console.log(`✅ Tokens deducted! Paid: ${data.paid_balance}, Free: ${data.free_balance}, Tier: ${data.tier}`);

    if (data.downgraded) {
      console.warn('⚠️ User downgraded to free tier - paid tokens exhausted!');
    }

    return {
      success: true,
      paidBalance: data.paid_balance,
      freeBalance: data.free_balance,
      tier: data.tier,
      tokensDeducted: data.tokens_deducted,
      downgraded: data.downgraded,
    };
  } catch (error: any) {
    console.error('Error in deductTokensWithTier:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Add paid tokens (for purchases)
 */
export async function addPaidTokens(
  userId: string,
  tokens: number,
  packId?: string,
  amountPaid?: number,
  stripePaymentId?: string
): Promise<{
  success: boolean;
  paidBalance?: number;
  freeBalance?: number;
  tier?: UserTier;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('add_paid_tokens', {
      p_user_id: userId,
      p_tokens: tokens,
      p_pack_id: packId || null,
      p_amount_paid: amountPaid || 0,
      p_stripe_payment_id: stripePaymentId || null,
    });

    if (error) {
      console.error('Error adding tokens:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ Added ${tokens} paid tokens! New balance: ${data.paid_balance}`);

    return {
      success: true,
      paidBalance: data.paid_balance,
      freeBalance: data.free_balance,
      tier: data.tier,
    };
  } catch (error: any) {
    console.error('Error in addPaidTokens:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get user's total token balance (paid + free)
 */
export async function getTotalTokenBalance(userId: string): Promise<{
  total: number;
  paid: number;
  free: number;
  tier: UserTier;
}> {
  const tierInfo = await getUserTierInfo(userId);

  if (!tierInfo) {
    return {
      total: 0,
      paid: 0,
      free: 0,
      tier: 'free',
    };
  }

  return {
    total: tierInfo.totalBalance,
    paid: tierInfo.paidBalance,
    free: tierInfo.freeBalance,
    tier: tierInfo.tier,
  };
}
