
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  step TEXT NOT NULL,
  event TEXT NOT NULL,
  cpf_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_step ON public.funnel_events (step, event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON public.funnel_events (session_id);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events"
  ON public.funnel_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read funnel events"
  ON public.funnel_events FOR SELECT USING (true);
