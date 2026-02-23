import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log('[CHECK-SUBSCRIPTION] Function started');

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ subscribed: false, legacy: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      return new Response(JSON.stringify({ subscribed: false, legacy: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const user = userData.user;
    console.log('[CHECK-SUBSCRIPTION] User:', user.id);

    // 1. Check legacy one-time purchase (lifetime access)
    const { data: legacyPurchase } = await supabaseClient
      .from('premium_purchases')
      .select('id, purchased_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (legacyPurchase) {
      console.log('[CHECK-SUBSCRIPTION] Legacy lifetime access found');
      return new Response(JSON.stringify({
        subscribed: true,
        legacy: true,
        plan: 'lifetime',
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. Check Stripe subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error('[CHECK-SUBSCRIPTION] No STRIPE_SECRET_KEY');
      return new Response(JSON.stringify({ subscribed: false, legacy: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      console.log('[CHECK-SUBSCRIPTION] No Stripe customer found');
      return new Response(JSON.stringify({ subscribed: false, legacy: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Also check past_due
      const pastDue = await stripe.subscriptions.list({
        customer: customerId,
        status: "past_due",
        limit: 1,
      });
      
      if (pastDue.data.length > 0) {
        const sub = pastDue.data[0];
        return new Response(JSON.stringify({
          subscribed: true,
          legacy: false,
          plan: sub.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly',
          subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
          status: 'past_due',
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ subscribed: false, legacy: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const plan = subscription.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly';
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    console.log('[CHECK-SUBSCRIPTION] Active subscription found:', { plan, subscriptionEnd });

    return new Response(JSON.stringify({
      subscribed: true,
      legacy: false,
      plan,
      subscription_end: subscriptionEnd,
      status: 'active',
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[CHECK-SUBSCRIPTION] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ subscribed: false, legacy: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
