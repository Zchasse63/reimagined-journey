# Food Service Distribution Landing Page: Restructured Template

## Executive Summary: What's Changing

**The Problem with the Current Structure:**
- Lead capture form buried in 7th section
- Zero market intelligence data visible
- No reason for visitors to return
- Commodity prices, freight rates, and recall alerts completely absent
- Page functions as a brochure, not a resource

**The New Philosophy: Information-First Lead Generation**

Instead of: "Here's who we are → Here's what we do → Fill out this form"

We're doing: "Here's valuable market data → Here's tools to help you → Get personalized insights"

This approach:
- Positions your site as an industry resource (not just a vendor)
- Gives operators reasons to bookmark and return
- Triggers Google's "Query Deserves Freshness" algorithm
- Creates natural lead capture moments after delivering value
- Achieves 11%+ conversion rates (vs 2.35% average) through calculator-triggered capture

---

## NEW PAGE STRUCTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. RECALL ALERT BAR (Sticky Top)                                           │
│     - Red/amber banner when active recalls exist                            │
│     - "⚠️ 3 Active Recalls Affecting [State] Food Service - View Details"  │
│     - Links to recall section OR expands inline                             │
│     - Builds trust: "We keep you informed"                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  2. HERO + MARKET SNAPSHOT                                                  │
│     - H1: Food Service Distribution in [City], [State]                      │
│     - Subhead: [Delivery Method Statement]                                  │
│     - RIGHT SIDE: Live Market Snapshot Card                                 │
│       • Chicken: $X.XX/lb (↑3.2% this week)                                │
│       • Cooking Oil: $X.XX/gal (↓1.8%)                                     │
│       • Diesel: $X.XX/gal (fuel surcharge indicator)                       │
│     - Primary CTA: "Get Custom Pricing" (opens modal/slides to form)       │
│     - Secondary CTA: "See Full Market Data ↓"                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  3. DELIVERY INFO BAR (Unchanged but enhanced)                              │
│     - Delivery Method + Frequency + Lead Time + Minimum Order              │
│     - ADD: "Fuel Surcharge: X.X%" (calculated from EIA diesel data)        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  4. MARKET INTELLIGENCE DASHBOARD                              ← NEW        │
│     - Section Header: "Today's Market Data for [City] Food Service"        │
│     - 3-4 commodity price cards with sparkline trends                       │
│     - Ocean freight indicator (China → Savannah)                           │
│     - Trucking cost estimate (Atlanta → [City])                            │
│     - "Updated [timestamp]" for freshness signals                          │
│     - INLINE CAPTURE: "Get weekly market alerts" (email only)              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  5. COST CALCULATOR SECTION                                    ← NEW        │
│     - Interactive freight/landed cost calculator                            │
│     - Ungated: Basic estimate with inputs                                   │
│     - Gated: Detailed breakdown + PDF export                               │
│     - Natural lead capture moment after value delivered                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  6. PRIMARY LEAD CAPTURE                                       ← MOVED UP   │
│     - NOW Section 6 (was Section 7)                                        │
│     - Multi-step form triggered by calculator OR standalone                │
│     - Positioned AFTER value has been demonstrated                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  7. VALUE PROPOSITIONS                                         ← MOVED DOWN │
│     - Competitive Pricing / Reliability / Flexibility / Custom Print       │
│     - Now supports the ask rather than delaying it                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  8. PRODUCT CATEGORIES                                                      │
│     - Disposables / Custom Print / Proteins / Eco-Friendly                 │
│     - Each links to category pages                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  9. ACTIVE RECALLS SECTION                                     ← NEW        │
│     - Full recall details for proteins/produce relevant to food service    │
│     - Filterable by category (meat, poultry, produce, seafood)            │
│     - Links to FDA/USDA sources                                            │
│     - "Subscribe to Recall Alerts" micro-capture                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  10. LOCAL MARKET SECTION                                                   │
│     - Service area / Institutional anchors / Local stats                   │
│     - State compliance info (if applicable)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  11. SOCIAL PROOF                                                           │
│     - Testimonials / Customer logos / Certifications                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  12. NEARBY CITIES                                                          │
│     - Internal links for SEO                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  13. FOOTER CTA                                                             │
│     - Final conversion opportunity                                          │
└─────────────────────────────────────────────────────────────────────────────┘

PERSISTENT ELEMENTS:
┌─────────────────────────────────────────────────────────────────────────────┐
│  STICKY SIDEBAR (Desktop) / STICKY BOTTOM BAR (Mobile)                      │
│     - Compact lead capture that follows scroll                              │
│     - "Get Your Quote" + Phone number                                       │
│     - Appears after user scrolls past hero                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  EXIT INTENT POPUP                                                          │
│     - Triggers when cursor moves toward browser chrome                      │
│     - Offers: "Before you go—get this week's market report"                │
│     - Email-only capture for low friction                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION-BY-SECTION SPECIFICATIONS

