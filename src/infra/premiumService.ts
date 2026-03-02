import type { CoffeeChallengeRepository } from '../data/repository';
import type { PremiumStatus } from '../domain/models';
import {
  PREMIUM_PLAN_DEFINITIONS,
  resolvePremiumPlanBySku,
  buildGrantedPremiumStatus,
  isPremiumActive,
  type PremiumPlan,
} from '../domain/premium';
import {
  completeIapProductGrant,
  createIapOrder,
  getIapProductList,
  getPendingIapOrders,
  type IapProduct,
  type IapPurchaseResult,
} from './appsInToss';

const rollbackPremiumStatus = async (params: {
  repository: CoffeeChallengeRepository;
  userKey: string;
  previous: PremiumStatus | null;
}): Promise<void> => {
  const { repository, userKey, previous } = params;
  if (!previous) {
    await repository.clearPremiumStatus(userKey);
    return;
  }
  await repository.savePremiumStatus(previous);
};

const ensurePremiumStatusFresh = async (
  repository: CoffeeChallengeRepository,
  userKey: string,
): Promise<PremiumStatus | null> => {
  const current = await repository.getPremiumStatus(userKey);
  if (!current) {
    return null;
  }
  if (isPremiumActive(current)) {
    return current;
  }
  if (current.is_premium) {
    const expired = {
      ...current,
      is_premium: false,
    };
    await repository.savePremiumStatus(expired);
    return expired;
  }
  return current;
};

export const loadPremiumProducts = async (): Promise<IapProduct[]> => {
  return getIapProductList();
};

export const getFreshPremiumStatus = async (
  repository: CoffeeChallengeRepository,
  userKey: string,
): Promise<PremiumStatus | null> => {
  return ensurePremiumStatusFresh(repository, userKey);
};

export const purchasePremiumPlan = async (params: {
  repository: CoffeeChallengeRepository;
  userKey: string;
  plan: PremiumPlan;
}): Promise<{
  purchase: IapPurchaseResult;
  status: PremiumStatus;
}> => {
  const { repository, userKey, plan } = params;
  const sku = PREMIUM_PLAN_DEFINITIONS[plan].sku;
  const purchase = await createIapOrder(sku);
  const current = await repository.getPremiumStatus(userKey);

  const nextStatus = buildGrantedPremiumStatus({
    current,
    userKey,
    plan,
    orderId: purchase.orderId,
  });
  await repository.savePremiumStatus(nextStatus);

  const completed = await completeIapProductGrant(purchase.orderId);
  if (!completed) {
    await rollbackPremiumStatus({ repository, userKey, previous: current });
    throw new Error('PRODUCT_GRANT_NOT_CONFIRMED');
  }

  return {
    purchase,
    status: nextStatus,
  };
};

export const restorePendingPremiumOrders = async (params: {
  repository: CoffeeChallengeRepository;
  userKey: string;
}): Promise<{
  restored: number;
  skipped: number;
}> => {
  const { repository, userKey } = params;
  const pendingOrders = await getPendingIapOrders();

  if (pendingOrders.length === 0) {
    return { restored: 0, skipped: 0 };
  }

  let restored = 0;
  let skipped = 0;

  for (const order of pendingOrders) {
    const plan = resolvePremiumPlanBySku(order.sku);
    if (!plan) {
      skipped += 1;
      continue;
    }

    const current = await repository.getPremiumStatus(userKey);
    const isSameOrder = current?.last_order_id === order.orderId;
    let grantedStatus: PremiumStatus | null = null;

    if (!isSameOrder) {
      grantedStatus = buildGrantedPremiumStatus({
        current,
        userKey,
        plan,
        orderId: order.orderId,
      });
      await repository.savePremiumStatus(grantedStatus);
    }

    const completed = await completeIapProductGrant(order.orderId);
    if (!completed) {
      if (!isSameOrder) {
        await rollbackPremiumStatus({ repository, userKey, previous: current });
      }
      throw new Error('PRODUCT_GRANT_NOT_CONFIRMED');
    }

    if (grantedStatus) {
      restored += 1;
    }
  }

  return { restored, skipped };
};
