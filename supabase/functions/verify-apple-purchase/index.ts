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
    // Authenticate user
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

    const { receipt_data } = await req.json();
    if (!receipt_data) {
      throw new Error("Receipt data is required");
    }

    logStep("Verifying receipt with Apple");

    // Verify receipt with Apple's servers
    // First try production, then sandbox (Apple's recommended approach)
    let verifyResult = await verifyWithApple(receipt_data, false);
    
    // Status 21007 means it's a sandbox receipt
    if (verifyResult.status === 21007) {
      logStep("Sandbox receipt detected, retrying with sandbox");
      verifyResult = await verifyWithApple(receipt_data, true);
    }

    logStep("Apple verification result", { status: verifyResult.status });

    if (verifyResult.status !== 0) {
      logStep("Invalid receipt", { status: verifyResult.status });
      return new Response(JSON.stringify({ 
        verified: false, 
        error: `Invalid receipt (status: ${verifyResult.status})` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Find the premium purchase in the receipt
    const inAppPurchases = verifyResult.receipt?.in_app || [];
    const premiumPurchase = inAppPurchases.find(
      (p: any) => p.product_id === 'com.journeys.premium'
    );

    if (!premiumPurchase) {
      logStep("Premium product not found in receipt");
      return new Response(JSON.stringify({ 
        verified: false, 
        error: "Premium product not found in receipt" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Premium purchase found", { 
      transactionId: premiumPurchase.transaction_id,
      productId: premiumPurchase.product_id 
    });

    // Check if already recorded
    const { data: existing } = await supabaseClient
      .from('premium_purchases')
      .select('*')
      .eq('stripe_payment_intent_id', `apple_${premiumPurchase.transaction_id}`)
      .single();

    if (!existing) {
      // Record the purchase
      const { error: insertError } = await supabaseClient
        .from('premium_purchases')
        .insert({
          user_id: user.id,
          stripe_payment_intent_id: `apple_${premiumPurchase.transaction_id}`,
          amount: 2499, // 24.99€ in cents
          currency: 'eur',
          status: 'completed',
          purchased_at: new Date().toISOString(),
        });

      if (insertError) {
        logStep("Error recording purchase", insertError);
        throw insertError;
      }

      logStep("Apple purchase recorded successfully");
    } else {
      logStep("Purchase already recorded");
    }

    return new Response(JSON.stringify({ 
      verified: true, 
      message: "Apple purchase verified and premium granted!" 
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

async function verifyWithApple(receiptData: string, sandbox: boolean): Promise<any> {
  const url = sandbox 
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  // Note: Apple's App Store Server API v2 is preferred for new apps,
  // but verifyReceipt still works. For production, consider migrating
  // to the App Store Server API v2.
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': Deno.env.get('APPLE_SHARED_SECRET') || '',
      'exclude-old-transactions': true,
    }),
  });

  return await response.json();
}
