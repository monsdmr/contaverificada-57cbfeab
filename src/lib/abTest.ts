export interface ABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: ABVariant = {
  id: "tax_B",
  amount: 31.47,
  formattedAmount: "R$ 31,47",
  anchorAmount: "R$ 79,90",
  discountPercent: "61% OFF",
};

export function getTaxABVariant(): ABVariant {
  return FIXED_VARIANT;
}
