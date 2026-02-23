import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * RevenueCat Webhook handler
 * Receives events from RevenueCat when subscription status changes
 * Docs: https://www.revenuecat.com/docs/integrations/webhooks
 */
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
    // RevenueCat sends a Bearer token we can verify
    const authHeader = req.headers.get("Authorization");
    const expectedToken = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      logStep("Unauthorized webhook attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.json();
    const event = body.event;
    
    if (!event) {
      return new Response(JSON.stringify({ error: "No event in payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event received", { 
      type: event.type,
      app_user_id: event.app_user_id,
      product_id: event.product_id,
    });

    const appUserId = event.app_user_id;
    const productId = event.product_id;
    const transactionId = event.transaction_id || event.original_transaction_id || `rc_${Date.now()}`;
    
    // Map RevenueCat event types to our logic
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE': {
        // Active subscription - record or update premium access
        logStep("Processing purchase/renewal", { appUserId, productId });
        
        // Determine plan type from product_id
        const isAnnual = productId?.includes('yearly') || productId?.includes('annual');
        const amount = isAnnual ? 14999 : 1499;
        
        // Check for existing purchase with this transaction
        const { data: existing } = await supabaseClient
          .from('premium_purchases')
          .select('id')
          .eq('stripe_payment_intent_id', `rc_${transactionId}`)
          .single();

        if (!existing) {
          const { error: insertError } = await supabaseClient
            .from('premium_purchases')
            .insert({
              user_id: appUserId,
              stripe_payment_intent_id: `rc_${transactionId}`,
              amount,
              currency: 'eur',
              status: 'completed',
              purchased_at: new Date().toISOString(),
            });

          if (insertError) {
            logStep("Error recording purchase", insertError);
            // Don't throw - might be a UUID format issue with app_user_id
          } else {
            logStep("Purchase recorded successfully");
          }
        } else {
          logStep("Purchase already recorded");
        }
        break;
      }

      case 'CANCELLATION':
      case 'EXPIRATION': {
        // Subscription expired or cancelled
        logStep("Processing cancellation/expiration", { appUserId });
        
        // Update the latest purchase to expired
        const { error: updateError } = await supabaseClient
          .from('premium_purchases')
          .update({ status: 'expired' })
          .eq('user_id', appUserId)
          .like('stripe_payment_intent_id', 'rc_%')
          .eq('status', 'completed');

        if (updateError) {
          logStep("Error updating status", updateError);
        } else {
          logStep("Subscription marked as expired");
        }
        break;
      }

      case 'BILLING_ISSUE': {
        logStep("Billing issue detected", { appUserId });
        // Could send a notification to the user
        break;
      }

      case 'SUBSCRIBER_ALIAS': {
        logStep("Subscriber alias event", { appUserId });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
