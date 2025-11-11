import { supabase } from './supabaseClient';
import { auth } from './firebase';
import { clearUnifiedCache } from './unifiedPremiumAccess';

export interface TokenPurchaseResult {
  success: boolean;
  message: string;
  newBalance: number;
  isPremium: boolean;
}

export async function handleTokenPurchase(
  tokenAmount: number,
  purchaseId: string
): Promise<TokenPurchaseResult> {
  const userId = auth.currentUser?.uid;

  console.log('💳 [TOKEN PURCHASE] Starting token purchase handler...');
  console.log('   User ID:', userId);
  console.log('   Token Amount:', tokenAmount);
  console.log('   Purchase ID:', purchaseId);

  if (!userId) {
    console.error('❌ [TOKEN PURCHASE] No authenticated user');
    return {
      success: false,
      message: 'No authenticated user',
      newBalance: 0,
      isPremium: false
    };
  }

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, tokens_balance, email, display_name, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ [TOKEN PURCHASE] Failed to fetch profile:', fetchError);
      return {
        success: false,
        message: 'Failed to fetch user profile',
        newBalance: 0,
        isPremium: false
      };
    }

    if (!profile) {
      console.error('❌ [TOKEN PURCHASE] Profile not found');
      return {
        success: false,
        message: 'User profile not found',
        newBalance: 0,
        isPremium: false
      };
    }

    const currentPaidTokens = profile.paid_tokens_balance || 0;
    const newPaidTokens = currentPaidTokens + tokenAmount;

    console.log('📊 [TOKEN PURCHASE] Current state:');
    console.log('   Current Paid Tokens:', currentPaidTokens);
    console.log('   Adding:', tokenAmount);
    console.log('   New Balance:', newPaidTokens);

    let tier = 'premium';
    if (newPaidTokens >= 10000000) {
      tier = 'ultra-premium';
    } else if (newPaidTokens >= 5000000) {
      tier = 'premium';
    } else {
      tier = 'budget';
    }

    console.log('🎯 [TOKEN PURCHASE] Adding tokens via database function...');

    // LOOPHOLE FIX: Use add_tokens_with_type function instead of direct update
    // This ensures the auto_downgrade_depleted_users trigger handles all premium flags
    const { data: addResult, error: addError } = await supabase.rpc('add_tokens_with_type', {
      p_user_id: userId,
      p_tokens: tokenAmount,
      p_token_type: 'paid',
      p_source: `purchase_${purchaseId}`,
      p_stripe_payment_id: purchaseId
    });

    if (addError) {
      console.error('❌ [TOKEN PURCHASE] Failed to add tokens:', addError);
      return {
        success: false,
        message: 'Failed to add tokens',
        newBalance: currentPaidTokens,
        isPremium: false
      };
    }

    console.log('✅ [TOKEN PURCHASE] Tokens added successfully:', addResult);
    console.log('   The auto_downgrade_depleted_users trigger will handle premium flag updates');

    // Tier sync is now handled by the auto_downgrade_depleted_users trigger
    // No need to manually sync as trigger does it automatically

    const { error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: userId,
        pack_id: purchaseId,
        tokens_purchased: tokenAmount,
        amount_paid: 0,
        purchase_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (purchaseError) {
      console.warn('⚠️ [TOKEN PURCHASE] Failed to record purchase (non-critical):', purchaseError);
    }

    clearUnifiedCache(userId);

    console.log('✅✅✅ [TOKEN PURCHASE] Purchase completed successfully!');
    console.log('   New Paid Token Balance:', newPaidTokens);
    console.log('   Tier:', tier);
    console.log('   Premium Status: TRUE');

    return {
      success: true,
      message: 'Tokens purchased successfully',
      newBalance: addResult.paid_balance || newPaidTokens,
      isPremium: (addResult.paid_balance || 0) > 0
    };

  } catch (error) {
    console.error('❌ [TOKEN PURCHASE] Exception:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      newBalance: 0,
      isPremium: false
    };
  }
}

async function syncToPaidTierUsers(
  userId: string,
  email: string,
  displayName: string | null,
  tier: string,
  tokens: number
): Promise<void> {
  console.log('🔄 [TOKEN PURCHASE] Syncing to paid_tier_users table...');

  try {
    const { error } = await supabase
      .from('paid_tier_users')
      .upsert({
        id: userId,
        email: email,
        display_name: displayName,
        tier_level: tier,
        tokens_remaining: tokens,
        total_tokens_purchased: tokens,
        upgraded_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ [TOKEN PURCHASE] Failed to sync paid_tier_users:', error);
    } else {
      console.log('✅ [TOKEN PURCHASE] Synced to paid_tier_users table');
    }

    const { error: deleteError } = await supabase
      .from('free_tier_users')
      .delete()
      .eq('id', userId);

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn('⚠️ [TOKEN PURCHASE] Failed to remove from free_tier_users:', deleteError);
    } else {
      console.log('✅ [TOKEN PURCHASE] Removed from free_tier_users table');
    }

  } catch (error) {
    console.error('❌ [TOKEN PURCHASE] Exception syncing tier tables:', error);
  }
}

export async function deductTokens(
  userId: string,
  tokenAmount: number
): Promise<boolean> {
  console.log('💸 [TOKEN DEDUCTION] Deducting tokens...');
  console.log('   User ID:', userId);
  console.log('   Amount:', tokenAmount);

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, daily_tokens_remaining, is_paid')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError || !profile) {
      console.error('❌ [TOKEN DEDUCTION] Failed to fetch profile');
      return false;
    }

    const isPaidUser = profile.is_paid === true;
    const paidTokens = profile.paid_tokens_balance || 0;
    const dailyTokens = profile.daily_tokens_remaining || 0;

    console.log('📊 [TOKEN DEDUCTION] Current balances:');
    console.log('   Paid Tokens:', paidTokens);
    console.log('   Daily Free:', dailyTokens);
    console.log('   Is Paid User:', isPaidUser);

    if (isPaidUser && paidTokens >= tokenAmount) {
      const { error } = await supabase
        .from('profiles')
        .update({
          paid_tokens_balance: paidTokens - tokenAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ [TOKEN DEDUCTION] Failed to deduct paid tokens:', error);
        return false;
      }

      console.log('✅ [TOKEN DEDUCTION] Deducted from paid tokens');
      return true;

    } else if (dailyTokens >= tokenAmount) {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_tokens_remaining: dailyTokens - tokenAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ [TOKEN DEDUCTION] Failed to deduct daily tokens:', error);
        return false;
      }

      console.log('✅ [TOKEN DEDUCTION] Deducted from daily free tokens');
      return true;

    } else {
      console.warn('⚠️ [TOKEN DEDUCTION] Insufficient tokens');
      return false;
    }

  } catch (error) {
    console.error('❌ [TOKEN DEDUCTION] Exception:', error);
    return false;
  }
}
