-- Create AI optimization applications tracking table
CREATE TABLE IF NOT EXISTS public.ai_optimization_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, applied, rolled_back, failed
  applied_at TIMESTAMP WITH TIME ZONE,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  before_state JSONB,
  after_state JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for ai_optimization_applications
ALTER TABLE public.ai_optimization_applications ENABLE ROW LEVEL SECURITY;

-- Only admins can view AI optimization applications
CREATE POLICY "Admins can view AI optimization applications"
  ON public.ai_optimization_applications
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only system can insert AI optimization applications
CREATE POLICY "System can insert AI optimization applications"
  ON public.ai_optimization_applications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only admins can update AI optimization applications
CREATE POLICY "Admins can update AI optimization applications"
  ON public.ai_optimization_applications
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_ai_optimization_applications_updated_at
  BEFORE UPDATE ON public.ai_optimization_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_ai_optimization_applications_status ON public.ai_optimization_applications(status);
CREATE INDEX idx_ai_optimization_applications_applied_at ON public.ai_optimization_applications(applied_at);

-- Function to update all user streaks daily (independent of login)
CREATE OR REPLACE FUNCTION public.update_all_daily_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date date := CURRENT_DATE;
  streak_record record;
BEGIN
  -- Update all login streaks for active users
  FOR streak_record IN 
    SELECT * FROM login_streaks
  LOOP
    DECLARE
      days_since_creation integer;
      expected_streak integer;
    BEGIN
      -- Calculate days since account creation (streak_start_date)
      days_since_creation := (today_date - streak_record.streak_start_date::date);
      
      -- Expected streak is days since creation + 1 (day 0 = streak 1)
      expected_streak := GREATEST(1, days_since_creation + 1);

      -- Update the streak to match expected continuous growth
      UPDATE login_streaks 
      SET 
        current_streak = expected_streak,
        longest_streak = GREATEST(longest_streak, expected_streak),
        last_login_date = today_date,
        updated_at = now()
      WHERE id = streak_record.id;
    END;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.update_all_daily_streaks() IS 'Updates all user streaks daily, incrementing by 1 for continuous growth since account creation';