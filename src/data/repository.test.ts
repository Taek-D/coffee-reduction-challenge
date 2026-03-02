import { describe, expect, it } from 'vitest';
import { CoffeeChallengeRepository } from './repository';
import type { KeyValueStore } from '../infra/storage/types';

class MemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.map.delete(key);
  }

  async getKeysByPrefix(prefix: string): Promise<string[]> {
    return [...this.map.keys()].filter((key) => key.startsWith(prefix));
  }
}

describe('CoffeeChallengeRepository', () => {
  it('stores entries with userKey-prefixed index', async () => {
    const repository = new CoffeeChallengeRepository(new MemoryStore());

    await repository.upsertEntry('u1', '2026-03-01', { coffee_count: 1, unit_amount: 4500 });
    await repository.upsertEntry('u1', '2026-03-02', { coffee_count: 2, unit_amount: 4500 });
    const entries = await repository.listEntriesForMonth('u1', '2026-03');

    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.date)).toEqual(['2026-03-01', '2026-03-02']);
  });

  it('clears only current user data', async () => {
    const repository = new CoffeeChallengeRepository(new MemoryStore());

    await repository.upsertEntry('u1', '2026-03-01', { coffee_count: 1, unit_amount: 4500 });
    await repository.upsertEntry('u2', '2026-03-01', { coffee_count: 2, unit_amount: 4500 });

    await repository.clearUserData('u1');

    const u1 = await repository.listEntriesForMonth('u1', '2026-03');
    const u2 = await repository.listEntriesForMonth('u2', '2026-03');

    expect(u1).toHaveLength(0);
    expect(u2).toHaveLength(1);
  });
});
