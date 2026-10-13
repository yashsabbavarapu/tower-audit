import { kv } from "@vercel/kv";
import type { AuditEntry, QueueItem } from "./control/types";
import { buildSeed } from "./control/seed";

/**
 * Storage adapter. Vercel KV when KV_REST_API_URL / KV_REST_API_TOKEN are set;
 * otherwise an in-memory Map (dev/preview, resets on cold start). Both seed once
 * with sample rows, each tagged `sample: true`.
 */
export interface Store {
  readonly kind: "kv" | "memory";
  listItems(): Promise<QueueItem[]>;
  getItem(id: string): Promise<QueueItem | null>;
  putItem(item: QueueItem): Promise<void>;
  listAudit(): Promise<AuditEntry[]>;
  appendAudit(entry: AuditEntry): Promise<void>;
}

const byNewest = <T>(rows: T[], key: (row: T) => string) => rows.sort((a, b) => key(b).localeCompare(key(a)));

class MemoryStore implements Store {
  readonly kind = "memory" as const;
  private items = new Map<string, QueueItem>();
  private audit: AuditEntry[] = [];
  private ready: Promise<void>;

  constructor() {
    this.ready = buildSeed().then((seed) => {
      for (const item of seed.items) this.items.set(item.id, item);
      this.audit.push(...seed.audit);
    });
  }

  async listItems() {
    await this.ready;
    return byNewest(Array.from(this.items.values()), (i) => i.submitted_at);
  }
  async getItem(id: string) {
    await this.ready;
    return this.items.get(id) ?? null;
  }
  async putItem(item: QueueItem) {
    await this.ready;
    this.items.set(item.id, item);
  }
  async listAudit() {
    await this.ready;
    return byNewest([...this.audit], (e) => e.at);
  }
  async appendAudit(entry: AuditEntry) {
    await this.ready;
    this.audit.push(entry);
  }
}

const ITEMS_KEY = "tower:items";
const AUDIT_KEY = "tower:audit";
const SEEDED_KEY = "tower:seeded";

type Kv = typeof import("@vercel/kv").kv;

class KvStore implements Store {
  readonly kind = "kv" as const;
  private ready: Promise<void>;

  constructor(private kv: Kv) {
    this.ready = this.seedOnce();
  }

  private async seedOnce() {
    // SET NX: only the first deploy to reach an empty database seeds it.
    if ((await this.kv.set(SEEDED_KEY, "1", { nx: true })) === null) return;
    const seed = await buildSeed();
    await Promise.all([
      ...seed.items.map((item) => this.kv.hset(ITEMS_KEY, { [item.id]: item })),
      ...seed.audit.map((entry) => this.kv.lpush(AUDIT_KEY, entry)),
    ]);
  }

  async listItems() {
    await this.ready;
    const all = await this.kv.hgetall<Record<string, QueueItem>>(ITEMS_KEY);
    return byNewest(Object.values(all ?? {}), (i) => i.submitted_at);
  }
  async getItem(id: string) {
    await this.ready;
    return (await this.kv.hget<QueueItem>(ITEMS_KEY, id)) ?? null;
  }
  async putItem(item: QueueItem) {
    await this.ready;
    await this.kv.hset(ITEMS_KEY, { [item.id]: item });
  }
  async listAudit() {
    await this.ready;
    return byNewest(await this.kv.lrange<AuditEntry>(AUDIT_KEY, 0, 499), (e) => e.at);
  }
  async appendAudit(entry: AuditEntry) {
    await this.ready;
    await this.kv.lpush(AUDIT_KEY, entry);
  }
}

export const kvConfigured = () => Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const g = globalThis as unknown as { __towerStore?: Store };

/** One store per server instance (survives dev hot reloads). */
export function getStore(): Store {
  if (!g.__towerStore) {
    if (kvConfigured()) {
      g.__towerStore = new KvStore(kv);
    } else {
      g.__towerStore = new MemoryStore();
    }
  }
  return g.__towerStore;
}
