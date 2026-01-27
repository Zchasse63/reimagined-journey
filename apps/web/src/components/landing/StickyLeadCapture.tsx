import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ArrowRight, X } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';

const DISMISS_STORAGE_KEY = 'stickyLeadCaptureDismissed';

interface StickyLeadCaptureProps {
  phoneNumber?: string;
}

interface FormData {
  businessName: string;
  email: string;
  phone: string;
  contactName: string;
  businessType: string;
}

export default function StickyLeadCapture({ phoneNumber = SITE_CONFIG.company.phone }: StickyLeadCaptureProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    email: '',
    phone: '',
    contactName: '',
    businessType: 'other',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if previously dismissed this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    if (wasDismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 600; // approximate hero height
      const footerOffset = document.body.scrollHeight - window.innerHeight - 200;

      setIsVisible(scrollY > heroHeight && scrollY < footerOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
  };

  const canSubmit =
    formData.businessName.trim().length >= 2 &&
    formData.contactName.trim().length >= 2 &&
    formData.email.trim() !== '' &&
    formData.email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: formData.businessType,
          businessName: formData.businessName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          productInterests: ['disposables'], // Default interest for quick capture
          source: 'sticky_sidebar',
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Don't render if not visible or dismissed
  if (!isVisible || isDismissed) return null;

  return (
    <>
      {/* Desktop Sidebar - hidden on tablets (md), shown on lg+ */}
      <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 w-64 bg-white rounded-xl shadow-2xl p-4 z-40">
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors shadow-sm"
          aria-label="Close quote form"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">Thank you!</p>
            <p className="text-xs text-slate-600 mt-1">We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Quick Quote</h3>

            <div className="space-y-1">
              <Label htmlFor="sticky-contactName" className="text-xs text-slate-600">
                Your Name
              </Label>
              <Input
                id="sticky-contactName"
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                placeholder="John Doe"
                className="h-9 text-sm"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sticky-businessName" className="text-xs text-slate-600">
                Business Name
              </Label>
              <Input
                id="sticky-businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="Your business"
                className="h-9 text-sm"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sticky-email" className="text-xs text-slate-600">
                Email
              </Label>
              <Input
                id="sticky-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@business.com"
                className="h-9 text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sticky-phone" className="text-xs text-slate-600">
                Phone (optional)
              </Label>
              <Input
                id="sticky-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="h-9 text-sm"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="sm"
            >
              {isSubmitting ? 'Sending...' : 'Get Started'}
              {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <div className="pt-2 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-1">or call</p>
              <a
                href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                {phoneNumber}
              </a>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-3 z-40">
        <div className="flex gap-3">
          <a
            href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
          <Button
            type="button"
            onClick={scrollToForm}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            Get Quote
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
