export interface ABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: ABVariant = {
  id: "tax_B",
  amount: 27.43,
  formattedAmount: "R$ 27,43",
  anchorAmount: "R$ 69,90",
  discountPercent: "60% OFF",
};

export function getTaxABVariant(): ABVariant {
  return FIXED_VARIANT;
}
