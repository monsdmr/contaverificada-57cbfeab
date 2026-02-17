import { useEffect, useState } from "react";
import { Clock, Copy, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import pixLogoFull from "@/assets/pix-logo-full.svg";
import bacenLogo from "@/assets/bacen-logo.png";
import govbrLogo from "@/assets/govbr-logo.webp";
import receitaFederalLogo from "@/assets/receita-federal-logo.png";

import { PixPopupProps } from "./types";

const FunnelPixPopup = ({ pixData, amount, title, onClose, onCopy, isCopied, showRefundMessage = false, onManualCheck, isCheckingPayment = false, checkError = null }: PixPopupProps) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [showUrgency, setShowUrgency] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        if (prev <= 300 && !showUrgency) setShowUrgency(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const transactionId = pixData?.transaction_id;
    if (!transactionId) return;
    const flagKey = `tt_ic_sent_${transactionId}`;
    if (sessionStorage.getItem(flagKey)) return;
    const ttq = (window as any).ttq;
    if (ttq?.track) {
      try {
        ttq.track("InitiateCheckout", { value: typeof pixData?.amount === "number" ? pixData.amount : undefined, currency: "BRL", content_id: "pix_payment", content_type: "product" });
      } catch (e) { console.warn("[TikTok] Failed to fire InitiateCheckout (pixel)", e); }
    }
    sessionStorage.setItem(flagKey, "1");
  }, [pixData?.transaction_id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 funnel-popup">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        
        <div className="sticky top-0 rounded-t-2xl overflow-hidden">
          <div className={`flex items-center justify-center gap-1.5 py-2 px-3 text-white text-xs font-bold tracking-wide ${timeLeft <= 60 ? 'bg-red-700' : timeLeft <= 120 ? 'bg-red-600' : timeLeft <= 180 ? 'bg-red-500' : 'bg-orange-500'}`}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{timeLeft <= 60 ? `🚨 ÚLTIMO MINUTO! ${formatTime(timeLeft)} — PAGUE AGORA OU PERCA` : timeLeft <= 120 ? `⚠️ RESTAM ${formatTime(timeLeft)} — SEU PIX VAI EXPIRAR!` : timeLeft <= 180 ? `⏳ ATENÇÃO: Tempo quase esgotado — ${formatTime(timeLeft)}` : `⏳ Pague em ${formatTime(timeLeft)} ou o PIX será cancelado`}</span>
          </div>
          <div className="bg-white flex items-center justify-between py-2 px-4 border-b border-gray-100">
            <img src={pixLogoFull} alt="PIX" className="h-5" />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1" aria-label="Fechar">×</button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] font-medium tracking-wide mb-2">COMO PAGAR</p>
            <div className="flex items-center gap-3">
              {[{ n: "1", t: "Abra seu banco" }, { n: "2", t: "PIX Copia e Cola" }, { n: "3", t: "Cole e pague" }].map(s => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#E8505B] flex items-center justify-center shrink-0"><span className="text-white text-[10px] font-bold">{s.n}</span></div>
                  <p className="text-gray-600 text-[11px]">{s.t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">Escaneie o QR Code ou copie o código PIX</p>
            {pixData?.pix_code ? (
              <div className="w-44 h-44 mx-auto mb-3 bg-white p-2 border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <QRCodeSVG value={pixData.pix_code} size={160} level="M" />
              </div>
            ) : (
              <div className="w-44 h-44 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            )}
            <p className="text-2xl font-bold text-gray-800">{amount}</p>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span className="text-amber-700 text-sm font-medium">Aguardando pagamento...</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] font-medium tracking-wide mb-2">CÓDIGO PIX COPIA E COLA</p>
            <p className="text-gray-600 text-[10px] break-all font-mono leading-relaxed">{pixData?.pix_code || 'Código não disponível'}</p>
          </div>

          <button onClick={onCopy} className="w-full py-3.5 rounded-xl bg-[#E8505B] text-white font-semibold text-sm hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />{isCopied ? 'Código copiado!' : 'Copiar código PIX'}
          </button>

          {onManualCheck && (
            <button onClick={onManualCheck} disabled={isCheckingPayment} className="w-full py-3.5 rounded-xl bg-[#2A9D5C] text-white font-semibold text-sm hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70">
              {isCheckingPayment ? (<><Loader2 className="w-4 h-4 animate-spin" />Verificando pagamento...</>) : (<><CheckCircle2 className="w-4 h-4" />Já paguei</>)}
            </button>
          )}

          {checkError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><span className="text-red-600 text-sm">{checkError}</span></div>}

          {showRefundMessage && (
            <div className="flex items-center justify-center gap-2 pt-2 pb-1"><Clock className="w-4 h-4 text-[#4CAF50]" /><span className="text-[#4CAF50] text-xs font-medium">Reembolso automático em 1 minuto</span></div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
            <img src={bacenLogo} alt="BACEN" className="h-8 object-contain" />
            <img src={govbrLogo} alt="gov.br" className="h-5 object-contain" />
            <img src={receitaFederalLogo} alt="Receita Federal" className="h-8 object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelPixPopup;
