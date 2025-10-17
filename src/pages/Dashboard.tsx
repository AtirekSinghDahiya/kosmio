import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { stripeProducts } from '../stripe-config';

interface Subscription {
  subscription_status: string;
  price_id: string | null;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load subscription data');
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) return;

    setCheckoutLoading(priceId);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/dashboard`,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout process');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription || !subscription.price_id) return null;
    return stripeProducts.find(product => product.priceId === subscription.price_id);
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.email}</p>
              </div>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>

            {error && (
              <Alert type="error" className="mb-6" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading subscription data...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Current Plan Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-blue-900 mb-2">Current Plan</h2>
                  {currentPlan ? (
                    <div>
                      <p className="text-blue-800 font-medium">{currentPlan.name}</p>
                      <p className="text-blue-700 text-sm">
                        {currentPlan.currencySymbol}{currentPlan.price}/{currentPlan.mode === 'subscription' ? 'month' : 'one-time'}
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        Status: {subscription?.subscription_status || 'Active'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-800">No active subscription</p>
                  )}
                </div>

                {/* Available Plans */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {stripeProducts.map((product) => (
                      <div key={product.priceId} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {product.currencySymbol}{product.price}
                              <span className="text-sm font-normal text-gray-600">
                                /{product.mode === 'subscription' ? 'month' : 'one-time'}
                              </span>
                            </p>
                          </div>
                          {currentPlan?.priceId === product.priceId && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-6">{product.description}</p>
                        
                        <Button
                          onClick={() => handleCheckout(product.priceId, product.mode)}
                          loading={checkoutLoading === product.priceId}
                          disabled={currentPlan?.priceId === product.priceId}
                          className="w-full"
                        >
                          {currentPlan?.priceId === product.priceId 
                            ? 'Current Plan' 
                            : `Subscribe to ${product.name}`
                          }
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}