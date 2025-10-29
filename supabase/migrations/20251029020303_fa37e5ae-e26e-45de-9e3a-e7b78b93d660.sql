-- Fix the update_user_streak_on_activity function to return a single row properly
DROP FUNCTION IF EXISTS public.update_user_streak_on_activity(uuid, text);

CREATE OR REPLACE FUNCTION public.update_user_streak_on_activity(
  user_id_param uuid, 
  activity_type text DEFAULT 'login'
)
RETURNS TABLE(
  current_streak integer, 
  longest_streak integer, 
  streak_start_date date, 
  is_new_streak boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  streak_record record;
  hours_since_last_activity numeric;
  new_current_streak integer;
  new_longest_streak integer;
  new_streak_start date;
  is_streak_new boolean := false;
BEGIN
  -- Récupérer le streak actuel
  SELECT * INTO streak_record
  FROM login_streaks 
  WHERE login_streaks.user_id = user_id_param;

  -- Si pas de streak existant, en créer un
  IF streak_record IS NULL THEN
    INSERT INTO login_streaks (
      user_id, 
      current_streak, 
      longest_streak, 
      last_login_date,
      last_activity_date,
      last_activity_type,
      streak_start_date
    )
    VALUES (
      user_id_param,
      1,
      1,
      today_date,
      today_date,
      activity_type,
      today_date
    );
    
    -- Return single row
    RETURN QUERY SELECT 1::integer, 1::integer, today_date, true;
    RETURN;
  END IF;

  -- Vérifier si l'utilisateur a déjà été actif aujourd'hui
  IF streak_record.last_activity_date = today_date THEN
    -- Déjà actif aujourd'hui, juste mettre à jour le type d'activité
    UPDATE login_streaks 
    SET 
      last_activity_type = activity_type,
      last_login_date = today_date,
      updated_at = now()
    WHERE login_streaks.user_id = user_id_param;
    
    -- Return single row
    RETURN QUERY SELECT 
      streak_record.current_streak,
      streak_record.longest_streak,
      streak_record.streak_start_date::date,
      false;
    RETURN;
  END IF;

  -- Calculer les heures depuis la dernière activité
  hours_since_last_activity := EXTRACT(EPOCH FROM (today_date - streak_record.last_activity_date)) / 3600;

  -- Si moins de 48h (activité hier) : continuer le streak
  IF hours_since_last_activity <= 48 THEN
    new_current_streak := streak_record.current_streak + 1;
    new_longest_streak := GREATEST(streak_record.longest_streak, new_current_streak);
    new_streak_start := streak_record.streak_start_date;
    is_streak_new := true;
    
    UPDATE login_streaks 
    SET 
      current_streak = new_current_streak,
      longest_streak = new_longest_streak,
      last_activity_date = today_date,
      last_activity_type = activity_type,
      last_login_date = today_date,
      updated_at = now()
    WHERE login_streaks.user_id = user_id_param;
  ELSE
    -- Plus de 48h : réinitialiser le streak
    new_current_streak := 1;
    new_longest_streak := streak_record.longest_streak;
    new_streak_start := today_date;
    is_streak_new := false;
    
    UPDATE login_streaks 
    SET 
      current_streak = 1,
      last_activity_date = today_date,
      last_activity_type = activity_type,
      last_login_date = today_date,
      streak_start_date = today_date,
      updated_at = now()
    WHERE login_streaks.user_id = user_id_param;
  END IF;

  -- Return single row
  RETURN QUERY SELECT new_current_streak, new_longest_streak, new_streak_start, is_streak_new;
END;
$function$;