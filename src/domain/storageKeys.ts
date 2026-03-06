export const APP_STORAGE_KEYS = {
  activeUserKey: 'app:activeUserKey',
  deviceLocalUserKey: 'app:deviceLocalUserKey',
  onboardingCompleted: 'app:onboardingCompleted',
} as const;

export const userStorageKeys = {
  entriesPrefix: (userKey: string) => `${userKey}:entries:`,
  entriesIndex: (userKey: string) => `${userKey}:entries:index`,
  entry: (userKey: string, date: string) => `${userKey}:entries:${date}`,
  goal: (userKey: string) => `${userKey}:goal`,
  baselines: (userKey: string) => `${userKey}:baselines`,
  premium: (userKey: string) => `${userKey}:premium`,
};
