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

export type GiftRelationship =
  | 'child'
  | 'grandchild'
  | 'spouse'
  | 'sibling'
  | 'niece_nephew'
  | 'parent'
  | 'friend'
  | 'charity'
  | 'other';

export interface LifetimeGift {
  id: string;
  date: string; // ISO date string: YYYY-MM-DD
  recipient: string; // Recipient Name
  relationship?: GiftRelationship | string;
  amount: number;
  category: GiftCategory;
  taxYear?: string; // e.g. "2023/24"
}

export interface EstateState {
  // Family & Marital Status
  maritalStatus: MaritalStatus;
  passedToDirectDescendants: boolean;
  directDescendantSharePercent: number; // 0 - 100% (defaults to 100)
  spouseUnusedNRBPercent: number; // 0 - 100% (from deceased spouse if widowed)
  spouseUnusedRNRBPercent: number; // 0 - 100% (from deceased spouse if widowed)
  spouseInheritancePercent: number; // 0 - 100% of estate passing to surviving spouse (100% exempt if married)

  // Primary Residence
  mainResidenceValue: number;
  mainResidenceMortgage: number;
  hasDownsized: boolean;
  downsizedDate?: string;
  formerPropertySaleValue?: number;
  formerPropertyMortgage?: number;
  otherAssetsToDescendants?: number; // to absorb downsizing addition

  // Additional Real Estate
  otherPropertiesValue: number;
  otherPropertiesMortgage: number;

  // Liquid & Investment Assets
  cashAndSavings: number;
  quotedInvestments: number;
  personalChattels: number;

  // Business & Agricultural Property Relief
  bpr100Assets: number; // 100% relief: unquoted trading company shares (AIM), sole trader/partnerships
  bpr50Assets: number;  // 50% relief: quoted controlling interest, land/buildings/plant used by business
  apr100Assets: number; // 100% relief: qualifying agricultural land/pasture/buildings
  apr50Assets: number;  // 50% relief: tenanted farmland under pre-1995 leases

  // Life Insurance & Pensions
  lifeInsuranceNotInTrust: number; // Subject to IHT
  lifeInsuranceInTrust: number;    // Exempt
  pensionValue: number;            // Unused defined contribution pension
  includePensionsInEstate: boolean;// Toggle for post-April 2027 Autumn Budget rules

  // Debts & Funeral Costs
  otherDebts: number;
  funeralCosts: number;

  // Charitable Legacies
  charityDonationType: 'percentage' | 'fixed';
  charityDonationValue: number;

  // Lifetime Gifts (last 7 years)
  gifts: LifetimeGift[];
  assumedDeathDate?: string; // Defaults to current date
}

export interface GiftTaperResult {
  giftId: string;
  recipient: string;
  relationship?: string;
  date: string;
  amount: number;
  exemptAmount: number;
  chargeableAmount: number;
  usedNRB: number;
  excessOverNRB: number;
  yearsBeforeDeath: number;
  taperReliefPercent: number; // 0, 20, 40, 60, 80, 100
  effectiveTaxRate: number; // 40%, 32%, 24%, 16%, 8%, 0%
  taxDue: number;
  paidByDonee: boolean; // under statutory rules, recipient pays if gift tax arises
}

export interface CalculationBreakdown {
  // Gross & Net Estate
  grossEstate: number;
  mortgagesAndDebts: number;
  funeralCosts: number;
  totalLiabilities: number;
  netEstateBeforeReliefs: number;

  // Reliefs & Exemptions
  bprReliefAmount: number;
  aprReliefAmount: number;
  spouseExemptionAmount: number;
  charityExemptionAmount: number;
  totalReliefsAndExemptions: number;
  netEstateAfterReliefs: number;

  // High-Value Estate Taper Testing
  taperTestingEstateValue: number; // Net estate before BPR/APR & spousal exemptions per s.8D IHTA 1984
  rnrbTaperThreshold: number; // £2,000,000
  rnrbTaperReduction: number; // £1 for every £2 over £2m

  // Nil-Rate Band (NRB)
  standardNRB: number; // £325,000
  transferredNRB: number; // up to £325,000
  totalAvailableNRB: number; // £325k - £650k
  nrbConsumedByGifts: number;
  nrbRemainingForEstate: number;

  // Residence Nil-Rate Band (RNRB)
  standardRNRB: number; // £175,000
  transferredRNRB: number; // up to £175,000
  totalRNRBAllowance: number; // up to £350,000
  qualifyingResidentialInterest: number; // Net equity in residence passed to descendants
  downsizingAddition: number;
  maximumAllowableRNRB: number;
  effectiveRNRBForEstate: number;

  // Total Allowances
  totalAllowancesAppliedToEstate: number;

  // Taxable Estate on Death
  taxableEstateOnDeath: number;

  // Charity 10% Test & Rate
  charityBaselineAmount: number;
  isCharity10PercentMet: boolean;
  applicableEstateTaxRate: 0.40 | 0.36;
  estateTaxDue: number;

  // Lifetime Gift Tax (PETs within 7 years)
  giftTaperResults: GiftTaperResult[];
  totalLifetimeGiftTaxDue: number;

  // Combined Totals
  totalTaxLiability: number; // estateTaxDue + totalLifetimeGiftTaxDue
  effectiveTaxRate: number; // totalTaxLiability / netEstateBeforeReliefs

  // Charity Optimizer
  charityOptimization: {
    qualifiesFor36Percent: boolean;
    currentCharityDonation: number;
    baselineAmount: number;
    target10PercentDonation: number;
    additionalDonationNeeded: number;
    estateTaxAt40Percent: number;
    estateTaxAt36PercentWithTarget: number;
    taxSaved: number;
    netCostToHeirs: number; // additionalDonation - taxSaved (can be negative = profit for heirs!)
  } | null;

  // Planning Recommendations
  planningTips: {
    id: string;
    type: 'warning' | 'tip' | 'info';
    title: string;
    description: string;
  }[];
}

export interface SavedCalculationRecord {
  id: string; // 8-char slug
  createdAt: string; // ISO
  updatedAt: string; // ISO
  title?: string;
  state: EstateState;
  breakdown: CalculationBreakdown;
}
