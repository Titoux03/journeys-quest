import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function pour générer des rapports d'affiliation
 * Analyse les paiements Stripe et les données Supabase pour créer des rapports détaillés
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[AFFILIATE-REPORT] Génération du rapport d\'affiliation');

    // Vérifier l'authentification (optionnel : ajouter une vérification admin)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Récupérer les données d'affiliation depuis Supabase
    const { data: affiliateData, error: supabaseError } = await supabaseClient
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

    // Récupérer des données supplémentaires depuis Stripe si nécessaire
    // (pour vérifier les paiements et obtenir des détails supplémentaires)
    const stripePayments = [];
    
    try {
      // Récupérer les paiements récents avec metadata
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
            customer_email: session.customer_details?.email,
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
    console.log('[AFFILIATE-REPORT] Résumé:', reportData.summary);

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