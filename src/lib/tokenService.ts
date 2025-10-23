import { supabase } from './supabase';

const TOKEN_CONVERSION_RATE = 10000;
const PROFIT_MARGIN_USD = 0.005;

export interface TokenCostEstimate {
  estimatedTokens: number;
  providerCostUSD: number;
  profitMarginUSD: number;
  totalCostUSD: number;
  hasEnoughBalance: boolean;
  currentBalance: number;
}

export interface TokenDeductionResult {
  success: boolean;
  balance: number;
  transactionId?: string;
  error?: string;
}

const MODEL_COST_ESTIMATES: Record<string, { input: number; output: number }> = {
  'grok-2': { input: 0.000005, output: 0.000015 },
  'grok-4': { input: 0.000005, output: 0.000015 },
  'gpt-5': { input: 0.00001, output: 0.00003 },
  'gpt-5-chat': { input: 0.00001, output: 0.00003 },
  'claude-sonnet': { input: 0.000003, output: 0.000015 },
  'claude-3.5-sonnet': { input: 0.000003, output: 0.000015 },
  'nemotron': { input: 0.000002, output: 0.000008 },
  'qwen': { input: 0.000003, output: 0.000012 },
  'qwen-thinking': { input: 0.000003, output: 0.000012 },
  'deepseek': { input: 0.000001, output: 0.000004 },
  'gemini': { input: 0.0000002, output: 0.0000008 },
  'gemini-flash': { input: 0.0000002, output: 0.0000008 },
  'kimi': { input: 0.000001, output: 0.000003 },
  'chatgpt-image': { input: 0.00001, output: 0.00003 },
};

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface UserTokenInfo {
  balance: number;
  dailyFreeTokens: number;
  lifetimePurchased: number;
  lifetimeUsed: number;
  lastRefresh: string | null;
  isTokenUser: boolean;
  isFreeUser: boolean;
}

export async function getUserTokenBalance(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens_balance')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.tokens_balance || 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

export async function getUserTokenInfo(userId: string): Promise<UserTokenInfo> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens_balance, daily_free_tokens, tokens_lifetime_purchased, tokens_lifetime_used, last_token_refresh, is_token_user')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    const isFreeUser = (data?.tokens_lifetime_purchased || 0) === 0;

    return {
      balance: data?.tokens_balance || 0,
      dailyFreeTokens: data?.daily_free_tokens || 1000,
      lifetimePurchased: data?.tokens_lifetime_purchased || 0,
      lifetimeUsed: data?.tokens_lifetime_used || 0,
      lastRefresh: data?.last_token_refresh || null,
      isTokenUser: data?.is_token_user || true,
      isFreeUser,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return {
      balance: 0,
      dailyFreeTokens: 1000,
      lifetimePurchased: 0,
      lifetimeUsed: 0,
      lastRefresh: null,
      isTokenUser: true,
      isFreeUser: true,
    };
  }
}

export async function checkAndRefreshDailyTokens(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_token_refresh, daily_free_tokens, is_token_user')
      .eq('id', userId)
      .maybeSingle();

    if (!profile || !profile.is_token_user) return;

    const lastRefresh = profile.last_token_refresh
      ? new Date(profile.last_token_refresh)
      : new Date(0);

    const now = new Date();
    const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRefresh >= 24) {
      const { error } = await supabase.rpc('refresh_daily_tokens');
      if (error) console.error('Error refreshing daily tokens:', error);
    }
  } catch (error) {
    console.error('Error in checkAndRefreshDailyTokens:', error);
  }
}

export function estimateTokenCost(
  modelId: string,
  inputText: string,
  estimatedOutputTokens: number = 500
): { providerCostUSD: number; tokens: number } {
  const modelCosts = MODEL_COST_ESTIMATES[modelId] || { input: 0.000005, output: 0.000015 };

  const inputTokens = estimateTokenCount(inputText);
  const outputTokens = estimatedOutputTokens;

  const inputCost = inputTokens * modelCosts.input;
  const outputCost = outputTokens * modelCosts.output;
  const providerCostUSD = inputCost + outputCost;

  const totalCostUSD = providerCostUSD + PROFIT_MARGIN_USD;
  const tokens = Math.ceil(totalCostUSD * TOKEN_CONVERSION_RATE);

  return { providerCostUSD, tokens };
}

export async function estimateRequestCost(
  userId: string,
  modelId: string,
  inputText: string,
  estimatedOutputTokens: number = 500
): Promise<TokenCostEstimate> {
  const { providerCostUSD, tokens } = estimateTokenCost(modelId, inputText, estimatedOutputTokens);
  const currentBalance = await getUserTokenBalance(userId);

  return {
    estimatedTokens: tokens,
    providerCostUSD,
    profitMarginUSD: PROFIT_MARGIN_USD,
    totalCostUSD: providerCostUSD + PROFIT_MARGIN_USD,
    hasEnoughBalance: currentBalance >= tokens,
    currentBalance,
  };
}

export async function deductTokensForRequest(
  userId: string,
  modelId: string,
  provider: string,
  providerCostUSD: number,
  requestType: string = 'chat'
): Promise<TokenDeductionResult> {
  try {
    const totalCostUSD = providerCostUSD + PROFIT_MARGIN_USD;
    const tokens = Math.ceil(totalCostUSD * TOKEN_CONVERSION_RATE);

    const { data, error } = await supabase.rpc('deduct_tokens', {
      p_user_id: userId,
      p_tokens: tokens,
      p_model: modelId,
      p_provider: provider,
      p_cost_usd: providerCostUSD,
      p_request_type: requestType,
    });

    if (error) throw error;

    const result = data as { success: boolean; balance?: number; transaction_id?: string; error?: string };

    if (!result.success) {
      return {
        success: false,
        balance: result.balance || 0,
        error: result.error || 'Token deduction failed',
      };
    }

    return {
      success: true,
      balance: result.balance || 0,
      transactionId: result.transaction_id,
    };
  } catch (error: any) {
    console.error('Error deducting tokens:', error);
    return {
      success: false,
      balance: 0,
      error: error.message || 'Failed to deduct tokens',
    };
  }
}

export async function addTokensToUser(
  userId: string,
  tokens: number,
  packId?: string,
  amountPaid?: number,
  stripePaymentId?: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('add_tokens', {
      p_user_id: userId,
      p_tokens: tokens,
      p_pack_id: packId || null,
      p_amount_paid: amountPaid || 0,
      p_stripe_payment_id: stripePaymentId || null,
    });

    if (error) throw error;

    const result = data as { success: boolean; balance?: number };
    return result;
  } catch (error: any) {
    console.error('Error adding tokens:', error);
    return { success: false, error: error.message };
  }
}

export async function getTokenPacks() {
  try {
    const { data, error } = await supabase
      .from('token_packs')
      .select('*')
      .eq('active', true)
      .order('tokens', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token packs:', error);
    return [];
  }
}

export async function getTokenTransactions(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    return [];
  }
}

export async function getTokenPurchases(userId: string) {
  try {
    const { data, error } = await supabase
      .from('token_purchases')
      .select('*, token_packs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token purchases:', error);
    return [];
  }
}

export function usdToTokens(usd: number): number {
  return Math.ceil(usd * TOKEN_CONVERSION_RATE);
}

export function tokensToUSD(tokens: number): number {
  return tokens / TOKEN_CONVERSION_RATE;
}
