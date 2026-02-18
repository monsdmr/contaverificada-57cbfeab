const FunnelSkeleton = () => (
  <div className="min-h-screen bg-white flex flex-col animate-pulse">
    {/* Header skeleton */}
    <div className="py-4 px-4 flex items-center justify-center gap-2.5 border-b border-gray-100">
      <div className="h-7 w-7 rounded bg-gray-100" />
      <div className="h-4 w-32 rounded bg-gray-100" />
    </div>

    {/* Body skeleton */}
    <div className="flex-1 px-5 pt-8 pb-6 flex flex-col items-center gap-4">
      <div className="h-5 w-48 rounded bg-gray-100" />
      <div className="h-4 w-64 rounded bg-gray-50" />

      <div className="w-full max-w-sm mt-4 rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-50" />
        <div className="h-10 w-full rounded-xl bg-gray-100 mt-2" />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-2 mt-4">
        <div className="h-3 w-full rounded bg-gray-50" />
        <div className="h-3 w-5/6 rounded bg-gray-50" />
        <div className="h-3 w-4/6 rounded bg-gray-50" />
      </div>

      <div className="w-full max-w-sm mt-6 h-12 rounded-xl bg-gray-100" />
    </div>
  </div>
);

export default FunnelSkeleton;
