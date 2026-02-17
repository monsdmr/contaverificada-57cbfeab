import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "./BalanceCard";
import CongratulationsCard from "./CongratulationsCard";
import CheckInSection from "./CheckInSection";
import TaskItem from "./TaskItem";
import ProgressTask from "./ProgressTask";
import PrizePopup from "./PrizePopup";
import StickyBalanceBar from "./StickyBalanceBar";
import CarnivalConfetti from "./CarnivalConfetti";

// Isolated countdown to avoid re-rendering the whole tree every second
const CountdownBar = memo(() => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const timeLeft = formatTime(timeLeftSeconds);
  const isExpired = timeLeftSeconds === 0;

  return (
    <div className="flex items-center justify-center gap-2 py-2.5 bg-white border-b border-gray-100">
      <span className="text-[13px] text-gray-500">{isExpired ? "Expirado" : "Expira em"}</span>
      <div className="flex items-center gap-1">
        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[13px] text-gray-500">{timeLeft.hours}</span>
        <span className="text-gray-400">:</span>
        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[13px] text-gray-500">{timeLeft.minutes}</span>
        <span className="text-gray-400">:</span>
        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[13px] text-gray-500">{timeLeft.seconds}</span>
      </div>
    </div>
  );
});
CountdownBar.displayName = "CountdownBar";

// Isolated sticky bar with its own timer
const StickyBarWrapper = memo(({ onWithdraw }: { onWithdraw: () => void }) => {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  if (!showStickyBar) return null;

  const timeLeft = formatTime(timeLeftSeconds);
  const isExpired = timeLeftSeconds === 0;

  return <StickyBalanceBar balance="R$ 2.834,72" onWithdraw={onWithdraw} timeLeft={timeLeft} isExpired={isExpired} />;
});
StickyBarWrapper.displayName = "StickyBarWrapper";

const TikTokBonus = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);

  const handleWithdraw = () => {
    navigate("/resgatar");
  };

  const checkInDays = [
    { day: "Dia 01", points: 50, completed: true },
    { day: "Dia 02", points: 100, completed: true },
    { day: "Dia 03", points: 150, completed: true },
    { day: "Dia 04", points: 200, completed: true },
    { day: "Dia 05", points: 250, completed: true },
    { day: "Dia 06", points: 300, completed: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] w-full max-w-md mx-auto relative overflow-hidden">
      <CarnivalConfetti />
      <header className="bg-white py-3 px-4 text-center shadow-sm relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-lg">🎭</div>
        <h1 className="text-base font-bold text-gray-900">🎉 TikTok Bônus - Carnaval 🎉</h1>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">🎭</div>
      </header>

      <CountdownBar />

      <main className="px-3 py-3 space-y-3 max-w-md mx-auto pb-20">
        <BalanceCard balance="R$ 2.834,72" onWithdraw={handleWithdraw} />
        <CongratulationsCard totalValue="R$ 2.834,72" />
        <CheckInSection title="Entre por 14 dias para ganhar" points="8.414 pontos" dateRange="12 de nov - 25 de nov" days={checkInDays} />
        <TaskItem title="Vê anúncios direcionados diariamente para ganhares até" points="2.730 pontos" progress="30/30 anúncios assistidos" />
        <TaskItem title="Assistir vídeos" points="500 pontos" badge="Assista por 10 min" progressSteps={[
          { points: "50 pontos", active: true },
          { points: "100 pontos", active: true },
          { points: "150 pontos", active: true },
          { points: "225 pontos", active: true },
        ]} />
        <TaskItem title="Resgate suas recompensas e ganhe" points="640 pontos" progress="8/8 resgatados" />
        <ProgressTask title="Faça 60 pesquisas diárias para ganhar até" points="996 pontos" progress="60 pesquisas feitas hoje" badge="Até 756 pontos" steps={[
          { label: "36 pesquisas", points: "" },
          { label: "60 pesquisas", points: "" },
        ]} description="Obtém 21 pontos por escreveres uma consulta na barra de pesquisa, ou 0 ponto por tocares numa pesquisa sugerida, como em 'Podes gostar'." />
        <TaskItem title="Convide 1 amigo para se inscrever e ganhar" points="100.000 pontos - 200.000 pontos" />
      </main>

      <StickyBarWrapper onWithdraw={handleWithdraw} />

      <PrizePopup isOpen={showPopup} onClose={() => setShowPopup(false)} prizeValue="R$ 2.834,72" initialTime={599} />
    </div>
  );
};

export default TikTokBonus;