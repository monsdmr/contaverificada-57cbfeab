// Lightweight funnel analytics tracker
// Tracks page views and key events per funnel step

const STORAGE_KEY = "funnel_analytics";

interface FunnelEvent {
  step: string;
  event: string;
  ts: number;
}

function getEvents(): FunnelEvent[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function pushEvent(step: string, event: string) {
  const events = getEvents();
  events.push({ step, event, ts: Date.now() });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  console.debug(`[FunnelAnalytics] ${event} @ ${step}`);
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
