-- Configure cron job to automatically update streaks daily at midnight UTC
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily streak update function to run every day at 00:01 UTC
SELECT cron.schedule(
  'daily-streak-auto-increment',
  '1 0 * * *', -- Every day at 00:01 UTC
  $$
  SELECT net.http_post(
      url:='https://fgoyvsnsoheboywgtgvi.supabase.co/functions/v1/daily-streak-update',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Create a function to check and award badges based on streak milestones
CREATE OR REPLACE FUNCTION public.check_and_award_streak_badges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
  badge_record RECORD;
BEGIN
  -- Loop through all users with login streaks
  FOR user_record IN 
    SELECT user_id, current_streak FROM login_streaks
  LOOP
    -- Check for badges that should be awarded based on current streak
    FOR badge_record IN
      SELECT * FROM badges 
      WHERE requirement_type = 'login_streak'
      AND requirement_value <= user_record.current_streak
      AND NOT EXISTS (
        SELECT 1 FROM user_badges 
        WHERE user_id = user_record.user_id 
        AND badge_id = badges.id
      )
    LOOP
      -- Award the badge
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_record.user_id, badge_record.id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$function$;

-- Insert streak milestone badges if they don't exist
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value)
VALUES 
  ('Consistency Starter', 'Maintain a 3-day streak', '🔥', 'streak', 'login_streak', 3),
  ('Momentum Builder', 'Maintain a 7-day streak', '⚡', 'streak', 'login_streak', 7),
  ('Growth Keeper', 'Maintain a 14-day streak', '🌱', 'streak', 'login_streak', 14),
  ('Mind Master', 'Maintain a 30-day streak', '💎', 'streak', 'login_streak', 30),
  ('Unstoppable', 'Maintain a 60-day streak', '🚀', 'streak', 'login_streak', 60),
  ('Century Champion', 'Maintain a 100-day streak', '👑', 'streak', 'login_streak', 100)
ON CONFLICT DO NOTHING;