import { useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelUpsellSaldoDuplicado from "@/components/funnel/FunnelUpsellSaldoDuplicado";
import FunnelProcessingScreen from "@/components/funnel/FunnelProcessingScreen";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

interface LocationState { pixKey?: string; pixKeyType?: string; }

const FunnelUpsellSaldoDuplicadoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const leadPixKey = state?.pixKey || "";
  const leadPixKeyType = state?.pixKeyType || "E-mail";

  const handleProcessingComplete = useCallback(() => {
    navigate('/funil/processando-saque', { state: { pixKey: leadPixKey, pixKeyType: leadPixKeyType } });
  }, [navigate, leadPixKey, leadPixKeyType]);

  const flow = usePaymentFlow({
    contentId: 'upsell_saldo_duplicado',
    paymentType: 'upsell_saldo_duplicado',
    amount: 16.43,
    onProcessingComplete: handleProcessingComplete,
  });

  if (flow.showProcessing) {
    return <FunnelProcessingScreen onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <div className="fixed top-14 left-4 right-4 z-[90] flex justify-between">
        <Link to="/funil/upsell-anti-erros" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Link>
        <Link to="/funil/sucesso" state={{ pixKey: leadPixKey, pixKeyType: leadPixKeyType }} className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
          Próximo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <FunnelUpsellSaldoDuplicado
        balance="R$ 2.834,72"
        onGeneratePix={() => flow.handleGeneratePix(leadPixKey, leadPixKeyType)}
        isGenerating={flow.isGenerating}
        leadCpf={flow.leadCpf}
        leadName={flow.leadName}
        pixData={flow.pixData}
        onCopyPix={flow.handleCopyPixCode}
        isPixCopied={flow.pixCopied}
        onManualCheck={flow.checkPayment}
        isCheckingPayment={flow.isChecking}
        checkError={flow.checkError}
      />
    </div>
  );
};

export default FunnelUpsellSaldoDuplicadoPage;
