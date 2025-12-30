# Design Guide: Food Service Distribution Platform

## Overview

This design guide provides complete specifications for building a B2B lead generation platform targeting the food service industry. The design prioritizes **conversion**, **trust**, and **mobile-first** experience while maintaining a professional appearance suitable for business buyers.

---

## Design Principles

### 1. Conversion-First Design
- Every page has a clear primary CTA visible above the fold
- Reduce cognitive load by limiting choices per screen
- Progressive disclosure of information
- Speed-to-lead: minimize friction in all conversion paths

### 2. Trust & Credibility
- Professional appearance suitable for B2B purchasing decisions
- Data-driven transparency (USDA pricing references, market data)
- Social proof strategically placed near decision points
- Clear communication of service capabilities and limitations

### 3. Mobile-Optimized
- 82.9% of landing page visitors use mobile devices
- Touch targets minimum 44px
- Simplified navigation for small screens
- Fast loading (LCP < 2.5s, CLS < 0.1)

### 4. Accessible
- WCAG 2.1 AA compliance
- Color contrast ratios minimum 4.5:1 for text
- Keyboard navigation support
- Screen reader compatibility

---

## Color System

### Primary Palette

The color system uses warm, trustworthy tones appropriate for food service and professional B2B contexts.

```css
:root {
  /* Primary - Forest Green (Trust, Reliability, Food Industry) */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-200: #bbf7d0;
  --color-primary-300: #86efac;
  --color-primary-400: #4ade80;
  --color-primary-500: #22c55e;   /* Primary brand color */
  --color-primary-600: #16a34a;   /* Primary hover */
  --color-primary-700: #15803d;   /* Primary active */
  --color-primary-800: #166534;
  --color-primary-900: #14532d;
  --color-primary-950: #052e16;

  /* Secondary - Warm Amber (Energy, Appetite, Action) */
  --color-secondary-50: #fffbeb;
  --color-secondary-100: #fef3c7;
  --color-secondary-200: #fde68a;
  --color-secondary-300: #fcd34d;
  --color-secondary-400: #fbbf24;
  --color-secondary-500: #f59e0b;   /* Secondary brand color */
  --color-secondary-600: #d97706;   /* Secondary hover */
  --color-secondary-700: #b45309;
  --color-secondary-800: #92400e;
  --color-secondary-900: #78350f;

  /* Neutral - Slate Gray (Professional, Clean) */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;
  --color-neutral-950: #020617;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Background Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-dark: #0f172a;
}
```

### Color Usage Guidelines

| Element | Color | Usage |
|---------|-------|-------|
| Primary CTA buttons | `primary-600` | "Request Quote", "Get Pricing" |
| Secondary CTA buttons | `secondary-500` | "View Deals", "Learn More" |
| Headlines | `neutral-900` | Page titles, section headers |
| Body text | `neutral-700` | Paragraph content |
| Muted text | `neutral-500` | Captions, helper text |
| Links | `primary-600` | Inline links, navigation |
| Backgrounds | `bg-secondary` | Content sections, cards |
| Borders | `neutral-200` | Form inputs, dividers |
| Success states | `success` | Form validation, confirmations |
| Error states | `error` | Form errors, alerts |

### Accessibility Requirements

- **Normal text (16px)**: Minimum contrast ratio 4.5:1
- **Large text (18px+)**: Minimum contrast ratio 3:1
- **UI components**: Minimum contrast ratio 3:1
- **Do not rely on color alone** to convey information

---

## Typography

### Font Stack

```css
:root {
  /* Primary font - Clean, professional, highly legible */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 
               BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 
               Arial, sans-serif;
  
  /* Monospace - For pricing, data displays */
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 
               Menlo, Monaco, Consolas, monospace;
}
```

### Type Scale

