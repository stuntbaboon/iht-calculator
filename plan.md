# UK Inheritance Tax (IHT) Calculator — Technical & Product Plan

## 1. Executive Summary & Vision

The UK Inheritance Tax (IHT) Calculator is a full-featured, professional, and accessible web application designed to help individuals, couples, and advisors understand their potential inheritance tax exposure, maximize statutory reliefs, and plan their estates effectively.

It balances **maximum statutory depth** (including complex rules like RNRB tapering over £2m, 7-year gift taper schedules, BPR/APR, charity 36% reduction, and the April 2027 pension rules toggle) with an **intuitive, modern user experience** that remains clear and not overwhelming.

Key architectural principle:
- **Serverless & Lightweight**: Built as a Next.js fullstack application with a minimal serverless storage layer for saving and sharing calculations for unauthenticated users, accompanied by client-side local caching.

---

## 2. UK Inheritance Tax Domain Logic & Statutory Rules

### 2.1 Allowances & Thresholds
* **Nil-Rate Band (NRB):** £325,000 per person (frozen through at least April 2028).
* **Transferable Nil-Rate Band (TNRB):** Up to 100% of an unused NRB from a deceased spouse or civil partner (maximum combined: £650,000).
* **Residence Nil-Rate Band (RNRB):** Up to £175,000 when a qualifying residential interest (family home) is left to direct descendants (children, grandchildren, step-children, adopted/fostered children).
* **Transferable RNRB (TRNRB):** Up to 100% of an unused RNRB from a deceased spouse or civil partner (maximum combined: £350,000).
* **Combined Maximum Allowance:** £1,000,000 for married couples / civil partners passing a family home to descendants.
* **Downsizing Addition:** Carried over RNRB value if the individual downsized or sold their primary residence on or after 8 July 2015 and left other assets to direct descendants.
* **RNRB Tapering (High-Value Estates):**
  * Taper threshold is **£2,000,000** net estate value (Gross assets minus debts; note: BPR/APR assets are *not* deducted when testing the £2m taper threshold under statutory HMRC rules).
  * Reduced by **£1 for every £2** of estate value above £2,000,000.
  * Tapers to £0 at £2,350,000 (single) or £2,700,000 (with transferred RNRB).

### 2.2 Tax Rates
* **Standard Rate:** 40% on taxable estate above available allowances.
* **Reduced Rate (Charitable Giving):** 36% if 10% or more of the net baseline estate (estate minus debts, 100% exemptions, and available NRB) is left to registered charities (Inheritance Tax Act 1984, Schedule 1A).
* **Lifetime Transfer Rate:** 20% on Chargeable Lifetime Transfers (CLTs) exceeding the NRB at the time of transfer.

### 2.3 Lifetime Gifts & The 7-Year Rule (PETs)
* **Annual Exemption:** £3,000 per tax year (can carry forward 1 unused tax year, up to £6,000).
* **Small Gifts Exemption:** £250 per person per tax year (cannot be combined with other exemptions for the same person).
* **Wedding / Civil Ceremony Gifts:** £5,000 (child), £2,500 (grandchild), £1,000 (others).
* **Normal Expenditure out of Income:** 100% exempt if gifts are habitual/regular and paid from surplus income without diminishing living standards.
* **Nil-Rate Band Consumption Order:** Gifts made within 7 years of death use up the Nil-Rate Band first in chronological order before the remaining NRB is applied to the death estate.
* **Taper Relief Schedule (for gifts exceeding the NRB):**
  * 0 to 3 years before death: 0% taper (40% tax rate)
  * 3 to 4 years before death: 20% taper (32% effective rate)
  * 4 to 5 years before death: 40% taper (24% effective rate)
  * 5 to 6 years before death: 60% taper (16% effective rate)
  * 6 to 7 years before death: 80% taper (8% effective rate)
  * 7+ years: 100% exempt (PET becomes completely tax-free).

