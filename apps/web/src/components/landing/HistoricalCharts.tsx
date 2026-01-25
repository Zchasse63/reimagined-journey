import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DieselPriceRecord {
  week_of: string;
  region: string;
  price_per_gallon: number;
  change_from_prior_week: number | null;
}

interface HistoricalDataPoint {
  date: string;
  fullDate: string;
  dryVan: number;
  reefer: number;
  diesel: number;
}

interface HistoricalChartsProps {
  /** Current dry van rate per mile */
  dryVanRate?: number;
  /** Current reefer rate per mile */
  reeferRate?: number;
  /** Current diesel price */
  dieselPrice?: number;
  /** Current fuel surcharge percent */
  fuelSurchargePercent?: number;
}

type TimeRange = '30d' | '60d' | '90d';

// Generate estimated trucking data based on current values and seasonal patterns
// Note: This is estimated data - historical trucking rates are not tracked
const generateEstimatedTruckingData = (
  currentDryVan: number,
  currentReefer: number,
  days: number
) => {
  const data = [];
  const now = new Date();

  // Seasonal factors (trucking rates tend to be higher in peak seasons)
  const getSeasonalFactor = (date: Date) => {
    const month = date.getMonth();
    if (month >= 9 && month <= 11) return 1.08; // Oct-Dec (holiday shipping)
    if (month >= 3 && month <= 5) return 1.04; // Apr-Jun (produce season)
    if (month >= 0 && month <= 2) return 0.95; // Jan-Mar (slow season)
    return 1.0;
  };

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const seasonalFactor = getSeasonalFactor(date);
    // Small deterministic variance based on day number (not random)
    const dayVariance = Math.sin(i * 0.3) * 0.03;
    const trendFactor = 1 - (i / days) * 0.03;

    const dryVan = parseFloat(
      (currentDryVan * seasonalFactor * trendFactor * (1 + dayVariance)).toFixed(2)
    );
    const reefer = parseFloat(
      (currentReefer * seasonalFactor * trendFactor * (1 + dayVariance)).toFixed(2)
    );

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      dryVan,
      reefer,
      diesel: 0, // Will be filled from real data
    });
  }

  return data;
};

// Calculate trend from historical data
const calculateTrend = (
  data: HistoricalDataPoint[],
  field: 'dryVan' | 'reefer' | 'diesel'
) => {
  if (data.length < 2) return { direction: 'stable', percent: 0 };

  const recent = data.slice(-7);
  const earlier = data.slice(0, 7);

  const recentAvg = recent.reduce((sum, d) => sum + d[field], 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, d) => sum + d[field], 0) / earlier.length;

  if (earlierAvg === 0) return { direction: 'stable', percent: 0 };

  const percentChange = ((recentAvg - earlierAvg) / earlierAvg) * 100;

  return {
    direction: percentChange > 1 ? 'up' : percentChange < -1 ? 'down' : 'stable',
    percent: Math.abs(percentChange),
  };
};

