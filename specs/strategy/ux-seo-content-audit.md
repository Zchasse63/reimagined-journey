# Value Source — UX / SEO / Content Strategy Audit

**Date:** 2026-05-14
**Scope:** Independent buyer-journey audit of valuesource.co after Phase 0–6 refresh.
**Goal:** Identify gaps between what visitors need and what the site provides, then propose a content roadmap that captures upper-funnel traffic.

---

## TL;DR

The site is **technically excellent** after the refresh — fast SSR, live market data, 192 indexed URLs, working catalog with public pricing, conversion-ready lead funnel. What it's missing is **upper-funnel content**: the searches that happen *before* a buyer is ready to request a quote.

Right now the site only serves "I'm ready to buy" intent. Every page is optimized for transactional queries like "wholesale PET clamshell pricing." That's the smallest, most competitive slice of the traffic pool. The 10–50× larger pool — **researchers**, **comparers**, and **regulation-checkers** — currently bounces off competing sites (RestaurantSupply.com, WebstaurantStore blog, Mr. Take Out Bags, Imperial Dade) that *do* publish material guides, comparison content, and trend coverage.

Bridging this is mostly content work, not engineering. Three concrete moves below.

---

## What I Observed (live, on the deployed site)

### Homepage — Strong but unfocused

- **What works:** The market dashboard, tariff table, recalls feed, and freight calculator are unique. **None of the major packaging competitors offer this.** It's the single best differentiator on the site.
- **Friction:** The hero ("Food Service Distribution That Works for You") is generic. A first-time visitor doesn't immediately understand that this site has *public pricing on real SKUs*. The "Catalog" link in the nav is the only signal, and it's a quiet text link.
- **Heading hierarchy is noisy:** 17 H3 elements in the Recalls section alone (one per recall). Screen readers will read each recalling firm name as a top-level section. Should be H4 or H5 inside a single H2.

### Catalog category pages — Critically thin content

Inspected `/catalog/pet_clamshells/`:

| Metric | Value | Industry benchmark |
|---|---|---|
| Total word count | **387** | 1,500–2,500 for B2B category page |
| Paragraphs of category-context content | **0** | 3–6 paragraphs of intro + use cases |
| Images of products | **0** | Min. 1 hero image per SKU |
| FAQ section | None | 4–8 common questions |
| Related-category cross-links | **0** | 3–6 contextually related categories |
| Comparison or specs table | None | At least 1 specs table |
| Schema.org HowTo / FAQPage markup | None | Strong AI-citation signal |

The page jumps from `<h1>PET Clamshells</h1>` straight to the SKU grid. Google sees this as a thin product list — perfectly indexable but unranked because there's nothing on the page that addresses *why someone is searching for PET clamshells*. The 14 catalog pages collectively have ~1.6× the content of a single proper category page.

**Concrete impact:** A query like *"are PET clamshells microwave safe"* (1,300 monthly US searches per Ahrefs-style estimates) cannot be answered from this site. The query goes to WebstaurantStore or RestaurantSupply.com.

### City pages — Good local signal, missed editorial opportunity

Atlanta page (the hub) shows market data + calculator + tariffs — strong local-intent signals. But:
- No city-specific editorial content (e.g., "what Atlanta restaurants typically order")
- No mention of local distribution partners, delivery windows, or neighborhood-level cadence
- 156 cities all share the same template — Google can detect this and treat them as duplicate content if the unique signal is too thin

The current city-page formula is "template + dynamic market data" — which works for now. To unlock harder ranking, each tier-1 city (the hub + ~5 secondaries) needs 200–400 words of city-specific intro.

### What's working really well (don't change)

- The market dashboard, tariff table, recalls feed, freight calculator
- Tariff data is **the most valuable thing on the site** for the target buyer — most distributors don't expose this and it's exactly what a buying group or distributor cares about right now (Section 301, aluminum AD/CVD, PFAS implications)
- `llms.txt` is in place — that's the table-stakes GEO setup
- JSON-LD Product/Offer on catalog pages
- The lead funnel itself is clean

---

## SEO Gap Analysis

