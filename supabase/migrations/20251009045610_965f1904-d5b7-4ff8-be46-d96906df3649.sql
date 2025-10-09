-- ============================================
-- CIGARETTE SAVINGS TRACKER SYSTEM
-- ============================================
-- Add columns to track cigarette consumption and calculate savings

-- Add new columns to user_addictions table for cigarette-specific data
ALTER TABLE public.user_addictions 
ADD COLUMN IF NOT EXISTS daily_cigarettes INTEGER,
ADD COLUMN IF NOT EXISTS cigarette_price NUMERIC(10, 2) DEFAULT 0.50,
ADD COLUMN IF NOT EXISTS pack_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS cigarettes_per_pack INTEGER DEFAULT 20;

-- Add comment for documentation
COMMENT ON COLUMN public.user_addictions.daily_cigarettes IS 'Number of cigarettes smoked per day before quitting';
COMMENT ON COLUMN public.user_addictions.cigarette_price IS 'Price per cigarette in euros (default 0.50€)';
COMMENT ON COLUMN public.user_addictions.pack_price IS 'Optional: Price of a full pack (will calculate cigarette_price if provided)';
COMMENT ON COLUMN public.user_addictions.cigarettes_per_pack IS 'Number of cigarettes per pack (default 20)';

-- Create a view for easy savings calculation
CREATE OR REPLACE VIEW public.addiction_savings AS
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

COMMENT ON VIEW public.addiction_savings IS 'Calculates daily and total savings for addiction tracking';

-- Grant access to authenticated users
GRANT SELECT ON public.addiction_savings TO authenticated;