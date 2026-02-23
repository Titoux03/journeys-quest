import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-APPLE-PURCHASE] ${step}${detailsStr}`);
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      logStep("Authentication failed", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId: user.id });

    const body = await req.json();
    const { rc_customer_id, product_id, transaction_id } = body;

    if (!rc_customer_id) {
      throw new Error("RevenueCat customer ID is required");
    }

    logStep("Verifying RevenueCat purchase", { rc_customer_id, product_id });

    // Verify with RevenueCat REST API
    const rcApiKey = Deno.env.get("REVENUECAT_API_KEY");
    if (!rcApiKey) {
      throw new Error("REVENUECAT_API_KEY not configured");
    }

    const rcResponse = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${rc_customer_id}`,
      {
        headers: {
          'Authorization': `Bearer ${rcApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!rcResponse.ok) {
      logStep("RevenueCat API error", { status: rcResponse.status });
      throw new Error(`RevenueCat API returned ${rcResponse.status}`);
    }

    const rcData = await rcResponse.json();
    const subscriber = rcData.subscriber;
    
    // Check for active "Titoux corp Pro" entitlement
    const entitlements = subscriber?.entitlements || {};
    const proEntitlement = entitlements['Titoux corp Pro'] || entitlements['pro'] || entitlements['premium'];
    
    const isActive = proEntitlement && 
      new Date(proEntitlement.expires_date) > new Date();

    logStep("Entitlement check", { 
      isActive, 
      expiresDate: proEntitlement?.expires_date 
    });

    if (!isActive) {
      return new Response(JSON.stringify({ 
        verified: false, 
        error: "No active subscription found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Determine plan from product ID
    const isAnnual = product_id?.includes('yearly') || product_id?.includes('annual');
    const txId = transaction_id || `rc_${rc_customer_id}_${Date.now()}`;

    // Check if already recorded
    const { data: existing } = await supabaseClient
      .from('premium_purchases')
      .select('id')
      .eq('user_id', user.id)
      .like('stripe_payment_intent_id', 'rc_%')
      .eq('status', 'completed')
      .single();

    if (!existing) {
      const { error: insertError } = await supabaseClient
        .from('premium_purchases')
        .insert({
          user_id: user.id,
          stripe_payment_intent_id: `rc_${txId}`,
          amount: isAnnual ? 14999 : 1499,
          currency: 'eur',
          status: 'completed',
          purchased_at: new Date().toISOString(),
        });

      if (insertError) {
        logStep("Error recording purchase", insertError);
        throw insertError;
      }
      logStep("RevenueCat purchase recorded successfully");
    } else {
      logStep("Purchase already recorded");
    }

    return new Response(JSON.stringify({ 
      verified: true, 
      message: "RevenueCat purchase verified and premium granted!",
      plan: isAnnual ? 'annual' : 'monthly',
      expires_date: proEntitlement.expires_date,
    }), {
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
