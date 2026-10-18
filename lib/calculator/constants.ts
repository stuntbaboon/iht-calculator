/**
 * Statutory UK Inheritance Tax (IHT) Constants & Thresholds
 * Rates valid for current UK tax legislation (2024 - 2028).
 */

// Nil-Rate Band (NRB) - Section 7 & Schedule 2 IHTA 1984
export const STANDARD_NRB = 325_000;
export const MAX_TRANSFERRED_NRB = 325_000;
export const MAX_COMBINED_NRB = 650_000;

// Residence Nil-Rate Band (RNRB) - Sections 8D-8M IHTA 1984
export const STANDARD_RNRB = 175_000;
export const MAX_TRANSFERRED_RNRB = 175_000;
export const MAX_COMBINED_RNRB = 350_000;
export const MAX_COMBINED_ALLOWANCES = 1_000_000; // £650k NRB + £350k RNRB

// RNRB Tapering (High-Value Estates)
export const RNRB_TAPER_THRESHOLD = 2_000_000;
export const RNRB_TAPER_RATE = 0.5; // £1 of allowance lost for every £2 over £2,000,000

// Statutory Tax Rates
export const STANDARD_IHT_RATE = 0.40; // 40%
export const REDUCED_CHARITY_IHT_RATE = 0.36; // 36% (if >= 10% of baseline left to charity)
export const CHARITY_THRESHOLD_PERCENT = 0.10; // 10% of net baseline estate
export const LIFETIME_CLT_RATE = 0.20; // 20% on lifetime Chargeable Lifetime Transfers

// Statutory Gift Exemptions
export const ANNUAL_GIFT_EXEMPTION = 3_000; // per tax year
export const SMALL_GIFT_EXEMPTION = 250; // per recipient per tax year
export const WEDDING_GIFT_CHILD = 5_000;
export const WEDDING_GIFT_GRANDCHILD = 2_500;
export const WEDDING_GIFT_OTHER = 1_000;

// Taper Relief Schedule on PETs exceeding NRB within 7 years (Section 7(4) IHTA 1984)
export const TAPER_RELIEF_SCHEDULE = [
  { maxYears: 3, taperPercent: 0, taxRate: 0.40 },   // 0 to 3 years: 0% reduction (40% tax)
  { maxYears: 4, taperPercent: 20, taxRate: 0.32 },  // 3 to 4 years: 20% reduction (32% tax)
  { maxYears: 5, taperPercent: 40, taxRate: 0.24 },  // 4 to 5 years: 40% reduction (24% tax)
  { maxYears: 6, taperPercent: 60, taxRate: 0.16 },  // 5 to 6 years: 60% reduction (16% tax)
  { maxYears: 7, taperPercent: 80, taxRate: 0.08 },  // 6 to 7 years: 80% reduction (8% tax)
] as const;
