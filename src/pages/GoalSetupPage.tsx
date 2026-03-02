import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Skeleton, TextField } from '@toss/tds-mobile';
import { track } from '../infra/analytics';
import { useAppContext } from '../state/AppContext';
import { parseNumberInput } from '../shared/format';
import { todayDateIso } from '../shared/date';
import type { GoalType } from '../domain/models';
import { validateGoalForm, type GoalFormErrors } from '../domain/validation';

export function GoalSetupPage() {
  const navigate = useNavigate();
  const { activeUserKey, repository } = useAppContext();

  const [goalType, setGoalType] = useState<GoalType>('weekly_limit');
  const [weeklyLimit, setWeeklyLimit] = useState('7');
  const [monthlyBudget, setMonthlyBudget] = useState('99000');
  const [baselineAvgPerDay, setBaselineAvgPerDay] = useState('1');
  const [unitAmount, setUnitAmount] = useState('4500');
  const [errors, setErrors] = useState<GoalFormErrors>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [goal, baseline] = await Promise.all([
        repository.getGoal(activeUserKey),
        repository.resolveBaselineForDate(activeUserKey, todayDateIso()),
      ]);

      if (goal) {
        setGoalType(goal.goal_type);
        if (goal.weekly_limit !== undefined) {
          setWeeklyLimit(String(goal.weekly_limit));
        }
        if (goal.monthly_budget !== undefined) {
          setMonthlyBudget(String(goal.monthly_budget));
        }
      }

      if (baseline) {
        setBaselineAvgPerDay(String(baseline.avg_per_day));
        setUnitAmount(String(baseline.unit_amount));
      }

      setLoading(false);
    };

    track('goal_view', { entry_point: 'goal_setup' });
    void load();
  }, [activeUserKey, repository]);

  const input = useMemo(
    () => ({
      goalType,
      weeklyLimit: parseNumberInput(weeklyLimit),
      monthlyBudget: parseNumberInput(monthlyBudget),
      baselineAvgPerDay: parseNumberInput(baselineAvgPerDay),
      unitAmount: parseNumberInput(unitAmount),
    }),
    [baselineAvgPerDay, goalType, monthlyBudget, unitAmount, weeklyLimit],
  );

  const handleSave = async () => {
    const validationErrors = validateGoalForm(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      track('goal_save', { result: 'fail', goal_type: goalType });
      return;
    }

    await repository.saveGoal({
      userKey: activeUserKey,
      goal_type: goalType,
      ...(goalType === 'weekly_limit'
        ? { weekly_limit: input.weeklyLimit ?? undefined }
        : { monthly_budget: input.monthlyBudget ?? undefined }),
    });

    await repository.addBaselineVersion({
      userKey: activeUserKey,
      effective_from: todayDateIso(),
      avg_per_day: input.baselineAvgPerDay ?? 0,
      unit_amount: input.unitAmount ?? 4500,
    });

    setErrors({});
    track('goal_save', { result: 'success', goal_type: goalType });
    navigate('/today');
  };

  const selectGoalType = (type: GoalType) => {
    setGoalType(type);
    track('goal_type_select', { type });
  };

  if (loading) {
    return (
      <section className="screen">
        <Skeleton height={72} />
      </section>
    );
  }

  return (
    <section className="screen form-screen">
      <h1>목표/기준 설정</h1>

      <fieldset className="form">
        <legend>목표 유형</legend>
        <label>
          <input
            type="radio"
            name="goalType"
            checked={goalType === 'weekly_limit'}
            onChange={() => selectGoalType('weekly_limit')}
          />
          주 n회 이하
        </label>
        <label>
          <input
            type="radio"
            name="goalType"
            checked={goalType === 'monthly_budget'}
            onChange={() => selectGoalType('monthly_budget')}
          />
          월 예산
        </label>
      </fieldset>

      <div className="form">
        {goalType === 'weekly_limit' && (
          <>
            <label htmlFor="weeklyLimit">주간 횟수 (0~50)</label>
            <TextField
              variant="box"
              id="weeklyLimit"
              inputMode="numeric"
              value={weeklyLimit}
              onChange={(event) => setWeeklyLimit(event.target.value)}
            />
            {errors.weeklyLimit && <p className="error">{errors.weeklyLimit}</p>}
          </>
        )}

        {goalType === 'monthly_budget' && (
          <>
            <label htmlFor="monthlyBudget">월 예산 (0~5,000,000)</label>
            <TextField
              variant="box"
              id="monthlyBudget"
              inputMode="numeric"
              value={monthlyBudget}
              onChange={(event) => setMonthlyBudget(event.target.value)}
            />
            {errors.monthlyBudget && <p className="error">{errors.monthlyBudget}</p>}
          </>
        )}

        <label htmlFor="baselineAvgPerDay">평소 하루 커피 잔수 (0~20)</label>
        <TextField
          variant="box"
          id="baselineAvgPerDay"
          inputMode="numeric"
          value={baselineAvgPerDay}
          onChange={(event) => setBaselineAvgPerDay(event.target.value)}
        />
        {errors.baselineAvgPerDay && <p className="error">{errors.baselineAvgPerDay}</p>}

        <label htmlFor="unitAmount">평균 단가 (100~50,000)</label>
        <TextField
          variant="box"
          id="unitAmount"
          inputMode="numeric"
          value={unitAmount}
          onChange={(event) => setUnitAmount(event.target.value)}
        />
        {errors.unitAmount && <p className="error">{errors.unitAmount}</p>}
      </div>

      <Button color="primary" onClick={handleSave}>
        저장하기
      </Button>
    </section>
  );
}
