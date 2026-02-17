import { useEffect, useMemo, useState } from "react";
import golBola from "@/assets/gol-bola.png";

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

interface PrizePopupProps {
  isOpen: boolean;
  onClose: () => void;
  prizeValue?: string;
  initialTime?: number;
}

const PrizePopup = ({
  isOpen,
  onClose,
  prizeValue = "R$ 2.834,72",
  initialTime = 899,
}: PrizePopupProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const targetPrize = useMemo(() => parsePtBrMoney(prizeValue), [prizeValue]);
  const [animatedPrize, setAnimatedPrize] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const durationMs = 900;
    const start = performance.now();
    setAnimatedPrize(0);
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      setAnimatedPrize(targetPrize * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, targetPrize]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[300px] flex flex-col items-center animate-popup">
        <div className="relative z-20 -mb-10">
          <img src={golBola} alt="Gol de Prêmios" className="h-24 w-auto object-contain drop-shadow-lg" loading="lazy" />
        </div>
        <div className="w-full overflow-hidden rounded-2xl border border-border shadow-xl prize-card">
          <div className="px-5 pb-5 pt-12">
            <h2 className="mb-1.5 text-center text-lg font-bold text-foreground">
              🎉 Prêmio de Carnaval 🎉
            </h2>
            <p className="mb-3 text-center text-[13px] leading-snug text-muted-foreground">
              Parabéns! Você ganhou um prêmio<br />
              especial da promoção de Carnaval! 🎊
            </p>
            <p className="mb-3 text-center text-3xl font-bold tracking-tight text-foreground">
              {formatBRL(animatedPrize)}
            </p>
            <div className="mb-4 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
              <span>Expira em</span>
              <div className="flex items-center gap-1">
                <span className="rounded bg-timer px-1.5 py-0.5 font-mono text-xs font-medium text-timer-foreground">{time.hours}</span>
                <span className="text-muted-foreground/60">:</span>
                <span className="rounded bg-timer px-1.5 py-0.5 font-mono text-xs font-medium text-timer-foreground">{time.minutes}</span>
                <span className="text-muted-foreground/60">:</span>
                <span className="rounded bg-timer px-1.5 py-0.5 font-mono text-xs font-medium text-timer-foreground">{time.seconds}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="prize-button w-full rounded-full py-3 text-base font-semibold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98]"
            >
              🎭 Resgatar Prêmio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizePopup;
