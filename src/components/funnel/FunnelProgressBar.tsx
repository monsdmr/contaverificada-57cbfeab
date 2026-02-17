import { CheckCircle2 } from "lucide-react";

interface FunnelProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const FunnelProgressBar = ({ currentStep, totalSteps = 9 }: FunnelProgressBarProps) => {
  const remaining = totalSteps - currentStep;
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-500 text-[10px] font-medium">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
            {remaining === 0 ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Completo!
              </>
            ) : (
              `Faltam ${remaining} etapa${remaining > 1 ? 's' : ''} para liberar`
            )}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FunnelProgressBar;
