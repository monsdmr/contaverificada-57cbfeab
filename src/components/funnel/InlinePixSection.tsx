import { useRef, useEffect } from "react";
import { Copy, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import pixLogoFull from "@/assets/pix-logo-full.svg";
import { PixPaymentData } from "./types";

interface InlinePixSectionProps {
  pixData: PixPaymentData;
  amount: string;
  label: string;
  onCopy?: () => void;
  isCopied?: boolean;
  onManualCheck?: () => void;
  isCheckingPayment?: boolean;
  checkError?: string | null;
  accentColor?: string;
}

const InlinePixSection = ({
  pixData,
  amount,
  label,
  onCopy,
  isCopied,
  onManualCheck,
  isCheckingPayment,
  checkError,
  accentColor = "#E8505B",
}: InlinePixSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (pixData.pix_code && ref.current && !hasScrolled.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [pixData.pix_code]);

  if (!pixData.pix_code) return null;

  return (
    <div ref={ref} className="bg-white rounded-xl border-2 overflow-hidden" style={{ borderColor: accentColor }}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)` }}>
        <img src={pixLogoFull} alt="PIX" className="h-5 brightness-0 invert" />
        <span className="text-white/90 text-[11px] font-medium">Pagamento via PIX</span>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center gap-2.5 justify-center">
            {[{ n: "1", t: "Abra seu banco" }, { n: "2", t: "PIX Copia e Cola" }, { n: "3", t: "Cole e pague" }].map(s => (
              <div key={s.n} className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
                  <span className="text-white text-[9px] font-bold">{s.n}</span>
                </div>
                <p className="text-gray-600 text-[10px]">{s.t}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="w-40 h-40 mx-auto mb-2 bg-white p-2 border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
            <QRCodeSVG value={pixData.pix_code} size={144} level="M" />
          </div>
          <p className="text-xl font-bold text-gray-800">{amount}</p>
          <p className="text-gray-400 text-xs">{label}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-amber-500 animate-pulse rounded-full" />
          <span className="text-amber-700 text-xs font-medium">Aguardando pagamento...</span>
        </div>

        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-500 text-[10px] font-medium tracking-wide mb-1.5">CÓDIGO PIX COPIA E COLA</p>
          <p className="text-gray-600 text-[9px] break-all font-mono leading-relaxed">{pixData.pix_code}</p>
        </div>

        <button
          onClick={onCopy}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
          style={{ backgroundColor: "#2A9D5C", animation: isCopied ? "none" : "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
        >
          {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {isCopied ? "✓ Código copiado! Cole no seu banco" : "Copiar código PIX"}
        </button>

        {isCopied && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center -mt-1">
            <p className="text-blue-700 text-[11px] font-medium">📋 Agora abra o app do seu banco → PIX → Pix Copia e Cola → Cole o código</p>
          </div>
        )}

        {onManualCheck && (
          <button
            onClick={onManualCheck}
            disabled={isCheckingPayment}
            className="w-full py-3 rounded-xl bg-[#1A6FC4] text-white font-semibold text-sm hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isCheckingPayment ? (<><Loader2 className="w-4 h-4 animate-spin" />Verificando...</>) : (<><CheckCircle2 className="w-4 h-4" />Já paguei</>)}
          </button>
        )}

        {checkError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
            <span className="text-red-600 text-xs">{checkError}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-1">
          <Clock className="w-3.5 h-3.5 text-[#4CAF50]" />
          <span className="text-[#4CAF50] text-[11px] font-medium">Reembolso automático em 1 minuto</span>
        </div>
      </div>
    </div>
  );
};

export default InlinePixSection;
