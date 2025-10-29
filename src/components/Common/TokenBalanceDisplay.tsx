import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TokenBalanceDisplayProps {
  isExpanded?: boolean;
  showDetails?: boolean;
  onPurchaseClick?: () => void;
}

interface TokenBalance {
  tier: string;
  dailyTokens: number;
  paidTokens: number;
  totalTokens: number;
  canUsePaidModels: boolean;
}

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({ isExpanded = false, showDetails = true, onPurchaseClick }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch token balance using new tier-based function
  const fetchBalance = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('💰 Fetching token balance for user:', user.uid);

      // Use the new get_user_token_balance function
      const { data, error } = await supabase
        .rpc('get_user_token_balance', { p_user_id: user.uid });

      if (error) {
        console.error('Error fetching token balance:', error);
        setBalance(null);
      } else if (data && data.length > 0) {
        const balanceData = data[0];
        setBalance({
          tier: balanceData.tier,
          dailyTokens: balanceData.daily_tokens || 0,
          paidTokens: balanceData.paid_tokens || 0,
          totalTokens: balanceData.total_tokens || 0,
          canUsePaidModels: balanceData.can_use_paid_models || false
        });
        console.log('✅ Token balance:', balanceData);
      } else {
        console.log('⚠️ No balance data found');
        setBalance(null);
      }
    } catch (error) {
      console.error('Exception fetching token balance:', error);
      setBalance(null);
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
          // Refetch balance when profile changes
          fetchBalance();
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

  if (!user) {
    return null;
  }

  // Determine color based on tier and balance
  const getBalanceColor = () => {
    if (!balance) return 'from-gray-500 to-gray-600';
    if (balance.tier === 'premium' || balance.paidTokens > 0) return 'from-green-500 to-emerald-600';
    if (balance.totalTokens >= 10000) return 'from-blue-500 to-cyan-600';
    if (balance.totalTokens >= 1000) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getTierLabel = () => {
    if (!balance) return 'FREE';
    if (balance.tier === 'premium' && balance.paidTokens > 0) return 'PREMIUM';
    if (balance.tier === 'premium') return 'PREMIUM (No Tokens)';
    return 'FREE';
  };

  const displayBalance = balance?.totalTokens || 0;

  if (!isExpanded && !showDetails) {
    // Compact view for navbar - just icon and balance
    return (
      <button
        onClick={onPurchaseClick}
        className="flex items-center gap-2 px-4 py-2.5 glass-panel rounded-full border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in"
      >
        <Coins className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-bold text-white">{displayBalance.toLocaleString()}</span>
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
          {getTierLabel()}
        </span>
      </div>

      {balance && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-2xl font-bold text-white">
              {displayBalance.toLocaleString()}
            </span>
            <span className="text-sm text-white/50 ml-1">tokens</span>
          </div>
          {showDetails && balance.tier === 'free' && balance.dailyTokens > 0 && (
            <div className="text-xs text-white/50 mt-1">
              Daily: {balance.dailyTokens.toLocaleString()} • Resets at midnight UTC
            </div>
          )}
          {showDetails && balance.paidTokens > 0 && (
            <div className="text-xs text-green-400 mt-1">
              💎 Paid: {balance.paidTokens.toLocaleString()} • Daily: {balance.dailyTokens.toLocaleString()}
            </div>
          )}
          {showDetails && balance.paidTokens === 0 && balance.tier === 'premium' && (
            <div className="text-xs text-yellow-400 mt-1">
              ⚠️ Purchase tokens to access premium models
            </div>
          )}
        </>
      )}
    </div>
  );
};
