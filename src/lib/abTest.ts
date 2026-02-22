export interface ABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: ABVariant = {
  id: "tax_B",
  amount: 26.47,
  formattedAmount: "R$ 26,47",
  anchorAmount: "R$ 69,90",
  discountPercent: "62% OFF",
};

export function getTaxABVariant(): ABVariant {
  return FIXED_VARIANT;
}
