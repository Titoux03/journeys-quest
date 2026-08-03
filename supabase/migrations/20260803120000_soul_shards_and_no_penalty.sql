-- 1) Les éclats d'âme deviennent persistants (synchro multi-appareil)
ALTER TABLE public.user_levels
  ADD COLUMN IF NOT EXISTS shards INTEGER NOT NULL DEFAULT 0;

-- 2) Incrément atomique des éclats
CREATE OR REPLACE FUNCTION public.add_soul_shards(user_id_param UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  IF amount IS NULL OR amount <= 0 THEN
    SELECT shards INTO new_total FROM user_levels WHERE user_id = user_id_param;
    RETURN COALESCE(new_total, 0);
  END IF;

  INSERT INTO user_levels (user_id, level, xp, shards)
  VALUES (user_id_param, 1, 0, amount)
  ON CONFLICT (user_id) DO UPDATE
    SET shards = user_levels.shards + amount,
        updated_at = now()
  RETURNING shards INTO new_total;

  RETURN COALESCE(new_total, 0);
END;
$$;

-- 3) Retrait de la pénalité d'inactivité.
--    L'ancienne version amputait l'XP de 5% après 7 jours ET ignorait l'action du jour :
--    celui qui revenait après une mauvaise passe était puni deux fois. C'est l'inverse
--    de la promesse de l'app. On accueille le retour, on ne le sanctionne pas.
CREATE OR REPLACE FUNCTION public.update_user_level(
  user_id_param UUID,
  activity_type TEXT DEFAULT 'login'
)
RETURNS TABLE(new_level INTEGER, new_xp INTEGER, xp_gained INTEGER, level_up BOOLEAN, title TEXT)
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
  SELECT * INTO current_record FROM user_levels WHERE user_id = user_id_param;

  IF current_record IS NULL THEN
    INSERT INTO user_levels (user_id, level, xp, last_activity_date)
    VALUES (user_id_param, 1, 0, now());

    RETURN QUERY SELECT 1::INTEGER, 0::INTEGER, 0::INTEGER, false, get_level_title(1);
    RETURN;
  END IF;

  -- Bonus de régularité (aucune pénalité dans l'autre sens)
  IF current_record.last_activity_date IS NOT NULL THEN
    hours_since_last_activity := EXTRACT(EPOCH FROM (now() - current_record.last_activity_date)) / 3600;
    IF hours_since_last_activity <= 48 THEN
      bonus_xp := FLOOR(base_xp * 0.05);
    END IF;
  END IF;

  total_xp_gained := base_xp + bonus_xp;
  new_total_xp := current_record.xp + total_xp_gained;
  calculated_level := current_record.level;

  LOOP
    xp_for_next_level := calculate_xp_for_level(calculated_level);
    EXIT WHEN new_total_xp < xp_for_next_level OR calculated_level >= 200;
    new_total_xp := new_total_xp - xp_for_next_level;
    calculated_level := calculated_level + 1;
    did_level_up := true;
  END LOOP;

  UPDATE user_levels
  SET level = calculated_level,
      xp = new_total_xp,
      last_activity_date = now(),
      updated_at = now()
  WHERE user_id = user_id_param;

  RETURN QUERY SELECT
    calculated_level,
    new_total_xp,
    total_xp_gained,
    did_level_up,
    get_level_title(calculated_level);
END;
$$;
