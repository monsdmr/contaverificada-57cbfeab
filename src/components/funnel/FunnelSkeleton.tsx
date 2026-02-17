const FunnelSkeleton = () => (
  <div className="min-h-screen bg-black flex flex-col animate-pulse">
    {/* Header skeleton */}
    <div className="py-4 px-4 flex items-center justify-center gap-2.5 border-b border-white/10">
      <div className="h-7 w-7 rounded bg-white/10" />
      <div className="h-4 w-32 rounded bg-white/10" />
    </div>

    {/* Body skeleton */}
    <div className="flex-1 px-5 pt-8 pb-6 flex flex-col items-center gap-4">
      {/* Title area */}
      <div className="h-5 w-48 rounded bg-white/10" />
      <div className="h-4 w-64 rounded bg-white/[0.06]" />

      {/* Main card skeleton */}
      <div className="w-full max-w-sm mt-4 rounded-2xl border border-white/10 p-6 flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/[0.06]" />
        <div className="h-10 w-full rounded-xl bg-white/10 mt-2" />
      </div>

      {/* Info rows */}
      <div className="w-full max-w-sm flex flex-col gap-2 mt-4">
        <div className="h-3 w-full rounded bg-white/[0.06]" />
        <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
        <div className="h-3 w-4/6 rounded bg-white/[0.06]" />
      </div>

      {/* CTA button skeleton */}
      <div className="w-full max-w-sm mt-6 h-12 rounded-xl bg-white/10" />
    </div>
  </div>
);

export default FunnelSkeleton;
