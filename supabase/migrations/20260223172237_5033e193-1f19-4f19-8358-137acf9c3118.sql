
-- Seed default avatar items
INSERT INTO public.avatar_items (name, name_fr, slot, rarity, preview_emoji, unlock_method, is_premium, level_required, sort_order) VALUES
-- Default body (everyone gets this)
('Basic Body', 'Corps basique', 'body', 'common', '🧍', 'default', false, 1, 1),
('Athletic Body', 'Corps athlétique', 'body', 'uncommon', '🏃', 'level', false, 10, 2),
('Warrior Body', 'Corps guerrier', 'body', 'rare', '⚔️', 'level', false, 30, 3),
('Cosmic Body', 'Corps cosmique', 'body', 'legendary', '✨', 'level', true, 100, 4),

-- Head items
('Bandana', 'Bandana', 'head', 'common', '🎀', 'level', false, 5, 1),
('Helmet', 'Casque', 'head', 'uncommon', '⛑️', 'level', false, 15, 2),
('Crown', 'Couronne', 'head', 'rare', '👑', 'quest', false, 25, 3),
('Halo', 'Auréole', 'head', 'epic', '😇', 'level', false, 50, 4),
('Galaxy Crown', 'Couronne galactique', 'head', 'legendary', '🌌', 'chest', true, 75, 5),

-- Face items
('Sunglasses', 'Lunettes de soleil', 'face', 'common', '😎', 'level', false, 3, 1),
('Mask', 'Masque', 'face', 'uncommon', '🎭', 'level', false, 12, 2),
('Zen Eyes', 'Yeux zen', 'face', 'rare', '🧘', 'quest', false, 20, 3),
('Fire Eyes', 'Yeux de feu', 'face', 'epic', '🔥', 'chest', true, 40, 4),

-- Outfit items
('T-Shirt', 'T-Shirt', 'outfit', 'common', '👕', 'default', false, 1, 1),
('Hoodie', 'Sweat', 'outfit', 'common', '🧥', 'level', false, 8, 2),
('Armor', 'Armure', 'outfit', 'rare', '🛡️', 'level', false, 35, 3),
('Robe', 'Robe de mage', 'outfit', 'epic', '🧙', 'quest', false, 55, 4),
('Astral Suit', 'Tenue astrale', 'outfit', 'legendary', '🌠', 'level', true, 120, 5),

-- Weapon items
('Wooden Stick', 'Bâton en bois', 'weapon', 'common', '🪵', 'level', false, 7, 1),
('Sword', 'Épée', 'weapon', 'uncommon', '⚔️', 'level', false, 20, 2),
('Staff', 'Sceptre', 'weapon', 'rare', '🔮', 'quest', false, 40, 3),
('Lightsaber', 'Sabre laser', 'weapon', 'legendary', '⚡', 'chest', true, 80, 4),

-- Cape items
('Basic Cape', 'Cape basique', 'cape', 'uncommon', '🦸', 'level', false, 15, 1),
('Fire Cape', 'Cape de feu', 'cape', 'rare', '🔥', 'level', false, 45, 2),
('Starlight Cape', 'Cape étoilée', 'cape', 'epic', '⭐', 'quest', true, 60, 3),
('Cosmic Cape', 'Cape cosmique', 'cape', 'legendary', '🌌', 'chest', true, 90, 4),

-- Aura items
('Calm Glow', 'Lueur calme', 'aura', 'common', '💫', 'level', false, 10, 1),
('Fire Aura', 'Aura de feu', 'aura', 'rare', '🔥', 'level', false, 30, 2),
('Electric Aura', 'Aura électrique', 'aura', 'epic', '⚡', 'quest', true, 50, 3),
('Cosmic Aura', 'Aura cosmique', 'aura', 'legendary', '🌌', 'chest', true, 100, 4),

-- Background items
('Forest', 'Forêt', 'background', 'common', '🌲', 'default', false, 1, 1),
('Mountain', 'Montagne', 'background', 'uncommon', '⛰️', 'level', false, 20, 2),
('Space', 'Espace', 'background', 'rare', '🌌', 'level', false, 50, 3),
('Nebula', 'Nébuleuse', 'background', 'epic', '🌀', 'quest', true, 70, 4),
('Dimension Portal', 'Portail dimensionnel', 'background', 'legendary', '🕳️', 'chest', true, 100, 5),

-- Pet items
('Cat', 'Chat', 'pet', 'uncommon', '🐱', 'level', false, 15, 1),
('Wolf', 'Loup', 'pet', 'rare', '🐺', 'quest', false, 35, 2),
('Dragon', 'Dragon', 'pet', 'epic', '🐉', 'chest', true, 60, 3),
('Phoenix', 'Phénix', 'pet', 'legendary', '🦅', 'chest', true, 100, 4);

-- Seed some quests
INSERT INTO public.avatar_quests (title, title_fr, description, description_fr, quest_type, target_value, sort_order) VALUES
('Meditation Master', 'Maître de la méditation', 'Complete 7 meditation sessions', 'Complète 7 sessions de méditation', 'meditation_streak', 7, 1),
('Journal Warrior', 'Guerrier du journal', 'Write in your journal for 14 days', 'Écris dans ton journal pendant 14 jours', 'journal_streak', 14, 2),
('Todo Champion', 'Champion des tâches', 'Complete 50 tasks', 'Complète 50 tâches', 'todo_complete', 50, 3),
('Streak Legend', 'Légende du streak', 'Maintain a 30-day login streak', 'Maintiens un streak de connexion de 30 jours', 'login_streak', 30, 4),
('Freedom Fighter', 'Combattant de la liberté', 'Stay clean for 60 days', 'Reste clean pendant 60 jours', 'addiction_days', 60, 5);
