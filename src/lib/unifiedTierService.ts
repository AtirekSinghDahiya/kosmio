import { supabase } from './supabaseClient';

export type UserTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface TierInfo {
  tier: UserTier;
  tierLevel: number;
  isFreeTier: boolean;
  hasPaidAccess: boolean;
  paidTokens: number;
  freeTokens: number;
  totalTokens: number;
  dailyTokensRemaining: number;
  monthlyTokensRemaining: number;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  messagesRemaining: number;
  canAccessPaidModels: boolean;
  canAccessVideoGeneration: boolean;
}

const PAID_MODELS = new Set([
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
  'gpt-5-codex',
  'dall-e-3',
  'stable-diffusion-xl',
  'firefly',
  'sora',
  'sora-2',
  'veo3',
  'veo-3',
  'eleven-labs'
]);

export async function getUserTierInfo(userId: string): Promise<TierInfo> {
  try {
    const { data: tierData, error } = await supabase
      .rpc('get_user_tier_config', { user_id: userId });

    if (error) {
      console.error('Error fetching tier info from database:', error);
      return getDefaultFreeTier();
    }

    if (!tierData || tierData.length === 0) {
      console.warn('No tier data found for user:', userId);
      return getDefaultFreeTier();
    }

    const tier = tierData[0];
    const paidTokens = Number(tier.paid_tokens_available) || 0;
    const freeTokens = Number(tier.free_tokens_available) || 0;
    const totalTokens = paidTokens + freeTokens;
    const dailyTokensRemaining = Number(tier.daily_tokens_remaining) || 0;

    const hasPaidAccess = paidTokens > 0;
    const canAccessPaidModels = hasPaidAccess && tier.can_access_premium_models;
    const canAccessVideoGeneration = hasPaidAccess && tier.can_access_video_generation;

    const tierInfo: TierInfo = {
      tier: tier.tier_name as UserTier,
      tierLevel: tier.tier_level,
      isFreeTier: tier.is_free_tier,
      hasPaidAccess,
      paidTokens,
      freeTokens,
      totalTokens,
      dailyTokensRemaining,
      monthlyTokensRemaining: freeTokens,
      dailyTokenLimit: tier.daily_token_limit,
      monthlyTokenLimit: tier.monthly_token_limit,
      messagesRemaining: 0,
      canAccessPaidModels,
      canAccessVideoGeneration
    };

    console.log('✅ Tier info loaded:', {
      userId,
      tier: tierInfo.tier,
      isFreeTier: tierInfo.isFreeTier,
      hasPaidAccess: tierInfo.hasPaidAccess,
      paidTokens: tierInfo.paidTokens,
      freeTokens: tierInfo.freeTokens,
      canAccessPaidModels: tierInfo.canAccessPaidModels,
      canAccessVideoGeneration: tierInfo.canAccessVideoGeneration
    });

    return tierInfo;
  } catch (error) {
    console.error('Exception in getUserTierInfo:', error);
    return getDefaultFreeTier();
  }
}

function getDefaultFreeTier(): TierInfo {
  return {
    tier: 'free',
    tierLevel: 0,
    isFreeTier: true,
    hasPaidAccess: false,
    paidTokens: 0,
    freeTokens: 5000,
    totalTokens: 5000,
    dailyTokensRemaining: 5000,
    monthlyTokensRemaining: 150000,
    dailyTokenLimit: 5000,
    monthlyTokenLimit: 150000,
    messagesRemaining: 0,
    canAccessPaidModels: false,
    canAccessVideoGeneration: false
  };
}

export function isModelPaid(modelId: string): boolean {
  return PAID_MODELS.has(modelId);
}

export function canAccessModel(tierInfo: TierInfo, modelId: string): boolean {
  if (tierInfo.isFreeTier) {
    const isPaidModel = isModelPaid(modelId);
    if (isPaidModel) {
      console.log(`🚫 Free tier cannot access paid model: ${modelId}`);
      return false;
    }
    return tierInfo.dailyTokensRemaining > 0 || tierInfo.totalTokens > 0;
  }

  if (tierInfo.hasPaidAccess && tierInfo.canAccessPaidModels) {
    return tierInfo.totalTokens > 0;
  }

  const isPaidModel = isModelPaid(modelId);
  if (!isPaidModel) {
    return tierInfo.totalTokens > 0;
  }

  return false;
}

export async function checkModelAccess(userId: string, modelId: string): Promise<{
  canAccess: boolean;
  tierInfo: TierInfo;
  reason: string;
}> {
  const tierInfo = await getUserTierInfo(userId);
  const isPaid = isModelPaid(modelId);

  if (tierInfo.isFreeTier && isPaid) {
    return {
      canAccess: false,
      tierInfo,
      reason: 'Premium model requires paid tokens. Purchase a token pack to access.'
    };
  }

  if (!isPaid) {
    const canAccess = tierInfo.dailyTokensRemaining > 0 || tierInfo.totalTokens > 0;
    return {
      canAccess,
      tierInfo,
      reason: canAccess
        ? 'Free model accessible'
        : 'No tokens available'
    };
  }

  const canAccess = tierInfo.canAccessPaidModels && tierInfo.totalTokens > 0;
  return {
    canAccess,
    tierInfo,
    reason: canAccess
      ? 'Paid model accessible'
      : 'Paid tokens required for this model'
  };
}

export async function checkPaidFeatureAccess(userId: string, featureName: string = 'premium_feature'): Promise<{
  hasAccess: boolean;
  tierInfo: TierInfo;
  reason: string;
}> {
  const tierInfo = await getUserTierInfo(userId);

  if (featureName.includes('video')) {
    const hasAccess = tierInfo.canAccessVideoGeneration && tierInfo.paidTokens > 0;

    console.log(`🎬 Video feature access check:`, {
      userId,
      featureName,
      hasAccess,
      canAccessVideoGeneration: tierInfo.canAccessVideoGeneration,
      paidTokens: tierInfo.paidTokens,
      isFreeTier: tierInfo.isFreeTier
    });

    return {
      hasAccess,
      tierInfo,
      reason: hasAccess
        ? `Access granted: ${tierInfo.paidTokens.toLocaleString()} paid tokens available`
        : 'Video generation requires paid tokens. Purchase a token pack to access.'
    };
  }

  const hasAccess = tierInfo.canAccessPaidModels && tierInfo.paidTokens > 0;

  console.log(`🎯 Feature access check for ${featureName}:`, {
    userId,
    hasAccess,
    paidTokens: tierInfo.paidTokens,
    isFreeTier: tierInfo.isFreeTier
  });

  return {
    hasAccess,
    tierInfo,
    reason: hasAccess
      ? `Access granted: ${tierInfo.paidTokens.toLocaleString()} paid tokens available`
      : 'Purchase tokens to access this feature'
  };
}

export async function refreshDailyTokens(userId: string): Promise<void> {
  try {
    await supabase.rpc('refresh_daily_tokens_for_free_tier');
    console.log('✅ Daily tokens refreshed for free tier users');
  } catch (error) {
    console.error('Failed to refresh daily tokens:', error);
  }
}
