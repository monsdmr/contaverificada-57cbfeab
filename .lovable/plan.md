# TikTok Recompensas — Referência para Deploy

## API de Pagamento (SigmaPay)

| Config | Valor |
|--------|-------|
| **Base URL** | `https://api.sigmapay.com.br/api/public/v1` |
| **offer_hash** | `zxw2p8esaw` |
| **product_hash** | `31atjri7nd` |
| **Secret name** | `SIGMA_API_TOKEN` |
| **Valor** | ⚠️ Inserir no painel de secrets do Supabase/Cloud |

### Endpoints usados
- `POST /transactions?api_token={TOKEN}` — Gera PIX (amount em centavos)
- `GET /transactions/{hash}?api_token={TOKEN}` — Verifica status

---

## DB: tabela `pix_payments`

```sql
CREATE TABLE public.pix_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT NOT NULL,
  transaction_hash TEXT,
  payment_type TEXT,
  pix_code TEXT,
  pix_qr_code_base64 TEXT,
  pix_url TEXT,
  customer_name TEXT, customer_email TEXT, customer_cpf TEXT,
  ab_variant TEXT, ttclid TEXT, ttp TEXT,
  page_url TEXT, page_referrer TEXT,
  ip_address TEXT, user_agent TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert" ON public.pix_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "select" ON public.pix_payments FOR SELECT USING (true);
CREATE POLICY "update" ON public.pix_payments FOR UPDATE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.pix_payments;
```

---

## Fluxo do Funil (valores em R$)

```
/ → /resgatar → /funil/confirmar-identidade (27,91)
  → upsell-tenf (44,37) → upsell-transacional (33,41)
  → upsell-antifraude (67,43) → upsell-bonus-oculto (19,73)
  → upsell-anti-reversao (24,87) → upsell-saque-imediato (19,83)
  → upsell-anti-erros (22,37) → upsell-saldo-duplicado (17,63)
  → processando-saque → sucesso
```

---

## Edge Functions

Duas funções em `supabase/functions/`:
- **generate-pix** — Cria transação na SigmaPay, salva no DB, retorna `pix_code`
- **check-payment** — Consulta DB + SigmaPay, atualiza status se pago

---

## Deps principais

`qrcode.react`, `framer-motion`, `@supabase/supabase-js`, `@tanstack/react-query`, `lucide-react`, `react-router-dom`

---

## Hooks chave

- `usePaymentFlow` — Orquestra geração PIX, polling, realtime, popup
- `usePixGeneration` — Gera PIX com cache sessionStorage 30min
- `usePaymentCheck` — Verificação manual de status
- `useLeadData` — Lê CPF/nome do sessionStorage
