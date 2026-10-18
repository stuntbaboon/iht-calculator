'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_ESTATES } from '@/hooks/useCalculatorState';
import {
  Calculator,
  Share2,
  Printer,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Info,
  ArrowRight,
} from 'lucide-react';

interface NavbarProps {
  onOpenShareModal: () => void;
  onReset: () => void;
  onLoadSample: (idx: number) => void;
}

const SAMPLE_BADGES = [
  'Standard Allowances',
  '£2M+ Taper Active',
  'BPR & 7-Year Gifts',
];

export function Navbar({ onOpenShareModal, onReset, onLoadSample }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [dropdownOpen]);

  const handlePrint = () => {
    window.print();
    setMobileMenuOpen(false);
  };

  const handleSampleSelect = (idx: number) => {
    onLoadSample(idx);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleReset = () => {
    onReset();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base md:text-lg tracking-tight truncate">
                <span className="hidden sm:inline">UK Inheritance Tax Calculator</span>
                <span className="sm:hidden">UK IHT Calculator</span>
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                2024–2028 Rates
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden lg:block truncate">
              Statutory HMRC Nil-Rate Band, Taper Relief & Exemption Planner
            </p>
          </div>
        </div>

        {/* Desktop Action Controls */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Custom Styled "Load Example..." Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                dropdownOpen
                  ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Example</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Pre-Configured Scenarios</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      HMRC Examples
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click a scenario to populate realistic values and test calculations:
                  </p>
                </div>

                <div className="space-y-1">
                  {SAMPLE_ESTATES.map((sample, idx) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => handleSampleSelect(idx)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all group flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {sample.name}
                          </span>
                          {SAMPLE_BADGES[idx] && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100/70 group-hover:text-blue-800 transition-colors">
                              {SAMPLE_BADGES[idx]}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {sample.description}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-all group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset Form"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print / Save PDF Report"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Print Report</span>
          </button>

          {/* Save & Share Button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Save & Share</span>
          </button>
        </div>

        {/* Mobile Actions (< md screens) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-fadeIn">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Load Example Scenario
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SAMPLE_ESTATES.map((sample, idx) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSampleSelect(idx)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{sample.name}</span>
                    {SAMPLE_BADGES[idx] && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        {SAMPLE_BADGES[idx]}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {sample.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 p-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 p-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>HMRC Rules: 2024–2028 Rates</span>
            </span>
            <span className="text-slate-400">v0.1.0</span>
          </div>
        </div>
      )}
    </header>
  );
}