Based on a 1.25 (Major Third) scale with 16px base.

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
}
```

### Typography Styles

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Page title) | `text-4xl` / `text-5xl` | `font-bold` | `leading-tight` | `tracking-tight` |
| H2 (Section) | `text-3xl` | `font-semibold` | `leading-tight` | `tracking-tight` |
| H3 (Subsection) | `text-2xl` | `font-semibold` | `leading-snug` | `tracking-normal` |
| H4 (Card title) | `text-xl` | `font-semibold` | `leading-snug` | `tracking-normal` |
| Body large | `text-lg` | `font-normal` | `leading-relaxed` | `tracking-normal` |
| Body | `text-base` | `font-normal` | `leading-normal` | `tracking-normal` |
| Body small | `text-sm` | `font-normal` | `leading-normal` | `tracking-normal` |
| Caption | `text-xs` | `font-medium` | `leading-normal` | `tracking-wide` |
| Button | `text-sm` / `text-base` | `font-semibold` | `leading-none` | `tracking-wide` |
| Label | `text-sm` | `font-medium` | `leading-none` | `tracking-normal` |

### Typography Rules

1. **Headlines**: Never use more than one H1 per page
2. **Body text**: Maximum 75 characters per line for readability
3. **Mobile**: Reduce heading sizes by one step (H1 → text-3xl)
4. **Numbers/Pricing**: Use tabular figures (`font-variant-numeric: tabular-nums`)
5. **ALL CAPS**: Use sparingly, only for labels and small UI elements

---

## Spacing System

Based on a 4px grid system for consistency.

```css
:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1.5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2.5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3.5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-28: 7rem;        /* 112px */
  --space-32: 8rem;        /* 128px */
}
```

### Spacing Guidelines

| Context | Spacing Token | Usage |
|---------|---------------|-------|
| Section padding | `space-16` / `space-20` | Vertical padding between major sections |
| Card padding | `space-6` | Internal card padding |
| Form group gap | `space-4` | Between form fields |
| Button padding | `space-3` × `space-6` | Vertical × horizontal |
| Icon + text gap | `space-2` | Between icon and label |
| List item gap | `space-2` | Between list items |
| Paragraph gap | `space-4` | Between paragraphs |
| Heading + content | `space-4` / `space-6` | Below headings |

---

## Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-default: 0.25rem; /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

### Border Radius Usage

| Element | Radius |
|---------|--------|
| Buttons | `radius-lg` |
| Cards | `radius-xl` |
| Form inputs | `radius-md` |
| Badges/Tags | `radius-full` |
| Images | `radius-lg` |
| Modals | `radius-2xl` |

---

## Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

---

## Component Specifications

### Buttons

#### Primary Button
```
┌────────────────────────────────────┐
│      REQUEST PRICING →             │
└────────────────────────────────────┘

Background: primary-600
Text: white
Border: none
Padding: 12px 24px (space-3 × space-6)
Font: text-base, font-semibold, tracking-wide
Border-radius: radius-lg
Transition: all 150ms ease

Hover: primary-700, shadow-md, translateY(-1px)
Active: primary-800, shadow-sm, translateY(0)
Focus: ring-2 ring-primary-500 ring-offset-2
Disabled: opacity-50, cursor-not-allowed
```

#### Secondary Button
```
Background: transparent
Text: primary-600
Border: 1px solid primary-600
Padding: 12px 24px
Font: text-base, font-semibold

Hover: primary-50 background
Active: primary-100 background
```

#### Button Sizes

| Size | Padding | Font Size | Min Height |
|------|---------|-----------|------------|
| Small | `space-2 × space-4` | `text-sm` | 32px |
| Default | `space-3 × space-6` | `text-base` | 44px |
| Large | `space-4 × space-8` | `text-lg` | 52px |

### Form Inputs

#### Text Input
```
┌─────────────────────────────────────────┐
│ Business Name                           │
└─────────────────────────────────────────┘

Background: white
Border: 1px solid neutral-300
Border-radius: radius-md
Padding: 12px 16px
Font: text-base
Min-height: 44px (touch target)

Focus: border-primary-500, ring-2 ring-primary-100
Error: border-error, ring-2 ring-error/20
Disabled: bg-neutral-100, text-neutral-500
```

#### Label
```
Font: text-sm, font-medium
Color: neutral-700
Margin-bottom: space-1.5
```

#### Helper Text
```
Font: text-sm
Color: neutral-500
Margin-top: space-1
```

#### Error Message
```
Font: text-sm
Color: error
Margin-top: space-1
Icon: exclamation-circle (inline)
```

### Cards

#### Standard Card
```
┌──────────────────────────────────────────┐
│                                          │
│  [Icon]                                  │
│                                          │
│  Card Title                              │
│                                          │
│  Card description text goes here with   │
│  supporting information about the        │
│  feature or content.                     │
│                                          │
│              [Learn More →]              │
│                                          │
└──────────────────────────────────────────┘

Background: white
Border: 1px solid neutral-200
Border-radius: radius-xl
Padding: space-6
Shadow: shadow-sm

