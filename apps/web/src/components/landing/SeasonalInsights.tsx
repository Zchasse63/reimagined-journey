import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sun,
  Leaf,
  Snowflake,
  Flower2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Truck,
  Package,
} from 'lucide-react';

interface SeasonalInsightsProps {
  /** Current month (1-12) */
  currentMonth?: number;
}

interface SeasonInfo {
  name: string;
  icon: React.ReactNode;
  months: number[];
  freightOutlook: 'high' | 'moderate' | 'low';
  freightDescription: string;
  tips: string[];
  commodityImpacts: { commodity: string; impact: 'up' | 'down' | 'stable'; note: string }[];
}

const seasons: SeasonInfo[] = [
  {
    name: 'Winter',
    icon: <Snowflake className="w-6 h-6" />,
    months: [12, 1, 2],
    freightOutlook: 'low',
    freightDescription:
      'Post-holiday lull creates favorable shipping conditions. Carriers have more capacity, rates are typically 5-10% below annual average.',
    tips: [
      'Lock in contracts during Q1 for best annual rates',
      'Stock up on shelf-stable items while freight is cheap',
      'Plan equipment needs before spring rush',
    ],
    commodityImpacts: [
      { commodity: 'Beef', impact: 'stable', note: 'Steady demand post-holidays' },
      { commodity: 'Poultry', impact: 'down', note: 'Lower demand after holiday peak' },
      { commodity: 'Produce', impact: 'up', note: 'Winter imports drive prices higher' },
    ],
  },
  {
    name: 'Spring',
    icon: <Flower2 className="w-6 h-6" />,
    months: [3, 4, 5],
    freightOutlook: 'moderate',
    freightDescription:
      'Produce season begins, reefer demand increases. Dry van rates remain stable but refrigerated capacity tightens in April-May.',
    tips: [
      'Book reefer shipments 2+ weeks ahead',
      'Consider consolidating orders to reduce shipping frequency',
      'Review cold chain requirements for warmer weather',
    ],
    commodityImpacts: [
      { commodity: 'Produce', impact: 'down', note: 'Domestic season begins, prices drop' },
      { commodity: 'Poultry', impact: 'up', note: 'Grilling season demand increases' },
      { commodity: 'Seafood', impact: 'stable', note: 'Lent drives early Q1 spike, stabilizes' },
    ],
  },
  {
    name: 'Summer',
    icon: <Sun className="w-6 h-6" />,
    months: [6, 7, 8],
    freightOutlook: 'moderate',
    freightDescription:
      'Produce season in full swing. Reefer rates peak June-July. Driver vacations can tighten capacity unexpectedly.',
    tips: [
      'Plan for longer lead times around July 4th',
      'Monitor produce costs for seasonal opportunities',
      'Build relationships with carriers for priority capacity',
    ],
    commodityImpacts: [
      { commodity: 'Produce', impact: 'down', note: 'Peak domestic season, best prices' },
      { commodity: 'Beef', impact: 'up', note: 'Grilling season peak demand' },
      { commodity: 'Seafood', impact: 'stable', note: 'Summer catch season' },
    ],
  },
  {
    name: 'Fall',
    icon: <Leaf className="w-6 h-6" />,
    months: [9, 10, 11],
    freightOutlook: 'high',
    freightDescription:
      'Peak shipping season. Holiday inventory builds and retail pressure create 10-20% rate premiums. Capacity is tight October through Thanksgiving.',
    tips: [
      'Order holiday supplies by late September',
      'Expect 2-3 week lead times in November',
      'Consider early morning or late delivery windows',
      'Stock up before Thanksgiving rush',
    ],
    commodityImpacts: [
      { commodity: 'Poultry', impact: 'up', note: 'Thanksgiving demand spike' },
      { commodity: 'Produce', impact: 'up', note: 'Transition to imports' },
      { commodity: 'Beef', impact: 'stable', note: 'Steady fall demand' },
    ],
  },
];

