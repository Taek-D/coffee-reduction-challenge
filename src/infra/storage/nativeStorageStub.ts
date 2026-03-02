import type { KeyValueStore } from './types';
import { LocalStorageStore } from './localStorageStore';

export interface NativeStorageSdkLike {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
  getKeysByPrefix?(prefix: string): Promise<string[]> | string[];
}

export class NativeStorageStub implements KeyValueStore {
  private readonly sdk: NativeStorageSdkLike;
  private readonly fallback: LocalStorageStore;

  constructor(sdk: NativeStorageSdkLike, fallback: LocalStorageStore) {
    this.sdk = sdk;
    this.fallback = fallback;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const result = await this.sdk.getItem(key);
      return result ?? null;
    } catch {
      return this.fallback.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.sdk.setItem(key, value);
    } catch {
      await this.fallback.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.sdk.removeItem(key);
    } catch {
      await this.fallback.removeItem(key);
    }
  }

  async getKeysByPrefix(prefix: string): Promise<string[]> {
    if (this.sdk.getKeysByPrefix) {
      try {
        return this.sdk.getKeysByPrefix(prefix);
      } catch {
        return this.fallback.getKeysByPrefix(prefix);
      }
    }
    return this.fallback.getKeysByPrefix(prefix);
  }
}
