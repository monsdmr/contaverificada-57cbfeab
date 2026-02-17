import { useState, useEffect, useCallback } from "react";

const FIRST_NAMES = [
  "Maria", "Ana", "João", "Carlos", "Fernanda", "Lucas", "Juliana",
  "Pedro", "Camila", "Rafael", "Beatriz", "Thiago", "Larissa", "Bruno",
  "Amanda", "Felipe", "Gabriela", "Rodrigo", "Patricia", "Marcos",
  "Aline", "Diego", "Vanessa", "André", "Renata", "Gustavo", "Letícia",
  "Leandro", "Tatiana", "Eduardo", "Priscila", "Matheus", "Daniela",
];

const CITIES = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
  "Curitiba, PR", "Salvador, BA", "Fortaleza, CE", "Recife, PE",
  "Porto Alegre, RS", "Brasília, DF", "Goiânia, GO", "Manaus, AM",
  "Belém, PA", "Campinas, SP", "Guarulhos, SP", "São Luís, MA",
  "Maceió, AL", "Natal, RN", "Campo Grande, MS", "Florianópolis, SC",
];

const AMOUNTS = [
  "R$ 1.247,00", "R$ 2.834,72", "R$ 890,50", "R$ 3.120,00",
  "R$ 1.560,30", "R$ 2.100,00", "R$ 745,80", "R$ 4.200,00",
  "R$ 1.890,00", "R$ 2.560,45", "R$ 980,00", "R$ 3.450,00",
  "R$ 1.100,00", "R$ 2.780,90", "R$ 670,00", "R$ 5.100,00",
];

const TIMES = [
  "agora", "1 min atrás", "2 min atrás", "3 min atrás", "5 min atrás",
  "há poucos segundos", "30s atrás",
];

const getAvatarUrl = (id: number) => `https://i.pravatar.cc/80?img=${id}`;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Notification {
  id: number;
  name: string;
  city: string;
  amount: string;
  time: string;
  avatarId: number;
}

const FunnelWithdrawNotification = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const generateNotification = useCallback((): Notification => ({
    id: Date.now(),
    name: randomItem(FIRST_NAMES),
    city: randomItem(CITIES),
    amount: randomItem(AMOUNTS),
    time: randomItem(TIMES),
    avatarId: Math.floor(Math.random() * 70) + 1,
  }), []);

  useEffect(() => {
    const initialDelay = 3000 + Math.random() * 3000;

    const showNotification = () => {
      const notif = generateNotification();
      setNotification(notif);
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    const initialTimer = setTimeout(() => {
      showNotification();
      const interval = setInterval(() => {
        showNotification();
      }, 8000 + Math.random() * 7000);
      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(initialTimer);
  }, [generateNotification]);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[70] max-w-[280px] transition-all duration-500 ease-in-out pointer-events-none ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-3">
        <img
          src={getAvatarUrl(notification.avatarId)}
          alt=""
          className="w-10 h-10 rounded-full object-cover shrink-0"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="text-gray-800 text-xs font-semibold truncate">
            {notification.name} sacou {notification.amount}
          </p>
          <p className="text-gray-400 text-[10px] truncate">
            {notification.city} · {notification.time}
          </p>
        </div>
        <div className="shrink-0">
          <span className="text-green-500 text-lg">✓</span>
        </div>
      </div>
    </div>
  );
};

export default FunnelWithdrawNotification;
