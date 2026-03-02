import type { PremiumStatus } from './models';
import { formatDateIso } from '../shared/date';

export type PremiumPlan = '30d' | '365d';

export interface PremiumPlanDefinition {
  plan: PremiumPlan;
  sku: string;
  durationDays: number;
  title: string;
  defaultDisplayAmount: string;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const PREMIUM_PLAN_DEFINITIONS: Record<PremiumPlan, PremiumPlanDefinition> = {
  '30d': {
    plan: '30d',
    sku: 'premium_30d',
    durationDays: 30,
    title: '30일 이용권',
    defaultDisplayAmount: '1,900원',
  },
  '365d': {
    plan: '365d',
    sku: 'premium_365d',
    durationDays: 365,
    title: '365일 이용권',
    defaultDisplayAmount: '14,900원',
  },
};

export const PREMIUM_PLANS: PremiumPlan[] = ['30d', '365d'];

const parseDateTime = (raw: string | undefined): Date | null => {
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

export const resolvePremiumPlanBySku = (sku: string): PremiumPlan | null => {
  if (sku === PREMIUM_PLAN_DEFINITIONS['30d'].sku) {
    return '30d';
  }
  if (sku === PREMIUM_PLAN_DEFINITIONS['365d'].sku) {
    return '365d';
  }
  return null;
};

export const isPremiumActive = (
  status: PremiumStatus | null,
  now: Date = new Date(),
): boolean => {
  if (!status?.is_premium || !status.expires_at) {
    return false;
  }
  const expiresAt = parseDateTime(status.expires_at);
  if (!expiresAt) {
    return false;
  }
  return expiresAt.getTime() > now.getTime();
};

export const normalizePremiumStatus = (
  status: PremiumStatus | null,
  now: Date = new Date(),
): PremiumStatus => {
  if (!status) {
    return {
      userKey: '',
      is_premium: false,
    };
  }

  if (!status.is_premium) {
    return status;
  }

  if (isPremiumActive(status, now)) {
    return status;
  }

  return {
    ...status,
    is_premium: false,
  };
};

export const buildGrantedPremiumStatus = (params: {
  current: PremiumStatus | null;
  userKey: string;
  plan: PremiumPlan;
  orderId: string;
  now?: Date;
}): PremiumStatus => {
  const now = params.now ?? new Date();
  const planDefinition = PREMIUM_PLAN_DEFINITIONS[params.plan];
  const currentExpiresAt = parseDateTime(params.current?.expires_at);

  const baseTimestamp =
    currentExpiresAt && currentExpiresAt.getTime() > now.getTime()
      ? currentExpiresAt.getTime()
      : now.getTime();
  const expiresAt = new Date(baseTimestamp + DAY_IN_MS * planDefinition.durationDays);

  return {
    userKey: params.userKey,
    is_premium: true,
    plan: params.plan,
    purchased_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    last_order_id: params.orderId,
  };
};

export const toPremiumStatusText = (
  status: PremiumStatus | null,
  now: Date = new Date(),
): string => {
  if (!status) {
    return '무료';
  }
  if (!isPremiumActive(status, now)) {
    return status.expires_at ? `만료됨 (만료 ${formatDateIso(status.expires_at)})` : '무료';
  }
  const expires = status.expires_at ?? '';
  const remainingDays = Math.max(
    1,
    Math.ceil((new Date(expires).getTime() - now.getTime()) / DAY_IN_MS),
  );
  return `이용중 (남은 ${remainingDays}일, 만료 ${formatDateIso(expires)})`;
};
