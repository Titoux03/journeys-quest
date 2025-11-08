-- Create user_levels table for the new level system
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own level"
  ON public.user_levels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own level"
  ON public.user_levels
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level"
  ON public.user_levels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_levels_updated_at
  BEFORE UPDATE ON public.user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(current_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- XP to next level = 50 * (current_level ^ 1.15)
  RETURN FLOOR(50 * POWER(current_level, 1.15))::INTEGER;
END;
$$;

-- Function to get level title
CREATE OR REPLACE FUNCTION public.get_level_title(user_level INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE
    WHEN user_level >= 0 AND user_level <= 10 THEN
      RETURN 'Initié du Calme';
    WHEN user_level >= 11 AND user_level <= 25 THEN
      RETURN 'Voyageur Intérieur';
    WHEN user_level >= 26 AND user_level <= 50 THEN
      RETURN 'Explorateur de Conscience';
    WHEN user_level >= 51 AND user_level <= 75 THEN
      RETURN 'Gardien du Souffle';
    WHEN user_level >= 76 AND user_level <= 100 THEN
      RETURN 'Architecte de Sérénité';
    WHEN user_level >= 101 AND user_level <= 150 THEN
      RETURN 'Voyageur Astral';
    WHEN user_level >= 151 AND user_level <= 200 THEN
      RETURN 'Maître des Mondes Intérieurs 🌌';
    ELSE
      RETURN 'Voyageur';
  END CASE;
END;
$$;

-- Function to update user level based on activity
CREATE OR REPLACE FUNCTION public.update_user_level(
  user_id_param UUID,
  activity_type TEXT DEFAULT 'login'
)
RETURNS TABLE(
  new_level INTEGER,
  new_xp INTEGER,
  xp_gained INTEGER,
  level_up BOOLEAN,
  title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_record RECORD;
  base_xp INTEGER := 10;
  bonus_xp INTEGER := 0;
  total_xp_gained INTEGER;
  new_total_xp INTEGER;
  calculated_level INTEGER;
  xp_for_next_level INTEGER;
  did_level_up BOOLEAN := false;
  hours_since_last_activity NUMERIC;
BEGIN
  -- Get current user level data
  SELECT * INTO current_record
  FROM user_levels
  WHERE user_id = user_id_param;

  -- If no record exists, create one
  IF current_record IS NULL THEN
    INSERT INTO user_levels (user_id, level, xp, last_activity_date)
    VALUES (user_id_param, 1, 0, now())
    RETURNING level, xp INTO current_record;
    
    RETURN QUERY SELECT 
      1::INTEGER,
      0::INTEGER,
      0::INTEGER,
      false,
      get_level_title(1);
    RETURN;
  END IF;

  -- Check if activity is within 48 hours (daily bonus)
  IF current_record.last_activity_date IS NOT NULL THEN
    hours_since_last_activity := EXTRACT(EPOCH FROM (now() - current_record.last_activity_date)) / 3600;
    
    -- Bonus for daily activity
    IF hours_since_last_activity <= 48 THEN
      bonus_xp := FLOOR(base_xp * 0.05);
    END IF;
    
    -- XP penalty for 7+ days of inactivity
    IF hours_since_last_activity > 168 THEN -- 7 days
      new_total_xp := FLOOR(current_record.xp * 0.95);
      UPDATE user_levels
      SET xp = new_total_xp,
          last_activity_date = now(),
          updated_at = now()
      WHERE user_id = user_id_param;
      
      RETURN QUERY SELECT 
        current_record.level,
        new_total_xp,
        0::INTEGER,
        false,
        get_level_title(current_record.level);
      RETURN;
    END IF;
  END IF;

  -- Calculate total XP gained
  total_xp_gained := base_xp + bonus_xp;
  new_total_xp := current_record.xp + total_xp_gained;
  calculated_level := current_record.level;

  -- Check for level up
  LOOP
    xp_for_next_level := calculate_xp_for_level(calculated_level);
    
    EXIT WHEN new_total_xp < xp_for_next_level OR calculated_level >= 200;
    
    new_total_xp := new_total_xp - xp_for_next_level;
    calculated_level := calculated_level + 1;
    did_level_up := true;
  END LOOP;

  -- Update user level
  UPDATE user_levels
  SET 
    level = calculated_level,
    xp = new_total_xp,
    last_activity_date = now(),
    updated_at = now()
  WHERE user_id = user_id_param;

  -- Return results
  RETURN QUERY SELECT 
    calculated_level,
    new_total_xp,
    total_xp_gained,
    did_level_up,
    get_level_title(calculated_level);
END;
$$;

-- Modify handle_new_user to create level record instead of streak
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  today_date date := CURRENT_DATE;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  
  -- Create user level starting at level 1
  INSERT INTO public.user_levels (
    user_id, 
    level, 
    xp, 
    last_activity_date
  )
  VALUES (
    NEW.id,
    1,
    0,
    now()
  );
  
  RETURN NEW;
END;
$$;