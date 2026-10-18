import { describe, it, expect } from 'vitest';
import {
  saveCalculation,
  getCalculation,
  generateSlug,
  CloudflareKVBindingAdapter,
  CloudflareKVBinding,
} from './index';
import { defaultEstateState, calculateInheritanceTax } from '@/lib/calculator';

describe('Serverless Storage Adapter', () => {
  it('generates an 8-character URL-safe alphanumeric slug', () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(8);
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('saves and retrieves an unauthenticated calculation state via default adapter', async () => {
    const testState = {
      ...defaultEstateState,
      mainResidenceValue: 650_000,
      cashAndSavings: 150_000,
    };

    const saved = await saveCalculation(testState, 'Test Estate');
    expect(saved.id).toBeDefined();
    expect(saved.id).toHaveLength(8);
    expect(saved.state.mainResidenceValue).toBe(650_000);
    expect(saved.breakdown.grossEstate).toBe(800_000);

    const retrieved = await getCalculation(saved.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(saved.id);
    expect(retrieved?.state.mainResidenceValue).toBe(650_000);
    expect(retrieved?.breakdown.grossEstate).toBe(800_000);
  });

  it('saves and retrieves using the Cloudflare KV binding adapter with 90-day TTL', async () => {
    const memoryStore = new Map<string, string>();
    let capturedTtl: number | undefined;

    const mockKV: CloudflareKVBinding = {
      async get(key: string, type: 'json' | 'text') {
        const val = memoryStore.get(key);
        if (!val) return null;
        return type === 'json' ? JSON.parse(val) : val;
      },
      async put(key: string, value: string, options?: { expirationTtl?: number }) {
        capturedTtl = options?.expirationTtl;
        memoryStore.set(key, value);
      },
      async delete(key: string) {
        memoryStore.delete(key);
      },
    };

    const kvAdapter = new CloudflareKVBindingAdapter(mockKV);
    const testRecord = {
      id: 'cf_test1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: defaultEstateState,
      breakdown: calculateInheritanceTax(defaultEstateState),
    };

    await kvAdapter.set(testRecord);
    expect(capturedTtl).toBe(7_776_000); // 90 days

    const retrieved = await kvAdapter.get('cf_test1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('cf_test1');

    const nonExistent = await kvAdapter.get('cf_nonexistent');
    expect(nonExistent).toBeNull();
  });

  it('returns null for non-existent calculation ID', async () => {
    const nonExistent = await getCalculation('nonexist');
    expect(nonExistent).toBeNull();
  });
});
