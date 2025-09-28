-- Fonction pour calculer automatiquement les streaks d'addiction
CREATE OR REPLACE FUNCTION public.calculate_addiction_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Mettre à jour les streaks d'addiction basés sur la date de début
  UPDATE user_addictions 
  SET 
    current_streak = GREATEST(0, EXTRACT(days FROM (CURRENT_DATE - start_date::date))::integer + 1),
    longest_streak = GREATEST(longest_streak, GREATEST(0, EXTRACT(days FROM (CURRENT_DATE - start_date::date))::integer + 1))
  WHERE 
    is_active = true 
    AND start_date IS NOT NULL;
END;
$function$;

-- Fonction pour recalculer les streaks lors de la connexion utilisateur
CREATE OR REPLACE FUNCTION public.update_user_streaks_on_login(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  streak_record record;
BEGIN
  -- Mettre à jour les streaks d'addiction pour cet utilisateur
  UPDATE user_addictions 
  SET 
    current_streak = GREATEST(0, EXTRACT(days FROM (today_date - start_date::date))::integer + 1),
    longest_streak = GREATEST(longest_streak, GREATEST(0, EXTRACT(days FROM (today_date - start_date::date))::integer + 1))
  WHERE 
    user_id = user_id_param
    AND is_active = true 
    AND start_date IS NOT NULL;

  -- Mettre à jour ou créer le streak de connexion
  SELECT * INTO streak_record
  FROM login_streaks 
  WHERE user_id = user_id_param;

  IF streak_record IS NULL THEN
    -- Créer un nouveau streak de connexion
    INSERT INTO login_streaks (user_id, current_streak, longest_streak, last_login_date, streak_start_date)
    VALUES (user_id_param, 1, 1, today_date, today_date);
  ELSE
    -- Vérifier la continuité du streak
    IF streak_record.last_login_date = today_date THEN
      -- Déjà connecté aujourd'hui, ne rien faire
      RETURN;
    ELSIF streak_record.last_login_date = today_date - INTERVAL '1 day' THEN
      -- Streak continue
      UPDATE login_streaks 
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_login_date = today_date
      WHERE user_id = user_id_param;
    ELSE
      -- Streak cassé, recommencer
      UPDATE login_streaks 
      SET 
        current_streak = 1,
        last_login_date = today_date,
        streak_start_date = today_date
      WHERE user_id = user_id_param;
    END IF;
  END IF;
END;
$function$;