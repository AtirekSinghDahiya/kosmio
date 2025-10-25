import { supabase } from './supabaseClient';

export type UserTier = 'free' | 'paid';

export interface TierInfo {
  tier: UserTier;
  hasPurchased: boolean;
  firstPurchaseAt: string | null;
}

// Paid models require a purchased token pack
const PAID_MODELS = new Set([
  // Chat models
  'gpt-5-chat',
  'deepseek-v3.2',
  'nemotron-super',
  'qwen-vl-32b',
  'claude-sonnet',
  'gemini-flash-image',
  'kimi-k2',
  'llama-4-maverick',
  'glm-4.6',

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
    .select('user_tier, has_purchased, first_purchase_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user tier:', error);
    return { tier: 'free', hasPurchased: false, firstPurchaseAt: null };
  }

  return {
    tier: data?.user_tier || 'free',
    hasPurchased: data?.has_purchased || false,
    firstPurchaseAt: data?.first_purchase_at || null
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

  // Paid models require paid tier
  return tierInfo.tier === 'paid';
};

/**
 * Upgrade user to paid tier (called after successful purchase)
 */
export const upgradeUserToPaidTier = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .rpc('upgrade_user_to_paid_tier', { user_id: userId });

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
