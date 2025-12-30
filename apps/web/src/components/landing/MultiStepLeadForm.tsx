import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, ArrowRight, ArrowLeft, Lock, Phone } from 'lucide-react';

// Types
type BusinessType = 'restaurant' | 'food_truck' | 'caterer' | 'institution' | 'grocery' | 'other';
type ProductCategory = 'disposables' | 'custom_print' | 'proteins' | 'eco_friendly';
type SpendRange = 'under_3k' | '3k_10k' | '10k_25k' | 'over_25k';

interface LeadFormData {
  // Step 1
  businessType: BusinessType | null;

  // Step 2
  productInterests: ProductCategory[];
  estimatedSpend: SpendRange | null;

  // Step 3
  businessName: string;
  contactName: string;
  email: string;
  phone: string;

  // Meta
  city: string;
  state: string;
  source: string;
  calculatorData?: any;
}

interface MultiStepLeadFormProps {
  city: string;
  state: string;
  minimumOrder: string;
}

// Constants
const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'food_truck', label: 'Food Truck', icon: '🚚' },
  { value: 'caterer', label: 'Caterer', icon: '🎪' },
  { value: 'institution', label: 'Institution', icon: '🏢' },
  { value: 'grocery', label: 'Grocery', icon: '🛒' },
  { value: 'other', label: 'Other', icon: '➕' },
];

const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'disposables', label: 'Disposables (napkins, plates, cutlery, to-go containers)' },
  { value: 'custom_print', label: 'Custom Printed Products (cups, napkins, bags with your logo)' },
  { value: 'proteins', label: 'Proteins (beef, pork, poultry, seafood)' },
  { value: 'eco_friendly', label: 'Eco-Friendly Alternatives' },
];

const SPEND_RANGES: { value: SpendRange; label: string }[] = [
  { value: 'under_3k', label: 'Under $3,000' },
  { value: '3k_10k', label: '$3,000 - $10,000' },
  { value: '10k_25k', label: '$10,000 - $25,000' },
  { value: 'over_25k', label: 'Over $25,000' },
];

export default function MultiStepLeadForm({ city, state, minimumOrder: _minimumOrder }: MultiStepLeadFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<LeadFormData>({
    businessType: null,
    productInterests: [],
    estimatedSpend: null,
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    city,
    state,
    source: 'direct',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for calculator quote request event
  useEffect(() => {
    const handleCalculatorData = (e: CustomEvent) => {
      const { productType, monthlySpend } = e.detail;

      // Map calculator data to form data
      const productInterests: ProductCategory[] = [];
      if (productType === 'disposables' || productType === 'both') {
        productInterests.push('disposables');
      }
      if (productType === 'proteins' || productType === 'both') {
        productInterests.push('proteins');
      }

      // Map spend to range
      let estimatedSpend: SpendRange = '3k_10k';
      if (monthlySpend < 3000) estimatedSpend = 'under_3k';
      else if (monthlySpend < 10000) estimatedSpend = '3k_10k';
      else if (monthlySpend < 25000) estimatedSpend = '10k_25k';
      else estimatedSpend = 'over_25k';

      // Update form and skip to step 3
      setFormData(prev => ({
        ...prev,
        productInterests,
        estimatedSpend,
        calculatorData: e.detail,
        source: 'calculator'
      }));
      setStep(3);

      // Scroll to form
      document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('calculator-quote-request', handleCalculatorData as EventListener);
    return () => window.removeEventListener('calculator-quote-request', handleCalculatorData as EventListener);
  }, []);

  // Validation functions
  const canProceedStep1 = formData.businessType !== null;
  const canProceedStep2 = formData.productInterests.length > 0 && formData.estimatedSpend !== null;
  const canSubmit = formData.businessName.trim() !== '' &&
                    formData.contactName.trim() !== '' &&
                    formData.email.trim() !== '' &&
                    formData.email.includes('@');

  // Progress bar percentage
  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  // Navigation handlers
  const nextStep = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

  // Toggle product interest
  const toggleProductInterest = (category: ProductCategory) => {
    setFormData(prev => ({
      ...prev,
      productInterests: prev.productInterests.includes(category)
        ? prev.productInterests.filter(c => c !== category)
        : [...prev.productInterests, category]
    }));
  };

  // Success state
  if (isSuccess) {
    return (
      <section className="py-16 bg-orange-50" id="lead-form">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Thank You!
            </h3>
            <p className="text-slate-600 mb-6">
              We've received your request and will get back to you within 24 hours (usually same day).
            </p>
            <p className="text-sm text-slate-500">
              Questions? Call us at{' '}
              <a href="tel:+1XXXXXXXXXX" className="text-orange-600 font-medium hover:underline">
                (XXX) XXX-XXXX
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-orange-50" id="lead-form">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Get Your Custom Quote
          </h2>

          {/* Step indicator and progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">
                Step {step} of 3{step === 3 && ' - Almost done!'}
              </span>
              <span className="text-sm text-slate-500">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="space-y-6">
              <Label className="text-base font-medium text-slate-900">
                What type of business are you?
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, businessType: type.value }))}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-150
                      ${formData.businessType === type.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }
                    `}
                  >
                    <span className="text-2xl mb-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedStep1}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Products & Budget */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Product interests */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-slate-900">
                  What products are you looking for?
                </Label>
                <div className="space-y-3">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <label
                      key={category.value}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150
                        ${formData.productInterests.includes(category.value)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                        }
                      `}
                    >
                      <Checkbox
                        checked={formData.productInterests.includes(category.value)}
                        onCheckedChange={() => toggleProductInterest(category.value)}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <span className="text-sm text-slate-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Spend range */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-slate-900">
                  Estimated monthly spend on these products:
                </Label>
                <div className="space-y-2">
                  {SPEND_RANGES.map((range) => (
                    <label
                      key={range.value}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-150
                        ${formData.estimatedSpend === range.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="estimatedSpend"
                        value={range.value}
                        checked={formData.estimatedSpend === range.value}
                        onChange={() => setFormData(prev => ({ ...prev, estimatedSpend: range.value }))}
                        className="w-4 h-4 text-orange-500 border-slate-300 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedStep2}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-base font-medium text-slate-900">
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your business name"
                    required
                  />
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-base font-medium text-slate-900">
                    Your Name *
                  </Label>
                  <Input
                    id="contactName"
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium text-slate-900">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@business.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium text-slate-900">
                    Phone (optional - for faster response)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Get My Custom Quote'}
                  {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="w-4 h-4" />
                  <span>We never share your information.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-4 h-4" />
                  <span>Expect a response within 24 hours.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
