import type { DeliveryTier, TierConfig } from './types';

export const tierConfigs: Record<DeliveryTier, TierConfig> = {
  Hub: {
    tier: 'Hub',
    heroSubhead: 'Your direct source for disposables and proteins. Same-day pickup or next-day delivery throughout Metro Atlanta.',
    deliveryInfo: {
      method: 'Warehouse Pickup & Local Delivery',
      frequency: 'Same-day / Next-day',
      leadTime: 'Order by 2 PM',
      minimumOrder: '$3,000',
      icon: 'warehouse',
    },
    valueProps: {
      pricing: 'Warehouse-direct pricing with no middleman markup. As our distribution hub, Atlanta customers access our lowest pricing tier with no freight costs.',
      reliability: '98%+ on-time delivery within Metro Atlanta. When your walk-in is running low, we\'ve got you covered.',
      flexibility: '$3,000 minimum—lower than broadline distributors—and you get warehouse-direct pricing without the freight markup.',
    },
  },
  Tier1_Route: {
    tier: 'Tier1_Route',
    heroSubhead: 'Weekly route truck delivery from our Atlanta distribution center. Reliable service, competitive pricing, flexible minimums.',
    deliveryInfo: {
      method: 'Route Truck Delivery',
      frequency: 'Weekly Scheduled Routes',
      leadTime: 'Order by Thursday',
      minimumOrder: '$3,000',
      icon: 'truck',
    },
    valueProps: {
      pricing: 'Access the same wholesale pricing as our Atlanta customers. Our route truck efficiency means competitive landed costs without the freight markup.',
      reliability: 'Your route runs the same day every week—build your ordering around a schedule you can count on.',
      flexibility: 'Our minimum is a fraction of what Sysco or US Foods requires for regular service. Perfect for independent restaurants and food trucks.',
    },
  },
  Tier2_Route: {
    tier: 'Tier2_Route',
    heroSubhead: 'Scheduled route service to your area. The selection of a national distributor with the service of a local partner.',
    deliveryInfo: {
      method: 'Route Truck Delivery',
      frequency: 'Bi-Weekly Scheduled Routes',
      leadTime: 'Order by Wednesday',
      minimumOrder: '$5,000',
      icon: 'truck',
    },
    valueProps: {
      pricing: 'Atlanta warehouse pricing delivered to your door. Competitive with broadline distributors, with better service.',
      reliability: 'Consistent bi-weekly service you can build your operations around. No wondering when the truck will show up.',
      flexibility: '$5,000 minimum—competitive with broadline options. Mix full cases across categories to meet minimums easily.',
    },
  },
  Common_Carrier: {
    tier: 'Common_Carrier',
    heroSubhead: 'Freight delivery in 3-5 business days. Access Atlanta warehouse pricing without geographic limits.',
    deliveryInfo: {
      method: 'Freight Shipping',
      frequency: 'Ships within 24-48 hours',
      leadTime: '3-5 Business Days',
      minimumOrder: '$5,000',
      icon: 'freight',
    },
    valueProps: {
      pricing: 'Wholesale pricing regardless of your location. Your freight costs are transparent and competitive.',
      reliability: 'Track your shipment from our warehouse to your receiving dock. Full visibility from order to delivery.',
      flexibility: 'Mix full cases across categories to meet $5,000 minimums. One order, one shipment, one invoice.',
    },
  },
};

export function getTierConfig(tier: DeliveryTier): TierConfig {
  return tierConfigs[tier];
}

export function getMinimumOrderForCity(state: string, city: string): string {
  // States with $5,000 minimum
  const highMinimumStates = [
    'North Carolina',
    'Mississippi',
    'Virginia',
    'Ohio',
    'Indiana',
    'Illinois',
    'Missouri',
    'Texas',
    'Oklahoma',
  ];

  // Florida cities south of Tampa-Melbourne line
  const southFloridaCities = [
    'Sarasota',
    'Fort Myers',
    'Miami',
    'Fort Lauderdale',
    'West Palm Beach',
    'Naples',
    'Key West',
  ];

  if (highMinimumStates.includes(state)) {
    return '$5,000';
  }

  if (state === 'Florida' && southFloridaCities.includes(city)) {
    return '$5,000';
  }

  return '$3,000';
}
