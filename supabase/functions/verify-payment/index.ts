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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    console.log('[VERIFY-PAYMENT] Verifying session:', session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session.metadata?.user_id) {
      throw new Error("No user ID in session metadata");
    }

    const userId = session.metadata.user_id;
    console.log('[VERIFY-PAYMENT] Session found for user:', userId);

    if (session.payment_status === 'paid') {
      // Check if we already recorded this purchase
      const { data: existingPurchase } = await supabaseClient
        .from('premium_purchases')
        .select('*')
        .eq('stripe_payment_intent_id', session.payment_intent as string)
        .single();

      if (!existingPurchase) {
        // Record the successful purchase
        const { error: insertError } = await supabaseClient
          .from('premium_purchases')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 1499,
            currency: session.currency || 'eur',
            status: 'completed',
            purchased_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('[VERIFY-PAYMENT] Error recording purchase:', insertError);
          throw insertError;
        }

        console.log('[VERIFY-PAYMENT] Purchase recorded successfully');
      } else {
        console.log('[VERIFY-PAYMENT] Purchase already recorded');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        premium: true,
        message: "Payment verified and premium access granted!" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('[VERIFY-PAYMENT] Payment not completed:', session.payment_status);
      return new Response(JSON.stringify({ 
        success: false, 
        premium: false,
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

  } catch (error) {
    console.error('[VERIFY-PAYMENT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});