'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LifetimeGift, GiftCategory, GiftRelationship, GiftTaperResult } from '@/types/iht';
import {
  Plus,
  Trash2,
  Gift as GiftIcon,
  Info,
  ChevronDown,
  Check,
  ArrowRight,
  Sparkles,
  Edit2,
  Copy,
  X,
  User,
  AlertCircle,
} from 'lucide-react';

interface GiftTrackerProps {
  gifts: LifetimeGift[];
  taperResults: GiftTaperResult[];
  onAddGift: (gift: Omit<LifetimeGift, 'id'>) => void;
  onRemoveGift: (id: string) => void;
  onUpdateGift?: (id: string, updated: Partial<LifetimeGift>) => void;
}

interface CategoryOption {
  id: GiftCategory;
  title: string;
  badge: string;
  badgeClass: string;
  description: string;
}

const GIFT_CATEGORIES: CategoryOption[] = [
  {
    id: 'potentially_exempt_transfer',
    title: 'Standard Gift (PET)',
    badge: '7-Year Rule',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    description: 'Outright gift to an individual. Completely tax-free after 7 years; taper relief applies between 3 and 7 years.',
  },
  {
    id: 'annual_exemption',
    title: 'Annual Exemption',
    badge: '£3,000 / Year',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    description: 'Use your £3,000 yearly tax-free gift allowance, plus up to £3,000 carried forward from the previous tax year.',
  },
  {
    id: 'normal_expenditure_income',
    title: 'Normal Expenditure from Income',
    badge: '100% Tax-Free',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    description: 'Regular gifts paid directly out of surplus net income without reducing your customary standard of living.',
  },
  {
    id: 'wedding_child',
    title: 'Wedding Gift to Child',
    badge: '£5,000 Exempt',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    description: 'Gift made before or on the marriage/civil partnership of your son, daughter, or stepchild.',
  },
  {
    id: 'wedding_grandchild',
    title: 'Wedding Gift to Grandchild',
    badge: '£2,500 Exempt',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    description: 'Gift made in consideration of the marriage/civil partnership of your grandchild or great-grandchild.',
  },
  {
    id: 'wedding_other',
    title: 'Wedding Gift to Other',
    badge: '£1,000 Exempt',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    description: 'Marriage gift to any other relative, friend, or party (up to £1,000 tax-free).',
  },
  {
    id: 'small_gift',
    title: 'Small Gifts Exemption',
    badge: 'Up to £250',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Gifts of up to £250 per person per tax year (cannot be combined with other exemptions for the same person).',
  },
  {
    id: 'chargeable_lifetime_transfer',
    title: 'Trust Transfer (CLT)',
    badge: '20% Lifetime Tax',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    description: 'Transfers into relevant property trusts or companies. Immediate 20% lifetime IHT applies to amounts over NRB.',
  },
];

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

export interface RelationshipOption {
  id: GiftRelationship | string;
  label: string;
  badge: string;
  badgeClass: string;
  description: string;
}

export const GIFT_RELATIONSHIPS: RelationshipOption[] = [
  {
    id: 'child',
    label: 'Child / Stepchild',
    badge: 'Direct Descendant',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    description: 'Eligible for £5k wedding exemption & future RNRB inheritance.',
  },
  {
    id: 'grandchild',
    label: 'Grandchild / Great-grandchild',
    badge: 'Direct Descendant',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    description: 'Eligible for £2.5k wedding exemption & direct descendant rules.',
  },
  {
    id: 'spouse',
    label: 'Spouse / Civil Partner',
    badge: '100% Tax-Free',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    description: 'Completely exempt under s.18 IHTA 1984. No 7-year clock.',
  },
  {
    id: 'sibling',
    label: 'Sibling (Brother / Sister)',
    badge: 'Standard PET',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Collateral relative; standard 7-year survival rules apply.',
  },
  {
    id: 'niece_nephew',
    label: 'Niece / Nephew',
    badge: 'Standard PET',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Subject to standard 7-year survival clock; no lineal RNRB.',
  },
  {
    id: 'parent',
    label: 'Parent',
    badge: 'Standard PET',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Upward transfers subject to normal 7-year PET rules.',
  },
  {
    id: 'friend',
    label: 'Friend',
    badge: 'Standard PET',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Unrelated individual; subject to the 7-year PET rule.',
  },
  {
    id: 'charity',
    label: 'Charity / Qualifying Body',
    badge: '100% Tax-Free',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    description: 'Outright gifts to registered UK charities are entirely exempt.',
  },
  {
    id: 'other',
    label: 'Other',
    badge: 'Standard PET',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Other recipients under standard UK lifetime gift provisions.',
  },
];

