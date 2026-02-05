import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, type LeadFormData } from './lead-form-schema';
import { Step1BusinessType } from './Step1BusinessType';
import { Step2ServiceInfo } from './Step2ServiceInfo';
import { Step3ContactDetails } from './Step3ContactDetails';
import { ProgressIndicator } from './ProgressIndicator';
import { CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';

interface LeadFormProps {
  sourceCity?: string;
  sourceState?: string;
  sourcePage?: string;
}

export function LeadForm({ sourceCity, sourceState, sourcePage }: LeadFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      business_type: undefined,
      location_count: 1,
      primary_interest: [],
      purchase_timeline: undefined,
      company_name: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      current_distributor: '',
      website: '', // Honeypot
    },
    mode: 'onChange',
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: LeadFormData) => {
    // Check honeypot
    if (data.website && data.website.length > 0) {
      // Bot detected, silently fail
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);

      const leadData = {
        ...data,
        source_city: sourceCity,
        source_state: sourceState,
        source_page: sourcePage || window.location.pathname,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
      };

      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit lead');
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setError(`There was an error submitting your request. Please try again or call us directly at ${SITE_CONFIG.company.phone}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12" role="status" aria-live="polite">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-primary-600" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-2">
          Thank You!
        </h3>
        <p className="text-slate-600 mb-6">
          We've received your request and will be in touch within 24 hours.
        </p>
        <p className="text-sm text-slate-500">
          Need immediate assistance? Call us at{' '}
          <a href={`tel:${SITE_CONFIG.company.phoneRaw}`} className="text-primary-600 font-medium hover:underline">
            {SITE_CONFIG.company.phone}
          </a>
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <ProgressIndicator currentStep={currentStep} totalSteps={3} />

        {currentStep === 1 && (
          <Step1BusinessType onNext={nextStep} />
        )}

        {currentStep === 2 && (
          <Step2ServiceInfo onNext={nextStep} onBack={prevStep} />
        )}

        {currentStep === 3 && (
          <Step3ContactDetails
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}

        {error && (
          <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
