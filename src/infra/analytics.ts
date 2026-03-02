type EventProperties = Record<string, string | number | boolean | null | undefined>;
import { isAppsInTossRuntime, sendAnalyticsEvent } from './appsInToss';

export const track = (eventName: string, properties?: EventProperties): void => {
  void (async () => {
    if (isAppsInTossRuntime()) {
      try {
        await sendAnalyticsEvent(eventName, properties);
        return;
      } catch {
        // SDK 호출 실패 시 로컬 로깅으로 fallback
      }
    }

    if (import.meta.env.DEV) {
      console.info('[analytics]', eventName, properties ?? {});
    }
  })();
};
