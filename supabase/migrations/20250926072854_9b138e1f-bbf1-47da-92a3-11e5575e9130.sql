-- Security fix: Add INSERT protection policy for premium_purchases table
-- Only server-side functions with service role should be able to insert premium purchases
-- This prevents users from creating fake premium purchase records

-- Drop existing INSERT policy if any exists (safety measure)
DROP POLICY IF EXISTS "Service role can insert premium purchases" ON public.premium_purchases;

-- Create INSERT policy that restricts premium purchase creation to service role only
-- This prevents client-side manipulation of payment data
CREATE POLICY "Service role can insert premium purchases" 
ON public.premium_purchases 
FOR INSERT 
WITH CHECK (
  -- Only allow INSERT operations from service role (used by edge functions)
  -- Regular authenticated users cannot directly insert premium purchases
  auth.role() = 'service_role'
);

-- Also add UPDATE and DELETE policies for complete protection
DROP POLICY IF EXISTS "Service role can update premium purchases" ON public.premium_purchases;
DROP POLICY IF EXISTS "No one can delete premium purchases" ON public.premium_purchases;

CREATE POLICY "Service role can update premium purchases" 
ON public.premium_purchases 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Prevent deletion of premium purchases for audit trail
CREATE POLICY "No one can delete premium purchases" 
ON public.premium_purchases 
FOR DELETE 
USING (false);