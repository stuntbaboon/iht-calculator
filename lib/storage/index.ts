import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { SavedCalculationRecord, EstateState } from '@/types/iht';
import { calculateInheritanceTax } from '@/lib/calculator';

const DATA_DIR = path.join(process.cwd(), '.data', 'calculations');
const DEFAULT_EXPIRATION_TTL = 7_776_000; // 90 days in seconds

/**
 * Generates an 8-character URL-safe alphanumeric slug
 */
export function generateSlug(): string {
  return crypto.randomBytes(6).toString('base64url').replace(/[-_]/g, 'x').slice(0, 8);
}

/**
 * Storage interface for persisting calculations
 */
export interface StorageAdapter {
  get(id: string): Promise<SavedCalculationRecord | null>;
  set(record: SavedCalculationRecord): Promise<void>;
}

/**
 * Cloudflare KV binding interface
 */
export interface CloudflareKVBinding {
  get(key: string, type: 'json' | 'text'): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Detects if a Cloudflare KV namespace binding is present in the runtime
 */
function getCloudflareKVBinding(): CloudflareKVBinding | null {
  const g = globalThis as unknown as { CALCULATIONS_KV?: CloudflareKVBinding };
  if (typeof g.CALCULATIONS_KV?.get === 'function') {
    return g.CALCULATIONS_KV;
  }
  const p = process.env as unknown as { CALCULATIONS_KV?: CloudflareKVBinding };
  if (typeof p.CALCULATIONS_KV?.get === 'function') {
    return p.CALCULATIONS_KV;
  }
  return null;
}

/**
 * Adapter for Cloudflare KV Edge Namespace bindings
 */
export class CloudflareKVBindingAdapter implements StorageAdapter {
  constructor(private kv: CloudflareKVBinding) {}

  async get(id: string): Promise<SavedCalculationRecord | null> {
    try {
      const res = await this.kv.get(id, 'json');
      return res as SavedCalculationRecord | null;
    } catch {
      return null;
    }
  }

  async set(record: SavedCalculationRecord): Promise<void> {
    await this.kv.put(record.id, JSON.stringify(record), {
      expirationTtl: DEFAULT_EXPIRATION_TTL,
    });
  }
}

/**
 * Adapter for Cloudflare KV via REST API (useful for preview environments or external workers)
 */
export class CloudflareKVRestAdapter implements StorageAdapter {
  constructor(
    private accountId: string,
    private namespaceId: string,
    private apiToken: string
  ) {}

  async get(id: string): Promise<SavedCalculationRecord | null> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${id}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Cloudflare KV fetch error: ${res.statusText}`);
    return (await res.json()) as SavedCalculationRecord;
  }

  async set(record: SavedCalculationRecord): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${record.id}?expiration_ttl=${DEFAULT_EXPIRATION_TTL}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error(`Cloudflare KV put error: ${res.statusText}`);
  }
}

/**
 * Lightweight file-based local storage adapter for offline development and testing.
 */
export class FileStorageAdapter implements StorageAdapter {
  private async ensureDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
      // directory already exists
    }
  }

  private getFilePath(id: string): string {
    const safeId = id.replace(/[^a-zA-Z0-9]/g, '');
    return path.join(DATA_DIR, `${safeId}.json`);
  }

  async get(id: string): Promise<SavedCalculationRecord | null> {
    try {
      const filePath = this.getFilePath(id);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as SavedCalculationRecord;
    } catch {
      return null;
    }
  }

  async set(record: SavedCalculationRecord): Promise<void> {
    await this.ensureDir();
    const filePath = this.getFilePath(record.id);
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(record, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
  }
}

/**
 * Hybrid Storage Adapter:
 * Automatically selects Cloudflare KV binding in production,
 * Cloudflare KV REST API if credentials exist,
 * or local filesystem storage in dev/test.
 */
export class HybridStorageAdapter implements StorageAdapter {
  private fileAdapter = new FileStorageAdapter();

  private getActiveAdapter(): StorageAdapter {
    const kvBinding = getCloudflareKVBinding();
    if (kvBinding) {
      return new CloudflareKVBindingAdapter(kvBinding);
    }

    if (
      process.env.CF_ACCOUNT_ID &&
      process.env.CF_KV_NAMESPACE_ID &&
      process.env.CF_API_TOKEN
    ) {
      return new CloudflareKVRestAdapter(
        process.env.CF_ACCOUNT_ID,
        process.env.CF_KV_NAMESPACE_ID,
        process.env.CF_API_TOKEN
      );
    }

    return this.fileAdapter;
  }

  async get(id: string): Promise<SavedCalculationRecord | null> {
    return this.getActiveAdapter().get(id);
  }

  async set(record: SavedCalculationRecord): Promise<void> {
    return this.getActiveAdapter().set(record);
  }
}

// Active storage adapter instance
export const calculationStorage: StorageAdapter = new HybridStorageAdapter();

/**
 * Saves a new or updated calculation record
 */
export async function saveCalculation(
  state: Partial<EstateState>,
  title?: string,
  existingId?: string
): Promise<SavedCalculationRecord> {
  const id = existingId || generateSlug();
  const now = new Date().toISOString();
  const breakdown = calculateInheritanceTax(state);

  const fullState = {
    ...state,
  } as EstateState;

  const record: SavedCalculationRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    title: title || 'UK Inheritance Tax Calculation',
    state: fullState,
    breakdown,
  };

  await calculationStorage.set(record);
  return record;
}

/**
 * Retrieves a saved calculation by its slug
 */
export async function getCalculation(id: string): Promise<SavedCalculationRecord | null> {
  return calculationStorage.get(id);
}
