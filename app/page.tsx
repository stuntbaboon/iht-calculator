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
    updateGift,
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
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-5 sm:p-6 text-white border border-slate-800 shadow-md">
          {/* Subtle background glow accents */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-1/3 -top-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                UK Inheritance Tax Assessment & Estate Planning
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enter your estate details below. Allowances, 7-year gift taper schedules, and spousal exemptions update in real-time.
              </p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto text-xs text-slate-200 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15 shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Private: Stored locally & auto-saved</span>
            </div>
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
              onUpdateGift={updateGift}
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
