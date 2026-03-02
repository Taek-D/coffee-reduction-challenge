import type { GoalType } from './models';

export interface GoalFormInput {
  goalType: GoalType;
  weeklyLimit: number | null;
  monthlyBudget: number | null;
  baselineAvgPerDay: number | null;
  unitAmount: number | null;
}

export interface GoalFormErrors {
  weeklyLimit?: string;
  monthlyBudget?: string;
  baselineAvgPerDay?: string;
  unitAmount?: string;
}

export function validateGoalForm(input: GoalFormInput): GoalFormErrors {
  const errors: GoalFormErrors = {};

  if (input.goalType === 'weekly_limit') {
    if (input.weeklyLimit === null || input.weeklyLimit < 0 || input.weeklyLimit > 50) {
      errors.weeklyLimit = '횟수는 0 이상으로 입력해요.';
    }
  }

  if (input.goalType === 'monthly_budget') {
    if (
      input.monthlyBudget === null ||
      input.monthlyBudget < 0 ||
      input.monthlyBudget > 5_000_000
    ) {
      errors.monthlyBudget = '금액은 0원 이상으로 입력해요.';
    }
  }

  if (
    input.baselineAvgPerDay === null ||
    input.baselineAvgPerDay < 0 ||
    input.baselineAvgPerDay > 20
  ) {
    errors.baselineAvgPerDay = '잔수는 0 이상으로 입력해요.';
  }

  if (input.unitAmount === null || input.unitAmount < 100 || input.unitAmount > 50_000) {
    errors.unitAmount = '단가는 100원 이상으로 입력해요.';
  }

  return errors;
}
