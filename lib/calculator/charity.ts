import {
  STANDARD_IHT_RATE,
  REDUCED_CHARITY_IHT_RATE,
  CHARITY_THRESHOLD_PERCENT,
} from './constants';

export interface CharityTestResult {
  baselineAmount: number;
  currentCharityDonation: number;
  target10PercentDonation: number;
  is10PercentMet: boolean;
  applicableEstateTaxRate: 0.40 | 0.36;
  charityOptimization: {
    qualifiesFor36Percent: boolean;
    currentCharityDonation: number;
    baselineAmount: number;
    target10PercentDonation: number;
    additionalDonationNeeded: number;
    estateTaxAt40Percent: number;
    estateTaxAt36PercentWithTarget: number;
    taxSaved: number;
    netCostToHeirs: number;
  } | null;
}

/**
 * Calculates the Schedule 1A IHTA 1984 baseline amount and evaluates whether
 * the charitable donation meets the 10% threshold to unlock the 36% reduced tax rate.
 * Also generates the "Charity Optimizer" scenario.
 */
export function evaluateCharityRelief(
  netEstateBeforeCharity: number, // Net estate after debts and exemptions (spouse, BPR, APR)
  totalAllowancesForEstate: number, // NRB + RNRB
  charityDonation: number
): CharityTestResult {
  // Baseline amount under Schedule 1A: Net estate minus available allowances (before charity deduction)
  const baselineAmount = Math.max(0, netEstateBeforeCharity - totalAllowancesForEstate);

  if (baselineAmount <= 0) {
    // Estate is fully covered by allowances; no tax due anyway
    return {
      baselineAmount: 0,
      currentCharityDonation: charityDonation,
      target10PercentDonation: 0,
      is10PercentMet: false,
      applicableEstateTaxRate: STANDARD_IHT_RATE,
      charityOptimization: null,
    };
  }

  const target10PercentDonation = Math.ceil(baselineAmount * CHARITY_THRESHOLD_PERCENT);
  const is10PercentMet = charityDonation >= target10PercentDonation;
  const applicableEstateTaxRate = is10PercentMet ? REDUCED_CHARITY_IHT_RATE : STANDARD_IHT_RATE;

  // Calculate Charity Optimizer
  let charityOptimization = null;

  if (!is10PercentMet) {
    const additionalDonationNeeded = Math.max(0, target10PercentDonation - charityDonation);

    // Current tax at 40%
    const currentTaxable = Math.max(0, baselineAmount - charityDonation);
    const estateTaxAt40Percent = Math.round(currentTaxable * STANDARD_IHT_RATE);

    // Optimized tax at 36% if target reached
    const targetTaxable = Math.max(0, baselineAmount - target10PercentDonation);
    const estateTaxAt36PercentWithTarget = Math.round(targetTaxable * REDUCED_CHARITY_IHT_RATE);

    const taxSaved = Math.max(0, estateTaxAt40Percent - estateTaxAt36PercentWithTarget);
    const netCostToHeirs = additionalDonationNeeded - taxSaved;

    charityOptimization = {
      qualifiesFor36Percent: false,
      currentCharityDonation: charityDonation,
      baselineAmount,
      target10PercentDonation,
      additionalDonationNeeded,
      estateTaxAt40Percent,
      estateTaxAt36PercentWithTarget,
      taxSaved,
      netCostToHeirs,
    };
  } else {
    // Already qualifies for 36%
    const currentTaxable = Math.max(0, baselineAmount - charityDonation);
    const estateTaxAt36Percent = Math.round(currentTaxable * REDUCED_CHARITY_IHT_RATE);
    const hypotheticalTaxAt40 = Math.round(currentTaxable * STANDARD_IHT_RATE);

    charityOptimization = {
      qualifiesFor36Percent: true,
      currentCharityDonation: charityDonation,
      baselineAmount,
      target10PercentDonation,
      additionalDonationNeeded: 0,
      estateTaxAt40Percent: hypotheticalTaxAt40,
      estateTaxAt36PercentWithTarget: estateTaxAt36Percent,
      taxSaved: hypotheticalTaxAt40 - estateTaxAt36Percent,
      netCostToHeirs: 0,
    };
  }

  return {
    baselineAmount,
    currentCharityDonation: charityDonation,
    target10PercentDonation,
    is10PercentMet,
    applicableEstateTaxRate,
    charityOptimization,
  };
}
