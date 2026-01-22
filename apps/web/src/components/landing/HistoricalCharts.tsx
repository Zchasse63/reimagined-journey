import { useState, useMemo } from 'react';
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
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

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

// Generate simulated historical data based on current values
const generateHistoricalData = (
  currentDryVan: number,
  currentReefer: number,
  currentDiesel: number,
  days: number
) => {
  const data = [];
  const now = new Date();

  // Seasonal factors (trucking rates tend to be higher in peak seasons)
  const getSeasonalFactor = (date: Date) => {
    const month = date.getMonth();
    // Higher rates in Q4 (holiday shipping) and Q2 (produce season)
    if (month >= 9 && month <= 11) return 1.08; // Oct-Dec
    if (month >= 3 && month <= 5) return 1.04; // Apr-Jun
    if (month >= 0 && month <= 2) return 0.95; // Jan-Mar (slow season)
    return 1.0;
  };

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const seasonalFactor = getSeasonalFactor(date);

    // Add some realistic variance (-5% to +5%)
    const variance = () => (Math.random() - 0.5) * 0.1;

    // Simulate a trend towards current values
    const trendFactor = 1 - (i / days) * 0.05; // Slight upward trend

    const dryVan = parseFloat(
      (currentDryVan * seasonalFactor * trendFactor * (1 + variance())).toFixed(2)
    );
    const reefer = parseFloat(
      (currentReefer * seasonalFactor * trendFactor * (1 + variance())).toFixed(2)
    );
    const diesel = parseFloat(
      (currentDiesel * (1 + variance() * 0.5)).toFixed(2)
    );

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      dryVan,
      reefer,
      diesel,
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

  const recent = data.slice(-7); // Last 7 days
  const earlier = data.slice(0, 7); // First 7 days

  const recentAvg = recent.reduce((sum, d) => sum + d[field], 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, d) => sum + d[field], 0) / earlier.length;

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
  const [activeChart, setActiveChart] = useState<'trucking' | 'diesel'>('trucking');

  const days = timeRange === '30d' ? 30 : timeRange === '60d' ? 60 : 90;

  const historicalData: HistoricalDataPoint[] = useMemo(
    () => generateHistoricalData(dryVanRate, reeferRate, dieselPrice, days),
    [dryVanRate, reeferRate, dieselPrice, days]
  );

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
                  onClick={() => setActiveChart('trucking')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeChart === 'trucking'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Trucking Rates
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChart('diesel')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeChart === 'diesel'
                      ? 'bg-slate-700 text-white border border-slate-700'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Diesel Prices
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
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>Illustrative Data – Trends based on market models, not live historical data</span>
              </div>
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
                        name="Dry Van"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#f59e0b' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reefer"
                        name="Refrigerated"
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
                        name="Diesel (DOE)"
                        stroke="#64748b"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#64748b' }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Dry Van Rate</p>
                  <p className="text-xl font-bold text-slate-900">${dryVanRate.toFixed(2)}/mi</p>
                </div>
                <TrendBadge direction={dryVanTrend.direction} percent={dryVanTrend.percent} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Reefer Rate</p>
                  <p className="text-xl font-bold text-slate-900">${reeferRate.toFixed(2)}/mi</p>
                </div>
                <TrendBadge direction={reeferTrend.direction} percent={reeferTrend.percent} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Diesel (DOE)</p>
                  <p className="text-xl font-bold text-slate-900">${dieselPrice.toFixed(2)}/gal</p>
                </div>
                <TrendBadge direction={dieselTrend.direction} percent={dieselTrend.percent} inverse />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Illustrative Data:</strong> Chart trends are modeled based on current rates and seasonal patterns, not actual historical data.
            Current rates shown are from ATRI and DOE sources.
          </p>
        </div>
      </div>
    </section>
  );
}
