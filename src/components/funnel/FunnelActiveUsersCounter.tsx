import { useState, useEffect } from "react";

/** #18 - Contador de usuários ativos com variação leve */
const FunnelActiveUsersCounter = () => {
  const [count, setCount] = useState(() => 200 + Math.floor(Math.random() * 100));

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(180, Math.min(350, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      <div className="relative">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
      </div>
      <span className="text-gray-500 text-[11px]">
        <strong className="text-gray-700">{count} pessoas</strong> resgatando agora
      </span>
    </div>
  );
};

export default FunnelActiveUsersCounter;
