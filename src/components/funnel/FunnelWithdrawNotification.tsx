import { useState, useEffect, useCallback, useRef } from "react";

// Gender-tagged names for correct avatar matching
const FEMALE_NAMES = [
  "Maria", "Ana", "Fernanda", "Juliana", "Camila", "Beatriz",
  "Larissa", "Amanda", "Gabriela", "Patricia", "Aline", "Vanessa",
  "Renata", "Letícia", "Priscila", "Daniela", "Tatiana",
];

const MALE_NAMES = [
  "João", "Carlos", "Lucas", "Pedro", "Rafael", "Thiago",
  "Bruno", "Felipe", "Rodrigo", "Marcos", "Diego", "André",
  "Gustavo", "Leandro", "Eduardo", "Matheus",
];

// Curated pravatar IDs by gender (manually verified)
const FEMALE_AVATAR_IDS = [1, 5, 9, 16, 20, 21, 23, 24, 25, 26, 29, 31, 32, 34, 36, 38, 39, 40, 41, 44, 45, 47, 48, 49];
const MALE_AVATAR_IDS = [3, 7, 8, 11, 12, 13, 14, 15, 17, 18, 22, 27, 28, 30, 33, 35, 37, 42, 43, 46, 50, 51, 52, 53];

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
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    // Cancel any pending hide to prevent stacking/overlap
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }

    const isFemale = Math.random() > 0.5;
    const name = isFemale ? randomItem(FEMALE_NAMES) : randomItem(MALE_NAMES);
    const avatarId = isFemale ? randomItem(FEMALE_AVATAR_IDS) : randomItem(MALE_AVATAR_IDS);

    setNotification({ name, city: randomItem(CITIES), amount: randomItem(AMOUNTS), time: randomItem(TIMES), avatarId });
    setIsVisible(true);

    hideTimeout.current = setTimeout(() => {
      setIsVisible(false);
      hideTimeout.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    const delay = setTimeout(show, 2500 + Math.random() * 2000);
    const interval = setInterval(show, 8000 + Math.random() * 5000);
    return () => {
      clearTimeout(delay);
      clearInterval(interval);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [show]);

  if (!notification) return null;

  return (
    <div
      className={`fixed top-2 left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-2 opacity-0 scale-95"
      }`}
    >
      <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-xl px-2 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 max-w-[290px]">
        <img
          src={`https://i.pravatar.cc/80?img=${notification.avatarId}`}
          alt=""
          className="w-9 h-9 rounded-xl object-cover shrink-0"
        />
        <div className="min-w-0 flex flex-col">
          <p className="text-gray-900 text-[11px] font-semibold leading-tight truncate">
            {notification.name} · {notification.city}
          </p>
          <p className="text-[10px] leading-tight mt-0.5">
            <span className="text-emerald-600 font-bold">Sacou {notification.amount}</span>
            <span className="text-gray-400"> · {notification.time}</span>
          </p>
        </div>
        <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FunnelWithdrawNotification;
