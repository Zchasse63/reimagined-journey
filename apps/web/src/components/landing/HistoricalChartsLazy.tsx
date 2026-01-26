import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy HistoricalCharts component (includes recharts ~500KB)
const HistoricalCharts = lazy(() => import('./HistoricalCharts'));

interface HistoricalChartsLazyProps {
  dryVanRate?: number;
  reeferRate?: number;
  dieselPrice?: number;
  fuelSurchargePercent?: number;
}

function LoadingFallback() {
  return (
    <section className="py-16 bg-white" id="historical-trends">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Market Trends
          </h2>
          <p className="text-lg text-slate-600">
            Track freight and fuel costs over time to identify patterns and plan ahead.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading charts...</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HistoricalChartsLazy(props: HistoricalChartsLazyProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HistoricalCharts {...props} />
    </Suspense>
  );
}
