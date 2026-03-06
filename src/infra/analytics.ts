type EventProperties = Record<string, string | number | boolean | null | undefined>;

const isAppsInTossRuntime = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    (typeof (window as { AppsInToss?: unknown }).AppsInToss !== 'undefined' ||
      typeof (window as { ReactNativeWebView?: unknown }).ReactNativeWebView !== 'undefined')
  );
};

export const track = (eventName: string, properties?: EventProperties): void => {
  void (async () => {
    if (isAppsInTossRuntime()) {
      try {
        const { sendAnalyticsEvent } = await import('./appsInToss');
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
