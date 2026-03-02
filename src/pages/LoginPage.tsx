import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { track } from '../infra/analytics';
import { tryTossLogin } from '../infra/auth';
import { resolveUserKeyFromAuthorizationCode } from '../infra/userKeyResolver';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { setActiveUserKey } = useAppContext();
  const { showToast } = useToast();
  const [userKeyInput, setUserKeyInput] = useState('user_demo_001');
  const [loginNote, setLoginNote] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!userKeyInput.trim()) {
      showToast('userKey를 입력해요.');
      return;
    }
    await setActiveUserKey(userKeyInput);
    track('login_complete', { userKey: 'manual' });
    navigate('/goal/setup');
  };

  const handleTossLogin = async () => {
    setAuthorizing(true);
    const result = await tryTossLogin();
    setAuthorizing(false);

    if (!result.ok) {
      showToast(result.reason ?? '토스 로그인에 실패했어요.');
      return;
    }

    const resolved = await resolveUserKeyFromAuthorizationCode(result.result);
    if (resolved.ok && resolved.userKey) {
      setUserKeyInput(resolved.userKey);
      showToast('userKey를 자동으로 가져왔어요.');
    } else if (resolved.reason) {
      showToast(resolved.reason);
    }

    setLoginNote(
      `토스 로그인 인증을 완료했어요(referrer: ${result.result?.referrer ?? 'DEFAULT'}).`,
    );
    track('login_complete', {
      via: 'appLogin',
      referrer: result.result?.referrer ?? 'DEFAULT',
    });
  };

  return (
    <section className="screen form-screen">
      <h1>토스 로그인</h1>
      <p className="muted">
        앱인토스 런타임에서는 토스 로그인 SDK를 호출해요. 서버 교환 엔드포인트가 설정되어 있으면 userKey를 자동으로 채우고, 없으면 userKey를 직접 입력해요.
      </p>

      <Button color="primary" onClick={handleTossLogin} disabled={authorizing}>
        {authorizing ? '인증 중...' : '토스 로그인 진행'}
      </Button>
      {loginNote && <p className="muted">{loginNote}</p>}

      <form className="form" onSubmit={handleLogin}>
        <label htmlFor="userKey">userKey</label>
        <input
          id="userKey"
          value={userKeyInput}
          onChange={(event) => setUserKeyInput(event.target.value)}
          placeholder="userKey"
        />
        <Button type="submit" color="primary">
          userKey 저장하고 시작하기
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
        닫기
      </Button>
    </section>
  );
}
