import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoffeeChallengeRepository } from '../data/repository';
import type { PremiumStatus } from '../domain/models';
import { purchasePremiumPlan, restorePendingPremiumOrders } from './premiumService';
import { completeIapProductGrant, createIapOrder, getPendingIapOrders } from './appsInToss';
import type { KeyValueStore } from './storage/types';

vi.mock('./appsInToss', async () => {
  const actual = await vi.importActual<typeof import('./appsInToss')>('./appsInToss');
  return {
    ...actual,
    createIapOrder: vi.fn(),
    completeIapProductGrant: vi.fn(),
    getPendingIapOrders: vi.fn(),
  };
});

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

const mockedCreateIapOrder = vi.mocked(createIapOrder);
const mockedCompleteGrant = vi.mocked(completeIapProductGrant);
const mockedGetPendingOrders = vi.mocked(getPendingIapOrders);

describe('premiumService rollback paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rolls back newly granted premium when grant confirmation fails', async () => {
    const repository = new CoffeeChallengeRepository(new MemoryStore());
    mockedCreateIapOrder.mockResolvedValue({
      orderId: 'order-1',
      sku: 'premium_30d',
      displayName: '30일 이용권',
      displayAmount: '1,900원',
      amount: 1900,
      currency: 'KRW',
    });
    mockedCompleteGrant.mockResolvedValue(false);

    await expect(
      purchasePremiumPlan({
        repository,
        userKey: 'u1',
        plan: '30d',
      }),
    ).rejects.toThrow('PRODUCT_GRANT_NOT_CONFIRMED');

    const status = await repository.getPremiumStatus('u1');
    expect(status).toBeNull();
  });

  it('restores previous status when pending grant confirmation fails', async () => {
    const repository = new CoffeeChallengeRepository(new MemoryStore());
    const previous: PremiumStatus = {
      userKey: 'u1',
      is_premium: false,
    };

    await repository.savePremiumStatus(previous);
    mockedGetPendingOrders.mockResolvedValue([
      {
        orderId: 'pending-1',
        sku: 'premium_30d',
        paymentCompletedDate: '2026-03-01T00:00:00.000Z',
      },
    ]);
    mockedCompleteGrant.mockResolvedValue(false);

    await expect(
      restorePendingPremiumOrders({
        repository,
        userKey: 'u1',
      }),
    ).rejects.toThrow('PRODUCT_GRANT_NOT_CONFIRMED');

    const status = await repository.getPremiumStatus('u1');
    expect(status).toEqual(previous);
  });
});