Hover: shadow-md, border-neutral-300
```

#### Feature Card (Value Props)
```
Background: bg-secondary
Border: none
Border-radius: radius-xl
Padding: space-8
Icon: 48px, primary-600
Title: text-xl, font-semibold, neutral-900
Description: text-base, neutral-600
```

### Navigation

#### Desktop Header
```
Height: 72px
Background: white
Border-bottom: 1px solid neutral-200
Shadow: shadow-sm (on scroll)
Position: sticky top-0
z-index: 50

Logo: left-aligned
Navigation: center
CTA Button: right-aligned
```

#### Mobile Header
```
Height: 64px
Hamburger menu icon: 24px
Mobile menu: full-screen overlay, bg-white
Menu items: text-lg, space-4 gap
```

### Delivery Info Bar

```
┌────────────────────────────────────────────────────────────────────┐
│ 🚚 Route Truck  │  📅 Weekly Service  │  📋 Order by Thu  │  💰 $3,000  │
└────────────────────────────────────────────────────────────────────┘

Background: primary-50
Border-top: 2px solid primary-500
Padding: space-4
Font: text-sm, font-medium

Icons: 20px, primary-600
Labels: neutral-600
Values: neutral-900, font-semibold

Mobile: 2x2 grid layout
Desktop: 4-column horizontal layout
```

### Trust Badges

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   15+       │ │   500+      │ │   98%       │
│   Years     │ │   Customers │ │   On-Time   │
└─────────────┘ └─────────────┘ └─────────────┘

Number: text-2xl, font-bold, primary-600
Label: text-sm, neutral-600
Gap: space-1
Card gap: space-4
```

---

## Multi-Step Form Design

### Form Structure

```
Step 1: Business Type (Low friction)
├── Visual selector buttons (restaurant, food truck, caterer, etc.)
├── Auto-advance on selection
└── No text input required

Step 2: Service Information
├── Location/zip code
├── Number of locations (dropdown)
├── Primary product interest (checkboxes)
└── Continue button

Step 3: Contact Information
├── Company name
├── Contact name
├── Email
├── Phone (optional)
└── Submit button
```

### Progress Indicator

```
┌─────────────────────────────────────────────────────────────┐
│  ● ─────────── ○ ─────────── ○                              │
│  Business      Service       Contact                        │
│  Type          Info          Details                        │
└─────────────────────────────────────────────────────────────┘

Active step: filled circle, primary-600
Completed: checkmark icon, primary-600
Future: hollow circle, neutral-300
Line: neutral-300, completed segments primary-600
```

### Visual Selector Buttons

```
┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │
│    [🍴 Icon]     │  │    [🚚 Icon]     │
│                  │  │                  │
│   Restaurant     │  │   Food Truck     │
│                  │  │                  │
└──────────────────┘  └──────────────────┘

Size: 120px × 120px minimum
Icon: 32px, neutral-600
Label: text-sm, font-medium
Border: 2px solid neutral-200
Border-radius: radius-xl

Selected: border-primary-600, bg-primary-50
Hover: border-primary-400, shadow-md
Touch target: Full button area (minimum 44px)
```

### Form Field Validation

```
Real-time validation:
- Email format: On blur
- Required fields: On blur
- Phone format: On input (auto-format)

Error display:
- Red border + icon
- Error message below field
- Scroll to first error on submit

Success feedback:
- Green checkmark icon
- Subtle green border
```

---

## Page Layouts

### City Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]              Navigation                        [Get Quote]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    HERO SECTION                                     │
│                                                                     │
│   H1: Food Service Distribution in [City], [State]                 │
│   Subhead: [Delivery method statement]                             │
│                                                                     │
│   [Request Pricing]   [View Current Deals]                         │
│                                                                     │
│   ✓ Trust Badge  ✓ Trust Badge  ✓ Trust Badge                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    DELIVERY INFO BAR                                │
│   🚚 Method  │  📅 Frequency  │  ⏰ Lead Time  │  💰 Minimum        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    VALUE PROPOSITIONS                               │
│                                                                     │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│   │ Pricing    │  │ Reliability│  │ Flexibility│  │ Custom     │  │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    PRODUCT CATEGORIES                               │
│                                                                     │
│   [Disposables]  [Custom Print]  [Proteins]  [Eco-Friendly]        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    LOCAL MARKET SECTION                             │
│                                                                     │
│   Service area map/list                                            │
│   Institutional anchors                                            │
│   Local market statistics                                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    TESTIMONIAL                                      │
│                                                                     │
│   "Quote from satisfied customer..."                               │
│   — Name, Title, Company                                           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    NEARBY CITIES                                    │
│                                                                     │
│   [City 1]  [City 2]  [City 3]  [City 4]                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    LEAD CAPTURE FORM                                │
│                                                                     │
│   Get Your [City] Quote                                            │
│   [Multi-step form]                                                │
│                                                                     │
│   Or call: (XXX) XXX-XXXX                                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    FOOTER                                           │
│   [Logo]  Navigation  Contact  Social  Legal                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Section Specifications

