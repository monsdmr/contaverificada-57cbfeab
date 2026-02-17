export interface TenfABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const VARIANT_A: TenfABVariant = {
  id: "tenf_fixed_44.37",
  amount: 44.37,
  formattedAmount: "R$ 44,37",
  anchorAmount: "R$ 99,90",
  discountPercent: "56% OFF",
};

const VARIANT_B: TenfABVariant = {
  id: "tenf_fixed_44.37",
  amount: 44.37,
  formattedAmount: "R$ 44,37",
  anchorAmount: "R$ 99,90",
  discountPercent: "56% OFF",
};

const STORAGE_KEY = "tenf_ab_variant";

export function getTenfABVariant(): TenfABVariant {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === VARIANT_A.id) return VARIANT_A;
  if (stored === VARIANT_B.id) return VARIANT_B;

  const variant = Math.random() < 0.5 ? VARIANT_A : VARIANT_B;
  sessionStorage.setItem(STORAGE_KEY, variant.id);
  return variant;
}
