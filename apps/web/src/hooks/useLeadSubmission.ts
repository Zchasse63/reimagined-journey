import { useState, useCallback } from 'react';

interface LeadFormData {
  [key: string]: unknown;
  website?: string;
}

interface UseLeadSubmissionReturn {
  submitLead: (data: LeadFormData) => Promise<{ success: boolean; leadId?: string; error?: string }>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

export function useLeadSubmission(): UseLeadSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  const submitLead = useCallback(async (data: LeadFormData) => {
    // Honeypot check
    if (data.website && String(data.website).length > 0) {
      setIsSuccess(true);
      return { success: true, leadId: 'honeypot' };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        return result;
      } else {
        setError(result.error || 'Submission failed');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitLead, isSubmitting, isSuccess, error, reset };
}