| Section | Background | Top Padding | Bottom Padding |
|---------|------------|-------------|----------------|
| Hero | White | `space-16` | `space-16` |
| Delivery Bar | `primary-50` | `space-4` | `space-4` |
| Value Props | `bg-secondary` | `space-20` | `space-20` |
| Products | White | `space-16` | `space-16` |
| Local Market | `bg-secondary` | `space-16` | `space-16` |
| Testimonial | White | `space-16` | `space-16` |
| Nearby Cities | `bg-secondary` | `space-12` | `space-12` |
| Lead Form | `primary-900` | `space-20` | `space-20` |
| Footer | `neutral-900` | `space-12` | `space-12` |

---

## Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Breakpoint Usage

| Breakpoint | Usage |
|------------|-------|
| `< 640px` | Mobile single column |
| `640-767px` | Large mobile / small tablet |
| `768-1023px` | Tablet / 2-column layouts |
| `1024-1279px` | Desktop / 3-4 column layouts |
| `≥ 1280px` | Large desktop / max-width containers |

### Container Max-Widths

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}
@media (min-width: 768px) {
  .container { max-width: 768px; }
}
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}
@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

---

## Animation & Transitions

### Timing Functions

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Duration Scale

```css
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### Standard Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Buttons | all | 150ms | ease-default |
| Links | color | 150ms | ease-default |
| Cards (hover) | box-shadow, transform | 200ms | ease-out |
| Form inputs | border-color, box-shadow | 150ms | ease-default |
| Dropdowns | opacity, transform | 150ms | ease-out |
| Modal/Overlay | opacity | 200ms | ease-in-out |
| Progress bar | width | 300ms | ease-out |

### Animation Guidelines

1. **Keep animations subtle** - B2B users prioritize efficiency
2. **Duration < 300ms** for micro-interactions
3. **No animation on page load** for Core Web Vitals
4. **Respect `prefers-reduced-motion`** media query
5. **Use transform/opacity** only (GPU accelerated)

---

## Icons

### Icon Library

Use **Lucide React** for consistent, clean icons.

```bash
npm install lucide-react
```

### Icon Sizes

| Context | Size | Usage |
|---------|------|-------|
| Inline text | 16px | Next to labels, in buttons |
| UI elements | 20px | Form icons, badges |
| Feature cards | 24px | Section icons |
| Hero/large | 32-48px | Feature highlights |

### Common Icons

| Purpose | Icon Name |
|---------|-----------|
| Delivery/Truck | `Truck` |
| Calendar/Schedule | `Calendar` |
| Clock/Time | `Clock` |
| Money/Pricing | `DollarSign` |
| Location | `MapPin` |
| Phone | `Phone` |
| Email | `Mail` |
| Check/Success | `Check`, `CheckCircle` |
| Error | `AlertCircle`, `XCircle` |
| Info | `Info` |
| Arrow right | `ArrowRight`, `ChevronRight` |
| Menu | `Menu` |
| Close | `X` |
| Search | `Search` |
| User | `User` |
| Building | `Building2` |
| Restaurant | `UtensilsCrossed` |

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## Checklist for Implementation

### Before Development
- [ ] Load Inter font from Google Fonts
- [ ] Configure Tailwind with custom theme
- [ ] Set up shadcn/ui components
- [ ] Create design token CSS variables

### For Each Component
- [ ] Mobile-first responsive design
- [ ] Touch targets ≥ 44px
- [ ] Keyboard navigation
- [ ] Focus states visible
- [ ] Color contrast verified
- [ ] Loading/error states defined

### For Each Page
- [ ] Single H1 tag
- [ ] Primary CTA above fold
- [ ] Trust signals near CTAs
- [ ] Mobile layout tested
- [ ] Core Web Vitals check
- [ ] Schema markup added
