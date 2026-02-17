import { useState, useEffect, useCallback } from "react";

const names = [
  "Maria S.", "João P.", "Ana L.", "Carlos M.", "Fernanda R.",
  "Lucas G.", "Beatriz O.", "Rafael T.", "Juliana F.", "Pedro H.",
  "Camila A.", "Bruno V.", "Larissa N.", "Diego C.", "Patricia B.",
  "Gustavo E.", "Aline D.", "Thiago K.", "Vanessa I.", "Marcos J.",
];

const cities = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Salvador",
  "Fortaleza", "Brasília", "Recife", "Porto Alegre", "Manaus",
  "Goiânia", "Belém", "Campinas", "Florianópolis", "Natal",
];

const getRandomAmount = () => {
  const base = Math.floor(Math.random() * 3000) + 800;
  const cents = Math.random() < 0.5 ? 71 : 25;
  return `R$ ${base.toLocaleString("pt-BR")},${cents < 10 ? "0" + cents : cents}`;
};

const getRandomTime = () => {
  const mins = Math.floor(Math.random() * 12) + 1;
  return `há ${mins} min`;
};

const FunnelSocialProofNotifications = () => {
  const [notification, setNotification] = useState<{
    name: string;
    city: string;
    amount: string;
    time: string;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  const showNotification = useCallback(() => {
    const n = {
      name: names[Math.floor(Math.random() * names.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      amount: getRandomAmount(),
      time: getRandomTime(),
    };
    setNotification(n);
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    const firstTimeout = setTimeout(showNotification, 5000);
    const interval = setInterval(() => {
      showNotification();
    }, 8000 + Math.random() * 7000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [showNotification]);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-[90] max-w-xs transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
          <span className="text-[#4CAF50] text-lg">✓</span>
        </div>
        <div className="min-w-0">
          <p className="text-gray-900 text-xs font-semibold truncate">
            {notification.name} de {notification.city}
          </p>
          <p className="text-gray-500 text-[11px]">
            Sacou <span className="font-bold text-[#4CAF50]">{notification.amount}</span> · {notification.time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FunnelSocialProofNotifications;
