import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Package, Beef, ArrowRight } from 'lucide-react';

interface CostCalculatorProps {
  city: string;
  state: string;
  distanceFromAtlanta: number;
  dieselPrice: number;
}

interface CalculationResults {
  freightSavings: number;
  pricingSavings: number;
  totalAnnualSavings: number;
}

type ProductType = 'disposables' | 'proteins' | 'both';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CostCalculator({
  city,
  state,
  distanceFromAtlanta: _distanceFromAtlanta,
  dieselPrice: _dieselPrice
}: CostCalculatorProps) {
  // Note: _distanceFromAtlanta and _dieselPrice are available for more
  // sophisticated calculations in future iterations
  const [productType, setProductType] = useState<ProductType>('disposables');
  const [monthlySpend, setMonthlySpend] = useState(12000);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const calculateSavings = () => {
    // Simplified calculation - adjust percentages as needed
    const freightSavingsPercent = productType === 'both' ? 0.08 : 0.06;
    const pricingSavingsPercent = productType === 'proteins' ? 0.12 : 0.10;

    const annualSpend = monthlySpend * 12;
    const freightSavings = annualSpend * freightSavingsPercent;
    const pricingSavings = annualSpend * pricingSavingsPercent;

    return {
      freightSavings: Math.round(freightSavings),
      pricingSavings: Math.round(pricingSavings),
      totalAnnualSavings: Math.round(freightSavings + pricingSavings),
    };
  };

  const handleCalculate = () => {
    const calculationResults = calculateSavings();
    setResults(calculationResults);
    setShowResults(true);
  };

  const handleGetQuote = () => {
    window.dispatchEvent(
      new CustomEvent('calculator-quote-request', {
        detail: { productType, monthlySpend, city, state },
      })
    );
  };

  const productTypeOptions: { value: ProductType; label: string; icon: React.ReactNode }[] = [
    { value: 'disposables', label: 'Disposables', icon: <Package className="w-4 h-4" /> },
    { value: 'proteins', label: 'Proteins', icon: <Beef className="w-4 h-4" /> },
    { value: 'both', label: 'Both', icon: (
      <span className="flex items-center gap-0.5">
        <Package className="w-3.5 h-3.5" />
        <Beef className="w-3.5 h-3.5" />
      </span>
    )},
  ];

  return (
    <section className="py-16 bg-slate-50" id="calculator">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Calculate Your Potential Savings
          </h2>
          <p className="text-lg text-slate-600">
            See how much you could save with Atlanta warehouse-direct pricing delivered to {city}.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Side - Inputs */}
              <div className="p-6 space-y-6">
                {/* Product Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-slate-900">
                    What are you looking for?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {productTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setProductType(option.value)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium
                          transition-all duration-150
                          ${productType === option.value
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                          }
                        `}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Spend Slider */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-slate-900">
                    Estimated monthly spend
                  </Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={3000}
                      max={100000}
                      step={1000}
                      value={monthlySpend}
                      onChange={(e) => setMonthlySpend(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>$3K</span>
                      <span className="text-lg font-semibold text-slate-900">
                        {formatCurrency(monthlySpend)}
                      </span>
                      <span>$100K</span>
                    </div>
                  </div>
                </div>

                {/* Pre-filled Location */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-slate-900">
                    Your location
                  </Label>
                  <div className="px-4 py-3 bg-slate-100 rounded-lg text-slate-700 font-medium">
                    {city}, {state}
                  </div>
                </div>

                {/* Calculate Button */}
                <Button
                  type="button"
                  onClick={handleCalculate}
                  className="w-full"
                  size="lg"
                >
                  Calculate Savings
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Right Side - Results */}
              <div className="p-6 bg-white">
                {showResults && results ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-1">
                        Based on {formatCurrency(monthlySpend)}/mo to {city}:
                      </p>
                    </div>

                    {/* Savings Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-700 font-medium mb-1">
                          Freight Savings
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.freightSavings)}
                        </p>
                        <p className="text-xs text-green-600">/year</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-700 font-medium mb-1">
                          Pricing Savings
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.pricingSavings)}
                        </p>
                        <p className="text-xs text-green-600">/year</p>
                      </div>
                    </div>

                    {/* Total Card */}
                    <div className="bg-orange-100 rounded-xl p-5 text-center">
                      <p className="text-sm text-orange-700 font-medium mb-1">
                        Total Annual Savings
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {formatCurrency(results.totalAnnualSavings)}
                      </p>
                      <p className="text-xs text-orange-600">/year</p>
                    </div>

                    {/* Get Quote CTA */}
                    <Button
                      type="button"
                      onClick={handleGetQuote}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      size="lg"
                    >
                      Get Your Custom Quote
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-500 text-center">
                      This is an estimate. Get an exact quote with your specific needs.
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">
                      Fill out the form and click "Calculate Savings" to see your potential savings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
