-- Nettoyer tous les doublons en gardant seulement l'entrée la plus récente pour chaque utilisateur
WITH ranked_streaks AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM login_streaks
)
DELETE FROM login_streaks 
WHERE id IN (
  SELECT id FROM ranked_streaks WHERE rn > 1
);

-- Mettre à jour l'entrée de titoux avec le bon streak (jour 2)
UPDATE login_streaks 
SET current_streak = 2,
    longest_streak = 2,
    last_login_date = '2025-09-27'
WHERE user_id = 'b8568c18-bbf4-4721-bcbe-79e9b2c0253c';

-- Ajouter une contrainte unique pour éviter les doublons futurs
ALTER TABLE login_streaks 
ADD CONSTRAINT unique_user_login_streak UNIQUE (user_id);