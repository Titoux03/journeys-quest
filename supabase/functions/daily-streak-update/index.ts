import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting daily streak update at 8:00 AM...')

    // Get all active user addictions
    const { data: userAddictions, error: addictionsError } = await supabaseClient
      .from('user_addictions')
      .select('*')
      .eq('is_active', true)

    if (addictionsError) {
      console.error('Error fetching user addictions:', addictionsError)
      throw addictionsError
    }

    console.log(`Found ${userAddictions?.length || 0} active addictions to update`)

    const today = new Date().toISOString().split('T')[0]
    let updatedCount = 0

    // Update each addiction's streak
    for (const addiction of userAddictions || []) {
      try {
        // Calculate days since start
        const startDate = new Date(addiction.start_date)
        const todayDate = new Date(today)
        const daysSinceStart = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Check if last relapse date affects current streak
        let currentStreak = daysSinceStart + 1 // +1 because we include the start day
        
        if (addiction.last_relapse_date) {
          const lastRelapseDate = new Date(addiction.last_relapse_date)
          if (lastRelapseDate > startDate) {
            // If there was a relapse after start date, calculate from relapse
            const daysSinceRelapse = Math.floor((todayDate.getTime() - lastRelapseDate.getTime()) / (1000 * 60 * 60 * 24))
            currentStreak = daysSinceRelapse
          }
        }

        // Ensure current streak is not negative
        currentStreak = Math.max(0, currentStreak)

        // Update longest streak if current is higher
        const longestStreak = Math.max(addiction.longest_streak || 0, currentStreak)

        const { error: updateError } = await supabaseClient
          .from('user_addictions')
          .update({
            current_streak: currentStreak,
            longest_streak: longestStreak,
            updated_at: new Date().toISOString()
          })
          .eq('id', addiction.id)

        if (updateError) {
          console.error(`Error updating addiction ${addiction.id}:`, updateError)
        } else {
          updatedCount++
          console.log(`Updated addiction ${addiction.id}: current_streak=${currentStreak}, longest_streak=${longestStreak}`)
        }
      } catch (error) {
        console.error(`Error processing addiction ${addiction.id}:`, error)
      }
    }

    console.log(`Successfully updated ${updatedCount} addictions`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} addictions`,
        updated_count: updatedCount,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in daily streak update:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})