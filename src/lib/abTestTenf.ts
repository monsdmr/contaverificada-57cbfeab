export interface TenfABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: TenfABVariant = {
  id: "tenf_fixed_44.37",
  amount: 44.37,
  formattedAmount: "R$ 44,37",
  anchorAmount: "R$ 99,90",
  discountPercent: "56% OFF",
};

export function getTenfABVariant(): TenfABVariant {
  return FIXED_VARIANT;
}
