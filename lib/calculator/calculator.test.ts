import { describe, it, expect } from 'vitest';
import { calculateInheritanceTax, defaultEstateState } from './index';
import { processLifetimeGifts, getUkTaxYear, getTaperRelief } from './gifts';
import { evaluateCharityRelief } from './charity';
import { calculateAllowances } from './allowances';
import { EstateState } from '@/types/iht';

describe('UK Tax Year and Date Calculations', () => {
  it('correctly calculates UK tax year for dates before and after April 6', () => {
    // 5 April 2024 is in tax year 2023/24
    expect(getUkTaxYear('2024-04-05').label).toBe('2023/24');
    // 6 April 2024 is in tax year 2024/25
    expect(getUkTaxYear('2024-04-06').label).toBe('2024/25');
    // 1 January 2024 is in tax year 2023/24
    expect(getUkTaxYear('2024-01-01').label).toBe('2023/24');
    // 15 October 2024 is in tax year 2024/25
    expect(getUkTaxYear('2024-10-15').label).toBe('2024/25');
  });

  it('correctly returns taper relief percent and effective tax rates', () => {
    expect(getTaperRelief(2.5)).toEqual({ taperPercent: 0, effectiveRate: 0.40 });
    expect(getTaperRelief(3.5)).toEqual({ taperPercent: 20, effectiveRate: 0.32 });
    expect(getTaperRelief(4.5)).toEqual({ taperPercent: 40, effectiveRate: 0.24 });
    expect(getTaperRelief(5.5)).toEqual({ taperPercent: 60, effectiveRate: 0.16 });
    expect(getTaperRelief(6.5)).toEqual({ taperPercent: 80, effectiveRate: 0.08 });
    expect(getTaperRelief(7.2)).toEqual({ taperPercent: 100, effectiveRate: 0 });
  });
});

describe('Statutory Allowances & £2M RNRB Tapering', () => {
  it('gives standard single person £325k NRB and £175k RNRB if home passes to children', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 300_000,
      passedToDirectDescendants: true,
      directDescendantSharePercent: 100,
    };
    const res = calculateAllowances(state, 0, 500_000);
    expect(res.standardNRB).toBe(325_000);
    expect(res.transferredNRB).toBe(0);
    expect(res.effectiveRNRBForEstate).toBe(175_000);
    expect(res.totalAllowancesAppliedToEstate).toBe(500_000);
  });

  it('does NOT award RNRB if home does not pass to direct descendants', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 300_000,
      passedToDirectDescendants: false,
    };
    const res = calculateAllowances(state, 0, 500_000);
    expect(res.effectiveRNRBForEstate).toBe(0);
    expect(res.totalAllowancesAppliedToEstate).toBe(325_000);
  });

  it('awards 100% transferred spousal allowances for widowed person', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'widowed',
      spouseUnusedNRBPercent: 100,
      spouseUnusedRNRBPercent: 100,
      mainResidenceValue: 400_000,
      passedToDirectDescendants: true,
    };
    const res = calculateAllowances(state, 0, 900_000);
    expect(res.standardNRB).toBe(325_000);
    expect(res.transferredNRB).toBe(325_000);
    expect(res.totalAvailableNRB).toBe(650_000);
    expect(res.effectiveRNRBForEstate).toBe(350_000); // 175k + 175k
    expect(res.totalAllowancesAppliedToEstate).toBe(1_000_000);
  });

  it('tapers RNRB by £1 for every £2 over £2,000,000', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 800_000,
      passedToDirectDescendants: true,
    };
    // Estate value = £2,100,000 (£100,000 over threshold -> £50,000 taper loss)
    const res = calculateAllowances(state, 0, 2_100_000);
    expect(res.rnrbTaperReduction).toBe(50_000);
    expect(res.effectiveRNRBForEstate).toBe(125_000); // 175k - 50k

    // Estate value = £2,350,000 (£350,000 over threshold -> £175,000 taper loss -> £0 RNRB)
    const resZero = calculateAllowances(state, 0, 2_350_000);
    expect(resZero.rnrbTaperReduction).toBe(175_000);
    expect(resZero.effectiveRNRBForEstate).toBe(0);
  });
});

