import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserBalance, formatBalance, type UserBalance } from '../../lib/currencyService';

interface TokenBalanceDisplayProps {
  isExpanded?: boolean;
  showDetails?: boolean;
  onPurchaseClick?: () => void;
}

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({ isExpanded = false, showDetails = true, onPurchaseClick }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('💰 Fetching balance for user:', user.uid);
      const userBalance = await getUserBalance(user.uid);

      if (userBalance) {
        setBalance(userBalance);
        console.log(`✅ Balance: ${formatBalance(userBalance.balance, userBalance.currencyType)} (${userBalance.isPremium ? 'Premium' : 'Free'})`);
      } else {
        console.log('⚠️ No balance data found');
        setBalance(null);
      }
    } catch (error) {
      console.error('Exception fetching balance:', error);
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

  const getBalanceColor = () => {
    if (!balance) return 'from-gray-500 to-gray-600';
    if (balance.isPremium) return 'from-green-500 to-emerald-600';
    if (balance.balance >= 100000) return 'from-blue-500 to-cyan-600';
    if (balance.balance >= 50000) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getTierLabel = () => {
    if (!balance) return 'FREE';
    return balance.isPremium ? 'PREMIUM' : 'FREE';
  };

  const displayBalance = balance?.balance || 0;
  const currencyLabel = balance?.currencyType === 'tokens' ? 'tokens' : 'coins';

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
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-2xl font-bold text-white">
            {formatBalance(displayBalance, balance.currencyType)}
          </span>
          <span className="text-sm text-white/50 ml-1">{currencyLabel}</span>
        </div>
      )}
    </div>
  );
};
