import React from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { LeadFormData } from './lead-form-schema';
import {
  UtensilsCrossed,
  Truck,
  ChefHat,
  Building2,
  ShoppingCart,
  CloudLightning,
  HelpCircle,
} from 'lucide-react';

interface Step1Props {
  onNext: () => void;
}

const businessTypeOptions = [
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'food_truck', label: 'Food Truck', icon: Truck },
  { value: 'caterer', label: 'Caterer', icon: ChefHat },
  { value: 'institution', label: 'Institution', icon: Building2 },
  { value: 'grocery', label: 'Grocery / Retail', icon: ShoppingCart },
  { value: 'ghost_kitchen', label: 'Ghost Kitchen', icon: CloudLightning },
  { value: 'other', label: 'Other', icon: HelpCircle },
] as const;

export function Step1BusinessType({ onNext }: Step1Props) {
  const { setValue, watch, formState: { errors } } = useFormContext<LeadFormData>();
  const selectedType = watch('business_type');

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
          Select your business type to help us customize your quote.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {businessTypeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-150',
                'hover:border-primary-400 hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'min-h-[120px]',
                isSelected
                  ? 'border-primary-600 bg-primary-50 shadow-md'
                  : 'border-slate-200 bg-white'
              )}
            >
              <Icon
                className={cn(
                  'w-8 h-8 mb-3 transition-colors',
                  isSelected ? 'text-primary-600' : 'text-slate-500'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium text-center',
                  isSelected ? 'text-primary-700' : 'text-slate-700'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {errors.business_type && (
        <p className="text-sm text-red-600 text-center">
          {errors.business_type.message}
        </p>
      )}
    </div>
  );
}
