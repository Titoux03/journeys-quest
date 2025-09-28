import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-TODO-RESET] ${step}${detailsStr}`);
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
    logStep("Function started - Daily Todo Reset");
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    logStep("Processing date range", { today: todayString, yesterday: yesterdayString });

    // Obtenir tous les utilisateurs premium qui ont des tâches importantes non terminées d'hier
    const { data: premiumUsers, error: premiumError } = await supabaseClient
      .from('premium_purchases')
      .select('user_id')
      .eq('status', 'succeeded');

    if (premiumError) {
      throw new Error(`Error fetching premium users: ${premiumError.message}`);
    }

    logStep("Found premium users", { count: premiumUsers?.length || 0 });

    if (!premiumUsers || premiumUsers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No premium users found",
        processedUsers: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let processedUsers = 0;
    let carriedTasks = 0;

    // Pour chaque utilisateur premium
    for (const user of premiumUsers) {
      try {
        // Trouver les tâches importantes non terminées d'hier
        const { data: yesterdayTodos, error: todosError } = await supabaseClient
          .from('todos')
          .select('*')
          .eq('user_id', user.user_id)
          .gte('created_at', `${yesterdayString}T00:00:00Z`)
          .lt('created_at', `${todayString}T00:00:00Z`)
          .eq('is_completed', false)
          .gte('priority_level', 2); // Seulement les tâches très importantes

        if (todosError) {
          logStep("Error fetching todos for user", { userId: user.user_id, error: todosError.message });
          continue;
        }

        if (!yesterdayTodos || yesterdayTodos.length === 0) {
          continue;
        }

        logStep("Found important uncompleted tasks", { 
          userId: user.user_id, 
          count: yesterdayTodos.length 
        });

        // Reporter ces tâches pour aujourd'hui avec une priorité diminuée
        for (const todo of yesterdayTodos) {
          const newPriority = Math.max(1, todo.priority_level - 1);
          const carriedText = `📅 ${todo.text}`;

          const { error: insertError } = await supabaseClient
            .from('todos')
            .insert({
              user_id: user.user_id,
              text: carriedText,
              priority_level: newPriority,
              is_completed: false,
              carried_from_previous: true,
            });

          if (insertError) {
            logStep("Error inserting carried task", { 
              userId: user.user_id, 
              error: insertError.message 
            });
          } else {
            carriedTasks++;
          }
        }

        processedUsers++;
      } catch (userError) {
        logStep("Error processing user", { 
          userId: user.user_id, 
          error: userError instanceof Error ? userError.message : String(userError) 
        });
      }
    }

    // Nettoyage optionnel : supprimer les tâches complétées de plus de 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error: cleanupError } = await supabaseClient
      .from('todos')
      .delete()
      .eq('is_completed', true)
      .lt('completed_at', thirtyDaysAgo.toISOString());

    if (cleanupError) {
      logStep("Warning: Cleanup failed", { error: cleanupError.message });
    } else {
      logStep("Cleanup completed successfully");
    }

    logStep("Daily reset completed", { 
      processedUsers, 
      carriedTasks,
      cleanup: !cleanupError 
    });

    return new Response(JSON.stringify({
      success: true,
      processedUsers,
      carriedTasks,
      date: todayString,
      cleanup: !cleanupError
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in daily-todo-reset", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});