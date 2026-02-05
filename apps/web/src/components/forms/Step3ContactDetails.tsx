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
            aria-invalid={!!errors.company_name}
            aria-describedby={errors.company_name ? 'company_name-error' : undefined}
          />
          {errors.company_name && (
            <span role="alert" id="company_name-error" className="text-sm text-red-600">{errors.company_name.message}</span>
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
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
          />
          {errors.first_name && (
            <span role="alert" id="first_name-error" className="text-sm text-red-600">{errors.first_name.message}</span>
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
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
          />
          {errors.last_name && (
            <span role="alert" id="last_name-error" className="text-sm text-red-600">{errors.last_name.message}</span>
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
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span role="alert" id="email-error" className="text-sm text-red-600">{errors.email.message}</span>
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
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span role="alert" id="phone-error" className="text-sm text-red-600">{errors.phone.message}</span>
          )}
          <p className="text-xs text-slate-500">For faster response</p>
        </div>

        {/* Current Distributor */}
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="current_distributor">Current Distributor (Optional)</Label>
          <Input
            id="current_distributor"
            {...register('current_distributor')}
            placeholder="e.g., Sysco, US Foods, Restaurant Depot"
            aria-invalid={!!errors.current_distributor}
            aria-describedby={errors.current_distributor ? 'current_distributor-error' : undefined}
          />
          {errors.current_distributor && (
            <span role="alert" id="current_distributor-error" className="text-sm text-red-600">{errors.current_distributor.message}</span>
          )}
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
