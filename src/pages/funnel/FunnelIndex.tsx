import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, CreditCard, FileText, Banknote, Shield, Gift, Lock, Clock, AlertTriangle } from "lucide-react";

const funnelSteps = [
  {
    path: "/funil/confirmar-taxa",
    title: "1. Confirmar Taxa",
    description: "Taxa de processamento R$ 42,25",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    path: "/funil/pagamento-taxa",
    title: "2. Pagamento Taxa",
    description: "Popup PIX da taxa",
    icon: CreditCard,
    color: "bg-blue-600",
  },
  {
    path: "/funil/upsell-tenf",
    title: "3. Upsell TENF",
    description: "Taxa TENF R$ 21,25",
    icon: Banknote,
    color: "bg-green-500",
  },
  {
    path: "/funil/pagamento-tenf",
    title: "4. Pagamento TENF",
    description: "Popup PIX do TENF",
    icon: CreditCard,
    color: "bg-green-600",
  },
  {
    path: "/funil/upsell-transacional",
    title: "5. Upsell Transacional",
    description: "Taxa Transacional R$ 47,91",
    icon: Banknote,
    color: "bg-purple-500",
  },
  {
    path: "/funil/pagamento-transacional",
    title: "6. Pagamento Transacional",
    description: "Popup PIX Transacional",
    icon: CreditCard,
    color: "bg-purple-600",
  },
  {
    path: "/funil/upsell-antifraude",
    title: "7. Upsell Anti-Fraude",
    description: "Tarifa Anti-Fraude R$ 26,81",
    icon: Shield,
    color: "bg-emerald-500",
  },
  {
    path: "/funil/pagamento-antifraude",
    title: "8. Pagamento Anti-Fraude",
    description: "Popup PIX Anti-Fraude",
    icon: CreditCard,
    color: "bg-emerald-600",
  },
  {
    path: "/funil/upsell-bonus-oculto",
    title: "9. Upsell Bônus Oculto",
    description: "Liberação Bônus R$ 14,91",
    icon: Gift,
    color: "bg-pink-500",
  },
  {
    path: "/funil/pagamento-bonus-oculto",
    title: "10. Pagamento Bônus Oculto",
    description: "Popup PIX Bônus Oculto",
    icon: CreditCard,
    color: "bg-pink-600",
  },
  {
    path: "/funil/upsell-anti-reversao",
    title: "11. Upsell Anti-Reversão",
    description: "Proteção Anti-Reversão R$ 21,91",
    icon: Lock,
    color: "bg-orange-500",
  },
  {
    path: "/funil/pagamento-anti-reversao",
    title: "12. Pagamento Anti-Reversão",
    description: "Popup PIX Anti-Reversão",
    icon: CreditCard,
    color: "bg-orange-600",
  },
  {
    path: "/funil/upsell-saque-imediato",
    title: "13. Upsell Saque Imediato",
    description: "Antecipação R$ 9,91",
    icon: Clock,
    color: "bg-cyan-500",
  },
  {
    path: "/funil/pagamento-saque-imediato",
    title: "14. Pagamento Saque Imediato",
    description: "Popup PIX Saque Imediato",
    icon: CreditCard,
    color: "bg-cyan-600",
  },
  {
    path: "/funil/upsell-anti-erros",
    title: "15. Upsell Anti-Erros",
    description: "Garantia Total R$ 17,21",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
  {
    path: "/funil/pagamento-anti-erros",
    title: "16. Pagamento Anti-Erros",
    description: "Popup PIX Anti-Erros",
    icon: CreditCard,
    color: "bg-red-600",
  },
  {
    path: "/funil/upsell-saldo-duplicado",
    title: "17. Upsell Saldo Duplicado",
    description: "Conversão Saldo R$ 9,91",
    icon: Banknote,
    color: "bg-amber-500",
  },
  {
    path: "/funil/pagamento-saldo-duplicado",
    title: "18. Pagamento Saldo Duplicado",
    description: "Popup PIX Saldo Duplicado",
    icon: CreditCard,
    color: "bg-amber-600",
  },
];

const FunnelIndex = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎯 Etapas do Funil
          </h1>
          <p className="text-gray-600 text-sm">
            Clique em qualquer etapa para visualizar individualmente
          </p>
        </div>

        <div className="space-y-3">
          {funnelSteps.map((step) => (
            <Link
              key={step.path}
              to={step.path}
              className="block bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`${step.color} p-3 rounded-xl`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Todas as etapas usam dados mock para preview
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Voltar para a página principal
        </Link>
      </div>
    </div>
  );
};

export default FunnelIndex;
