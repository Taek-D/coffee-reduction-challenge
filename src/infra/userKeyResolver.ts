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

export const isUserKeyExchangeConfigured = (): boolean => getExchangeEndpoint() !== null;

export async function resolveUserKeyFromAuthorizationCode(
  loginResult: AppLoginResult,
): Promise<UserKeyResolution> {
  const endpoint = getExchangeEndpoint();
  if (!endpoint) {
    return {
      ok: false,
      reason: '자동 식별 연동이 준비되지 않아 현재 기기 식별값으로 계속해야 해요.',
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
        reason: `식별값 교환 요청이 실패했어요. (${response.status})`,
      };
    }

    const payload = (await response.json()) as ExchangeResponse;
    const rawUserKey = payload.userKey ?? payload.data?.userKey;
    if (!rawUserKey) {
      return {
        ok: false,
        reason: '식별값 응답이 비어 있어 현재 기기 식별값으로 계속해야 해요.',
      };
    }

    return {
      ok: true,
      userKey: String(rawUserKey),
    };
  } catch {
    return {
      ok: false,
      reason: '자동 식별 중 네트워크 오류가 발생했어요.',
    };
  }
}
