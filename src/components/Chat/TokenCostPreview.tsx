import React, { useMemo } from 'react';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getModelCost, formatTokenDisplay } from '../../lib/modelTokenPricing';

interface TokenCostPreviewProps {
  selectedModel: string;
  currentBalance: number;
  paidBalance: number;
  freeBalance: number;
}

export const TokenCostPreview: React.FC<TokenCostPreviewProps> = ({
  selectedModel,
  currentBalance,
  paidBalance,
  freeBalance
}) => {
  const { theme } = useTheme();

  const costInfo = useMemo(() => {
    const modelCost = getModelCost(selectedModel);
    const tokenCost = modelCost.tokensPerMessage;
    const canAfford = currentBalance >= tokenCost;
    const shortfall = canAfford ? 0 : tokenCost - currentBalance;

    // Determine where tokens will be deducted from
    let deductionInfo = '';
    if (paidBalance >= tokenCost) {
      deductionInfo = 'Using purchased tokens';
    } else if (paidBalance > 0) {
      deductionInfo = `Using ${formatTokenDisplay(paidBalance)} paid + ${formatTokenDisplay(tokenCost - paidBalance)} free tokens`;
    } else {
      deductionInfo = 'Using free daily tokens';
    }

    return {
      tokenCost,
      canAfford,
      shortfall,
      deductionInfo,
      tierColor: modelCost.tier === 'free' ? 'green' :
                 modelCost.tier === 'budget' ? 'blue' :
                 modelCost.tier === 'mid' ? 'yellow' :
                 modelCost.tier === 'premium' ? 'orange' : 'red'
    };
  }, [selectedModel, currentBalance, paidBalance, freeBalance]);

  if (!costInfo.canAfford) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        theme === 'light'
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}>
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 text-xs">
          <div className="font-semibold">Insufficient Tokens</div>
          <div className="opacity-80">
            Need {formatTokenDisplay(costInfo.tokenCost)} tokens.
            You're short by {formatTokenDisplay(costInfo.shortfall)} tokens.
          </div>
        </div>
      </div>
    );
  }

  const getCostColor = () => {
    const { tierColor } = costInfo;
    if (theme === 'light') {
      return tierColor === 'green' ? 'bg-green-50 border-green-200 text-green-700' :
             tierColor === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' :
             tierColor === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
             tierColor === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
             'bg-red-50 border-red-200 text-red-700';
    }
    return tierColor === 'green' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
           tierColor === 'blue' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
           tierColor === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
           tierColor === 'orange' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
           'bg-red-500/10 border-red-500/30 text-red-400';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getCostColor()}`}>
      <CheckCircle className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1 text-xs">
        <div className="font-semibold flex items-center gap-2">
          <Zap className="w-3 h-3" />
          {formatTokenDisplay(costInfo.tokenCost)} tokens per message
        </div>
        <div className="opacity-80 mt-0.5">{costInfo.deductionInfo}</div>
      </div>
      <div className="text-xs font-mono font-semibold">
        {formatTokenDisplay(currentBalance - costInfo.tokenCost)} left
      </div>
    </div>
  );
};
