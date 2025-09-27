-- Table pour tracker les affiliations
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affiliate_code TEXT NOT NULL,
  payment_intent_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending',
  referred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Policies pour la sécurité
CREATE POLICY "Service role can manage affiliate referrals" 
ON public.affiliate_referrals 
FOR ALL 
USING (auth.role() = 'service_role');

-- Index pour les performances
CREATE INDEX idx_affiliate_referrals_affiliate_code ON public.affiliate_referrals(affiliate_code);
CREATE INDEX idx_affiliate_referrals_user_id ON public.affiliate_referrals(user_id);
CREATE INDEX idx_affiliate_referrals_status ON public.affiliate_referrals(status);

-- Trigger pour updated_at
CREATE TRIGGER update_affiliate_referrals_updated_at
BEFORE UPDATE ON public.affiliate_referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();