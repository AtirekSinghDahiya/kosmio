import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getTokenPacks, getTotalTokens } from '../../lib/subscriptionManagementService';
import { estimateMixedUsage, formatTokenDisplay } from '../../lib/modelTokenPricing';

interface PricingModalProps {
  onClose: () => void;
}

interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  priceUsd: number;
  recurringPriceUsd: number;
  bonusTokens: number;
  popular: boolean;
}

const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }
  return tokens.toString();
};

export const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tokenPacks, setTokenPacks] = useState<TokenPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<TokenPack | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showPackDropdown, setShowPackDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokenPacks();
  }, []);

  const loadTokenPacks = async () => {
    const fallbackPacks = [
      {
        id: '1',
        name: 'Starter',
        tokens: 900000,
        priceUsd: 2,
        recurringPriceUsd: 2,
        bonusTokens: 0,
        popular: false
      },
      {
        id: '2',
        name: 'Popular',
        tokens: 2250000,
        priceUsd: 5,
        recurringPriceUsd: 5,
        bonusTokens: 0,
        popular: true
      },
      {
        id: '3',
        name: 'Power User',
        tokens: 4500000,
        priceUsd: 10,
        recurringPriceUsd: 10,
        bonusTokens: 0,
        popular: false
      },
      {
        id: '4',
        name: 'Pro',
        tokens: 9000000,
        priceUsd: 20,
        recurringPriceUsd: 20,
        bonusTokens: 0,
        popular: false
      }
    ];

    try {
      const packs = await Promise.race([
        getTokenPacks(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500))
      ]) as TokenPack[];

      if (packs && packs.length > 0) {
        setTokenPacks(packs);
        const popularPack = packs.find(p => p.popular) || packs[1] || packs[0];
        setSelectedPack(popularPack);
      } else {
        setTokenPacks(fallbackPacks);
        setSelectedPack(fallbackPacks[1]);
      }
    } catch (error) {
      console.log('Using fallback packs');
      setTokenPacks(fallbackPacks);
      setSelectedPack(fallbackPacks[1]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      alert('Please sign in to purchase tokens');
      onClose();
      return;
    }

    if (!selectedPack) return;

    // Navigate to billing page with selected pack
    window.location.href = '/billing?tab=buy-tokens';
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFF0] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!selectedPack) return null;

  const totalTokens = getTotalTokens(selectedPack.tokens, selectedPack.bonusTokens);
  const displayPrice = billingPeriod === 'monthly' ? selectedPack.recurringPriceUsd : selectedPack.recurringPriceUsd * 12 * 0.9;
  const savings = billingPeriod === 'yearly' ? (selectedPack.recurringPriceUsd * 12 * 0.1).toFixed(2) : '0';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel rounded-3xl max-w-2xl w-full border border-white/20 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Keep building your momentum</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Plan Card */}
          <div className="glass-panel rounded-2xl p-4 border-2 border-[#00FFF0]/30 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white">{selectedPack.name}</h3>
              {selectedPack.popular && (
                <span className="px-3 py-1 rounded-full bg-[#00FFF0]/20 text-[#00FFF0] text-xs font-bold border border-[#00FFF0]/30">
                  POPULAR
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
                ${selectedPack.priceUsd.toFixed(2)}
              </span>
              <span className="text-white/60">
                one-time
              </span>
            </div>

            {/* Message Pack Dropdown */}
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">Token credits</label>
              <div className="relative">
                <button
                  onClick={() => setShowPackDropdown(!showPackDropdown)}
                  className="w-full glass-panel rounded-xl p-4 border border-white/20 flex items-center justify-between hover:border-[#00FFF0]/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#00FFF0]" />
                    <span className="text-white font-semibold">
                      {formatTokenDisplay(totalTokens)} tokens
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${showPackDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showPackDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/30 overflow-hidden z-10 shadow-2xl bg-[#0a0a1f]/95 backdrop-blur-xl">
                    {tokenPacks.map((pack) => {
                      const packTotal = getTotalTokens(pack.tokens, pack.bonusTokens);
                      const isSelected = pack.id === selectedPack.id;
                      const isCurrent = pack.id === selectedPack.id;

                      return (
                        <button
                          key={pack.id}
                          onClick={() => {
                            setSelectedPack(pack);
                            setShowPackDropdown(false);
                          }}
                          className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all border-b border-white/10 last:border-b-0 ${
                            isSelected ? 'bg-[#00FFF0]/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCurrent && (
                              <span className="px-2 py-1 rounded-full bg-[#00FFF0]/20 text-[#00FFF0] text-xs font-bold">
                                Current
                              </span>
                            )}
                            <div className="flex flex-col">
                              <span className="text-white font-medium">
                                {formatTokens(packTotal)} credits
                              </span>
                              <span className="text-white/40 text-xs">
                                ~{Math.floor(packTotal / 500).toLocaleString()} messages
                              </span>
                            </div>
                          </div>
                          <span className="text-white/60 text-sm">
                            ${pack.priceUsd.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-white/40 text-xs mt-2">
                One-time purchase • Use anytime • Rollover enabled
              </p>

              {/* Model Usage Examples */}
              <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs mb-2">
                  <span className="text-[#00FFF0] font-semibold">What you can do with {formatTokenDisplay(totalTokens)} tokens:</span>
                </p>
                <div className="space-y-1">
                  {estimateMixedUsage(totalTokens).map((usage, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-white/50">{usage.model}:</span>
                      <span className="text-white/70 font-semibold">{usage.messages.toLocaleString()} messages</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-blue-300 text-xs">
                  <span className="font-semibold">💡 Smart tip:</span> Mix models for best value! Use free models for simple tasks, premium models for complex work.
                </p>
              </div>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={handlePurchase}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white font-bold text-base hover:shadow-xl hover:shadow-[#00FFF0]/50 transition-all mb-4"
            >
              Upgrade
            </button>

            {/* Features */}
            <div className="space-y-2">
              <h4 className="text-white font-semibold mb-3">What's included:</h4>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Access to all 27+ AI models</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>12 free models + 15 premium models</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Use Claude Opus, GPT-5, and all other models</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>{formatTokenDisplay(totalTokens)} tokens (~{Math.floor(totalTokens / 400).toLocaleString()}+ messages)</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Transparent per-model pricing</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Unused tokens roll over forever</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>No subscription required</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
