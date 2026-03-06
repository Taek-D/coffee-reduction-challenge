import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Skeleton, TextField } from '@toss/tds-mobile';
import { calculateDailyMetrics } from '../domain/calculations';
import { DEFAULT_UNIT_AMOUNT, type BaselineVersion, type Entry } from '../domain/models';
import { track } from '../infra/analytics';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { formatDateLabel, getMonthFromDate, todayDateIso } from '../shared/date';
import { formatCurrency, parseNumberInput } from '../shared/format';

interface TodayState {
  entry: Entry | null;
  baseline: BaselineVersion | null;
  monthlySavingAmount: number;
}

export function TodayPage() {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date') ?? todayDateIso();
  const selectedMonth = getMonthFromDate(selectedDate);

  const { activeUserKey, repository, ensureDefaultsForCurrentUser } = useAppContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<TodayState>({
    entry: null,
    baseline: null,
    monthlySavingAmount: 0,
  });
  const [unitAmountInput, setUnitAmountInput] = useState('');

  const load = async () => {
    setLoading(true);
    await ensureDefaultsForCurrentUser();
    const [entry, baseline, monthlySummary] = await Promise.all([
      repository.getEntry(activeUserKey, selectedDate),
      repository.resolveBaselineForDate(activeUserKey, selectedDate),
      repository.getMonthlySummary(activeUserKey, selectedMonth),
    ]);

    setState({
      entry,
      baseline,
      monthlySavingAmount: monthlySummary.savingAmount,
    });
    setUnitAmountInput(String(entry?.unit_amount ?? baseline?.unit_amount ?? DEFAULT_UNIT_AMOUNT));
    setLoading(false);
  };

  useEffect(() => {
    track('today_view', { date: selectedDate });
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserKey, selectedDate]);

  const metrics = useMemo(() => {
    if (!state.entry || !state.baseline) {
      return null;
    }
    return calculateDailyMetrics({
      coffeeCount: state.entry.coffee_count,
      unitAmount: state.entry.unit_amount,
      baselineAvgPerDay: state.baseline.avg_per_day,
      baselineUnitAmount: state.baseline.unit_amount,
    });
  }, [state.baseline, state.entry]);

  const currentCount = state.entry?.coffee_count ?? 0;
  const draftUnitAmount = parseNumberInput(unitAmountInput);
  const visibleUnitAmount =
    state.entry?.unit_amount ?? draftUnitAmount ?? state.baseline?.unit_amount ?? DEFAULT_UNIT_AMOUNT;

  const adjustCount = async (delta: number) => {
    if (delta < 0 && currentCount === 0) {
      return;
    }

    try {
      const nextEntry =
        !state.entry && delta > 0
          ? await repository.upsertEntry(activeUserKey, selectedDate, {
              coffee_count: 1,
              unit_amount: visibleUnitAmount,
            })
          : await repository.adjustCoffeeCount(activeUserKey, selectedDate, delta);

      track('entry_adjust', {
        date: selectedDate,
        delta,
        new_count: nextEntry.coffee_count,
      });
      await load();
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.');
    }
  };

  const saveUnitAmount = async () => {
    const value = parseNumberInput(unitAmountInput);
    if (value === null || value < 100 || value > 50_000) {
      showToast('단가는 100원 이상으로 입력해 주세요.');
      return;
    }

    if (!state.entry) {
      setUnitAmountInput(String(value));
      showToast('첫 기록을 추가하면 이 단가가 함께 저장돼요.');
      return;
    }

    try {
      await repository.setEntryUnitAmount(activeUserKey, selectedDate, value);
      track('unit_amount_edit_save', { unit_amount: value });
      await load();
    } catch {
      showToast('저장에 실패했어요. 다시 시도해 주세요.');
    }
  };

  if (loading) {
    return (
      <section className="screen">
        <Skeleton height={72} />
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>{formatDateLabel(selectedDate)}</h1>

      <div className="card">
        <h2>오늘 커피 기록</h2>
        {currentCount === 0 && (
          <p className="muted">오늘 기록이 없어요. + 버튼을 눌러 첫 기록을 시작해 보세요.</p>
        )}
        <div className="counter-row">
          <Button
            color="light"
            variant="weak"
            aria-label="커피 1잔 줄이기"
            onClick={() => adjustCount(-1)}
            disabled={currentCount === 0}
          >
            -
          </Button>
          <strong className="counter-value">{currentCount}</strong>
          <Button color="light" variant="weak" aria-label="커피 1잔 추가" onClick={() => adjustCount(1)}>
            +
          </Button>
          <span>{formatCurrency(visibleUnitAmount)}</span>
        </div>
      </div>

      <div className="card">
        <p>오늘 지출 {formatCurrency((state.entry?.coffee_count ?? 0) * visibleUnitAmount)}</p>
        <p>오늘 절감 {formatCurrency(metrics?.savingDaily ?? 0)}</p>
        <p className="muted">기록 기반 추정</p>
      </div>

      <div className="card">
        <h2>이번 달 누적 절감</h2>
        <p>절감 예상 {formatCurrency(state.monthlySavingAmount)}</p>
        <p className="muted">기록 기반 추정</p>
      </div>

      <div className="card form">
        <label htmlFor="unitAmountEdit">단가 수정 (100~50,000)</label>
        <TextField
          variant="box"
          id="unitAmountEdit"
          inputMode="numeric"
          value={unitAmountInput}
          onChange={(event) => setUnitAmountInput(event.target.value)}
        />
        {!state.entry && (
          <p className="muted">아직 기록이 없어요. 저장한 단가는 첫 기록을 추가할 때 함께 반영돼요.</p>
        )}
        <Button color="light" variant="weak" onClick={saveUnitAmount}>
          단가 저장
        </Button>
      </div>

      <div className="actions horizontal">
        <Link to={`/calendar?month=${selectedMonth}`} className="btn secondary">
          달력 보기
        </Link>
        <Link to="/goal/setup" className="btn secondary">
          목표 설정
        </Link>
      </div>
    </section>
  );
}
