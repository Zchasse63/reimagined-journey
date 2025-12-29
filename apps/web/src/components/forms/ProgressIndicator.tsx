import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Business Type', 'Service Info', 'Contact Details'];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  step < currentStep
                    ? 'bg-primary-600 text-white'
                    : step === currentStep
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-slate-200 text-slate-500'
                )}
              >
                {step < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium hidden sm:block',
                  step <= currentStep ? 'text-primary-600' : 'text-slate-400'
                )}
              >
                {stepLabels[step - 1]}
              </span>
            </div>

            {/* Connector line */}
            {step < totalSteps && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded transition-colors',
                  step < currentStep ? 'bg-primary-600' : 'bg-slate-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
