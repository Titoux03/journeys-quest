import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
      auth: { persistSession: false },
    }
  );

  try {
    console.log('[CHECK-PREMIUM] Function started');

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    if (!user?.id) throw new Error("User not authenticated");

    console.log('[CHECK-PREMIUM] User authenticated:', { userId: user.id, email: user.email });

    // Check if this is the test collaboration account
    const isTestCollabAccount = user.email === 'testcollab' || user.email === 'testcollab@example.com';
    
    if (isTestCollabAccount) {
      console.log('[CHECK-PREMIUM] Test collaboration account detected - granting premium access');
      return new Response(JSON.stringify({
        isPremium: true,
        purchaseDate: new Date().toISOString(),
        testAccount: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if user has a completed premium purchase
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('premium_purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      console.error('[CHECK-PREMIUM] Database error:', purchaseError);
      throw purchaseError;
    }

    const hasPremium = !!purchase;
    console.log('[CHECK-PREMIUM] Premium status:', { hasPremium, purchaseId: purchase?.id });

    return new Response(JSON.stringify({
      isPremium: hasPremium,
      purchaseDate: purchase?.purchased_at || null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[CHECK-PREMIUM] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      isPremium: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});