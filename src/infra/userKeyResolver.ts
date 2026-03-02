import type { AppLoginResult } from './appsInToss';

interface ExchangeResponse {
  userKey?: string | number;
  data?: {
    userKey?: string | number;
  };
}

export interface UserKeyResolution {
  ok: boolean;
  userKey?: string;
  reason?: string;
}

const getExchangeEndpoint = (): string | null => {
  const endpoint = import.meta.env.VITE_APP_LOGIN_EXCHANGE_ENDPOINT;
  if (!endpoint || !endpoint.trim()) {
    return null;
  }
  return endpoint.trim();
};

export async function resolveUserKeyFromAuthorizationCode(
  loginResult: AppLoginResult,
): Promise<UserKeyResolution> {
  const endpoint = getExchangeEndpoint();
  if (!endpoint) {
    return {
      ok: false,
      reason: '서버 교환 엔드포인트가 없어 userKey 자동 획득을 건너뛰어요.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorizationCode: loginResult.authorizationCode,
        referrer: loginResult.referrer,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: `userKey 교환 요청이 실패했어요(${response.status}).`,
      };
    }

    const payload = (await response.json()) as ExchangeResponse;
    const rawUserKey = payload.userKey ?? payload.data?.userKey;
    if (!rawUserKey) {
      return {
        ok: false,
        reason: '응답에 userKey가 없어 자동 획득을 건너뛰어요.',
      };
    }

    return {
      ok: true,
      userKey: String(rawUserKey),
    };
  } catch {
    return {
      ok: false,
      reason: 'userKey 자동 획득 중 네트워크 오류가 발생했어요.',
    };
  }
}
