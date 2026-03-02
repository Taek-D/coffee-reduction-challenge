import { Analytics, IAP, Storage, appLogin, saveBase64Data } from '@apps-in-toss/web-framework';
import { PREMIUM_PLAN_DEFINITIONS, PREMIUM_PLANS } from '../domain/premium';

type Primitive = string | number | boolean | null | undefined;
type EventProperties = Record<string, Primitive>;

export interface IapProduct {
  sku: string;
  type: 'CONSUMABLE' | 'NON_CONSUMABLE' | 'SUBSCRIPTION';
  displayName: string;
  displayAmount: string;
  description: string;
  amount?: number;
  currency?: string;
}

export interface IapPurchaseResult {
  orderId: string;
  sku: string;
  displayName: string;
  displayAmount: string;
  amount: number;
  currency: string;
}

export interface IapPendingOrder {
  orderId: string;
  sku: string;
  paymentCompletedDate: string;
}

export interface SaveBase64FileResult {
  mode: 'native' | 'browser_fallback';
}

export const isAppsInTossRuntime = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    (typeof (window as { AppsInToss?: unknown }).AppsInToss !== 'undefined' ||
      typeof (window as { ReactNativeWebView?: unknown }).ReactNativeWebView !== 'undefined')
  );
};

const isLocalDevRuntime = (): boolean => import.meta.env.DEV || import.meta.env.MODE === 'test';

const FALLBACK_PRODUCTS: IapProduct[] = PREMIUM_PLANS.map((plan) => {
  const definition = PREMIUM_PLAN_DEFINITIONS[plan];
  return {
    sku: definition.sku,
    type: 'CONSUMABLE',
    displayName: definition.title,
    displayAmount: definition.defaultDisplayAmount,
    description: `Premium access for ${definition.durationDays} days`,
  };
});

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const maybeCode = (error as { code?: unknown }).code;
    if (typeof maybeCode === 'string') {
      return maybeCode;
    }
  }
  return 'UNKNOWN_ERROR';
};

export const appsInTossStorage = {
  async getItem(key: string): Promise<string | null> {
    return Storage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await Storage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await Storage.removeItem(key);
  },
};

const toBytesFromBase64 = (data: string): Uint8Array => {
  const binary = window.atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const toAnalyticsParams = (
  eventName: string,
  properties?: EventProperties,
): Record<string, Primitive> => {
  const params: Record<string, Primitive> = {
    log_name: eventName,
  };
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      params[key] = value;
    });
  }
  return params;
};

export const sendAnalyticsEvent = async (
  eventName: string,
  properties?: EventProperties,
): Promise<void> => {
  const params = toAnalyticsParams(eventName, properties);
  if (eventName.endsWith('_view')) {
    await Analytics.screen(params);
    return;
  }
  await Analytics.click(params);
};

export interface AppLoginResult {
  authorizationCode: string;
  referrer: 'DEFAULT' | 'SANDBOX';
}

export const loginWithTossApp = async (): Promise<AppLoginResult> => {
  return appLogin();
};

export const getIapProductList = async (): Promise<IapProduct[]> => {
  if (!isAppsInTossRuntime()) {
    if (!isLocalDevRuntime()) {
      return [];
    }
    return FALLBACK_PRODUCTS;
  }

  try {
    const response = await IAP.getProductItemList();
    if (!response?.products?.length) {
      return FALLBACK_PRODUCTS;
    }
    return response.products.map((product) => ({
      sku: product.sku,
      type: product.type,
      displayName: product.displayName,
      displayAmount: product.displayAmount,
      description: product.description,
    }));
  } catch {
    return FALLBACK_PRODUCTS;
  }
};

export const createIapOrder = async (sku: string): Promise<IapPurchaseResult> => {
  if (!isAppsInTossRuntime()) {
    if (!isLocalDevRuntime()) {
      throw new Error('IAP_RUNTIME_REQUIRED');
    }

    const localProduct = FALLBACK_PRODUCTS.find((item) => item.sku === sku);
    return {
      orderId: `local_${sku}_${Date.now()}`,
      sku,
      displayName: localProduct?.displayName ?? sku,
      displayAmount: localProduct?.displayAmount ?? '0��',
      amount: 0,
      currency: 'KRW',
    };
  }

  return new Promise<IapPurchaseResult>((resolve, reject) => {
    let settled = false;
    let cleanup: (() => void) | undefined;

    const complete = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        cleanup?.();
      } catch {
        // no-op
      }
      callback();
    };

    try {
      cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku,
          processProductGrant: () => true,
        },
        onEvent: (event) => {
          if (event.type === 'success') {
            complete(() => {
              resolve({
                orderId: event.data.orderId,
                sku,
                displayName: event.data.displayName,
                displayAmount: event.data.displayAmount,
                amount: event.data.amount,
                currency: event.data.currency,
              });
            });
          } else {
            complete(() => {
              reject(new Error(`IAP_EVENT_${String(event.type).toUpperCase()}`));
            });
          }
        },
        onError: (error) => {
          complete(() => {
            reject(new Error(toErrorMessage(error)));
          });
        },
      });
    } catch (error) {
      complete(() => {
        reject(new Error(toErrorMessage(error)));
      });
    }
  });
};

export const getPendingIapOrders = async (): Promise<IapPendingOrder[]> => {
  if (!isAppsInTossRuntime()) {
    return [];
  }

  try {
    const response = await IAP.getPendingOrders();
    return response.orders ?? [];
  } catch {
    return [];
  }
};

export const completeIapProductGrant = async (orderId: string): Promise<boolean> => {
  if (!isAppsInTossRuntime()) {
    return isLocalDevRuntime();
  }

  try {
    const result = await IAP.completeProductGrant({
      params: {
        orderId,
      },
    });
    return Boolean(result);
  } catch {
    return false;
  }
};

export const saveBase64File = async (params: {
  data: string;
  fileName: string;
  mimeType: string;
}): Promise<SaveBase64FileResult> => {
  if (isAppsInTossRuntime()) {
    try {
      await saveBase64Data(params);
      return { mode: 'native' };
    } catch {
      // fallback to browser download
    }
  }

  const bytes = toBytesFromBase64(params.data);
  const buffer = Uint8Array.from(bytes).buffer;
  const blob = new Blob([buffer], { type: params.mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = params.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
  return { mode: 'browser_fallback' };
};
