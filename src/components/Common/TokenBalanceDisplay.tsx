import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TokenBalanceDisplayProps {
  isExpanded?: boolean;
  showDetails?: boolean;
  onPurchaseClick?: () => void;
}

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({ isExpanded = false, showDetails = true, onPurchaseClick }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch token balance from Supabase profiles table
  const fetchBalance = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('💰 Fetching token balance for user:', user.uid);

      // Get user's token balance from profiles table - check daily_tokens_remaining for free users
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('tokens_balance, daily_tokens_remaining, current_tier, is_paid')
        .eq('id', user.uid)
        .maybeSingle();

      if (error) {
        console.error('Error fetching token balance:', error);
        setBalance(0);
      } else if (profileData) {
        // Free users should see daily_tokens_remaining, paid users see tokens_balance
        const isFreeUser = !profileData.is_paid && profileData.current_tier === 'free';
        const tokenBalance = isFreeUser
          ? (profileData.daily_tokens_remaining || 0)
          : (profileData.tokens_balance || 0);
        console.log('✅ Token balance:', tokenBalance, '(Free user:', isFreeUser, ')');
        setBalance(tokenBalance);
      } else {
        console.log('⚠️ No profile found for user');
        setBalance(0);
      }
    } catch (error) {
      console.error('Exception fetching token balance:', error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [user]);

  // Real-time subscription to token balance changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`token-balance-${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.uid}`
        },
        (payload) => {
          console.log('💰 Token balance updated via realtime:', payload);
          if (payload.new) {
            const profile = payload.new as any;
            const isFreeUser = !profile.is_paid && profile.current_tier === 'free';
            const newBalance = isFreeUser
              ? (profile.daily_tokens_remaining || 0)
              : (profile.tokens_balance || 0);
            console.log('📊 New balance:', newBalance);
            setBalance(newBalance);
          }
        }
      )
      .subscribe();

    // Refresh every 5 seconds as fallback
    const interval = setInterval(fetchBalance, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  if (!user || isLoading) {
    return null;
  }

  // Determine color based on balance (no max, just show what they have)
  const getBalanceColor = () => {
    if (balance >= 1000000) return 'from-green-500 to-emerald-600';
    if (balance >= 100000) return 'from-blue-500 to-cyan-600';
    if (balance >= 10000) return 'from-orange-500 to-orange-600';
    return 'from-orange-500 to-orange-600'; // Default orange, no red warnings
  };

  if (!isExpanded && !showDetails) {
    // Compact view for navbar - just icon and balance
    return (
      <button
        onClick={onPurchaseClick}
        className="flex items-center gap-2 px-4 py-2.5 glass-panel rounded-full border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in"
      >
        <Coins className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-bold text-white">{balance.toLocaleString()}</span>
      </button>
    );
  }

  // Expanded view - clean, simple display
  return (
    <div className="glass-panel rounded-xl p-4 border-white/10 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getBalanceColor()}`}>
            <Coins className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-white/70 font-medium">Token Balance</span>
        </div>
        <span className={`text-xs font-bold bg-gradient-to-r ${getBalanceColor()} bg-clip-text text-transparent uppercase tracking-wide`}>
          {balance >= 1000000 ? 'Premium' : balance >= 100000 ? 'Pro' : 'Free'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-orange-400" />
        <span className="text-2xl font-bold text-white">
          {balance.toLocaleString()}
        </span>
        <span className="text-sm text-white/50 ml-1">tokens</span>
      </div>
    </div>
  );
};
