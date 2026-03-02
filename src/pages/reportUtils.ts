import type { BaselineVersion } from '../domain/models';

export const resolveBaselineForDate = (
  baselines: BaselineVersion[],
  date: string,
): BaselineVersion | null => {
  const filtered = baselines.filter((item) => item.effective_from <= date);
  return filtered.at(-1) ?? null;
};

export const summarizeBaselinesForPeriod = (
  baselines: BaselineVersion[],
  startDate: string,
  endDate: string,
): string => {
  if (baselines.length === 0) {
    return '기준이 없어요.';
  }

  const inPeriod = baselines.filter(
    (item) => item.effective_from >= startDate && item.effective_from <= endDate,
  );
  const latestBeforeStart = baselines
    .filter((item) => item.effective_from <= startDate)
    .at(-1);

  const candidate = inPeriod.at(-1) ?? latestBeforeStart ?? baselines.at(-1);

  if (!candidate) {
    return '기준이 없어요.';
  }

  const changedCount = inPeriod.length;
  return `기간 내 기준 변경 ${changedCount}회, 최신 기준 하루 ${candidate.avg_per_day}잔 / ${candidate.unit_amount}원`;
};

export const toQuarterLabel = (year: number, quarter: number): string => `${year}년 ${quarter}분기`;

export const getQuarterMonths = (year: number, quarter: number): string[] => {
  const startMonth = (quarter - 1) * 3 + 1;
  return Array.from({ length: 3 }, (_, index) => {
    const month = `${startMonth + index}`.padStart(2, '0');
    return `${year}-${month}`;
  });
};

export const getQuarterRange = (year: number, quarter: number): { start: string; end: string } => {
  const months = getQuarterMonths(year, quarter);
  const start = `${months[0]}-01`;
  const endMonth = months[2];
  const endDate = new Date(year, Number(endMonth.slice(5, 7)), 0).getDate();
  return {
    start,
    end: `${endMonth}-${`${endDate}`.padStart(2, '0')}`,
  };
};
