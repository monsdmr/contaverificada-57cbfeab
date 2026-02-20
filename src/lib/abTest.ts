export interface ABVariant {
  id: string;
  amount: number;
  formattedAmount: string;
  anchorAmount: string;
  discountPercent: string;
}

const FIXED_VARIANT: ABVariant = {
  id: "tax_B",
  amount: 27.97,
  formattedAmount: "R$ 27,97",
  anchorAmount: "R$ 69,97",
  discountPercent: "60% OFF",
};

export function getTaxABVariant(): ABVariant {
  return FIXED_VARIANT;
}