---

### SECTION 1: RECALL ALERT BAR

**Purpose:** Establish trust and authority immediately. Food safety is non-negotiable for operators.

**Data Source:** openFDA API (`api.fda.gov/food/enforcement.json`)

**Display Logic:**
- If active Class I or Class II recalls exist → Show red/amber banner
- If no active recalls → Show green "No active recalls" OR hide entirely
- Filter to recalls relevant to food service: proteins, produce, dairy, seafood

**Visual Treatment:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️  3 Active Protein Recalls in [State] — Updated Today    [View Details ↓] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Sticky on scroll (stays at top)
- Click expands inline OR smooth-scrolls to full recall section
- Mobile: Collapses to icon + "3 Recalls" with tap to expand

**Content Template:**
```
{recall_count} Active {category} Recalls Affecting {state} Food Service — Updated {last_updated}
```

**Why This Works:**
- Demonstrates you're monitoring food safety in real-time
- Creates urgency and return visits ("I should check this regularly")
- Zero-cost content that's always fresh
- Positions you as a trusted industry resource, not just a vendor

---

### SECTION 2: HERO + MARKET SNAPSHOT

**Purpose:** Immediately deliver value while establishing local relevance.

**Layout: Split Hero**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   LEFT SIDE (60%)                      │    RIGHT SIDE (40%)               │
│   ─────────────────                    │    ────────────────               │
│                                        │                                    │
│   Food Service Distribution            │    ┌──────────────────────────┐   │
│   in Atlanta, Georgia                  │    │  TODAY'S MARKET         │   │
│                                        │    │  ─────────────────────   │   │
│   Your direct source for disposables   │    │  🍗 Chicken Wing         │   │
│   and proteins. Same-day pickup or     │    │     $2.14/lb  ↑ 3.2%    │   │
│   next-day delivery throughout         │    │                          │   │
│   Metro Atlanta.                       │    │  🛢️ Soybean Oil          │   │
│                                        │    │     $0.52/lb  ↓ 1.8%    │   │
│   [Get Custom Pricing]  [See Market ↓] │    │                          │   │
│                                        │    │  ⛽ Diesel (SE Region)   │   │
│   ✓ 15+ Years  ✓ 500+ Customers       │    │     $3.58/gal ─ 0.0%    │   │
│                                        │    │                          │   │
│                                        │    │  Updated: Dec 30, 2:15pm │   │
│                                        │    └──────────────────────────┘   │
│                                        │                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Market Snapshot Card - Data Sources:**

| Metric | Source | Update Frequency | API Endpoint |
|--------|--------|------------------|--------------|
| Chicken (whole bird or wings) | USDA LMPR | Daily | `mpr.datamart.ams.usda.gov` |
| Cooking Oil (soybean) | USDA ERS | Monthly | `api.ers.usda.gov` |
| Diesel (regional) | EIA | Weekly (Monday) | `api.eia.gov/v2/petroleum/pri/gnd/` |
| Sugar (optional) | USDA ERS | Monthly | Sugar & Sweeteners Yearbook |

**Visual Treatment:**
- Card has subtle shadow, appears "floating" over hero background
- Trend arrows: Green ↑ for drops (good for buyer), Red ↑ for increases
- Sparkline mini-charts if space permits (7-day trend)
- "Updated" timestamp reinforces freshness

**Mobile Adaptation:**
- Market snapshot moves below hero text
- Horizontal scroll for multiple commodities
- Or: Single "featured" commodity + "See all →" link

**CTAs:**
- Primary: "Get Custom Pricing" → Opens modal with Step 1 of multi-step form
- Secondary: "See Full Market Data ↓" → Smooth scroll to Market Intelligence section

---

### SECTION 3: DELIVERY INFO BAR

**Purpose:** Quick-reference operational details (unchanged from original, with enhancement).

**Enhancement: Add Fuel Surcharge**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🚚 Route Truck    │  📅 Weekly Service  │  📋 Order by Thu  │  💰 $3K Min  │  ⛽ 8.2% Fuel │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Fuel Surcharge Calculation:**
```
Base Rate: $2.50/gallon (your baseline)
Current Diesel: $3.58/gallon (from EIA)
Surcharge: ((Current - Base) / Base) × 100 = 43.2%... 

OR use industry-standard fuel surcharge matrix
```

**Why Add This:**
- Operators understand fuel surcharges affect their costs
- Shows transparency and real-time awareness
- Another data point that refreshes regularly

---

### SECTION 4: MARKET INTELLIGENCE DASHBOARD

**Purpose:** This is your traffic driver. Give people a reason to visit regularly.

**Section Header:**
```
## Today's Market Intelligence for {City} Food Service
```

