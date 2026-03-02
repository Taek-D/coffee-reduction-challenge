import type { BaselineVersion, Entry } from './models';

export interface DailyCalculationInput {
  coffeeCount: number;
  unitAmount: number;
  baselineAvgPerDay: number;
  baselineUnitAmount: number;
}

export interface DailyCalculationResult {
  expectedDaily: number;
  actualDaily: number;
  savingDaily: number;
  overspendDaily: number;
}

export interface MonthlySummary {
  totalRecordDays: number;
  totalCoffeeCount: number;
  totalSavingDays: number;
  savingAmount: number;
}

export function calculateDailyMetrics(
  input: DailyCalculationInput,
): DailyCalculationResult {
  const expectedDaily = input.baselineAvgPerDay * input.baselineUnitAmount;
  const actualDaily = input.coffeeCount * input.unitAmount;
  const savingDaily = Math.max(0, expectedDaily - actualDaily);
  const overspendDaily = Math.max(0, actualDaily - expectedDaily);

  return {
    expectedDaily,
    actualDaily,
    savingDaily,
    overspendDaily,
  };
}

export function calculateMonthlySummary(
  entries: Entry[],
  resolveBaseline: (date: string) => BaselineVersion | null,
): MonthlySummary {
  return entries.reduce<MonthlySummary>(
    (acc, entry) => {
      const baseline = resolveBaseline(entry.date);
      if (!baseline) {
        return acc;
      }

      const daily = calculateDailyMetrics({
        coffeeCount: entry.coffee_count,
        unitAmount: entry.unit_amount,
        baselineAvgPerDay: baseline.avg_per_day,
        baselineUnitAmount: baseline.unit_amount,
      });

      return {
        totalRecordDays: acc.totalRecordDays + 1,
        totalCoffeeCount: acc.totalCoffeeCount + entry.coffee_count,
        totalSavingDays: acc.totalSavingDays + (daily.savingDaily > 0 ? 1 : 0),
        savingAmount: acc.savingAmount + daily.savingDaily,
      };
    },
    {
      totalRecordDays: 0,
      totalCoffeeCount: 0,
      totalSavingDays: 0,
      savingAmount: 0,
    },
  );
}
