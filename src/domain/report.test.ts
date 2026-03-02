import { describe, expect, it } from 'vitest';
import { calculateReportMetrics } from './report';
import type { BaselineVersion, Entry } from './models';

describe('calculateReportMetrics', () => {
  it('aggregates spend/saving/overspend for entries with baseline', () => {
    const entries: Entry[] = [
      {
        id: 'e1',
        userKey: 'u1',
        date: '2026-03-01',
        coffee_count: 0,
        unit_amount: 4500,
      },
      {
        id: 'e2',
        userKey: 'u1',
        date: '2026-03-02',
        coffee_count: 3,
        unit_amount: 4500,
      },
    ];

    const baseline: BaselineVersion = {
      userKey: 'u1',
      effective_from: '2026-01-01',
      avg_per_day: 1,
      unit_amount: 4500,
    };

    const metrics = calculateReportMetrics(entries, () => baseline);

    expect(metrics.totalRecordDays).toBe(2);
    expect(metrics.totalCoffeeCount).toBe(3);
    expect(metrics.totalSpendAmount).toBe(13500);
    expect(metrics.totalExpectedAmount).toBe(9000);
    expect(metrics.totalSavingAmount).toBe(4500);
    expect(metrics.totalOverspendAmount).toBe(9000);
  });
});