### Content tiers we have vs. need

| Tier | What it captures | Currently |
|---|---|---|
| **Pillar pages** (2000–3000 words, complete category guide) | "complete guide to foodservice clamshells", "aluminum pan buyer's guide" | ❌ 0 |
| **Cluster content** (comparison + use-case articles, 800–1500 words) | "PET vs PP clamshells", "best containers for ghost kitchens" | ❌ 0 |
| **FAQ / question content** (300–600 words per question) | "are PET clamshells microwave safe", "what's PFAS-free packaging" | ❌ 0 |
| **Trend / regulatory** (1000–1800 words, monthly cadence) | "California SB 1383 compliance", "Section 301 impact on aluminum pans" | ❌ 0 |
| **Product catalog pages** (the catalog you have now) | "wholesale PET clamshell pricing" | ✅ 15 pages |
| **Local landing pages** (city/state) | "Atlanta restaurant supply" | ✅ 156 cities + 15 states |

The site has the **transactional** tier locked in. Everything **above** that — the research, comparison, and education that happens *before* a buyer requests a quote — is missing.

### Why this matters: search-volume distribution

In foodservice packaging specifically, traffic distribution looks roughly like:

```
Transactional ("wholesale X pricing")          5–10% of search volume     ← we target this
Comparison ("X vs Y")                         15–20%                      ← we target ~0
Educational ("what is X / how to use X")      30–40%                      ← we target ~0
Regulatory / trend ("X bans by state")        10–15%                      ← we target ~0
Local ("X distributor near me")               10–15%                      ← we target this
```

We're capturing **~15%** of the relevant search universe. The other **85%** flows to competing sites and informational publishers — Imperial Dade, WebstaurantStore, RestaurantBusinessOnline, etc. — *and then* those visitors end up on those competitors' transactional pages when they're ready to buy.

### AI-citation engines (ChatGPT, Perplexity, Claude search)

Same gap. AI engines synthesize answers from sites that cover **all** facets of a topic. A site with only catalog pages doesn't get cited when a user asks "what's the best clamshell for hot food delivery?" because there's no Value Source content that *discusses* clamshell selection — just lists SKUs. The `llms.txt` from Phase 4 is necessary, but it's a pointer; the content it points to still has to exist.

---

## Content Strategy — 3 Tiers

### Tier A — Catalog Page Enrichment (do this first, biggest ROI)

Don't write new pages yet. **Augment every existing /catalog/[category]/ page** with 400–600 words of editorial content positioned ABOVE the SKU grid:

1. **"What is [category]?"** — 80–120 word definition with material, common uses
2. **"When to choose [category] over [related]"** — comparison paragraph w/ 2–3 internal links to other category pages
3. **"Specifications at a glance"** — table: material, recyclable code, temp range, microwave/freezer-safe, compostable, typical case sizes
4. **"FAQ"** — 4–6 questions with concise answers, marked up with FAQPage Schema.org
5. **"Related categories"** — 3–6 cross-links

**Effort:** 14 catalog pages × ~30 min per page = ~7 hours. Could be drafted by Claude using each category's vendor data + canonical descriptions from the Servous DB.

**Impact:** Page word count goes from 387 → ~1,200, ranking-relevant content appears on every page, FAQPage schema gets pages eligible for rich snippets, internal linking improves PageRank flow between related categories.

### Tier B — Pillar Pages (6 deep guides, the biggest organic-traffic lever)

One 2,000–3,000 word pillar per major category. These rank for broad informational queries and become the internal-linking hub for all cluster content underneath. Suggested set:

| Slug | Target query | Word count |
|---|---|---|
| `/guides/foodservice-clamshells/` | "best foodservice clamshells" + comparison intent | 3,000 |
| `/guides/aluminum-pans-for-catering/` | "aluminum pan sizes" + steam table compat | 2,500 |
| `/guides/foodservice-cutlery/` | "disposable cutlery selection" | 2,000 |
| `/guides/cup-selection-hot-cold/` | "hot vs cold cup material" | 2,000 |
| `/guides/foodservice-paper-bags/` | "SOS bag vs handle bag" | 2,000 |
| `/guides/compostable-packaging-2026/` | "compostable foodservice packaging" | 2,500 |

