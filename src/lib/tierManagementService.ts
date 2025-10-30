/**
 * Dynamic Tier Management Service
 * Handles automatic transitions between Free and Paid tiers
 */

import { supabase } from './supabase';

export interface TierStatus {
  tier: 'free' | 'paid';
  tokensRemaining: number;
  isInGracePeriod: boolean;
  gracePeriodEndsAt: Date | null;
  allowedModels: string[];
}

export interface TierTransitionResult {
  success: boolean;
  message: string;
  newTier: 'free' | 'paid';
  tokensBalance?: number;
}

// Free tier model allowlist
const FREE_TIER_MODELS = [
  'grok-4-fast',
  'deepseek-v3.1-free',
  'nemotron-nano-free',
  'qwen-vl-30b-free',
  'claude-3-haiku',
  'gemini-flash-lite-free',
  'kimi-k2-free'
];

// All premium models (paid tier gets access to everything)
const PAID_TIER_MODELS = [
  ...FREE_TIER_MODELS,
  'gpt-5-chat',
  'deepseek-v3.2',
  'nemotron-super',
  'qwen-vl-32b',
  'kimi-k2-0905',
  'claude-haiku-4.5',
  'perplexity-sonar-pro',
  'claude-sonnet',
  'perplexity-sonar-reasoning',
  'perplexity-sonar-deep',
  'gemini-flash-image',
  'llama-4-maverick',
  'glm-4.6',
  'claude-opus-4',
  'claude-opus-4.1'
];

/**
 * Get user's current tier status
 */
export async function getUserTierStatus(userId: string): Promise<TierStatus> {
  try {
    // Check if user is in paid tier
    const { data: paidUser, error: paidError } = await supabase
      .from('paid_tier_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (paidError) {
      console.error('Error checking paid tier:', paidError);
    }

    if (paidUser) {
      // User is in paid tier
      const tokensRemaining = paidUser.tokens_remaining || 0;

      // Check for grace period (stored in profiles table)
      const { data: profile } = await supabase
        .from('profiles')
        .select('grace_period_ends_at, in_grace_period')
        .eq('id', userId)
        .maybeSingle();

      return {
        tier: 'paid',
        tokensRemaining,
        isInGracePeriod: profile?.in_grace_period || false,
        gracePeriodEndsAt: profile?.grace_period_ends_at ? new Date(profile.grace_period_ends_at) : null,
        allowedModels: PAID_TIER_MODELS
      };
    }

    // Check if user is in free tier
    const { data: freeUser, error: freeError } = await supabase
      .from('free_tier_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (freeError) {
      console.error('Error checking free tier:', freeError);
    }

    if (freeUser) {
      return {
        tier: 'free',
        tokensRemaining: freeUser.daily_tokens_remaining || 0,
        isInGracePeriod: false,
        gracePeriodEndsAt: null,
        allowedModels: FREE_TIER_MODELS
      };
    }

    // User not in either tier, default to free
    return {
      tier: 'free',
      tokensRemaining: 0,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      allowedModels: FREE_TIER_MODELS
    };
  } catch (error) {
    console.error('Error getting tier status:', error);
    return {
      tier: 'free',
      tokensRemaining: 0,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      allowedModels: FREE_TIER_MODELS
    };
  }
}

/**
 * Move user from Free to Paid tier (after purchase)
 */
