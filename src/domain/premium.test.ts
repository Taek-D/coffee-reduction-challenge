import { describe, expect, it } from 'vitest';
import { buildGrantedPremiumStatus, isPremiumActive, resolvePremiumPlanBySku } from './premium';

describe('premium helpers', () => {
  it('resolves plans by sku', () => {
    expect(resolvePremiumPlanBySku('premium_30d')).toBe('30d');
    expect(resolvePremiumPlanBySku('premium_365d')).toBe('365d');
    expect(resolvePremiumPlanBySku('unknown')).toBeNull();
  });

  it('extends from existing expiry when currently premium', () => {
    const now = new Date('2026-03-01T00:00:00.000Z');
    const current = {
      userKey: 'u1',
      is_premium: true,
      plan: '30d' as const,
      expires_at: '2026-03-10T00:00:00.000Z',
      last_order_id: 'old-order',
    };

    const next = buildGrantedPremiumStatus({
      current,
      userKey: 'u1',
      plan: '30d',
      orderId: 'new-order',
      now,
    });

    expect(next.expires_at).toBe('2026-04-09T00:00:00.000Z');
    expect(next.last_order_id).toBe('new-order');
    expect(isPremiumActive(next, now)).toBe(true);
  });
});
