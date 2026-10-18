'use client';

import React, { useState } from 'react';
import { LifetimeGift, GiftCategory, GiftTaperResult } from '@/types/iht';
import { Plus, Trash2, Gift as GiftIcon, Info } from 'lucide-react';

interface GiftTrackerProps {
  gifts: LifetimeGift[];
  taperResults: GiftTaperResult[];
  onAddGift: (gift: Omit<LifetimeGift, 'id'>) => void;
  onRemoveGift: (id: string) => void;
}

const CATEGORY_LABELS: Record<GiftCategory, string> = {
  potentially_exempt_transfer: 'Standard Gift / PET (Subject to 7-year rule)',
  annual_exemption: 'Claim Annual Exemption (£3k + 1yr carry-forward)',
  normal_expenditure_income: 'Normal Expenditure out of Income (100% Exempt)',
  wedding_child: 'Wedding Gift to Child (£5,000 Exempt)',
  wedding_grandchild: 'Wedding Gift to Grandchild (£2,500 Exempt)',
  wedding_other: 'Wedding Gift to Other (£1,000 Exempt)',
  small_gift: 'Small Gift (Up to £250 per recipient)',
  chargeable_lifetime_transfer: 'Trust Transfer (Chargeable Lifetime Transfer)',
};

export function GiftTracker({
  gifts,
  taperResults,
  onAddGift,
  onRemoveGift,
}: GiftTrackerProps) {
  const [recipient, setRecipient] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState('2025-01-01');
  const [category, setCategory] = useState<GiftCategory>('potentially_exempt_transfer');
  const [isOpenForm, setIsOpenForm] = useState(gifts.length === 0);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDate(new Date().toISOString().slice(0, 10));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!recipient.trim() || !amount || isNaN(amount)) return;

    onAddGift({
      recipient: recipient.trim(),
      amount,
      date,
      category,
    });

    setRecipient('');
    setAmountStr('');
    setCategory('potentially_exempt_transfer');
  };

  const resultsMap = new Map<string, GiftTaperResult>();
  for (const r of taperResults) {
    resultsMap.set(r.giftId, r);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-950">How the 7-Year Rule works:</p>
            <p className="mt-1">
              Gifts to individuals become <strong>Potentially Exempt Transfers (PETs)</strong>. If you survive for 7 years after the gift, it is 100% tax-free. If death occurs within 7 years, gifts use up your Nil-Rate Band (£325k) first in chronological order. Any excess over the NRB is subject to <strong>Taper Relief</strong> (reducing the tax rate from 40% down to 8% based on the number of years survived).
            </p>
          </div>
        </div>
      </div>

      {/* Add Gift Button / Form */}
      {!isOpenForm ? (
        <button
          type="button"
          onClick={() => setIsOpenForm(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add a Lifetime Gift
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <GiftIcon className="w-4 h-4 text-blue-600" />
              Add Gift Details
            </h4>
            {gifts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsOpenForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Recipient
              </label>
              <input
                type="text"
                placeholder="e.g. Son, Daughter, Friend"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gift Amount (£)
              </label>
              <input
                type="text"
                placeholder="e.g. 50,000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date of Gift
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gift Category / Exemption
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GiftCategory)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              >
                {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                  <option key={catKey} value={catKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Gift
            </button>
          </div>
        </form>
      )}

      {/* Gifts List */}
      {gifts.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">NRB Used</th>
                  <th className="py-2.5 px-3 text-right">Taper Relief</th>
                  <th className="py-2.5 px-3 text-right">Est. Tax</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gifts.map((g) => {
                  const res = resultsMap.get(g.id);
                  const isExempt = res ? res.taperReliefPercent === 100 || res.chargeableAmount === 0 : false;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">
                        {g.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {g.recipient}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        £{g.amount.toLocaleString('en-GB')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate" title={CATEGORY_LABELS[g.category]}>
                        {CATEGORY_LABELS[g.category]}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {res && res.usedNRB > 0 ? `£${res.usedNRB.toLocaleString('en-GB')}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {res ? (
                          isExempt ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              Exempt (0%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                              {res.taperReliefPercent}% taper ({Math.round(res.effectiveTaxRate * 100)}% tax)
                            </span>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        {res && res.taxDue > 0 ? (
                          <span className="text-red-600 font-bold">£{res.taxDue.toLocaleString('en-GB')}</span>
                        ) : (
                          <span className="text-emerald-700">£0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveGift(g.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                          title="Remove gift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
