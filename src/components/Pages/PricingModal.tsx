import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Zap, Star, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CustomSolutionsModal } from './CustomSolutionsModal';
import { useAuth } from '../../contexts/AuthContext';

interface PricingModalProps {
  onClose: () => void;
}

interface Plan {
  id: string;
  name: string;
  icon: any;
  price: string;
  period: string;
  gradient: string;
  popular?: boolean;
  features: string[];
  button: string;
  disabled: boolean;
  description: string;
  stripe_payment_link?: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCustomSolutions, setShowCustomSolutions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPricingFromDatabase();
  }, []);

  const loadPricingFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading pricing:', error);
        useFallbackPlans();
        return;
      }

      if (data && data.length > 0) {
        const formattedPlans = data.map((plan: any) => {
          const priceNum = parseFloat(plan.price);
          const displayName = plan.display_name || plan.name;

          return {
            id: plan.id,
            name: displayName,
            icon: getIconForPlan(displayName),
            price: priceNum === 0 ? '$0' : priceNum < 0 ? 'Custom' : `$${Math.round(priceNum)}`,
            period: priceNum === 0 ? 'forever' : priceNum < 0 ? 'contact us' : 'per month',
            gradient: getGradientForPlan(displayName),
            popular: displayName === 'Pro',
            features: Array.isArray(plan.features) ? plan.features : [],
            button: displayName === 'Starter' ? 'Current Plan' : displayName === 'Enterprise' ? 'Contact Sales' : `Get ${displayName}`,
            disabled: displayName === 'Starter',
            description: plan.description || '',
            stripe_payment_link: plan.stripe_payment_link
          };
        });
        setPlans(formattedPlans);
      } else {
        useFallbackPlans();
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
      useFallbackPlans();
    } finally {
      setLoading(false);
    }
  };

  const getIconForPlan = (name: string) => {
    switch (name) {
      case 'Starter': return Sparkles;
      case 'Creator': return Zap;
      case 'Pro': return Star;
      case 'Enterprise': return Crown;
      default: return Zap;
    }
  };

  const getGradientForPlan = (name: string) => {
    switch (name) {
      case 'Starter': return 'from-gray-500 to-gray-600';
      case 'Creator': return 'from-blue-500 to-cyan-500';
      case 'Pro': return 'from-cyan-500 to-purple-600';
      case 'Enterprise': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handlePurchase = (plan: Plan) => {
    if (!currentUser) {
      alert('Please sign in to purchase a plan');
      onClose();
      return;
    }

    if (plan.name === 'Starter') {
      return;
    }

    if (plan.name === 'Enterprise') {
      window.location.href = 'mailto:sales@kroniq.ai?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    if (!plan.stripe_payment_link) {
      alert('Payment link not configured for this plan');
      return;
    }

    setPurchasing(plan.id);
    window.location.href = plan.stripe_payment_link;
  };

  const useFallbackPlans = () => {
    setPlans([
      {
        id: 'starter',
        name: 'Starter',
        icon: Sparkles,
        price: '$0',
        period: 'forever',
        gradient: 'from-gray-500 to-gray-600',
        features: [
          'Chat AI (Basic Model) — 30 messages/day',
          'Code Studio (2 projects, 500 lines each)',
          'Design Studio (10 AI images/month)',
          'Video Studio (2 videos/month, watermark)',
          '200 MB cloud storage',
          'Community support',
        ],
        button: 'Current Plan',
        disabled: true,
        description: 'New users exploring Kroniq',
      },
      {
        id: 'creator',
        name: 'Creator',
        icon: Zap,
        price: '$9.99',
        period: 'per month',
        gradient: 'from-blue-500 to-cyan-500',
        features: [
          'Unlimited Chat AI (GPT-4/Claude)',
          'Code Studio (10 projects, 2K lines/project)',
          'Design Studio (50 images/month, no watermark)',
          'Video Studio (10 AI avatar videos/month)',
          '2 GB storage',
          'AI workflow automations (beta)',
          'Priority response times',
        ],
        button: 'Get Creator',
        disabled: false,
        description: 'Students, creators, and freelancers',
        stripe_payment_link: 'https://buy.stripe.com/test_dRm5kC9zc5ZZ88DekPcV200',
      },
      {
        id: 'pro',
        name: 'Pro',
        icon: Star,
        price: '$29',
        period: 'per month',
        gradient: 'from-cyan-500 to-purple-600',
        popular: true,
        features: [
          'All Creator features + custom AI tuning',
          'Unlimited Code Studio projects',
          'Unlimited image generations',
          '25 HD AI avatar videos/month',
          '10 GB storage',
          'API access for integrations',
          'Early access to new AI models',
          'Dedicated chat support',
        ],
        button: 'Get Pro',
        disabled: false,
        description: 'Professionals and startups',
        stripe_payment_link: 'https://buy.stripe.com/test_4gMdR8eTw9cbfB590vcV201',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        icon: Crown,
        price: 'Custom',
        period: 'contact us',
        gradient: 'from-purple-500 to-pink-600',
        features: [
          'Everything in Pro',
          'Multi-user organization dashboard',
          'SSO and role-based access',
          '100+ GB storage',
          'Custom model deployment',
          'Dedicated account manager & SLA',
          'On-prem or private cloud setup',
        ],
        button: 'Contact Sales',
        disabled: false,
        description: 'Teams, schools, and organizations',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel backdrop-blur-3xl border border-white/20 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 glass-panel backdrop-blur-3xl border-b border-white/10 p-6 flex items-center justify-between z-10">
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    onClick={() => handlePurchase(plan)}
                    disabled={plan.disabled || purchasing === plan.id}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.disabled
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : purchasing === plan.id
                        ? 'bg-white/10 text-white/50 cursor-wait'
                        : 'bg-gradient-to-r ' + plan.gradient + ' text-white hover:shadow-lg hover:shadow-cyan-500/20 button-press'
                    }`}
                  >
                    {purchasing === plan.id ? 'Redirecting...' : plan.button}
                  </button>
                </div>
              );
            })}
          </div>
          )}

          <div className="mt-8 glass-panel rounded-2xl p-6 text-center">
            <p className="text-white/70 text-sm">
              All plans include secure data storage, regular updates, and access to new features.
              <br />
              <button
                onClick={() => setShowCustomSolutions(true)}
                className="text-cyan-400 hover:text-cyan-300 underline hover:no-underline transition-all"
              >
                Need a custom solution?
              </button> Contact our sales team for enterprise pricing.
            </p>
          </div>
        </div>
      </div>
      {showCustomSolutions && <CustomSolutionsModal onClose={() => setShowCustomSolutions(false)} />}
    </div>
  );
};
