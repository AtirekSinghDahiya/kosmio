import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TokenBalanceDisplayProps {
  isExpanded?: boolean;
}

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({ isExpanded = false }) => {
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

      // Get user's token balance from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('tokens_balance')
        .eq('id', user.uid)
        .maybeSingle();

      if (error) {
        console.error('Error fetching token balance:', error);
        setBalance(0);
      } else if (profileData) {
        const tokenBalance = profileData.tokens_balance || 0;
        console.log('✅ Token balance:', tokenBalance);
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
          if (payload.new && 'tokens_balance' in payload.new) {
            const newBalance = (payload.new as any).tokens_balance || 0;
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

  const maxTokens = 10000000; // 10M tokens max for display
  const percentage = Math.min((balance / maxTokens) * 100, 100);

  // Determine color based on balance
  const getBalanceColor = () => {
    if (balance >= 1000000) return 'from-green-500 to-emerald-600';
    if (balance >= 100000) return 'from-blue-500 to-cyan-600';
    if (balance >= 10000) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  if (!isExpanded) {
    // Collapsed view - just show icon and balance
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <Coins className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-semibold text-white">{balance.toLocaleString()}</span>
      </div>
    );
  }

  // Expanded view - show full details
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

      <div className="space-y-2">
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getBalanceColor()} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Balance details */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-white font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-orange-400" />
            {balance.toLocaleString()} tokens
          </span>
          <span className="text-white/50">{maxTokens.toLocaleString()} max</span>
        </div>

        {/* Warning if low balance */}
        {balance < 10000 && balance > 0 && (
          <div className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            ⚠️ Low balance! Consider purchasing more tokens.
          </div>
        )}

        {balance === 0 && (
          <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
            ⚠️ Out of tokens! Purchase tokens to continue.
          </div>
        )}
      </div>
    </div>
  );
};
