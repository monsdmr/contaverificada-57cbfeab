import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

const FunnelExitIntent = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleBack = useCallback((e: PopStateEvent) => {
    if (dismissed) return;
    e.preventDefault();
    window.history.pushState(null, "", window.location.href);
    setShow(true);
  }, [dismissed]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [handleBack]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-4" onClick={handleDismiss}>
      <div className="bg-white rounded-2xl p-5 max-w-[320px] w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <h3 className="text-gray-900 text-sm font-bold text-center mb-1.5">
          Tem certeza que quer sair?
        </h3>
        <p className="text-gray-500 text-xs text-center leading-relaxed mb-4">
          Seu saldo será <strong className="text-red-600">cancelado permanentemente</strong> se você sair agora. Essa oferta não estará disponível depois.
        </p>
        <button
          onClick={handleDismiss}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-emerald-200"
        >
          Continuar e garantir meu saldo →
        </button>
        <button onClick={handleDismiss} className="w-full mt-2 py-2 text-gray-400 text-[11px]">
          Sair e perder o saldo
        </button>
      </div>
    </div>
  );
};

export default FunnelExitIntent;
