import { supabase } from './supabaseClient';

export type UserTier = 'free' | 'paid';

export interface TierInfo {
  tier: UserTier;
  hasPaidAccess: boolean;
  paidTokens: number;
  freeTokens: number;
  totalTokens: number;
  messagesRemaining: number;
  canAccessPaidModels: boolean;
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
  'eleven-labs'
]);

export async function getUserTierInfo(userId: string): Promise<TierInfo> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, free_tokens_balance, is_paid, current_tier, messages_remaining')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user tier:', error);
      return {
        tier: 'free',
        hasPaidAccess: false,
        paidTokens: 0,
        freeTokens: 0,
        totalTokens: 0,
        messagesRemaining: 0,
        canAccessPaidModels: false
      };
    }

    if (!profile) {
      console.error('No profile found for user:', userId);
      return {
        tier: 'free',
        hasPaidAccess: false,
        paidTokens: 0,
        freeTokens: 0,
        totalTokens: 0,
        messagesRemaining: 0,
        canAccessPaidModels: false
      };
    }

    const paidTokens = profile.paid_tokens_balance || 0;
    const freeTokens = profile.free_tokens_balance || 0;
    const totalTokens = paidTokens + freeTokens;
    const messagesRemaining = profile.messages_remaining || 0;

    // User is paid tier if they have paid tokens OR is_paid flag is true OR current_tier is premium
    const hasPaidAccess = paidTokens > 0 || profile.is_paid === true || profile.current_tier === 'premium';
    const tier: UserTier = hasPaidAccess ? 'paid' : 'free';

    // Can access paid models if user is paid tier AND has any tokens available
    const canAccessPaidModels = hasPaidAccess && (totalTokens > 0 || messagesRemaining > 0);

    console.log('🔍 getUserTierInfo:', {
      userId,
      paidTokens,
      freeTokens,
      totalTokens,
      is_paid: profile.is_paid,
      current_tier: profile.current_tier,
      hasPaidAccess,
      tier,
      canAccessPaidModels
    });

    return {
      tier,
      hasPaidAccess,
      paidTokens,
      freeTokens,
      totalTokens,
      messagesRemaining,
      canAccessPaidModels
    };
  } catch (error) {
    console.error('Exception in getUserTierInfo:', error);
    return {
      tier: 'free',
      hasPaidAccess: false,
      paidTokens: 0,
      freeTokens: 0,
      totalTokens: 0,
      messagesRemaining: 0,
      canAccessPaidModels: false
    };
  }
}

export function isModelPaid(modelId: string): boolean {
  return PAID_MODELS.has(modelId);
}

export function canAccessModel(tierInfo: TierInfo, modelId: string): boolean {
  // If user has paid access (tier === 'paid'), they can access everything with tokens
  if (tierInfo.hasPaidAccess) {
    return tierInfo.totalTokens > 0 || tierInfo.messagesRemaining > 0;
  }

  // Free tier users can only access free models
  if (!isModelPaid(modelId)) {
    return tierInfo.totalTokens > 0 || tierInfo.messagesRemaining > 0;
  }

  // Free tier cannot access paid models
  return false;
}

export async function checkModelAccess(userId: string, modelId: string): Promise<{
  canAccess: boolean;
  tierInfo: TierInfo;
  reason: string;
}> {
  const tierInfo = await getUserTierInfo(userId);
  const isPaid = isModelPaid(modelId);

  if (!isPaid) {
    const canAccess = tierInfo.totalTokens > 0 || tierInfo.messagesRemaining > 0;
    return {
      canAccess,
      tierInfo,
      reason: canAccess
        ? 'Free model accessible'
        : 'No tokens available'
    };
  }

  const canAccess = tierInfo.canAccessPaidModels;
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

  const hasAccess = tierInfo.canAccessPaidModels;

  console.log(`🎯 checkPaidFeatureAccess for ${featureName}:`, {
    userId,
    hasAccess,
    paidTokens: tierInfo.paidTokens,
    totalTokens: tierInfo.totalTokens
  });

  return {
    hasAccess,
    tierInfo,
    reason: hasAccess
      ? `Access granted: ${tierInfo.paidTokens} paid tokens available`
      : 'Purchase tokens to access this feature'
  };
}
