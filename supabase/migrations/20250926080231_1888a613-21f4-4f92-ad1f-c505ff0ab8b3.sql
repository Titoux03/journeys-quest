-- Correction du problème de sécurité pour la fonction cleanup_old_entries
CREATE OR REPLACE FUNCTION cleanup_old_entries()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Supprimer les entrées de journal de plus de 2 ans
  DELETE FROM journal_entries 
  WHERE date < CURRENT_DATE - INTERVAL '2 years';
  
  -- Supprimer les sessions de méditation de plus de 1 an
  DELETE FROM meditation_sessions 
  WHERE completed_at < CURRENT_DATE - INTERVAL '1 year';
END;
$$;