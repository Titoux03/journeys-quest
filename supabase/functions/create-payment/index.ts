import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication.
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { affiliate_code } = body as { affiliate_code?: string };
    let affiliate: string | undefined = typeof affiliate_code === 'string' ? affiliate_code : undefined;
    // Validate affiliate code format if provided (non-blocking)
    if (affiliate) {
      if (affiliate.length < 3 || affiliate.length > 50) {
        console.log('[CREATE-PAYMENT] Invalid affiliate code format, ignoring:', affiliate);
        affiliate = undefined;
      } else {
        // Check if affiliate code is valid
        const { data: validCode, error: codeError } = await supabaseClient
          .from('valid_affiliate_codes')
          .select('code')
          .eq('code', affiliate)
          .eq('is_active', true)
          .single();
        
        if (codeError || !validCode) {
          console.log('[CREATE-PAYMENT] Invalid affiliate code, proceeding without it:', affiliate);
          affiliate = undefined;
        }
      }
    }
    
    // Retrieve authenticated user if available (guest checkout supported)
    const authHeader = req.headers.get("Authorization");
    let user: any = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user ?? null;
    }

    console.log('[CREATE-PAYMENT] Auth status:', user ? { userId: user.id, email: user.email, affiliateCode: affiliate } : { guest: true, affiliateCode: affiliate });
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // If authenticated, check if user already has premium
    if (user?.id) {
      const { data: existingPurchase } = await supabaseClient
        .from('premium_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single();

      if (existingPurchase) {
        console.log('[CREATE-PAYMENT] User already has premium');
        return new Response(JSON.stringify({ error: "User already has premium access" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Check if a Stripe customer record exists when we know the email
    let customerId: string | undefined;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('[CREATE-PAYMENT] Found existing customer:', customerId);
      } else {
        console.log('[CREATE-PAYMENT] No existing customer found');
      }
    }

    // Prepare metadata for the payment session
    const metadata: any = {};
    if (user?.id) metadata.user_id = user.id;
    
    // Add affiliate code to metadata if provided
    if (affiliate) {
      metadata.affiliate_code = affiliate;
      console.log('[CREATE-PAYMENT] Adding affiliate tracking:', affiliate);
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['apple_pay', 'card', 'revolut_pay', 'klarna'],
      line_items: [
        {
          price: "price_1SBHWc1kjfqE79gbCpyaNAds",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata,
    });

    console.log('[CREATE-PAYMENT] Payment session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[CREATE-PAYMENT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});