### 2.4 Reliefs & Exemptions
* **Spouse / Civil Partner Exemption:** 100% exempt transfers between UK-domiciled spouses/civil partners (lifetime or death).
* **Business Property Relief (BPR):** 100% relief for unquoted trading company shares or sole proprietorships; 50% for quoted shares giving >50% control or land/buildings/plant used by a business.
* **Agricultural Property Relief (APR):** 100% or 50% relief for agricultural land and buildings occupied for agricultural purposes.
* **Debts & Liabilities:** Mortgages, debts, loans, credit cards, and reasonable funeral expenses deducted prior to tax calculation.
* **Life Insurance Policies:** Written in trust (outside estate, zero IHT) vs. not in trust (part of gross estate).
* **Pensions Toggle (Autumn Budget 2024 Rule Change):**
  * Current Rule (up to April 2027): Unused pension funds and death benefits held under discretionary trust are outside the estate.
  * April 2027+ Rule: Unused defined contribution pension pots and death benefits are brought into the gross estate for IHT.

---

## 3. Architecture & Tech Stack

### 3.1 Technology Choices
* **Framework:** **Next.js 15+ (App Router)** with **TypeScript**.
  * Combines high-performance React UI with serverless Route Handlers in a single, maintainable repository.
* **Styling:** **Tailwind CSS** + **Lucide React Icons** + standard accessible UI patterns.
* **State & Forms:** Custom reactive state hooks + **Zod** for schema validation.
* **Calculations Engine:** Standalone, pure TypeScript calculation module with **100% Vitest unit test coverage** verifying calculations against statutory HMRC guidance.
* **Visualizations:** Visual breakdown meters, SVG charts, and interactive waterfall displays for estate composition, allowances, and gift timelines.

### 3.2 Cloudflare Infrastructure & Persistence Strategy
* **Hosting & Edge Delivery:**
  * Hosted on **Cloudflare Pages**, delivering static assets and UI from over 300 global edge locations.
* **Serverless API & Cloudflare KV Persistence:**
  * Endpoint `POST /api/calculations`: Takes validated calculation input, generates an 8-character unique alphanumeric slug (e.g. `k8m2p9w4`), stores the JSON record in **Cloudflare KV (`CALCULATIONS_KV`)**, and returns the ID.
  * Endpoint `GET /api/calculations/[id]`: Retrieves calculation data from Cloudflare KV for hydration.
  * **Built-in 90-Day Expiration (TTL):** Calculations stored in KV automatically expire after 90 days (`expirationTtl: 7,776,000`), ensuring zero database maintenance, cleanup crons, or bloat.
  * **Hybrid Storage Architecture (`lib/storage`):**
    * In production on Cloudflare Pages: Utilizes the `CALCULATIONS_KV` namespace binding directly with sub-millisecond edge latency.
    * Remote API support: Can connect via Cloudflare KV REST API if configured via environment variables.
    * Local dev & CI fallback: Automatically falls back to atomic local filesystem storage (`.data/calculations/`), enabling completely offline development with zero setup.
* **Client-Side Draft Saving:**
  * Uses `localStorage` to automatically preserve edits in real-time, preventing data loss on accidental tab close or page reload.
* **Shareable URLs & QR Codes:**
  * Clean short links: `https://<domain>/c/k8m2p9w4` with instant mobile QR code preview and JSON export.

---

## 4. User Experience & Application Structure

The interface adopts a **two-column layout on desktop** (collapsible on mobile):
- **Left Column (Inputs & Scenarios):** Multi-tab or accordion questionnaire categorized into logical sections.
- **Right Column (Live Results & Visualizer):** A sticky, real-time dashboard updating instantly as values change:
  - Total Net Estate
  - Total Allowances Applied (NRB + RNRB + Reliefs)
  - Net Taxable Estate
  - Inheritance Tax Liability (£)
  - Effective Tax Rate (%)
  - Actionable Optimization Cards (e.g., Charity 36% savings, unused spousal allowances, gifting opportunities).

