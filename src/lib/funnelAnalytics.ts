// Funnel analytics — persists to DB via edge function (batched)
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "funnel_analytics";
const SESSION_KEY = "funnel_session_id";

// Stable session id per browser tab session
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getCpfHash(): string | undefined {
  const cpf = sessionStorage.getItem("lead_cpf");
  if (!cpf) return undefined;
  // Simple hash: last 4 digits only (não-reversível, não expõe CPF)
  const digits = cpf.replace(/\D/g, "");
  return digits.slice(-4) ? `****${digits.slice(-4)}` : undefined;
}

interface FunnelEvent {
  session_id: string;
  step: string;
  event: string;
  cpf_hash?: string;
  ts: number;
}

function getEvents(): FunnelEvent[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function pushEvent(step: string, event: string) {
  const events = getEvents();
  events.push({ session_id: getSessionId(), step, event, cpf_hash: getCpfHash(), ts: Date.now() });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  console.debug(`[FunnelAnalytics] ${event} @ ${step}`);

  // Debounced flush: send to DB 2s after last event
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushEvents, 2000);
}

async function flushEvents() {
  const events = getEvents();
  if (events.length === 0) return;
  sessionStorage.removeItem(STORAGE_KEY);

  try {
    await supabase.functions.invoke('track-funnel-event', { body: { events } });
  } catch {
    // silent fail — analytics is non-critical
  }
}

// Flush on page unload (best-effort)
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushEvents();
  });
}

/** Track when user lands on a funnel step */
export function trackFunnelView(step: string) {
  const flag = `funnel_view_${step}`;
  if (sessionStorage.getItem(flag)) return;
  sessionStorage.setItem(flag, "1");
  pushEvent(step, "view");
}

/** Track when user clicks the CTA (generate pix) */
export function trackFunnelCTA(step: string) {
  pushEvent(step, "cta_click");
}

/** Track when pix popup opens */
export function trackFunnelPixPopup(step: string) {
  pushEvent(step, "pix_popup_open");
}

/** Track when user copies pix code */
export function trackFunnelPixCopy(step: string) {
  pushEvent(step, "pix_copy");
}

/** Track when payment is confirmed */
export function trackFunnelPayment(step: string) {
  pushEvent(step, "payment_confirmed");
}

/** Track when user skips/advances without paying */
export function trackFunnelSkip(step: string) {
  pushEvent(step, "skip");
}

/** Get summary of funnel progression for debugging */
export function getFunnelSummary() {
  const events = getEvents();
  const steps = [...new Set(events.map(e => e.step))];
  return steps.map(step => ({
    step,
    events: events.filter(e => e.step === step).map(e => e.event),
  }));
}
