import { LocalStorageStore } from './localStorageStore';
import { NativeStorageStub, type NativeStorageSdkLike } from './nativeStorageStub';
import type { KeyValueStore } from './types';

declare global {
  interface Window {
    __APP_IN_TOSS_STORAGE__?: {
      getItem(key: string): Promise<string | null> | string | null;
      setItem(key: string, value: string): Promise<void> | void;
      removeItem(key: string): Promise<void> | void;
      getKeysByPrefix?(prefix: string): Promise<string[]> | string[];
    };
  }
}

const isAppsInTossRuntime = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    (typeof (window as { AppsInToss?: unknown }).AppsInToss !== 'undefined' ||
      typeof (window as { ReactNativeWebView?: unknown }).ReactNativeWebView !== 'undefined')
  );
};

const createLazyAppsInTossStorage = (): NativeStorageSdkLike => ({
  async getItem(key) {
    const { appsInTossStorage } = await import('../appsInToss');
    return appsInTossStorage.getItem(key);
  },
  async setItem(key, value) {
    const { appsInTossStorage } = await import('../appsInToss');
    await appsInTossStorage.setItem(key, value);
  },
  async removeItem(key) {
    const { appsInTossStorage } = await import('../appsInToss');
    await appsInTossStorage.removeItem(key);
  },
});

export function createAppStorage(): KeyValueStore {
  const localFallback = new LocalStorageStore();

  if (isAppsInTossRuntime()) {
    return new NativeStorageStub(createLazyAppsInTossStorage(), localFallback);
  }

  const nativeStorage = window.__APP_IN_TOSS_STORAGE__;
  if (nativeStorage) {
    return new NativeStorageStub(nativeStorage, localFallback);
  }

  return localFallback;
}
