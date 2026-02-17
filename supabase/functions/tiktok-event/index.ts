import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIKTOK_PIXEL_ID = "CUMCLS3C77UCJ3CPMCN0";
const TIKTOK_API_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

interface TikTokEventBody {
  event: string; // "InitiateCheckout" | "CompletePayment"
  event_id: string;
  value?: number;
  currency?: string;
  content_id?: string;
  content_type?: string;
  transaction_id?: string;
  // Attribution
  ttclid?: string | null;
  ttp?: string | null;
  page_url?: string;
  page_referrer?: string;
  user_agent?: string;
  ip_address?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("TIKTOK_EVENTS_API_TOKEN");
    if (!token) {
      console.error("[tiktok-event] Missing TIKTOK_EVENTS_API_TOKEN");
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: TikTokEventBody = await req.json();

    const {
      event,
      event_id,
      value,
      currency = "BRL",
      content_id = "pix_payment",
      content_type = "product",
      transaction_id,
      ttclid,
      ttp,
      page_url,
      page_referrer,
      user_agent,
      ip_address,
    } = body;

    // Build user object
    const user: Record<string, unknown> = {};
    if (ttclid) user.ttclid = ttclid;
    if (ttp) user.ttp = ttp;
    if (ip_address) user.ip = ip_address;
    if (user_agent) user.user_agent = user_agent;

    // Build properties
    const properties: Record<string, unknown> = {
      currency,
      content_id,
      content_type,
    };
    if (value !== undefined) properties.value = value;
    if (transaction_id) {
      properties.order_id = transaction_id;
      properties.transaction_id = transaction_id;
    }

    // Build page
    const page: Record<string, unknown> = {};
    if (page_url) page.url = page_url;
    if (page_referrer) page.referrer = page_referrer;

    const payload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event_source: "web",
      event_source_id: TIKTOK_PIXEL_ID,
      data: [
        {
          event,
          event_id,
          event_time: Math.floor(Date.now() / 1000),
          user: Object.keys(user).length > 0 ? user : undefined,
          properties,
          page: Object.keys(page).length > 0 ? page : undefined,
        },
      ],
    };

    console.log(`[tiktok-event] Sending ${event} (${event_id})`);

    const resp = await fetch(TIKTOK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": token,
      },
      body: JSON.stringify(payload),
    });

    const result = await resp.json();
    console.log(`[tiktok-event] Response:`, JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[tiktok-event] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
