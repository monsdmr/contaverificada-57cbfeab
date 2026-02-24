import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PIXELS = [
  { id: "CUMCLS3C77UCJ3CPMCN0", tokenEnv: "TIKTOK_EVENTS_API_TOKEN" },
  { id: "D5JVV4RC77U2KB72KH8G", tokenEnv: "TIKTOK_EVENTS_API_TOKEN_2" },
];
const TIKTOK_API_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

interface TikTokEventBody {
  event: string;
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
  // User PII
  email?: string | null;
  phone_number?: string | null;
  name?: string | null;
  external_id?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TikTokEventBody = await req.json();

    // Extract real client IP from request headers (set by CDN/proxy)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      null;

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
      email,
      phone_number,
      name,
      external_id,
    } = body;

    // Hash PII with SHA256 for TikTok Events API
    async function sha256(text: string): Promise<string> {
      const data = new TextEncoder().encode(text.trim().toLowerCase());
      const hash = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    const user: Record<string, unknown> = {};
    if (ttclid) user.ttclid = ttclid;
    if (ttp) user.ttp = ttp;
    if (clientIp) user.ip = clientIp;
    if (user_agent) user.user_agent = user_agent;
    if (email) user.email = await sha256(email);
    if (phone_number) user.phone_number = await sha256(phone_number);
    if (name) {
      const [first, ...rest] = name.trim().split(/\s+/);
      if (first) user.first_name = await sha256(first);
      if (rest.length > 0) user.last_name = await sha256(rest.join(" "));
    }
    if (external_id) user.external_id = await sha256(external_id);

    const properties: Record<string, unknown> = { currency, content_id, content_type };
    if (value !== undefined) properties.value = value;
    if (transaction_id) {
      properties.order_id = transaction_id;
      properties.transaction_id = transaction_id;
    }

    const page: Record<string, unknown> = {};
    if (page_url) page.url = page_url;
    if (page_referrer) page.referrer = page_referrer;

    const eventData = {
      event,
      event_id,
      event_time: Math.floor(Date.now() / 1000),
      user: Object.keys(user).length > 0 ? user : undefined,
      properties,
      page: Object.keys(page).length > 0 ? page : undefined,
    };

    const results = [];

    for (const pixel of PIXELS) {
      const token = Deno.env.get(pixel.tokenEnv);
      if (!token) {
        console.warn(`[tiktok-event] Missing ${pixel.tokenEnv}, skipping ${pixel.id}`);
        continue;
      }

      const payload = {
        pixel_code: pixel.id,
        event_source: "web",
        event_source_id: pixel.id,
        data: [eventData],
      };

      try {
        const resp = await fetch(TIKTOK_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Access-Token": token },
          body: JSON.stringify(payload),
        });
        const result = await resp.json();
        console.log(`[tiktok-event] ${pixel.id} ${event}: ${JSON.stringify(result)}`);
        results.push({ pixel: pixel.id, result });
      } catch (e) {
        console.error(`[tiktok-event] ${pixel.id} error:`, e);
        results.push({ pixel: pixel.id, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
