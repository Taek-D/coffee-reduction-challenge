import { appsInTossStorage, isAppsInTossRuntime } from '../appsInToss';
import { LocalStorageStore } from './localStorageStore';
import { NativeStorageStub } from './nativeStorageStub';
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

export function createAppStorage(): KeyValueStore {
  const localFallback = new LocalStorageStore();

  if (isAppsInTossRuntime()) {
    return new NativeStorageStub(appsInTossStorage, localFallback);
  }

  const nativeStorage = window.__APP_IN_TOSS_STORAGE__;
  if (nativeStorage) {
    return new NativeStorageStub(nativeStorage, localFallback);
  }

  return localFallback;
}
