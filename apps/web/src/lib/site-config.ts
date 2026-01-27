export const SITE_CONFIG = {
  company: {
    name: 'Value Source',
    phone: '(404) 555-1234',
    phoneRaw: '+14045551234',
    email: 'info@valuesource.co',
    address: {
      city: 'Atlanta',
      state: 'GA',
      label: 'Atlanta Distribution Center',
    },
  },
  trustStats: {
    yearsInBusiness: '15+',
    customersServed: '500+',
    onTimeRate: '98%',
    citiesServed: '156',
    statesServed: '15',
  },
  seo: {
    siteName: 'Value Source',
    defaultDescription: 'Food service distribution for restaurants, caterers, food trucks, and institutions across the Southeast.',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
