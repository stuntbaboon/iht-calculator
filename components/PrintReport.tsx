'use client';

import React from 'react';
import { EstateState, CalculationBreakdown } from '@/types/iht';

interface PrintReportProps {
  state: EstateState;
  breakdown: CalculationBreakdown;
}

export function PrintReport({ state, breakdown }: PrintReportProps) {
  const [printDate, setPrintDate] = React.useState('');

  React.useEffect(() => {
    const updateDate = () => {
      setPrintDate(
        new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    window.addEventListener('beforeprint', updateDate);
    return () => window.removeEventListener('beforeprint', updateDate);
  }, []);

  return (
    <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans space-y-6">
      {/* Report Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            UK Inheritance Tax Calculation Report
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Prepared under statutory rules of the Inheritance Tax Act 1984 (incorporating 2024–2028 thresholds)
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div suppressHydrationWarning>Date: {printDate}</div>
          <div>Status: Unofficial Estimate</div>
        </div>
      </div>

      {/* Summary KPI Boxes */}
      <div className="grid grid-cols-4 gap-4 py-2">
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
          <div className="text-[10px] uppercase font-bold text-slate-500">Gross Estate</div>
          <div className="text-lg font-bold text-slate-900">
            £{breakdown.grossEstate.toLocaleString('en-GB')}
          </div>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Deductions</div>
          <div className="text-lg font-bold text-slate-900">
            £{breakdown.totalLiabilities.toLocaleString('en-GB')}
          </div>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
          <div className="text-[10px] uppercase font-bold text-slate-500">Allowances & Reliefs</div>
          <div className="text-lg font-bold text-slate-900">
            £{(breakdown.totalAllowancesAppliedToEstate + breakdown.totalReliefsAndExemptions).toLocaleString('en-GB')}
          </div>
        </div>
        <div className="p-3 bg-slate-900 text-white rounded-lg">
          <div className="text-[10px] uppercase font-bold text-slate-300">Est. Tax Payable</div>
          <div className="text-lg font-bold text-white">
            £{breakdown.totalTaxLiability.toLocaleString('en-GB')}
          </div>
        </div>
      </div>

      {/* Itemised Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
          1. Estate Composition & Liabilities
        </h3>
        <table className="w-full text-xs divide-y divide-slate-200">
          <tbody>
            <tr className="py-1">
              <td className="py-1 text-slate-600">Main Residence:</td>
              <td className="py-1 text-right font-medium">£{(state.mainResidenceValue || 0).toLocaleString('en-GB')}</td>
            </tr>
            {state.mainResidenceMortgage > 0 && (
              <tr>
                <td className="py-1 text-slate-500 pl-4">Less: Main Residence Mortgage:</td>
                <td className="py-1 text-right text-slate-600">-£{state.mainResidenceMortgage.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {state.otherPropertiesValue > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Other Properties & Land:</td>
                <td className="py-1 text-right font-medium">£{state.otherPropertiesValue.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {state.otherPropertiesMortgage > 0 && (
              <tr>
                <td className="py-1 text-slate-500 pl-4">Less: Mortgages on Other Properties:</td>
                <td className="py-1 text-right text-slate-600">-£{state.otherPropertiesMortgage.toLocaleString('en-GB')}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-slate-600">Cash, Savings, Bank Accounts & ISAs:</td>
              <td className="py-1 text-right font-medium">£{(state.cashAndSavings || 0).toLocaleString('en-GB')}</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-600">Listed Shares & Investments:</td>
              <td className="py-1 text-right font-medium">£{(state.quotedInvestments || 0).toLocaleString('en-GB')}</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-600">Personal Chattels, Vehicles & Valuables:</td>
              <td className="py-1 text-right font-medium">£{(state.personalChattels || 0).toLocaleString('en-GB')}</td>
            </tr>
            {state.bpr100Assets > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Business Property (100% BPR Qualifying):</td>
                <td className="py-1 text-right font-medium">£{state.bpr100Assets.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {state.apr100Assets > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Agricultural Property (100% APR Qualifying):</td>
                <td className="py-1 text-right font-medium">£{state.apr100Assets.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {state.otherDebts > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Personal Debts, Loans & Liabilities:</td>
                <td className="py-1 text-right text-slate-600">-£{state.otherDebts.toLocaleString('en-GB')}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-slate-600">Funeral & Testamentary Costs:</td>
              <td className="py-1 text-right text-slate-600">-£{(state.funeralCosts || 0).toLocaleString('en-GB')}</td>
            </tr>
            <tr className="border-t font-bold bg-slate-50">
              <td className="py-1.5 text-slate-900">Net Estate before Reliefs:</td>
              <td className="py-1.5 text-right text-slate-900">£{breakdown.netEstateBeforeReliefs.toLocaleString('en-GB')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Allowances Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
          2. Statutory Allowances & Reliefs Applied
        </h3>
        <table className="w-full text-xs divide-y divide-slate-200">
          <tbody>
            <tr>
              <td className="py-1 text-slate-600">Standard Nil-Rate Band (NRB):</td>
              <td className="py-1 text-right">£{breakdown.standardNRB.toLocaleString('en-GB')}</td>
            </tr>
            {breakdown.transferredNRB > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Transferred Spousal NRB:</td>
                <td className="py-1 text-right">£{breakdown.transferredNRB.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {breakdown.nrbConsumedByGifts > 0 && (
              <tr>
                <td className="py-1 text-slate-500 pl-4">Less: NRB Consumed by 7-Year Lifetime Gifts:</td>
                <td className="py-1 text-right text-slate-600">-£{breakdown.nrbConsumedByGifts.toLocaleString('en-GB')}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-slate-600">Effective Residence Nil-Rate Band (RNRB):</td>
              <td className="py-1 text-right">£{breakdown.effectiveRNRBForEstate.toLocaleString('en-GB')}</td>
            </tr>
            {breakdown.rnrbTaperReduction > 0 && (
              <tr>
                <td className="py-1 text-slate-500 pl-4">Note: RNRB reduced by £2M estate taper:</td>
                <td className="py-1 text-right text-amber-700">-£{breakdown.rnrbTaperReduction.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {breakdown.bprReliefAmount > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Business Property Relief (BPR):</td>
                <td className="py-1 text-right">£{breakdown.bprReliefAmount.toLocaleString('en-GB')}</td>
              </tr>
            )}
            {breakdown.charityExemptionAmount > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Charitable Legacy Exemption:</td>
                <td className="py-1 text-right">£{breakdown.charityExemptionAmount.toLocaleString('en-GB')}</td>
              </tr>
            )}
            <tr className="border-t font-bold bg-slate-50">
              <td className="py-1.5 text-slate-900">Taxable Estate on Death:</td>
              <td className="py-1.5 text-right text-slate-900">£{breakdown.taxableEstateOnDeath.toLocaleString('en-GB')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tax Result & Rate */}
      <div className="p-4 bg-slate-100 rounded-xl space-y-2 border border-slate-300 text-xs">
        <div className="flex justify-between font-bold text-sm text-slate-900">
          <span>Inheritance Tax Due:</span>
          <span>£{breakdown.totalTaxLiability.toLocaleString('en-GB')}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Tax Rate Applied to Taxable Estate:</span>
          <span>{Math.round(breakdown.applicableEstateTaxRate * 100)}%</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Overall Effective Tax Rate:</span>
          <span>{(breakdown.effectiveTaxRate * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-200 leading-relaxed">
        <strong>Disclaimer:</strong> This calculation is for guidance and educational purposes only and does not constitute formal legal or financial advice. Inheritance tax rules can be subject to individual circumstances and HMRC interpretation. Consult a qualified STEP solicitor or chartered tax advisor before making estate planning decisions.
      </div>
    </div>
  );
}