export const RELATIONSHIP_LABELS: Record<string, string> = {
  child: 'Child',
  grandchild: 'Grandchild',
  spouse: 'Spouse',
  sibling: 'Sibling',
  niece_nephew: 'Niece/Nephew',
  parent: 'Parent',
  friend: 'Friend',
  charity: 'Charity',
  other: 'Other',
};

export function GiftTracker({
  gifts,
  taperResults,
  onAddGift,
  onRemoveGift,
  onUpdateGift,
}: GiftTrackerProps) {
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState<string>('child');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState('2025-01-01');
  const [category, setCategory] = useState<GiftCategory>('potentially_exempt_transfer');
  const [isOpenForm, setIsOpenForm] = useState(gifts.length === 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [isRelationshipDropdownOpen, setIsRelationshipDropdownOpen] = useState(false);
  const [openRelationshipUpwards, setOpenRelationshipUpwards] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [expandedGiftId, setExpandedGiftId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);
  const relationshipDropdownRef = useRef<HTMLDivElement>(null);
  const selectedRelationshipOptionRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const updateDropdownDirection = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If there's less than 380px below and more room above, open upwards
      setOpenUpwards(spaceBelow < 380 && spaceAbove > spaceBelow);
    }
  };

  const updateRelationshipDropdownDirection = () => {
    if (relationshipDropdownRef.current) {
      const rect = relationshipDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If there's less than 340px below and more room above, open upwards
      setOpenRelationshipUpwards(spaceBelow < 340 && spaceAbove > spaceBelow);
    }
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      updateDropdownDirection();
      setIsRelationshipDropdownOpen(false);
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleRelationshipDropdown = () => {
    if (!isRelationshipDropdownOpen) {
      updateRelationshipDropdownDirection();
      setIsDropdownOpen(false);
    }
    setIsRelationshipDropdownOpen((prev) => !prev);
  };

  // Close dropdowns on outside click or Escape, and track direction on scroll/resize
  useEffect(() => {
    if (!isDropdownOpen && !isRelationshipDropdownOpen) return;

    function handleResizeOrScroll() {
      if (isDropdownOpen) updateDropdownDirection();
      if (isRelationshipDropdownOpen) updateRelationshipDropdownDirection();
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (relationshipDropdownRef.current && !relationshipDropdownRef.current.contains(target)) {
        setIsRelationshipDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsRelationshipDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isDropdownOpen, isRelationshipDropdownOpen]);

  // Ensure selected option is scrolled into view when category dropdown opens
  useEffect(() => {
    if (isDropdownOpen && selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isDropdownOpen]);

  // Ensure selected option is scrolled into view when relationship dropdown opens
  useEffect(() => {
    if (isRelationshipDropdownOpen && selectedRelationshipOptionRef.current) {
      selectedRelationshipOptionRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isRelationshipDropdownOpen]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDate(new Date().toISOString().slice(0, 10));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleStartEdit = (g: LifetimeGift) => {
    setEditingGiftId(g.id);
    setRecipient(g.recipient);
    setRelationship(g.relationship || 'child');
    setAmountStr(g.amount.toLocaleString('en-GB'));
    setDate(g.date);
    setCategory(g.category);
    setIsOpenForm(true);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleCancelEdit = () => {
    setEditingGiftId(null);
    setRecipient('');
    setRelationship('child');
    setAmountStr('');
    setCategory('potentially_exempt_transfer');
    setIsDropdownOpen(false);
    setIsRelationshipDropdownOpen(false);
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleDuplicate = (g: LifetimeGift) => {
    onAddGift({
      recipient: `${g.recipient} (Copy)`,
      relationship: g.relationship || 'child',
      amount: g.amount,
      date: g.date,
      category: g.category,
    });
  };

  const toggleExpand = (giftId: string) => {
    setExpandedGiftId((prev) => (prev === giftId ? null : giftId));
  };

  const handleRemove = (id: string) => {
    if (editingGiftId === id) {
      handleCancelEdit();
    }
    if (expandedGiftId === id) {
      setExpandedGiftId(null);
    }
    onRemoveGift(id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!recipient.trim() || !amount || isNaN(amount)) return;

    if (editingGiftId && onUpdateGift) {
      onUpdateGift(editingGiftId, {
        recipient: recipient.trim(),
        relationship,
        amount,
        date,
        category,
      });
      setEditingGiftId(null);
    } else {
      onAddGift({
        recipient: recipient.trim(),
        relationship,
        amount,
        date,
        category,
      });
    }

    setRecipient('');
    setRelationship('child');
    setAmountStr('');
    setCategory('potentially_exempt_transfer');
    setIsDropdownOpen(false);
    setIsRelationshipDropdownOpen(false);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation/editing keys: Backspace, Delete, Tab, ArrowLeft, ArrowRight, Home, End, Enter
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block any non-digit character (including '.', '-', 'e', etc.)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(isNaN(num) ? '' : num.toLocaleString('en-GB'));
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateDropdownDirection();
        setIsRelationshipDropdownOpen(false);
        setIsDropdownOpen(true);
      }
      return;
    }

    const currentIndex = GIFT_CATEGORIES.findIndex((c) => c.id === category);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % GIFT_CATEGORIES.length;
      setCategory(GIFT_CATEGORIES[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + GIFT_CATEGORIES.length) % GIFT_CATEGORIES.length;
      setCategory(GIFT_CATEGORIES[prevIndex].id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  const handleRelationshipDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!isRelationshipDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateRelationshipDropdownDirection();
        setIsDropdownOpen(false);
        setIsRelationshipDropdownOpen(true);
      }
      return;
    }

    const currentIndex = GIFT_RELATIONSHIPS.findIndex((r) => r.id === relationship);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % GIFT_RELATIONSHIPS.length;
      setRelationship(GIFT_RELATIONSHIPS[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + GIFT_RELATIONSHIPS.length) % GIFT_RELATIONSHIPS.length;
      setRelationship(GIFT_RELATIONSHIPS[prevIndex].id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsRelationshipDropdownOpen(false);
    }
  };

  const selectedCategory =
    GIFT_CATEGORIES.find((c) => c.id === category) || GIFT_CATEGORIES[0];

  const selectedRelationship: RelationshipOption =
    GIFT_RELATIONSHIPS.find((r) => r.id === relationship) || {
      id: relationship,
      label: RELATIONSHIP_LABELS[relationship] || relationship || 'Child / Stepchild',
      badge: 'Custom',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      description: 'Custom or unclassified relationship.',
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

      <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-red-950">Important Note on Lifetime Gifts:</span> Gifts made within 7 years of death use up your £325,000 Nil-Rate Band in priority order before your estate can use it. Taper relief only reduces the tax on gifts that <em>exceed</em> the £325,000 allowance.
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
        <form ref={formRef} onSubmit={handleSave} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <GiftIcon className="w-4 h-4 text-blue-600" />
              <span>{editingGiftId ? 'Edit Gift Details' : 'Add Gift Details'}</span>
              {editingGiftId && (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Editing
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2">
              {editingGiftId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Edit
                </button>
              )}
              {gifts.length > 0 && !editingGiftId && (
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                placeholder="e.g. David Smith"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Relationship
              </label>
              <div className="relative" ref={relationshipDropdownRef}>
                <button
                  type="button"
                  onClick={toggleRelationshipDropdown}
                  onKeyDown={handleRelationshipDropdownKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={isRelationshipDropdownOpen}
                  aria-controls="gift-relationship-listbox"
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all shadow-2xs text-left ${
                    isRelationshipDropdownOpen
                      ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedRelationship.label}</span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md shrink-0 ${selectedRelationship.badgeClass}`}
                    >
                      {selectedRelationship.badge}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isRelationshipDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Panel with Smart Placement (Up/Down) */}
                {isRelationshipDropdownOpen && (
                  <div
                    id="gift-relationship-listbox"
                    role="listbox"
                    aria-label="Recipient Relationship"
                    className={`absolute left-0 right-0 sm:left-auto sm:right-0 ${
                      openRelationshipUpwards ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
                    } w-full sm:w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 animate-fadeIn max-h-[340px] overflow-y-auto`}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Select Relationship</span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          HMRC Form IHT403
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Relationship of recipient to deceased or donor:
                      </p>
                    </div>

                    <div className="space-y-1">
                      {GIFT_RELATIONSHIPS.map((rel) => {
                        const isSelected = relationship === rel.id;
                        return (
                          <button
                            key={rel.id}
                            ref={isSelected ? selectedRelationshipOptionRef : undefined}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setRelationship(rel.id);
                              setIsRelationshipDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all group flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-200 text-blue-900 ring-1 ring-blue-400/40'
                                : 'border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                  {rel.label}
                                </span>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${rel.badgeClass}`}
                                >
                                  {rel.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {rel.description}
                              </p>
                            </div>
                            {isSelected ? (
                              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-all group-hover:translate-x-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gift Amount (£)
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 font-medium text-xs sm:text-sm">£</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,]*"
                  placeholder="50,000"
                  value={amountStr}
                  onKeyDown={handleAmountKeyDown}
                  onChange={handleAmountChange}
                  required
                  className="w-full text-sm rounded-lg border border-slate-300 pl-7 pr-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
                />
              </div>
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

            {relationship === 'spouse' && (
              <div className="sm:col-span-2 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Spouse Exemption (Section 18 IHTA 1984):</strong> Lifetime gifts between spouses or civil partners are 100% exempt from UK Inheritance Tax with no 7-year clock.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gift Category / Exemption
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={toggleDropdown}
                  onKeyDown={handleDropdownKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-controls="gift-category-listbox"
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all shadow-2xs text-left ${
                    isDropdownOpen
                      ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedCategory.title}</span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md shrink-0 ${selectedCategory.badgeClass}`}
                    >
                      {selectedCategory.badge}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Panel with Smart Placement (Up/Down) */}
                {isDropdownOpen && (
                  <div
                    id="gift-category-listbox"
                    role="listbox"
                    aria-label="Gift Category or Exemption"
                    className={`absolute left-0 right-0 sm:right-auto ${
                      openUpwards ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
                    } w-full sm:w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 animate-fadeIn max-h-[360px] overflow-y-auto`}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Select Statutory Exemption Category</span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          HMRC Rules
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Choose the statutory exemption applying to this gift:
                      </p>
                    </div>

                    <div className="space-y-1">
                      {GIFT_CATEGORIES.map((cat) => {
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            ref={isSelected ? selectedOptionRef : undefined}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setCategory(cat.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all group flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-200 text-blue-900 ring-1 ring-blue-400/40'
                                : 'border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                  {cat.title}
                                </span>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${cat.badgeClass}`}
                                >
                                  {cat.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {cat.description}
                              </p>
                            </div>
                            {isSelected ? (
                              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-all group-hover:translate-x-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {editingGiftId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              >
                Discard Changes
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {editingGiftId ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Update Gift
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Save Gift
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Streamlined Gifts List with Tooltips & Audit Drawers */}
      {gifts.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Gift & Recipient</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Relief & NRB</th>
                  <th className="py-2.5 px-3 text-right">Est. Tax</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gifts.map((g) => {
                  const res = resultsMap.get(g.id);
                  const isExpanded = expandedGiftId === g.id;
                  const catOption =
                    GIFT_CATEGORIES.find((c) => c.id === g.category) || GIFT_CATEGORIES[0];
                  const isExempt = res
                    ? res.taperReliefPercent === 100 || res.chargeableAmount === 0
                    : false;
                  const isEditingThis = editingGiftId === g.id;

                  return (
                    <React.Fragment key={g.id}>
                      <tr
                        className={`transition-colors cursor-pointer ${
                          isEditingThis
                            ? 'bg-blue-50/90 ring-1 ring-blue-400'
                            : isExpanded
                            ? 'bg-slate-50/90'
                            : 'hover:bg-slate-50/70'
                        }`}
                        onClick={(e) => {
                          // Prevent expanding if clicking an action button
                          if ((e.target as HTMLElement).closest('button')) return;
                          toggleExpand(g.id);
                        }}
                      >
                        {/* 1. Gift & Recipient */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900">{g.recipient}</span>
                            {g.relationship && (
                              <span
                                className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded-md"
                                title={`Relationship to deceased: ${
                                  RELATIONSHIP_LABELS[g.relationship] || g.relationship
                                }`}
                              >
                                {RELATIONSHIP_LABELS[g.relationship] || g.relationship}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${catOption.badgeClass}`}
                              title={catOption.description}
                            >
                              {catOption.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>{g.date}</span>
                            {res && (
                              <>
                                <span>•</span>
                                <span>{res.yearsBeforeDeath} yrs ago</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* 2. Amount */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-semibold text-slate-900 tabular-nums font-mono">
                            £{g.amount.toLocaleString('en-GB')}
                          </div>
                          {res && res.exemptAmount > 0 && (
                            <div
                              className="text-[10px] text-emerald-700 font-medium"
                              title={`£${res.exemptAmount.toLocaleString('en-GB')} statutory exemption applied under HMRC rules`}
                            >
                              Exempt: £{res.exemptAmount.toLocaleString('en-GB')}
                            </div>
                          )}
                        </td>

                        {/* 3. Relief & NRB Status Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {res ? (
                            isExempt ? (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800"
                                title="100% exempt from Inheritance Tax under statutory rules."
                              >
                                Exempt (0%)
                              </span>
                            ) : res.excessOverNRB > 0 ? (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                                title={`Exceeds NRB by £${res.excessOverNRB.toLocaleString('en-GB')}. ${res.taperReliefPercent}% taper applied (${Math.round(res.effectiveTaxRate * 100)}% effective tax rate).`}
                              >
                                {res.taperReliefPercent}% Taper
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                                title={`Fully shielded by £${res.usedNRB.toLocaleString('en-GB')} of your £325k Nil-Rate Band.`}
                              >
                                NRB: £{res.usedNRB.toLocaleString('en-GB')}
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* 4. Est. Tax */}
                        <td className="py-2.5 px-3 text-right tabular-nums font-mono">
                          {res && res.taxDue > 0 ? (
                            <div>
                              <span
                                className="text-red-600 font-bold"
                                title="Estimated tax payable by donee under Section 199 IHTA 1984"
                              >
                                £{res.taxDue.toLocaleString('en-GB')}
                              </span>
                              <div className="text-[9px] text-slate-400 font-sans">donee</div>
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-medium">£0</span>
                          )}
                        </td>

                        {/* 5. Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => toggleExpand(g.id)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isExpanded
                                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                                  : 'border-transparent text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                              }`}
                              title={
                                isExpanded
                                  ? 'Hide statutory calculation breakdown'
                                  : 'View statutory calculation breakdown'
                              }
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-blue-600' : ''
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(g)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit gift details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(g)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Duplicate gift"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(g.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Remove gift"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Statutory Calculation Audit Drawer */}
                      {isExpanded && res && (
                        <tr className="bg-blue-50/30 border-b border-blue-100 animate-fadeIn">
                          <td colSpan={5} className="p-3">
                            <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between text-xs font-bold text-blue-950 pb-1.5 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Statutory Calculation Audit (IHTA 1984)</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-normal flex items-center gap-1.5 flex-wrap justify-end">
                                  <span className="font-medium text-slate-700">
                                    {g.recipient} {g.relationship ? `(${RELATIONSHIP_LABELS[g.relationship] || g.relationship})` : ''}
                                  </span>
                                  <span>•</span>
                                  <span>{CATEGORY_LABELS[g.category]}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                                    Gross Gift
                                  </span>
                                  <span className="font-bold text-slate-900 font-mono">
                                    £{g.amount.toLocaleString('en-GB')}
                                  </span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                                    Exempt Amount
                                  </span>
                                  <span className="font-bold text-emerald-700 font-mono">
                                    £{res.exemptAmount.toLocaleString('en-GB')}
                                  </span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                                    Chargeable PET
                                  </span>
                                  <span className="font-bold text-slate-900 font-mono">
                                    £{res.chargeableAmount.toLocaleString('en-GB')}
                                  </span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                                    NRB Absorbed
                                  </span>
                                  <span className="font-bold text-blue-700 font-mono">
                                    £{res.usedNRB.toLocaleString('en-GB')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <div>
                                  <span className="font-medium text-slate-700">Survivorship: </span>
                                  {res.yearsBeforeDeath} years elapsed •{' '}
                                  <span className="font-medium text-slate-700">Taper Relief: </span>
                                  {res.taperReliefPercent}% (
                                  {Math.round(res.effectiveTaxRate * 100)}% effective tax)
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700">Tax Due: </span>
                                  <span
                                    className={
                                      res.taxDue > 0
                                        ? 'font-bold text-red-600 font-mono'
                                        : 'font-bold text-emerald-700 font-mono'
                                    }
                                  >
                                    £{res.taxDue.toLocaleString('en-GB')}
                                  </span>
                                  {res.taxDue > 0 && (
                                    <span className="text-[10px] text-slate-500 ml-1">
                                      (payable by donee)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
