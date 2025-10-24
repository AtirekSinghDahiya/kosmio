import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getTokenPacks, getTotalTokens } from '../../lib/subscriptionManagementService';

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

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Modal loading timeout - using fallback');
        const fallbackPacks = [
          {
            id: '1',
            name: 'Starter',
            tokens: 10000,
            priceUsd: 1.8,
            recurringPriceUsd: 1.62,
            bonusTokens: 0,
            popular: false
          },
          {
            id: '2',
            name: 'Popular',
            tokens: 60000,
            priceUsd: 8,
            recurringPriceUsd: 7.2,
            bonusTokens: 5000,
            popular: true
          },
          {
            id: '3',
            name: 'Pro',
            tokens: 200000,
            priceUsd: 20,
            recurringPriceUsd: 18,
            bonusTokens: 30000,
            popular: false
          }
        ];
        setTokenPacks(fallbackPacks);
        setSelectedPack(fallbackPacks[1]);
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const loadTokenPacks = async () => {
    try {
      const packs = await getTokenPacks();
      if (packs && packs.length > 0) {
        setTokenPacks(packs);
        const popularPack = packs.find(p => p.popular) || packs[1] || packs[0];
        setSelectedPack(popularPack);
      } else {
        // Use fallback
        const fallbackPacks = [
          {
            id: '1',
            name: 'Starter',
            tokens: 10000,
            priceUsd: 1.8,
            recurringPriceUsd: 1.62,
            bonusTokens: 0,
            popular: false
          },
          {
            id: '2',
            name: 'Popular',
            tokens: 60000,
            priceUsd: 8,
            recurringPriceUsd: 7.2,
            bonusTokens: 5000,
            popular: true
          },
          {
            id: '3',
            name: 'Pro',
            tokens: 200000,
            priceUsd: 20,
            recurringPriceUsd: 18,
            bonusTokens: 30000,
            popular: false
          }
        ];
        setTokenPacks(fallbackPacks);
        setSelectedPack(fallbackPacks[1]);
      }
    } catch (error) {
      console.error('Error loading token packs:', error);
      // Use fallback on error
      const fallbackPacks = [
        {
          id: '1',
          name: 'Starter',
          tokens: 10000,
          priceUsd: 1.8,
          recurringPriceUsd: 1.62,
          bonusTokens: 0,
          popular: false
        },
        {
          id: '2',
          name: 'Popular',
          tokens: 55000,
          priceUsd: 8,
          recurringPriceUsd: 7.2,
          bonusTokens: 5000,
          popular: true
        },
        {
          id: '3',
          name: 'Pro',
          tokens: 170000,
          priceUsd: 20,
          recurringPriceUsd: 18,
          bonusTokens: 30000,
          popular: false
        }
      ];
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
          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-white/60 text-sm">Save 10% on a yearly subscription</span>
            <div className="flex gap-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#00FFF0] text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-[#00FFF0] text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

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
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-white/60">
                per {billingPeriod === 'monthly' ? 'month' : 'year'}
                <br />
                <span className="text-xs">billed {billingPeriod}</span>
              </span>
            </div>

            {/* Token Pack Dropdown */}
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">Monthly tokens</label>
              <div className="relative">
                <button
                  onClick={() => setShowPackDropdown(!showPackDropdown)}
                  className="w-full glass-panel rounded-xl p-4 border border-white/20 flex items-center justify-between hover:border-[#00FFF0]/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#00FFF0]" />
                    <span className="text-white font-semibold">
                      {(totalTokens / 1000000).toFixed(0)}M tokens / month
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${showPackDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showPackDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl border border-white/20 overflow-hidden z-10 shadow-xl">
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
                            <span className="text-white font-medium">
                              {(packTotal / 1000000).toFixed(0)}M
                            </span>
                          </div>
                          <span className="text-white/60 text-sm">
                            ${pack.recurringPriceUsd}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-white/40 text-xs mt-2">
                Your current plan: {(selectedPack.tokens / 1000).toFixed(0)}K tokens
              </p>
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
              <h4 className="text-white font-semibold mb-3">You get:</h4>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Access to all 27 AI models</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>No daily token limit</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>{(totalTokens / 1000).toFixed(0)}K tokens per month</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Unused tokens roll over to next month</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>Website hosting & custom domains</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-[#00FFF0] flex-shrink-0" />
                <span>100MB file uploads</span>
              </div>
            </div>
          </div>

          {/* Info */}
          {billingPeriod === 'yearly' && savings !== '0' && (
            <div className="text-center">
              <p className="text-green-400 text-sm font-semibold">
                You save ${savings} with yearly billing!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
