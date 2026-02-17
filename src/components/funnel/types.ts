export type FunnelStep =
  | "main"
  | "selectMethod"
  | "linkPix"
  | "selectKeyType"
  | "loading"
  | "confirmTax"
  | "pixPayment"
  | "upsellTENF"
  | "upsellTENFPayment"
  | "upsellTransacional"
  | "upsellTransacionalPayment";

export type PixKeyType = "CPF" | "E-mail" | "Celular" | "Chave Aleatória" | null;

export interface PixPaymentData {
  transaction_id: string;
  pix_code: string;
  pix_qr_code_base64?: string;
  pix_url?: string;
  amount: number;
  status: string;
}

export interface FunnelStepProps {
  balance: string;
  pixKey: string;
  pixKeyType: PixKeyType;
  pixName: string;
  onGeneratePix: () => void;
  isGenerating: boolean;
}

export interface PixPopupProps {
  pixData: PixPaymentData | null;
  amount: string;
  title: string;
  onClose: () => void;
  onCopy: () => void;
  isCopied: boolean;
  showRefundMessage?: boolean;
  onManualCheck?: () => void;
  isCheckingPayment?: boolean;
  checkError?: string | null;
}
