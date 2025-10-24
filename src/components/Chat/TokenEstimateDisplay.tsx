import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { TokenEstimator } from '../../lib/tokenEstimator';

interface TokenEstimateDisplayProps {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  className?: string;
}

export const TokenEstimateDisplay: React.FC<TokenEstimateDisplayProps> = ({
  message,
  conversationHistory,
  className = '',
}) => {
  const estimate = useMemo(() => {
    if (!message.trim()) {
      return { tokens: 0, credits: 0 };
    }

    return TokenEstimator.estimateMessageCost(message, undefined, conversationHistory);
  }, [message, conversationHistory]);

  if (!message.trim()) {
    return null;
  }

  const getColorClass = () => {
    if (estimate.tokens < 100) return 'text-green-400';
    if (estimate.tokens < 1000) return 'text-yellow-400';
    if (estimate.tokens < 5000) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSizeLabel = () => {
    if (estimate.tokens < 100) return 'Tiny';
    if (estimate.tokens < 500) return 'Small';
    if (estimate.tokens < 2000) return 'Medium';
    if (estimate.tokens < 5000) return 'Large';
    return 'Very Large';
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className="flex items-center gap-1">
        <Zap className={`w-3 h-3 ${getColorClass()}`} />
        <span className={`font-semibold ${getColorClass()}`}>
          ~{estimate.tokens.toLocaleString()} tokens
        </span>
      </div>
      <span className="text-white/40">•</span>
      <span className="text-white/60">
        {getSizeLabel()} message
      </span>
      <span className="text-white/40">•</span>
      <span className="text-white/60">
        ~${estimate.credits.toFixed(3)}
      </span>
    </div>
  );
};
