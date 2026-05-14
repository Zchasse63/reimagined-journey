/**
 * Public catalog types — used by /catalog pages.
 *
 * Source of truth: apps/web/src/data/catalog.json, generated from the Servous
 * Supabase (`bxoggqfqdwizimsltztq`). Regenerate by re-running the data sync
 * (see scripts/sync-catalog if/when automated, otherwise the SQL is documented
 * in the catalog PR).
 *
 * IMPORTANT: `vendorCostPerCase` is retained in the JSON for the generation
 * script's audit trail but MUST NOT be rendered in any UI template. Only
 * `sellPricePerCase` and `sellPricePerUnit` ship to the browser.
 */

export interface CatalogProduct {
  sku: string;
  name: string;
  description: string;
  packDisplay: string;
  casePackCount: number;
  material: string | null;
  ozCapacity: number | null;
  compartments: number | null;
  microwaveSafe: boolean;
  freezerSafe: boolean;
  compostable: boolean;
  recyclableCode: string | null;
  /** Internal — DO NOT render. Kept for sync audit only. */
  vendorCostPerCase: number;
  sellPricePerCase: number;
  sellPricePerUnit: number;
}

export interface CatalogCategory {
  slug: string;
  name: string;
  skuCount: number;
  priceRangeMin: number;
  priceRangeMax: number;
  products: CatalogProduct[];
}

export type CatalogData = CatalogCategory[];
