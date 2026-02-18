import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

/** #17 - Selo de segurança animado com verificação */
const FunnelSecurityBadge = () => {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVerified(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex items-center justify-center gap-2 py-2 transition-all duration-500 ${verified ? "opacity-100" : "opacity-60"}`}>
      <div className={`flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 transition-all duration-700 ${verified ? "scale-100" : "scale-95"}`}>
        <ShieldCheck className={`w-4 h-4 transition-colors duration-500 ${verified ? "text-emerald-600" : "text-gray-400"}`} />
        <span className={`text-[11px] font-semibold transition-colors duration-500 ${verified ? "text-emerald-700" : "text-gray-400"}`}>
          {verified ? "Ambiente verificado e seguro ✓" : "Verificando segurança..."}
        </span>
      </div>
    </div>
  );
};

export default FunnelSecurityBadge;
