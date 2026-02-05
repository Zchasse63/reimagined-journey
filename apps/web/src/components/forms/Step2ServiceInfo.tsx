import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productInterests, purchaseTimelines, type LeadFormData } from './lead-form-schema';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2ServiceInfo({ onNext, onBack }: Step2Props) {
  const {
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<LeadFormData>();

  const locationCount = watch('location_count');
  const selectedInterests = watch('primary_interest') || [];
  const purchaseTimeline = watch('purchase_timeline');

  const handleInterestToggle = (value: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue('primary_interest', updated, { shouldValidate: true });
  };

  const handleContinue = async () => {
    const isValid = await trigger(['location_count', 'primary_interest']);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Tell us about your needs
        </h3>
        <p className="text-slate-600">
          This helps us prepare a relevant quote for you.
        </p>
      </div>

      {/* Location Count */}
      <div className="space-y-2">
        <Label htmlFor="location_count">How many locations do you have?</Label>
        <Select
          value={locationCount?.toString()}
          onValueChange={(value) =>
            setValue('location_count', parseInt(value, 10), { shouldValidate: true })
          }
        >
          <SelectTrigger id="location_count" aria-invalid={!!errors.location_count} aria-describedby={errors.location_count ? 'location_count-error' : undefined}>
            <SelectValue placeholder="Select number of locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 location</SelectItem>
            <SelectItem value="2">2 locations</SelectItem>
            <SelectItem value="3">3-5 locations</SelectItem>
            <SelectItem value="6">6-10 locations</SelectItem>
            <SelectItem value="11">11+ locations</SelectItem>
          </SelectContent>
        </Select>
        {errors.location_count && (
          <span role="alert" id="location_count-error" className="text-sm text-red-600">{errors.location_count.message}</span>
        )}
      </div>

      {/* Product Interests */}
      <div className="space-y-3">
        <Label>What products are you interested in?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-invalid={!!errors.primary_interest} aria-describedby={errors.primary_interest ? 'primary_interest-error' : undefined}>
          {productInterests.map((interest) => (
            <label
              key={interest.value}
              className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedInterests.includes(interest.value)}
                onCheckedChange={() => handleInterestToggle(interest.value)}
              />
              <span className="text-sm text-slate-700">{interest.label}</span>
            </label>
          ))}
        </div>
        {errors.primary_interest && (
          <span role="alert" id="primary_interest-error" className="text-sm text-red-600">{errors.primary_interest.message}</span>
        )}
      </div>

      {/* Purchase Timeline */}
      <div className="space-y-2">
        <Label htmlFor="purchase_timeline">When are you looking to purchase?</Label>
        <Select
          value={purchaseTimeline}
          onValueChange={(value) =>
            setValue('purchase_timeline', value as LeadFormData['purchase_timeline'])
          }
        >
          <SelectTrigger id="purchase_timeline">
            <SelectValue placeholder="Select timeline (optional)" />
          </SelectTrigger>
          <SelectContent>
            {purchaseTimelines.map((timeline) => (
              <SelectItem key={timeline.value} value={timeline.value}>
                {timeline.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
