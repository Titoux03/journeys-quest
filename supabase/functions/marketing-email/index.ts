import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MARKETING-EMAIL] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // SECURITY: Only allow calls from cron jobs (internal Supabase calls)
    // Cron jobs don't have Authorization headers, but direct HTTP calls would
    const authHeader = req.headers.get("Authorization");
    const userAgent = req.headers.get("User-Agent");
    
    // If there's an auth header, verify it's from an admin
    if (authHeader) {
      const supabaseAuthClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
      
      if (authError || !user) {
        logStep("Unauthorized access attempt");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user has admin role
      const { data: hasAdminRole } = await supabaseAuthClient.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!hasAdminRole) {
        logStep("Non-admin user attempted to trigger marketing email");
        return new Response(JSON.stringify({ error: "Forbidden - admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      logStep("Admin user authenticated", { userId: user.id });
    } else {
      // No auth header - check if it's from Supabase cron (pg_cron or pg_net)
      // These internal calls have specific user agents
      const isInternalCall = userAgent?.includes('pg_net') || userAgent?.includes('PostgREST');
      
      if (!isInternalCall) {
        logStep("Unauthorized: Not from cron job or admin");
        return new Response(JSON.stringify({ 
          error: "This function should only be called via scheduled job or by admins" 
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      logStep("Internal cron job detected");
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculer la date il y a 3 jours
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoISO = threeDaysAgo.toISOString().split('T')[0];

    logStep("Looking for users created exactly 3 days ago", { date: threeDaysAgoISO });

    // Récupérer les utilisateurs créés il y a exactement 3 jours
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('user_id, display_name')
      .gte('created_at', `${threeDaysAgoISO}T00:00:00.000Z`)
      .lt('created_at', `${threeDaysAgoISO}T23:59:59.999Z`);

    if (profilesError) {
      logStep("ERROR fetching profiles", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      logStep("No users found for marketing email");
      return new Response(JSON.stringify({ message: "No users found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Found users for marketing email", { count: profiles.length });

    // Pour chaque utilisateur, vérifier s'il n'est pas déjà premium et envoyer l'email
    for (const profile of profiles) {
      try {
        // Vérifier si l'utilisateur est déjà premium
        const { data: premiumPurchase } = await supabaseClient
          .from('premium_purchases')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('status', 'completed')
          .single();

        // Si l'utilisateur est déjà premium, ne pas envoyer l'email
        if (premiumPurchase) {
          logStep("User already premium, skipping", { userId: profile.user_id });
          continue;
        }

        // Récupérer l'email de l'utilisateur depuis auth.users
        const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(profile.user_id);
        
        if (authError || !authUser.user?.email) {
          logStep("ERROR getting user email", { userId: profile.user_id, error: authError });
          continue;
        }

        const userEmail = authUser.user.email;
        const userName = profile.display_name || userEmail.split('@')[0];

        logStep("Sending marketing email", { userId: profile.user_id, email: userEmail });

        // Envoyer l'email via l'API Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Journeys <onboarding@resend.dev>',
            to: [userEmail],
            subject: '🚀 Débloquez votre potentiel avec Journeys Premium',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
                <!-- Header -->
                <div style="padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🌟 Bonjour ${userName} !</h1>
                  <p style="margin: 15px 0 0; font-size: 18px; opacity: 0.9;">3 jours se sont écoulés depuis votre inscription...</p>
                </div>

                <!-- Main content -->
                <div style="background: white; color: #333; padding: 40px 30px;">
                  <h2 style="color: #667eea; font-size: 24px; margin-bottom: 20px;">Il est temps de transformer votre routine !</h2>
                  
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Vous avez commencé votre parcours avec Journeys, et c'est fantastique ! 
                    Mais saviez-vous que <strong>93% des utilisateurs Premium</strong> atteignent leurs objectifs plus rapidement ?
                  </p>

                  <!-- Fonctionnalités Premium -->
                  <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 25px 0;">
                    <h3 style="color: #667eea; margin-top: 0;">🎯 Ce qui vous attend avec Premium :</h3>
                    
                    <div style="display: flex; align-items: center; margin: 15px 0;">
                      <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px;">✨</span>
                      <div>
                        <strong>Priorités Intelligentes</strong><br>
                        <span style="color: #666; font-size: 14px;">IA qui organise vos tâches selon vos objectifs</span>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; margin: 15px 0;">
                      <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px;">📊</span>
                      <div>
                        <strong>Analyses Avancées</strong><br>
                        <span style="color: #666; font-size: 14px;">Insights personnalisés sur vos habitudes</span>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; margin: 15px 0;">
                      <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px;">🏆</span>
                      <div>
                        <strong>Défis Personnalisés</strong><br>
                        <span style="color: #666; font-size: 14px;">Challenges adaptatifs basés sur vos progrès</span>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; margin: 15px 0;">
                      <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px;">🎵</span>
                      <div>
                        <strong>Sons Premium</strong><br>
                        <span style="color: #666; font-size: 14px;">Méditations guidées et sons de focus</span>
                      </div>
                    </div>
                  </div>

                  <!-- Témoignage -->
                  <div style="background: linear-gradient(90deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; font-style: italic;">
                    "Journeys Premium m'a aidé à développer une routine matinale qui a transformé ma productivité. En 30 jours, j'ai atteint plus d'objectifs qu'en 6 mois auparavant !"
                    <div style="text-align: right; margin-top: 10px; font-weight: bold;">- Marie, utilisatrice Premium</div>
                  </div>

                  <!-- Offre spéciale -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background: #fee2e2; color: #dc2626; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold;">
                      🔥 Offre limitée : Accès à vie à seulement 29€ (au lieu de 49€)
                    </div>
                    
                    <a href="https://fgoyvsnsoheboywgtgvi.lovable.app" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block; margin: 10px;">
                      🚀 Débloquer Journeys Premium
                    </a>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 15px;">
                      ✅ Paiement unique • ✅ Accès à vie • ✅ Garantie 30 jours
                    </p>
                  </div>

                  <!-- Footer motivant -->
                  <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
                    <h4 style="color: #667eea; margin: 0 0 10px;">🎯 Votre meilleure version vous attend</h4>
                    <p style="margin: 0; color: #666;">Chaque jour est une opportunité de grandir. Ne laissez pas passer la vôtre.</p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="padding: 20px 30px; text-align: center; background: #1a202c; color: white;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                    Vous recevez cet email car vous vous êtes inscrit sur Journeys.
                    <br>Si vous ne souhaitez plus recevoir nos emails, vous pouvez vous désabonner à tout moment.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          logStep("ERROR sending email", { userId: profile.user_id, error: errorText, status: emailResponse.status });
        } else {
          const responseData = await emailResponse.json();
          logStep("Email sent successfully", { userId: profile.user_id, emailId: responseData.id });
        }

      } catch (userError) {
        logStep("ERROR processing user", { userId: profile.user_id, error: userError });
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${profiles.length} users for marketing emails` 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    logStep("ERROR in marketing-email function", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);