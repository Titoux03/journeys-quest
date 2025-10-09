-- Fix security issue: Ensure addiction_savings view inherits RLS from user_addictions table
-- Views with security_invoker=true execute with the privileges of the calling user,
-- which means they respect RLS policies on underlying tables

-- Drop the existing view
DROP VIEW IF EXISTS public.addiction_savings;

-- Recreate the view with security_invoker=true to inherit RLS from user_addictions
CREATE VIEW public.addiction_savings
WITH (security_invoker = true)
AS
SELECT 
  ua.id,
  ua.user_id,
  ua.addiction_type_id,
  ua.start_date,
  ua.current_streak,
  ua.daily_cigarettes,
  ua.cigarette_price,
  -- Calculate daily savings (cigarettes per day × price per cigarette)
  (ua.daily_cigarettes * ua.cigarette_price) as daily_savings,
  -- Calculate total savings (daily savings × days since start, using current_streak)
  (ua.daily_cigarettes * ua.cigarette_price * ua.current_streak) as total_savings,
  -- Calculate days since start
  (CURRENT_DATE - ua.start_date::date) as days_since_start,
  -- Potential total savings if user had never relapsed
  (ua.daily_cigarettes * ua.cigarette_price * (CURRENT_DATE - ua.start_date::date)) as potential_total_savings
FROM user_addictions ua
WHERE ua.daily_cigarettes IS NOT NULL 
  AND ua.cigarette_price IS NOT NULL
  AND ua.is_active = true;

-- Add comment explaining the security measure
COMMENT ON VIEW public.addiction_savings IS 
'View showing cigarette savings calculations for active addictions. Uses security_invoker=true to inherit RLS policies from user_addictions table, ensuring users can only see their own financial data.';