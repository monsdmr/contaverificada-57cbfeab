import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchasePixelOnce } from "@/lib/tiktokPixel";
import { usePixGeneration } from "@/hooks/usePixGeneration";
import { useLeadData } from "@/hooks/useLeadData";
import { generateRandomEmail } from "@/lib/generateRandomEmail";
import { generateRandomPhone } from "@/lib/generateRandomPhone";
import { PixPaymentData } from "@/components/funnel/types";

// Quanto tempo o canal Realtime fica vivo após fechar o popup
const REALTIME_GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 min (era 15 min)

// Após quanto tempo o recovery polling desiste completamente
const RECOVERY_MAX_DURATION_MS = 10 * 60 * 1000; // 10 min

interface UsePaymentFlowOptions {
  contentId: string;
  paymentType: string;
  amount: number;
  onProcessingComplete: () => void;
  abVariant?: string;
}

export const usePaymentFlow = ({ contentId, paymentType, amount, onProcessingComplete, abVariant }: UsePaymentFlowOptions) => {
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const { generatePix, isGenerating, pixData } = usePixGeneration();
  const { leadCpf, leadName, leadEmail, leadPhone } = useLeadData();

  // Trava de confirmação única — nunca é resetada após confirmada
  const didConfirmRef = useRef(false);
  // Timer do grace period
  const gracePeriodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Teardown do canal+polling ativo
  const teardownRef = useRef<(() => void) | null>(null);
  // Quando o PIX foi gerado — usado pelo recovery para saber se já expirou
  const pixGeneratedAtRef = useRef<number | null>(null);

  // ─── Core confirmation (único ponto de redirect — sem duplicatas) ─────────
  const confirm = useCallback((source: string, transactionId: string, pixAmount: number) => {
    if (didConfirmRef.current) return;
    didConfirmRef.current = true;

    if (transactionId && pixAmount) {
      trackPurchasePixelOnce({ transactionId, value: pixAmount, contentId });
    }

    setShowPixPopup(false);
    setShowProcessing(true);
  }, [contentId]);

  // ─── Botão "Já paguei" ────────────────────────────────────────────────────
  const checkPayment = useCallback(async () => {
    if (!pixData?.transaction_id) {
      setCheckError("Nenhuma transação encontrada.");
      return;
    }
    setIsChecking(true);
    setCheckError(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-payment', {
        body: { transaction_id: pixData.transaction_id }
      });
      if (error) {
        setCheckError("Erro ao verificar pagamento. Tente novamente.");
        return;
      }
      if (data?.status === 'paid') {
        confirm('manual', pixData.transaction_id, pixData.amount);
      } else {
        setCheckError("Pagamento ainda não confirmado. Aguarde ou tente novamente.");
      }
    } catch {
      setCheckError("Erro ao verificar pagamento. Tente novamente.");
    } finally {
      setIsChecking(false);
    }
  }, [pixData, confirm]);

  // ─── Polling + Realtime (ativo apenas com popup aberto) ───────────────────
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (!showPixPopup) return;
    if (didConfirmRef.current) return;

    // Cancela grace period pendente ao reabrir popup
    if (gracePeriodTimerRef.current) {
      clearTimeout(gracePeriodTimerRef.current);
      gracePeriodTimerRef.current = null;
    }

    // Teardown de sessão anterior antes de iniciar nova
    if (teardownRef.current) {
      teardownRef.current();
      teardownRef.current = null;
    }

    const transactionId = pixData.transaction_id;
    const pixAmount = pixData.amount;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const popupOpenedAt = Date.now();

    // Intervalo baseado no tempo decorrido desde abertura do popup:
    // 0–2 min  → 5s  (janela principal de pagamento)
    // 2–5 min  → 15s (usuário ainda pode estar no banco)
    // 5+ min   → 30s (manutenção mínima, realtime cuida do resto)
    const getDelay = () => {
      const elapsed = Date.now() - popupOpenedAt;
      if (elapsed < 2 * 60 * 1000) return 5_000;
      if (elapsed < 5 * 60 * 1000) return 15_000;
      return 30_000;
    };

    const check = async (source: string) => {
      if (cancelled || didConfirmRef.current) return;
      try {
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        if (!error && data?.status === 'paid') {
          confirm(source, transactionId, pixAmount);
        }
      } catch {}
    };

    // Primeiro check após 20s — mínimo realista para pagar no banco
    const initialTimer = setTimeout(() => check('initial'), 20_000);

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        check('poll');
        if (!cancelled && !didConfirmRef.current) scheduleNext();
      }, getDelay());
    };
    scheduleNext();

    // Realtime — detecta pagamento instantaneamente via webhook
    const channel = supabase
      .channel(`payment-${contentId}-${transactionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pix_payments',
        filter: `transaction_id=eq.${transactionId}`
      }, (payload) => {
        if (payload.new?.status === 'paid' || payload.new?.status === 'approved') {
          confirm('realtime', transactionId, pixAmount);
        }
      })
      .subscribe();

    const teardown = () => {
      cancelled = true;
      clearTimeout(initialTimer);
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };

    teardownRef.current = teardown;
    return teardown;
  }, [showPixPopup, pixData, contentId, confirm]);

  // ─── Grace period: mantém canal vivo por 5 min após fechar popup ──────────
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (showPixPopup) return;
    if (didConfirmRef.current) return;
    if (!teardownRef.current) return;

    gracePeriodTimerRef.current = setTimeout(() => {
      if (teardownRef.current) {
        teardownRef.current();
        teardownRef.current = null;
      }
    }, REALTIME_GRACE_PERIOD_MS);

    return () => {
      if (gracePeriodTimerRef.current) {
        clearTimeout(gracePeriodTimerRef.current);
        gracePeriodTimerRef.current = null;
      }
    };
  }, [showPixPopup, pixData]);

  // ─── Recovery: verifica periodicamente enquanto popup fechado ─────────────
  // Só roda se há PIX pendente, popup fechado e dentro do tempo máximo
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (didConfirmRef.current) return;
    if (showPixPopup) return;

    const transactionId = pixData.transaction_id;
    const pixAmount = pixData.amount;
    const startedAt = Date.now();
    let cancelled = false;

    const runCheck = async () => {
      if (cancelled || didConfirmRef.current) return;

      // Para de tentar após RECOVERY_MAX_DURATION_MS
      if (Date.now() - startedAt > RECOVERY_MAX_DURATION_MS) {
        cancelled = true;
        clearInterval(recoveryInterval);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        if (!error && data?.status === 'paid') {
          confirm('recovery', transactionId, pixAmount);
        }
      } catch {}
    };

    // Primeiro check após 10s (não 1,5s — evita request desnecessário no mount)
    const mountTimer = setTimeout(runCheck, 10_000);

    // Polling leve a cada 30s (não 20s) — realtime já cobre os casos rápidos
    const recoveryInterval = setInterval(runCheck, 30_000);

    return () => {
      cancelled = true;
      clearTimeout(mountTimer);
      clearInterval(recoveryInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixData?.transaction_id, showPixPopup]);

  // ─── Gerar PIX ────────────────────────────────────────────────────────────
  const handleGeneratePix = useCallback(async (leadPixKey: string, leadPixKeyType: string) => {
    if (pixData) {
      setShowPixPopup(true);
      return;
    }

    // Dados reais do usuário — sanitizados
    const cleanLeadName = (leadName && leadName !== 'undefined' && leadName.trim().length >= 3)
      ? leadName.trim()
      : undefined;

    const cleanLeadEmail = (leadEmail && leadEmail !== 'undefined' && leadEmail.includes('@') && leadEmail.includes('.'))
      ? leadEmail.trim().toLowerCase()
      : undefined;

    const cleanLeadPhone = (leadPhone && leadPhone !== 'undefined' && leadPhone.replace(/\D/g, '').length === 11)
      ? leadPhone.replace(/\D/g, '')
      : undefined;

    // E-mail: prioridade = chave PIX > dado real > gerado com base no nome real
    const emailToSend =
      (leadPixKeyType === "E-mail" && leadPixKey && leadPixKey.includes('@'))
        ? leadPixKey.trim().toLowerCase()
        : (cleanLeadEmail || generateRandomEmail(cleanLeadName));

    // Telefone: prioridade = chave PIX > dado real > gerado aleatório realista
    const phoneToSend =
      (leadPixKeyType === "Celular" && leadPixKey)
        ? leadPixKey.replace(/\D/g, '')
        : (cleanLeadPhone || generateRandomPhone());

    // Persiste telefone gerado para consistência em upsells seguintes
    if (!cleanLeadPhone && phoneToSend) {
      sessionStorage.setItem('lead_phone', phoneToSend);
    }

    const result = await generatePix({
      amount,
      name: cleanLeadName,
      email: emailToSend,
      cpf: leadCpf || undefined,
      phone: phoneToSend,
      payment_type: paymentType,
      ab_variant: abVariant,
    });

    if (result) {
      pixGeneratedAtRef.current = Date.now();
      setShowPixPopup(true);
    }
  }, [pixData, generatePix, amount, leadName, leadCpf, leadEmail, leadPhone, paymentType, abVariant]);


  // ─── Copiar código PIX ────────────────────────────────────────────────────
  const handleCopyPixCode = useCallback(() => {
    if (pixData?.pix_code) {
      navigator.clipboard.writeText(pixData.pix_code).catch(() => {
        try {
          const el = document.createElement("textarea");
          el.value = pixData.pix_code!;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.focus();
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        } catch {}
      });
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 8000);
    }
  }, [pixData]);

  return {
    showPixPopup,
    setShowPixPopup,
    pixCopied,
    showProcessing,
    isGenerating,
    pixData,
    leadCpf,
    leadName,
    leadEmail,
    leadPhone,
    isChecking,
    checkError,
    checkPayment,
    handleGeneratePix,
    handleCopyPixCode,
    onProcessingComplete,
  };
};
