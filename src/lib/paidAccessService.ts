/**
 * Simple Paid Access Service
 * If user has ANY tokens, they get FULL access to EVERYTHING
 */

import { supabase } from './supabase';

export interface UserAccessStatus {
  hasAccess: boolean;
  totalTokens: number;
  reason: string;
}

/**
 * Check if user has paid access
 * Rule: If user has ANY tokens (paid OR free > 25K), give full access
 */
export async function checkPaidAccess(userId: string): Promise<UserAccessStatus> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, free_tokens_balance, messages_remaining')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error checking paid access:', error);
      return {
        hasAccess: false,
        totalTokens: 0,
        reason: 'Error fetching user data'
      };
    }

    const paidTokens = data.paid_tokens_balance || 0;
    const freeTokens = data.free_tokens_balance || 0;
    const messages = data.messages_remaining || 0;

    const totalTokens = paidTokens + freeTokens;

    // SIMPLE RULE: If they have ANY tokens, give full access
    const hasAccess = totalTokens > 0 || messages > 0;

    console.log('💎 Access Check:', {
      userId,
      paidTokens,
      freeTokens,
      messages,
      totalTokens,
      hasAccess
    });

    return {
      hasAccess,
      totalTokens,
      reason: hasAccess ? 'User has tokens' : 'No tokens available'
    };
  } catch (error) {
    console.error('Exception checking paid access:', error);
    return {
      hasAccess: false,
      totalTokens: 0,
      reason: 'Exception occurred'
    };
  }
}

/**
 * Simplified model access check
 * Everyone with tokens gets access to ALL models
 */
export function hasModelAccess(hasAccess: boolean, modelId: string): boolean {
  // If user has any tokens, they can use any model
  return hasAccess;
}
