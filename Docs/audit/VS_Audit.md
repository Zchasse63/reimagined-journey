Overview

This document provides a comprehensive checklist of all issues and improvement opportunities identified during the full-site audit of ValueSource.co. It is designed to be used as an actionable plan for developers and stakeholders to track remediation progress. Issues are categorized by priority to guide the workflow, starting with the most critical fixes.




Priority Legend

•
🔴 CRITICAL: Issues that severely impact core functionality, data accuracy, or user trust. These should be addressed immediately.

•
🟠 HIGH: Issues that significantly degrade the user experience, present misleading information, or have a major negative SEO impact.

•
🟡 MEDIUM: Issues that cause confusion, create a poor user experience, or represent missed SEO/technical opportunities.

•
🟢 LOW: Nice-to-have improvements and minor optimizations that will polish the platform but are not urgent.




🔴 CRITICAL: Immediate Fixes Required

These issues compromise the fundamental integrity and function of the site.




Fix Freight Calculator Distance & Cost Error (10x Wrong)

•
Issue: The calculator incorrectly parses "460 miles / 7 hours" as 4607, resulting in a 10x error in distance and cost estimates.

•
Location: apps/web/src/pages/[state]/[city].astro (lines 88-91)

•
Fix: Replace the faulty regex replace(/[^0-9]/g, '') with a simple parseInt(city.distance_from_atlanta || '0', 10), which correctly parses the leading number.






Fix Recalls API to Show Real FDA Data

•
Issue: The site displays fake, hardcoded recall data (e.g., "ABC Foods Inc.") because the Supabase edge function for recalls is not being deployed or is failing silently.

•
Location: supabase/config.toml and supabase/functions/recalls/index.ts.

•
Fix:

1.
Add [functions.recalls] with verify_jwt = false to supabase/config.toml.

2.
Deploy the function using the Supabase CLI.

3.
Ensure the function can successfully connect to the FDA API and remove the mock data fallback.








Create and Deploy robots.txt File

•
Issue: The site is missing a robots.txt file, leaving search engine crawlers without guidance on how to index the site.

•
Location: Create the file at apps/web/public/robots.txt.

•
Fix: Create the file with rules to allow all content except for /api/ routes and include a link to the sitemap.






🟠 HIGH: Address Next

These issues are highly visible, negatively impact user trust, or represent significant missed opportunities.




Correct Misleading "Serving Major Institutions" Content

•
Issue: The site implies it serves major local institutions (e.g., MacDill AFB, Tampa General) when this content is auto-generated from a data file, not a customer list.

•
Location: apps/web/src/components/landing/LocalMarketSection.astro.

•
Fix: Change the section heading from "Serving {city}'s Major Institutions" to a more general title like "Major Institutions in the {city} Area" to avoid making false claims.






Replace Simulated Data in Historical Market Charts

•
Issue: The "Market Trends" charts are generated with Math.sin() and random variance, not real historical data. This is misleading.

•
Location: apps/web/src/components/landing/HistoricalCharts.tsx.

•
Fix: Back-populate the diesel_prices table in Supabase with real historical data (e.g., from the EIA) and modify the component to fetch and display this data. Remove the simulation logic.






Add a Close/Dismiss Button to the Sticky Lead Capture

•
Issue: The floating "Get Your Quote" box cannot be closed by the user, which is intrusive and can block other page elements on certain screen sizes.

•
Location: apps/web/src/components/landing/StickyLeadCapture.tsx.

•
Fix: Add a close icon (X) to the component that, when clicked, hides the element.






Implement LocalBusiness and FAQPage SEO Schemas

•
Issue: The site is missing critical structured data that helps search engines understand the business and content, impacting local search visibility and AI citations.

•
Location: apps/web/src/layouts/CityLayout.astro and a new FAQSection.astro component.

•
Fix: Inject LocalBusiness JSON-LD schema into the <head> of city pages. Create a dedicated FAQ section with questions and answers, and mark it up with FAQPage schema.






🟡 MEDIUM: Plan to Address

