import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTikTokAttribution } from "@/hooks/useTikTokAttribution";
import { PixPaymentData } from "@/components/funnel/types";

interface GeneratePixParams {
  amount: number;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  payment_type: string;
  ab_variant?: string;
}

interface UsePixGenerationOptions {
  onSuccess?: (data: PixPaymentData) => void;
  onError?: (error: Error) => void;
}

const getSessionKey = (paymentType: string) => `pix_generated_${paymentType}`;

export const usePixGeneration = (options?: UsePixGenerationOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);

  const generatePix = useCallback(async (params: GeneratePixParams) => {
    if (isGeneratingRef.current) {
      console.log('[usePixGeneration] Already generating, ignoring request');
      return null;
    }

    if (hasGeneratedRef.current && pixData) {
      console.log('[usePixGeneration] PIX already exists in memory, reusing:', pixData.transaction_id);
      options?.onSuccess?.(pixData);
      return pixData;
    }

    const sessionKey = getSessionKey(params.payment_type);
    const storedPix = sessionStorage.getItem(sessionKey);
    if (storedPix) {
      try {
        const parsedPix = JSON.parse(storedPix) as PixPaymentData;
        const storedTime = sessionStorage.getItem(`${sessionKey}_time`);
        if (storedTime) {
          const timeDiff = Date.now() - parseInt(storedTime, 10);
          const thirtyMinutes = 30 * 60 * 1000;
          if (timeDiff < thirtyMinutes) {
            console.log('[usePixGeneration] PIX found in sessionStorage, reusing:', parsedPix.transaction_id);
            setPixData(parsedPix);
            hasGeneratedRef.current = true;
            options?.onSuccess?.(parsedPix);
            return parsedPix;
          }
        }
      } catch (e) {
        sessionStorage.removeItem(sessionKey);
        sessionStorage.removeItem(`${sessionKey}_time`);
      }
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setError(null);

    try {
      const MAX_RETRIES = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
            console.log(`[usePixGeneration] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms`);
            await new Promise(r => setTimeout(r, delay));
          }

          const attribution = getTikTokAttribution();

          const { data, error: apiError } = await supabase.functions.invoke('generate-pix', {
            body: {
              amount: params.amount,
              name: params.name || "Usuário",
              email: params.email || "cliente@pagamento.com",
              cpf: params.cpf,
              phone: params.phone,
              payment_type: params.payment_type,
              ab_variant: params.ab_variant,
              ttclid: attribution.ttclid,
              page_url: attribution.pageUrl,
              page_referrer: attribution.pageReferrer
            }
          });

          if (apiError) {
            throw new Error(apiError.message || 'Erro ao gerar PIX');
          }

          if (!data?.pix_code) {
            throw new Error('PIX code missing in response');
          }

          console.log('[usePixGeneration] PIX generated successfully:', data.transaction_id);

          const storageKey = getSessionKey(params.payment_type);
          sessionStorage.setItem(storageKey, JSON.stringify(data));
          sessionStorage.setItem(`${storageKey}_time`, Date.now().toString());

          setPixData(data);
          hasGeneratedRef.current = true;
          options?.onSuccess?.(data);

          return data as PixPaymentData;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (attempt < MAX_RETRIES) continue;
        }
      }

      // All retries exhausted
      const errorMessage = lastError?.message || 'Erro ao gerar PIX';
      console.error('[usePixGeneration] All retries failed:', errorMessage);
      setError(errorMessage);
      options?.onError?.(lastError || new Error(errorMessage));
      return null;
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [pixData, options]);

  const reset = useCallback(() => {
    setPixData(null);
    setError(null);
    hasGeneratedRef.current = false;
    isGeneratingRef.current = false;
  }, []);

  return {
    generatePix,
    isGenerating,
    pixData,
    error,
    reset,
    hasGenerated: hasGeneratedRef.current,
  };
};
