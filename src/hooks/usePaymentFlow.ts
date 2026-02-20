import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchasePixelOnce } from "@/lib/tiktokPixel";
import { usePaymentCheck } from "@/hooks/usePaymentCheck";
import { usePixGeneration } from "@/hooks/usePixGeneration";
import { useLeadData } from "@/hooks/useLeadData";
import { generateRandomEmail } from "@/lib/generateRandomEmail";
import { generateRandomPhone } from "@/lib/generateRandomPhone";
import { PixPaymentData } from "@/components/funnel/types";

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

  // Auto-check payment status via polling + realtime
  useEffect(() => {
    if (!showPixPopup || !pixData?.transaction_id) return;

    let cancelled = false;
    let didConfirm = false;

    const transactionId = pixData.transaction_id;
    const pixAmount = pixData.amount;

    const confirm = (source: string) => {
      if (didConfirm) return;
      didConfirm = true;
      console.log(`[${contentId}] Payment confirmed (${source})`);

      if (transactionId && pixAmount) {
        trackPurchasePixelOnce({ transactionId, value: pixAmount, contentId });
      }

      setShowPixPopup(false);
      setShowProcessing(true);
    };

    const check = async (source: string) => {
      if (cancelled || didConfirm) return;
      try {
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        if (!error && data?.status === 'paid') confirm(source);
      } catch {}
    };

    // Check after short initial delay
    setTimeout(() => check('initial'), 3000);

    // Conservative polling: 5s → 8s → 12s → 15s (max) to avoid SigmaPay 429
    let delay = 5000;
    const maxDelay = 15000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        check('poll');
        delay = Math.min(delay + 3000, maxDelay);
        if (!cancelled && !didConfirm) scheduleNext();
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
          confirm('realtime');
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [showPixPopup, pixData, contentId]);

  const handleGeneratePix = useCallback(async (leadPixKey: string, leadPixKeyType: string) => {
    if (pixData) {
      setShowPixPopup(true);
      return;
    }

    const emailToSend = leadPixKeyType === "E-mail" && leadPixKey
      ? leadPixKey
      : (leadEmail || generateRandomEmail(leadName || undefined));

    const phoneToSend = leadPixKeyType === "Celular" && leadPixKey
      ? leadPixKey.replace(/\D/g, "")
      : (leadPhone || generateRandomPhone());

    const result = await generatePix({
      amount,
      name: leadName || undefined,
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