const getCurrentSeason = (month: number): SeasonInfo => {
  return seasons.find((s) => s.months.includes(month)) || seasons[0];
};

const getNextSeason = (currentSeason: SeasonInfo): SeasonInfo => {
  const currentIndex = seasons.findIndex((s) => s.name === currentSeason.name);
  return seasons[(currentIndex + 1) % seasons.length];
};

const OutlookBadge = ({ outlook }: { outlook: 'high' | 'moderate' | 'low' }) => {
  const config = {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'High Rates Expected',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    moderate: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: 'Moderate Rates',
      icon: <Truck className="w-4 h-4" />,
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Favorable Rates',
      icon: <TrendingDown className="w-4 h-4" />,
    },
  };

  const { bg, text, label, icon } = config[outlook];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg} ${text} text-sm font-medium`}>
      {icon}
      {label}
    </span>
  );
};

const ImpactBadge = ({ impact }: { impact: 'up' | 'down' | 'stable' }) => {
  if (impact === 'up') {
    return <TrendingUp className="w-4 h-4 text-red-500" />;
  }
  if (impact === 'down') {
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  }
  return <div className="w-4 h-4 flex items-center justify-center text-slate-400">—</div>;
};

export default function SeasonalInsights({ currentMonth }: SeasonalInsightsProps) {
  const month = currentMonth || new Date().getMonth() + 1;

  const currentSeason = useMemo(() => getCurrentSeason(month), [month]);
  const nextSeason = useMemo(() => getNextSeason(currentSeason), [currentSeason]);

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-white" id="seasonal-insights">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Seasonal Market Insights
          </h2>
          <p className="text-lg text-slate-600">
            Understand how seasons affect freight costs and commodity prices to plan smarter.
          </p>
        </div>

        {/* Current Season Card */}
        <Card className="mb-6 overflow-hidden shadow-lg border-2 border-amber-200">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-6 py-4 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center text-amber-700">
                    {currentSeason.icon}
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Current Season</p>
                    <h3 className="text-2xl font-bold text-slate-900">{currentSeason.name}</h3>
                  </div>
                </div>
                <OutlookBadge outlook={currentSeason.freightOutlook} />
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-700 mb-6">{currentSeason.freightDescription}</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tips */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-600" />
                    Planning Tips
                  </h4>
                  <ul className="space-y-2">
                    {currentSeason.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-amber-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Commodity Impacts */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Commodity Price Trends
                  </h4>
                  <div className="space-y-2">
                    {currentSeason.commodityImpacts.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <ImpactBadge impact={item.impact} />
                          <span className="font-medium text-slate-900">{item.commodity}</span>
                        </div>
                        <span className="text-xs text-slate-500">{item.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Season Preview */}
        <Card className="overflow-hidden bg-slate-100 border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                  {nextSeason.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Coming Up</p>
                  <h4 className="text-lg font-semibold text-slate-700">{nextSeason.name}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <OutlookBadge outlook={nextSeason.freightOutlook} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3">{nextSeason.freightDescription}</p>
          </CardContent>
        </Card>

        {/* Season Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {seasons.map((season) => (
            <div
              key={season.name}
              className={`p-4 rounded-lg border text-center transition-all ${
                season.name === currentSeason.name
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  season.name === currentSeason.name
                    ? 'bg-amber-200 text-amber-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {season.icon}
              </div>
              <p
                className={`text-sm font-medium ${
                  season.name === currentSeason.name ? 'text-amber-800' : 'text-slate-700'
                }`}
              >
                {season.name}
              </p>
              <p
                className={`text-xs mt-1 ${
                  season.name === currentSeason.name ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                {season.freightOutlook === 'high'
                  ? 'Peak rates'
                  : season.freightOutlook === 'low'
                    ? 'Low rates'
                    : 'Moderate'}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Seasonal patterns based on historical freight market data. Actual conditions may vary.
        </p>
      </div>
    </section>
  );
}
