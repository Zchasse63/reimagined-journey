import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { LeadFormData } from './lead-form-schema';
import {
  Building2,
  Warehouse,
  Users,
  Truck,
  Package,
  Store,
  UtensilsCrossed,
  ChefHat,
  ShoppingCart,
  Building,
  CloudLightning,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Step1Props {
  onNext: () => void;
}

// PRIMARY B2B CUSTOMERS - These are our actual target customers
const primaryBusinessTypes = [
  { value: 'regional_distributor', label: 'Regional Distributor', icon: Truck, description: 'Multi-state or regional food distribution' },
  { value: 'wholesaler', label: 'Wholesaler', icon: Warehouse, description: 'Wholesale food products distribution' },
  { value: 'buying_group', label: 'Buying Group / Co-op', icon: Users, description: 'Purchasing cooperative or buying group' },
  { value: 'broadliner', label: 'Broadline Distributor', icon: Package, description: 'Full-line foodservice distribution' },
  { value: 'specialty_distributor', label: 'Specialty Distributor', icon: Building2, description: 'Specialty or niche product focus' },
  { value: 'cash_and_carry', label: 'Cash & Carry', icon: Store, description: 'Cash and carry wholesale operation' },
] as const;

// SECONDARY - End-users we can refer to our distribution partners
const secondaryBusinessTypes = [
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'food_truck', label: 'Food Truck', icon: Truck },
  { value: 'caterer', label: 'Caterer', icon: ChefHat },
  { value: 'institution', label: 'Institution', icon: Building },
  { value: 'grocery', label: 'Grocery / Retail', icon: ShoppingCart },
  { value: 'ghost_kitchen', label: 'Ghost Kitchen', icon: CloudLightning },
] as const;

export function Step1BusinessType({ onNext }: Step1Props) {
  const { setValue, watch, formState: { errors } } = useFormContext<LeadFormData>();
  const selectedType = watch('business_type');
  const [showEndUsers, setShowEndUsers] = useState(false);

  const handleSelect = (value: string) => {
    setValue('business_type', value as LeadFormData['business_type'], { shouldValidate: true });
    // Auto-advance after short delay for better UX
    setTimeout(() => {
      onNext();
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          What type of business are you?
        </h3>
        <p className="text-slate-600">
          We work primarily with distributors and wholesalers.
        </p>
      </div>

      {/* Primary B2B Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700 px-1">Distribution & Wholesale</p>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          aria-describedby={errors.business_type ? 'business_type-error' : undefined}
        >
          {primaryBusinessTypes.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-150',
                  'hover:border-primary-400 hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  'min-h-[100px]',
                  isSelected
                    ? 'border-primary-600 bg-primary-50 shadow-md'
                    : 'border-slate-200 bg-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-7 h-7 mb-2 transition-colors',
                    isSelected ? 'text-primary-600' : 'text-slate-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium text-center leading-tight',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Other option */}
      <button
        type="button"
        onClick={() => handleSelect('other')}
        className={cn(
          'w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-150',
          'hover:border-primary-400 hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          selectedType === 'other'
            ? 'border-primary-600 bg-primary-50 shadow-md'
            : 'border-slate-200 bg-white'
        )}
      >
        <HelpCircle
          className={cn(
            'w-5 h-5 transition-colors',
            selectedType === 'other' ? 'text-primary-600' : 'text-slate-500'
          )}
        />
        <span
          className={cn(
            'text-sm font-medium',
            selectedType === 'other' ? 'text-primary-700' : 'text-slate-700'
          )}
        >
          Other Business Type
        </span>
      </button>

      {/* Expandable End-User Section */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => setShowEndUsers(!showEndUsers)}
          className="w-full flex items-center justify-between text-sm text-slate-500 hover:text-slate-700 transition-colors px-1"
        >
          <span>Restaurant, Food Truck, or other end-user?</span>
          {showEndUsers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showEndUsers && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-500 px-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
              We primarily serve distributors, but we can connect you with one of our distribution partners in your area.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {secondaryBusinessTypes.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-150',
                      'hover:border-amber-400 hover:shadow-sm',
                      'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                      'min-h-[80px]',
                      isSelected
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mb-1.5 transition-colors',
                        isSelected ? 'text-amber-600' : 'text-slate-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium text-center',
                        isSelected ? 'text-amber-700' : 'text-slate-600'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {errors.business_type && (
        <span role="alert" id="business_type-error" className="text-sm text-red-600 text-center block">
          {errors.business_type.message}
        </span>
      )}
    </div>
  );
}
