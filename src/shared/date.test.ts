import { describe, expect, it } from 'vitest';
import { formatDateIso, getMonthFromDate, toDateKey } from './date';

describe('date utilities', () => {
  it('keeps date-only strings stable without timezone drift', () => {
    expect(formatDateIso('2026-03-01')).toBe('2026-03-01');
    expect(getMonthFromDate(toDateKey('2026-03-01'))).toBe('2026-03');
  });

  it('formats Date inputs in local calendar date', () => {
    const localDate = new Date(2026, 2, 1, 23, 59, 59);
    expect(formatDateIso(localDate)).toBe('2026-03-01');
  });
});
