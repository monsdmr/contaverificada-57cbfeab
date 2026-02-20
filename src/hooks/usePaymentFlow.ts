import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchasePixelOnce } from "@/lib/tiktokPixel";
import { usePixGeneration } from "@/hooks/usePixGeneration";
import { useLeadData } from "@/hooks/useLeadData";
import { generateRandomEmail } from "@/lib/generateRandomEmail";
import { generateRandomPhone } from "@/lib/generateRandomPhone";
import { PixPaymentData } from "@/components/funnel/types";

const REALTIME_GRACE_PERIOD_MS = 15 * 60 * 1000; // 15 minutes after popup closes

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

  // ─── Manual check state (botão "Já paguei") ──────────────────────────────
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const { generatePix, isGenerating, pixData } = usePixGeneration();
  const { leadCpf, leadName, leadEmail, leadPhone } = useLeadData();

  // Ref to track if payment was already confirmed (prevents double-fire)
  const didConfirmRef = useRef(false);
  // Ref to the grace-period timeout after popup closes
  const gracePeriodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to hold teardown function for the active channel+polling
  const teardownRef = useRef<(() => void) | null>(null);

  // ─── Core confirmation logic (shared by polling, realtime, recovery and manual check) ───
  const confirm = useCallback((source: string, transactionId: string, pixAmount: number) => {
    if (didConfirmRef.current) return;
    didConfirmRef.current = true;
    console.log(`[${contentId}] Payment confirmed (${source})`);

    if (transactionId && pixAmount) {
      trackPurchasePixelOnce({ transactionId, value: pixAmount, contentId });
    }

    // Always redirect, even if popup is already closed
    setShowPixPopup(false);
    setShowProcessing(true);
  }, [contentId]);

  // ─── Manual check — botão "Já paguei" usa confirm() para evitar double-redirect ───
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

  // ─── Keep Realtime + polling alive 5 min after popup closes ───
  useEffect(() => {
    if (!pixData?.transaction_id) return;

    const transactionId = pixData.transaction_id;
    const pixAmount = pixData.amount;

    // If popup just opened, reset confirmation guard and cancel any grace timer
    if (showPixPopup) {
      didConfirmRef.current = false;
      if (gracePeriodTimerRef.current) {
        clearTimeout(gracePeriodTimerRef.current);
        gracePeriodTimerRef.current = null;
      }
    }

    // Only start a new channel+polling if popup is open and none is active
    if (!showPixPopup) return;

    // Teardown any previous session
    if (teardownRef.current) {
      teardownRef.current();
      teardownRef.current = null;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const popupOpenedAt = Date.now();

    // Polling intervals by elapsed time since popup opened:
    // 0–2 min  → 5s
    // 2–5 min  → 15s
    // 5+ min   → 30s (max)
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

    // Initial check after 20s — tempo mínimo realista para abrir o banco e pagar
    const initialTimer = setTimeout(() => check('initial'), 20_000);

    // Smart polling com delay baseado no tempo decorrido desde abertura do popup
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        check('poll');
        if (!cancelled && !didConfirmRef.current) scheduleNext();
      }, getDelay());
    };
    scheduleNext();

    // Realtime: confirm instantly without extra API call
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

  // ─── Keep channel alive for REALTIME_GRACE_PERIOD_MS after popup closes ───
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (showPixPopup) return;
    if (didConfirmRef.current) return;
    if (!teardownRef.current) return;

    console.log(`[${contentId}] Popup closed, keeping realtime alive for ${REALTIME_GRACE_PERIOD_MS / 1000}s`);

    gracePeriodTimerRef.current = setTimeout(() => {
      console.log(`[${contentId}] Grace period expired, tearing down channel`);
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
  }, [showPixPopup, pixData, contentId]);

  // ─── Recovery ativo — verifica ao montar e periodicamente enquanto popup fechado ─
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (didConfirmRef.current) return;
    if (showPixPopup) return; // polling já cuida quando popup está aberto

    const transactionId = pixData.transaction_id;
    const pixAmount = pixData.amount;
    let cancelled = false;

    const runCheck = async () => {
      if (cancelled || didConfirmRef.current) return;
      try {
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        if (!error && data?.status === 'paid') {
          console.log(`[${contentId}] Recovery: PIX confirmed`);
          confirm('recovery', transactionId, pixAmount);
        }
      } catch {}
    };

    // Verificação imediata após 1,5s (mount recovery)
    const mountTimer = setTimeout(runCheck, 1500);

    // Polling leve a cada 20s enquanto popup está fechado mas ainda há PIX pendente
    const recoveryInterval = setInterval(runCheck, 20_000);

    return () => {
      cancelled = true;
      clearTimeout(mountTimer);
      clearInterval(recoveryInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixData?.transaction_id, showPixPopup]);

  const handleGeneratePix = useCallback(async (leadPixKey: string, leadPixKeyType: string) => {
    if (pixData) {
      setShowPixPopup(true);
      return;
    }

    // Garantir que strings "undefined" literais não vazem
    const cleanLeadName = (leadName && leadName !== 'undefined') ? leadName : undefined;
    const cleanLeadEmail = (leadEmail && leadEmail !== 'undefined' && leadEmail.includes('@')) ? leadEmail : undefined;
    const cleanLeadPhone = (leadPhone && leadPhone !== 'undefined') ? leadPhone : undefined;

    const emailToSend = leadPixKeyType === "E-mail" && leadPixKey
      ? leadPixKey
      : (cleanLeadEmail || generateRandomEmail(cleanLeadName));

    const phoneToSend = leadPixKeyType === "Celular" && leadPixKey
      ? leadPixKey.replace(/\D/g, "")
      : (cleanLeadPhone || generateRandomPhone());

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
      setShowPixPopup(true);
    }
  }, [pixData, generatePix, amount, leadName, leadCpf, leadEmail, leadPhone, paymentType, abVariant]);

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
