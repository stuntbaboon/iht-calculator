'use client';

import React, { useState } from 'react';
import { useCalculatorState } from '@/hooks/useCalculatorState';
import { Navbar } from '@/components/Navbar';
import { EstateForm } from '@/components/EstateForm';
import { ResultsSummary } from '@/components/ResultsSummary';
import { ShareModal } from '@/components/ShareModal';
import { PrintReport } from '@/components/PrintReport';
import { ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const {
    state,
    breakdown,
    updateField,
    addGift,
    removeGift,
    resetState,
    loadSample,
  } = useCalculatorState();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onReset={resetState}
        onLoadSample={loadSample}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        {/* Intro Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              UK Inheritance Tax Assessment & Estate Planning
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your estate details below. Allowances, 7-year gift taper schedules, and spousal exemptions update in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private: Unauthenticated & Auto-Saved</span>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Questionnaire Form */}
          <div className="lg:col-span-7 space-y-6">
            <EstateForm
              state={state}
              breakdown={breakdown}
              updateField={updateField}
              onAddGift={addGift}
              onRemoveGift={removeGift}
            />
          </div>

          {/* Right Column: Sticky Live Results Dashboard */}
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

      {/* Printable Report Component */}
      <PrintReport state={state} breakdown={breakdown} />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        state={state}
      />
    </div>
  );
}
