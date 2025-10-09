-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create valid_affiliate_codes table
CREATE TABLE public.valid_affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  owner_name TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on valid_affiliate_codes
ALTER TABLE public.valid_affiliate_codes ENABLE ROW LEVEL SECURITY;

-- RLS policy: Anyone can view active affiliate codes
CREATE POLICY "Anyone can view active affiliate codes"
ON public.valid_affiliate_codes
FOR SELECT
USING (is_active = true);

-- RLS policy: Only admins can manage affiliate codes
CREATE POLICY "Admins can manage affiliate codes"
ON public.valid_affiliate_codes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update affiliate_referrals RLS policies for admin access
CREATE POLICY "Admins can view all affiliate referrals"
ON public.affiliate_referrals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on valid_affiliate_codes
CREATE TRIGGER update_valid_affiliate_codes_updated_at
BEFORE UPDATE ON public.valid_affiliate_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();