describe('Lifetime Gifts & 7-Year Rule', () => {
  it('applies annual exemption of £3,000 and 1-year carry forward', () => {
    const assumedDeath = '2024-10-01';
    const gifts = [
      {
        id: '1',
        date: '2023-05-10', // 2023/24 tax year: £3,000 gift (uses full 23/24 allowance)
        recipient: 'Son',
        amount: 3000,
        category: 'annual_exemption' as const,
      },
      {
        id: '2',
        date: '2024-05-10', // 2024/25 tax year: £4,000 gift (uses £3,000 current allowance, £0 carried forward)
        recipient: 'Daughter',
        amount: 4000,
        category: 'potentially_exempt_transfer' as const,
      },
    ];

    const res = processLifetimeGifts(gifts, 325_000, assumedDeath);
    // Gift 1: fully exempt (£3k)
    expect(res.taperResults[0].exemptAmount).toBe(3000);
    expect(res.taperResults[0].chargeableAmount).toBe(0);

    // Gift 2: £3k exempt, £1k chargeable, uses £1k of NRB
    expect(res.taperResults[1].exemptAmount).toBe(3000);
    expect(res.taperResults[1].chargeableAmount).toBe(1000);
    expect(res.taperResults[1].usedNRB).toBe(1000);
    expect(res.totalNrbConsumedByGifts).toBe(1000);
    expect(res.totalLifetimeGiftTaxDue).toBe(0); // covered by NRB
  });

  it('exempts 100% of normal expenditure out of income and wedding gifts', () => {
    const gifts = [
      {
        id: '1',
        date: '2023-01-01',
        recipient: 'Grandchild',
        amount: 10000,
        category: 'normal_expenditure_income' as const,
      },
      {
        id: '2',
        date: '2023-06-01',
        recipient: 'Daughter',
        amount: 5000,
        category: 'wedding_child' as const,
      },
    ];
    const res = processLifetimeGifts(gifts, 325_000, '2024-01-01');
    expect(res.taperResults[0].exemptAmount).toBe(10000);
    expect(res.taperResults[0].chargeableAmount).toBe(0);
    expect(res.taperResults[1].exemptAmount).toBe(5000);
    expect(res.taperResults[1].chargeableAmount).toBe(0);
    expect(res.totalNrbConsumedByGifts).toBe(0);
  });

  it('calculates taper relief for gifts exceeding the NRB within 7 years', () => {
    // Gift of £400,000 made 4.5 years before death (40% taper -> 24% effective tax rate)
    const gifts = [
      {
        id: 'large-gift',
        date: '2020-01-01',
        recipient: 'Friend',
        amount: 400_000,
        category: 'potentially_exempt_transfer' as const,
      },
    ];
    // Assumed death is 4.5 years later: 2024-07-01
    const res = processLifetimeGifts(gifts, 325_000, '2024-07-01');
    const giftResult = res.taperResults[0];

    // £3k current year + £3k carried forward previous year = £6k annual exemption used
    // £400,000 - £6,000 = £394,000 chargeable
    // £325,000 absorbed by NRB
    // £69,000 excess over NRB
    expect(giftResult.exemptAmount).toBe(6000);
    expect(giftResult.usedNRB).toBe(325_000);
    expect(giftResult.excessOverNRB).toBe(69_000);
    expect(giftResult.taperReliefPercent).toBe(40);
    expect(giftResult.effectiveTaxRate).toBe(0.24); // 40% - 40% relief = 24%
    expect(giftResult.taxDue).toBe(Math.round(69_000 * 0.24)); // £16,560
  });
});

describe('Charitable Giving & 36% Reduced Rate', () => {
  it('applies 40% if donation is under 10% of baseline, and provides optimizer', () => {
    // Net estate before charity = £600,000. Allowances = £500,000.
    // Baseline = £600k - £500k = £100,000.
    // 10% target = £10,000.
    // Current donation = £5,000.
    const res = evaluateCharityRelief(600_000, 500_000, 5_000);
    expect(res.baselineAmount).toBe(100_000);
    expect(res.target10PercentDonation).toBe(10_000);
    expect(res.is10PercentMet).toBe(false);
    expect(res.applicableEstateTaxRate).toBe(0.40);
    expect(res.charityOptimization?.additionalDonationNeeded).toBe(5_000);
  });

  it('applies 36% rate when donation is >= 10% of baseline', () => {
    const res = evaluateCharityRelief(600_000, 500_000, 10_000);
    expect(res.is10PercentMet).toBe(true);
    expect(res.applicableEstateTaxRate).toBe(0.36);
  });
});

describe('Master IHT Calculation Engine', () => {
  it('calculates nil tax for estate within allowances', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 250_000,
      cashAndSavings: 50_000,
      passedToDirectDescendants: true,
      funeralCosts: 4000,
    };
    const res = calculateInheritanceTax(state);
    expect(res.grossEstate).toBe(300_000);
    expect(res.netEstateBeforeReliefs).toBe(296_000);
    expect(res.taxableEstateOnDeath).toBe(0);
    expect(res.totalTaxLiability).toBe(0);
  });

  it('calculates standard 40% on single person £800k estate', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 400_000,
      quotedInvestments: 400_000,
      passedToDirectDescendants: true,
      funeralCosts: 0,
    };
    const res = calculateInheritanceTax(state);
    // Gross = £800k
    // Allowances = £325k NRB + £175k RNRB = £500k
    // Taxable = £300k
    // Tax = 40% of £300k = £120,000
    expect(res.grossEstate).toBe(800_000);
    expect(res.totalAllowancesAppliedToEstate).toBe(500_000);
    expect(res.taxableEstateOnDeath).toBe(300_000);
    expect(res.estateTaxDue).toBe(120_000);
    expect(res.totalTaxLiability).toBe(120_000);
    expect(res.effectiveTaxRate).toBe(0.15); // £120k / £800k = 15%
  });

  it('correctly applies Business Property Relief (BPR) at 100% and 50%', () => {
    const state: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 0,
      cashAndSavings: 500_000,
      bpr100Assets: 200_000, // 100% exempt
      bpr50Assets: 100_000,  // 50% exempt (£50k taxable)
      funeralCosts: 0,
    };
    const res = calculateInheritanceTax(state);
    expect(res.bprReliefAmount).toBe(250_000); // 200k + 50k
    // Gross = 500k + 200k + 100k = 800k
    // After BPR: 800k - 250k = 550k
    // Allowances: £325k NRB (no home for RNRB)
    // Taxable: 550k - 325k = 225k
    // Tax at 40%: £90,000
    expect(res.taxableEstateOnDeath).toBe(225_000);
    expect(res.estateTaxDue).toBe(90_000);
  });

  it('correctly incorporates pensions when post-April 2027 toggle is enabled', () => {
    const stateOff: EstateState = {
      ...defaultEstateState,
      maritalStatus: 'single',
      cashAndSavings: 400_000,
      pensionValue: 300_000,
      includePensionsInEstate: false,
      funeralCosts: 0,
    };
    const resOff = calculateInheritanceTax(stateOff);
    expect(resOff.grossEstate).toBe(400_000);

    const stateOn: EstateState = {
      ...stateOff,
      includePensionsInEstate: true,
    };
    const resOn = calculateInheritanceTax(stateOn);
    expect(resOn.grossEstate).toBe(700_000); // 400k + 300k
  });
});
