import { useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelUpsellTENF from "@/components/funnel/FunnelUpsellTENF";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

// Variante B vencedora do A/B test: R$ 43,17 (32,1% de conversão)
const TENF_AMOUNT = 43.17;
const TENF_PRICE = "R$ 43,17";
const TENF_ANCHOR = "R$ 99,90";
const TENF_DISCOUNT = "57% OFF";

interface LocationState { pixKey?: string; pixKeyType?: string; }

const FunnelUpsellTENFPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-transacional', { state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType } });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const flow = usePaymentFlow({
    contentId: 'upsell_tenf',
    paymentType: 'upsell_tenf',
    amount: TENF_AMOUNT,
    onProcessingComplete: handleProcessingComplete,
    abVariant: 'tenf_B_44',
  });

  if (flow.showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black/50 flex flex-col items-center justify-end pb-0">
      <div className="w-full max-w-md">
        <div className="flex justify-between px-4 mb-2">
          <Link to="/funil/confirmar-identidade" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Link>
          <Link to="/funil/upsell-transacional" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
            Próximo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FunnelUpsellTENF
          balance="R$ 2.834,72"
          onGeneratePix={() => flow.handleGeneratePix(leadPixKey, leadPixKeyType)}
          isGenerating={flow.isGenerating}
          leadCpf={flow.leadCpf}
          leadName={flow.leadName}
          price={TENF_PRICE}
          anchorPrice={TENF_ANCHOR}
          discountLabel={TENF_DISCOUNT}
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

export default FunnelUpsellTENFPage;
