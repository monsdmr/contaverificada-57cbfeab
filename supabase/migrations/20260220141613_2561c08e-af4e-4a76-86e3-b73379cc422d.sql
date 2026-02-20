
-- Adiciona coluna para controlar cooldown de verificação por transação
ALTER TABLE public.pix_payments
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE;
