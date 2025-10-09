-- ============================================
-- DAILY STREAK UPDATE SYSTEM
-- ============================================
-- This migration sets up automatic daily streak updates at 8:00 AM
-- and ensures new users get login streaks on signup

-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- STEP 1: Update handle_new_user to create login streak
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  
  -- Create login streak starting from account creation
  INSERT INTO public.login_streaks (
    user_id, 
    current_streak, 
    longest_streak, 
    last_login_date, 
    streak_start_date
  )
  VALUES (
    NEW.id,
    1,
    1,
    today_date,
    today_date
  );
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- STEP 2: Schedule daily streak update at 8:00 AM
-- ============================================
-- Create schedule to run at 8:00 AM every day
-- If it already exists, this will update it
DO $$
BEGIN
  -- Try to unschedule existing job (ignore if doesn't exist)
  PERFORM cron.unschedule('daily-streak-update-8am');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore error if job doesn't exist
END $$;

-- Create the schedule
SELECT cron.schedule(
  'daily-streak-update-8am',
  '0 8 * * *', -- Every day at 8:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://fgoyvsnsoheboywgtgvi.supabase.co/functions/v1/daily-streak-update',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- ============================================
-- STEP 3: Backfill login streaks for existing users without one
-- ============================================
INSERT INTO public.login_streaks (user_id, current_streak, longest_streak, last_login_date, streak_start_date)
SELECT 
  au.id,
  1,
  1,
  CURRENT_DATE,
  CURRENT_DATE
FROM auth.users au
LEFT JOIN public.login_streaks ls ON ls.user_id = au.id
WHERE ls.id IS NULL;