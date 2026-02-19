import { Loader2, ChevronRight, Shield } from "lucide-react";

interface StickyCtaBarProps {
  onClick: () => void;
  isGenerating: boolean;
  label: string;
  loadingLabel?: string;
  bgColor?: string;
  shadowColor?: string;
}

const StickyCtaBar = ({
  onClick,
  isGenerating,
  label,
  loadingLabel = "Gerando PIX...",
  bgColor = "bg-emerald-500",
  shadowColor = "shadow-emerald-500/30",
}: StickyCtaBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-gradient-to-t from-white via-white to-white/0 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onClick}
          disabled={isGenerating}
          className={`w-full py-4 rounded-xl ${bgColor} text-white font-bold text-[15px] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg ${shadowColor}`}
          style={{ animation: isGenerating ? 'none' : 'ctaPulse 2s ease-in-out infinite' }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingLabel}
            </>
          ) : (
            <>
              {label}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="flex items-center justify-center gap-1 mt-1.5 text-gray-300 text-[10px]">
          <Shield className="w-3 h-3" />
          Pagamento seguro via PIX • Reembolso garantido
        </p>
      </div>
    </div>
  );
};

export default StickyCtaBar;
