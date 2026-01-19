-- Grant premium access to user 4fad952c-edbd-448b-8bf1-152e45f04af7
INSERT INTO public.premium_purchases (
  user_id,
  stripe_payment_intent_id,
  amount,
  currency,
  status,
  purchased_at
) VALUES (
  '4fad952c-edbd-448b-8bf1-152e45f04af7',
  'manual_grant_admin',
  0,
  'EUR',
  'completed',
  now()
) ON CONFLICT DO NOTHING;