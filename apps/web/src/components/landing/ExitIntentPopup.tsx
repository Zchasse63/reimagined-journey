import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, CheckCircle } from 'lucide-react';

interface ExitIntentPopupProps {
  city: string;
}

const SESSION_STORAGE_KEY = 'exitIntentShown';
const MIN_TIME_ON_PAGE = 30000; // 30 seconds

export default function ExitIntentPopup({ city }: ExitIntentPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check sessionStorage on mount
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    if (alreadyShown) {
      setHasShown(true);
    }
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setTimeOnPage(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !hasShown && timeOnPage > MIN_TIME_ON_PAGE) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown, timeOnPage]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPopup) {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPopup]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  const canSubmit = email.trim() !== '' && email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'exit_intent',
          city,
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

  if (!showPopup) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={closePopup}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're In!</h3>
            <p className="text-slate-600">
              Check your inbox for this week's market intelligence report.
            </p>
            <Button
              type="button"
              onClick={closePopup}
              className="mt-6"
              variant="outline"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 pr-8">
              Before you go...
            </h3>

            <p className="text-slate-600 mb-6">
              Get this week's market intelligence report delivered to your inbox.
            </p>

            {/* Benefits list */}
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-orange-500 mt-0.5">•</span>
                Protein price movements
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-orange-500 mt-0.5">•</span>
                Freight cost trends
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-orange-500 mt-0.5">•</span>
                Active recall summary
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-orange-500 mt-0.5">•</span>
                Opportunity buy alerts
              </li>
            </ul>

            {/* Email capture form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap"
                >
                  {isSubmitting ? 'Sending...' : 'Send My Report'}
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>

            {/* Social proof */}
            <p className="text-xs text-slate-500 mt-4 text-center">
              Join 2,400+ food service operators who start their week informed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
