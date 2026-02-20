import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, TrendingUp, DollarSign, Users, Zap, ArrowDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepRow {
  payment_type: string;
  gerados: number;
  pagos: number;
  conv_pct: number;
  receita: number;
}

interface ABRow {
  ab_variant: string;
  gerados: number;
  pagos: number;
  conv_pct: number;
  receita: number;
  ticket_medio: number;
}

interface Summary {
  total_pix: number;
  pagos: number;
  conv_pct: number;
  receita: number;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchSummary(): Promise<{ hoje: Summary; total: Summary }> {
  const [{ data: hoje }, { data: total }] = await Promise.all([
    supabase.rpc("run_summary" as never, {} as never).throwOnError(),
    supabase.rpc("run_summary" as never, {} as never).throwOnError(),
  ]);

  // Fallback: query direta
  const { data: h } = await supabase
    .from("pix_payments")
    .select("status, amount")
    .gte("created_at", new Date().toISOString().slice(0, 10));

  const { data: t } = await supabase
    .from("pix_payments")
    .select("status, amount");

  const calc = (rows: { status: string; amount: number }[] | null): Summary => {
    if (!rows) return { total_pix: 0, pagos: 0, conv_pct: 0, receita: 0 };
    const total_pix = rows.length;
    const pagos = rows.filter(r => r.status === "paid").length;
    const receita = rows.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.amount), 0);
    return { total_pix, pagos, conv_pct: total_pix ? Math.round((pagos / total_pix) * 1000) / 10 : 0, receita };
  };

  return { hoje: calc(h), total: calc(t) };
}

async function fetchSteps(): Promise<StepRow[]> {
  const { data } = await supabase
    .from("pix_payments")
    .select("payment_type, status, amount");

  if (!data) return [];

  const map = new Map<string, { gerados: number; pagos: number; receita: number }>();
  for (const row of data) {
    const key = row.payment_type || "unknown";
    if (!map.has(key)) map.set(key, { gerados: 0, pagos: 0, receita: 0 });
    const entry = map.get(key)!;
    entry.gerados++;
    if (row.status === "paid") { entry.pagos++; entry.receita += Number(row.amount); }
  }

  const ORDER = ["tax", "upsell_tenf", "upsell_transacional", "upsell_antifraude", "upsell_bonus_oculto", "upsell_antireversao", "upsell_saque_imediato", "upsell_antierros", "upsell_saldo_duplicado"];
  return ORDER
    .filter(k => map.has(k))
    .map(k => {
      const e = map.get(k)!;
      return { payment_type: k, ...e, conv_pct: e.gerados ? Math.round((e.pagos / e.gerados) * 1000) / 10 : 0 };
    });
}