### Input Sections:
1. **Marital & Family Context:**
   * Marital status (Single, Married/Civil Partner, Widowed, Divorced).
   * Spousal transfers and unused allowances (TNRB % and TRNRB %).
   * Direct descendants inheriting property (RNRB eligibility).
2. **Property & Real Estate:**
   * Primary residence value and outstanding mortgage.
   * Downsizing relief details (date sold/downsized, former property value).
   * Additional properties (buy-to-let, holiday homes, land) and liabilities.
3. **Savings, Investments & Personal Assets:**
   * Cash savings & bank accounts.
   * Listed investments, shares, and ISAs.
   * Personal possessions / chattels.
   * Life insurance (in trust vs. not in trust).
   * Pension pot (with toggle for pre-2027 vs. post-April 2027 rule).
4. **Business & Agricultural Reliefs (BPR & APR):**
   * Unquoted trading business assets / AIM shares (100% or 50% relief).
   * Agricultural land and property (100% or 50% relief).
5. **Debts & Liabilities:**
   * Mortgages, personal debts, credit cards, funeral costs.
6. **Lifetime Gifts (7-Year Rule):**
   * Dynamic gift log table: Date, recipient, gross amount, and gift category.
   * Automatic calculation of annual exemptions, marriage gifts, regular income gifts, and taper relief on remaining PETs.
7. **Charitable Legacies & Optimization:**
   * Percentage or fixed cash amount left to registered charities.
   * Live 10% test indicator showing whether the 36% reduced rate is unlocked, plus an exact "Charity Optimizer" suggestion.

---

## 5. Core Data Model (`types/iht.ts`)

```typescript
export type MaritalStatus = 'single' | 'married_or_civil_partnership' | 'widowed' | 'divorced';

export type GiftCategory = 
  | 'annual_exemption'
  | 'small_gift'
  | 'wedding_child'
  | 'wedding_grandchild'
  | 'wedding_other'
  | 'normal_expenditure_income'
  | 'potentially_exempt_transfer'
  | 'chargeable_lifetime_transfer';

export interface LifetimeGift {
  id: string;
  date: string; // YYYY-MM-DD
  recipient: string;
  amount: number;
  category: GiftCategory;
}

export interface EstateState {
  maritalStatus: MaritalStatus;
  passedToDirectDescendants: boolean;
  spouseUnusedNRBPercent: number; // 0 - 100
  spouseUnusedRNRBPercent: number; // 0 - 100

  // Primary Residence
  mainResidenceValue: number;
  mainResidenceMortgage: number;
  hasDownsized: boolean;
  downsizedDate?: string;
  downsizedValue?: number;

  // Additional Real Estate
  otherPropertiesValue: number;
  otherPropertiesMortgage: number;

  // Liquid & Investment Assets
  cashAndSavings: number;
  quotedInvestments: number;
  personalChattels: number;

  // Business & Agricultural Relief
  bpr100Assets: number; // Unquoted shares, qualifying trading business
  bpr50Assets: number;  // Controlling interest in listed, business premises
  apr100Assets: number; // Agricultural land/pasture
  apr50Assets: number;

  // Other Assets
  lifeInsuranceNotInTrust: number;
  lifeInsuranceInTrust: number;
  pensionValue: number;
  includePensionsInEstate: boolean; // April 2027 toggle

  // Debts & Funeral Costs
  otherDebts: number;
  funeralCosts: number;

  // Charitable Donations
  charityDonationType: 'fixed' | 'percentage';
  charityDonationValue: number;

  // Gifts
  gifts: LifetimeGift[];
  taxYearEnd?: string;
}

export interface CalculationBreakdown {
  grossEstate: number;
  debtsAndDeductions: number;
  netEstateBeforeReliefs: number;

  // Reliefs
  bprRelief: number;
  aprRelief: number;
  spouseExemption: number;
  charityExemption: number;
  netEstateAfterReliefs: number;

  // Allowances
  standardNRB: number;
  transferredNRB: number;
  totalNRB: number;
  nrbUsedByGifts: number;
  nrbRemainingForEstate: number;

  standardRNRB: number;
  transferredRNRB: number;
  downsizingAllowance: number;
  rawRNRB: number;
  rnrbTaperReduction: number;
  effectiveRNRB: number;

  totalAllowancesForEstate: number;

  // Taxable Estate & Rates
  taxableEstateOnDeath: number;
  isCharity10PercentMet: boolean;
  charityBaselineAmount: number;
  estateTaxRate: 0.40 | 0.36;
  estateTaxDue: number;

  // Gift Tax (PETs within 7 years)
  giftTaperResults: {
    giftId: string;
    amount: number;
    exemptAmount: number;
    chargeableAmount: number;
    usedNRB: number;
    excessOverNRB: number;
    yearsBeforeDeath: number;
    taperReliefPercent: number;
    taxRate: number;
    taxDue: number;
    paidByDonee: boolean;
  }[];
  totalLifetimeGiftTaxDue: number;

  // Grand Totals
  totalTaxPayable: number;
  effectiveTaxRate: number;

  // Planning Insights & Optimization
  charityOptimization: {
    additionalDonationNeededFor36Percent: number;
    netCostToEstateToUnlock36Percent: number;
    potentialTaxSavings: number;
  } | null;
}
```

