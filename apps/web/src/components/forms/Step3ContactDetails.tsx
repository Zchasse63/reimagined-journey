import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LeadFormData } from './lead-form-schema';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Step3Props {
  onBack: () => void;
  isSubmitting: boolean;
}

export function Step3ContactDetails({ onBack, isSubmitting }: Step3Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Almost done! How can we reach you?
        </h3>
        <p className="text-slate-600">
          We'll send your custom quote to this email.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            {...register('company_name')}
            error={!!errors.company_name}
            placeholder="Your business name"
          />
          {errors.company_name && (
            <p className="text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            error={!!errors.first_name}
            placeholder="John"
          />
          {errors.first_name && (
            <p className="text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            error={!!errors.last_name}
            placeholder="Smith"
          />
          {errors.last_name && (
            <p className="text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            placeholder="john@restaurant.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="(555) 123-4567"
          />
          <p className="text-xs text-slate-500">For faster response</p>
        </div>

        {/* Current Distributor */}
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="current_distributor">Current Distributor (Optional)</Label>
          <Input
            id="current_distributor"
            {...register('current_distributor')}
            placeholder="e.g., Sysco, US Foods, Restaurant Depot"
          />
          <p className="text-xs text-slate-500">Helps us understand your needs better</p>
        </div>
      </div>

      {/* Honeypot field - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website (Leave empty)</Label>
        <Input
          id="website"
          {...register('website')}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Navigation & Submit */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Get My Quote'
          )}
        </Button>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-slate-500 text-center">
        By submitting this form, you agree to receive communications from Value Source.
        We respect your privacy and will never share your information.
      </p>
    </div>
  );
}