const TrendBadge = ({
  direction,
  percent,
  inverse = false,
}: {
  direction: string;
  percent: number;
  inverse?: boolean;
}) => {
  const isPositive = inverse ? direction === 'down' : direction === 'up';
  const isNegative = inverse ? direction === 'up' : direction === 'down';

  if (direction === 'stable') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
        <Minus className="w-3 h-3" />
        Stable
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
        isNegative
          ? 'bg-red-100 text-red-700'
          : isPositive
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
      }`}
    >
      {direction === 'up' ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {percent.toFixed(1)}%
    </span>
  );
};

export default function HistoricalCharts({
  dryVanRate = 2.26,
  reeferRate = 2.83,
  dieselPrice = 3.50,
}: HistoricalChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeChart, setActiveChart] = useState<'trucking' | 'diesel'>('diesel');
  const [dieselHistory, setDieselHistory] = useState<DieselPriceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  const days = timeRange === '30d' ? 30 : timeRange === '60d' ? 60 : 90;

  // Fetch real diesel price history from Supabase
  useEffect(() => {
    async function fetchDieselHistory() {
      setIsLoading(true);
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        const { data, error } = await supabase
          .from('diesel_prices')
          .select('week_of, region, price_per_gallon, change_from_prior_week')
          .eq('region', 'LOWER_ATLANTIC')
          .gte('week_of', startDate.toISOString().split('T')[0])
          .order('week_of', { ascending: true });

        if (error) {
          console.error('Error fetching diesel history:', error);
          setHasRealData(false);
        } else if (data && data.length > 0) {
          setDieselHistory(data);
          setHasRealData(true);
        } else {
          setHasRealData(false);
        }
      } catch (err) {
        console.error('Failed to fetch diesel history:', err);
        setHasRealData(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDieselHistory();
  }, []);

  // Combine estimated trucking data with real diesel data
  const historicalData: HistoricalDataPoint[] = useMemo(() => {
    const truckingData = generateEstimatedTruckingData(dryVanRate, reeferRate, days);

    if (hasRealData && dieselHistory.length > 0) {
      // Create a map of diesel prices by date
      const dieselByDate = new Map<string, number>();
      dieselHistory.forEach((record) => {
        dieselByDate.set(record.week_of, record.price_per_gallon);
      });

      // Merge diesel data into trucking data
      return truckingData.map((point) => {
        // Find the closest diesel price for this date
        let closestPrice = dieselPrice;
        let minDiff = Infinity;

        dieselHistory.forEach((record) => {
          const recordDate = new Date(record.week_of);
          const pointDate = new Date(point.fullDate);
          const diff = Math.abs(recordDate.getTime() - pointDate.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestPrice = record.price_per_gallon;
          }
        });

        return {
          ...point,
          diesel: closestPrice,
        };
      });
    }

    // Fall back to estimated diesel data if no real data
    return truckingData.map((point, i) => ({
      ...point,
      diesel: dieselPrice * (1 + Math.sin(i * 0.2) * 0.02),
    }));
  }, [dryVanRate, reeferRate, dieselPrice, days, dieselHistory, hasRealData]);

  const dryVanTrend = useMemo(
    () => calculateTrend(historicalData, 'dryVan'),
    [historicalData]
  );
  const reeferTrend = useMemo(
    () => calculateTrend(historicalData, 'reefer'),
    [historicalData]
  );
  const dieselTrend = useMemo(
    () => calculateTrend(historicalData, 'diesel'),
    [historicalData]
  );

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

        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-slate-200 bg-slate-50">
              {/* Chart Type Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveChart('diesel')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeChart === 'diesel'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Diesel Prices
                  {hasRealData && (
                    <span className="ml-1.5 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChart('trucking')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeChart === 'trucking'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Trucking Rates
                  <span className="ml-1.5 text-xs bg-slate-500 text-white px-1.5 py-0.5 rounded">
                    Est.
                  </span>
                </button>
              </div>

              {/* Time Range Toggle */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1">
                  {(['30d', '60d', '90d'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        timeRange === range
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-6">
              {/* Data source indicator */}
              {activeChart === 'diesel' ? (
                hasRealData ? (
                  <div className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-md mb-3 flex items-center gap-2">
                    <span>✓</span>
                    <span>Real Data – Weekly diesel prices from EIA (U.S. Energy Information Administration)</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Estimated Data – Historical diesel data unavailable. Showing estimates based on current price.</span>
                  </div>
                )
              ) : (
                <div className="text-xs text-amber-700 bg-amber-100 border border-amber-300 px-3 py-2 rounded-md mb-3 flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span><strong>Illustrative Only</strong> – This chart shows estimated trends based on ATRI averages and seasonal patterns. It does not represent actual historical rates. Contact us for current market pricing.</span>
                </div>
              )}

              {isLoading ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'trucking' ? (
                      <LineChart
                        data={historicalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          interval={Math.floor(days / 6)}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                          domain={['dataMin - 0.1', 'dataMax + 0.1']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          labelStyle={{ color: '#94a3b8' }}
                          formatter={(value: number) => [`$${value.toFixed(2)}/mi`, '']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="dryVan"
                          name="Dry Van (Est.)"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: '#f59e0b' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="reefer"
                          name="Refrigerated (Est.)"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: '#3b82f6' }}
                        />
                      </LineChart>
                    ) : (
                      <LineChart
                        data={historicalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          interval={Math.floor(days / 6)}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                          domain={['dataMin - 0.1', 'dataMax + 0.1']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          labelStyle={{ color: '#94a3b8' }}
                          formatter={(value: number) => [`$${value.toFixed(2)}/gal`, '']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="diesel"
                          name={hasRealData ? 'Diesel (EIA)' : 'Diesel (Est.)'}
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: '#22c55e' }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Dry Van Rate</p>
                  <p className="text-xl font-bold text-slate-900">${dryVanRate.toFixed(2)}/mi</p>
                  <p className="text-xs text-slate-400">ATRI avg.</p>
                </div>
                <TrendBadge direction={dryVanTrend.direction} percent={dryVanTrend.percent} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Reefer Rate</p>
                  <p className="text-xl font-bold text-slate-900">${reeferRate.toFixed(2)}/mi</p>
                  <p className="text-xs text-slate-400">ATRI avg.</p>
                </div>
                <TrendBadge direction={reeferTrend.direction} percent={reeferTrend.percent} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Diesel</p>
                  <p className="text-xl font-bold text-slate-900">${dieselPrice.toFixed(2)}/gal</p>
                  <p className="text-xs text-slate-400">{hasRealData ? 'EIA weekly' : 'DOE avg.'}</p>
                </div>
                <TrendBadge direction={dieselTrend.direction} percent={dieselTrend.percent} inverse />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-600">
            <strong>Data Sources:</strong> Diesel prices from U.S. Energy Information Administration (EIA) weekly reports.
            Trucking rates are estimates based on ATRI national averages and seasonal patterns.
          </p>
        </div>
      </div>
    </section>
  );
}
