
CREATE TABLE IF NOT EXISTS public.gateway_circuit_breaker (
  gateway TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'closed', -- 'closed' | 'open' | 'half_open'
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gateway_circuit_breaker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages circuit breaker"
  ON public.gateway_circuit_breaker
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default rows
INSERT INTO public.gateway_circuit_breaker (gateway, state) VALUES ('sigmapay', 'closed') ON CONFLICT (gateway) DO NOTHING;
INSERT INTO public.gateway_circuit_breaker (gateway, state) VALUES ('skalepay', 'closed') ON CONFLICT (gateway) DO NOTHING;
