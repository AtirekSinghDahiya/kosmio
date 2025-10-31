import { supabase } from './supabaseClient';
import { auth } from './firebase';

export interface UnifiedPremiumStatus {
  isPremium: boolean;
  userId: string;
  paidTokens: number;
  totalTokens: number;
  tier: string;
  source: string;
  timestamp: number;
}

const CACHE_DURATION = 10000;
const cache = new Map<string, UnifiedPremiumStatus>();

export async function getUnifiedPremiumStatus(): Promise<UnifiedPremiumStatus> {
  const userId = auth.currentUser?.uid;

  console.log('🔐 [UNIFIED PREMIUM] Starting premium check');
  console.log('   User ID:', userId);
  console.log('   Timestamp:', new Date().toISOString());

  if (!userId) {
    console.warn('❌ [UNIFIED PREMIUM] No authenticated user');
    return createFreeStatus('no_user');
  }

  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ [UNIFIED PREMIUM] Using cached result:', cached.isPremium ? 'PREMIUM' : 'FREE');
    return cached;
  }

  try {
    console.log('🔍 [UNIFIED PREMIUM] Fetching from database...');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, paid_tokens_balance, tokens_balance, free_tokens_balance, is_premium, is_paid, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [UNIFIED PREMIUM] Database error:', error);
      return createFreeStatus('database_error');
    }

    if (!profile) {
      console.warn('⚠️ [UNIFIED PREMIUM] Profile not found');
      return createFreeStatus('no_profile');
    }

    console.log('📊 [UNIFIED PREMIUM] Profile data:');
    console.log('   Paid Tokens:', profile.paid_tokens_balance);
    console.log('   Total Tokens:', profile.tokens_balance);
    console.log('   Free Tokens:', profile.free_tokens_balance);
    console.log('   is_premium:', profile.is_premium);
    console.log('   is_paid:', profile.is_paid);
    console.log('   current_tier:', profile.current_tier);

    const paidTokens = profile.paid_tokens_balance || 0;
    const totalTokens = profile.tokens_balance || 0;

    const isPremium = paidTokens > 0 ||
                     profile.is_premium === true ||
                     profile.is_paid === true ||
                     profile.current_tier === 'premium' ||
                     profile.current_tier === 'ultra-premium';

    console.log('🎯 [UNIFIED PREMIUM] Calculated status:');
    console.log('   Has Paid Tokens:', paidTokens > 0);
    console.log('   is_premium flag:', profile.is_premium);
    console.log('   is_paid flag:', profile.is_paid);
    console.log('   Premium tier:', profile.current_tier === 'premium' || profile.current_tier === 'ultra-premium');
    console.log('   FINAL RESULT:', isPremium ? '✅ PREMIUM' : '❌ FREE');

    if (isPremium && paidTokens > 0) {
      await ensurePremiumFlagsSet(userId, paidTokens, profile.current_tier);
    }

    const status: UnifiedPremiumStatus = {
      isPremium,
      userId,
      paidTokens,
      totalTokens,
      tier: profile.current_tier || 'free',
      source: 'unified_check',
      timestamp: Date.now()
    };

    cache.set(userId, status);

    if (isPremium) {
      console.log('✅✅✅ [UNIFIED PREMIUM] USER HAS PREMIUM ACCESS ✅✅✅');
    } else {
      console.log('🔒🔒🔒 [UNIFIED PREMIUM] FREE TIER USER 🔒🔒🔒');
    }

    return status;

  } catch (error) {
    console.error('❌ [UNIFIED PREMIUM] Exception:', error);
    return createFreeStatus('exception');
  }
}

async function ensurePremiumFlagsSet(userId: string, paidTokens: number, currentTier: string | null): Promise<void> {
  console.log('🔄 [UNIFIED PREMIUM] Ensuring premium flags are set...');

  try {
    const updates: any = {};
    let needsUpdate = false;

    const { data: current } = await supabase
      .from('profiles')
      .select('is_premium, is_paid, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (current) {
      if (current.is_premium !== true) {
        updates.is_premium = true;
        needsUpdate = true;
      }
      if (current.is_paid !== true) {
        updates.is_paid = true;
        needsUpdate = true;
      }
      if (!currentTier || currentTier === 'free') {
        updates.current_tier = 'premium';
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log('📝 [UNIFIED PREMIUM] Updating premium flags:', updates);
        updates.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (error) {
          console.error('❌ [UNIFIED PREMIUM] Failed to update flags:', error);
        } else {
          console.log('✅ [UNIFIED PREMIUM] Premium flags updated successfully');
        }
      } else {
        console.log('✅ [UNIFIED PREMIUM] All premium flags already set correctly');
      }
    }

    await ensurePaidTierUserRecord(userId, paidTokens);

  } catch (error) {
    console.error('❌ [UNIFIED PREMIUM] Error ensuring flags:', error);
  }
}

async function ensurePaidTierUserRecord(userId: string, paidTokens: number): Promise<void> {
  console.log('🔄 [UNIFIED PREMIUM] Ensuring paid_tier_users record...');

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      console.warn('⚠️ [UNIFIED PREMIUM] Profile not found for paid tier sync');
      return;
    }

    const { error } = await supabase
      .from('paid_tier_users')
      .upsert({
        id: userId,
        email: profile.email,
        display_name: profile.display_name,
        tier_level: profile.current_tier || 'premium',
        tokens_remaining: paidTokens,
        upgraded_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ [UNIFIED PREMIUM] Failed to upsert paid_tier_users:', error);
    } else {
      console.log('✅ [UNIFIED PREMIUM] paid_tier_users record synced');
    }

    const { error: deleteError } = await supabase
      .from('free_tier_users')
      .delete()
      .eq('id', userId);

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('⚠️ [UNIFIED PREMIUM] Failed to remove from free_tier_users:', deleteError);
    }

  } catch (error) {
    console.error('❌ [UNIFIED PREMIUM] Error syncing paid tier:', error);
  }
}

function createFreeStatus(reason: string): UnifiedPremiumStatus {
  console.log('🆓 [UNIFIED PREMIUM] Returning FREE status, reason:', reason);
  return {
    isPremium: false,
    userId: auth.currentUser?.uid || '',
    paidTokens: 0,
    totalTokens: 0,
    tier: 'free',
    source: reason,
    timestamp: Date.now()
  };
}

export function clearUnifiedCache(userId?: string): void {
  if (userId) {
    cache.delete(userId);
    console.log('🗑️ [UNIFIED PREMIUM] Cache cleared for user:', userId);
  } else {
    cache.clear();
    console.log('🗑️ [UNIFIED PREMIUM] All cache cleared');
  }
}

export async function forceRefreshPremiumStatus(): Promise<UnifiedPremiumStatus> {
  const userId = auth.currentUser?.uid;
  if (userId) {
    clearUnifiedCache(userId);
  }
  return getUnifiedPremiumStatus();
}
