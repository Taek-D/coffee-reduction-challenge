import type { ReportMetrics } from '../domain/report';
import { formatCurrency } from '../shared/format';
import { createSimplePdfBase64 } from '../shared/simplePdf';
import { saveBase64File, type SaveBase64FileResult } from './appsInToss';

export const saveReportPdf = async (params: {
  fileName: string;
  title: string;
  periodLabel: string;
  metrics: ReportMetrics;
  baselineSummary: string;
}): Promise<SaveBase64FileResult> => {
  const { fileName, title, periodLabel, metrics, baselineSummary } = params;
  const lines = [
    title,
    `Period: ${periodLabel}`,
    '',
    `Record days: ${metrics.totalRecordDays} days`,
    `Coffee count: ${metrics.totalCoffeeCount}`,
    `Actual spend: ${formatCurrency(metrics.totalSpendAmount)}`,
    `Expected spend: ${formatCurrency(metrics.totalExpectedAmount)}`,
    `Estimated saving: ${formatCurrency(metrics.totalSavingAmount)}`,
    `Estimated overspend: ${formatCurrency(metrics.totalOverspendAmount)}`,
    '',
    `Baseline summary: ${baselineSummary}`,
    'This report is estimated from your recorded entries.',
  ];

  const base64Pdf = createSimplePdfBase64(lines);
  return saveBase64File({
    data: base64Pdf,
    fileName,
    mimeType: 'application/pdf',
  });
};
