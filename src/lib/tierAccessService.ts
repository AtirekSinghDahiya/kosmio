import { supabase } from './supabaseClient';

export type UserTier = 'free' | 'paid';

export interface TierInfo {
  tier: UserTier;
  hasPurchased: boolean;
  firstPurchaseAt: string | null;
}

// Paid models require purchased tokens
const PAID_MODELS = new Set([
  // Premium Chat models
  'gpt-5-chat',
  'deepseek-v3.2',
  'nemotron-super',
  'qwen-vl-32b',
  'claude-sonnet',
  'claude-haiku-4.5',
  'claude-opus-4',
  'claude-opus-4.1',
  'gemini-flash-image',
  'kimi-k2',
  'kimi-k2-0905',
  'llama-4-maverick',
  'glm-4.6',
  'perplexity-sonar-pro',
  'perplexity-sonar-reasoning',
  'perplexity-sonar-deep',

  // Code models
  'gpt-5-codex',

  // Image models
  'dall-e-3',
  'stable-diffusion-xl',
  'firefly',

  // Video models
  'sora',

  // Audio models
  'eleven-labs'
]);

/**
 * Get user's current tier information
 */
export const getUserTier = async (userId: string): Promise<TierInfo> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('current_tier, is_paid, tokens_remaining, last_purchase_date')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user tier:', error);
    return { tier: 'free', hasPurchased: false, firstPurchaseAt: null };
  }

  // User is paid if they have tokens_remaining > 0 OR is_paid = true
  const hasPaidTokens = (data?.tokens_remaining || 0) > 0;
  const isPaidUser = data?.is_paid === true;

  return {
    tier: (hasPaidTokens || isPaidUser) ? 'paid' : 'free',
    hasPurchased: isPaidUser,
    firstPurchaseAt: data?.last_purchase_date || null
  };
};

/**
 * Check if a model requires paid tier
 */
export const isModelPaid = (modelId: string): boolean => {
  return PAID_MODELS.has(modelId);
};

/**
 * Check if user can access a specific model
 */
export const canAccessModel = async (userId: string, modelId: string): Promise<boolean> => {
  const tierInfo = await getUserTier(userId);

  // Free models are accessible to everyone
  if (!isModelPaid(modelId)) {
    return true;
  }

  // Paid models require paid tier (user must have tokens_remaining > 0)
  console.log(`🔒 Checking access for ${modelId}:`, tierInfo);
  return tierInfo.tier === 'paid';
};

/**
 * Upgrade user to paid tier (called after successful purchase)
 */
export const upgradeUserToPaidTier = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_paid: true,
      current_tier: 'premium',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error upgrading user to paid tier:', error);
    throw error;
  }

  console.log('✅ User upgraded to paid tier:', userId);
};

/**
 * Get list of models accessible to user
 */
export const getAccessibleModels = async (userId: string, allModels: any[]): Promise<any[]> => {
  const tierInfo = await getUserTier(userId);

  if (tierInfo.tier === 'paid') {
    // Paid users get all models
    return allModels;
  }

  // Free users only get free models
  return allModels.filter(model => !isModelPaid(model.id));
};
