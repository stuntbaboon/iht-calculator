import {
  ANNUAL_GIFT_EXEMPTION,
  SMALL_GIFT_EXEMPTION,
  WEDDING_GIFT_CHILD,
  WEDDING_GIFT_GRANDCHILD,
  WEDDING_GIFT_OTHER,
  TAPER_RELIEF_SCHEDULE,
} from './constants';
import { LifetimeGift, GiftTaperResult } from '@/types/iht';

/**
 * Returns the UK tax year for a given date.
 * UK Tax Year runs from 6th April to 5th April of following calendar year.
 */
export function getUkTaxYear(dateInput: string | Date): { startYear: number; label: string } {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-indexed: 0 = Jan, 3 = April
  const day = d.getUTCDate();

  // If before 6th April, the tax year began in the prior year
  const isBeforeApril6 = month < 3 || (month === 3 && day < 6);
  const startYear = isBeforeApril6 ? year - 1 : year;

  return {
    startYear,
    label: `${startYear}/${(startYear + 1).toString().slice(-2)}`,
  };
}

/**
 * Calculates the number of full years elapsed between gift date and death date.
 */
export function getYearsBetween(giftDateStr: string, deathDateStr: string): number {
  const giftDate = new Date(giftDateStr);
  const deathDate = new Date(deathDateStr);
  const diffMs = deathDate.getTime() - giftDate.getTime();
  if (diffMs <= 0) return 0;
  // Use exact year calculation based on day differences
  const diffYears = diffMs / (365.25 * 24 * 60 * 60 * 1000);
  return diffYears;
}

/**
 * Evaluates taper relief rate based on years elapsed between gift and death.
 */
export function getTaperRelief(yearsElapsed: number): { taperPercent: number; effectiveRate: number } {
  if (yearsElapsed >= 7) {
    return { taperPercent: 100, effectiveRate: 0 };
  }
  for (const tier of TAPER_RELIEF_SCHEDULE) {
    if (yearsElapsed < tier.maxYears) {
      return { taperPercent: tier.taperPercent, effectiveRate: tier.taxRate };
    }
  }
  return { taperPercent: 80, effectiveRate: 0.08 };
}

export interface ProcessedGiftsResult {
  taperResults: GiftTaperResult[];
  totalLifetimeGiftTaxDue: number;
  totalNrbConsumedByGifts: number;
}

/**
 * Processes lifetime gifts chronologically:
 * 1. Filters gifts made within 7 years of death.
 * 2. Applies statutory exemptions (annual, marriage, normal expenditure, small gifts).
 * 3. Allocates available NRB chronologically.
 * 4. Applies taper relief to gifts exceeding available NRB.
 */
