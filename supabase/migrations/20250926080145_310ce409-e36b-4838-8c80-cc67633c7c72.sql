-- Optimisations critiques pour la performance
-- Index composé pour les requêtes fréquentes de journal
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
ON journal_entries (user_id, date DESC);

-- Index pour les requêtes de streak d'addiction
CREATE INDEX IF NOT EXISTS idx_user_addictions_user_active 
ON user_addictions (user_id, is_active, current_streak DESC);

-- Index pour les sessions de méditation (requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date 
ON meditation_sessions (user_id, completed_at DESC);

-- Index pour les achats premium (vérifications fréquentes)
CREATE INDEX IF NOT EXISTS idx_premium_purchases_user_status 
ON premium_purchases (user_id, status, purchased_at DESC);

-- Index pour les login streaks (calculs fréquents)
CREATE INDEX IF NOT EXISTS idx_login_streaks_user_date 
ON login_streaks (user_id, last_login_date DESC);

-- Index sur les colonnes JSONB pour les scores
CREATE INDEX IF NOT EXISTS idx_journal_entries_scores_gin 
ON journal_entries USING GIN (scores);

-- Fonction pour nettoyer les anciennes entrées (performance)
CREATE OR REPLACE FUNCTION cleanup_old_entries()
RETURNS void AS $$
BEGIN
  -- Supprimer les entrées de journal de plus de 2 ans
  DELETE FROM journal_entries 
  WHERE date < CURRENT_DATE - INTERVAL '2 years';
  
  -- Supprimer les sessions de méditation de plus de 1 an
  DELETE FROM meditation_sessions 
  WHERE completed_at < CURRENT_DATE - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;