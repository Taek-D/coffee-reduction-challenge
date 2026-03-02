const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
});

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDateInput = (input: Date | string): Date => {
  if (input instanceof Date) {
    return input;
  }
  const match = DATE_ONLY_PATTERN.exec(input);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(input);
};

export const todayDateIso = (): string => {
  const now = new Date();
  return formatDateIso(now);
};

export const formatDateIso = (input: Date | string): string => {
  const date = parseDateInput(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toDateKey = (date: string): string => formatDateIso(date);

export const formatDateLabel = (date: string): string =>
  DATE_FORMATTER.format(parseDateInput(date));

export const monthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

export const currentMonthKey = (): string => monthKey(new Date());

export const getMonthFromDate = (date: string): string => date.slice(0, 7);

export const addMonths = (month: string, delta: number): string => {
  const [year, monthValue] = month.split('-').map(Number);
  const date = new Date(year, monthValue - 1 + delta, 1);
  return monthKey(date);
};

export const getDaysInMonth = (month: string): string[] => {
  const [year, monthValue] = month.split('-').map(Number);
  const days = new Date(year, monthValue, 0).getDate();
  const items: string[] = [];
  for (let day = 1; day <= days; day += 1) {
    items.push(`${month}-${`${day}`.padStart(2, '0')}`);
  }
  return items;
};
