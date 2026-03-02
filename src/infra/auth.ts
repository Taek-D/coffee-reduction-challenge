import { isAppsInTossRuntime, loginWithTossApp, type AppLoginResult } from './appsInToss';

export type TossLoginAttempt =
  | {
      ok: true;
      result: AppLoginResult;
    }
  | {
      ok: false;
      reason: string;
    };

export async function tryTossLogin(): Promise<TossLoginAttempt> {
  if (!isAppsInTossRuntime()) {
    return {
      ok: false,
      reason: '앱인토스 런타임이 아니어서 토스 로그인을 실행할 수 없어요.',
    };
  }

  try {
    const result = await loginWithTossApp();
    return { ok: true, result };
  } catch {
    return {
      ok: false,
      reason: '토스 로그인에 실패했어요. 다시 시도해요.',
    };
  }
}
