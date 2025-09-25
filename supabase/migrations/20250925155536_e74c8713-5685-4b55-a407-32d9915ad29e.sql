-- Create table to track premium purchases
CREATE TABLE public.premium_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.premium_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for premium purchases
CREATE POLICY "Users can view their own premium purchases" 
ON public.premium_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create premium purchases" 
ON public.premium_purchases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update premium purchases" 
ON public.premium_purchases 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_premium_purchases_updated_at
BEFORE UPDATE ON public.premium_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();