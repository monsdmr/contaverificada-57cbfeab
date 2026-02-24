import { supabase } from "@/integrations/supabase/client";
import { getTikTokAttribution } from "@/hooks/useTikTokAttribution";

function getTtp(): string | null {
  try {
    const match = document.cookie.match(/(?:^|; )_ttp=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export async function trackServerEvent(input: {
  event: string;
  eventId: string;
  value?: number;
  contentId?: string;
  transactionId?: string;
  email?: string;
  phone?: string;
  name?: string;
  cpf?: string;
}): Promise<void> {
  const { event, eventId, value, contentId, transactionId, email, phone, name, cpf } = input;

  const flagKey = `tt_srv_${event}_${eventId}`;
  if (sessionStorage.getItem(flagKey)) return;

  const attribution = getTikTokAttribution();
  const ttp = getTtp();

  try {
    sessionStorage.setItem(flagKey, "1");

    await supabase.functions.invoke("tiktok-event", {
      body: {
        event,
        event_id: eventId,
        value,
        currency: "BRL",
        content_id: contentId || "pix_payment",
        content_type: "product",
        transaction_id: transactionId,
        ttclid: attribution.ttclid,
        ttp,
        page_url: attribution.pageUrl,
        page_referrer: attribution.pageReferrer,
        user_agent: navigator.userAgent,
        email,
        phone_number: phone,
        name,
        external_id: cpf,
      },
    });

    console.debug(`[TikTok] ${event} (server) sent`, { eventId });
  } catch (e) {
    console.warn(`[TikTok] Failed to send ${event} (server)`, e);
  }
}
