import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { calculateReportMetrics, type ReportMetrics } from '../domain/report';
import { isPremiumActive } from '../domain/premium';
import { track } from '../infra/analytics';
import { saveReportPdf } from '../infra/reportPdf';
import { getFreshPremiumStatus } from '../infra/premiumService';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { formatCurrency } from '../shared/format';
import {
  getQuarterMonths,
  getQuarterRange,
  resolveBaselineForDate,
  summarizeBaselinesForPeriod,
  toQuarterLabel,
} from './reportUtils';

interface QuarterlyReportState {
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

const resolveInitialQuarter = (): { year: number; quarter: number } => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    quarter: Math.floor(today.getMonth() / 3) + 1,
  };
};

const normalizeQuarter = (yearRaw: string | null, quarterRaw: string | null): { year: number; quarter: number } => {
  const fallback = resolveInitialQuarter();
  const year = Number(yearRaw);
  const quarter = Number(quarterRaw);
  if (!Number.isFinite(year) || !Number.isFinite(quarter) || quarter < 1 || quarter > 4) {
    return fallback;
  }
  return { year, quarter };
};

const addQuarter = (year: number, quarter: number, delta: number): { year: number; quarter: number } => {
  const baseDate = new Date(year, (quarter - 1) * 3 + delta * 3, 1);
  return {
    year: baseDate.getFullYear(),
    quarter: Math.floor(baseDate.getMonth() / 3) + 1,
  };
};

export function QuarterlyReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeUserKey, repository } = useAppContext();
  const { showToast } = useToast();

  const resolved = useMemo(
    () => normalizeQuarter(searchParams.get('year'), searchParams.get('quarter')),
    [searchParams],
  );
  const { year, quarter } = resolved;

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<QuarterlyReportState>({
    metrics: EMPTY_METRICS,
    baselineSummary: '기준치 정보 없음',
    hasData: false,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const premium = await getFreshPremiumStatus(repository, activeUserKey);
      if (!isPremiumActive(premium)) {
        navigate('/premium?entry=report_quarterly', { replace: true });
        return;
      }

      const months = getQuarterMonths(year, quarter);
      const [monthEntries, baselines] = await Promise.all([
        Promise.all(months.map((month) => repository.listEntriesForMonth(activeUserKey, month))),
        repository.getBaselines(activeUserKey),
      ]);
      const entries = monthEntries.flat();
      const range = getQuarterRange(year, quarter);
      const metrics = calculateReportMetrics(entries, (date) => resolveBaselineForDate(baselines, date));

      setState({
        metrics,
        baselineSummary: summarizeBaselinesForPeriod(baselines, range.start, range.end),
        hasData: metrics.totalRecordDays > 0,
      });

      track('report_view', { type: 'quarterly', period: `${year}-Q${quarter}` });
      setLoading(false);
    };

    void load();
  }, [activeUserKey, quarter, repository, year, navigate]);

  const periodLabel = `${year}-Q${quarter}`;

  const handlePdfSave = async () => {
    track('pdf_export_click', { period: periodLabel });
    try {
      const saveResult = await saveReportPdf({
        fileName: `coffee-report-${periodLabel}.pdf`,
        title: 'Coffee Reduction Quarterly Report',
        periodLabel,
        metrics: state.metrics,
        baselineSummary: state.baselineSummary,
      });
      if (saveResult.mode === 'native') {
        track('pdf_export_success', { period: periodLabel });
        showToast('PDF를 저장했어요.');
      } else {
        track('pdf_export_fallback', { period: periodLabel, mode: saveResult.mode });
        showToast('PDF 다운로드를 시작했어요. 저장 여부를 확인해 주세요.');
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown';
      track('pdf_export_fail', { reason });
      showToast('PDF 저장에 실패했어요. 다시 시도해 주세요.');
    }
  };

  if (loading) {
    return (
      <section className="screen">
        <div className="skeleton-box">리포트를 불러오는 중이에요...</div>
      </section>
    );
  }

  const prev = addQuarter(year, quarter, -1);
  const next = addQuarter(year, quarter, 1);

  return (
    <section className="screen">
      <h1>분기 고급 리포트</h1>
      <div className="actions horizontal">
        <button
          type="button"
          className="btn secondary"
          onClick={() => setSearchParams({ year: String(prev.year), quarter: String(prev.quarter) })}
        >
          이전 분기
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() => setSearchParams({ year: String(next.year), quarter: String(next.quarter) })}
        >
          다음 분기
        </button>
      </div>

      <div className="card">
        <h2>{toQuarterLabel(year, quarter)}</h2>
        {!state.hasData && <p className="muted">기록을 많이 남길수록 분석이 정확해져요.</p>}
        <p>총 지출 {formatCurrency(state.metrics.totalSpendAmount)}</p>
        <p>기준치 대비 절감 {formatCurrency(state.metrics.totalSavingAmount)}</p>
        <p>기준치 대비 초과 지출 {formatCurrency(state.metrics.totalOverspendAmount)}</p>
        <p>기록일 {state.metrics.totalRecordDays}일</p>
        <p>절감일 {state.metrics.totalSavingDays}일</p>
        <p className="muted">절감 추정 근거: {state.baselineSummary}</p>
        <p className="muted">기록 기반 추정</p>
      </div>

      <div className="actions horizontal">
        <button type="button" className="btn primary" onClick={handlePdfSave}>
          PDF로 저장하기
        </button>
        <Link to={`/report/monthly?month=${getQuarterMonths(year, quarter)[2]}`} className="btn secondary">
          월간 리포트
        </Link>
      </div>
    </section>
  );
}
