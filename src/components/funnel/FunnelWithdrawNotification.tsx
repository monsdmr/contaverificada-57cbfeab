import { useState, useEffect, useCallback } from "react";

const FIRST_NAMES = [
  "Maria", "Ana", "João", "Carlos", "Fernanda", "Lucas", "Juliana",
  "Pedro", "Camila", "Rafael", "Beatriz", "Thiago", "Larissa", "Bruno",
  "Amanda", "Felipe", "Gabriela", "Rodrigo", "Patricia", "Marcos",
];

const CITIES = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte",
  "Curitiba", "Salvador", "Fortaleza", "Recife",
  "Porto Alegre", "Brasília", "Goiânia", "Manaus",
];

const AMOUNTS = [
  "R$ 1.247", "R$ 2.834", "R$ 890", "R$ 3.120",
  "R$ 1.560", "R$ 2.100", "R$ 745", "R$ 4.200",
  "R$ 1.890", "R$ 2.560", "R$ 980", "R$ 3.450",
];

const TIMES = ["agora", "1 min", "2 min", "3 min", "5 min"];

// Real-looking avatar IDs from pravatar (curated for quality)
const AVATAR_IDS = [1, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FunnelWithdrawNotification = () => {
  const [notification, setNotification] = useState<{
    name: string;
    city: string;
    amount: string;
    time: string;
    avatarId: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    setNotification({
      name: randomItem(FIRST_NAMES),
      city: randomItem(CITIES),
      amount: randomItem(AMOUNTS),
      time: randomItem(TIMES),
      avatarId: randomItem(AVATAR_IDS),
    });
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3500);
  }, []);

  useEffect(() => {
    const delay = setTimeout(show, 2000 + Math.random() * 2000);
    const interval = setInterval(show, 7000 + Math.random() * 5000);
    return () => {
      clearTimeout(delay);
      clearInterval(interval);
    };
  }, [show]);

  if (!notification) return null;

  return (
    <div
      className={`fixed top-1 left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-all duration-500 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-2.5 max-w-[300px] shadow-2xl border border-white/10">
        <img
          src={`https://i.pravatar.cc/64?img=${notification.avatarId}`}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/20"
        />
        <p className="text-white text-[11px] leading-tight truncate">
          <span className="font-semibold">{notification.name}</span>
          {" sacou "}
          <span className="text-green-400 font-bold">{notification.amount}</span>
          <span className="text-white/50"> · {notification.time}</span>
        </p>
      </div>
    </div>
  );
};

export default FunnelWithdrawNotification;
