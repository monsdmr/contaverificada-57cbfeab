import { useState, useEffect, useMemo } from "react";
import coinIcon from "@/assets/coin-icon.svg";
import pixLogo from "@/assets/pix-logo.svg";

const parsePtBrMoney = (value: string) => {
  const cleaned = value.replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(value)
    .replace(/\u00A0/g, " ");

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface BalanceCardProps {
  balance: string;
  onWithdraw?: () => void;
  animateValue?: boolean;
}

const BalanceCard = ({ balance, onWithdraw, animateValue = true }: BalanceCardProps) => {
  const targetBalance = useMemo(() => parsePtBrMoney(balance), [balance]);
  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    if (!animateValue) {
      setAnimatedBalance(targetBalance);
      return;
    }

    const durationMs = 1200;
    const start = performance.now();
    setAnimatedBalance(0);

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      setAnimatedBalance(targetBalance * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateValue, targetBalance]);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs text-gray-600 font-medium">Seu saldo</span>
            <img src={coinIcon} alt="Moeda" className="h-4 w-4" />
          </div>
          <p className="text-[22px] font-bold text-gray-900 tracking-tight">
            {formatBRL(animatedBalance)}
          </p>
        </div>

        <button
          onClick={onWithdraw}
          className="relative rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white transition-all hover:brightness-105 active:scale-[0.98] animate-[ctaPulse_2s_ease-in-out_infinite]"
        >
          {/* PIX badge */}
          <div className="absolute -top-1.5 right-1.5 bg-white rounded-md px-0.5 py-0.5 shadow-sm">
            <img src={pixLogo} alt="PIX" className="h-2.5 w-auto" />
          </div>
          Sacar
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;
