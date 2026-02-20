import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchasePixelOnce } from "@/lib/tiktokPixel";
import { usePaymentCheck } from "@/hooks/usePaymentCheck";
import { usePixGeneration } from "@/hooks/usePixGeneration";
import { useLeadData } from "@/hooks/useLeadData";
import { generateRandomEmail } from "@/lib/generateRandomEmail";
import { generateRandomPhone } from "@/lib/generateRandomPhone";
import { PixPaymentData } from "@/components/funnel/types";

const REALTIME_GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes after popup closes

interface UsePaymentFlowOptions {
  contentId: string;
  paymentType: string;
  amount: number;
  onProcessingComplete: () => void;
}

export const usePaymentFlow = ({ contentId, paymentType, amount, onProcessingComplete }: UsePaymentFlowOptions) => {
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const { generatePix, isGenerating, pixData } = usePixGeneration();
  const { leadCpf, leadName, leadEmail, leadPhone } = useLeadData();

  // Ref to track if payment was already confirmed (prevents double-fire)
  const didConfirmRef = useRef(false);
  // Ref to the grace-period timeout after popup closes
  const gracePeriodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to hold teardown function for the active channel+polling
  const teardownRef = useRef<(() => void) | null>(null);

  const handlePaymentConfirmed = useCallback(async () => {
    if (pixData?.transaction_id && pixData?.amount) {
      trackPurchasePixelOnce({
        transactionId: pixData.transaction_id,
        value: pixData.amount,
        contentId,
      });
    }
    setShowPixPopup(false);
    setShowProcessing(true);
  }, [pixData, contentId]);

  const { isChecking, checkError, checkPayment } = usePaymentCheck({
    transactionId: pixData?.transaction_id,
    onPaymentConfirmed: handlePaymentConfirmed,
  });

  // ─── Core confirmation logic (shared by polling, realtime and recovery) ───
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

  // ─── FIX 1 & 3: Keep Realtime + polling alive 5 min after popup closes ───
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
    let delay = 5000;
    const maxDelay = 15000;

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

    // Initial check after short delay
    setTimeout(() => check('initial'), 3000);

    // Conservative polling: 5s → 8s → 12s → 15s (max) to avoid SigmaPay 429
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        check('poll');
        delay = Math.min(delay + 3000, maxDelay);
        if (!cancelled && !didConfirmRef.current) scheduleNext();
      }, delay);
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
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };

    teardownRef.current = teardown;
    return teardown;
  }, [showPixPopup, pixData, contentId, confirm]);

  // ─── Keep channel alive for REALTIME_GRACE_PERIOD_MS after popup closes ───
  // When popup closes but we haven't confirmed, start a grace timer
  // that only tears down after 5 minutes (so webhook can still redirect)
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (showPixPopup) return; // popup is open, the main effect handles it
    if (didConfirmRef.current) return; // already confirmed, nothing to do
    if (!teardownRef.current) return; // no active session to preserve

    // Popup just closed without confirmation — start grace period
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

  // ─── FIX 2: Recovery — check payment status on page load ─────────────────
  useEffect(() => {
    if (!pixData?.transaction_id) return;
    if (didConfirmRef.current) return;

    const transactionId = pixData.transaction_id;
    const pixAmount = pixData.amount;

    // Check immediately on mount if there's a cached PIX
    const runRecovery = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        if (!error && data?.status === 'paid') {
          console.log(`[${contentId}] Recovery: PIX already paid on mount`);
          confirm('recovery', transactionId, pixAmount);
        }
      } catch {}
    };

    // Small delay to avoid racing with the main popup flow
    const t = setTimeout(runRecovery, 1500);
    return () => clearTimeout(t);
  }, [pixData?.transaction_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGeneratePix = useCallback(async (leadPixKey: string, leadPixKeyType: string) => {
    if (pixData) {
      setShowPixPopup(true);
      return;
    }

    // FIX #3: garantir que "undefined" literal não vaze como string
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
    });

    if (result) {
      setShowPixPopup(true);
    }
  }, [pixData, generatePix, amount, leadName, leadCpf, leadEmail, leadPhone, paymentType]);

  const handleCopyPixCode = useCallback(() => {
    if (pixData?.pix_code) {
      navigator.clipboard.writeText(pixData.pix_code).catch(() => {
        // Fallback for browsers that block clipboard (especially mobile WebView)
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
