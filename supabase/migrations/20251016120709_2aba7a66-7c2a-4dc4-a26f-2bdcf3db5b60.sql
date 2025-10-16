-- Ajouter les champs de tracking des pop-ups dans la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_seen_intro_popup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_seen_tutorial boolean DEFAULT false;