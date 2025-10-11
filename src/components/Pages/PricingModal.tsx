import React from 'react';
import { X, Check, Zap, Crown, Building2 } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const plans = [
    {
      name: 'Free',
      icon: Zap,
      price: '$0',
      period: 'forever',
      gradient: 'from-gray-500 to-gray-600',
      features: [
        '10,000 tokens per month',
        'Basic AI models',
        'Limited chat history',
        'Community support',
        'Standard response time',
      ],
      button: 'Current Plan',
      disabled: true,
    },
    {
      name: 'Pro',
      icon: Crown,
      price: '$19',
      period: 'per month',
      gradient: 'from-cyan-500 to-blue-600',
      popular: true,
      features: [
        '100,000 tokens per month',
        'All AI models (GPT-4, Claude, Gemini)',
        'Unlimited chat history',
        'Priority support',
        'Faster response time',
        'Code Studio access',
        'Design Studio access',
        'Custom AI personality',
      ],
      button: 'Upgrade to Pro',
      disabled: false,
    },
    {
      name: 'Enterprise',
      icon: Building2,
      price: 'Custom',
      period: 'contact us',
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'Unlimited tokens',
        'All Pro features',
        'Dedicated support',
        'Custom AI training',
        'Team collaboration',
        'API access',
        'Advanced analytics',
        'SLA guarantee',
        'White-label options',
      ],
      button: 'Contact Sales',
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 bg-black/60 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Pricing Plans</h2>
            <p className="text-white/60 text-sm mt-1">Choose the perfect plan for your needs</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all button-press"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={index}
                  className={`glass-panel rounded-2xl p-6 relative animate-fade-in-up ${
                    plan.popular ? 'ring-2 ring-cyan-500/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 rounded-full text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60 text-sm ml-2">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/70 text-sm">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={plan.disabled}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.disabled
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-gradient-to-r ' + plan.gradient + ' text-white hover:shadow-lg hover:shadow-cyan-500/20 button-press'
                    }`}
                  >
                    {plan.button}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 glass-panel rounded-2xl p-6 text-center">
            <p className="text-white/70 text-sm">
              All plans include secure data storage, regular updates, and access to new features.
              <br />
              <span className="text-cyan-400">Need a custom solution?</span> Contact our sales team for enterprise pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