**Layout: Card Grid**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  COMMODITY PRICES                            FREIGHT & LOGISTICS            │
│  ───────────────────                         ──────────────────             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐   ┌─────────────────────────────┐│
│  │ 🍗 POULTRY      │  │ 🛢️ COOKING OIL  │   │ 🚢 OCEAN FREIGHT            ││
│  │                 │  │                 │   │                             ││
│  │ Whole Chicken   │  │ Soybean Oil     │   │ China → Savannah            ││
│  │ $1.12/lb        │  │ $0.52/lb        │   │ $2,340/40ft                 ││
│  │ ↓ 2.1% vs LW    │  │ ↓ 1.8% vs LW    │   │ ↓ 12% vs last month         ││
│  │                 │  │                 │   │                             ││
│  │ Wings: $2.14/lb │  │ Canola: $0.48   │   │ Vietnam → Savannah          ││
│  │ Breast: $2.89   │  │ Palm: $0.44     │   │ $2,180/40ft                 ││
│  │                 │  │                 │   │                             ││
│  │ [7-day chart]   │  │ [7-day chart]   │   │ [Freightos embed/link]      ││
│  └─────────────────┘  └─────────────────┘   └─────────────────────────────┘│
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐   ┌─────────────────────────────┐│
│  │ 🥩 BEEF         │  │ 🍬 SUGAR        │   │ 🚛 TRUCKING                 ││
│  │                 │  │                 │   │                             ││
│  │ Choice Cutout   │  │ Raw Cane (US)   │   │ Atlanta → {City}            ││
│  │ $315.42/cwt     │  │ $0.42/lb        │   │ Est: $X.XX/mile             ││
│  │ ↑ 1.3% vs LW    │  │ ─ 0.0% vs LW    │   │ Based on {distance} miles   ││
│  │                 │  │                 │   │                             ││
│  │ Select: $298.15 │  │ World: $0.21    │   │ Current diesel: $3.58       ││
│  │ Spread: $17.27  │  │ (US premium: 2x)│   │ Reefer capacity: Normal     ││
│  │                 │  │                 │   │                             ││
│  │ [7-day chart]   │  │ [7-day chart]   │   │ [Calculate your route →]    ││
│  └─────────────────┘  └─────────────────┘   └─────────────────────────────┘│
│                                                                             │
│  Last updated: Monday, December 30, 2025 at 2:15 PM ET                      │
│  Sources: USDA Market News, EIA, Freightos Baltic Index                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  📧 Get weekly market updates delivered to your inbox                  ││
│  │  [Email Address                    ] [Subscribe]                       ││
│  │  Join 2,400+ food service operators who start their week informed.    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources by Card:**

| Card | Primary Source | Endpoint | Update Frequency |
|------|---------------|----------|------------------|
| Poultry | USDA LMPR | Report 2462 (Chicken Parts) | Daily |
| Cooking Oil | USDA ERS Oil Crops | Yearbook Tables | Monthly |
| Beef | USDA LMPR | Report 2461 (Boxed Beef) | Daily |
| Sugar | USDA ERS Sugar | Yearbook Tables | Monthly |
| Ocean Freight | Freightos FBX | FBX03 (Asia→USEC) | Daily |
| Trucking | EIA + ATRI benchmark | Diesel + $2.26/mi baseline | Weekly |

**Inline Lead Capture:**
- Email-only field (lowest friction)
- Value prop: "Weekly market updates"
- Social proof: "Join X operators..."
- This captures top-of-funnel leads who aren't ready to request pricing

**Mobile Adaptation:**
- Horizontal scrolling card carousel
- Or: Accordion with commodity categories
- Email capture remains full-width

**SEO Value:**
- Target keywords: "chicken prices today," "cooking oil price," "freight rates to [city]"
- Updated timestamps signal freshness to Google
- Structured data markup for prices (`schema.org/PriceSpecification`)

---

### SECTION 5: COST CALCULATOR SECTION

**Purpose:** Interactive tool that qualifies leads through their inputs while demonstrating value.

**Calculator Options (implement one or more):**

#### Option A: Landed Cost Estimator
"What does it really cost to get product to your door?"

Inputs:
- Product category (disposables, proteins, both)
- Approximate monthly spend OR order size
- Your location (pre-filled from city page)

Outputs (ungated):
- Estimated freight component
- Current fuel surcharge impact
- Comparison: "Typical broadline distributor vs. our pricing"

Outputs (gated - require email):
- Detailed breakdown PDF
- Custom quote request
- Historical trend analysis

#### Option B: Freight Rate Calculator
"Estimate shipping costs from Atlanta to your location"

Inputs:
- Destination city/zip (pre-filled)
- Shipment type (LTL, full truck)
- Product type (dry, refrigerated)

