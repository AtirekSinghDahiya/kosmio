import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle, TrendingUp } from 'lucide-react';
import { getUserTokenInfo, UserTokenInfo } from '../../lib/tokenService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const TokenBalanceDisplay: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tokenInfo, setTokenInfo] = useState<UserTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadTokenInfo();
      const interval = setInterval(loadTokenInfo, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.uid]);

  const loadTokenInfo = async () => {
    if (!user?.uid) return;

    try {
      const info = await getUserTokenInfo(user.uid);
      setTokenInfo(info);
    } catch (error) {
      console.error('Error loading token info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || !tokenInfo) {
    return null;
  }

  const percentageRemaining = tokenInfo.isFreeUser
    ? (tokenInfo.balance / tokenInfo.dailyFreeTokens) * 100
    : 100;

  const isLow = tokenInfo.balance < 100;
  const isDepleted = tokenInfo.balance === 0;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
        theme === 'light'
          ? 'bg-white/80 border border-gray-200'
          : 'bg-white/5 border border-white/10'
      } ${isDepleted ? 'ring-2 ring-red-500/50' : isLow ? 'ring-2 ring-yellow-500/50' : ''}`}
    >
      <div className={`p-2 rounded-lg ${
        theme === 'light' ? 'bg-blue-50' : 'bg-cyan-500/10'
      }`}>
        <Coins className={`w-5 h-5 ${
          isDepleted
            ? 'text-red-500'
            : isLow
            ? 'text-yellow-500'
            : theme === 'light'
            ? 'text-blue-600'
            : 'text-cyan-400'
        }`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            {tokenInfo.balance.toLocaleString()}
          </span>
          {tokenInfo.isFreeUser && (
            <span className={`text-xs ${
              theme === 'light' ? 'text-gray-500' : 'text-white/50'
            }`}>
              / {tokenInfo.dailyFreeTokens.toLocaleString()}
            </span>
          )}
          <span className={`text-xs ${
            theme === 'light' ? 'text-gray-400' : 'text-white/40'
          }`}>
            tokens
          </span>
        </div>

        {tokenInfo.isFreeUser && (
          <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isDepleted
                  ? 'bg-red-500'
                  : isLow
                  ? 'bg-yellow-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, percentageRemaining))}%` }}
            />
          </div>
        )}

        {isDepleted && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-500 font-medium">
              {tokenInfo.isFreeUser ? 'Daily limit reached' : 'No tokens'}
            </span>
          </div>
        )}

        {!isDepleted && isLow && tokenInfo.isFreeUser && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">
              Running low
            </span>
          </div>
        )}
      </div>

      {tokenInfo.isFreeUser && (
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
          theme === 'light'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-white/5 text-white/60'
        }`}>
          Free
        </div>
      )}

      {!tokenInfo.isFreeUser && (
        <div className={`flex items-center gap-1 text-xs ${
          theme === 'light' ? 'text-green-600' : 'text-green-400'
        }`}>
          <TrendingUp className="w-3 h-3" />
          <span className="font-medium">Pro</span>
        </div>
      )}
    </div>
  );
};
