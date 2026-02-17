import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelPixPopup from "@/components/funnel/FunnelPixPopup";
import { supabase } from "@/integrations/supabase/client";

const FunnelBonusOcultoPaymentPage = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const mockPixData = {
    transaction_id: "mock-bonus-oculto-111",
    pix_code: "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540514.935802BR5925USUARIO TESTE6009SAO PAULO62140510mock111222630456E2",
    pix_qr_code_base64: "",
    amount: 14.91,
    status: "pending",
  };

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleManualCheck = useCallback(async () => {
    setIsChecking(true);
    setCheckError(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-payment', {
        body: { transaction_id: mockPixData.transaction_id }
      });
      if (error) throw error;
      if (data?.status !== 'paid') {
        setCheckError("Pagamento ainda não identificado. Tente novamente em alguns segundos.");
      }
    } catch {
      setCheckError("Erro ao verificar. Tente novamente.");
    } finally {
      setIsChecking(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-4">
          <Link to="/funil/upsell-bonus-oculto" className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Link>
          <Link to="/funil/upsell-anti-reversao" className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
            Próximo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FunnelPixPopup
          pixData={mockPixData}
          amount="R$ 14,91"
          title="Bônus Oculto"
          onClose={() => {}}
          onCopy={handleCopy}
          isCopied={isCopied}
          showRefundMessage
          onManualCheck={handleManualCheck}
          isCheckingPayment={isChecking}
          checkError={checkError}
        />
      </div>
    </div>
  );
};

export default FunnelBonusOcultoPaymentPage;
