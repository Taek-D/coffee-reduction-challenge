import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@toss/tds-mobile';
import { track } from '../infra/analytics';
import { tryTossLogin } from '../infra/auth';
import {
  isUserKeyExchangeConfigured,
  resolveUserKeyFromAuthorizationCode,
} from '../infra/userKeyResolver';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

const maskUserKey = (userKey: string): string => {
  if (userKey.length <= 10) {
    return userKey;
  }

  return `${userKey.slice(0, 5)}...${userKey.slice(-4)}`;
};

export function LoginPage() {
  const navigate = useNavigate();
  const { activeUserKey, deviceLocalUserKey, setActiveUserKey } = useAppContext();
  const { showToast } = useToast();
  const [userKeyInput, setUserKeyInput] = useState('');
  const [loginNote, setLoginNote] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState(false);

  useEffect(() => {
    if (activeUserKey && activeUserKey !== deviceLocalUserKey) {
      setUserKeyInput(activeUserKey);
    }
  }, [activeUserKey, deviceLocalUserKey]);

  const completeLogin = async (params: {
    nextUserKey: string;
    via: 'appLogin' | 'device_local' | 'manual';
    resolved?: boolean;
    referrer?: 'DEFAULT' | 'SANDBOX';
  }) => {
    await setActiveUserKey(params.nextUserKey);
    track('login_complete', {
      via: params.via,
      user_key_resolved: params.resolved,
      referrer: params.referrer,
    });
    navigate('/goal/setup');
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!userKeyInput.trim()) {
      showToast('식별값을 입력해 주세요.');
      return;
    }

    await completeLogin({
      nextUserKey: userKeyInput.trim(),
      via: 'manual',
      resolved: false,
    });
  };

  const handleDeviceLocalStart = async () => {
    await completeLogin({
      nextUserKey: deviceLocalUserKey,
      via: 'device_local',
      resolved: false,
    });
  };

  const handleTossLogin = async () => {
    setAuthorizing(true);
    setLoginNote(null);
    const result = await tryTossLogin();
    setAuthorizing(false);

    if (!result.ok) {
      showToast(result.reason ?? '토스 로그인에 실패했어요.');
      setLoginNote('토스 로그인 없이도 현재 기기 식별값으로 바로 시작할 수 있어요.');
      return;
    }

    const resolved = await resolveUserKeyFromAuthorizationCode(result.result);
    if (resolved.ok && resolved.userKey) {
      showToast('토스 인증으로 사용할 식별값을 연결했어요.');
      await completeLogin({
        nextUserKey: resolved.userKey,
        via: 'appLogin',
        resolved: true,
        referrer: result.result.referrer,
      });
      return;
    }

    setLoginNote(resolved.reason ?? '토스 인증은 완료했지만 자동 식별 연결에는 실패했어요.');
    track('login_resolution_fallback', {
      via: 'appLogin',
      referrer: result.result.referrer ?? 'DEFAULT',
      exchange_configured: isUserKeyExchangeConfigured(),
    });
  };

  return (
    <section className="screen form-screen">
      <h1>로그인 또는 바로 시작하기</h1>
      <p className="muted">
        토스 로그인을 시도할 수 있지만 필수는 아니에요. 자동 식별 환경이 아니면 현재 기기에서만 쓰는
        식별값으로 시작하거나 직접 식별값을 입력해 데이터를 구분할 수 있어요.
      </p>

      <Button color="primary" onClick={handleTossLogin} disabled={authorizing}>
        {authorizing ? '인증 중...' : '토스 로그인 시도'}
      </Button>
      {loginNote && <p className="muted">{loginNote}</p>}

      <div className="card">
        <h2>현재 기기에서 바로 시작</h2>
        <p className="muted">
          기본 식별값 {maskUserKey(deviceLocalUserKey)} 을 사용해 바로 시작해요. 재설치하거나 다른
          기기로 옮기면 이 데이터는 자동 복원되지 않아요.
        </p>
        <Button color="light" variant="weak" onClick={handleDeviceLocalStart}>
          이 기기에서 바로 시작하기
        </Button>
      </div>

      <form className="form" onSubmit={handleLogin}>
        <label htmlFor="userKey">직접 식별값 입력</label>
        <TextField
          variant="box"
          id="userKey"
          value={userKeyInput}
          onChange={(event) => setUserKeyInput(event.target.value)}
          placeholder="예: family-01"
        />
        <p className="muted">같은 기기에서 여러 사람 데이터를 나눠 쓸 때만 직접 입력해 주세요.</p>
        <Button type="submit" color="primary">
          식별값 저장하고 시작하기
        </Button>
      </form>

      <div className="actions horizontal">
        <Link to="/terms" className="text-link">
          이용약관
        </Link>
        <Link to="/privacy" className="text-link">
          개인정보처리방침
        </Link>
      </div>

      <Button color="light" variant="weak" onClick={() => navigate('/onboarding/3')}>
        온보딩으로 돌아가기
      </Button>
    </section>
  );
}
