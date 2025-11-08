import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[DAILY-LEVEL-UPDATE] Function started - Automatic daily level update');

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[DAILY-LEVEL-UPDATE] Fetching all active users');

    // Get all users with level data
    const { data: userLevels, error: fetchError } = await supabase
      .from('user_levels')
      .select('user_id, level, xp, last_activity_date');

    if (fetchError) {
      console.error('[DAILY-LEVEL-UPDATE] Error fetching user levels:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch user levels',
          details: fetchError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[DAILY-LEVEL-UPDATE] Found ${userLevels?.length || 0} users`);

    let updatedCount = 0;
    let errorCount = 0;

    // Update each user's level based on activity
    if (userLevels) {
      for (const userLevel of userLevels) {
        try {
          const now = new Date();
          const lastActivity = userLevel.last_activity_date 
            ? new Date(userLevel.last_activity_date) 
            : null;

          // Calculate hours since last activity
          const hoursSinceActivity = lastActivity 
            ? (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
            : Infinity;

          // Apply XP penalty for inactivity (7+ days)
          if (hoursSinceActivity > 168) {
            const penaltyXp = Math.floor(userLevel.xp * 0.95);
            
            await supabase
              .from('user_levels')
              .update({ 
                xp: penaltyXp,
                last_activity_date: now.toISOString()
              })
              .eq('user_id', userLevel.user_id);

            console.log(`[DAILY-LEVEL-UPDATE] Applied inactivity penalty to user ${userLevel.user_id}`);
            updatedCount++;
          }
        } catch (err) {
          console.error(`[DAILY-LEVEL-UPDATE] Error updating user ${userLevel.user_id}:`, err);
          errorCount++;
        }
      }
    }

    console.log(`[DAILY-LEVEL-UPDATE] Updated ${updatedCount} users, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Daily level update completed',
        updated: updatedCount,
        errors: errorCount,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[DAILY-LEVEL-UPDATE] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
