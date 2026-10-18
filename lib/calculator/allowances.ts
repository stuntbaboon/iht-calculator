import {
  STANDARD_NRB,
  MAX_TRANSFERRED_NRB,
  STANDARD_RNRB,
  MAX_TRANSFERRED_RNRB,
  RNRB_TAPER_THRESHOLD,
  RNRB_TAPER_RATE,
} from './constants';
import { EstateState } from '@/types/iht';

export interface AllowancesCalculationResult {
  // Nil-Rate Band
  standardNRB: number;
  transferredNRB: number;
  totalAvailableNRB: number;
  nrbRemainingForEstate: number;

  // Residence Nil-Rate Band
  standardRNRB: number;
  transferredRNRB: number;
  totalPotentialRNRB: number;
  qualifyingResidentialInterest: number;
  downsizingAddition: number;
  taperTestingEstateValue: number;
  rnrbTaperReduction: number;
  effectiveRNRBForEstate: number;

  // Total Allowances
  totalAllowancesAppliedToEstate: number;
}

/**
 * Calculates available Nil-Rate Band and Residence Nil-Rate Band for the estate,
 * taking into account spousal transfers, £2m taper threshold, and direct descendant qualification.
 */
export function calculateAllowances(
  state: EstateState,
  nrbConsumedByGifts: number,
  taperTestingEstateValue: number
): AllowancesCalculationResult {
  // 1. Calculate NRB
  const standardNRB = STANDARD_NRB;
  let transferredNRB = 0;

  if (state.maritalStatus === 'widowed') {
    const percent = Math.min(100, Math.max(0, state.spouseUnusedNRBPercent || 0));
    transferredNRB = Math.round((percent / 100) * MAX_TRANSFERRED_NRB);
  }

  const totalAvailableNRB = standardNRB + transferredNRB;
  const nrbRemainingForEstate = Math.max(0, totalAvailableNRB - nrbConsumedByGifts);

  // 2. Calculate Potential RNRB
  const standardRNRB = STANDARD_RNRB;
  let transferredRNRB = 0;

  if (state.maritalStatus === 'widowed') {
    const rPercent = Math.min(100, Math.max(0, state.spouseUnusedRNRBPercent || 0));
    transferredRNRB = Math.round((rPercent / 100) * MAX_TRANSFERRED_RNRB);
  }

  const totalPotentialRNRB = standardRNRB + transferredRNRB;

  // 3. High-Value Estate Taper Testing (Section 8D IHTA 1984)
  // Estate is reduced by £1 for every £2 of estate value over £2,000,000
  let rnrbTaperReduction = 0;
  if (taperTestingEstateValue > RNRB_TAPER_THRESHOLD) {
    const excess = taperTestingEstateValue - RNRB_TAPER_THRESHOLD;
    rnrbTaperReduction = Math.round(excess * RNRB_TAPER_RATE);
  }

  const taperedPotentialRNRB = Math.max(0, totalPotentialRNRB - rnrbTaperReduction);

  // 4. Qualifying Residential Interest passed to direct descendants
  let qualifyingResidentialInterest = 0;
  let downsizingAddition = 0;

  if (state.passedToDirectDescendants) {
    const netHomeEquity = Math.max(0, (state.mainResidenceValue || 0) - (state.mainResidenceMortgage || 0));
    const descendantFraction = Math.min(100, Math.max(0, state.directDescendantSharePercent ?? 100)) / 100;
    qualifyingResidentialInterest = Math.round(netHomeEquity * descendantFraction);

    // Downsizing Relief / Downsizing Addition (Section 8H-8M IHTA 1984)
    if (state.hasDownsized && (state.formerPropertySaleValue || 0) > 0) {
      const formerNetEquity = Math.max(
        0,
        (state.formerPropertySaleValue || 0) - (state.formerPropertyMortgage || 0)
      );
      const lostRNRBEquity = Math.max(0, formerNetEquity - netHomeEquity);
      // Downsizing addition is capped at available other assets left to descendants
      const otherAssetsPassing = state.otherAssetsToDescendants ?? lostRNRBEquity;
      downsizingAddition = Math.min(lostRNRBEquity, otherAssetsPassing, totalPotentialRNRB);
    }
  }

  // Effective RNRB is capped by:
  // - What is actually left to descendants (qualifying home equity + downsizing addition)
  // - The tapered maximum statutory allowance
  const availableRNRB = Math.min(
    qualifyingResidentialInterest + downsizingAddition,
    taperedPotentialRNRB
  );

  const effectiveRNRBForEstate = Math.max(0, availableRNRB);

  return {
    standardNRB,
    transferredNRB,
    totalAvailableNRB,
    nrbRemainingForEstate,
    standardRNRB,
    transferredRNRB,
    totalPotentialRNRB,
    qualifyingResidentialInterest,
    downsizingAddition,
    taperTestingEstateValue,
    rnrbTaperReduction,
    effectiveRNRBForEstate,
    totalAllowancesAppliedToEstate: nrbRemainingForEstate + effectiveRNRBForEstate,
  };
}
