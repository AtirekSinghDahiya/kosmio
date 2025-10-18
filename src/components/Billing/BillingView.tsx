import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Check, Zap, Crown, Building2 } from 'lucide-react';

export const BillingView: React.FC = () => {
  const { userData } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: 0,
      icon: Zap,
      features: [
        '10,000 tokens/month',
        'Basic code generation',
        'Basic design tools',
        'Community support',
        '5 projects'
      ],
      color: 'from-gray-500 to-gray-600',
      current: userData?.plan === 'free'
    },
    {
      name: 'Pro',
      price: 29,
      icon: Crown,
      features: [
        '500,000 tokens/month',
        'Advanced code generation',
        'Advanced design tools',
        'Priority support',
        'Unlimited projects',
        'Export functionality',
        'Collaboration tools'
      ],
      color: 'from-cyan-500 to-blue-600',
      popular: true,
      current: userData?.plan === 'pro'
    },
    {
      name: 'Enterprise',
      price: 299,
      icon: Building2,
      features: [
        'Unlimited tokens',
        'Custom AI models',
        'White-label option',
        'Dedicated support',
        'Unlimited everything',
        'Advanced analytics',
        'Team management',
        'SLA guarantee'
      ],
      color: 'from-purple-500 to-pink-500',
      current: userData?.plan === 'enterprise'
    }
  ];

  return (
    <div className="flex-1 overflow-auto gradient-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Scale your AI development with KroniQ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''
                } ${plan.current ? 'ring-4 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                {plan.current && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-sm font-bold">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={plan.current}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                      plan.current
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-xl`
                    }`}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Tokens Used</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userData?.tokensUsed?.toLocaleString() || 0}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((userData?.tokensUsed || 0) / (userData?.tokensLimit || 1)) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                of {userData?.tokensLimit?.toLocaleString() || 0} limit
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Current Plan</div>
              <div className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                {userData?.plan || 'Free'}
              </div>
              <div className="text-sm text-gray-600">
                {userData?.plan === 'free' && 'Upgrade for more features'}
                {userData?.plan === 'pro' && 'Professional tier active'}
                {userData?.plan === 'enterprise' && 'Enterprise tier active'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Next Billing</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getDate()}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
