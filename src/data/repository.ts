import { calculateMonthlySummary, type MonthlySummary } from '../domain/calculations';
import {
  DEFAULT_UNIT_AMOUNT,
  MAX_DAILY_COFFEE_COUNT,
  type BaselineVersion,
  type Entry,
  type Goal,
  type PremiumStatus,
} from '../domain/models';
import { userStorageKeys } from '../domain/storageKeys';
import type { KeyValueStore } from '../infra/storage/types';
import { getDaysInMonth, getMonthFromDate } from '../shared/date';

const parseJson = <T>(raw: string | null): T | null => {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const toEntryId = (userKey: string, date: string): string => `${userKey}:${date}:coffee`;

export class CoffeeChallengeRepository {
  private readonly storage: KeyValueStore;

  constructor(storage: KeyValueStore) {
    this.storage = storage;
  }

  private async getEntryIndex(userKey: string): Promise<string[]> {
    const raw = parseJson<string[]>(await this.storage.getItem(userStorageKeys.entriesIndex(userKey)));
    if (!raw) {
      return [];
    }
    return [...new Set(raw)].sort();
  }

  private async setEntryIndex(userKey: string, dates: string[]): Promise<void> {
    await this.storage.setItem(userStorageKeys.entriesIndex(userKey), JSON.stringify(dates));
  }

  private async addDateToEntryIndex(userKey: string, date: string): Promise<void> {
    const index = await this.getEntryIndex(userKey);
    if (index.includes(date)) {
      return;
    }
    index.push(date);
    index.sort();
    await this.setEntryIndex(userKey, index);
  }

  private async removeDateFromEntryIndex(userKey: string, date: string): Promise<void> {
    const index = await this.getEntryIndex(userKey);
    if (!index.includes(date)) {
      return;
    }

    await this.setEntryIndex(
      userKey,
      index.filter((storedDate) => storedDate !== date),
    );
  }

  private async deleteEntry(userKey: string, date: string): Promise<void> {
    await Promise.all([
      this.storage.removeItem(userStorageKeys.entry(userKey, date)),
      this.removeDateFromEntryIndex(userKey, date),
    ]);
  }

  async getEntry(userKey: string, date: string): Promise<Entry | null> {
    const key = userStorageKeys.entry(userKey, date);
    const entry = parseJson<Entry>(await this.storage.getItem(key));
    if (!entry) {
      return null;
    }

    if (entry.coffee_count <= 0) {
      await this.deleteEntry(userKey, date);
      return null;
    }

    return entry;
  }

  async upsertEntry(
    userKey: string,
    date: string,
    next: Partial<Pick<Entry, 'coffee_count' | 'unit_amount'>>,
  ): Promise<Entry> {
    const existing = await this.getEntry(userKey, date);
    const entry: Entry = {
      id: toEntryId(userKey, date),
      userKey,
      date,
      coffee_count: existing?.coffee_count ?? 0,
      unit_amount: existing?.unit_amount ?? DEFAULT_UNIT_AMOUNT,
      ...next,
    };

    if (entry.coffee_count <= 0) {
      await this.deleteEntry(userKey, date);
      return entry;
    }

    await this.storage.setItem(userStorageKeys.entry(userKey, date), JSON.stringify(entry));
    await this.addDateToEntryIndex(userKey, date);
    return entry;
  }

  async adjustCoffeeCount(
    userKey: string,
    date: string,
    delta: number,
  ): Promise<Entry> {
    const existing = await this.getEntry(userKey, date);
    const current = existing?.coffee_count ?? 0;
    const nextCount = Math.max(0, Math.min(MAX_DAILY_COFFEE_COUNT, current + delta));
    return this.upsertEntry(userKey, date, { coffee_count: nextCount });
  }

  async setEntryUnitAmount(
    userKey: string,
    date: string,
    unitAmount: number,
  ): Promise<Entry> {
    return this.upsertEntry(userKey, date, { unit_amount: unitAmount });
  }

  async listEntriesForMonth(userKey: string, month: string): Promise<Entry[]> {
    const index = await this.getEntryIndex(userKey);
    const datesForMonth = index.filter((date) => getMonthFromDate(date) === month);
    const fallbackDates = getDaysInMonth(month).filter((date) => !datesForMonth.includes(date));
    const targetDates = [...datesForMonth, ...fallbackDates];

    const entries = await Promise.all(
      targetDates.map(async (date) =>
        parseJson<Entry>(await this.storage.getItem(userStorageKeys.entry(userKey, date))),
      ),
    );
    return entries.filter((entry): entry is Entry => entry !== null && entry.coffee_count > 0);
  }

  async getGoal(userKey: string): Promise<Goal | null> {
    return parseJson<Goal>(await this.storage.getItem(userStorageKeys.goal(userKey)));
  }

  async saveGoal(goal: Goal): Promise<void> {
    await this.storage.setItem(userStorageKeys.goal(goal.userKey), JSON.stringify(goal));
  }

  async getBaselines(userKey: string): Promise<BaselineVersion[]> {
    const baselines = parseJson<BaselineVersion[]>(
      await this.storage.getItem(userStorageKeys.baselines(userKey)),
    );
    if (!baselines) {
      return [];
    }
    return [...baselines].sort((a, b) => a.effective_from.localeCompare(b.effective_from));
  }

  async addBaselineVersion(version: BaselineVersion): Promise<void> {
    const baselines = await this.getBaselines(version.userKey);
    const filtered = baselines.filter((item) => item.effective_from !== version.effective_from);
    filtered.push(version);
    filtered.sort((a, b) => a.effective_from.localeCompare(b.effective_from));
    await this.storage.setItem(userStorageKeys.baselines(version.userKey), JSON.stringify(filtered));
  }

  async resolveBaselineForDate(
    userKey: string,
    date: string,
  ): Promise<BaselineVersion | null> {
    const baselines = await this.getBaselines(userKey);
    const candidates = baselines.filter((baseline) => baseline.effective_from <= date);
    if (candidates.length === 0) {
      return null;
    }
    return candidates[candidates.length - 1];
  }

  async getPremiumStatus(userKey: string): Promise<PremiumStatus | null> {
    return parseJson<PremiumStatus>(await this.storage.getItem(userStorageKeys.premium(userKey)));
  }

  async savePremiumStatus(status: PremiumStatus): Promise<void> {
    await this.storage.setItem(userStorageKeys.premium(status.userKey), JSON.stringify(status));
  }

  async clearPremiumStatus(userKey: string): Promise<void> {
    await this.storage.removeItem(userStorageKeys.premium(userKey));
  }

  async getMonthlySummary(userKey: string, month: string): Promise<MonthlySummary> {
    const entries = await this.listEntriesForMonth(userKey, month);
    const baselines = await this.getBaselines(userKey);

    return calculateMonthlySummary(entries, (date) => {
      const filtered = baselines.filter((baseline) => baseline.effective_from <= date);
      return filtered.at(-1) ?? null;
    });
  }

  async clearUserData(userKey: string): Promise<void> {
    const index = await this.getEntryIndex(userKey);
    const coreKeys = [
      userStorageKeys.goal(userKey),
      userStorageKeys.baselines(userKey),
      userStorageKeys.premium(userKey),
      userStorageKeys.entriesIndex(userKey),
    ];
    const entryKeys = index.map((date) => userStorageKeys.entry(userKey, date));
    await Promise.all([...coreKeys, ...entryKeys].map((key) => this.storage.removeItem(key)));

    // 이전 구현에서 인덱스 없이 저장된 키 정리를 위한 호환 제거.
    const legacyPrefix = userStorageKeys.entriesPrefix(userKey);
    const legacyKeys = await this.storage.getKeysByPrefix(legacyPrefix);
    await Promise.all(legacyKeys.map((key) => this.storage.removeItem(key)));
  }
}