export async function upgradeUserToPaidTier(
  userId: string,
  tokensPurchased: number,
  stripeCustomerId?: string
): Promise<TierTransitionResult> {
  try {
    console.log('🔄 Upgrading user to paid tier:', { userId, tokensPurchased });

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle();

    const email = profile?.email || '';

    // Check if user already exists in paid tier
    const { data: existingPaid } = await supabase
      .from('paid_tier_users')
      .select('id, tokens_remaining')
      .eq('id', userId)
      .maybeSingle();

    if (existingPaid) {
      // User already in paid tier, just add tokens
      const newBalance = (existingPaid.tokens_remaining || 0) + tokensPurchased;

      await supabase
        .from('paid_tier_users')
        .update({
          tokens_remaining: newBalance,
          total_tokens_purchased: supabase.rpc('increment', { x: tokensPurchased }),
          last_payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Update profile to mark as paid
      await supabase
        .from('profiles')
        .update({
          is_paid: true,
          paid_tokens_balance: newBalance,
          in_grace_period: false,
          grace_period_ends_at: null,
          last_purchase_date: new Date().toISOString()
        })
        .eq('id', userId);

      console.log('✅ Tokens added to existing paid user:', newBalance);

      return {
        success: true,
        message: 'Tokens added to your account',
        newTier: 'paid',
        tokensBalance: newBalance
      };
    }

    // Create new paid tier user
    await supabase
      .from('paid_tier_users')
      .insert({
        id: userId,
        email,
        tier_level: 'premium',
        tokens_remaining: tokensPurchased,
        total_tokens_purchased: tokensPurchased,
        stripe_customer_id: stripeCustomerId,
        last_payment_date: new Date().toISOString(),
        upgraded_date: new Date().toISOString()
      });

    // Update profile
    await supabase
      .from('profiles')
      .update({
        is_paid: true,
        paid_tokens_balance: tokensPurchased,
        current_tier: 'premium',
        in_grace_period: false,
        grace_period_ends_at: null,
        last_purchase_date: new Date().toISOString()
      })
      .eq('id', userId);

    // Remove from free tier if exists
    await supabase
      .from('free_tier_users')
      .delete()
      .eq('id', userId);

    // Log transition
    await logTierTransition(userId, 'free', 'paid', 'payment_received', tokensPurchased);

    // Queue notification
    await queueNotification(
      userId,
      'upgraded_to_paid',
      'Welcome to Premium!',
      `You now have full access to all premium AI models. Token balance: ${tokensPurchased.toLocaleString()}`
    );

    console.log('✅ User upgraded to paid tier successfully');

    return {
      success: true,
      message: 'Upgraded to paid tier successfully',
      newTier: 'paid',
      tokensBalance: tokensPurchased
    };
  } catch (error: any) {
    console.error('❌ Error upgrading to paid tier:', error);
    return {
      success: false,
      message: error.message || 'Failed to upgrade tier',
      newTier: 'free'
    };
  }
}

/**
 * Move user from Paid to Free tier (tokens depleted)
 */
export async function downgradeUserToFreeTier(
  userId: string,
  reason: string = 'tokens_depleted',
  gracePeriodHours: number = 24
): Promise<TierTransitionResult> {
  try {
    console.log('🔄 Downgrading user to free tier:', { userId, reason });

    // Get user data
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, in_grace_period')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if already in grace period
    if (profile.in_grace_period) {
      // Grace period has expired, do the actual downgrade

      // Create free tier user
      await supabase
        .from('free_tier_users')
        .insert({
          id: userId,
          email: profile.email,
          daily_tokens_remaining: 25000,
          monthly_tokens_remaining: 750000
        })
        .onConflict('id')
        .ignoreDuplicates();

      // Update profile
      await supabase
        .from('profiles')
        .update({
          is_paid: false,
          paid_tokens_balance: 0,
          current_tier: 'free',
          in_grace_period: false,
          grace_period_ends_at: null
        })
        .eq('id', userId);

      // Remove from paid tier
      await supabase
        .from('paid_tier_users')
        .delete()
        .eq('id', userId);

      // Log transition
      await logTierTransition(userId, 'paid', 'free', reason, 0);

      // Queue notification
      await queueNotification(
        userId,
        'downgraded_to_free',
        'Account Moved to Free Tier',
        'Your token balance has been depleted. You now have access to free tier models. Purchase tokens to regain premium access.'
      );

      console.log('✅ User downgraded to free tier after grace period');

      return {
        success: true,
        message: 'Moved to free tier after grace period',
        newTier: 'free',
        tokensBalance: 0
      };
    }

    // Start grace period
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setHours(gracePeriodEnd.getHours() + gracePeriodHours);

    await supabase
      .from('profiles')
      .update({
        in_grace_period: true,
        grace_period_ends_at: gracePeriodEnd.toISOString()
      })
      .eq('id', userId);

    // Queue grace period notification
    await queueNotification(
      userId,
      'grace_period_started',
      'Token Balance Depleted - Grace Period Active',
      `Your tokens have run out. You have ${gracePeriodHours} hours to purchase more tokens before your account is moved to the free tier.`
    );

    console.log('✅ Grace period started for user');

    return {
      success: true,
      message: `Grace period started (${gracePeriodHours}h)`,
      newTier: 'paid',
      tokensBalance: 0
    };
  } catch (error: any) {
    console.error('❌ Error downgrading to free tier:', error);
    return {
      success: false,
      message: error.message || 'Failed to downgrade tier',
      newTier: 'paid'
    };
  }
}

/**
 * Check if user has access to a model
 */
export async function hasModelAccess(userId: string, modelId: string): Promise<boolean> {
  const tierStatus = await getUserTierStatus(userId);
  return tierStatus.allowedModels.includes(modelId);
}

/**
 * Track token usage and auto-downgrade if needed
 */
export async function trackTokenUsageWithDowngrade(
  userId: string,
  modelId: string,
  tokenCost: number
): Promise<{ success: boolean; newBalance: number; warning?: string }> {
  try {
    // Check if user is in paid tier
    const { data: paidUser } = await supabase
      .from('paid_tier_users')
      .select('tokens_remaining')
      .eq('id', userId)
      .maybeSingle();

    if (paidUser) {
      const currentBalance = paidUser.tokens_remaining || 0;
      const newBalance = Math.max(0, currentBalance - tokenCost);

      // Update balance
      await supabase
        .from('paid_tier_users')
        .update({
          tokens_remaining: newBalance,
          tokens_used_lifetime: supabase.rpc('increment', { x: tokenCost }),
          last_active: new Date().toISOString()
        })
        .eq('id', userId);

      // Also update profile
      await supabase
        .from('profiles')
        .update({
          paid_tokens_balance: newBalance
        })
        .eq('id', userId);

      // Check for downgrade conditions
      if (newBalance === 0) {
        await downgradeUserToFreeTier(userId, 'tokens_depleted', 24);
        return {
          success: true,
          newBalance: 0,
          warning: 'Tokens depleted - grace period started (24 hours)'
        };
      }

      // Low balance warning
      if (newBalance < 100000 && newBalance > 0) {
        await queueNotification(
          userId,
          'tokens_low',
          'Token Balance Running Low',
          `You have ${newBalance.toLocaleString()} tokens remaining. Purchase more tokens to continue using premium features.`
        );
        return {
          success: true,
          newBalance,
          warning: 'Low token balance'
        };
      }

      return { success: true, newBalance };
    }

    // Free tier user - different tracking
    const { data: freeUser } = await supabase
      .from('free_tier_users')
      .select('daily_tokens_remaining, monthly_tokens_remaining')
      .eq('id', userId)
      .maybeSingle();

    if (freeUser) {
      const newDaily = Math.max(0, (freeUser.daily_tokens_remaining || 0) - tokenCost);
      const newMonthly = Math.max(0, (freeUser.monthly_tokens_remaining || 0) - tokenCost);

      await supabase
        .from('free_tier_users')
        .update({
          daily_tokens_remaining: newDaily,
          monthly_tokens_remaining: newMonthly
        })
        .eq('id', userId);

      return { success: true, newBalance: newDaily };
    }

    return { success: false, newBalance: 0 };
  } catch (error) {
    console.error('Error tracking token usage:', error);
    return { success: false, newBalance: 0 };
  }
}

/**
 * Check for expired grace periods (run as cron job)
 */
export async function checkExpiredGracePeriods(): Promise<number> {
  try {
    const now = new Date().toISOString();

    // Find users with expired grace periods
    const { data: expiredUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('in_grace_period', true)
      .lt('grace_period_ends_at', now);

    if (!expiredUsers || expiredUsers.length === 0) {
      return 0;
    }

    let transitionCount = 0;
    for (const user of expiredUsers) {
      const result = await downgradeUserToFreeTier(user.id, 'grace_period_expired', 0);
      if (result.success) {
        transitionCount++;
      }
    }

    console.log(`✅ Processed ${transitionCount} expired grace periods`);
    return transitionCount;
  } catch (error) {
    console.error('Error checking expired grace periods:', error);
    return 0;
  }
}

/**
 * Log a tier transition for audit trail
 */
async function logTierTransition(
  userId: string,
  fromTier: 'free' | 'paid',
  toTier: 'free' | 'paid',
  reason: string,
  tokensAtTransition: number
): Promise<void> {
  try {
    await supabase
      .from('tier_transitions')
      .insert({
        user_id: userId,
        from_tier: fromTier,
        to_tier: toTier,
        reason,
        tokens_at_transition: tokensAtTransition,
        triggered_by: 'system'
      });
  } catch (error) {
    console.error('Error logging tier transition:', error);
  }
}

/**
 * Queue a notification for the user
 */
async function queueNotification(
  userId: string,
  type: string,
  subject: string,
  message: string
): Promise<void> {
  try {
    await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        notification_type: type,
        subject,
        message,
        status: 'pending'
      });
  } catch (error) {
    console.error('Error queueing notification:', error);
  }
}