export function processLifetimeGifts(
  gifts: LifetimeGift[],
  availableNRB: number,
  assumedDeathDate: string = new Date().toISOString().slice(0, 10)
): ProcessedGiftsResult {
  // Sort gifts chronologically: oldest first
  const sortedGifts = [...gifts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Track annual exemptions per tax year: { [taxYearLabel]: usedAmount }
  const annualExemptionUsed: Record<string, number> = {};
  // Track small gifts per recipient per tax year: { [recipient_taxYear]: totalAmount }
  const smallGiftsPerRecipient: Record<string, number> = {};

  let remainingNRB = availableNRB;
  let totalLifetimeGiftTaxDue = 0;
  let totalNrbConsumedByGifts = 0;
  const taperResults: GiftTaperResult[] = [];

  for (const gift of sortedGifts) {
    const yearsElapsed = getYearsBetween(gift.date, assumedDeathDate);

    // If gift is older than 7 years, it is completely outside the estate
    if (yearsElapsed >= 7) {
      taperResults.push({
        giftId: gift.id,
        recipient: gift.recipient,
        relationship: gift.relationship,
        date: gift.date,
        amount: gift.amount,
        exemptAmount: gift.amount,
        chargeableAmount: 0,
        usedNRB: 0,
        excessOverNRB: 0,
        yearsBeforeDeath: yearsElapsed,
        taperReliefPercent: 100,
        effectiveTaxRate: 0,
        taxDue: 0,
        paidByDonee: false,
      });
      continue;
    }

    const { label: taxYearLabel, startYear } = getUkTaxYear(gift.date);
    const prevTaxYearLabel = `${startYear - 1}/${startYear.toString().slice(-2)}`;

    let exemptAmount = 0;

    switch (gift.category) {
      case 'normal_expenditure_income':
        // 100% exempt under Section 21 IHTA 1984
        exemptAmount = gift.amount;
        break;

      case 'wedding_child':
        // £5,000 exemption
        exemptAmount = Math.min(gift.amount, WEDDING_GIFT_CHILD);
        break;

      case 'wedding_grandchild':
        // £2,500 exemption
        exemptAmount = Math.min(gift.amount, WEDDING_GIFT_GRANDCHILD);
        break;

      case 'wedding_other':
        // £1,000 exemption
        exemptAmount = Math.min(gift.amount, WEDDING_GIFT_OTHER);
        break;

      case 'small_gift': {
        const recipientKey = `${gift.recipient.trim().toLowerCase()}_${taxYearLabel}`;
        const prevTotal = smallGiftsPerRecipient[recipientKey] || 0;
        const newTotal = prevTotal + gift.amount;
        if (newTotal <= SMALL_GIFT_EXEMPTION) {
          exemptAmount = gift.amount;
          smallGiftsPerRecipient[recipientKey] = newTotal;
        } else {
          // If total gifts to recipient exceed £250 in a year, small gift exemption is void
          exemptAmount = 0;
        }
        break;
      }

      case 'annual_exemption':
      case 'potentially_exempt_transfer':
      case 'chargeable_lifetime_transfer': {
        // Can utilize available annual exemption (£3k current year + unused £3k from previous year)
        const currentYearUsed = annualExemptionUsed[taxYearLabel] || 0;
        const currentYearAvailable = Math.max(0, ANNUAL_GIFT_EXEMPTION - currentYearUsed);

        let giftRemainingToExempt = gift.amount;
        let appliedExemption = 0;

        // 1. Use current year's allowance first
        if (currentYearAvailable > 0) {
          const fromCurrent = Math.min(giftRemainingToExempt, currentYearAvailable);
          appliedExemption += fromCurrent;
          giftRemainingToExempt -= fromCurrent;
          annualExemptionUsed[taxYearLabel] = currentYearUsed + fromCurrent;
        }

        // 2. Use previous year's carried forward allowance if current year allowance is exhausted
        if (giftRemainingToExempt > 0) {
          const prevYearUsed = annualExemptionUsed[prevTaxYearLabel] || 0;
          const prevYearAvailable = Math.max(0, ANNUAL_GIFT_EXEMPTION - prevYearUsed);
          if (prevYearAvailable > 0) {
            const fromPrev = Math.min(giftRemainingToExempt, prevYearAvailable);
            appliedExemption += fromPrev;
            giftRemainingToExempt -= fromPrev;
            annualExemptionUsed[prevTaxYearLabel] = prevYearUsed + fromPrev;
          }
        }

        exemptAmount = appliedExemption;
        break;
      }
    }

    const chargeableAmount = Math.max(0, gift.amount - exemptAmount);

    // Allocate available NRB chronologically
    let usedNRB = 0;
    let excessOverNRB = 0;

    if (chargeableAmount > 0) {
      if (remainingNRB >= chargeableAmount) {
        usedNRB = chargeableAmount;
        remainingNRB -= chargeableAmount;
        totalNrbConsumedByGifts += usedNRB;
      } else {
        usedNRB = remainingNRB;
        excessOverNRB = chargeableAmount - remainingNRB;
        totalNrbConsumedByGifts += usedNRB;
        remainingNRB = 0;
      }
    }

    // Calculate tax due on excess over NRB with taper relief
    const { taperPercent, effectiveRate } = getTaperRelief(yearsElapsed);
    const taxDue = excessOverNRB > 0 ? Math.round(excessOverNRB * effectiveRate) : 0;
    totalLifetimeGiftTaxDue += taxDue;

    taperResults.push({
      giftId: gift.id,
      recipient: gift.recipient,
      relationship: gift.relationship,
      date: gift.date,
      amount: gift.amount,
      exemptAmount,
      chargeableAmount,
      usedNRB,
      excessOverNRB,
      yearsBeforeDeath: Math.round(yearsElapsed * 10) / 10,
      taperReliefPercent: taperPercent,
      effectiveTaxRate: effectiveRate,
      taxDue,
      paidByDonee: taxDue > 0,
    });
  }

  return {
    taperResults,
    totalLifetimeGiftTaxDue,
    totalNrbConsumedByGifts,
  };
}
