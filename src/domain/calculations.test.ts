import { describe, expect, it } from 'vitest';
import { calculateDailyMetrics } from './calculations';

describe('calculateDailyMetrics', () => {
  it('computes expected/actual/saving/overspend using PRD formula', () => {
    const result = calculateDailyMetrics({
      baselineAvgPerDay: 1,
      baselineUnitAmount: 4500,
      coffeeCount: 0,
      unitAmount: 4500,
    });

    expect(result.expectedDaily).toBe(4500);
    expect(result.actualDaily).toBe(0);
    expect(result.savingDaily).toBe(4500);
    expect(result.overspendDaily).toBe(0);
  });
});
