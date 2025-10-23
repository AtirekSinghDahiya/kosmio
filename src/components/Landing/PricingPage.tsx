import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Crown, Sparkles, Coins } from 'lucide-react';
import { Floating3DCard, AnimatedGradientOrb } from './FloatingElements';

interface PricingPageProps {
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tokenPacks = [
    {
      name: 'Free Pack',
      icon: Sparkles,
      tokens: 1000,
      bonusTokens: 0,
      price: 0,
      description: 'Try KroniQ for free',
      features: [
        '1,000 tokens daily',
        'Auto-resets at midnight UTC',
        'NO rollover (resets to 1,000)',
        'Access to all AI models',
        'No credit card required'
      ],
      color: 'from-green-500 to-emerald-600',
      popular: false,
      isFree: true
    },
    {
      name: 'Micro',
      icon: Sparkles,
      tokens: 10000,
      bonusTokens: 0,
      price: 2.00,
      description: 'Quick boost for light usage',
      features: [
        '10,000 KQ Tokens',
        'Tokens NEVER expire',
        'Rollover unused tokens',
        'Access to all AI models',
        'Valid for 12 months'
      ],
      color: 'from-gray-400 to-gray-600',
      popular: false,
      isFree: false
    },
    {
      name: 'Mini',
      icon: Zap,
      tokens: 25000,
      bonusTokens: 0,
      price: 4.00,
      description: 'Great for casual users',
      features: [
        '25,000 KQ Tokens',
        'Tokens NEVER expire',
        'Rollover unused tokens',
        'Access to all AI models',
        'Valid for 12 months'
      ],
      color: 'from-blue-400 to-blue-600',
      popular: false,
      isFree: false
    },
    {
      name: 'Standard',
      icon: Star,
      tokens: 50000,
      bonusTokens: 5000,
      price: 8.00,
      description: 'Most popular for regular users',
      features: [
        '50,000 base tokens',
        '+5,000 bonus tokens',
        '55,000 total tokens',
        'Tokens NEVER expire',
        'Rollover unused tokens',
        'Best value per token'
      ],
      color: 'from-cyan-500 to-blue-500',
      popular: true,
      isFree: false
    },
    {
      name: 'Power',
      icon: Zap,
      tokens: 100000,
      bonusTokens: 15000,
      price: 16.00,
      description: 'For power users',
      features: [
        '100,000 base tokens',
        '+15,000 bonus tokens',
        '115,000 total tokens',
        'Tokens NEVER expire',
        'Rollover unused tokens',
        'Priority support'
      ],
      color: 'from-purple-500 to-pink-500',
      popular: false,
      isFree: false
    },
    {
      name: 'Pro',
      icon: Crown,
      tokens: 250000,
      bonusTokens: 50000,
      price: 40.00,
      description: 'For professionals',
      features: [
        '250,000 base tokens',
        '+50,000 bonus tokens',
        '300,000 total tokens',
        'Tokens NEVER expire',
        'Rollover unused tokens',
        'Priority support',
        'Early access to new features'
      ],
      color: 'from-[#00FFF0] to-[#8A2BE2]',
      popular: false,
      isFree: false
    },
    {
      name: 'Enterprise',
      icon: Crown,
      tokens: 500000,
      bonusTokens: 100000,
      price: null,
      description: 'For teams, schools, and organizations',
      features: [
        'Everything in Pro',
        'Custom token packages',
        'Tokens NEVER expire',
        'Multi-user dashboard',
        'SSO and role-based access',
        'Dedicated account manager',
        'Custom model deployment'
      ],
      color: 'from-orange-500 to-red-600',
      popular: false,
      isFree: false
    }
  ];

