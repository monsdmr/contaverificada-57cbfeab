-- Drop the overly permissive SELECT policy that exposes all payment data
DROP POLICY IF EXISTS "Anyone can view payments by transaction_id" ON public.pix_payments;

-- Drop the overly permissive UPDATE policy that allows anyone to modify payments
DROP POLICY IF EXISTS "Service role can update payments" ON public.pix_payments;