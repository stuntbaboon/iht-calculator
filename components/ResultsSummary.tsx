'use client';

import React from 'react';
import { CalculationBreakdown } from '@/types/iht';
import {
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface ResultsSummaryProps {
  breakdown: CalculationBreakdown;
  onOpenShareModal: () => void;
}

export function ResultsSummary({
  breakdown,
  onOpenShareModal,
}: ResultsSummaryProps) {
  const netToBeneficiaries = Math.max(
    0,
    breakdown.netEstateBeforeReliefs - breakdown.totalTaxLiability - breakdown.charityExemptionAmount
  );

  const grossVal = Math.max(1, breakdown.grossEstate);
  const allowancesPercent = Math.min(
    100,
    Math.round(((breakdown.totalAllowancesAppliedToEstate + breakdown.totalReliefsAndExemptions) / grossVal) * 100)
  );
  const taxPercent = Math.min(100, Math.round((breakdown.totalTaxLiability / grossVal) * 100));
  const heirsPercent = Math.max(0, 100 - allowancesPercent - taxPercent);

  return (
    <div className="space-y-4">
      {/* Primary KPI Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total IHT Liability
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              breakdown.totalTaxLiability === 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {breakdown.totalTaxLiability === 0 ? 'Zero Tax Due' : 'Tax Payable'}
          </span>
        </div>

        <div className="pt-4 flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              £{breakdown.totalTaxLiability.toLocaleString('en-GB')}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Effective Tax Rate:{' '}
              <span className="font-semibold text-slate-200">
                {(breakdown.effectiveTaxRate * 100).toFixed(1)}%
              </span>{' '}
              on net estate of £{breakdown.netEstateBeforeReliefs.toLocaleString('en-GB')}
            </p>
          </div>
        </div>

        {/* Proportional Meter Bar */}
        <div className="mt-5 space-y-2">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${allowancesPercent}%` }}
              title={`Allowances & Reliefs: ${allowancesPercent}%`}
              className="bg-emerald-500 transition-all duration-500"
            />
            <div
              style={{ width: `${taxPercent}%` }}
              title={`Tax: ${taxPercent}%`}
              className="bg-rose-500 transition-all duration-500"
            />
            <div
              style={{ width: `${heirsPercent}%` }}
              title={`Remaining: ${heirsPercent}%`}
              className="bg-blue-500 transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Tax-Free (£{breakdown.totalAllowancesAppliedToEstate.toLocaleString('en-GB')})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Tax Due (£{breakdown.totalTaxLiability.toLocaleString('en-GB')})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Net to Heirs (£{netToBeneficiaries.toLocaleString('en-GB')})
            </span>
          </div>
        </div>

        {/* Quick CTA */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl text-center transition-colors shadow-xs"
          >
            Save & Share Calculation Link
          </button>
        </div>
      </div>

      {/* Itemised Breakdown Card */}
      {/* Itemised Breakdown Card (Dark Theme Console) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Statutory Calculation Breakdown
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            HMRC Formula
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* Gross Estate */}
          <div className="flex items-center justify-between px-2.5 py-1 text-slate-300 font-medium">
            <span>Gross Estate Value:</span>
            <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-white">
              £{breakdown.grossEstate.toLocaleString('en-GB')}
            </span>
          </div>

          {/* Debts & Liabilities */}
          <div className="flex items-center justify-between px-2.5 py-1 text-slate-400">
            <span>Less: Debts, Mortgages & Funeral:</span>
            <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-slate-300">
              -£{breakdown.totalLiabilities.toLocaleString('en-GB')}
            </span>
          </div>

          {/* Net Estate before Reliefs */}
          <div className="flex items-center justify-between px-2.5 py-1.5 font-semibold text-slate-200 bg-slate-800/80 border border-slate-700/60 rounded-lg">
            <span>Net Estate before Reliefs:</span>
            <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-white">
              £{breakdown.netEstateBeforeReliefs.toLocaleString('en-GB')}
            </span>
          </div>

          {/* Reliefs & Exemptions Applied */}
          {breakdown.totalReliefsAndExemptions > 0 && (
            <div className="pt-0.5 space-y-1">
              <div className="flex items-center justify-between px-2.5 py-1 text-emerald-400 font-medium">
                <span>Reliefs & Exemptions Applied:</span>
                <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-emerald-400">
                  -£{breakdown.totalReliefsAndExemptions.toLocaleString('en-GB')}
                </span>
              </div>
              {breakdown.bprReliefAmount > 0 && (
                <div className="flex items-center justify-between pl-6 pr-2.5 py-0.5 text-[11px] text-slate-400">
                  <span>• Business Property Relief (BPR):</span>
                  <span className="text-right shrink-0 tabular-nums font-mono text-slate-300">
                    -£{breakdown.bprReliefAmount.toLocaleString('en-GB')}
                  </span>
                </div>
              )}
              {breakdown.aprReliefAmount > 0 && (
                <div className="flex items-center justify-between pl-6 pr-2.5 py-0.5 text-[11px] text-slate-400">
                  <span>• Agricultural Property Relief (APR):</span>
                  <span className="text-right shrink-0 tabular-nums font-mono text-slate-300">
                    -£{breakdown.aprReliefAmount.toLocaleString('en-GB')}
                  </span>
                </div>
              )}
              {breakdown.spouseExemptionAmount > 0 && (
                <div className="flex items-center justify-between pl-6 pr-2.5 py-0.5 text-[11px] text-slate-400">
                  <span>• Spousal Exemption:</span>
                  <span className="text-right shrink-0 tabular-nums font-mono text-slate-300">
                    -£{breakdown.spouseExemptionAmount.toLocaleString('en-GB')}
                  </span>
                </div>
              )}
              {breakdown.charityExemptionAmount > 0 && (
                <div className="flex items-center justify-between pl-6 pr-2.5 py-0.5 text-[11px] text-slate-400">
                  <span>• Charitable Legacy:</span>
                  <span className="text-right shrink-0 tabular-nums font-mono text-slate-300">
                    -£{breakdown.charityExemptionAmount.toLocaleString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nil-Rate Bands */}
          <div className="pt-0.5 space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-sky-300 font-medium">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <span>Nil-Rate Band (NRB):</span>
                {breakdown.nrbConsumedByGifts > 0 && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    (£{breakdown.nrbConsumedByGifts.toLocaleString('en-GB')} used by gifts)
                  </span>
                )}
              </div>
              <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-sky-300">
                £{breakdown.nrbRemainingForEstate.toLocaleString('en-GB')}
              </span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 text-sky-300 font-medium">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <span>Residence Nil-Rate Band (RNRB):</span>
                {breakdown.rnrbTaperReduction > 0 && (
                  <span className="text-[10px] text-amber-400 font-normal">
                    (-£{breakdown.rnrbTaperReduction.toLocaleString('en-GB')} taper)
                  </span>
                )}
              </div>
              <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-sky-300">
                £{breakdown.effectiveRNRBForEstate.toLocaleString('en-GB')}
              </span>
            </div>
          </div>

          {/* Total Allowances Applied */}
          <div className="flex items-center justify-between px-2.5 py-1.5 font-semibold text-slate-200 bg-slate-800/80 border border-slate-700/60 rounded-lg">
            <span>Total Allowances Applied:</span>
            <span className="text-right shrink-0 tabular-nums font-mono font-semibold text-sky-400">
              -£{breakdown.totalAllowancesAppliedToEstate.toLocaleString('en-GB')}
            </span>
          </div>

          {/* Net Taxable Estate on Death */}
          <div className="flex items-center justify-between px-2.5 py-2 font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-lg">
            <span>Net Taxable Estate on Death:</span>
            <span className="text-right shrink-0 tabular-nums font-mono font-bold text-amber-300 text-sm">
              £{breakdown.taxableEstateOnDeath.toLocaleString('en-GB')}
            </span>
          </div>

          {/* Estate Tax Rate Applied */}
          <div className="flex items-center justify-between px-2.5 py-1 text-slate-300">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <span>Estate Tax Rate Applied:</span>
              {breakdown.isCharity10PercentMet && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                  Charity 36% Rate
                </span>
              )}
            </div>
            <span className="text-right shrink-0 tabular-nums font-mono font-bold text-white">
              {Math.round(breakdown.applicableEstateTaxRate * 100)}%
            </span>
          </div>

          {/* Estate Tax Due */}
          <div className="flex items-center justify-between px-2.5 py-1.5 text-white font-bold">
            <span>Estate Tax Due:</span>
            <span className="text-right shrink-0 tabular-nums font-mono font-bold text-rose-400 text-sm">
              £{breakdown.estateTaxDue.toLocaleString('en-GB')}
            </span>
          </div>

          {/* Lifetime Gift Tax Due (by Donees) */}
          {breakdown.totalLifetimeGiftTaxDue > 0 && (
            <div className="flex items-center justify-between px-2.5 py-1 text-white font-bold">
              <span>Lifetime Gift Tax Due (by Donees):</span>
              <span className="text-right shrink-0 tabular-nums font-mono font-bold text-rose-400 text-sm">
                £{breakdown.totalLifetimeGiftTaxDue.toLocaleString('en-GB')}
              </span>
            </div>
          )}

          {/* Total IHT Liability (if both Estate Tax and Gift Tax exist) */}
          {breakdown.totalLifetimeGiftTaxDue > 0 && (
            <div className="flex items-center justify-between px-2.5 py-2 text-rose-200 font-extrabold bg-rose-500/20 border border-rose-500/30 rounded-lg">
              <span>Total Inheritance Tax Liability:</span>
              <span className="text-right shrink-0 tabular-nums font-mono font-extrabold text-rose-300 text-base">
                £{breakdown.totalTaxLiability.toLocaleString('en-GB')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Charity Optimizer Widget */}
      {breakdown.charityOptimization &&
        !breakdown.charityOptimization.qualifiesFor36Percent &&
        breakdown.charityOptimization.additionalDonationNeeded > 0 && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Charity 36% Rate Optimizer
            </div>
            <p className="text-emerald-900 leading-relaxed">
              Leaving an extra{' '}
              <strong className="text-emerald-950 font-extrabold">
                £{breakdown.charityOptimization.additionalDonationNeeded.toLocaleString('en-GB')}
              </strong>{' '}
              to charity unlocks the 36% rate across your entire taxable estate.
            </p>
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80 flex justify-between items-center text-emerald-950 font-medium">
              <span>Potential Tax Savings:</span>
              <span className="font-bold text-emerald-700">
                £{breakdown.charityOptimization.taxSaved.toLocaleString('en-GB')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Net cost to your heirs: only £
              {breakdown.charityOptimization.netCostToHeirs.toLocaleString('en-GB')}
              {breakdown.charityOptimization.netCostToHeirs <= 0 && ' (Your heirs end up with more money!)'}
            </p>
          </div>
        )}

      {/* Personalized Estate Planning Alerts */}
      {(() => {
        // Filter out charity tip if dedicated optimizer widget is already visible
        const hasCharityWidget =
          breakdown.charityOptimization &&
          !breakdown.charityOptimization.qualifiesFor36Percent &&
          breakdown.charityOptimization.additionalDonationNeeded > 0;

        const visibleAlerts = breakdown.planningTips.filter(
          (tip) => !(hasCharityWidget && tip.id === 'charity-optimization')
        );

        if (visibleAlerts.length === 0) return null;

        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              Personalized Estate Planning Alerts
            </div>
            <div className="space-y-2.5">
              {visibleAlerts.map((alert) => {
                const isWarning = alert.type === 'warning';
                const isOpportunity = alert.type === 'tip';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 bg-white border rounded-xl space-y-1 shadow-2xs transition-all ${
                      isWarning
                        ? 'border-amber-300/80 bg-amber-50/40'
                        : isOpportunity
                        ? 'border-emerald-300/80 bg-emerald-50/30'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {isWarning && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      {isOpportunity && (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      {!isWarning && !isOpportunity && (
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                      <span>{alert.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      {alert.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
