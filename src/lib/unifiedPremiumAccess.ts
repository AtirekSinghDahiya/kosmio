import { supabase } from './supabaseClient';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface UnifiedPremiumStatus {
  isPremium: boolean;
  userId: string;
  paidTokens: number;
  totalTokens: number;
  tier: string;
  source: string;
  timestamp: number;
}

const CACHE_DURATION = 2000;
const cache = new Map<string, UnifiedPremiumStatus>();
let authInitialized = false;
let authInitPromise: Promise<void> | null = null;

// Expose debug functions to window
if (typeof window !== 'undefined') {
  (window as any).debugPremium = {
    checkStatus: async (userId?: string) => {
      const status = await getUnifiedPremiumStatus(userId);
      console.log('🔍 Premium Status:', status);
      return status;
    },
    clearCache: (userId?: string) => {
      clearUnifiedCache(userId);
      console.log('🗑️ Cache cleared');
    },
    forceRefresh: async (userId?: string) => {
      const status = await forceRefreshPremiumStatus(userId);
      console.log('🔄 Force refreshed:', status);
      return status;
    }
  };
}

function waitForAuth(): Promise<string | null> {
  if (authInitialized && auth.currentUser) {
    return Promise.resolve(auth.currentUser.uid);
  }

  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        authInitialized = true;
        unsubscribe();
        resolve();
      });

      setTimeout(() => {
        authInitialized = true;
        unsubscribe();
        resolve();
      }, 3000);
    });
  }

  return authInitPromise.then(() => auth.currentUser?.uid || null);
}

export async function getUnifiedPremiumStatus(userIdOverride?: string): Promise<UnifiedPremiumStatus> {
  let userId = userIdOverride;

  if (!userId) {
    userId = await waitForAuth();
  }

  if (!userId) {
    return createFreeStatus('no_user');
  }

  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🔁 Returning cached premium status:', cached);
    return cached;
  }

  try {
    console.log('📊 Fetching fresh premium status for:', userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, paid_tokens_balance, tokens_balance, free_tokens_balance, is_premium, is_paid, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Database error fetching profile:', error);
      return createFreeStatus('database_error');
    }

    if (!profile) {
      console.warn('⚠️ No profile found for user:', userId);
      await retryCreateProfile(userId);
      return createFreeStatus('no_profile');
    }

    console.log('📦 Profile data:', profile);

    const paidTokens = profile.paid_tokens_balance || 0;
    const totalTokens = profile.tokens_balance || 0;

    const isPremium = paidTokens > 0 ||
                     profile.is_premium === true ||
                     profile.is_paid === true ||
                     profile.current_tier === 'premium' ||
                     profile.current_tier === 'ultra-premium';

    console.log('💎 Premium calculation:', {
      paidTokens,
      is_premium: profile.is_premium,
      is_paid: profile.is_paid,
      current_tier: profile.current_tier,
      result: isPremium
    });

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

    console.log('✅ Final premium status:', status);
    cache.set(userId, status);
    return status;

  } catch (error) {
    return createFreeStatus('exception');
  }
}

async function retryCreateProfile(userId: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      clearUnifiedCache(userId);
      return;
    }
  }
}

async function ensurePremiumFlagsSet(userId: string, paidTokens: number, currentTier: string | null): Promise<void> {
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
        updates.updated_at = new Date().toISOString();
        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);
      }
    }

    await ensurePaidTierUserRecord(userId, paidTokens);
  } catch (error) {
  }
}

async function ensurePaidTierUserRecord(userId: string, paidTokens: number): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, current_tier')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return;

    await supabase
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

    await supabase
      .from('free_tier_users')
      .delete()
      .eq('id', userId);
  } catch (error) {
  }
}

function createFreeStatus(reason: string): UnifiedPremiumStatus {
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
  } else {
    cache.clear();
  }
}

export async function forceRefreshPremiumStatus(userId?: string): Promise<UnifiedPremiumStatus> {
  if (!userId) {
    userId = await waitForAuth();
  }
  if (userId) {
    clearUnifiedCache(userId);
  }
  return getUnifiedPremiumStatus(userId || undefined);
}