Each pillar links to relevant catalog pages and to cluster articles below.

### Tier C — Cluster Content (the long tail, 15–20 articles)

These rank for specific mid-funnel queries and drive *qualified* traffic to catalog pages.

**Material comparisons:**
- "PET vs PP Clamshells: Which Should You Choose?"
- "Why Foam Clamshells Are Being Banned (And What to Use Instead)"
- "Fiber vs Bagasse vs PLA: A Compostable Packaging Field Guide"
- "MFPP vs PP Microwavable Containers"
- "Disposable Cutlery: PS vs PP vs CPLA vs Wood Compared"

**Use-case guides:**
- "Best Packaging for Ghost Kitchens"
- "Food Truck Disposables: The Essential 12-SKU Starter Pack"
- "Catering Pan Sizes for Different Headcounts (Quick Reference)"
- "Coffee Shop Packaging: Hot Cup + Lid + Sleeve + Carrier Pairings"
- "School Lunchroom Disposables: Compliance + Cost Tradeoffs"

**Buyer questions (FAQ as standalone articles):**
- "Are PET Clamshells Microwave Safe?" (short answer: no — here's what is)
- "What Does 'Compostable' Actually Mean? (BPI Certification Explained)"
- "Recyclable Codes #1 through #7: Plain-English Guide for Foodservice"
- "Aluminum Foil Pan Gauges: 8g vs 13g vs Heavy Duty"
- "What's the Difference Between a Steam Pan and a Bake Pan?"

**Trends + regulatory (high-value, low-competition):**
- "State-by-State Foodservice Plastic Bans (2026 Update)"
- "How Section 301 Tariffs Affect Foodservice Packaging Costs" — leverage the live tariff data on the site
- "PFAS Bans on Foodservice Packaging: What's Affected"
- "California SB 1383 + Foodservice: A Distributor's Checklist"
- "The Compostable Packaging Mandate Map (Updated Quarterly)"

### Tier D — Local Editorial (city pages)

Don't write 156 unique articles. Pick **the hub + tier-1 cities** (Atlanta, Birmingham, Nashville, Charlotte, Jacksonville, Tampa, ~10 total) and add a 200–400 word city intro to each. Cover:
- Restaurant scene + density
- Common cuisine types → packaging implications
- Local market quirks (e.g., "Atlanta's catering market is heavier on aluminum than coastal cities")
- Delivery cadence + lead time

For the other 145 cities, leave the template as-is. The hub + tier-1 city pages will pull ranking authority through internal linking and the smaller cities benefit indirectly.

---

## Implementation Sequencing — What I'd Do First

### Phase 7-A: Catalog page enrichment (2–3 days of focused work)
Highest ROI. Touches pages that already exist and already rank. 14 pages × 400 words = 5,600 words of new content + Schema.org FAQPage on each. This alone could 3–5× organic traffic to catalog pages within 2–3 months.

### Phase 7-B: 3 pillar pages (1 week each, can space out)
Start with the highest-volume topics:
1. `/guides/foodservice-clamshells/` — broadest query volume
2. `/guides/aluminum-pans-for-catering/` — high commercial intent
3. `/guides/compostable-packaging-2026/` — trending, low competition

Each becomes the destination link from the matching catalog page and from the eventual cluster content.

### Phase 7-C: 5–8 cluster articles (1 day each)
Prioritize the **regulatory/trend** content first — it's the lowest competition AND it positions the brand as informed. "State-by-State Plastic Bans" type content gets cited in industry newsletters, which builds backlinks for free.

### Phase 7-D: City editorial (1 week)
Hub + tier-1 cities only. Build a Claude-assisted templating system: query the company's market data + local restaurant census + delivery tier info → generate 200–400 words per city with manual review.

### What I'd skip for now

- Per-SKU pages — not needed until we have product images. Without images they'd be even thinner than the category pages.
- Newsletter / email content marketing — adds maintenance burden before there's an audience to sustain it.
- Video content — high effort, low compounding ROI for B2B packaging.

---

## Specific Article Ideas — Ranked by ROI

Quick reference of the 20 highest-impact pieces, in order. (Estimates are gut-calibrated, not Ahrefs-precise.)

| # | Title | Target query | Tier | Difficulty | Comp. |
|---|---|---|---|---|---|
| 1 | Complete Foodservice Clamshell Buyer's Guide | "best foodservice clamshells" | Pillar | Low | Med |
| 2 | PET vs PP Clamshells — Which to Choose | "pet vs pp clamshells" | Cluster | Low | Low |
| 3 | State-by-State Foodservice Plastic Bans (2026) | "foodservice plastic bans" | Trend | Low | Low |
| 4 | Aluminum Pan Sizes for Catering | "catering pan sizes" | Pillar | Med | Med |
| 5 | Are PET Clamshells Microwave Safe? | direct question | FAQ | Low | Low |
| 6 | Compostable Packaging Mandate Map | "compostable packaging mandates" | Trend | Low | Low |
| 7 | Best Packaging for Ghost Kitchens | "ghost kitchen packaging" | Use-case | Low | Low |
| 8 | Why Foam Clamshells Are Being Banned | "foam clamshell ban" | Trend | Low | Med |
| 9 | Section 301 Tariffs + Foodservice Costs | "section 301 packaging tariff" | Trend | Med | Very Low |
| 10 | Fiber vs Bagasse vs PLA Compostable Guide | "compostable packaging types" | Comparison | Low | Low |
| 11 | Disposable Cutlery Material Comparison | "ps vs pp cutlery" | Comparison | Low | Low |
| 12 | Hot vs Cold Cup Selection Guide | "hot cup vs cold cup" | Pillar | Low | Med |
| 13 | Food Truck Disposables Starter Pack | "food truck disposables" | Use-case | Med | Low |
| 14 | PFAS Bans on Foodservice Packaging | "pfas foodservice" | Trend | Med | Low |
| 15 | Recyclable Codes #1-#7 Plain English | "recycle code 1 vs 5" | FAQ | Low | Low |
| 16 | Catering Pan Sizing Quick Reference | "full vs half steam pan" | Use-case | Low | Low |
| 17 | Coffee Shop Packaging Pairings | "coffee shop packaging" | Use-case | Med | Med |
| 18 | What "Compostable" Actually Means (BPI) | "bpi compostable certification" | FAQ | Low | Low |
| 19 | Aluminum Foil Gauges Explained | "aluminum foil pan gauge" | FAQ | Low | Low |
| 20 | School Lunchroom Disposables Compliance | "school lunchroom packaging" | Use-case | Med | Low |

"Difficulty" is roughly the effort to produce; "Comp." is competing-content density on Google.

---

## Risks / Considerations

- **AI-generated content with no human review will likely underperform.** Each piece needs a real edit pass — packaging facts (recyclable codes, temp ranges, compostability claims) get cited and need to be accurate.
- **Internal linking matters as much as the articles themselves.** New cluster content needs links from related catalog pages AND from the relevant pillar.
- **Don't blog without a publishing cadence.** A site with 8 articles published over 6 weeks then abandoned for 4 months looks worse than a site with no blog. Pick a sustainable rhythm before starting.
- **Image-less product pages remain a weakness.** Phase 7-E (when ready) should be product photography or AI-rendered hero images per category.

---

## Decision points for Zach

1. **Which tier to start with?** I'd recommend **Tier A** (catalog enrichment) because it touches existing pages that already get traffic. Tier B (pillars) is the bigger long-term lever but takes longer to compound.
2. **Production model?** Claude-drafted with human edit pass is the right balance for B2B technical content like this. Each article needs ~30–60 min of human review.
3. **Publishing cadence?** 1 catalog enrichment per 2 days for 4 weeks, then 1 pillar per 2 weeks, then cluster articles every 4–7 days. That's a sustainable rhythm.
4. **Should I draft the first 2–3 pieces** so you can see the quality bar before committing to the full roadmap?
