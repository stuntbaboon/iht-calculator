import { EstateState, CalculationBreakdown } from '@/types/iht';
import { STANDARD_NRB, MAX_TRANSFERRED_NRB, RNRB_TAPER_THRESHOLD } from './constants';
import { processLifetimeGifts } from './gifts';
import { calculateAllowances } from './allowances';
import { evaluateCharityRelief } from './charity';

/**
 * Default initial estate state for empty / new calculation
 */
export const defaultEstateState: EstateState = {
  maritalStatus: 'single',
  passedToDirectDescendants: true,
  directDescendantSharePercent: 100,
  spouseUnusedNRBPercent: 0,
  spouseUnusedRNRBPercent: 0,
  spouseInheritancePercent: 0,

  mainResidenceValue: 0,
  mainResidenceMortgage: 0,
  hasDownsized: false,
  downsizedDate: '',
  formerPropertySaleValue: 0,
  formerPropertyMortgage: 0,
  otherAssetsToDescendants: 0,

  otherPropertiesValue: 0,
  otherPropertiesMortgage: 0,

  cashAndSavings: 0,
  quotedInvestments: 0,
  personalChattels: 0,

  bpr100Assets: 0,
  bpr50Assets: 0,
  apr100Assets: 0,
  apr50Assets: 0,

  lifeInsuranceNotInTrust: 0,
  lifeInsuranceInTrust: 0,
  pensionValue: 0,
  includePensionsInEstate: false,

  otherDebts: 0,
  funeralCosts: 4000,

  charityDonationType: 'percentage',
  charityDonationValue: 0,

  gifts: [],
};

/**
 * Master UK Inheritance Tax calculation engine.
 * Computes all statutory allowances, reliefs, taper schedules, and rates deterministically.
 */
