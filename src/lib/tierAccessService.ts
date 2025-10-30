import { supabase } from './supabaseClient';

export type UserTier = 'free' | 'paid';

export interface TierInfo {
  tier: UserTier;
  hasPurchased: boolean;
  firstPurchaseAt: string | null;
  canAccessPremiumModels: boolean;
  totalAccessibleModels: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: string;
  requiresPaidTier: boolean;
  baseCostTokens: number;
}

export interface TierStatus {
  userId: string;
  currentTier: string;
  isPremium: boolean;
  paidTokensBalance: number;
  freeTokensBalance: number;
  dailyTokensRemaining: number;
  canAccessPremiumModels: boolean;
  totalAccessibleModels: number;
}

/**
 * Get user's current tier information
 */
export const getUserTier = async (userId: string): Promise<TierInfo> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_tier_status', { p_user_id: userId });

    if (error) {
      console.error('❌ Error fetching user tier:', error);
      return {
        tier: 'free',
        hasPurchased: false,
        firstPurchaseAt: null,
        canAccessPremiumModels: false,
        totalAccessibleModels: 0
      };
    }

    if (!data || data.length === 0) {
      console.error('❌ No user data found for:', userId);
      return {
        tier: 'free',
        hasPurchased: false,
        firstPurchaseAt: null,
        canAccessPremiumModels: false,
        totalAccessibleModels: 0
      };
    }

    const tierData = data[0];
    const tier = tierData.is_premium ? 'paid' : 'free';

    console.log('🔍 tierAccessService.getUserTier:', {
      userId,
      currentTier: tierData.current_tier,
      isPremium: tierData.is_premium,
      paidTokensBalance: tierData.paid_tokens_balance,
      canAccessPremiumModels: tierData.can_access_premium_models,
      finalTier: tier
    });

    return {
      tier,
      hasPurchased: tierData.is_premium,
      firstPurchaseAt: null,
      canAccessPremiumModels: tierData.can_access_premium_models,
      totalAccessibleModels: tierData.total_accessible_models
    };
  } catch (error) {
    console.error('❌ Exception in getUserTier:', error);
    return {
      tier: 'free',
      hasPurchased: false,
      firstPurchaseAt: null,
      canAccessPremiumModels: false,
      totalAccessibleModels: 0
    };
  }
};

/**
 * Get all accessible models for user
 */
export const getAccessibleModels = async (userId: string): Promise<ModelInfo[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_accessible_models', { p_user_id: userId });

    if (error) {
      console.error('❌ Error fetching accessible models:', error);
      return [];
    }

    return (data || []).map((model: any) => ({
      id: model.model_id,
      name: model.model_name,
      provider: model.provider,
      category: model.category,
      requiresPaidTier: model.requires_paid_tier,
      baseCostTokens: model.base_cost_tokens
    }));
  } catch (error) {
    console.error('❌ Exception in getAccessibleModels:', error);
    return [];
  }
};

/**
 * Check if user can access a specific model
 */
export const canAccessModel = async (userId: string, modelId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('can_access_model_by_tier', {
        p_user_id: userId,
        p_model_id: modelId
      });

    if (error) {
      console.error('❌ Error checking model access:', error);
      return false;
    }

    console.log(`🔒 Access check for ${modelId}:`, data);
    return data === true;
  } catch (error) {
    console.error('❌ Exception in canAccessModel:', error);
    return false;
  }
};

/**
 * Upgrade user to paid tier (called after successful purchase)
 */
export const upgradeUserToPaidTier = async (userId: string, tokensAdded: number): Promise<void> => {
  try {
    const { error } = await supabase
      .rpc('upgrade_user_to_paid_tier', {
        p_user_id: userId,
        p_tokens_added: tokensAdded
      });

    if (error) {
      console.error('❌ Error upgrading user to paid tier:', error);
      throw error;
    }

    console.log('✅ User upgraded to paid tier:', userId, 'with', tokensAdded, 'tokens');
  } catch (error) {
    console.error('❌ Exception in upgradeUserToPaidTier:', error);
    throw error;
  }
};

/**
 * Downgrade user to free tier (called when tokens depleted)
 */
export const downgradeUserToFreeTier = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .rpc('downgrade_user_to_free_tier', { p_user_id: userId });

    if (error) {
      console.error('❌ Error downgrading user to free tier:', error);
      throw error;
    }

    console.log('✅ User downgraded to free tier:', userId);
  } catch (error) {
    console.error('❌ Exception in downgradeUserToFreeTier:', error);
    throw error;
  }
};

/**
 * Check and update user tier based on token balance
 */
export const checkAndUpdateUserTier = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .rpc('check_and_update_user_tier', { p_user_id: userId });

    if (error) {
      console.error('❌ Error checking user tier:', error);
      return 'error';
    }

    console.log('🔄 Tier check result for', userId, ':', data);
    return data || 'no_change';
  } catch (error) {
    console.error('❌ Exception in checkAndUpdateUserTier:', error);
    return 'error';
  }
};

/**
 * Get detailed tier status for user
 */
export const getTierStatus = async (userId: string): Promise<TierStatus | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_tier_status', { p_user_id: userId });

    if (error) {
      console.error('❌ Error fetching tier status:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const status = data[0];
    return {
      userId: status.user_id,
      currentTier: status.current_tier,
      isPremium: status.is_premium,
      paidTokensBalance: status.paid_tokens_balance,
      freeTokensBalance: status.free_tokens_balance,
      dailyTokensRemaining: status.daily_tokens_remaining,
      canAccessPremiumModels: status.can_access_premium_models,
      totalAccessibleModels: status.total_accessible_models
    };
  } catch (error) {
    console.error('❌ Exception in getTierStatus:', error);
    return null;
  }
};
