import { supabase } from './supabaseClient';

export interface TierAccess {
  isPremium: boolean;
  hasPaidTokens: boolean;
  paidTokensBalance: number;
  totalTokensBalance: number;
  tier: string;
  canAccessPremiumModels: boolean;
  canAccessVideoGeneration: boolean;
}

const CACHE_DURATION = 5000;
let accessCache: Map<string, { data: TierAccess; timestamp: number }> = new Map();

export async function getUserTierAccess(userId: string): Promise<TierAccess> {
  if (!userId) {
    console.warn('⚠️ [TIER ACCESS] No user ID provided');
    return createFreeAccess();
  }

  const cached = accessCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ [TIER ACCESS] Using cached data for user:', userId);
    return cached.data;
  }

  try {
    console.log('🔍 [TIER ACCESS] Fetching tier data for user:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, tokens_balance, free_tokens_balance, is_premium, current_tier, is_paid')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [TIER ACCESS] Supabase error:', error);
      return createFreeAccess();
    }

    if (!data) {
      console.warn('⚠️ [TIER ACCESS] No profile found for user:', userId);
      return createFreeAccess();
    }

    const paidTokens = data.paid_tokens_balance || 0;
    const tokensBalance = data.tokens_balance || 0;
    const totalTokens = paidTokens + tokensBalance;

    const hasPaidTokens = paidTokens > 0;
    const isPremiumFlag = data.is_premium === true;
    const isPremiumTier = data.current_tier === 'premium';
    const isPaid = data.is_paid === true;

    const isPremium = hasPaidTokens || isPremiumFlag || isPremiumTier || isPaid;

    const access: TierAccess = {
      isPremium,
      hasPaidTokens,
      paidTokensBalance: paidTokens,
      totalTokensBalance: totalTokens,
      tier: data.current_tier || 'free',
      canAccessPremiumModels: isPremium,
      canAccessVideoGeneration: isPremium,
    };

    console.log('✅ [TIER ACCESS] User tier access:', {
      userId,
      paid_tokens: paidTokens,
      tokens_balance: tokensBalance,
      total_tokens: totalTokens,
      is_premium_flag: isPremiumFlag,
      is_premium_tier: isPremiumTier,
      is_paid: isPaid,
      RESULT: isPremium ? '🎉 PREMIUM ACCESS' : '🔒 FREE ACCESS',
      can_access_premium_models: isPremium,
    });

    accessCache.set(userId, { data: access, timestamp: Date.now() });
    return access;
  } catch (error) {
    console.error('❌ [TIER ACCESS] Exception:', error);
    return createFreeAccess();
  }
}

export function clearTierCache(userId?: string) {
  if (userId) {
    accessCache.delete(userId);
    console.log('🗑️ [TIER ACCESS] Cache cleared for user:', userId);
  } else {
    accessCache.clear();
    console.log('🗑️ [TIER ACCESS] All cache cleared');
  }
}

function createFreeAccess(): TierAccess {
  return {
    isPremium: false,
    hasPaidTokens: false,
    paidTokensBalance: 0,
    totalTokensBalance: 0,
    tier: 'free',
    canAccessPremiumModels: false,
    canAccessVideoGeneration: false,
  };
}

export async function checkModelAccess(userId: string, modelId: string, isPremiumModel: boolean): Promise<boolean> {
  if (!isPremiumModel) {
    return true;
  }

  const access = await getUserTierAccess(userId);
  const hasAccess = access.canAccessPremiumModels;

  console.log(`🔑 [MODEL ACCESS] Model: ${modelId}, Premium: ${isPremiumModel}, Access: ${hasAccess ? 'GRANTED ✅' : 'DENIED ❌'}`);

  return hasAccess;
}