export function calculateInheritanceTax(inputState: Partial<EstateState>): CalculationBreakdown {
  const state: EstateState = {
    ...defaultEstateState,
    ...inputState,
  };

  // 1. Gross Estate Calculation
  const pensionInEstate = state.includePensionsInEstate ? (state.pensionValue || 0) : 0;

  const grossEstate =
    (state.mainResidenceValue || 0) +
    (state.otherPropertiesValue || 0) +
    (state.cashAndSavings || 0) +
    (state.quotedInvestments || 0) +
    (state.personalChattels || 0) +
    (state.bpr100Assets || 0) +
    (state.bpr50Assets || 0) +
    (state.apr100Assets || 0) +
    (state.apr50Assets || 0) +
    (state.lifeInsuranceNotInTrust || 0) +
    pensionInEstate;

  // 2. Debts and Deductions
  const mortgagesAndDebts =
    (state.mainResidenceMortgage || 0) +
    (state.otherPropertiesMortgage || 0) +
    (state.otherDebts || 0);
  const funeralCosts = state.funeralCosts || 0;
  const totalLiabilities = mortgagesAndDebts + funeralCosts;

  const netEstateBeforeReliefs = Math.max(0, grossEstate - totalLiabilities);

  // 3. Taper Testing Value (Section 8D IHTA 1984)
  // For the £2,000,000 taper threshold test, HMRC tests the net estate BEFORE BPR, APR,
  // spouse exemption, or charity exemptions.
  const taperTestingEstateValue = netEstateBeforeReliefs;

  // 4. Reliefs: Business Property Relief (BPR) & Agricultural Property Relief (APR)
  const bprReliefAmount =
    (state.bpr100Assets || 0) * 1.0 +
    (state.bpr50Assets || 0) * 0.5;

  const aprReliefAmount =
    (state.apr100Assets || 0) * 1.0 +
    (state.apr50Assets || 0) * 0.5;

  let netAfterBusinessReliefs = Math.max(
    0,
    netEstateBeforeReliefs - (bprReliefAmount + aprReliefAmount)
  );

  // 5. Spousal Exemption (Section 18 IHTA 1984)
  let spouseExemptionAmount = 0;
  if (state.maritalStatus === 'married_or_civil_partnership') {
    const spousePercent = Math.min(100, Math.max(0, state.spouseInheritancePercent || 0)) / 100;
    spouseExemptionAmount = Math.round(netAfterBusinessReliefs * spousePercent);
    netAfterBusinessReliefs = Math.max(0, netAfterBusinessReliefs - spouseExemptionAmount);
  }

  // 6. Calculate available NRB before gifts
  let maxPotentialNRB = STANDARD_NRB;
  if (state.maritalStatus === 'widowed') {
    const transferredPercent = Math.min(100, Math.max(0, state.spouseUnusedNRBPercent || 0)) / 100;
    maxPotentialNRB += Math.round(transferredPercent * MAX_TRANSFERRED_NRB);
  }

  // 7. Process Lifetime Gifts (PETs and 7-year taper relief)
  const deathDate = state.assumedDeathDate || '2025-04-06';
  const { taperResults, totalLifetimeGiftTaxDue, totalNrbConsumedByGifts } = processLifetimeGifts(
    state.gifts || [],
    maxPotentialNRB,
    deathDate
  );

  // 8. Calculate Allowances for Death Estate (NRB, RNRB with £2m taper)
  const allowances = calculateAllowances(state, totalNrbConsumedByGifts, taperTestingEstateValue);

  // 9. Charitable Legacy Calculation & Baseline Test (Schedule 1A IHTA 1984)
  let charityDonationAmount = 0;
  if (state.charityDonationType === 'fixed') {
    charityDonationAmount = Math.min(netAfterBusinessReliefs, state.charityDonationValue || 0);
  } else {
    const charityPercent = Math.min(100, Math.max(0, state.charityDonationValue || 0)) / 100;
    charityDonationAmount = Math.round(netAfterBusinessReliefs * charityPercent);
  }

  const charityEvaluation = evaluateCharityRelief(
    netAfterBusinessReliefs,
    allowances.totalAllowancesAppliedToEstate,
    charityDonationAmount
  );

  const charityExemptionAmount = charityDonationAmount;
  const totalReliefsAndExemptions =
    bprReliefAmount + aprReliefAmount + spouseExemptionAmount + charityExemptionAmount;

  const netEstateAfterReliefs = Math.max(0, netAfterBusinessReliefs - charityExemptionAmount);

  // 10. Taxable Estate and Estate Tax Due
  const taxableEstateOnDeath = Math.max(
    0,
    netEstateAfterReliefs - allowances.totalAllowancesAppliedToEstate
  );

  const estateTaxDue = Math.round(
    taxableEstateOnDeath * charityEvaluation.applicableEstateTaxRate
  );

  // 11. Grand Totals
  const totalTaxLiability = estateTaxDue + totalLifetimeGiftTaxDue;
  const effectiveTaxRate =
    netEstateBeforeReliefs > 0 ? totalTaxLiability / netEstateBeforeReliefs : 0;

  // 12. Intelligent Planning Recommendations
  const planningTips: CalculationBreakdown['planningTips'] = [];

  // Tip: Life insurance not written in trust
  if (state.lifeInsuranceNotInTrust > 0) {
    const potentialSaving = Math.round(
      state.lifeInsuranceNotInTrust * charityEvaluation.applicableEstateTaxRate
    );
    planningTips.push({
      id: 'life-insurance-trust',
      type: 'tip',
      title: 'Write Life Insurance into Trust',
      description: `You have £${state.lifeInsuranceNotInTrust.toLocaleString()} in life insurance paid directly to your estate. Writing this policy into a simple trust takes it outside your estate, potentially saving up to £${potentialSaving.toLocaleString()} in Inheritance Tax.`,
    });
  }

  // Tip: High-value estate £2m taper
  if (allowances.rnrbTaperReduction > 0) {
    planningTips.push({
      id: 'rnrb-taper',
      type: 'warning',
      title: 'High-Value Estate Taper Active',
      description: `Your estate value for taper testing is £${taperTestingEstateValue.toLocaleString()} (exceeding the £2,000,000 threshold). You have lost £${allowances.rnrbTaperReduction.toLocaleString()} of your Residence Nil-Rate Band. Lifetime gifting or qualifying trust structures may help restore this allowance.`,
    });
  }

  // Tip: Charity 36% optimization
  if (
    charityEvaluation.charityOptimization &&
    !charityEvaluation.charityOptimization.qualifiesFor36Percent &&
    charityEvaluation.charityOptimization.baselineAmount > 0
  ) {
    const opt = charityEvaluation.charityOptimization;
    if (opt.additionalDonationNeeded > 0) {
      planningTips.push({
        id: 'charity-optimization',
        type: 'info',
        title: 'Unlock 36% Charity Tax Rate',
        description: `Leaving an additional £${opt.additionalDonationNeeded.toLocaleString()} to charity would reduce your entire estate tax rate from 40% to 36%, saving £${opt.taxSaved.toLocaleString()} in tax. The net cost to your other heirs would be only £${opt.netCostToHeirs.toLocaleString()}.`,
      });
    }
  }

  // Tip: Unused spousal allowances for widows
  if (state.maritalStatus === 'widowed' && (state.spouseUnusedNRBPercent || 0) < 100) {
    planningTips.push({
      id: 'spousal-allowances',
      type: 'info',
      title: 'Transferable Spousal Nil-Rate Bands',
      description: `If your deceased spouse did not use 100% of their allowances, their unused Nil-Rate Band (£325k) and Residence Nil-Rate Band (£175k) can be transferred to double your total tax-free threshold to up to £1,000,000.`,
    });
  }

  // Tip: Pension inclusion toggle
  if (!state.includePensionsInEstate && (state.pensionValue || 0) > 0) {
    planningTips.push({
      id: 'pension-autumn-budget',
      type: 'info',
      title: 'April 2027 Pension Rule Change',
      description: `Under current rules, your pension pot (£${state.pensionValue.toLocaleString()}) is held in discretionary trust and excluded from IHT. Note that from April 2027, unused pension pots will be brought into the scope of Inheritance Tax. Toggle the 2027 rule switch to preview its impact.`,
    });
  }

  return {
    grossEstate,
    mortgagesAndDebts,
    funeralCosts,
    totalLiabilities,
    netEstateBeforeReliefs,

    bprReliefAmount,
    aprReliefAmount,
    spouseExemptionAmount,
    charityExemptionAmount,
    totalReliefsAndExemptions,
    netEstateAfterReliefs,

    taperTestingEstateValue,
    rnrbTaperThreshold: RNRB_TAPER_THRESHOLD,
    rnrbTaperReduction: allowances.rnrbTaperReduction,

    standardNRB: allowances.standardNRB,
    transferredNRB: allowances.transferredNRB,
    totalAvailableNRB: allowances.totalAvailableNRB,
    nrbConsumedByGifts: totalNrbConsumedByGifts,
    nrbRemainingForEstate: allowances.nrbRemainingForEstate,

    standardRNRB: allowances.standardRNRB,
    transferredRNRB: allowances.transferredRNRB,
    totalRNRBAllowance: allowances.totalPotentialRNRB,
    qualifyingResidentialInterest: allowances.qualifyingResidentialInterest,
    downsizingAddition: allowances.downsizingAddition,
    maximumAllowableRNRB: allowances.totalPotentialRNRB,
    effectiveRNRBForEstate: allowances.effectiveRNRBForEstate,

    totalAllowancesAppliedToEstate: allowances.totalAllowancesAppliedToEstate,

    taxableEstateOnDeath,
    charityBaselineAmount: charityEvaluation.baselineAmount,
    isCharity10PercentMet: charityEvaluation.is10PercentMet,
    applicableEstateTaxRate: charityEvaluation.applicableEstateTaxRate,
    estateTaxDue,

    giftTaperResults: taperResults,
    totalLifetimeGiftTaxDue,

    totalTaxLiability,
    effectiveTaxRate,

    charityOptimization: charityEvaluation.charityOptimization,
    planningTips,
  };
}
