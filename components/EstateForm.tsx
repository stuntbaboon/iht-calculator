'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EstateState, CalculationBreakdown, MaritalStatus, LifetimeGift } from '@/types/iht';
import { CurrencyInput } from './CurrencyInput';
import { PercentageInput } from './PercentageInput';
import { GiftTracker } from './GiftTracker';
import {
  Users,
  Home,
  Coins,
  Briefcase,
  Receipt,
  Gift,
  HeartHandshake,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface EstateFormProps {
  state: EstateState;
  breakdown: CalculationBreakdown;
  updateField: <K extends keyof EstateState>(field: K, value: EstateState[K]) => void;
  onAddGift: (gift: Omit<LifetimeGift, 'id'>) => void;
  onRemoveGift: (id: string) => void;
}

const TABS = [
  { id: 'family', label: 'Family & Status', icon: Users },
  { id: 'property', label: 'Property', icon: Home },
  { id: 'assets', label: 'Savings & Assets', icon: Coins },
  { id: 'business', label: 'Business & APR', icon: Briefcase },
  { id: 'debts', label: 'Debts & Funeral', icon: Receipt },
  { id: 'gifts', label: '7-Year Gifts', icon: Gift },
  { id: 'charity', label: 'Charity Giving', icon: HeartHandshake },
];

export function EstateForm({
  state,
  breakdown,
  updateField,
  onAddGift,
  onRemoveGift,
}: EstateFormProps) {
  const [activeTab, setActiveTab] = useState('family');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 6);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      checkScroll();
    });
    const el = tabsContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Smooth scroll active tab into view when activeTab changes
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (el) {
      el.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  const currentIndex = TABS.findIndex((t) => t.id === activeTab);
  const handleNext = () => {
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Navigation Tabs with Scroll Affordance */}
      <div className="relative border-b border-slate-200 bg-slate-50/70">
        {/* Left Scroll Gradient & Button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1.5 pointer-events-auto">
            <div className="absolute inset-0 w-12 bg-gradient-to-r from-slate-100 via-slate-100/90 to-transparent pointer-events-none" />
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="relative z-10 p-1.5 rounded-full bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200 hover:border-blue-300 transition-all hover:scale-105"
              aria-label="Scroll tabs left"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Container */}
        <div
          ref={tabsContainerRef}
          onScroll={checkScroll}
          className="p-2 overflow-x-auto scrollbar-none scroll-smooth"
        >
          <nav className="flex space-x-1 min-w-max" aria-label="Form Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-300 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'gifts' && (state.gifts || []).length > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {state.gifts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Scroll Gradient & Button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1.5 pointer-events-auto">
            <div className="absolute inset-0 w-12 bg-gradient-to-l from-slate-100 via-slate-100/90 to-transparent pointer-events-none -left-6" />
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="relative z-10 p-1.5 rounded-full bg-white text-slate-700 hover:text-blue-600 shadow-md border border-slate-200 hover:border-blue-300 transition-all hover:scale-105"
              aria-label="Scroll tabs right"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-6 space-y-6 min-h-[460px]">
        {/* 1. FAMILY & STATUS */}
        {activeTab === 'family' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Marital & Beneficiary Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your marital status determines whether you can transfer unused allowances from a deceased spouse or pass assets tax-free to a surviving spouse.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Marital Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'single', label: 'Single / Never Married' },
                  { value: 'married_or_civil_partnership', label: 'Married / Civil Partner' },
                  { value: 'widowed', label: 'Widowed (Surviving)' },
                  { value: 'divorced', label: 'Divorced' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateField('maritalStatus', item.value as MaritalStatus)}
                    className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                      state.maritalStatus === item.value
                        ? 'bg-blue-50/60 border-blue-600 text-blue-900 ring-1 ring-blue-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Descendants Question */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Will your home be passed to direct descendants?
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct descendants include children, grandchildren, stepchildren, adopted, and foster children. This is required to qualify for the <strong>Residence Nil-Rate Band (up to £175,000)</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('passedToDirectDescendants', true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      state.passedToDirectDescendants
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('passedToDirectDescendants', false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      !state.passedToDirectDescendants
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {state.passedToDirectDescendants && (
                <div className="pt-2 border-t border-slate-200/80">
                  <PercentageInput
                    id="directDescendantSharePercent"
                    label="Percentage of Home Passing to Direct Descendants"
                    value={state.directDescendantSharePercent ?? 100}
                    onChange={(v) => updateField('directDescendantSharePercent', v)}
                    helperText="If 100% of the property is left to children/descendants, leave at 100%."
                  />
                </div>
              )}
            </div>

            {/* Spousal Exemptions if Married */}
            {state.maritalStatus === 'married_or_civil_partnership' && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Spousal Transfer Exemption
                </h4>
                <p className="text-xs text-emerald-800">
                  Transfers to a UK-domiciled spouse or civil partner on death are <strong>100% exempt from Inheritance Tax</strong>. Any unused allowances can later be claimed by the surviving spouse.
                </p>
                <PercentageInput
                  id="spouseInheritancePercent"
                  label="Percentage of Remaining Estate Passing to Surviving Spouse"
                  value={state.spouseInheritancePercent || 0}
                  onChange={(v) => updateField('spouseInheritancePercent', v)}
                  helperText="e.g. 100% if everything passes to the surviving spouse tax-free."
                />
              </div>
            )}

            {/* Transferred Allowances if Widowed */}
            {state.maritalStatus === 'widowed' && (
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-4">
                <h4 className="text-sm font-semibold text-indigo-950">
                  Transferable Allowances from Deceased Spouse
                </h4>
                <p className="text-xs text-indigo-800">
                  If your late spouse or civil partner did not use all their allowances, you can claim their unused percentage (up to +£325k NRB and +£175k RNRB).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PercentageInput
                    id="spouseUnusedNRBPercent"
                    label="Unused Nil-Rate Band from Late Spouse"
                    value={state.spouseUnusedNRBPercent || 0}
                    onChange={(v) => updateField('spouseUnusedNRBPercent', v)}
                    helperText="100% = +£325,000 extra allowance (max £650k combined)."
                  />
                  <PercentageInput
                    id="spouseUnusedRNRBPercent"
                    label="Unused Residence Nil-Rate Band from Late Spouse"
                    value={state.spouseUnusedRNRBPercent || 0}
                    onChange={(v) => updateField('spouseUnusedRNRBPercent', v)}
                    helperText="100% = +£175,000 extra home allowance (max £350k combined)."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. PROPERTY */}
        {activeTab === 'property' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Residential Property & Real Estate</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your main home and any other real estate (buy-to-lets, holiday homes, land).
              </p>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Main Residence (Family Home)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput
                  id="mainResidenceValue"
                  label="Estimated Market Value"
                  value={state.mainResidenceValue || 0}
                  onChange={(v) => updateField('mainResidenceValue', v)}
                  helperText="Gross market value at date of death or valuation."
                />
                <CurrencyInput
                  id="mainResidenceMortgage"
                  label="Outstanding Mortgage"
                  value={state.mainResidenceMortgage || 0}
                  onChange={(v) => updateField('mainResidenceMortgage', v)}
                  helperText="Mortgages secured on the home are deducted."
                />
              </div>

              {/* Downsizing Relief Toggle */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Have you downsized or sold a home on/after 8 July 2015?
                    </span>
                    <p className="text-[11px] text-slate-500">
                      You may qualify for the Downsizing Addition to preserve lost RNRB.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('hasDownsized', !state.hasDownsized)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      state.hasDownsized
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {state.hasDownsized ? 'Yes' : 'No'}
                  </button>
                </div>

                {state.hasDownsized && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CurrencyInput
                        id="formerPropertySaleValue"
                        label="Former Home Sale Value"
                        value={state.formerPropertySaleValue || 0}
                        onChange={(v) => updateField('formerPropertySaleValue', v)}
                      />
                      <CurrencyInput
                        id="formerPropertyMortgage"
                        label="Former Home Mortgage at Sale"
                        value={state.formerPropertyMortgage || 0}
                        onChange={(v) => updateField('formerPropertyMortgage', v)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Other Properties & Land</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput
                  id="otherPropertiesValue"
                  label="Total Value of Other Properties"
                  value={state.otherPropertiesValue || 0}
                  onChange={(v) => updateField('otherPropertiesValue', v)}
                  helperText="Buy-to-lets, holiday cottages, inherited land, etc."
                />
                <CurrencyInput
                  id="otherPropertiesMortgage"
                  label="Outstanding Mortgages on Other Properties"
                  value={state.otherPropertiesMortgage || 0}
                  onChange={(v) => updateField('otherPropertiesMortgage', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. SAVINGS & ASSETS */}
        {activeTab === 'assets' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Savings, Investments & Personal Possessions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Note that ISAs and Premium Bonds form part of your taxable estate for Inheritance Tax.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyInput
                id="cashAndSavings"
                label="Cash, Bank Accounts & ISAs"
                value={state.cashAndSavings || 0}
                onChange={(v) => updateField('cashAndSavings', v)}
                helperText="Includes current accounts, savings, Cash ISAs, and Premium Bonds."
              />
              <CurrencyInput
                id="quotedInvestments"
                label="Listed Investments & Shares"
                value={state.quotedInvestments || 0}
                onChange={(v) => updateField('quotedInvestments', v)}
                helperText="Stocks & Shares ISAs, unit trusts, OEICs, and listed shares."
              />
              <CurrencyInput
                id="personalChattels"
                label="Personal Possessions & Vehicles (Chattels)"
                value={state.personalChattels || 0}
                onChange={(v) => updateField('personalChattels', v)}
                helperText="Cars, jewellery, antiques, artwork, collections, furniture."
              />
              <CurrencyInput
                id="lifeInsuranceNotInTrust"
                label="Life Insurance (NOT in Trust)"
                value={state.lifeInsuranceNotInTrust || 0}
                onChange={(v) => updateField('lifeInsuranceNotInTrust', v)}
                helperText="Policies payable to your estate are subject to 40% IHT."
              />
            </div>

            {/* Pensions Section with April 2027 Toggle */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-amber-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Pension Funds & Autumn Budget Rules
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Under current law (up to April 2027), unused defined contribution pensions are held in discretionary trust outside your estate. From <strong>April 2027</strong>, they will be brought into IHT.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.includePensionsInEstate}
                  onClick={() => updateField('includePensionsInEstate', !state.includePensionsInEstate)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shrink-0 shadow-2xs ${
                    state.includePensionsInEstate
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-500/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      state.includePensionsInEstate ? 'bg-white animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {state.includePensionsInEstate ? 'April 2027 Rules: ON' : 'April 2027 Rules: OFF'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <CurrencyInput
                  id="pensionValue"
                  label="Unused Pension Pot Value"
                  value={state.pensionValue || 0}
                  onChange={(v) => updateField('pensionValue', v)}
                  helperText={
                    state.includePensionsInEstate
                      ? 'Included in Gross Estate under post-April 2027 rules.'
                      : 'Excluded from Gross Estate under current legislation.'
                  }
                />
                <CurrencyInput
                  id="lifeInsuranceInTrust"
                  label="Life Insurance (Written in Trust)"
                  value={state.lifeInsuranceInTrust || 0}
                  onChange={(v) => updateField('lifeInsuranceInTrust', v)}
                  helperText="Excluded from estate (completely exempt from IHT)."
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. BUSINESS & AGRICULTURE */}
        {activeTab === 'business' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Business & Agricultural Property Relief</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualifying trading business assets, unquoted shares (e.g. AIM), and agricultural land can qualify for 100% or 50% relief from Inheritance Tax.
              </p>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Business Property Relief (BPR)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput
                  id="bpr100Assets"
                  label="100% BPR Assets"
                  value={state.bpr100Assets || 0}
                  onChange={(v) => updateField('bpr100Assets', v)}
                  helperText="Unquoted trading company shares (including AIM), sole trader/partnership interest."
                />
                <CurrencyInput
                  id="bpr50Assets"
                  label="50% BPR Assets"
                  value={state.bpr50Assets || 0}
                  onChange={(v) => updateField('bpr50Assets', v)}
                  helperText="Controlling interest (>50%) in listed company, land/buildings used by business."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Agricultural Property Relief (APR)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput
                  id="apr100Assets"
                  label="100% APR Assets"
                  value={state.apr100Assets || 0}
                  onChange={(v) => updateField('apr100Assets', v)}
                  helperText="Agricultural land/pasture, farmhouses occupied for agriculture with vacant possession."
                />
                <CurrencyInput
                  id="apr50Assets"
                  label="50% APR Assets"
                  value={state.apr50Assets || 0}
                  onChange={(v) => updateField('apr50Assets', v)}
                  helperText="Tenanted agricultural land let under pre-1 September 1995 leases."
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">Important Note on £2M Taper:</span> Under Section 8D IHTA 1984, BPR and APR reliefs are deducted to calculate taxable estate, but are <em>not</em> deducted when testing if your estate exceeds the £2,000,000 Residence Nil-Rate Band taper threshold.
            </div>
          </div>
        )}

        {/* 5. DEBTS & DEDUCTIONS */}
        {activeTab === 'debts' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Debts, Liabilities & Funeral Expenses</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Debts owed at the date of death and reasonable funeral expenses are deducted from the estate before tax is calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyInput
                id="otherDebts"
                label="Personal Loans, Credit Cards & Overdrafts"
                value={state.otherDebts || 0}
                onChange={(v) => updateField('otherDebts', v)}
                helperText="Outstanding unsecured debts, unpaid bills, taxes owed."
              />
              <CurrencyInput
                id="funeralCosts"
                label="Funeral & Testamentary Expenses"
                value={state.funeralCosts || 0}
                onChange={(v) => updateField('funeralCosts', v)}
                helperText="Average UK funeral costs are £4,000 - £6,000."
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Mortgage Deductions:</p>
              <p>
                Property mortgages are automatically included:
                <br />• Main Residence Mortgage: £{(state.mainResidenceMortgage || 0).toLocaleString('en-GB')}
                <br />• Other Properties Mortgage: £{(state.otherPropertiesMortgage || 0).toLocaleString('en-GB')}
              </p>
              <p className="pt-1 font-bold text-slate-900">
                Total Deductions: £{breakdown.totalLiabilities.toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        )}

        {/* 6. GIFTS */}
        {activeTab === 'gifts' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lifetime Gifts (7-Year Rule)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record gifts made in the last 7 years. The calculator will sequence them chronologically, apply annual allowances, and calculate taper relief.
              </p>
            </div>

            <GiftTracker
              gifts={state.gifts || []}
              taperResults={breakdown.giftTaperResults || []}
              onAddGift={onAddGift}
              onRemoveGift={onRemoveGift}
            />
          </div>
        )}

        {/* 7. CHARITY */}
        {activeTab === 'charity' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Charitable Giving & 36% Reduced Rate</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leaving 10% or more of your net baseline estate to registered UK charities reduces your entire Inheritance Tax rate from <strong>40% to 36%</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Donation Type:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('charityDonationType', 'percentage')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      state.charityDonationType === 'percentage'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Percentage of Net Estate
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('charityDonationType', 'fixed')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      state.charityDonationType === 'fixed'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Fixed Cash Amount (£)
                  </button>
                </div>
              </div>

              {state.charityDonationType === 'percentage' ? (
                <PercentageInput
                  id="charityDonationValue"
                  label="Percentage of Net Estate Left to Charity"
                  value={state.charityDonationValue || 0}
                  onChange={(v) => updateField('charityDonationValue', v)}
                  presets={[0, 5, 10, 20]}
                  helperText="Tip: Choose 10% to test the statutory reduced rate threshold."
                />
              ) : (
                <CurrencyInput
                  id="charityDonationValueFixed"
                  label="Fixed Cash Amount Left to Charity"
                  value={state.charityDonationValue || 0}
                  onChange={(v) => updateField('charityDonationValue', v)}
                  helperText="Gross cash donation left in your Will to registered charities."
                />
              )}
            </div>

            {/* Live 10% Status Badge */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                breakdown.isCharity10PercentMet
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {breakdown.isCharity10PercentMet
                    ? '✓ 10% Charity Threshold Achieved'
                    : '10% Charity Threshold Not Yet Met'}
                </p>
                <p className="text-xs mt-1">
                  Baseline Estate Amount: £{breakdown.charityBaselineAmount.toLocaleString('en-GB')}
                  <br />
                  10% Target Donation: £
                  {Math.ceil(breakdown.charityBaselineAmount * 0.1).toLocaleString('en-GB')}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  breakdown.isCharity10PercentMet
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                Tax Rate: {Math.round(breakdown.applicableEstateTaxRate * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous Section
        </button>

        <span className="text-xs text-slate-400 font-medium">
          Step {currentIndex + 1} of {TABS.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === TABS.length - 1}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          Next Section
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
