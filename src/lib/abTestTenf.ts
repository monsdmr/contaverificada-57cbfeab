export interface TenfABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: TenfABVariant = {
  id: "tenf_fixed_44.97",
  amount: 44.97,
  formattedAmount: "R$ 44,97",
  anchorAmount: "R$ 99,97",
  discountPercent: "55% OFF",
};

export function getTenfABVariant(): TenfABVariant {
  return FIXED_VARIANT;
}
