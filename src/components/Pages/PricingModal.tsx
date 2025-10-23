import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Zap, Star, Crown, Coins } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getTokenPacks } from '../../lib/tokenService';

interface PricingModalProps {
  onClose: () => void;
}

interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  price_usd: number;
  bonus_tokens: number;
  popular: boolean;
  active: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [tokenPacks, setTokenPacks] = useState<TokenPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadTokenPacks();
  }, []);

  const loadTokenPacks = async () => {
    setLoading(true);
    try {
      const packs = await getTokenPacks();
      setTokenPacks(packs);
    } catch (error) {
      console.error('Error loading token packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForPack = (name: string) => {
    if (name.includes('Starter')) return Sparkles;
    if (name.includes('Popular')) return Zap;
    if (name.includes('Pro')) return Star;
    if (name.includes('Enterprise')) return Crown;
    return Coins;
  };

  const getGradientForPack = (name: string, popular: boolean) => {
    if (popular) return 'from-cyan-500 to-blue-600';
    if (name.includes('Starter')) return 'from-gray-500 to-gray-600';
    if (name.includes('Pro')) return 'from-purple-500 to-pink-600';
    if (name.includes('Enterprise')) return 'from-yellow-500 to-orange-600';
    return 'from-blue-500 to-cyan-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handlePurchase = (pack: TokenPack) => {
    if (!user) {
      alert('Please sign in to purchase tokens');
      onClose();
      return;
    }

    setPurchasing(pack.id);
    alert('Stripe checkout integration coming soon!');
    setTimeout(() => setPurchasing(null), 2000);
  };

  const getFeatures = (pack: TokenPack) => {
    const features = [
      `${formatNumber(pack.tokens)} base tokens`,
    ];

    if (pack.bonus_tokens > 0) {
      features.push(`+${formatNumber(pack.bonus_tokens)} bonus tokens`);
      features.push(`= ${formatNumber(pack.tokens + pack.bonus_tokens)} total`);
    }

    features.push('Access to all AI models');
    features.push('Valid for 12 months');
    features.push('No monthly commitment');

    if (pack.popular) {
      features.push('Best value per token');
    }

    if (pack.name.includes('Pro')) {
      features.push('Priority support');
    }

    if (pack.name.includes('Enterprise')) {
      features.push('Dedicated support');
      features.push('Custom deployment options');
    }

    return features;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel backdrop-blur-3xl border border-white/20 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 glass-panel backdrop-blur-3xl border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-6 h-6 text-cyan-400" />
              <h2 className="text-3xl font-bold text-white">Token Pricing</h2>
            </div>
            <p className="text-white/60 text-sm">Buy tokens once, use them anytime. No subscriptions.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all button-press"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tokenPacks.map((pack, index) => {
                const Icon = getIconForPack(pack.name);
                const gradient = getGradientForPack(pack.name, pack.popular);
                const features = getFeatures(pack);

                return (
                  <div
                    key={pack.id}
                    className={`glass-panel rounded-2xl p-6 relative animate-fade-in-up ${
                      pack.popular ? 'ring-2 ring-cyan-500/50 scale-105' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 rounded-full text-xs font-semibold text-white">
                        Most Popular
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">{pack.name}</h3>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold text-white">${pack.price_usd}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-cyan-400 font-semibold">
                          {formatNumber(pack.tokens)} base
                        </p>
                        {pack.bonus_tokens > 0 && (
                          <>
                            <p className="text-green-400 font-semibold">
                              +{formatNumber(pack.bonus_tokens)} bonus
                            </p>
                            <p className="text-white font-bold">
                              = {formatNumber(pack.tokens + pack.bonus_tokens)} total
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-white/70 text-xs">
                          <Check className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchase(pack)}
                      disabled={purchasing === pack.id}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        purchasing === pack.id
                          ? 'bg-white/10 text-white/50 cursor-wait'
                          : pack.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 button-press'
                          : 'bg-gradient-to-r ' + gradient + ' text-white hover:shadow-lg button-press'
                      }`}
                    >
                      {purchasing === pack.id ? 'Processing...' : `Buy ${pack.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 text-center">How Token Pricing Works</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 font-bold text-xs">1</span>
                  </div>
                  <p className="text-white/70">
                    <strong className="text-white">Pay Per Use:</strong> Each AI request deducts tokens based on provider cost + $0.005 margin
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 font-bold text-xs">2</span>
                  </div>
                  <p className="text-white/70">
                    <strong className="text-white">All Models:</strong> Use GPT-5, Claude, Grok, Gemini, DeepSeek, Qwen with any pack
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-xs">3</span>
                  </div>
                  <p className="text-white/70">
                    <strong className="text-white">No Subscriptions:</strong> Buy once, use anytime. No auto-renewal or monthly fees
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-xs">4</span>
                  </div>
                  <p className="text-white/70">
                    <strong className="text-white">Free Daily Tokens:</strong> Get 500 tokens daily for free, automatically refreshed
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-white/60 text-xs">
                1 USD = 10,000 KQ Tokens | Typical chat: ~50-150 tokens | Image gen: ~500 tokens
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
