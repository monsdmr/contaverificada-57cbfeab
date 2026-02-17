type TikTokPixel = {
  track?: (eventName: string, properties?: Record<string, unknown>, options?: Record<string, unknown>) => void;
};

function getTikTokPixel(): TikTokPixel | null {
  const ttq = (window as any).ttq as TikTokPixel | undefined;
  return ttq ?? null;
}

export function trackInitiateCheckoutPixel(input: {
  value: number;
  currency?: string;
  contentId?: string;
}): void {
  const ttq = getTikTokPixel();
  if (!ttq?.track) return;

  const { value, currency = "BRL", contentId = "pix_payment" } = input;
  const eventId = `initcheckout_${contentId}_${Date.now()}`;
  const flagKey = `tt_initcheckout_${contentId}`;
  if (sessionStorage.getItem(flagKey)) return;

  try {
    ttq.track(
      "InitiateCheckout",
      {
        value,
        currency,
        content_id: contentId,
        content_type: "product",
      },
      { event_id: eventId }
    );
    sessionStorage.setItem(flagKey, "1");
    console.debug("[TikTok] InitiateCheckout (pixel) fired", { value, contentId });
  } catch (e) {
    console.warn("[TikTok] Failed to fire InitiateCheckout (pixel)", e);
  }
}

export function trackPurchasePixelOnce(input: {
  transactionId: string;
  value: number;
  currency?: string;
  contentId?: string;
  contentType?: string;
}): void {
  const ttq = getTikTokPixel();
  if (!ttq?.track) return;

  const {
    transactionId,
    value,
    currency = "BRL",
    contentId = "pix_payment",
    contentType = "product",
  } = input;

  const flagKey = `tt_purchase_sent_${transactionId}`;
  if (sessionStorage.getItem(flagKey)) return;

  try {
    ttq.track(
      "Purchase",
      {
        value,
        currency,
        content_id: contentId,
        content_type: contentType,
        order_id: transactionId,
        transaction_id: transactionId,
      },
      { event_id: `purchase_${transactionId}` }
    );

    sessionStorage.setItem(flagKey, "1");
    console.debug("[TikTok] Purchase (pixel) fired", { transactionId, value, currency });
  } catch (e) {
    console.warn("[TikTok] Failed to fire Purchase (pixel)", e);
  }
}
