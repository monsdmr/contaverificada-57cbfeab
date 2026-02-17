import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2, Shield, Wifi, CreditCard, UserCheck, BanknoteIcon, ShieldCheck, Clock } from "lucide-react";
import tiktokIcon from "@/assets/tiktok-icon.png";
import bacenLogo from "@/assets/bacen-logo.png";
import pixLogoFull from "@/assets/pix-logo-full.svg";

interface LocationState {
  pixKey?: string;
  pixKeyType?: string;
}

const steps = [
  { text: "Verificação de identidade recebida", icon: UserCheck, duration: 2200 },
  { text: "Validando dados do CPF na Receita Federal", icon: ShieldCheck, duration: 2600 },
  { text: "Confirmando pagamentos realizados", icon: CreditCard, duration: 2000 },
  { text: "Sincronizando com a sua conta PIX", icon: Wifi, duration: 2800 },
  { text: "Aplicando protocolos de segurança BACEN", icon: Shield, duration: 2200 },
  { text: "Processando seu saque via PIX", icon: BanknoteIcon, duration: 3000 },
  { text: "Finalizando liberação do saldo", icon: Clock, duration: 1800 },
];

const FunnelWithdrawProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasStarted = useRef(false);

  // Step progression
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        const duration = steps[stepIndex].duration;
        stepIndex++;
        setTimeout(advanceStep, duration);
      } else {
        // All steps done, navigate to success
        setTimeout(() => {
          navigate("/funil/sucesso", { state, replace: true });
        }, 800);
      }
    };

    advanceStep();
  }, [navigate, state]);

  // Smooth progress bar
  useEffect(() => {
    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 py-3.5 px-4 flex items-center justify-center gap-2">
        <img src={tiktokIcon} alt="TikTok" className="h-7" />
        <span className="text-white font-bold text-base tracking-tight">Processamento de Saque</span>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" style={{ animationDuration: "2s" }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            {progress < 100 ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-white" />
            )}
          </div>
        </div>

        <h1 className="text-xl font-black text-gray-900 mb-1 text-center">
          Processando seu saque
        </h1>
        <p className="text-emerald-600 text-2xl font-extrabold mb-2">R$ 2.834,72</p>
        <p className="text-gray-400 text-xs mb-6 text-center">
          Aguarde enquanto processamos sua solicitação
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-[11px] text-gray-400 mt-1 font-mono">{Math.round(progress)}%</p>
        </div>

        {/* Steps */}
        <div className="w-full max-w-xs space-y-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isPending ? "opacity-30" : "opacity-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-100"
                    : isActive
                    ? "bg-emerald-50 ring-2 ring-emerald-300"
                    : "bg-gray-100"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <span className={`text-sm transition-all duration-300 ${
                  isDone
                    ? "text-emerald-700 font-semibold"
                    : isActive
                    ? "text-gray-800 font-medium"
                    : "text-gray-400"
                }`}>
                  {s.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Trust section */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <img src={bacenLogo} alt="BACEN" className="w-4 h-4 object-contain opacity-50" />
            <span className="text-[10px] text-gray-400">BACEN</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <img src={pixLogoFull} alt="PIX" className="h-3 opacity-50" />
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-[10px] text-gray-400">SSL</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-300 mt-3 text-center">
          Não feche esta página durante o processamento
        </p>
      </div>
    </div>
  );
};

export default FunnelWithdrawProcessingPage;