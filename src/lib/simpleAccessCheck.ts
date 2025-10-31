import { supabase } from './supabaseClient';

export async function isPremiumUser(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('paid_tier_users')
      .select('tier_level')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }

    const isPremium = data?.tier_level === 'premium';
    console.log(`✅ User ${userId} is ${isPremium ? 'PREMIUM' : 'FREE'}`);

    return isPremium;
  } catch (err) {
    console.error('Exception checking premium:', err);
    return false;
  }
}
