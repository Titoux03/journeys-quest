-- Modifier la table todos pour ajouter le système de priorité 1-3
ALTER TABLE todos DROP COLUMN is_priority;
ALTER TABLE todos ADD COLUMN priority_level integer DEFAULT 0 CHECK (priority_level >= 0 AND priority_level <= 3);

-- Ajouter une colonne pour savoir si c'est reporté de la veille
ALTER TABLE todos ADD COLUMN carried_from_previous boolean DEFAULT false;