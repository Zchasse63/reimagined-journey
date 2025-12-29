import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Fuel, Package, Drumstick } from 'lucide-react';
import { fetchMarketInsights, type MarketInsights as MarketInsightsType } from '@/lib/api';

interface MarketInsightsProps {
  state: string;
}

export function MarketInsights({ state }: MarketInsightsProps) {
  const [data, setData] = useState<MarketInsightsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const insights = await fetchMarketInsights(state);
      if (insights) {
        setData(insights);
      } else {
        setError('Unable to load market data');
      }

      setLoading(false);
    }

    loadData();
  }, [state]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Gracefully hide if no data available
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up')
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'down')
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
        Market Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Diesel Prices */}
        {data.dieselPrices && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Fuel className="w-4 h-4 text-slate-500 mr-2" />
                <span className="text-sm font-medium text-slate-600">Diesel</span>
              </div>
              <TrendIcon trend={data.dieselPrices.trend} />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${data.dieselPrices.pricePerGallon.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500">
              {data.dieselPrices.regionName} avg
            </div>
            {data.dieselPrices.changePercent !== null && (
              <div
                className={`text-xs mt-1 ${
                  data.dieselPrices.changePercent > 0
                    ? 'text-red-600'
                    : data.dieselPrices.changePercent < 0
                    ? 'text-green-600'
                    : 'text-slate-500'
                }`}
              >
                {formatPercent(data.dieselPrices.changePercent)} vs last week
              </div>
            )}
          </div>
        )}

        {/* Packaging PPI */}
        {data.ppiTrends.packaging && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Package className="w-4 h-4 text-slate-500 mr-2" />
                <span className="text-sm font-medium text-slate-600">Packaging</span>
              </div>
              {data.ppiTrends.packaging.changeAnnual !== null && (
                <TrendIcon
                  trend={
                    data.ppiTrends.packaging.changeAnnual > 1
                      ? 'up'
                      : data.ppiTrends.packaging.changeAnnual < -1
                      ? 'down'
                      : 'stable'
                  }
                />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data.ppiTrends.packaging.value.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">PPI Index</div>
            {data.ppiTrends.packaging.changeAnnual !== null && (
              <div
                className={`text-xs mt-1 ${
                  data.ppiTrends.packaging.changeAnnual > 0
                    ? 'text-red-600'
                    : data.ppiTrends.packaging.changeAnnual < 0
                    ? 'text-green-600'
                    : 'text-slate-500'
                }`}
              >
                {formatPercent(data.ppiTrends.packaging.changeAnnual)} YoY
              </div>
            )}
          </div>
        )}

        {/* Proteins PPI */}
        {data.ppiTrends.proteins && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Drumstick className="w-4 h-4 text-slate-500 mr-2" />
                <span className="text-sm font-medium text-slate-600">Proteins</span>
              </div>
              {data.ppiTrends.proteins.changeAnnual !== null && (
                <TrendIcon
                  trend={
                    data.ppiTrends.proteins.changeAnnual > 1
                      ? 'up'
                      : data.ppiTrends.proteins.changeAnnual < -1
                      ? 'down'
                      : 'stable'
                  }
                />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data.ppiTrends.proteins.value.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">PPI Index</div>
            {data.ppiTrends.proteins.changeAnnual !== null && (
              <div
                className={`text-xs mt-1 ${
                  data.ppiTrends.proteins.changeAnnual > 0
                    ? 'text-red-600'
                    : data.ppiTrends.proteins.changeAnnual < 0
                    ? 'text-green-600'
                    : 'text-slate-500'
                }`}
              >
                {formatPercent(data.ppiTrends.proteins.changeAnnual)} YoY
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-400 text-right">
        Data from EIA & BLS • Updated{' '}
        {new Date(data.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
}
