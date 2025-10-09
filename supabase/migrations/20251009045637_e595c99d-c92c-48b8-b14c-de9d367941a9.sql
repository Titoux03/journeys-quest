-- Fix security definer view issue
-- Drop and recreate the view without SECURITY DEFINER

DROP VIEW IF EXISTS public.addiction_savings;

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
  -- Calculate daily savings
  (ua.daily_cigarettes * ua.cigarette_price) AS daily_savings,
  -- Calculate total savings since engagement
  (ua.daily_cigarettes * ua.cigarette_price * ua.current_streak) AS total_savings,
  -- Calculate days since engagement
  (CURRENT_DATE - ua.start_date::date) AS days_since_start,
  -- Calculate potential savings (even if streak is broken)
  (ua.daily_cigarettes * ua.cigarette_price * (CURRENT_DATE - ua.start_date::date)) AS potential_total_savings
FROM public.user_addictions ua
WHERE ua.is_active = true 
  AND ua.daily_cigarettes IS NOT NULL
  AND ua.daily_cigarettes > 0;

COMMENT ON VIEW public.addiction_savings IS 'Calculates daily and total savings for addiction tracking - uses security_invoker for RLS enforcement';