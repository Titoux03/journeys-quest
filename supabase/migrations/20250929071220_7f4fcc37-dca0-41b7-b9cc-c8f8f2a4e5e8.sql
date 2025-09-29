-- Activer l'extension pg_cron pour les tâches programmées
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programmer l'envoi d'emails marketing tous les jours à 8h00 UTC
SELECT cron.schedule(
  'marketing-email-daily',
  '0 8 * * *', -- Tous les jours à 8h00 UTC
  $$
  SELECT
    net.http_post(
        url:='https://fgoyvsnsoheboywgtgvi.supabase.co/functions/v1/marketing-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);