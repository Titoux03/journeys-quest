import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICES = {
  monthly: "price_1T44gT1kjfqE79gbCz5aPlLF",
  annual: "price_1T44hY1kjfqE79gbSbEWpzr0",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const body = await req.json().catch(() => ({}));
    const { plan = "monthly", affiliate_code } = body as { plan?: string; affiliate_code?: string };

    const priceId = plan === "annual" ? PRICES.annual : PRICES.monthly;

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    let user: any = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user ?? null;
    }

    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Authentication required for subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log('[CREATE-CHECKOUT] User:', user.id, 'Plan:', plan);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      // Check for active subscription
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      if (subs.data.length > 0) {
        return new Response(JSON.stringify({ error: "You already have an active subscription" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Check legacy one-time purchase (lifetime access)
    const { data: legacyPurchase } = await supabaseClient
      .from('premium_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (legacyPurchase) {
      return new Response(JSON.stringify({ error: "You already have lifetime premium access" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const metadata: Record<string, string> = { user_id: user.id };
    if (affiliate_code) metadata.affiliate_code = affiliate_code;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata,
    });

    console.log('[CREATE-CHECKOUT] Session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[CREATE-CHECKOUT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
