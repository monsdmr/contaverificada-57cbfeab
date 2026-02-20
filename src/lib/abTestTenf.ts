export interface TenfABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

// 3 variantes de preço para teste A/B
// A distribuição é 1/3 cada, persistida em sessionStorage
const VARIANTS: TenfABVariant[] = [
  {
    id: "tenf_A_37",
    amount: 37.43,
    formattedAmount: "R$ 37,43",
    anchorAmount: "R$ 97,90",
    discountPercent: "62% OFF",
  },
  {
    id: "tenf_B_44",
    amount: 44.17,
    formattedAmount: "R$ 44,17",
    anchorAmount: "R$ 99,90",
    discountPercent: "56% OFF",
  },
  {
    id: "tenf_C_52",
    amount: 52.83,
    formattedAmount: "R$ 52,83",
    anchorAmount: "R$ 119,90",
    discountPercent: "56% OFF",
  },
];

const SESSION_KEY = "tenf_ab_variant";

export function getTenfABVariant(): TenfABVariant {
  // Reutiliza variante da sessão para consistência
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    const found = VARIANTS.find(v => v.id === stored);
    if (found) return found;
  }

  // Atribuição aleatória uniforme
  const index = Math.floor(Math.random() * VARIANTS.length);
  const variant = VARIANTS[index];
  sessionStorage.setItem(SESSION_KEY, variant.id);
  return variant;
}

/** Retorna o id da variante ativa (para analytics) */
export function getTenfABVariantId(): string {
  return sessionStorage.getItem(SESSION_KEY) || "unknown";
}
