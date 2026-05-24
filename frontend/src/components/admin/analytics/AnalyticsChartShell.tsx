export function AnalyticsChartShell({
  title,
  children,
  loading,
  error,
  onRetry,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4">
        {loading ? (
          <div className="h-[240px] animate-pulse rounded-xl bg-white/5" />
        ) : error ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-sm text-zinc-500">
            <p>Failed to load chart</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-[#FF3EA5] hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
