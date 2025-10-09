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

    console.log('Starting daily streak update...')

    const today = new Date().toISOString().split('T')[0]
    let updatedAddictions = 0
    let updatedLoginStreaks = 0

    // ============================================
    // PART 1: Update Addiction Streaks
    // ============================================
    console.log('Updating addiction streaks...')

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
          updatedAddictions++
          console.log(`Updated addiction ${addiction.id}: current_streak=${currentStreak}, longest_streak=${longestStreak}`)
        }
      } catch (error) {
        console.error(`Error processing addiction ${addiction.id}:`, error)
      }
    }

    console.log(`Successfully updated ${updatedAddictions} addictions`)

    // ============================================
    // PART 2: Update Login Streaks
    // ============================================
    console.log('Updating login streaks...')

    // Get all login streaks
    const { data: loginStreaks, error: loginStreaksError } = await supabaseClient
      .from('login_streaks')
      .select('*')

    if (loginStreaksError) {
      console.error('Error fetching login streaks:', loginStreaksError)
      throw loginStreaksError
    }

    console.log(`Found ${loginStreaks?.length || 0} login streaks to check`)

    // Check each login streak
    for (const streak of loginStreaks || []) {
      try {
        const lastLoginDate = new Date(streak.last_login_date)
        const todayDate = new Date(today)
        const daysDiff = Math.floor((todayDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))

        console.log(`User ${streak.user_id}: last login ${streak.last_login_date}, days diff: ${daysDiff}`)

        // If user missed more than 1 day, reset streak
        if (daysDiff > 1) {
          const { error: resetError } = await supabaseClient
            .from('login_streaks')
            .update({
              current_streak: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', streak.id)

          if (resetError) {
            console.error(`Error resetting streak for user ${streak.user_id}:`, resetError)
          } else {
            updatedLoginStreaks++
            console.log(`Reset streak for user ${streak.user_id} (missed ${daysDiff} days)`)
          }
        }
        // If user logged in yesterday or today, streak is maintained (no action needed)
        // The actual increment happens when user logs in via update_user_streaks_on_login function
      } catch (error) {
        console.error(`Error processing login streak ${streak.id}:`, error)
      }
    }

    console.log(`Successfully checked ${loginStreaks?.length || 0} login streaks, reset ${updatedLoginStreaks} inactive streaks`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedAddictions} addictions and checked ${loginStreaks?.length || 0} login streaks`,
        updated_addictions: updatedAddictions,
        checked_login_streaks: loginStreaks?.length || 0,
        reset_login_streaks: updatedLoginStreaks,
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