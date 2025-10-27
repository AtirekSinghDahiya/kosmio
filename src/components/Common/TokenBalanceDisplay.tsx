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
  const [tier, setTier] = useState<string>('free');

  // Fetch token balance from Supabase
  const fetchBalance = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('💰 Fetching token balance for user:', user.uid);

      // Get user's token balance from user_tokens table
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_tokens')
        .select('balance, tier')
        .eq('user_id', user.uid)
        .maybeSingle();

      if (tokenError) {
        console.error('Error fetching token balance:', tokenError);

        // If user doesn't exist in user_tokens, create entry with free tier
        if (tokenError.code === 'PGRST116') {
          console.log('Creating new token entry for user...');
          const { data: newData, error: insertError } = await supabase
            .from('user_tokens')
            .insert({
              user_id: user.uid,
              balance: 1000, // Free tier default
              tier: 'free'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating token entry:', insertError);
            setBalance(1000); // Default fallback
            setTier('free');
          } else {
            setBalance(newData.balance);
            setTier(newData.tier || 'free');
          }
        } else {
          setBalance(0);
          setTier('free');
        }
      } else if (tokenData) {
        console.log('✅ Token balance:', tokenData.balance);
        setBalance(tokenData.balance || 0);
        setTier(tokenData.tier || 'free');
      } else {
        // Create entry for new user
        const { data: newData, error: insertError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: user.uid,
            balance: 1000,
            tier: 'free'
          })
          .select()
          .single();

        if (!insertError && newData) {
          setBalance(newData.balance);
          setTier('free');
        } else {
          setBalance(1000);
          setTier('free');
        }
      }
    } catch (error) {
      console.error('Exception fetching token balance:', error);
      setBalance(0);
      setTier('free');
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
          table: 'user_tokens',
          filter: `user_id=eq.${user.uid}`
        },
        (payload) => {
          console.log('💰 Token balance updated:', payload);
          if (payload.new && 'balance' in payload.new) {
            setBalance(payload.new.balance as number);
            setTier((payload.new as any).tier || 'free');
          }
        }
      )
      .subscribe();

    // Refresh every 30 seconds as fallback
    const interval = setInterval(fetchBalance, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  if (!user || isLoading) {
    return null;
  }

  const getTierColor = () => {
    switch (tier.toLowerCase()) {
      case 'pro': return 'from-blue-500 to-blue-600';
      case 'premium': return 'from-purple-500 to-purple-600';
      case 'enterprise': return 'from-amber-500 to-amber-600';
      default: return 'from-orange-500 to-orange-600';
    }
  };

  const getTierMaxTokens = () => {
    switch (tier.toLowerCase()) {
      case 'pro': return 100000;
      case 'premium': return 500000;
      case 'enterprise': return 1000000;
      default: return 10000;
    }
  };

  const maxTokens = getTierMaxTokens();
  const percentage = Math.min((balance / maxTokens) * 100, 100);

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
          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getTierColor()}`}>
            <Coins className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-white/70 font-medium">Token Balance</span>
        </div>
        <span className={`text-xs font-bold bg-gradient-to-r ${getTierColor()} bg-clip-text text-transparent uppercase tracking-wide`}>
          {tier}
        </span>
      </div>

      <div className="space-y-2">
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getTierColor()} h-2 rounded-full transition-all duration-500`}
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
        {balance < maxTokens * 0.1 && (
          <div className="text-xs text-amber-400 mt-2">
            Running low on tokens. Consider upgrading!
          </div>
        )}
      </div>
    </div>
  );
};