  const handlePackClick = (packName: string, isFree?: boolean) => {
    if (isFree || packName === 'Free Pack') {
      onGetStarted();
      return;
    }

    if (packName === 'Enterprise') {
      window.location.href = 'mailto:sales@kroniq.ai?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    // For all other paid packs, navigate to purchase
    onGetStarted();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const faqs = [
    {
      question: 'What is the Free Pack?',
      answer: 'Get 1,000 tokens every day for free! Your balance resets to 1,000 at midnight UTC (no rollover). Perfect for testing KroniQ. No credit card required.'
    },
    {
      question: 'Do unused free tokens roll over?',
      answer: 'No, free pack tokens reset to 1,000 daily with NO rollover. But all paid pack tokens NEVER expire and unused tokens always roll over!'
    },
    {
      question: 'What are KQ Tokens?',
      answer: 'KQ Tokens are our internal currency for AI usage. 1 USD = 10,000 tokens. Each AI request deducts tokens based on the actual provider cost plus a small $0.005 margin.'
    },
    {
      question: 'Do purchased tokens expire?',
      answer: 'Purchased tokens NEVER expire and unused tokens always roll over. They are valid for 12 months from purchase date. Free daily tokens reset to 1,000 every midnight UTC with no rollover.'
    },
    {
      question: 'How much do different AI models cost?',
      answer: 'Costs vary by model. A typical chat message ranges from 50-150 tokens. Image generation costs around 500 tokens. You can see estimated costs before each request.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for all token purchases. If you\'re not satisfied, we\'ll refund unused tokens in full.'
    }
  ];

  return (
    <div className="relative w-full pb-20">
      <AnimatedGradientOrb className="top-40 left-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-40 right-10 w-[500px] h-[500px]" />

      {/* Hero Section */}
      <section className={`relative pt-40 pb-20 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-6 py-3 glass-panel rounded-full border border-white/20 mb-8 flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#00FFF0]" />
            <span className="text-[#00FFF0] text-sm font-bold tracking-wider">TOKEN-BASED PRICING</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Simple,{' '}
            <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
              Pay-as-you-go
            </span>{' '}
            Pricing
          </h1>

          <p className="text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto mb-6">
            Buy tokens once, use them anytime. No subscriptions, no monthly fees.
          </p>

          <p className="text-lg text-white/50">
            1 USD = 10,000 KQ Tokens | Free users get 500 tokens daily
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tokenPacks.map((pack, idx) => {
              const Icon = pack.icon;

              return (
                <Floating3DCard key={idx} delay={idx * 100}>
                  <div
                    className={`relative glass-panel rounded-3xl p-8 border transition-all duration-500 h-full flex flex-col ${
                      pack.popular
                        ? 'border-[#00FFF0]/60 scale-105 shadow-2xl shadow-[#00FFF0]/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current" />
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pack.color} opacity-20 flex items-center justify-center mb-6`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Pack Name */}
                      <h3 className="text-3xl font-bold text-white mb-2">{pack.name}</h3>
                      <p className="text-white/60 mb-6">{pack.description}</p>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-3">
                          {pack.price === 0 ? (
                            <span className="text-5xl font-bold text-green-400">FREE</span>
                          ) : pack.price !== null ? (
                            <span className="text-5xl font-bold text-white">${pack.price}</span>
                          ) : (
                            <span className="text-5xl font-bold text-white">Custom</span>
                          )}
                        </div>
                        {pack.isFree ? (
                          <div className="space-y-1">
                            <p className="text-green-400 font-semibold">
                              {formatNumber(pack.tokens)} tokens/day
                            </p>
                            <p className="text-white/60 text-sm">
                              Resets daily at midnight UTC
                            </p>
                          </div>
                        ) : pack.price !== null ? (
                          <div className="space-y-1">
                            <p className="text-[#00FFF0] font-semibold">
                              {formatNumber(pack.tokens)} base tokens
                            </p>
                            {pack.bonusTokens > 0 && (
                              <p className="text-green-400 font-semibold">
                                +{formatNumber(pack.bonusTokens)} bonus
                              </p>
                            )}
                            <p className="text-white/80 font-bold text-lg">
                              = {formatNumber(pack.tokens + pack.bonusTokens)} total
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-8">
                        {pack.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#00FFF0] flex-shrink-0 mt-0.5" />
                            <span className="text-white/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePackClick(pack.name, pack.isFree)}
                      className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                        pack.isFree
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                          : pack.popular
                          ? 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white hover:shadow-lg hover:shadow-[#00FFF0]/30'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      {pack.isFree ? 'Start Free' : pack.name === 'Enterprise' ? 'Contact Sales' : `Get ${pack.name}`}
                    </button>
                  </div>
                </Floating3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel rounded-3xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">
              How Token Pricing Works
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00FFF0]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00FFF0] font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Buy Tokens Once</h4>
                    <p className="text-white/60">
                      Purchase any token pack with no recurring charges. Tokens never expire for 12 months.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00FFF0]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00FFF0] font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Use Any AI Model</h4>
                    <p className="text-white/60">
                      Access GPT-5, Claude, Grok, Gemini, DeepSeek, Qwen and more. Tokens work with all models.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00FFF0]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00FFF0] font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Pay Per Use</h4>
                    <p className="text-white/60">
                      Each request costs tokens based on actual AI provider cost + small $0.005 margin.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-lg">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Daily Free Tokens</h4>
                    <p className="text-white/60">
                      Free users get 500 tokens every day automatically. No credit card required.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-lg">5</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Transparent Costs</h4>
                    <p className="text-white/60">
                      See exact token cost before each request. Full transaction history available.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-lg">6</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">No Subscriptions</h4>
                    <p className="text-white/60">
                      No monthly fees. No auto-renewal. Buy more tokens only when you need them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center pt-8 border-t border-white/10">
              <p className="text-white/60 mb-2">
                <span className="font-semibold">Example costs:</span> A typical chat message costs ~50-150 tokens. An image generation ~500 tokens.
              </p>
              <p className="text-white/40 text-sm">
                All prices in USD. Secure payments via Stripe. Instant token delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-white/70">Everything you need to know about token pricing</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <Floating3DCard key={idx} delay={idx * 100}>
                <div className="glass-panel rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500">
                  <h3 className="text-xl font-bold text-white mb-4">{faq.question}</h3>
                  <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                </div>
              </Floating3DCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Floating3DCard>
            <div className="glass-panel rounded-3xl p-16 border-2 border-white/20 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Start with 500 free tokens daily. No credit card required.
              </p>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-[#00FFF0]/30 transition-all duration-300 hover:scale-105"
              >
                Start Free Now
              </button>
            </div>
          </Floating3DCard>
        </div>
      </section>
    </div>
  );
};
