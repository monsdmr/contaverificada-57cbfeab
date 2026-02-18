import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Shield, Banknote, RefreshCw, BarChart3, Fingerprint } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";

interface FunnelProcessingScreenProps {
  onComplete: () => void;
  balance?: string;
}

const steps = [
  { text: "Pagamento recebido com sucesso", icon: Banknote, delay: 1200 },
  { text: "Sincronizando sua conta...", icon: RefreshCw, delay: 1400 },
  { text: "Verificando seu engajamento na plataforma", icon: BarChart3, delay: 1600 },
  { text: "Validando identidade do titular", icon: Fingerprint, delay: 1200 },
  { text: "Preparando liberação do saque", icon: CheckCircle2, delay: 1000 },
];

const FunnelProcessingScreen = ({ onComplete, balance = "R$ 2.834,72" }: FunnelProcessingScreenProps) => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let cancelled = false;

    const advance = () => {
      if (cancelled) return;
      if (stepIndex < steps.length) {
        const delay = steps[stepIndex].delay;
        stepIndex++;
        setTimeout(() => {
          if (cancelled) return;
          setCompletedSteps(stepIndex);
          advance();
        }, delay);
      } else {
        setTimeout(() => {
          if (!cancelled) onComplete();
        }, 800);
      }
    };

    advance();
    return () => { cancelled = true; };
  }, [onComplete]);

  // Smooth progress bar
  useEffect(() => {
    const totalDuration = steps.reduce((sum, s) => sum + s.delay, 0);
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
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center font-['Inter',system-ui,sans-serif]">
      {/* Header */}
      <header className="w-full py-3.5 px-4 flex items-center justify-center gap-2 border-b border-gray-100">
        <img src={tiktokLogo} alt="TikTok" className="h-6 object-contain" />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        {/* Animated circle */}
        <div className="relative w-20 h-20 mb-5">
          <div
            className="absolute inset-0 rounded-full border-[3px] border-gray-100"
          />
          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent"
            style={{
              borderTopColor: "#10b981",
              borderRightColor: "rgba(16, 185, 129, 0.3)",
              animation: isComplete ? "none" : "spin 1s linear infinite",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isComplete ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            ) : (
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            )}
          </div>
        </div>

        <h2 className="text-gray-900 text-[17px] font-bold mb-0.5 text-center">
          {isComplete ? "Saque em processamento!" : "Finalizando seu saque"}
        </h2>
        <p className="text-emerald-600 text-xl font-extrabold mb-1">{balance}</p>
        <p className="text-gray-400 text-xs mb-6">
          {isComplete ? "Redirecionando..." : "Aguarde, não feche esta página"}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mb-6">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear bg-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">{completedSteps}/{steps.length} etapas</span>
            <span className="text-[10px] text-gray-400 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full max-w-xs space-y-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < completedSteps;
            const isActive = i === completedSteps && !isComplete;
            
            return (
              <div
                key={i}
                className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-50 border border-emerald-100"
                    : isDone
                    ? "bg-transparent"
                    : "bg-transparent opacity-40"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-100"
                    : isActive
                    ? "bg-emerald-100"
                    : "bg-gray-100"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </div>
                <span className={`text-[13px] transition-all duration-300 ${
                  isDone
                    ? "text-emerald-600 font-medium"
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
      </div>

      {/* Footer */}
      <div className="pb-6 flex items-center gap-1.5">
        <Shield className="w-3 h-3 text-gray-300" />
        <span className="text-gray-400 text-[10px]">Ambiente seguro • Dados criptografados</span>
      </div>
    </div>
  );
};

export default FunnelProcessingScreen;
