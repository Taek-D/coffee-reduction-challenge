import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { calculateReportMetrics, type ReportMetrics } from '../domain/report';
import { isPremiumActive } from '../domain/premium';
import { track } from '../infra/analytics';
import { saveReportPdf } from '../infra/reportPdf';
import { getFreshPremiumStatus } from '../infra/premiumService';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { addMonths, currentMonthKey, getDaysInMonth } from '../shared/date';
import { formatCurrency } from '../shared/format';
import { resolveBaselineForDate, summarizeBaselinesForPeriod } from './reportUtils';

interface MonthlyReportState {
  metrics: ReportMetrics;
  baselineSummary: string;
  hasData: boolean;
}

const EMPTY_METRICS: ReportMetrics = {
  totalRecordDays: 0,
  totalCoffeeCount: 0,
  totalSpendAmount: 0,
  totalExpectedAmount: 0,
  totalSavingAmount: 0,
  totalOverspendAmount: 0,
  totalSavingDays: 0,
};

export function MonthlyReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month') ?? currentMonthKey();
  const navigate = useNavigate();
  const { activeUserKey, repository } = useAppContext();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<MonthlyReportState>({
    metrics: EMPTY_METRICS,
    baselineSummary: '기준치 정보 없음',
    hasData: false,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const premium = await getFreshPremiumStatus(repository, activeUserKey);
        if (!isPremiumActive(premium)) {
          navigate('/premium?entry=report_monthly', { replace: true });
          return;
        }

        const [entries, baselines] = await Promise.all([
          repository.listEntriesForMonth(activeUserKey, month),
          repository.getBaselines(activeUserKey),
        ]);
        const days = getDaysInMonth(month);
        const startDate = days[0];
        const endDate = days.at(-1) ?? `${month}-01`;
        const metrics = calculateReportMetrics(entries, (date) => resolveBaselineForDate(baselines, date));

        setState({
          metrics,
          baselineSummary: summarizeBaselinesForPeriod(baselines, startDate, endDate),
          hasData: metrics.totalRecordDays > 0,
        });
        track('report_view', { type: 'monthly', period: month });
      } catch {
        showToast('리포트를 불러오지 못했어요. 다시 시도해요.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [activeUserKey, month, navigate, repository, showToast]);

  const handlePdfSave = async () => {
    track('pdf_export_click', { period: month });
    try {
      const saveResult = await saveReportPdf({
        fileName: `coffee-report-${month}.pdf`,
        title: 'Coffee Reduction Monthly Report',
        periodLabel: month,
        metrics: state.metrics,
        baselineSummary: state.baselineSummary,
      });
      if (saveResult.mode === 'native') {
        track('pdf_export_success', { period: month });
        showToast('PDF를 저장했어요.');
      } else {
        track('pdf_export_fallback', { period: month, mode: saveResult.mode });
        showToast('PDF 다운로드를 시작했어요. 저장 여부를 확인해 주세요.');
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown';
      track('pdf_export_fail', { reason });
      showToast('PDF 저장에 실패했어요. 다시 시도해요.');
    }
  };

  if (loading) {
    return (
      <section className="screen">
        <div className="skeleton-box">리포트를 불러오는 중이에요...</div>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>월간 고급 리포트</h1>
      <div className="actions horizontal">
        <Button
          color="light"
          variant="weak"
          onClick={() => setSearchParams({ month: addMonths(month, -1) })}
        >
          이전 달
        </Button>
        <Button
          color="light"
          variant="weak"
          onClick={() => setSearchParams({ month: addMonths(month, 1) })}
        >
          다음 달
        </Button>
      </div>

      <div className="card">
        <h2>{month}</h2>
        {!state.hasData && <p className="muted">기록이 더 쌓이면 분석이 정확해져요.</p>}
        <p>총 지출 {formatCurrency(state.metrics.totalSpendAmount)}</p>
        <p>기준치 대비 절감 {formatCurrency(state.metrics.totalSavingAmount)}</p>
        <p>기준치 대비 초과 지출 {formatCurrency(state.metrics.totalOverspendAmount)}</p>
        <p>기록일 {state.metrics.totalRecordDays}일</p>
        <p>절감일 {state.metrics.totalSavingDays}일</p>
        <p className="muted">절감 추정 근거: {state.baselineSummary}</p>
        <p className="muted">기록 기반 추정</p>
      </div>

      <div className="actions horizontal">
        <Button color="primary" onClick={handlePdfSave}>
          PDF로 저장하기
        </Button>
        <Link
          to={`/report/quarterly?year=${month.slice(0, 4)}&quarter=${Math.floor((Number(month.slice(5, 7)) - 1) / 3) + 1}`}
          className="btn secondary"
        >
          분기 리포트
        </Link>
      </div>
    </section>
  );
}
