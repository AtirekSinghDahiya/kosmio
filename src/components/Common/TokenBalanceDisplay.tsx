import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserTokenBalance } from '../../lib/tokenService';
import { formatTokenDisplay } from '../../lib/modelTokenPricing';

interface TokenBalanceDisplayProps {
  onPurchaseClick?: () => void;
  showDetails?: boolean;
}

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({
  onPurchaseClick,
  showDetails = false
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadBalance();
      const interval = setInterval(loadBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadBalance = async () => {
    if (!user?.uid) return;

    try {
      const tokenBalance = await getUserTokenBalance(user.uid);
      setBalance(tokenBalance);
      setShowWarning(tokenBalance < 50000 && tokenBalance > 0);
    } catch (error) {
      console.error('Error loading token balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = () => {
    if (balance === 0) return 'text-red-400';
    if (balance < 50000) return 'text-orange-400';
    if (balance < 200000) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBalanceStatus = () => {
    if (balance === 0) return 'No tokens';
    if (balance < 50000) return 'Low balance';
    if (balance < 200000) return 'Good';
    return 'Healthy';
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        theme === 'light' ? 'bg-gray-100' : 'bg-white/5'
      }`}>
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
        showWarning
          ? 'bg-orange-500/10 border-orange-500/30'
          : theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-white/5 border-white/10'
      }`}>
        <Zap className={`w-4 h-4 ${getBalanceColor()}`} />
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${getBalanceColor()}`}>
            {formatTokenDisplay(balance)}
          </span>
          {showDetails && (
            <span className={`text-[10px] ${
              theme === 'light' ? 'text-gray-500' : 'text-white/50'
            }`}>
              {getBalanceStatus()}
            </span>
          )}
        </div>
      </div>

      {(balance < 100000 || balance === 0) && onPurchaseClick && (
        <button
          onClick={onPurchaseClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            balance === 0
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {balance === 0 ? 'Buy Tokens' : 'Top Up'}
          </span>
        </button>
      )}

      {showWarning && balance > 0 && (
        <div className={`absolute top-full mt-2 right-0 p-3 rounded-lg border shadow-lg z-50 ${
          theme === 'light'
            ? 'bg-white border-orange-200'
            : 'bg-slate-900 border-orange-500/30'
        }`}>
          <div className="flex items-start gap-2 max-w-xs">
            <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-xs font-semibold ${
                theme === 'light' ? 'text-orange-600' : 'text-orange-400'
              }`}>
                Low token balance
              </p>
              <p className={`text-xs mt-1 ${
                theme === 'light' ? 'text-gray-600' : 'text-white/60'
              }`}>
                You have {formatTokenDisplay(balance)} tokens left. Consider topping up to continue using premium models.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
