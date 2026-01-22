/**
 * Landing Page Components
 * Components for the restructured landing pages
 */

// React Components (Phase 3A+)
export { default as CostCalculator } from './CostCalculator';
export { default as MultiStepLeadForm } from './MultiStepLeadForm';

// Phase 5 Components (React)
export { default as StickyLeadCapture } from './StickyLeadCapture';
export { default as ExitIntentPopup } from './ExitIntentPopup';

// Note: Astro components are imported directly where needed, not re-exported from index.ts
// This file serves as documentation and potential future React component exports

// Export paths for documentation purposes:
// Phase 2A Components:
// - RecallAlertBar: ./RecallAlertBar.astro
// - MarketSnapshot: ./MarketSnapshot.astro
// - HeroWithMarketSnapshot: ./HeroWithMarketSnapshot.astro
// - DeliveryInfoBar: ./DeliveryInfoBar.astro

// Phase 2B Components:
// - CommodityCard: ./CommodityCard.astro
// - MicroEmailCapture: ./MicroEmailCapture.astro
// - MarketDashboard: ./MarketDashboard.astro

// Phase 3A Components (React):
// - CostCalculator: ./CostCalculator.tsx

// Phase 3B Components (React):
// - MultiStepLeadForm: ./MultiStepLeadForm.tsx

// Phase 4 Components (Astro):
// - RecallCard: ./RecallCard.astro
// - RecallsSection: ./RecallsSection.astro
// - ValuePropositions: ./ValuePropositions.astro
// - ProductCategories: ./ProductCategories.astro
// - LocalMarketSection: ./LocalMarketSection.astro
// - SocialProof: ./SocialProof.astro
// - NearbyCities: ./NearbyCities.astro
// - FooterCTA: ./FooterCTA.astro

// Phase 5 Components (React):
// - StickyLeadCapture: ./StickyLeadCapture.tsx
// - ExitIntentPopup: ./ExitIntentPopup.tsx

// Example usage in Astro pages:
// import RecallAlertBar from '@/components/landing/RecallAlertBar.astro';
// import MarketSnapshot from '@/components/landing/MarketSnapshot.astro';
// import HeroWithMarketSnapshot from '@/components/landing/HeroWithMarketSnapshot.astro';
// import DeliveryInfoBar from '@/components/landing/DeliveryInfoBar.astro';
// import CommodityCard from '@/components/landing/CommodityCard.astro';
// import MicroEmailCapture from '@/components/landing/MicroEmailCapture.astro';
// import MarketDashboard from '@/components/landing/MarketDashboard.astro';
//
// For React components in Astro:
// import CostCalculator from '@/components/landing/CostCalculator';
// <CostCalculator client:load city="Miami" state="FL" distanceFromAtlanta={662} dieselPrice={3.45} />
//
// import MultiStepLeadForm from '@/components/landing/MultiStepLeadForm';
// <MultiStepLeadForm client:load city="Miami" state="FL" minimumOrder="$500" />
//
// Phase 4 Astro component usage:
// import RecallCard from '@/components/landing/RecallCard.astro';
// import RecallsSection from '@/components/landing/RecallsSection.astro';
// import ValuePropositions from '@/components/landing/ValuePropositions.astro';
// import ProductCategories from '@/components/landing/ProductCategories.astro';
// import LocalMarketSection from '@/components/landing/LocalMarketSection.astro';
// import SocialProof from '@/components/landing/SocialProof.astro';
// import NearbyCities from '@/components/landing/NearbyCities.astro';
// import FooterCTA from '@/components/landing/FooterCTA.astro';
//
// Phase 5 React component usage:
// import StickyLeadCapture from '@/components/landing/StickyLeadCapture';
// <StickyLeadCapture client:load phoneNumber="(404) 555-1234" />
//
// import ExitIntentPopup from '@/components/landing/ExitIntentPopup';
// <ExitIntentPopup client:load city="Miami" />
