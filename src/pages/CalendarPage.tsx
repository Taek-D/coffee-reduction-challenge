import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Skeleton } from '@toss/tds-mobile';
import { calculateDailyMetrics } from '../domain/calculations';
import type { BaselineVersion, Entry } from '../domain/models';
import { track } from '../infra/analytics';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { addMonths, currentMonthKey, formatDateIso, getDaysInMonth } from '../shared/date';
import { formatCurrency } from '../shared/format';

interface CalendarState {
  entries: Entry[];
  baselines: BaselineVersion[];
  savingAmount: number;
  totalRecordDays: number;
  totalCoffeeCount: number;
  totalSavingDays: number;
}

const resolveBaseline = (baselines: BaselineVersion[], date: string): BaselineVersion | null => {
  const filtered = baselines.filter((item) => item.effective_from <= date);
  return filtered.at(-1) ?? null;
};

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month') ?? currentMonthKey();
  const navigate = useNavigate();
  const { activeUserKey, repository } = useAppContext();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<CalendarState>({
    entries: [],
    baselines: [],
    savingAmount: 0,
    totalRecordDays: 0,
    totalCoffeeCount: 0,
    totalSavingDays: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [entries, baselines, summary] = await Promise.all([
        repository.listEntriesForMonth(activeUserKey, month),
        repository.getBaselines(activeUserKey),
        repository.getMonthlySummary(activeUserKey, month),
      ]);
      setState({
        entries,
        baselines,
        savingAmount: summary.savingAmount,
        totalRecordDays: summary.totalRecordDays,
        totalCoffeeCount: summary.totalCoffeeCount,
        totalSavingDays: summary.totalSavingDays,
      });
      setLoading(false);
    };

    track('calendar_view', { month });
    void load();
  }, [activeUserKey, month, repository]);

  const entryMap = useMemo(
    () => new Map(state.entries.map((entry) => [entry.date, entry])),
    [state.entries],
  );

  const dayStatuses = getDaysInMonth(month).map((date) => {
    const entry = entryMap.get(date);
    if (!entry) {
      return { date, label: '─' };
    }
    const baseline = resolveBaseline(state.baselines, date);
    if (!baseline) {
      return { date, label: '☕' };
    }
    const daily = calculateDailyMetrics({
      coffeeCount: entry.coffee_count,
      unitAmount: entry.unit_amount,
      baselineAvgPerDay: baseline.avg_per_day,
      baselineUnitAmount: baseline.unit_amount,
    });
    return { date, label: daily.savingDaily > 0 ? '✓' : '☕' };
  });

  if (loading) {
    return (
      <section className="screen">
        <Skeleton height={72} />
      </section>
    );
  }

  const hasAnyRecord = state.totalRecordDays > 0;

  const handleShare = async () => {
    const shareText = `이번 달 커피 기록 요약\n총 기록일 ${state.totalRecordDays}일\n커피 횟수 ${state.totalCoffeeCount}회\n절감 금액 예상 ${formatCurrency(state.savingAmount)}\n(기록 기반 추정)`;
    track('report_share_click', { month });
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      track('report_share_result', { result: 'success', month });
      showToast('공유 문구를 준비했어요.');
    } catch {
      track('report_share_result', { result: 'fail', month });
      showToast('공유에 실패했어요. 다시 시도해요.');
    }
  };

  return (
    <section className="screen">
      <h1>{month}</h1>
      <div className="actions horizontal">
        <Button
          color="light"
          variant="weak"
          onClick={() => setSearchParams({ month: addMonths(month, -1) })}
        >
          ◀ 이전 달
        </Button>
        <Button
          color="light"
          variant="weak"
          onClick={() => setSearchParams({ month: addMonths(month, 1) })}
        >
          다음 달 ▶
        </Button>
      </div>

      <div className="card">
        <h2>달력</h2>
        <p className="muted">(☕ 기록일 / ✓ 절감일 / ─ 미기록)</p>
        <div className="calendar-grid">
          {dayStatuses.map((item) => (
            <button
              key={item.date}
              type="button"
              className="calendar-cell"
              onClick={() => {
                track('calendar_day_select', { date: item.date });
                navigate(`/today?date=${formatDateIso(item.date)}`);
              }}
            >
              <span>{item.date.slice(8, 10)}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>이번 달 요약</h2>
        {!hasAnyRecord && <p className="muted">기록이 쌓이면 패턴을 보여드려요.</p>}
        <p>총 기록일 {state.totalRecordDays}일</p>
        <p>커피 횟수 {state.totalCoffeeCount}회</p>
        <p>절감 횟수 {state.totalSavingDays}회</p>
        <p>절감 금액 예상 {formatCurrency(state.savingAmount)}</p>
        <p className="muted">기록 기반 추정</p>
      </div>

      <div className="actions horizontal">
        <Link to="/goal/setup" className="btn secondary">
          목표 재설정
        </Link>
        <Button
          color="light"
          variant="weak"
          onClick={handleShare}
        >
          리포트 공유
        </Button>
        <Link to={`/report/monthly?month=${month}`} className="btn secondary">
          고급 리포트
        </Link>
      </div>
    </section>
  );
}
