-- Corriger le type de données pour total_score pour permettre les décimaux
ALTER TABLE journal_entries ALTER COLUMN total_score TYPE NUMERIC(4,2);

-- Ajouter une contrainte unique sur user_id et date si elle n'existe pas déjà
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS unique_user_date_journal;
ALTER TABLE journal_entries ADD CONSTRAINT unique_user_date_journal UNIQUE (user_id, date);

-- Supprimer la contrainte qui cause problème dans login_streaks si elle existe
ALTER TABLE login_streaks DROP CONSTRAINT IF EXISTS unique_user_login_streak;