import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Coins, Zap, TrendingUp, Clock, Download, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import {
  getUserTokenBalance,
  getTokenPacks,
  getTokenTransactions,
  tokensToUSD,
  checkAndRefreshDailyTokens,
} from '../../lib/tokenService';

interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  price_usd: number;
  bonus_tokens: number;
  popular: boolean;
  active: boolean;
}

interface TokenTransaction {
  id: string;
  model_name: string;
  provider: string;
  tokens_deducted: number;
  total_cost_usd: number;
  created_at: string;
  request_type: string;
}

export const BillingView: React.FC = () => {
  const { user, userData } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [tokenPacks, setTokenPacks] = useState<TokenPack[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      await checkAndRefreshDailyTokens(user.uid);

      const [balance, packs, transactions] = await Promise.all([
        getUserTokenBalance(user.uid),
        getTokenPacks(),
        getTokenTransactions(user.uid, 20),
      ]);

      setTokenBalance(balance);
      setTokenPacks(packs);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading token data:', error);
      showToast('error', 'Load Failed', 'Could not load token data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack: TokenPack) => {
    setPurchasingPackId(pack.id);
    showToast('info', 'Coming Soon', 'Stripe checkout integration in progress');
    setTimeout(() => setPurchasingPackId(null), 2000);
  };

  const totalTokensWithBonus = (pack: TokenPack) => pack.tokens + pack.bonus_tokens;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden ${
        theme === 'light'
          ? 'bg-gradient-to-br from-gray-50 to-blue-50'
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      }`}
    >
      <div
        className={`p-6 border-b ${
          theme === 'light' ? 'border-gray-200 bg-white/50' : 'border-white/10 bg-black/20'
        } backdrop-blur-xl`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              Token Wallet
            </h1>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
              Pay only for what you use
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div
            className={`p-8 rounded-2xl border ${
              theme === 'light'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                : 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className={`w-6 h-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Current Balance
                </h2>
              </div>
              {userData?.is_token_user && (
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  Daily Refresh: {userData.daily_free_tokens || 500} tokens
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
              >
                {formatNumber(tokenBalance)}
              </span>
              <span className={`text-2xl ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                tokens
              </span>
            </div>
            <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
              ≈ ${tokensToUSD(tokenBalance).toFixed(4)} USD value
            </p>
          </div>

          <div>
            <h2
              className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              Buy Token Packs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative p-6 rounded-2xl border transition-all ${
                    pack.popular
                      ? theme === 'light'
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-lg'
                        : 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-cyan-500/50 shadow-xl'
                      : theme === 'light'
                      ? 'bg-white border-gray-200 hover:shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-bold ${
                          theme === 'light'
                            ? 'bg-blue-600 text-white'
                            : 'bg-cyan-500 text-black'
                        }`}
                      >
                        POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3
                      className={`text-lg font-bold mb-2 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {pack.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span
                        className={`text-3xl font-bold ${
                          theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                        }`}
                      >
                        ${pack.price_usd}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div
                      className={`flex items-center justify-between text-sm ${
                        theme === 'light' ? 'text-gray-700' : 'text-white/80'
                      }`}
                    >
                      <span>Base Tokens:</span>
                      <span className="font-semibold">{formatNumber(pack.tokens)}</span>
                    </div>
                    {pack.bonus_tokens > 0 && (
                      <div
                        className={`flex items-center justify-between text-sm ${
                          theme === 'light' ? 'text-green-600' : 'text-green-400'
                        }`}
                      >
                        <span>Bonus:</span>
                        <span className="font-semibold">+{formatNumber(pack.bonus_tokens)}</span>
                      </div>
                    )}
                    <div
                      className={`flex items-center justify-between text-sm font-bold pt-2 border-t ${
                        theme === 'light' ? 'text-gray-900 border-gray-200' : 'text-white border-white/20'
                      }`}
                    >
                      <span>Total:</span>
                      <span>{formatNumber(totalTokensWithBonus(pack))}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pack)}
                    disabled={purchasingPackId === pack.id}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      pack.popular
                        ? theme === 'light'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-black'
                        : theme === 'light'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } ${purchasingPackId === pack.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    {purchasingPackId === pack.id ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2
              className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              Recent Usage
            </h2>
            {recentTransactions.length === 0 ? (
              <div
                className={`text-center py-12 rounded-2xl border ${
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
                }`}
              >
                <Zap className={`w-16 h-16 mx-auto mb-4 opacity-50 ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`} />
                <p className={`text-lg ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                  No transactions yet
                </p>
                <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>
                  Start using AI models to see your usage history
                </p>
              </div>
            ) : (
              <div
                className={`rounded-2xl border overflow-hidden ${
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={theme === 'light' ? 'bg-gray-50' : 'bg-white/5'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'} uppercase`}>
                          Model
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'} uppercase`}>
                          Type
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'} uppercase`}>
                          Tokens
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'} uppercase`}>
                          Cost
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'} uppercase`}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'light' ? 'divide-gray-200' : 'divide-white/10'}`}>
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className={theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}>
                          <td className={`px-6 py-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            <div className="font-medium">{tx.provider}</div>
                            <div className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                              {tx.model_name}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
                            {tx.request_type}
                          </td>
                          <td className={`px-6 py-4 text-right font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            -{tx.tokens_deducted}
                          </td>
                          <td className={`px-6 py-4 text-right text-sm ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
                            ${tx.total_cost_usd.toFixed(4)}
                          </td>
                          <td className={`px-6 py-4 text-right text-xs ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div
            className={`p-6 rounded-2xl border ${
              theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-500/30'
            }`}
          >
            <h3 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              How Token Billing Works
            </h3>
            <ul className={`space-y-2 text-sm ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Each AI request costs tokens based on actual provider cost + $0.005 profit margin</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>1 USD = 10,000 KroniQ Tokens (KQ Tokens)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Free users get {userData?.daily_free_tokens || 500} tokens daily (auto-refresh at midnight)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Buy tokens anytime, no subscriptions or recurring charges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