async function fetchAB(): Promise<ABRow[]> {
  const { data } = await supabase
    .from("pix_payments")
    .select("ab_variant, status, amount")
    .eq("payment_type", "upsell_tenf")
    .not("ab_variant", "is", null);

  if (!data) return [];

  const map = new Map<string, { gerados: number; pagos: number; receita: number }>();
  for (const row of data) {
    const key = row.ab_variant!;
    if (!map.has(key)) map.set(key, { gerados: 0, pagos: 0, receita: 0 });
    const entry = map.get(key)!;
    entry.gerados++;
    if (row.status === "paid") { entry.pagos++; entry.receita += Number(row.amount); }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ab_variant, e]) => ({
      ab_variant,
      ...e,
      conv_pct: e.gerados ? Math.round((e.pagos / e.gerados) * 1000) / 10 : 0,
      ticket_medio: e.pagos ? Math.round((e.receita / e.pagos) * 100) / 100 : 0,
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  tax: "Taxa Inicial",
  upsell_tenf: "TENF",
  upsell_transacional: "Transacional",
  upsell_antifraude: "Anti-Fraude",
  upsell_bonus_oculto: "Bônus Oculto",
  upsell_antireversao: "Anti-Reversão",
  upsell_saque_imediato: "Saque Imediato",
  upsell_antierros: "Anti-Erros",
  upsell_saldo_duplicado: "Saldo Duplicado",
};

const AB_LABELS: Record<string, string> = {
  tenf_A_37: "A — R$ 37,43",
  tenf_B_44: "B — R$ 44,17",
  tenf_C_52: "C — R$ 52,83",
  tenf_D_28: "D — R$ 28,71",
};

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function convColor(pct: number) {
  if (pct >= 60) return "text-emerald-600";
  if (pct >= 30) return "text-yellow-600";
  return "text-red-500";
}

function ConvBar({ pct }: { pct: number }) {
  const color = pct >= 60 ? "bg-emerald-500" : pct >= 30 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-[11px] font-medium">{label}</p>
        <p className="text-gray-900 text-xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-gray-400 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const REFETCH_MS = 30_000;

export default function AdminDashboard() {
  const { data: summary, dataUpdatedAt: sumUpdated, refetch: refetchSum, isFetching: fetchingSum } = useQuery({
    queryKey: ["dash-summary"],
    queryFn: fetchSummary,
    refetchInterval: REFETCH_MS,
  });

  const { data: steps, dataUpdatedAt: stepsUpdated, refetch: refetchSteps, isFetching: fetchingSteps } = useQuery({
    queryKey: ["dash-steps"],
    queryFn: fetchSteps,
    refetchInterval: REFETCH_MS,
  });

  const { data: ab, dataUpdatedAt: abUpdated, refetch: refetchAB, isFetching: fetchingAB } = useQuery({
    queryKey: ["dash-ab"],
    queryFn: fetchAB,
    refetchInterval: REFETCH_MS,
  });

  const isFetching = fetchingSum || fetchingSteps || fetchingAB;
  const lastUpdate = new Date(Math.max(sumUpdated, stepsUpdated, abUpdated));

  const refresh = () => { refetchSum(); refetchSteps(); refetchAB(); };

  const hoje = summary?.hoje;
  const total = summary?.total;

  // Best A/B variant by conv%
  const bestAB = ab?.length ? ab.reduce((best, row) => row.conv_pct > best.conv_pct ? row : best, ab[0]) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-gray-900 font-bold text-base">Dashboard de Conversão</h1>
          <p className="text-gray-400 text-[11px]">
            Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · auto-refresh 30s
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isFetching}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </header>

      <main className="px-3 py-4 max-w-2xl mx-auto space-y-5">

        {/* Hoje */}
        <section>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Hoje</p>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Receita hoje" value={fmt(hoje?.receita ?? 0)} icon={DollarSign} accent="bg-emerald-500" />
            <StatCard label="Conversão hoje" value={`${hoje?.conv_pct ?? 0}%`} sub={`${hoje?.pagos ?? 0} de ${hoje?.total_pix ?? 0} PIX`} icon={TrendingUp} accent="bg-blue-500" />
          </div>
        </section>

        {/* Total geral */}
        <section>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Total acumulado</p>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Receita total" value={fmt(total?.receita ?? 0)} icon={DollarSign} accent="bg-violet-500" />
            <StatCard label="Pagamentos" value={`${total?.pagos ?? 0}`} sub={`${total?.conv_pct ?? 0}% de ${total?.total_pix ?? 0} PIX`} icon={Users} accent="bg-orange-400" />
          </div>
        </section>

        {/* A/B Test TENF */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">A/B Test — TENF</p>
            {bestAB && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                Líder: {AB_LABELS[bestAB.ab_variant] ?? bestAB.ab_variant}
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header da tabela */}
            <div className="grid grid-cols-[1fr_56px_56px_64px_72px] gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
              {["Variante", "PIX", "Pagos", "Conv%", "Receita"].map(h => (
                <span key={h} className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {!ab?.length ? (
              <p className="text-gray-400 text-xs text-center py-8">Aguardando tráfego…</p>
            ) : (
              ab.map((row, i) => {
                const isBest = row.ab_variant === bestAB?.ab_variant;
                return (
                  <div
                    key={row.ab_variant}
                    className={`grid grid-cols-[1fr_56px_56px_64px_72px] gap-x-2 px-4 py-3 items-center border-b border-gray-50 last:border-0 ${isBest ? "bg-emerald-50/40" : ""}`}
                  >
                    <div>
                      <p className="text-gray-800 text-xs font-semibold flex items-center gap-1">
                        {AB_LABELS[row.ab_variant] ?? row.ab_variant}
                        {isBest && <span className="text-emerald-500 text-[9px] font-bold">★ LÍDER</span>}
                      </p>
                      <ConvBar pct={row.conv_pct} />
                    </div>
                    <span className="text-gray-500 text-xs">{row.gerados}</span>
                    <span className="text-gray-700 text-xs font-medium">{row.pagos}</span>
                    <span className={`text-xs font-bold ${convColor(row.conv_pct)}`}>{row.conv_pct}%</span>
                    <span className="text-gray-600 text-xs">{fmt(row.receita)}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Funil por etapa */}
        <section>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Funil por etapa</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_52px_52px_58px_70px] gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
              {["Etapa", "PIX", "Pagos", "Conv%", "Receita"].map(h => (
                <span key={h} className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {!steps?.length ? (
              <p className="text-gray-400 text-xs text-center py-8">Carregando…</p>
            ) : (
              steps.map(row => (
                <div key={row.payment_type} className="grid grid-cols-[1fr_52px_52px_58px_70px] gap-x-2 px-4 py-2.5 items-center border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-gray-700 text-xs font-medium">{STEP_LABELS[row.payment_type] ?? row.payment_type}</p>
                    <ConvBar pct={row.conv_pct} />
                  </div>
                  <span className="text-gray-400 text-xs">{row.gerados.toLocaleString("pt-BR")}</span>
                  <span className="text-gray-700 text-xs font-medium">{row.pagos.toLocaleString("pt-BR")}</span>
                  <span className={`text-xs font-bold ${convColor(row.conv_pct)}`}>{row.conv_pct}%</span>
                  <span className="text-gray-600 text-[11px]">{fmt(row.receita)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Funil de quem pagou — sequencial */}
        <section>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Quem pagou → seguiu para próxima etapa</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {!steps?.length ? (
              <p className="text-gray-400 text-xs text-center py-8">Carregando…</p>
            ) : (
              <div className="px-4 py-3 space-y-0">
                {steps.map((row, i) => {
                  const prev = i > 0 ? steps[i - 1] : null;
                  const dropPct = prev && prev.pagos > 0
                    ? Math.round((row.pagos / prev.pagos) * 1000) / 10
                    : null;

                  return (
                    <div key={row.payment_type}>
                      {/* Step row */}
                      <div className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Index bubble */}
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="text-gray-500 text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-xs font-semibold truncate">{STEP_LABELS[row.payment_type] ?? row.payment_type}</p>
                            {/* Progress bar width relative to first step */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-blue-400 h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${steps[0].pagos > 0 ? Math.min((row.pagos / steps[0].pagos) * 100, 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3 shrink-0">
                          <span className="text-gray-800 text-sm font-bold">{row.pagos.toLocaleString("pt-BR")}</span>
                          <span className="text-gray-400 text-[10px]">pagos</span>
                          <span className="text-gray-500 text-[11px] w-16 text-right">{fmt(row.receita)}</span>
                        </div>
                      </div>

                      {/* Drop-off arrow between steps */}
                      {i < steps.length - 1 && (
                        <div className="flex items-center gap-2 pl-3 pb-1">
                          <ArrowDown className="w-3 h-3 text-gray-300 ml-1.5" />
                          {dropPct !== null ? (
                            <span className={`text-[10px] font-semibold ${dropPct >= 50 ? "text-emerald-500" : dropPct >= 25 ? "text-yellow-500" : "text-red-400"}`}>
                              {dropPct}% dos pagantes da etapa anterior seguiram
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
