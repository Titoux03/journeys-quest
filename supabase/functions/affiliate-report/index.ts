import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting map (in-memory, resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('[AFFILIATE-REPORT] No authorization header');
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[AFFILIATE-REPORT] Authentication failed:', authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Check if user has admin role
    const { data: hasAdminRole, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !hasAdminRole) {
      console.error('[AFFILIATE-REPORT] Admin check failed:', { userId: user.id, error: roleError });
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Rate limiting
    const now = Date.now();
    const userLimit = rateLimitMap.get(user.id);
    
    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429,
          });
        }
        userLimit.count++;
      } else {
        rateLimitMap.set(user.id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(user.id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    console.log('[AFFILIATE-REPORT] Admin user authorized:', { userId: user.id });

    // Use service role for database queries (admin role verified above)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Récupérer les données d'affiliation depuis Supabase
    const { data: affiliateData, error: supabaseError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (supabaseError) {
      throw new Error(`Erreur Supabase: ${supabaseError.message}`);
    }

    console.log('[AFFILIATE-REPORT] Données Supabase récupérées:', affiliateData?.length);

    // Créer un map pour organiser les données par code d'affiliation
    const affiliateStats: { [key: string]: any } = {};

    // Analyser les données Supabase
    for (const referral of affiliateData || []) {
      const code = referral.affiliate_code;
      
      if (!affiliateStats[code]) {
        affiliateStats[code] = {
          affiliate_code: code,
          total_referrals: 0,
          total_conversions: 0,
          total_revenue: 0,
          conversion_rate: 0,
          referrals: [],
          last_activity: null
        };
      }

      affiliateStats[code].total_referrals++;
      affiliateStats[code].referrals.push({
        user_id: referral.user_id,
        referred_at: referral.referred_at,
        converted_at: referral.converted_at,
        status: referral.status,
        amount: referral.amount,
        currency: referral.currency,
        payment_intent_id: referral.payment_intent_id
      });

      // Compter les conversions et revenus
      if (referral.status === 'converted' && referral.amount) {
        affiliateStats[code].total_conversions++;
        affiliateStats[code].total_revenue += referral.amount;
      }

      // Mettre à jour la dernière activité
      const activityDate = referral.converted_at || referral.referred_at;
      if (!affiliateStats[code].last_activity || activityDate > affiliateStats[code].last_activity) {
        affiliateStats[code].last_activity = activityDate;
      }
    }

    // Calculer les taux de conversion
    Object.keys(affiliateStats).forEach(code => {
      const stats = affiliateStats[code];
      stats.conversion_rate = stats.total_referrals > 0 
        ? (stats.total_conversions / stats.total_referrals) * 100 
        : 0;
    });

    // Récupérer des données supplémentaires depuis Stripe
    const stripePayments = [];
    
    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        expand: ['data.payment_intent']
      });

      for (const session of sessions.data) {
        if (session.metadata?.affiliate_code) {
          stripePayments.push({
            session_id: session.id,
            payment_intent_id: session.payment_intent?.id,
            affiliate_code: session.metadata.affiliate_code,
            amount_total: session.amount_total,
            currency: session.currency,
            status: session.payment_status,
            created: session.created
          });
        }
      }

      console.log('[AFFILIATE-REPORT] Paiements Stripe avec affiliation:', stripePayments.length);
    } catch (stripeError) {
      console.warn('[AFFILIATE-REPORT] Erreur lors de la récupération Stripe:', stripeError);
    }

    // Générer le rapport final
    const reportData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_affiliates: Object.keys(affiliateStats).length,
        total_referrals: Object.values(affiliateStats).reduce((sum: number, stat: any) => sum + stat.total_referrals, 0),
        total_conversions: Object.values(affiliateStats).reduce((sum: number, stat: any) => sum + stat.total_conversions, 0),
        total_revenue: Object.values(affiliateStats).reduce((sum: number, stat: any) => sum + stat.total_revenue, 0),
        overall_conversion_rate: 0
      },
      affiliates: Object.values(affiliateStats).sort((a: any, b: any) => b.total_revenue - a.total_revenue),
      stripe_payments: stripePayments
    };

    // Calculer le taux de conversion global
    if (reportData.summary.total_referrals > 0) {
      reportData.summary.overall_conversion_rate = 
        (reportData.summary.total_conversions / reportData.summary.total_referrals) * 100;
    }

    console.log('[AFFILIATE-REPORT] Rapport généré avec succès');

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('[AFFILIATE-REPORT] Erreur:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
