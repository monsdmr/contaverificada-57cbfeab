import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useLocation } from "react-router-dom";

const TIMER_DURATION = 3 * 60; // 3 minutes per upsell step

const FunnelCountdownTimer = () => {
  const location = useLocation();
  const currentStep = location.pathname.split("/").pop() || "unknown";

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const timerKey = `funnel_timer_${currentStep}`;
    const stored = sessionStorage.getItem(timerKey);
    if (stored) {
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
      return Math.max(0, TIMER_DURATION - elapsed);
    }
    sessionStorage.setItem(timerKey, Date.now().toString());
    return TIMER_DURATION;
  });

  useEffect(() => {
    const timerKey = `funnel_timer_${currentStep}`;
    const interval = setInterval(() => {
      const stored = sessionStorage.getItem(timerKey);
      if (!stored) return;
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
      setSecondsLeft(Math.max(0, TIMER_DURATION - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 120;
  const isExpired = secondsLeft <= 0;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9998] py-1 px-3 flex items-center justify-center gap-1.5 text-white text-[10px] font-bold transition-colors duration-300 ${isExpired ? "bg-red-700" : isUrgent ? "bg-red-600 animate-pulse" : "bg-red-500"}`}>
      {isExpired ? (
        <>
          <AlertTriangle className="w-3 h-3" />
          <span>TEMPO ESGOTADO — SALDO PODE SER CANCELADO</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span>SALDO EXPIRA EM</span>
          <span className="bg-white/20 px-1.5 py-px rounded font-mono text-[11px] tracking-wider">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </>
      )}
    </div>
  );
};

export default FunnelCountdownTimer;
