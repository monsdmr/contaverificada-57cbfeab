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
    amount: 36.13,
    formattedAmount: "R$ 36,13",
    anchorAmount: "R$ 97,90",
    discountPercent: "63% OFF",
  },
  {
    id: "tenf_B_44",
    amount: 43.17,
    formattedAmount: "R$ 43,17",
    anchorAmount: "R$ 99,90",
    discountPercent: "57% OFF",
  },
  {
    id: "tenf_C_52",
    amount: 51.47,
    formattedAmount: "R$ 51,47",
    anchorAmount: "R$ 119,90",
    discountPercent: "57% OFF",
  },
  {
    id: "tenf_D_28",
    amount: 27.41,
    formattedAmount: "R$ 27,41",
    anchorAmount: "R$ 79,90",
    discountPercent: "66% OFF",
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
