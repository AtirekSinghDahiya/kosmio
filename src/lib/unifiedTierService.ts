/**
 * Unified Tier Service - SIMPLIFIED
 *
 * SIMPLE RULE:
 * - If paid_tokens_balance > 0 → PAID tier → Everything unlocked
 * - If paid_tokens_balance = 0 → FREE tier → Only free models
 */

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

// ONLY THESE MODELS ARE PREMIUM - EVERYTHING ELSE IS FREE
const PREMIUM_MODELS = new Set([
  'claude-opus-4',
  'claude-opus-4.1',
  'gpt-5-chat',
  'gpt-5-codex',
  'deepseek-v3.2',
  'perplexity-sonar-pro',
  'perplexity-sonar-reasoning',
  'perplexity-sonar-deep'
]);

export async function getUserTierInfo(userId: string): Promise<TierInfo> {
  try {
    console.log('📊 Fetching tier info for user:', userId);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, free_tokens_balance, daily_tokens_remaining, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      return getDefaultFreeTier();
    }

    if (!profile) {
      console.warn('⚠️  No profile found, using default free tier');
      return getDefaultFreeTier();
    }

    console.log('✅ Profile data:', profile);

    const paidTokens = Number(profile.paid_tokens_balance) || 0;
    const freeTokens = Number(profile.free_tokens_balance) || 0;
    const dailyRemaining = Number(profile.daily_tokens_remaining) || 0;
    const totalTokens = paidTokens + freeTokens;

    const isPaidTier = paidTokens > 0;
    const isFreeTier = !isPaidTier;

    console.log(`🎯 Tier: ${isPaidTier ? 'PAID' : 'FREE'} (paid=${paidTokens}, free=${freeTokens})`);

    const tierInfo: TierInfo = {
      tier: isPaidTier ? 'starter' : 'free',
      tierLevel: isPaidTier ? 1 : 0,
      isFreeTier,
      hasPaidAccess: isPaidTier,
      paidTokens,
      freeTokens,
      totalTokens,
      dailyTokensRemaining: dailyRemaining,
      monthlyTokensRemaining: freeTokens,
      dailyTokenLimit: 5000,
      monthlyTokenLimit: 150000,
      messagesRemaining: 0,
      canAccessPaidModels: isPaidTier,
      canAccessVideoGeneration: totalTokens > 0
    };

    return tierInfo;
  } catch (error) {
    console.error('❌ Exception in getUserTierInfo:', error);
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
    freeTokens: 150000,
    totalTokens: 150000,
    dailyTokensRemaining: 5000,
    monthlyTokensRemaining: 150000,
    dailyTokenLimit: 5000,
    monthlyTokenLimit: 150000,
    messagesRemaining: 0,
    canAccessPaidModels: false,
    canAccessVideoGeneration: true
  };
}

export function isModelPaid(modelId: string): boolean {
  return PREMIUM_MODELS.has(modelId);
}

export function canAccessModel(tierInfo: TierInfo | null, modelId: string): boolean {
  if (!tierInfo) {
    return !isModelPaid(modelId);
  }

  const isPremium = isModelPaid(modelId);

  if (isPremium) {
    if (tierInfo.isFreeTier) {
      return false;
    }
    return tierInfo.paidTokens > 0;
  }

  return tierInfo.totalTokens > 0;
}

export async function checkModelAccess(userId: string, modelId: string): Promise<{
  canAccess: boolean;
  tierInfo: TierInfo;
  reason: string;
}> {
  const tierInfo = await getUserTierInfo(userId);
  const isPremium = isModelPaid(modelId);
  const canAccess = canAccessModel(tierInfo, modelId);

  let reason = '';
  if (!canAccess) {
    if (isPremium && tierInfo.isFreeTier) {
      reason = 'Premium models require a paid token pack. Purchase tokens to unlock.';
    } else if (tierInfo.totalTokens === 0) {
      reason = 'No tokens available. Purchase a token pack to continue.';
    } else {
      reason = 'Access denied';
    }
  } else {
    reason = 'Access granted';
  }

  return { canAccess, tierInfo, reason };
}

export async function checkPaidFeatureAccess(userId: string, featureName: string = 'premium_feature'): Promise<{
  hasAccess: boolean;
  tierInfo: TierInfo;
  reason: string;
}> {
  const tierInfo = await getUserTierInfo(userId);

  // Video/image/music generation are available to everyone with tokens
  if (featureName.includes('video') || featureName.includes('image') || featureName.includes('music')) {
    const hasAccess = tierInfo.totalTokens > 0;
    return {
      hasAccess,
      tierInfo,
      reason: hasAccess ? 'Access granted' : 'No tokens available'
    };
  }

  // Other premium features require paid tier
  if (tierInfo.isFreeTier) {
    return {
      hasAccess: false,
      tierInfo,
      reason: `${featureName} requires a paid token pack. Purchase tokens to unlock.`
    };
  }

  const hasAccess = tierInfo.paidTokens > 0;
  return {
    hasAccess,
    tierInfo,
    reason: hasAccess ? 'Access granted' : 'Insufficient tokens'
  };
}

export async function refreshDailyTokens(userId: string): Promise<void> {
  try {
    await supabase.rpc('refresh_daily_tokens_for_free_tier');
  } catch (error) {
    console.error('Failed to refresh daily tokens:', error);
  }
}
