import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const TIMER_KEY = "funnel_timer_start";
const TIMER_DURATION = 7 * 60; // 7 minutes in seconds

const FunnelCountdownTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const stored = sessionStorage.getItem(TIMER_KEY);
    if (stored) {
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
      return Math.max(0, TIMER_DURATION - elapsed);
    }
    sessionStorage.setItem(TIMER_KEY, Date.now().toString());
    return TIMER_DURATION;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = sessionStorage.getItem(TIMER_KEY);
      if (!stored) return;
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
      setSecondsLeft(Math.max(0, TIMER_DURATION - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 120;
  const isExpired = secondsLeft <= 0;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 flex items-center justify-center gap-2 text-white text-xs font-bold transition-colors duration-300 ${isExpired ? "bg-red-700" : isUrgent ? "bg-red-600 animate-pulse" : "bg-red-500"}`}>
      {isExpired ? (
        <>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>⚠️ TEMPO ESGOTADO — SALDO PODE SER CANCELADO</span>
        </>
      ) : (
        <>
          <Clock className="w-3.5 h-3.5" />
          <span>⏳ SEU SALDO EXPIRA EM</span>
          <span className="bg-white/20 px-2 py-0.5 rounded font-mono text-sm tracking-wider">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </>
      )}
    </div>
  );
};

export default FunnelCountdownTimer;
