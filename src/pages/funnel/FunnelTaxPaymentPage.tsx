import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FunnelPixPopup from "@/components/funnel/FunnelPixPopup";

const FunnelTaxPaymentPage = () => {
  const [isCopied, setIsCopied] = useState(false);

  const mockPixData = {
    transaction_id: "mock-tax-123",
    pix_code: "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540537.355802BR5925USUARIO TESTE6009SAO PAULO62140510mock123456630456E2",
    pix_qr_code_base64: "",
    amount: 34.71,
    status: "pending",
  };

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-4">
          <Link
            to="/funil/confirmar-taxa"
            className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Link>
          <Link
            to="/funil/upsell-tenf"
            className="flex items-center gap-1 text-white text-sm bg-black/30 px-3 py-1 rounded-full"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <FunnelPixPopup
          pixData={mockPixData}
          amount="R$ 34,71"
          title="Taxa de Processamento"
          onClose={() => {}}
          onCopy={handleCopy}
          isCopied={isCopied}
        />
      </div>
    </div>
  );
};

export default FunnelTaxPaymentPage;
