-- Fix security issue: Remove overly permissive policies and create secure ones
-- Drop the existing insecure policies
DROP POLICY IF EXISTS "System can create premium purchases" ON public.premium_purchases;
DROP POLICY IF EXISTS "System can update premium purchases" ON public.premium_purchases;

-- Create secure policies that only allow users to read their own purchases
-- INSERT and UPDATE will only be done by Edge Functions using service role key
CREATE POLICY "Users can only view their own premium purchases" 
ON public.premium_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- No INSERT or UPDATE policies for regular users
-- Only the service role (used by Edge Functions) can create/update purchase records
-- This prevents users from creating fake purchases or modifying existing ones