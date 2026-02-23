
-- Rarity enum for items
CREATE TYPE public.item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- Item slot enum
CREATE TYPE public.item_slot AS ENUM ('body', 'head', 'face', 'outfit', 'weapon', 'cape', 'aura', 'background', 'pet');

-- Avatar items catalog
CREATE TABLE public.avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description TEXT,
  description_fr TEXT,
  slot item_slot NOT NULL,
  rarity item_rarity NOT NULL DEFAULT 'common',
  pixel_art_data JSONB NOT NULL DEFAULT '{}',
  preview_emoji TEXT NOT NULL DEFAULT '⬜',
  unlock_method TEXT NOT NULL DEFAULT 'level', -- 'level', 'quest', 'chest', 'premium', 'default'
  unlock_requirement JSONB DEFAULT '{}',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  level_required INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User inventory (items they've unlocked)
CREATE TABLE public.user_avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.avatar_items(id) ON DELETE CASCADE,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  obtained_via TEXT NOT NULL DEFAULT 'level', -- 'level', 'quest', 'chest', 'purchase'
  UNIQUE(user_id, item_id)
);

-- Currently equipped items
CREATE TABLE public.user_avatar_equipped (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  slot item_slot NOT NULL,
  item_id UUID NOT NULL REFERENCES public.avatar_items(id) ON DELETE CASCADE,
  equipped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot)
);

-- Avatar quests / challenges
CREATE TABLE public.avatar_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description TEXT,
  description_fr TEXT,
  quest_type TEXT NOT NULL, -- 'meditation_streak', 'todo_complete', 'journal_streak', 'addiction_days', 'login_streak'
  target_value INTEGER NOT NULL DEFAULT 7,
  reward_item_id UUID REFERENCES public.avatar_items(id),
  reward_chest_rarity item_rarity DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User quest progress
CREATE TABLE public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES public.avatar_quests(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

-- User chest inventory (earned chests to open)
CREATE TABLE public.user_chests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rarity item_rarity NOT NULL DEFAULT 'common',
  source TEXT NOT NULL DEFAULT 'level', -- 'level', 'quest', 'streak', 'purchase'
  is_opened BOOLEAN NOT NULL DEFAULT false,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_equipped ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chests ENABLE ROW LEVEL SECURITY;

-- RLS: avatar_items (public read)
CREATE POLICY "Anyone can view avatar items" ON public.avatar_items FOR SELECT USING (true);

-- RLS: user_avatar_items
CREATE POLICY "Users can view their own items" ON public.user_avatar_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own items" ON public.user_avatar_items FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: user_avatar_equipped
CREATE POLICY "Users can view their own equipped" ON public.user_avatar_equipped FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own equipped" ON public.user_avatar_equipped FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own equipped" ON public.user_avatar_equipped FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own equipped" ON public.user_avatar_equipped FOR DELETE USING (auth.uid() = user_id);

-- RLS: avatar_quests (public read)
CREATE POLICY "Anyone can view quests" ON public.avatar_quests FOR SELECT USING (true);

-- RLS: user_quest_progress
CREATE POLICY "Users can view their own quest progress" ON public.user_quest_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quest progress" ON public.user_quest_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quest progress" ON public.user_quest_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS: user_chests
CREATE POLICY "Users can view their own chests" ON public.user_chests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chests" ON public.user_chests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chests" ON public.user_chests FOR UPDATE USING (auth.uid() = user_id);
