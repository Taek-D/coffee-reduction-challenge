import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CoffeeChallengeRepository } from '../data/repository';
import {
  DEFAULT_BASELINE_AVG_PER_DAY,
  DEFAULT_UNIT_AMOUNT,
  DEFAULT_WEEKLY_LIMIT,
  type GoalType,
} from '../domain/models';
import { APP_STORAGE_KEYS } from '../domain/storageKeys';
import { createAppStorage } from '../infra/storage/createAppStorage';
import { todayDateIso } from '../shared/date';

const DEFAULT_BOOT_USER_KEY = 'local_booting';

const createDeviceLocalUserKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }

  return `local_${Math.random().toString(36).slice(2, 14)}`;
};

interface AppContextValue {
  ready: boolean;
  onboardingCompleted: boolean;
  activeUserKey: string;
  deviceLocalUserKey: string;
  repository: CoffeeChallengeRepository;
  completeOnboarding: () => Promise<void>;
  setActiveUserKey: (userKey: string) => Promise<void>;
  ensureDefaultsForCurrentUser: (goalType?: GoalType) => Promise<void>;
  resetCurrentUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const storage = useMemo(() => createAppStorage(), []);
  const repository = useMemo(() => new CoffeeChallengeRepository(storage), [storage]);

  const [ready, setReady] = useState(false);
  const [activeUserKey, setActiveUserKeyState] = useState(DEFAULT_BOOT_USER_KEY);
  const [deviceLocalUserKey, setDeviceLocalUserKey] = useState(DEFAULT_BOOT_USER_KEY);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      let localUserKey = await storage.getItem(APP_STORAGE_KEYS.deviceLocalUserKey);
      if (!localUserKey) {
        localUserKey = createDeviceLocalUserKey();
        await storage.setItem(APP_STORAGE_KEYS.deviceLocalUserKey, localUserKey);
      }

      const [storedUserKey, storedOnboarding] = await Promise.all([
        storage.getItem(APP_STORAGE_KEYS.activeUserKey),
        storage.getItem(APP_STORAGE_KEYS.onboardingCompleted),
      ]);
      const normalizedStoredUserKey = storedUserKey?.trim() || localUserKey;

      if (!storedUserKey?.trim()) {
        await storage.setItem(APP_STORAGE_KEYS.activeUserKey, normalizedStoredUserKey);
      }

      setDeviceLocalUserKey(localUserKey);
      setActiveUserKeyState(normalizedStoredUserKey);
      setOnboardingCompleted(storedOnboarding === '1');
      setReady(true);
    };
    void bootstrap();
  }, [storage]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    // 앱 재진입 시 미결 주문이 있으면 복원한다.
    let cancelled = false;

    void import('../infra/premiumService')
      .then(({ restorePendingPremiumOrders }) => {
        if (cancelled) {
          return;
        }

        return restorePendingPremiumOrders({
          repository,
          userKey: activeUserKey,
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [activeUserKey, ready, repository]);

  const completeOnboarding = useCallback(async () => {
    await storage.setItem(APP_STORAGE_KEYS.onboardingCompleted, '1');
    setOnboardingCompleted(true);
  }, [storage]);

  const setActiveUserKey = useCallback(
    async (userKey: string) => {
      const normalized = userKey.trim() || deviceLocalUserKey;
      await storage.setItem(APP_STORAGE_KEYS.activeUserKey, normalized);
      setActiveUserKeyState(normalized);
    },
    [deviceLocalUserKey, storage],
  );

  const ensureDefaultsForCurrentUser = useCallback(
    async (goalType: GoalType = 'weekly_limit') => {
      const date = todayDateIso();
      const [goal, baseline] = await Promise.all([
        repository.getGoal(activeUserKey),
        repository.resolveBaselineForDate(activeUserKey, date),
      ]);

      if (!goal) {
        await repository.saveGoal({
          userKey: activeUserKey,
          goal_type: goalType,
          ...(goalType === 'weekly_limit'
            ? { weekly_limit: DEFAULT_WEEKLY_LIMIT }
            : { monthly_budget: 99_000 }),
        });
      }

      if (!baseline) {
        await repository.addBaselineVersion({
          userKey: activeUserKey,
          effective_from: date,
          avg_per_day: DEFAULT_BASELINE_AVG_PER_DAY,
          unit_amount: DEFAULT_UNIT_AMOUNT,
        });
      }

    },
    [activeUserKey, repository],
  );

  const resetCurrentUserData = useCallback(async () => {
    await repository.clearUserData(activeUserKey);
    await ensureDefaultsForCurrentUser();
  }, [activeUserKey, ensureDefaultsForCurrentUser, repository]);

  const value: AppContextValue = {
    ready,
    onboardingCompleted,
    activeUserKey,
    deviceLocalUserKey,
    repository,
    completeOnboarding,
    setActiveUserKey,
    ensureDefaultsForCurrentUser,
    resetCurrentUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
