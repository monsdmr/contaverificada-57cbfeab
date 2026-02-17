
-- Create pix_payments table
CREATE TABLE public.pix_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  transaction_hash TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT,
  pix_code TEXT,
  pix_qr_code_base64 TEXT,
  pix_url TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_cpf TEXT,
  ab_variant TEXT,
  ttclid TEXT,
  ttp TEXT,
  page_url TEXT,
  page_referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

-- Public insert policy (anonymous users create payments)
CREATE POLICY "Anyone can create payments"
  ON public.pix_payments FOR INSERT
  WITH CHECK (true);

-- Public select policy (check payment status by transaction_id)
CREATE POLICY "Anyone can view payments by transaction_id"
  ON public.pix_payments FOR SELECT
  USING (true);

-- Service role can update (for webhook/edge function updates)
CREATE POLICY "Service role can update payments"
  ON public.pix_payments FOR UPDATE
  USING (true);

-- Enable realtime for payment status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.pix_payments;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pix_payments_updated_at
  BEFORE UPDATE ON public.pix_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
