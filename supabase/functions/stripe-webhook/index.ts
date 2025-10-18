import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCheckoutSessionCompleted(session: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.client_reference_id;

  if (!userId) {
    console.error('No user ID in checkout session');
    return;
  }

  // Create or update stripe customer record
  await supabase
    .from('stripe_customers')
    .upsert({
      user_id: userId,
      customer_id: customerId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  // Get subscription details to determine plan
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const priceId = subscription.items.data[0]?.price.id;

    // Determine plan based on price ID
    let planName = 'creator';
    if (priceId && priceId.includes('pro')) {
      planName = 'pro';
    }

    // Get plan details from database
    const { data: planData } = await supabase
      .from('pricing_plans')
      .select('id, name')
      .eq('name', planName)
      .single();

    if (planData) {
      // Update user subscription
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planData.id,
          plan_name: planName,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          auto_renew: !subscription.cancel_at_period_end,
        }, {
          onConflict: 'user_id'
        });

      // Update profile plan
      await supabase
        .from('profiles')
        .update({
          plan: planName,
          stripe_customer_id: customerId,
          plan_started_at: new Date().toISOString(),
          plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId);

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          plan_id: planData.id,
          plan_name: planName,
          amount: session.amount_total / 100,
          status: 'completed',
          transaction_type: 'purchase',
          metadata: {
            checkout_session_id: session.id,
            subscription_id: subscriptionId,
            customer_id: customerId,
          },
        });
    }

    // Update stripe_subscriptions table
    await supabase
      .from('stripe_subscriptions')
      .upsert({
        customer_id: customerId,
        subscription_id: subscriptionId,
        price_id: priceId,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'customer_id'
      });
  }

  // Create order record
  await supabase
    .from('stripe_orders')
    .insert({
      checkout_session_id: session.id,
      payment_intent_id: session.payment_intent || '',
      customer_id: customerId,
      amount_subtotal: session.amount_subtotal,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      status: 'completed',
    });

  console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const customerId = subscription.customer;
  const priceId = subscription.items.data[0]?.price.id;

  // Get user from stripe customer
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();

  if (!customerData) {
    console.error('Customer not found:', customerId);
    return;
  }

  // Update stripe_subscriptions
  await supabase
    .from('stripe_subscriptions')
    .upsert({
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: priceId,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'customer_id'
    });

  // Update user subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status === 'active' ? 'active' : 'cancelled',
      expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      auto_renew: !subscription.cancel_at_period_end,
    })
    .eq('user_id', customerData.user_id);

  console.log(`Subscription updated for customer ${customerId}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const customerId = subscription.customer;

  // Get user from stripe customer
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();

  if (!customerData) {
    console.error('Customer not found:', customerId);
    return;
  }

  // Update user subscription to cancelled
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
    })
    .eq('user_id', customerData.user_id);

  // Reset profile plan to free
  await supabase
    .from('profiles')
    .update({
      plan: 'free',
      plan_expires_at: new Date().toISOString(),
    })
    .eq('id', customerData.user_id);

  // Soft delete subscription
  await supabase
    .from('stripe_subscriptions')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('customer_id', customerId);

  console.log(`Subscription cancelled for customer ${customerId}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const customerId = invoice.customer;

  // Get user from stripe customer
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();

  if (!customerData) {
    console.error('Customer not found:', customerId);
    return;
  }

  console.log(`Invoice payment succeeded for customer ${customerId}`);
}

async function handleInvoicePaymentFailed(invoice: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const customerId = invoice.customer;

  // Get user from stripe customer
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();

  if (!customerData) {
    console.error('Customer not found:', customerId);
    return;
  }

  console.log(`Invoice payment failed for customer ${customerId}`);
}