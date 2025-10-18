import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { Floating3DCard, AnimatedGradientOrb } from './FloatingElements';

interface PricingPageProps {
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePlanClick = (planName: string) => {
    if (planName === 'Starter') {
      onGetStarted();
      return;
    }

    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@kroniq.ai?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    setPurchasing(planName);

    // Direct Stripe payment links
    const stripeLinks: Record<string, string> = {
      'Creator': 'https://buy.stripe.com/test_dRm5kC9zc5ZZ88DekPcV200',
      'Pro': 'https://buy.stripe.com/test_4gMdR8eTw9cbfB590vcV201'
    };

    const paymentLink = stripeLinks[planName];
    if (paymentLink) {
      window.location.href = paymentLink;
    } else {
      console.error('Payment link not found for plan:', planName);
      onGetStarted();
      setPurchasing(null);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const plans = [
    {
      name: 'Starter',
      icon: Sparkles,
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      features: [
        'Chat AI (Basic Model) - 30 messages/day',
        'Code Studio (2 projects, 500 lines each)',
        'Design Studio (10 AI images/month)',
        'Video Studio (2 videos/month, watermark)',
        '200 MB cloud storage',
        'Community support'
      ],
      color: 'from-gray-500 to-gray-700',
      popular: false
    },
    {
      name: 'Creator',
      icon: Zap,
      price: { monthly: 9, annual: 90 },
      description: 'For students, creators, and freelancers',
      features: [
        'Unlimited Chat AI (GPT-4/Claude)',
        'Code Studio (10 projects, 2K lines/project)',
        'Design Studio (50 images/month, no watermark)',
        'Video Studio (10 AI avatar videos/month)',
        '2 GB storage',
        'AI workflow automations (beta)',
        'Priority response times'
      ],
      color: 'from-blue-500 to-cyan-500',
      popular: false
    },
    {
      name: 'Pro',
      icon: Star,
      price: { monthly: 29, annual: 290 },
      description: 'For professionals and startups',
      features: [
        'All Creator features + custom AI tuning',
        'Unlimited Code Studio projects',
        'Unlimited image generations',
        '25 HD AI avatar videos/month',
        '10 GB storage',
        'API access for integrations',
        'Early access to new AI models',
        'Dedicated chat support'
      ],
      color: 'from-[#00FFF0] to-[#8A2BE2]',
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: { monthly: null, annual: null },
      description: 'For teams, schools, and organizations',
      features: [
        'Everything in Pro',
        'Multi-user organization dashboard',
        'SSO and role-based access',
        '100+ GB storage',
        'Custom model deployment',
        'Dedicated account manager & SLA',
        'On-prem or private cloud setup'
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
    <div className="relative w-full pb-20">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
              const savings = price && billingCycle === 'annual' && plan.price.monthly ? (plan.price.monthly * 12 - plan.price.annual) : 0;

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
                          {price !== null ? (
                            <>
                              <span className="text-5xl font-bold text-white">${price}</span>
                              <span className="text-white/60">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                            </>
                          ) : (
                            <span className="text-5xl font-bold text-white">Custom</span>
                          )}
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
                      onClick={() => handlePlanClick(plan.name)}
                      disabled={purchasing === plan.name}
                      className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-wait ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white hover:shadow-lg hover:shadow-[#00FFF0]/30'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      {purchasing === plan.name ? 'Redirecting...' : plan.name === 'Starter' ? 'Start Free' : plan.name === 'Enterprise' ? 'Contact Sales' : `Get ${plan.name}`}
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
