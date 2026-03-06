import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Skeleton } from '@toss/tds-mobile';
import type { BaselineVersion, Goal } from '../domain/models';
import { toPremiumStatusText } from '../domain/premium';
import { track } from '../infra/analytics';
import { getFreshPremiumStatus, restorePendingPremiumOrders } from '../infra/premiumService';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

export function SettingsPage() {
  const { activeUserKey, deviceLocalUserKey, repository, resetCurrentUserData } = useAppContext();
  const { showToast } = useToast();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [baselines, setBaselines] = useState<BaselineVersion[]>([]);
  const [premiumText, setPremiumText] = useState('무료');
  const [confirmReset, setConfirmReset] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [goalData, premium, baselineList] = await Promise.all([
          repository.getGoal(activeUserKey),
          getFreshPremiumStatus(repository, activeUserKey),
          repository.getBaselines(activeUserKey),
        ]);
        setGoal(goalData);
        setBaselines(baselineList);
        setPremiumText(toPremiumStatusText(premium));
      } catch {
        // 설정 데이터 로드 실패 시 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    track('settings_view');
    void load();
  }, [activeUserKey, repository]);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    try {
      await resetCurrentUserData();
      setConfirmReset(false);
      showToast('초기화했어요.');
      track('data_reset_confirm');
    } catch {
      setConfirmReset(false);
      showToast('초기화에 실패했어요. 다시 시도해 주세요.');
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    track('premium_restore_click');
    try {
      const result = await restorePendingPremiumOrders({
        repository,
        userKey: activeUserKey,
      });
      const refreshed = await getFreshPremiumStatus(repository, activeUserKey);
      setPremiumText(toPremiumStatusText(refreshed));

      if (result.restored > 0) {
        showToast(`구매 ${result.restored}건을 다시 처리했어요.`);
        track('restore_result', { result: 'success', count: result.restored });
      } else {
        showToast('다시 처리할 미결 주문이 없어요.');
        track('restore_result', { result: 'empty', count: 0 });
      }
    } catch {
      showToast('미결 주문 확인에 실패했어요. 다시 시도해 주세요.');
      track('restore_result', { result: 'fail', count: 0 });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <section className="screen">
        <Skeleton height={72} />
      </section>
    );
  }

  const isDeviceLocalUser = activeUserKey === deviceLocalUserKey;
  const maskedUserKey =
    activeUserKey.length <= 10
      ? activeUserKey
      : `${activeUserKey.slice(0, 5)}...${activeUserKey.slice(-4)}`;

  return (
    <section className="screen">
      <h1>설정</h1>

      <div className="card">
        <h2>로그인/저장</h2>
        <p>현재 식별값: {maskedUserKey}</p>
        <p className="muted">
          {isDeviceLocalUser
            ? '현재 기기 전용 식별값으로 저장 중이에요.'
            : '직접 입력하거나 토스 인증으로 연결한 식별값으로 저장 중이에요.'}
        </p>
        <p className="muted">재설치하거나 기기를 바꾸면 데이터와 프리미엄 상태는 자동 복원되지 않아요.</p>
        <Link to="/login" className="btn secondary">
          로그인/식별값 다시 설정
        </Link>
      </div>

      <div className="card">
        <h2>목표/기준</h2>
        <p>목표 유형: {goal?.goal_type === 'monthly_budget' ? '월 예산' : '주간 잔수 제한'}</p>
        <p className="muted">
          기준 버전 {baselines.length}개 (최근 적용일 {baselines.at(-1)?.effective_from ?? '없음'})
        </p>
        <Link to="/goal/setup" className="btn secondary">
          목표/기준 수정
        </Link>
      </div>

      <div className="card">
        <h2>프리미엄 상태</h2>
        <p>{premiumText}</p>
        <p className="muted">
          구매 복원은 미결 주문을 다시 확인하는 기능이에요. 완료 주문 이력이나 새 기기 복원은 아직
          지원하지 않아요.
        </p>
        <Link to="/premium?entry=settings" className="btn secondary">
          프리미엄 보기
        </Link>
        <Button color="light" variant="weak" onClick={handleRestore} disabled={restoring}>
          {restoring ? '확인 중...' : '미결 주문 다시 확인'}
        </Button>
      </div>

      <div className="card">
        <h2>데이터 초기화</h2>
        <p className="muted">기록과 목표를 모두 삭제해요. 삭제 후에는 되돌릴 수 없어요.</p>
        <Button color="danger" onClick={handleReset}>
          {confirmReset ? '초기화 진행하기' : '초기화 확인'}
        </Button>
        {confirmReset && (
          <Button color="light" variant="weak" onClick={() => setConfirmReset(false)}>
            취소
          </Button>
        )}
      </div>

      <div className="card">
        <h2>문의/법적 안내</h2>
        <p className="muted">
          기능 오류나 결제 문의는 배포 시 앱인토스 콘솔에 등록한 고객센터 채널을 통해 안내돼요.
        </p>
        <div className="actions horizontal">
          <Link to="/terms" className="text-link">
            이용약관
          </Link>
          <Link to="/privacy" className="text-link">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </section>
  );
}
