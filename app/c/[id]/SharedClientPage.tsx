'use client';

import React, { useState } from 'react';
import { EstateState } from '@/types/iht';
import { useCalculatorState } from '@/hooks/useCalculatorState';
import { Navbar } from '@/components/Navbar';
import { EstateForm } from '@/components/EstateForm';
import { ResultsSummary } from '@/components/ResultsSummary';
import { ShareModal } from '@/components/ShareModal';
import { PrintReport } from '@/components/PrintReport';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Share2 } from 'lucide-react';

interface SharedClientPageProps {
  initialState: EstateState;
  calculationId: string;
  savedDate: string;
}

export function SharedClientPage({
  initialState,
  calculationId,
  savedDate,
}: SharedClientPageProps) {
  const {
    state,
    breakdown,
    updateField,
    addGift,
    removeGift,
    resetState,
    loadSample,
  } = useCalculatorState(initialState);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const formattedDate = new Date(savedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Navbar
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onReset={resetState}
        onLoadSample={loadSample}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        {/* Shared Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                Loaded Shared Calculation ({calculationId})
              </h2>
              <p className="text-xs text-blue-800">
                Created on {formattedDate}. You can modify any figures; updates will save in your browser.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-blue-900 bg-white/80 px-3 py-1.5 rounded-xl border border-blue-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Interactive Shared Copy</span>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <EstateForm
              state={state}
              breakdown={breakdown}
              updateField={updateField}
              onAddGift={addGift}
              onRemoveGift={removeGift}
            />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
            <ResultsSummary
              breakdown={breakdown}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Comprehensive Statutory Footer */}
      <Footer />

      <PrintReport state={state} breakdown={breakdown} />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        state={state}
      />
    </div>
  );
}
