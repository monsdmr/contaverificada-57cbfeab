
-- Add columns for hashed CPF storage
ALTER TABLE public.pix_payments
  ADD COLUMN IF NOT EXISTS customer_cpf_hash text,
  ADD COLUMN IF NOT EXISTS customer_cpf_last4 text;

-- Create index on hash for deduplication lookups
CREATE INDEX IF NOT EXISTS idx_pix_payments_cpf_hash ON public.pix_payments (customer_cpf_hash);
