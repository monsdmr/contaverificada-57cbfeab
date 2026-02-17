import coinIcon from "@/assets/coin-icon.svg";
import pixLogo from "@/assets/pix-logo.svg";

interface StickyBalanceBarProps {
  balance: string;
  onWithdraw?: () => void;
  timeLeft: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  isExpired?: boolean;
}

const StickyBalanceBar = ({ balance, onWithdraw, timeLeft, isExpired = false }: StickyBalanceBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500">
          {isExpired ? "Expirado" : "Expira em"}
        </span>
        <div className="flex items-center gap-1">
          <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-500">
            {timeLeft.hours}
          </span>
          <span className="text-gray-400 text-xs">:</span>
          <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-500">
            {timeLeft.minutes}
          </span>
          <span className="text-gray-400 text-xs">:</span>
          <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-500">
            {timeLeft.seconds}
          </span>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs text-gray-500 font-medium">Seu saldo</span>
              <img src={coinIcon} alt="Moeda" className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 tracking-tight">
              {balance}
            </p>
          </div>

          <button
            onClick={onWithdraw}
            className="relative rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <div className="absolute -top-2 right-1 bg-white rounded-md px-1 py-0.5 shadow-sm">
              <img src={pixLogo} alt="PIX" className="h-2.5 w-auto" />
            </div>
            Sacar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyBalanceBar;
