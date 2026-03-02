import { calculateDailyMetrics } from './calculations';
import type { BaselineVersion, Entry } from './models';

export interface ReportMetrics {
  totalRecordDays: number;
  totalCoffeeCount: number;
  totalSpendAmount: number;
  totalExpectedAmount: number;
  totalSavingAmount: number;
  totalOverspendAmount: number;
  totalSavingDays: number;
}

export function calculateReportMetrics(
  entries: Entry[],
  resolveBaseline: (date: string) => BaselineVersion | null,
): ReportMetrics {
  return entries.reduce<ReportMetrics>(
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
        totalSpendAmount: acc.totalSpendAmount + daily.actualDaily,
        totalExpectedAmount: acc.totalExpectedAmount + daily.expectedDaily,
        totalSavingAmount: acc.totalSavingAmount + daily.savingDaily,
        totalOverspendAmount: acc.totalOverspendAmount + daily.overspendDaily,
        totalSavingDays: acc.totalSavingDays + (daily.savingDaily > 0 ? 1 : 0),
      };
    },
    {
      totalRecordDays: 0,
      totalCoffeeCount: 0,
      totalSpendAmount: 0,
      totalExpectedAmount: 0,
      totalSavingAmount: 0,
      totalOverspendAmount: 0,
      totalSavingDays: 0,
    },
  );
}
