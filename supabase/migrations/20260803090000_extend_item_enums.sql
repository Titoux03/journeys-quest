-- Ajoute les valeurs d'enum nécessaires au catalogue étendu.
-- Fichier séparé : une valeur d'enum doit être committée avant d'être utilisée.
ALTER TYPE public.item_slot ADD VALUE IF NOT EXISTS 'back';
ALTER TYPE public.item_rarity ADD VALUE IF NOT EXISTS 'mythic';
