export interface TenfABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: TenfABVariant = {
  id: "tenf_fixed_44.17",
  amount: 44.17,
  formattedAmount: "R$ 44,17",
  anchorAmount: "R$ 99,90",
  discountPercent: "56% OFF",
};

export function getTenfABVariant(): TenfABVariant {
  return FIXED_VARIANT;
}
