import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UpgradeRequest {
  action: 'upgrade' | 'downgrade' | 'check_grace_periods';
  userId?: string;
  tokensPurchased?: number;
  stripeCustomerId?: string;
  reason?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, userId, tokensPurchased, stripeCustomerId, reason }: UpgradeRequest = await req.json();

    if (action === 'upgrade') {
      if (!userId || !tokensPurchased) {
        return new Response(
          JSON.stringify({ error: 'userId and tokensPurchased required for upgrade' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await upgradeUserToPaidTier(userId, tokensPurchased, stripeCustomerId);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'downgrade') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId required for downgrade' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await downgradeUserToFreeTier(userId, reason || 'manual', 24);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check_grace_periods') {
      const result = await checkExpiredGracePeriods();
      return new Response(
        JSON.stringify({ success: true, usersTransitioned: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error managing tier:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function upgradeUserToPaidTier(
  userId: string,
  tokensPurchased: number,
  stripeCustomerId?: string
) {
  console.log('🔄 Upgrading user to paid tier:', { userId, tokensPurchased });

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle();

  const email = profile?.email || '';

  const { data: existingPaid } = await supabase
    .from('paid_tier_users')
    .select('id, tokens_remaining')
    .eq('id', userId)
    .maybeSingle();

  if (existingPaid) {
    const newBalance = (existingPaid.tokens_remaining || 0) + tokensPurchased;

    await supabase
      .from('paid_tier_users')
      .update({
        tokens_remaining: newBalance,
        total_tokens_purchased: (existingPaid.tokens_remaining || 0) + tokensPurchased,
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    await supabase
      .from('profiles')
      .update({
        is_paid: true,
        paid_tokens_balance: newBalance,
        in_grace_period: false,
        grace_period_ends_at: null,
        last_purchase_date: new Date().toISOString()
      })
      .eq('id', userId);

    await queueNotification(
      userId,
      'upgraded_to_paid',
      'Tokens Added!',
      `${tokensPurchased.toLocaleString()} tokens added to your account. New balance: ${newBalance.toLocaleString()}`
    );

    return {
      success: true,
      message: 'Tokens added to account',
      newTier: 'paid',
      tokensBalance: newBalance
    };
  }

  await supabase.from('paid_tier_users').insert({
    id: userId,
    email,
    tier_level: 'premium',
    tokens_remaining: tokensPurchased,
    total_tokens_purchased: tokensPurchased,
    stripe_customer_id: stripeCustomerId,
    last_payment_date: new Date().toISOString(),
    upgraded_date: new Date().toISOString()
  });

  await supabase.from('profiles').update({
    is_paid: true,
    paid_tokens_balance: tokensPurchased,
    current_tier: 'premium',
    in_grace_period: false,
    grace_period_ends_at: null,
    last_purchase_date: new Date().toISOString()
  }).eq('id', userId);

  await supabase.from('free_tier_users').delete().eq('id', userId);

  await supabase.from('tier_transitions').insert({
    user_id: userId,
    from_tier: 'free',
    to_tier: 'paid',
    reason: 'payment_received',
    tokens_at_transition: tokensPurchased
  });

  await queueNotification(
    userId,
    'upgraded_to_paid',
    'Welcome to Premium!',
    `You now have full access to all premium AI models. Token balance: ${tokensPurchased.toLocaleString()}`
  );

  return {
    success: true,
    message: 'Upgraded to paid tier',
    newTier: 'paid',
    tokensBalance: tokensPurchased
  };
}

async function downgradeUserToFreeTier(
  userId: string,
  reason: string,
  gracePeriodHours: number
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, in_grace_period')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    throw new Error('User not found');
  }

  if (profile.in_grace_period) {
    await supabase.from('free_tier_users').upsert({
      id: userId,
      email: profile.email,
      daily_tokens_remaining: 25000,
      monthly_tokens_remaining: 750000
    });

    await supabase.from('profiles').update({
      is_paid: false,
      paid_tokens_balance: 0,
      current_tier: 'free',
      in_grace_period: false,
      grace_period_ends_at: null
    }).eq('id', userId);

    await supabase.from('paid_tier_users').delete().eq('id', userId);

    await supabase.from('tier_transitions').insert({
      user_id: userId,
      from_tier: 'paid',
      to_tier: 'free',
      reason,
      tokens_at_transition: 0
    });

    await queueNotification(
      userId,
      'downgraded_to_free',
      'Account Moved to Free Tier',
      'Your token balance has been depleted. Purchase tokens to regain premium access.'
    );

    return { success: true, message: 'Downgraded to free tier', newTier: 'free' };
  }

  const gracePeriodEnd = new Date();
  gracePeriodEnd.setHours(gracePeriodEnd.getHours() + gracePeriodHours);

  await supabase.from('profiles').update({
    in_grace_period: true,
    grace_period_ends_at: gracePeriodEnd.toISOString()
  }).eq('id', userId);

  await queueNotification(
    userId,
    'grace_period_started',
    'Token Balance Depleted',
    `You have ${gracePeriodHours} hours to purchase tokens before downgrade.`
  );

  return { success: true, message: 'Grace period started', newTier: 'paid' };
}

async function checkExpiredGracePeriods() {
  const { data: expiredUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('in_grace_period', true)
    .lt('grace_period_ends_at', new Date().toISOString());

  if (!expiredUsers) return 0;

  let count = 0;
  for (const user of expiredUsers) {
    await downgradeUserToFreeTier(user.id, 'grace_period_expired', 0);
    count++;
  }

  return count;
}

async function queueNotification(
  userId: string,
  type: string,
  subject: string,
  message: string
) {
  await supabase.from('notification_queue').insert({
    user_id: userId,
    notification_type: type,
    subject,
    message,
    status: 'pending'
  });
}
