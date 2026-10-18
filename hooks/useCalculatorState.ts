'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { EstateState, CalculationBreakdown, LifetimeGift } from '@/types/iht';
import { calculateInheritanceTax, defaultEstateState } from '@/lib/calculator';

const LOCAL_STORAGE_KEY = 'uk_iht_calculator_state_v1';

export const SAMPLE_ESTATES: { name: string; description: string; state: EstateState }[] = [
  {
    name: 'Typical Family Homeowner',
    description: 'Married/widowed with £550k home passed to children, £250k savings, within the £1m allowance.',
    state: {
      ...defaultEstateState,
      maritalStatus: 'widowed',
      spouseUnusedNRBPercent: 100,
      spouseUnusedRNRBPercent: 100,
      mainResidenceValue: 550_000,
      mainResidenceMortgage: 0,
      passedToDirectDescendants: true,
      cashAndSavings: 180_000,
      quotedInvestments: 70_000,
      personalChattels: 20_000,
      funeralCosts: 4_500,
    },
  },
  {
    name: 'High-Value Estate (£2.4M) with Taper',
    description: 'Single individual with estate exceeding £2m, triggering the Residence Nil-Rate Band taper.',
    state: {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 1_200_000,
      mainResidenceMortgage: 0,
      passedToDirectDescendants: true,
      otherPropertiesValue: 500_000,
      cashAndSavings: 300_000,
      quotedInvestments: 400_000,
      personalChattels: 50_000,
      funeralCosts: 5_000,
    },
  },
  {
    name: 'Estate with 7-Year Gifts & Business Assets',
    description: 'Includes lifetime gifts under taper relief, BPR qualifying business shares, and a 10% charitable legacy.',
    state: {
      ...defaultEstateState,
      maritalStatus: 'single',
      mainResidenceValue: 600_000,
      passedToDirectDescendants: true,
      cashAndSavings: 200_000,
      bpr100Assets: 300_000, // 100% BPR
      lifeInsuranceNotInTrust: 150_000,
      charityDonationType: 'percentage',
      charityDonationValue: 10,
      funeralCosts: 5_000,
      gifts: [
        {
          id: 'gift-1',
          date: '2021-06-15',
          recipient: 'David Smith',
          relationship: 'child',
          amount: 250_000,
          category: 'potentially_exempt_transfer',
        },
        {
          id: 'gift-2',
          date: '2023-09-01',
          recipient: 'Emma Smith',
          relationship: 'child',
          amount: 5_000,
          category: 'wedding_child',
        },
      ],
    },
  },
];

export function useCalculatorState(initialState?: EstateState) {
  const [state, setState] = useState<EstateState>(initialState || defaultEstateState);

  // Hydrate from localStorage on client mount if no initialState was passed
  useEffect(() => {
    if (initialState) return;
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setState((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        console.error('Failed to load saved state from localStorage:', e);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [initialState]);

  // Auto-save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  // Compute breakdown reactively
  const breakdown: CalculationBreakdown = useMemo(() => {
    return calculateInheritanceTax(state);
  }, [state]);

  const updateField = useCallback(<K extends keyof EstateState>(field: K, value: EstateState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addGift = useCallback((gift: Omit<LifetimeGift, 'id'>) => {
    const newGift: LifetimeGift = {
      ...gift,
      id: `gift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      gifts: [...(prev.gifts || []), newGift],
    }));
  }, []);

  const removeGift = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      gifts: (prev.gifts || []).filter((g) => g.id !== id),
    }));
  }, []);

  const updateGift = useCallback((id: string, updated: Partial<LifetimeGift>) => {
    setState((prev) => ({
      ...prev,
      gifts: (prev.gifts || []).map((g) => (g.id === id ? { ...g, ...updated } : g)),
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultEstateState);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const loadSample = useCallback((sampleIndex: number) => {
    if (SAMPLE_ESTATES[sampleIndex]) {
      setState(SAMPLE_ESTATES[sampleIndex].state);
    }
  }, []);

  return {
    state,
    setState,
    breakdown,
    updateField,
    addGift,
    removeGift,
    updateGift,
    resetState,
    loadSample,
  };
}