These issues create a confusing or suboptimal user experience and should be addressed in the next development cycle.




Refine Hero "Today's Market" Snapshot

•
Issue: Displaying "Diesel" alongside food commodities like "Chicken" and "Soybean Oil" is confusing for the target audience.

•
Location: apps/web/src/components/landing/MarketSnapshot.astro.

•
Fix: Replace "Diesel" with a more relevant food commodity, such as Beef, Pork, or Sugar, to maintain the focus on food service costs.






Clarify the "43.2%" Fuel Surcharge

•
Issue: The fuel surcharge percentage is displayed without context, leaving users to guess what it applies to.

•
Location: DeliveryInfoBar.astro, FreightCalculator.tsx, MarketDashboard.astro.

•
Fix: Add a tooltip or a small info icon next to the percentage that explains: "Applied to freight costs, based on the DOE diesel index."






Reduce Page Length and Information Overload

•
Issue: City pages are excessively long (over 10,000 pixels), burying the main lead form and overwhelming users.

•
Location: apps/web/src/pages/[state]/[city].astro.

•
Fix: Move the MultiStepLeadForm component higher up the page (e.g., directly after the hero or market dashboard). Consider consolidating or removing redundant sections.






Implement BreadcrumbList Schema

•
Issue: Breadcrumbs are visible but are not marked up with structured data, missing an opportunity for enhanced display in search results.

•
Location: Layout components responsible for rendering breadcrumbs.

•
Fix: Add BreadcrumbList JSON-LD schema to provide context to search engines.






Improve Thin & Duplicative City Page Content

•
Issue: City pages are largely template-driven with very little unique content, which is detrimental to SEO.

•
Fix: Develop a strategy to add unique, high-quality content to each city page. This could include local case studies, testimonials, or specific market insights.






Clarify and Unify CTA Button Text

•
Issue: Multiple buttons with similar text like "Get Quote" perform different actions, causing user confusion.

•
Fix: Standardize button text to be more descriptive of the action. For example: "Calculate Savings," "Estimate Freight Cost," and "Request Full Quote."






Add Missing Image Alt Text

•
Issue: Images across the site are missing alt attributes, which is a basic accessibility and SEO requirement.

•
Fix: Audit all <img> tags and Astro <Image /> components and add descriptive alt text.






🟢 LOW: Nice-to-Have Improvements

These are lower-priority optimizations and clean-up tasks.




Consolidate Redundant Calculators

•
Issue: The site features two overlapping calculators: FreightCalculator and CostCalculator.

•
Fix: Evaluate the utility of each and consider merging them into a single, more comprehensive tool to reduce redundancy and user confusion.






Reduce Excessive Diesel Price Displays

•
Issue: The price of diesel is shown in at least four different places on a single page.

•
Fix: Reduce the number of diesel price displays to a maximum of two, keeping them in the most relevant contexts (e.g., freight and market data).






Consolidate Duplicate Lead Form Implementations

•
Issue: There are two separate lead form components (LeadForm.tsx and MultiStepLeadForm.tsx) with different validation logic.

•
Fix: Refactor these into a single, reusable lead form component to reduce code duplication and ensure consistency.






Optimize Component Hydration

•
Issue: Some components below the fold are using client:load, which can negatively impact initial page load performance.

•
Location: apps/web/src/pages/[state]/index.astro.

•
Fix: Change the LeadForm component's directive from client:load to client:visible.






Adjust Prefetch Configuration

•
Issue: The prefetchAll: true setting is too aggressive and can cause unnecessary data downloads for users.

•
Location: apps/web/astro.config.mjs.

•
Fix: Change prefetchAll to false and rely on the default viewport-based prefetching strategy.






Add Cache Headers to SSR Pages

•
Issue: Server-rendered city pages are missing cache headers, meaning they are regenerated on every request.

•
Location: apps/web/src/pages/[state]/[city].astro.

•
Fix: Add a Cache-Control header to the Astro response to enable CDN caching (e.g., s-maxage=3600, stale-while-revalidate=86400).



