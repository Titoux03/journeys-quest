-- Create addiction types table
CREATE TABLE public.addiction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user addictions tracking table
CREATE TABLE public.user_addictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  addiction_type_id UUID NOT NULL REFERENCES public.addiction_types(id),
  start_date DATE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_relapses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_relapse_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'addiction', 'login_streak', 'general'
  requirement_type TEXT NOT NULL, -- 'days', 'login_days', 'actions'
  requirement_value INTEGER NOT NULL,
  addiction_type_id UUID REFERENCES public.addiction_types(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create login streaks table
CREATE TABLE public.login_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  last_login_date DATE NOT NULL,
  streak_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.addiction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for addiction_types (public read)
CREATE POLICY "Anyone can view addiction types" ON public.addiction_types FOR SELECT USING (true);

-- Create RLS policies for user_addictions
CREATE POLICY "Users can view their own addictions" ON public.user_addictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own addictions" ON public.user_addictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addictions" ON public.user_addictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addictions" ON public.user_addictions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- Create RLS policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for login_streaks
CREATE POLICY "Users can view their own login streaks" ON public.login_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own login streaks" ON public.login_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own login streaks" ON public.login_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_addictions_updated_at
  BEFORE UPDATE ON public.user_addictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_login_streaks_updated_at
  BEFORE UPDATE ON public.login_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default addiction types
INSERT INTO public.addiction_types (name, icon, color, description) VALUES
('cigarette', '🚬', '#ef4444', 'Arrêter de fumer pour une meilleure santé'),
('porno', '🔞', '#f97316', 'Se libérer de la dépendance pornographique'),
('scroll', '📱', '#3b82f6', 'Contrôler le temps passé sur les réseaux sociaux'),
('procrastination', '⏰', '#8b5cf6', 'Vaincre la procrastination et être plus productif');

-- Insert default badges for addictions
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, addiction_type_id) 
SELECT 
  'Premier pas - ' || at.name,
  'Premier jour d''abstinence de ' || at.description,
  '🌱',
  'addiction',
  'days',
  1,
  at.id
FROM public.addiction_types at;

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, addiction_type_id) 
SELECT 
  'Débutant - ' || at.name,
  '3 jours d''abstinence de ' || at.description,
  '🌿',
  'addiction',
  'days',
  3,
  at.id
FROM public.addiction_types at;

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, addiction_type_id) 
SELECT 
  'Combattant - ' || at.name,
  '7 jours d''abstinence de ' || at.description,
  '⚔️',
  'addiction',
  'days',
  7,
  at.id
FROM public.addiction_types at;

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, addiction_type_id) 
SELECT 
  'Guerrier - ' || at.name,
  '30 jours d''abstinence de ' || at.description,
  '🏹',
  'addiction',
  'days',
  30,
  at.id
FROM public.addiction_types at;

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, addiction_type_id) 
SELECT 
  'Champion - ' || at.name,
  '90 jours d''abstinence de ' || at.description,
  '🏆',
  'addiction',
  'days',
  90,
  at.id
FROM public.addiction_types at;

-- Insert login streak badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value) VALUES
('Fidèle Journeyer', 'Connecté 3 jours consécutifs', '🌟', 'login_streak', 'login_days', 3),
('Persévérant', 'Connecté 7 jours consécutifs', '🔥', 'login_streak', 'login_days', 7),
('Dévoué', 'Connecté 14 jours consécutifs', '⭐', 'login_streak', 'login_days', 14),
('Passionné', 'Connecté 30 jours consécutifs', '💎', 'login_streak', 'login_days', 30),
('Maître Journeyer', 'Connecté 60 jours consécutifs', '👑', 'login_streak', 'login_days', 60),
('Légende Éternelle', 'Connecté 90 jours consécutifs', '🔮', 'login_streak', 'login_days', 90);