import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { Floating3DCard, AnimatedGradientOrb } from './FloatingElements';

interface PricingPageProps {
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    setMounted(true);
  }, []);

  const plans = [
    {
      name: 'Free',
      icon: Sparkles,
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      features: [
        '10,000 tokens/month',
        'Access to Chat AI',
        'Basic code generation',
        'Community support',
        '5 projects',
        'Standard response speed'
      ],
      color: 'from-gray-500 to-gray-700',
      popular: false
    },
    {
      name: 'Pro',
      icon: Zap,
      price: { monthly: 29, annual: 290 },
      description: 'For serious creators',
      features: [
        '1,000,000 tokens/month',
        'All 4 AI Studios',
        'Advanced code generation',
        'Priority support',
        'Unlimited projects',
        'Fast response speed',
        'API access',
        'Team collaboration'
      ],
      color: 'from-[#00FFF0] to-[#8A2BE2]',
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: { monthly: 99, annual: 990 },
      description: 'For teams and organizations',
      features: [
        'Unlimited tokens',
        'All Pro features',
        'Dedicated AI models',
        '24/7 premium support',
        'Custom integrations',
        'Advanced analytics',
        'SLA guarantee',
        'White-label options',
        'On-premise deployment'
      ],
      color: 'from-purple-500 to-pink-600',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What are tokens?',
      answer: 'Tokens are units of AI computation. Roughly, 1,000 tokens equal about 750 words. The Free plan gives you enough for daily experimentation.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, we\'ll refund you in full.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade encryption, and your data is never used to train AI models. You own your creations 100%.'
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden pb-20">
      <AnimatedGradientOrb className="top-40 left-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-40 right-10 w-[500px] h-[500px]" />

      {/* Hero Section */}
      <section className={`relative pt-40 pb-20 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-6 py-3 glass-panel rounded-full border border-white/20 mb-8">
            <span className="text-[#00FFF0] text-sm font-bold tracking-wider">PRICING</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
              Creative Power
            </span>
          </h1>

          <p className="text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto mb-12">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 glass-panel rounded-full p-2 border border-white/20">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 relative ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
              const savings = billingCycle === 'annual' ? (plan.price.monthly * 12 - plan.price.annual) : 0;

              return (
                <Floating3DCard key={idx} delay={idx * 100}>
                  <div
                    className={`relative glass-panel rounded-3xl p-8 border transition-all duration-500 h-full flex flex-col ${
                      plan.popular
                        ? 'border-[#00FFF0]/60 scale-105 shadow-2xl shadow-[#00FFF0]/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current" />
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} opacity-20 flex items-center justify-center mb-6`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Plan Name */}
                      <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-white/60 mb-6">{plan.description}</p>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-white">${price}</span>
                          <span className="text-white/60">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>
                        {billingCycle === 'annual' && savings > 0 && (
                          <p className="text-green-400 text-sm mt-2">Save ${savings}/year</p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#00FFF0] flex-shrink-0 mt-0.5" />
                            <span className="text-white/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={onGetStarted}
                      className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white hover:shadow-lg hover:shadow-[#00FFF0]/30'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      {plan.name === 'Free' ? 'Start Free' : `Get ${plan.name}`}
                    </button>
                  </div>
                </Floating3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-white/70">Everything you need to know</p>
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
                Still have questions?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Our team is here to help you choose the perfect plan
              </p>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-[#00FFF0]/30 transition-all duration-300 hover:scale-105"
              >
                Contact Sales
              </button>
            </div>
          </Floating3DCard>
        </div>
      </section>
    </div>
  );
};
