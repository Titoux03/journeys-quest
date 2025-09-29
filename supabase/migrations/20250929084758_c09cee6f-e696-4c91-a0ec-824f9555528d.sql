-- Corriger la fonction qui met à jour les streaks utilisateur lors de la connexion
CREATE OR REPLACE FUNCTION public.update_user_streaks_on_login(user_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  streak_record record;
  addiction_record record;
BEGIN
  -- Mettre à jour les streaks d'addiction pour cet utilisateur
  FOR addiction_record IN 
    SELECT * FROM user_addictions 
    WHERE user_id = user_id_param 
    AND is_active = true 
    AND start_date IS NOT NULL
  LOOP
    DECLARE
      days_since_start integer;
      days_since_relapse integer;
      current_streak_calc integer;
    BEGIN
      -- Calculer les jours depuis le début (correct avec DATE)
      days_since_start := (today_date - addiction_record.start_date::date);
      
      -- Si il y a eu un relapse, calculer depuis le relapse
      IF addiction_record.last_relapse_date IS NOT NULL THEN
        days_since_relapse := (today_date - addiction_record.last_relapse_date::date);
        -- Si le relapse est après la date de début, utiliser les jours depuis le relapse
        IF addiction_record.last_relapse_date > addiction_record.start_date THEN
          current_streak_calc := GREATEST(0, days_since_relapse);
        ELSE
          current_streak_calc := GREATEST(0, days_since_start + 1);
        END IF;
      ELSE
        current_streak_calc := GREATEST(0, days_since_start + 1);
      END IF;

      -- Mettre à jour l'addiction avec le nouveau streak
      UPDATE user_addictions 
      SET 
        current_streak = current_streak_calc,
        longest_streak = GREATEST(longest_streak, current_streak_calc),
        updated_at = now()
      WHERE id = addiction_record.id;
    END;
  END LOOP;

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
        last_login_date = today_date,
        updated_at = now()
      WHERE user_id = user_id_param;
    ELSE
      -- Streak cassé, recommencer
      UPDATE login_streaks 
      SET 
        current_streak = 1,
        last_login_date = today_date,
        streak_start_date = today_date,
        updated_at = now()
      WHERE user_id = user_id_param;
    END IF;
  END IF;
END;
$function$;