import { useState, useEffect } from "react";
import { Check, Loader2, Shield, ChevronRight, AlertCircle } from "lucide-react";
import serasaBanner from "@/assets/serasa-limpa-nome.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import FunnelSecurityBadge from "./FunnelSecurityBadge";
import FunnelActiveUsersCounter from "./FunnelActiveUsersCounter";

interface FunnelUpsellTransacionalProps { balance: string; pixName: string; pixKey: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }

const FunnelUpsellTransacional = ({ balance, pixName, pixKey, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellTransacionalProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F5F0F6] overflow-y-auto">
      <div className="bg-[#ED1164] pt-3 pb-4 px-4"><div className="flex items-center justify-center mb-4"><img src={serasaBanner} alt="Serasa Limpa Nome" className="h-20 object-contain" /></div></div>
      <main className="px-4 -mt-6 space-y-3 max-w-md mx-auto pb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-gray-900 text-base font-bold mb-2">{leadCpf ? `CPF ${leadCpf} possui pendência no Serasa` : "Seu CPF possui uma pendência no Serasa"}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-3">Débito pendente de <strong className="text-gray-700">R$ 33,41</strong>. Enquanto não quitado, <strong className="text-gray-700">nenhuma transferência acima de R$ 1.000 pode ser processada</strong>.</p>
          <p className="text-gray-500 text-xs font-semibold mb-2">Ao quitar agora:</p>
          <div className="space-y-2 mb-3">
            {["Remoção imediata da restrição", "Liberação do saque de " + balance, "CPF limpo em todas as consultas", "Comprovante de quitação na hora"].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-[#FDE8F0] rounded-lg px-3 py-2"><div className="w-5 h-5 rounded-full bg-[#ED1164] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div><span className="text-gray-700 text-xs">{item}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Valor da quitação</span><span className="bg-[#FDE8F0] text-[#ED1164] text-[10px] font-bold px-2 py-0.5 rounded-full">-84%</span></div>
          <div className="flex items-baseline gap-2 mb-1"><span className="text-red-400 text-base line-through font-semibold">R$ 159,90</span><span className="text-gray-900 text-2xl font-extrabold">R$ 33,41</span></div>
          <p className="text-green-600 text-[11px] font-medium mb-4">Quitação instantânea + saque liberado</p>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-[#ED1164] text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-pink-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>
            {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>Quitar Serasa e liberar saque<ChevronRight className="w-4 h-4" /></>)}
          </button>
          <FunnelSecurityBadge />
        </div>
        <FunnelActiveUsersCounter />
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-900 font-bold text-sm mb-3">Quem quitou, já sacou</p>
          <div className="space-y-3">
            {[{ img: testimonial1, name: "Fernanda G.", amount: "R$ 2.741", text: "Quitei e em 3 minutos o saque caiu." }, { img: testimonial2, name: "Marcos V.", amount: "R$ 3.102", text: "Quitei e recebi tudo em 5 minutos." }, { img: testimonial3, name: "Bruno S.", amount: "R$ 2.834", text: "Paguei R$ 26 e recebi quase R$ 3.000." }].map((t, i) => (
              <div key={i}>{i > 0 && <div className="border-t border-gray-50" />}<div className="flex items-start gap-3"><img src={t.img} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" loading="lazy" /><div className="flex-1"><div className="flex items-center justify-between"><p className="text-gray-800 text-xs font-semibold">{t.name}</p><span className="text-green-600 text-[10px] font-bold">{t.amount} ✓</span></div><p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">"{t.text}"</p></div></div></div>
            ))}
          </div>
        </div>
        <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-[#ED1164] text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-pink-200" style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}>
          {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>Quitar e liberar saque<ChevronRight className="w-4 h-4" /></>)}
        </button>
        <p className="text-gray-400 text-[10px] text-center pb-2">Regulamentado pelo Banco Central do Brasil</p>
      </main>
      <style>{`@keyframes ctaPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(237,17,100,0.3); } 50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(237,17,100,0.5); } }`}</style>
    </div>
  );
};

export default FunnelUpsellTransacional;
