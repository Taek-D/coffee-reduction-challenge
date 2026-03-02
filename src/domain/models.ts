export type GoalType = 'weekly_limit' | 'monthly_budget';

export interface Entry {
  id: string;
  userKey: string;
  date: string; // YYYY-MM-DD
  coffee_count: number;
  unit_amount: number;
}

export interface Goal {
  userKey: string;
  goal_type: GoalType;
  weekly_limit?: number;
  monthly_budget?: number;
}

export interface BaselineVersion {
  userKey: string;
  effective_from: string; // YYYY-MM-DD
  avg_per_day: number;
  unit_amount: number;
}

export interface PremiumStatus {
  userKey: string;
  is_premium: boolean;
  plan?: '30d' | '365d';
  purchased_at?: string;
  expires_at?: string;
  last_order_id?: string;
}

export const DEFAULT_UNIT_AMOUNT = 4500;
export const DEFAULT_BASELINE_AVG_PER_DAY = 1;
export const DEFAULT_WEEKLY_LIMIT = 7;
export const MAX_DAILY_COFFEE_COUNT = 99;
