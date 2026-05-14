import { defineCollection, z } from 'astro:content';

/**
 * `guides` collection — all editorial content (pillars, trends, clusters, FAQs).
 *
 * Routing: `apps/web/src/pages/guides/[slug].astro` walks every entry.
 * The `type` field is the editorial discriminator; URL stays `/guides/[slug]/`
 * regardless of type so PageRank concentrates on a single namespace.
 *
 * Each MDX file's frontmatter must validate against this schema. Build fails
 * with a clear error if a required field is missing or has the wrong shape.
 *
 * `faqs` live in frontmatter (not inline MDX) so ArticleLayout can pull them
 * out for FAQPage JSON-LD without having to parse the MDX body. Answers are
 * plain strings — keep them concise; no markdown inside.
 *
 * `relatedCategories` are catalog slugs (e.g. "pet_clamshells"). The layout
 * resolves them at build time against `src/data/catalog.json` to produce
 * "Shop related products" links — no manual URL or price upkeep.
 *
 * `relatedGuides` are other guide slugs. Used for "Read next" links.
 */
const guides = defineCollection({
  type: 'content',
  // slug is auto-derived from filename by Astro 5+ (e.g. `foodservice-clamshells.mdx`
  // → entry.slug === "foodservice-clamshells"). Don't define it in the schema —
  // Astro reserves the field and rejects explicit overrides.
  schema: z.object({
    title: z.string().min(8).max(120),
    description: z.string().min(40).max(200),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    type: z.enum(['pillar', 'trend', 'cluster', 'faq']),
    category: z.string().optional(),
    relatedCategories: z.array(z.string()).default([]),
    relatedGuides: z.array(z.string()).default([]),
    heroEmoji: z.string().optional(),
    tableOfContents: z.boolean().default(true),
    faqs: z
      .array(z.object({ question: z.string().min(5), answer: z.string().min(20) }))
      .default([]),
  }),
});

/**
 * `catalog` collection — editorial enrichment for each /catalog/[category]/ page.
 *
 * Each MDX entry's slug MUST match a catalog category slug exactly (see
 * `src/data/catalog.json`). The catalog page renders the enrichment above
 * the SKU grid when the matching entry exists; missing entries fall back to
 * the existing minimal layout (zero regression risk during rollout).
 *
 * The editorial prose lives in the MDX body. Frontmatter carries only the
 * structured data the layout needs (headline, FAQs, related links).
 */
const catalog = defineCollection({
  type: 'content',
  // Filename = slug (e.g. `pet_clamshells.mdx` → entry.id === "pet_clamshells").
  // The catalog page joins on entry.id, which matches catalog.json.slug exactly.
  schema: z.object({
    headline: z.string().min(8).max(120),
    relatedCategories: z.array(z.string()).min(3).max(6),
    pillarGuide: z.string().optional(),
    faqs: z
      .array(z.object({ question: z.string().min(5), answer: z.string().min(20) }))
      .min(4)
      .max(8),
  }),
});

export const collections = { guides, catalog };
