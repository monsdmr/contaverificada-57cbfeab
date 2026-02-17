import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UsePaymentCheckProps {
  transactionId: string | undefined;
  onPaymentConfirmed: () => void;
}

export const usePaymentCheck = ({ transactionId, onPaymentConfirmed }: UsePaymentCheckProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const checkPayment = useCallback(async () => {
    if (!transactionId) {
      setCheckError("Nenhuma transação encontrada.");
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    try {
      const { data: apiResult, error: apiError } = await supabase.functions.invoke('check-payment', {
        body: { transaction_id: transactionId }
      });

      if (apiError) {
        console.warn('Manual check error:', apiError);
        setCheckError("Erro ao verificar pagamento. Tente novamente.");
        return;
      }

      console.log('Manual payment check result:', apiResult);

      if (apiResult?.status === 'paid') {
        onPaymentConfirmed();
      } else {
        setCheckError("Pagamento ainda não confirmado. Aguarde ou tente novamente.");
      }
    } catch (err) {
      console.warn('Error checking payment manually:', err);
      setCheckError("Erro ao verificar pagamento. Tente novamente.");
    } finally {
      setIsChecking(false);
    }
  }, [transactionId, onPaymentConfirmed]);

  return {
    isChecking,
    checkError,
    checkPayment,
    clearError: () => setCheckError(null),
  };
};
