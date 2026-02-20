
-- Índice composto para a deduplicação por CPF + payment_type + status + created_at
CREATE INDEX IF NOT EXISTS idx_pix_payments_dedup
  ON public.pix_payments (customer_cpf, payment_type, status, created_at DESC);

-- Índice para buscas por transaction_id (polling/check-payment)
CREATE INDEX IF NOT EXISTS idx_pix_payments_transaction_id
  ON public.pix_payments (transaction_id);

-- Índice para buscas por transaction_hash (webhook fallback)
CREATE INDEX IF NOT EXISTS idx_pix_payments_transaction_hash
  ON public.pix_payments (transaction_hash);
