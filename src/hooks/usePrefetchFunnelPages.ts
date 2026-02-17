import { useEffect } from "react";

// Map of funnel routes to their lazy import functions
const FUNNEL_PREFETCH_MAP: Record<string, () => Promise<unknown>> = {
  "/funil/confirmar-identidade": () => import("@/pages/funnel/FunnelConfirmTaxPage"),
  "/funil/confirmar-taxa": () => import("@/pages/funnel/FunnelConfirmTaxPage"),
  "/funil/upsell-tenf": () => import("@/pages/funnel/FunnelUpsellTENFPage"),
  "/funil/upsell-transacional": () => import("@/pages/funnel/FunnelUpsellTransacionalPage"),
  "/funil/upsell-antifraude": () => import("@/pages/funnel/FunnelUpsellAntiFraudePage"),
  "/funil/upsell-bonus-oculto": () => import("@/pages/funnel/FunnelUpsellBonusOcultoPage"),
  "/funil/upsell-anti-reversao": () => import("@/pages/funnel/FunnelUpsellAntiReversaoPage"),
  "/funil/upsell-saque-imediato": () => import("@/pages/funnel/FunnelUpsellSaqueImediatoPage"),
  "/funil/upsell-anti-erros": () => import("@/pages/funnel/FunnelUpsellAntiErrosPage"),
  "/funil/upsell-saldo-duplicado": () => import("@/pages/funnel/FunnelUpsellSaldoDuplicadoPage"),
  "/funil/processando-saque": () => import("@/pages/funnel/FunnelWithdrawProcessingPage"),
  "/funil/sucesso": () => import("@/pages/funnel/FunnelSuccessPage"),
};

// Ordered funnel flow for sequential prefetch
const FUNNEL_ORDER = [
  "/funil/confirmar-identidade",
  "/funil/upsell-tenf",
  "/funil/upsell-transacional",
  "/funil/upsell-antifraude",
  "/funil/upsell-bonus-oculto",
  "/funil/upsell-anti-reversao",
  "/funil/upsell-saque-imediato",
  "/funil/upsell-anti-erros",
  "/funil/upsell-saldo-duplicado",
  "/funil/processando-saque",
  "/funil/sucesso",
];

/**
 * Prefetches the next 2 pages in the funnel after idle,
 * so navigation feels instant.
 */
export const usePrefetchFunnelPages = (currentPath: string) => {
  useEffect(() => {
    const currentIndex = FUNNEL_ORDER.indexOf(currentPath);
    if (currentIndex === -1) return;

    const nextPages = FUNNEL_ORDER.slice(currentIndex + 1, currentIndex + 3);

    const prefetch = () => {
      nextPages.forEach((path) => {
        const loader = FUNNEL_PREFETCH_MAP[path];
        if (loader) {
          loader().catch(() => {
            // Silently fail - prefetch is optional
          });
        }
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(prefetch, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 500);
      return () => clearTimeout(id);
    }
  }, [currentPath]);
};
