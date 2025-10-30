import { supabase } from './supabase';

export interface UserBalance {
  balance: number;
  currencyType: 'tokens' | 'coins';
  isPremium: boolean;
}

export interface PremiumModel {
  id: string;
  name: string;
  requiresPremium: boolean;
}

const PREMIUM_MODELS = [
  'openai/sora-turbo',
  'claude-sonnet-4.5',
  'claude-sonnet-4.5-v2',
  'perplexity/sonar-pro',
  'perplexity/sonar-reasoning-pro',
  'o1-pro'
];

export async function getUserBalance(userId: string): Promise<UserBalance | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_balance', {
      user_id: userId
    });

    if (error) {
      console.error('Error getting user balance:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      balance: result.balance || 0,
      currencyType: result.currency_type || 'coins',
      isPremium: result.is_premium || false
    };
  } catch (error) {
    console.error('Error in getUserBalance:', error);
    return null;
  }
}

export async function canAccessModel(userId: string, modelId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('can_access_model', {
      user_id: userId,
      model_id: modelId
    });

    if (error) {
      console.error('Error checking model access:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in canAccessModel:', error);
    return false;
  }
}

export async function deductCurrency(
  userId: string,
  amount: number,
  description: string = 'AI usage'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('deduct_currency', {
      user_id: userId,
      amount: amount,
      description: description
    });

    if (error) {
      console.error('Error deducting currency:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in deductCurrency:', error);
    return false;
  }
}

export function isModelPremium(modelId: string): boolean {
  return PREMIUM_MODELS.includes(modelId);
}

export async function checkUserPremiumStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }

    return data?.is_premium || false;
  } catch (error) {
    console.error('Error in checkUserPremiumStatus:', error);
    return false;
  }
}

export function formatBalance(balance: number, currencyType: 'tokens' | 'coins'): string {
  const formatted = balance >= 1000000
    ? `${(balance / 1000000).toFixed(2)}M`
    : balance >= 1000
    ? `${(balance / 1000).toFixed(1)}K`
    : balance.toString();

  return `${formatted} ${currencyType}`;
}