---

## 6. Implementation Roadmap

### Phase 1: Core Calculation Engine & Tests
- [x] Draft `plan.md` architecture.
- [ ] Implement standalone math logic in `lib/calculator/`:
  - `allowances.ts`: NRB, TNRB, RNRB, TRNRB, £2m taper calculation, downsizing addition.
  - `gifts.ts`: Chronological gift sequencing, annual allowance carry-forward, statutory exemptions, and 7-year taper schedule.
  - `charity.ts`: Baseline net estate calculation and 10% test.
  - `ihtCalculator.ts`: Full estate orchestration.
- [ ] Create Vitest test suite with 100% coverage based on statutory HMRC examples.

### Phase 2: Project Setup & Minimal Serverless Store
- [ ] Initialize Next.js project with TypeScript and Tailwind CSS.
- [ ] Build serverless calculation store in `lib/storage/` and API endpoints:
  - `POST /api/calculations` (save/update, generates 8-char slug)
  - `GET /api/calculations/[id]` (fetch calculation by slug)
- [ ] Build `/c/[id]` dynamic page for restoring shared calculations.

### Phase 3: Application UI & Form Sections
- [ ] Responsive two-column desktop / stacked mobile layout.
- [ ] Section 1: Marital & Family Status.
- [ ] Section 2: Property & Downsizing.
- [ ] Section 3: Financial Assets, Pensions & Chattels.
- [ ] Section 4: Business & Agricultural Property (BPR/APR).
- [ ] Section 5: Debts & Liabilities.
- [ ] Section 6: Lifetime Gifts 7-Year Tracker (with dynamic add/edit/delete).
- [ ] Section 7: Charitable Giving.
- [ ] LocalStorage auto-save integration.

### Phase 4: Live Results Visualizer & Optimization Insights
- [ ] Sticky live summary card with Gross Estate, Allowances, Taxable Estate, Tax Due, and Effective Rate.
- [ ] Interactive breakdown charts (Estate composition, allowance waterfall, gift timeline).
- [ ] Charity 36% optimization calculator widget.
- [ ] Actionable estate planning tips banner.

### Phase 5: Persistence, Sharing & Export
- [ ] "Save & Share" modal with copyable link, QR code, and email link.
- [ ] Print / PDF stylesheet for clean summary reports.
- [ ] Verification, edge-case testing, and documentation.
