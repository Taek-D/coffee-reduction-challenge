const KRW_FORMATTER = new Intl.NumberFormat('ko-KR');

export const formatCurrency = (amount: number): string => `${KRW_FORMATTER.format(amount)}원`;

export const parseNumberInput = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const value = Number(trimmed.replace(/,/g, ''));
  if (Number.isNaN(value)) {
    return null;
  }
  return value;
};