Outputs:
- Estimated cost per mile
- Total freight estimate
- Fuel surcharge component
- "Request exact quote" CTA

#### Option C: Import Cost Calculator (for disposables from Asia)
"Understand the true cost of imported disposables"

Inputs:
- Product type (foam containers, paper goods, cutlery)
- Origin country (China, Vietnam, etc.)
- Container size (20ft, 40ft)

Outputs:
- Current ocean freight rate
- Estimated tariff/duty
- Landed cost comparison
- "Source through us instead" CTA

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Calculate Your Costs                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │   What are you looking to purchase?                                     ││
│  │   ○ Disposables & Paper    ○ Proteins    ○ Both                        ││
│  │                                                                         ││
│  │   Estimated monthly spend:                                              ││
│  │   [$5,000 ─────●───────────────── $50,000]                             ││
│  │                  $12,000                                                ││
│  │                                                                         ││
│  │   Your location:                                                        ││
│  │   [Tampa, FL                              ] ← Pre-filled               ││
│  │                                                                         ││
│  │                        [Calculate Savings →]                            ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│                              ↓ RESULTS ↓                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │   Based on $12,000/month in disposables to Tampa, FL:                  ││
│  │                                                                         ││
│  │   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐ ││
│  │   │ FREIGHT SAVINGS  │    │ PRICING SAVINGS  │    │ TOTAL ANNUAL     │ ││
│  │   │    $1,200/yr     │    │    $3,600/yr     │    │    $4,800/yr     │ ││
│  │   │ (vs. LTL from    │    │ (vs. typical     │    │                  │ ││
│  │   │  broadline)      │    │  broadline)      │    │  [Get Details]   │ ││
│  │   └──────────────────┘    └──────────────────┘    └──────────────────┘ ││
│  │                                                                         ││
│  │   ⚠️ This is an estimate. Get an exact quote with your specific needs. ││
│  │                                                                         ││
│  │                    [Get Your Custom Quote →]                            ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Gating Strategy:**
1. Basic results = Ungated (builds trust, demonstrates value)
2. "Get Details" button = Triggers lead capture modal
3. Inputs from calculator pre-populate the lead form (they've already told us what they need)

**Calculator-to-Form Data Passing:**
```javascript
// When user clicks "Get Details" or "Get Your Custom Quote"
openLeadForm({
  prefill: {
    productInterest: calculatorInputs.productType,
    estimatedSpend: calculatorInputs.monthlySpend,
    location: calculatorInputs.city,
    calculatedSavings: results.totalSavings
  },
  context: 'calculator_result'
});
```

---

### SECTION 6: PRIMARY LEAD CAPTURE FORM

**Purpose:** Convert interested visitors. Now positioned AFTER value has been delivered.

**Form Type:** Multi-step (86% higher conversion than single-step)

**Step 1: Low Friction Start**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Get Your Custom Quote                                                   │
│                                                                             │
│  Step 1 of 3                                                               │
│  ████████░░░░░░░░░░░░░░░░░░░░░                                             │
│                                                                             │
│  What type of business are you?                                            │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ 🍽️          │  │ 🚚          │  │ 🎪          │  │ 🏢          │       │
│  │ Restaurant  │  │ Food Truck  │  │ Caterer     │  │ Institution │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐                                          │
│  │ 🛒          │  │ ➕          │                                          │
│  │ Grocery     │  │ Other       │                                          │
│  └─────────────┘  └─────────────┘                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 2: Qualification**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Get Your Custom Quote                                                   │
│                                                                             │
│  Step 2 of 3                                                               │
│  ██████████████████░░░░░░░░░░░                                             │
│                                                                             │
│  What products are you looking for?                                        │
│                                                                             │
│  ☑️ Disposables (napkins, plates, cutlery, to-go containers)              │
│  ☐ Custom Printed Products (cups, napkins, bags with your logo)           │
│  ☑️ Proteins (beef, pork, poultry, seafood)                               │
│  ☐ Eco-Friendly Alternatives                                               │
│                                                                             │
│  Estimated monthly spend on these products:                                │
│                                                                             │
│  ○ Under $3,000                                                            │
│  ● $3,000 - $10,000                                                        │
│  ○ $10,000 - $25,000                                                       │
│  ○ Over $25,000                                                            │
│                                                                             │
│                        [Next →]                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 3: Contact Info**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Get Your Custom Quote                                                   │
│                                                                             │
│  Step 3 of 3 - Almost done!                                                │
│  ████████████████████████████░░                                            │
│                                                                             │
│  Business Name *                                                           │
│  [                                                ]                        │
│                                                                             │
│  Your Name *                                                               │
│  [                                                ]                        │
│                                                                             │
│  Email *                                                                   │
│  [                                                ]                        │
│                                                                             │
│  Phone (optional - for faster response)                                    │
│  [                                                ]                        │
│                                                                             │
│                    [Get My Custom Quote →]                                  │
│                                                                             │
│  🔒 We never share your information.                                       │
│  📞 Expect a response within 24 hours (usually same day).                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why Multi-Step Works:**
- "Endowed progress effect" - users who start are more likely to finish
- Early steps are easy (no typing, just clicking)
- By step 3, they're invested
- Form feels shorter even though it captures more data

**If Calculator Was Used:**
- Pre-fill product interests from calculator inputs
- Pre-fill estimated spend from calculator inputs
- Show: "Based on your calculation, here's what we need to provide your quote"
- Skip to Step 3 if enough data already captured

---

### SECTION 7: VALUE PROPOSITIONS

**Purpose:** Reinforce why they should work with you (now AFTER the lead form).

**Content:** Same as before, but now serves as "reassurance" content for those who scrolled past the form.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Why {City} Food Service Operators Choose Us                            │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ 💰              │  │ 🚚              │  │ 📦              │            │
│  │ COMPETITIVE     │  │ RELIABLE        │  │ FLEXIBLE        │            │
│  │ PRICING         │  │ DELIVERY        │  │ MINIMUMS        │            │
│  │                 │  │                 │  │                 │            │
│  │ Atlanta         │  │ 98%+ on-time    │  │ ${minimum}      │            │
│  │ warehouse-      │  │ delivery rate.  │  │ minimum—lower   │            │
│  │ direct pricing  │  │ Consistent      │  │ than Sysco or   │            │
│  │ with no         │  │ weekly service  │  │ US Foods        │            │
│  │ middleman       │  │ you can count   │  │ requires.       │            │
│  │ markup.         │  │ on.             │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ 🎨 CUSTOM PRINT CAPABILITIES                                │           │
│  │                                                              │           │
│  │ Put your logo on cups, napkins, to-go containers, and       │           │
│  │ packaging. We handle artwork, production, and delivery—     │           │
│  │ one source for stock and custom disposables.                │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### SECTION 8: PRODUCT CATEGORIES

**Purpose:** Help visitors understand your product range. Each category links to a dedicated page.

**Keep as-is from original template, but add:**
- Thumbnail images for each category
- "View Products →" links to category pages
- Badge showing "X products" in each category (if available)

---

### SECTION 9: ACTIVE RECALLS SECTION

**Purpose:** Full recall information for those who want details. SEO value for "food recall" searches.

**Data Source:** openFDA API with filters for:
- Product types: meat, poultry, seafood, produce, dairy
- Classification: Class I (dangerous), Class II (potentially dangerous)
- Recency: Last 90 days
- Geography: Filter to states in service area OR show all

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Active Food Recalls                                                     │
│                                                                             │
│  Filter: [All Categories ▼]  [All States ▼]  [Last 90 Days ▼]             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 🔴 CLASS I - HIGH RISK                                    Dec 28, 2025 ││
│  │                                                                         ││
│  │ ABC Foods Ground Beef Products                                          ││
│  │ Reason: Possible E. coli O157:H7 contamination                         ││
│  │ Products: 1-lb and 2-lb ground beef packages                           ││
│  │ Distribution: GA, FL, AL, TN, SC                                       ││
│  │                                                                         ││
│  │ [View Full FDA Notice →]                                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 🟡 CLASS II - MODERATE RISK                               Dec 22, 2025 ││
│  │                                                                         ││
│  │ XYZ Poultry Chicken Strips                                              ││
│  │ Reason: Undeclared allergen (soy)                                       ││
│  │ Products: 5-lb bags with specific lot numbers                           ││
│  │ Distribution: Nationwide                                                ││
│  │                                                                         ││
│  │ [View Full USDA Notice →]                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  [Load More Recalls...]                                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  🔔 Get Instant Recall Alerts                                          ││
│  │                                                                         ││
│  │  Be the first to know when recalls affect your area.                   ││
│  │  [Email Address                    ] [Subscribe]                       ││
│  │                                                                         ││
│  │  ☐ All recalls  ☑️ Proteins only  ☐ Produce only                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  Sources: FDA.gov, USDA FSIS. Updated automatically.                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Micro Lead Capture:**
- Recall alert subscription = email + category preference
- Lower friction than full quote form
- Captures food safety-conscious operators
- Ongoing touchpoint for nurture campaigns

**SEO Value:**
- Target: "[state] food recalls," "restaurant food recalls," "meat recall today"
- Always fresh (API updates daily)
- High E-E-A-T signals (citing government sources)

---

### SECTION 10: LOCAL MARKET SECTION

**Purpose:** City-specific content for local SEO. Unchanged from original template.

Contents:
- Service area map or county list
- Institutional anchors (military bases, universities, hospitals)
- Local restaurant/foodservice statistics
- State compliance information (if applicable)

---

### SECTION 11: SOCIAL PROOF

**Purpose:** Build trust. Unchanged from original template.

Contents:
- Testimonial (local if available)
- Customer logos (if permitted)
- Industry certifications

---

### SECTION 12: NEARBY CITIES

**Purpose:** Internal linking for SEO. Unchanged from original template.

---

### SECTION 13: FOOTER CTA

**Purpose:** Final conversion opportunity.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Ready to improve your supply chain?                                       │
│                                                                             │
│  [Get Your Custom Quote]     or call (XXX) XXX-XXXX                        │
│                                                                             │
│  Response within 24 hours on all quote requests.                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PERSISTENT ELEMENTS

### Sticky CTA (Desktop)

Appears after user scrolls past the hero section (approximately 600px).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                     RIGHT SIDEBAR (STICKY) │
│                                                     ┌────────────────────┐ │
│                                                     │ Get Your Quote    │ │
│                                                     │                    │ │
│                                                     │ [Business Name   ] │ │
│                                                     │ [Email           ] │ │
│                                                     │ [Phone           ] │ │
│                                                     │                    │ │
│                                                     │ [Get Quote →]     │ │
│                                                     │                    │ │
│                                                     │ or call            │ │
│                                                     │ (XXX) XXX-XXXX    │ │
│                                                     └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Fixed position on right side
- Scrolls out of view when reaching footer
- Collapsed state on smaller desktop screens (icon + "Get Quote" only)

### Sticky Bottom Bar (Mobile)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [📞 Call Now]                              [Get Quote →]                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Fixed at bottom of screen
- Appears after scrolling past hero
- "Call Now" = click-to-call
- "Get Quote" = opens full-screen form modal

### Exit Intent Popup

**Trigger:** Cursor moves toward browser chrome (desktop) or back button tap (mobile)

**Timing:** Only after 30+ seconds on page (don't interrupt quick visitors)

**Frequency:** Once per session maximum

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                           [×]               │
│                                                                             │
│     Before you go...                                                       │
│                                                                             │
│     Get this week's market intelligence report                             │
│     delivered to your inbox.                                               │
│                                                                             │
│     • Protein price movements                                              │
│     • Freight cost trends                                                  │
│     • Active recall summary                                                │
│     • Opportunity buy alerts                                               │
│                                                                             │
│     [Email Address                    ] [Send My Report]                   │
│                                                                             │
│     Join 2,400+ food service operators who start their week informed.     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Works:**
- Offers genuine value (not just "subscribe to our newsletter")
- Low friction (email only)
- Creates nurture opportunity for non-converters
- Report can link back to site for additional touchpoints

---

## LEAD CAPTURE SUMMARY: MULTIPLE ENTRY POINTS

The new structure provides **5 distinct lead capture opportunities**, each with appropriate friction level:

| Capture Point | Location | Friction | What We Get |
|--------------|----------|----------|-------------|
| **Market Alerts** | Section 4 (Market Intelligence) | Very Low | Email only |
| **Calculator Result** | Section 5 (Calculator) | Low-Medium | Email + Calculator inputs |
| **Primary Form** | Section 6 | Medium | Full qualification data |
| **Recall Alerts** | Section 9 | Very Low | Email + category preference |
| **Exit Intent** | Popup | Very Low | Email only |

This progressive approach means:
- Casual visitors can still provide email for nurturing
- Serious buyers get full quote form
- Calculator users are pre-qualified by their inputs
- Nobody leaves without a conversion opportunity

---

## DATA INTEGRATION ARCHITECTURE

### API Data Flow

```
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│  Government     │     │  Supabase Edge          │     │  Astro SSR      │
│  APIs           │ ──→ │  Functions              │ ──→ │  Pages          │
│  (USDA, EIA,    │     │  (Fetch, Cache, Store)  │     │  (Server-Side   │
│   FDA, etc.)    │     │                         │     │   Rendering)    │
└─────────────────┘     └─────────────────────────┘     └─────────────────┘
                                   │
                                   ↓
                        ┌─────────────────────────┐
                        │  PostgreSQL             │
                        │  (Cache + Historical)   │
                        └─────────────────────────┘
```

### Supabase Edge Function: Data Fetcher

```typescript
// supabase/functions/market-data/index.ts

export async function fetchMarketData() {
  // Check cache first
  const cached = await getCachedData('market-snapshot');
  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  // Fetch fresh data from multiple sources
  const [chicken, beef, diesel, oil] = await Promise.all([
    fetchUSDAPoultry(),      // USDA LMPR
    fetchUSDABeef(),         // USDA LMPR
    fetchEIADiesel(),        // EIA API
    fetchUSDAOilCrops()      // USDA ERS
  ]);

  const data = {
    chicken,
    beef,
    diesel,
    cookingOil: oil,
    updatedAt: new Date().toISOString()
  };

  // Cache for appropriate duration
  await cacheData('market-snapshot', data, {
    ttl: calculateTTL(data)  // 4 hours for daily data, 24 hours for weekly
  });

  // Store historical for trend calculations
  await storeHistorical(data);

  return data;
}
```

### Astro Page: Server-Side Rendering

```astro
---
// src/pages/food-service-distribution/[state]/[city].astro
export const prerender = false; // Enable SSR

import { supabase } from '@/lib/supabase';

// Fetch market data (hits Edge Function which checks cache)
const { data: marketData } = await supabase.functions.invoke('market-data');

// Fetch recalls
const { data: recalls } = await supabase.functions.invoke('recalls', {
  body: { state: Astro.params.state }
});

// Get city-specific data
const cityData = await getCityData(Astro.params.state, Astro.params.city);
---

<Layout title={`Food Service Distribution in ${cityData.name}, ${cityData.state}`}>
  
  <!-- Recall bar renders server-side with fresh data -->
  <RecallAlertBar recalls={recalls} />
  
  <!-- Hero with market snapshot -->
  <Hero city={cityData}>
    <MarketSnapshot data={marketData} slot="sidebar" />
  </Hero>
  
  <!-- Market Intelligence Dashboard -->
  <MarketDashboard 
    data={marketData}
    city={cityData}
  />
  
  <!-- Calculator hydrates client-side for interactivity -->
  <CostCalculator 
    client:visible
    city={cityData}
    dieselPrice={marketData.diesel.price}
  />
  
  <!-- Rest of page... -->
  
</Layout>
```

### Cache TTL Strategy

| Data Type | Source Update | Cache TTL | Rationale |
|-----------|--------------|-----------|-----------|
| Poultry prices | Daily ~2-4pm ET | 4 hours | Balance freshness with API limits |
| Beef prices | Daily ~2-4pm ET | 4 hours | Balance freshness with API limits |
| Diesel prices | Weekly (Monday) | 24 hours | Only updates once per week |
| Cooking oil | Monthly | 24 hours | Infrequent updates |
| Sugar | Monthly | 24 hours | Infrequent updates |
| Recalls | Continuous | 1 hour | Safety-critical, check frequently |
| Ocean freight (Freightos) | Daily | 4 hours | Moderate volatility |

---

## SEO CONSIDERATIONS

### Freshness Signals

1. **Visible timestamps** on all dynamic data sections
2. **`dateModified` in schema markup** updated when data refreshes
3. **"Last updated" footer** on each page showing most recent data pull
4. **Weekly unique content** through market commentary (optional, future enhancement)

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Food Distribution",
  "areaServed": {
    "@type": "City",
    "name": "Atlanta"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "dateModified": "2025-12-30T14:15:00-05:00"
}
```

### Target Keywords by Section

| Section | Primary Keywords | Long-Tail Opportunities |
|---------|-----------------|------------------------|
| Hero | food service distribution [city] | wholesale food distributor [city] |
| Market Data | chicken price today, cooking oil price | wholesale chicken price per pound |
| Calculator | freight cost calculator, shipping cost estimator | trucking cost atlanta to [city] |
| Recalls | food recall today, meat recall [state] | restaurant food safety alerts |

---

## MOBILE-FIRST SPECIFICATIONS

### Thumb Zone Optimization

Most critical actions within easy thumb reach (bottom 1/3 of screen):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           TOP 1/3                                          │
│                      (View-only content)                                   │
│                   Recall banner, headlines                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          MIDDLE 1/3                                        │
│                    (Scrolling content)                                     │
│               Market data cards, calculator                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          BOTTOM 1/3                                        │
│                    (Primary actions)                                       │
│              Sticky CTA bar, form buttons                                 │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  [📞 Call]                                          [Get Quote →]      ││
│  └────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Form Specifications

- Single column layout only
- Minimum touch target: 48px height
- Input fields: 16px font (prevents iOS zoom)
- Appropriate keyboard types (`tel`, `email`, `number`)
- Inline validation (no error modals)
- Progress indicator visible without scrolling

### Mobile Market Data

Options for displaying commodity data on small screens:

**Option A: Horizontal Scroll**
```
┌───────────────────────────────────────────┐
│ [🍗 $1.12] → [🛢️ $0.52] → [🥩 $315] → [⛽ $3.58]
└───────────────────────────────────────────┘
```

**Option B: Collapsible Accordion**
```
┌───────────────────────────────────────────┐
│ 🍗 Poultry Prices                    [+] │
├───────────────────────────────────────────┤
│ 🛢️ Cooking Oil                       [−] │
│   Soybean: $0.52/lb ↓1.8%               │
│   Canola: $0.48/lb                       │
├───────────────────────────────────────────┤
│ 🥩 Beef Prices                       [+] │
└───────────────────────────────────────────┘
```

**Option C: Priority Display**
Show only 2-3 most relevant metrics, with "See all market data →" link

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Supabase Edge Functions for API caching
- [ ] Implement USDA, EIA, FDA data fetchers
- [ ] Create cache tables and historical storage
- [ ] Build basic market data components

### Phase 2: Core Sections (Week 3-4)
- [ ] Build new hero with market snapshot
- [ ] Create market intelligence dashboard section
- [ ] Implement recall alert bar and section
- [ ] Build multi-step lead capture form

### Phase 3: Calculator (Week 5-6)
- [ ] Design and build cost calculator
- [ ] Implement calculator-to-form data passing
- [ ] Create gated/ungated result views
- [ ] Test and refine conversion flow

### Phase 4: Polish & Persistent Elements (Week 7-8)
- [ ] Build sticky sidebar/bottom bar
- [ ] Implement exit intent popup
- [ ] Mobile optimization pass
- [ ] Performance optimization
- [ ] A/B test setup for key elements

### Phase 5: Scale (Week 9+)
- [ ] Roll out to all 156 city pages
- [ ] Monitor conversion rates by section
- [ ] Iterate based on data

---

## SUCCESS METRICS

### Primary KPIs

| Metric | Current (Estimated) | Target | Measurement |
|--------|---------------------|--------|-------------|
| Form Conversion Rate | ~2-3% | 8-12% | Submissions / Unique Visitors |
| Email Capture Rate | 0% (no micro-captures) | 5-8% | Any email captured / Visitors |
| Calculator Engagement | N/A | 15-20% | Calculator interactions / Visitors |
| Return Visitor Rate | Unknown | 10-15% | Return visits / Total visits |

### Secondary KPIs

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Time on Page | +40% | Engaging with market data |
| Scroll Depth | 70%+ reach form | Content is compelling |
| Bounce Rate | -20% | Immediate value reduces exits |
| Pages per Session | +30% | Internal linking working |

### SEO Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Keyword rankings for "[city] food distributor" | Top 10 | 3-6 months |
| Keywords with freshness intent (price/recall) | Top 5 | 6-12 months |
| Organic traffic | +50% | 6 months |
| Featured snippets for price queries | 3-5 | 6-12 months |

---

## APPENDIX: COMPONENT SPECIFICATIONS

### MarketSnapshot Component

```typescript
interface MarketSnapshotProps {
  chicken: PriceData;
  cookingOil: PriceData;
  diesel: PriceData;
  updatedAt: string;
}

interface PriceData {
  current: number;
  previous: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  percentChange: number;
}
```

### RecallAlertBar Component

```typescript
interface RecallAlertBarProps {
  recalls: Recall[];
  maxDisplay?: number; // Default 3
}

interface Recall {
  id: string;
  classification: 'Class I' | 'Class II' | 'Class III';
  product: string;
  reason: string;
  states: string[];
  date: string;
  url: string; // FDA/USDA source
}
```

### CostCalculator Component

```typescript
interface CostCalculatorProps {
  city: CityData;
  dieselPrice: number;
  onCalculate?: (results: CalculationResults) => void;
  onRequestQuote?: (data: CalculatorData) => void;
}

interface CalculatorData {
  productType: 'disposables' | 'proteins' | 'both';
  monthlySpend: number;
  location: string;
}

interface CalculationResults {
  freightSavings: number;
  pricingSavings: number;
  totalAnnualSavings: number;
}
```

### MultiStepForm Component

```typescript
interface MultiStepFormProps {
  prefillData?: Partial<LeadFormData>;
  context?: 'calculator' | 'direct' | 'exit_intent';
  onSubmit: (data: LeadFormData) => Promise<void>;
}

interface LeadFormData {
  // Step 1
  businessType: BusinessType;
  
  // Step 2
  productInterests: ProductCategory[];
  estimatedSpend: SpendRange;
  
  // Step 3
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  
  // Meta
  source: string;
  calculatorData?: CalculatorData;
}
```

---

## CONCLUSION

This restructured template transforms your landing pages from static brochures into **living market intelligence resources** that:

1. **Lead with value** - Commodity prices and recall alerts visible immediately
2. **Give reasons to return** - Fresh data that updates daily/weekly
3. **Position strategically** - Lead capture after value demonstrated (Section 6, not Section 7+)
4. **Capture at multiple levels** - From low-friction email to full qualification
5. **Leverage your APIs** - All that data infrastructure finally visible to users
6. **Improve SEO** - Freshness signals, price keywords, recall queries

The information-first approach matches how the industry leaders (Urner Barry, FreightWaves) operate: give away enough to build trust and traffic, gate the personalized insights behind lead capture.
