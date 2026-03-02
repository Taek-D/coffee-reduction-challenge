import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import type { BaselineVersion, Goal } from '../domain/models';
import { toPremiumStatusText } from '../domain/premium';
import { track } from '../infra/analytics';
import { getFreshPremiumStatus, restorePendingPremiumOrders } from '../infra/premiumService';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

export function SettingsPage() {
  const { activeUserKey, repository, resetCurrentUserData } = useAppContext();
  const { showToast } = useToast();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [baselines, setBaselines] = useState<BaselineVersion[]>([]);
  const [premiumText, setPremiumText] = useState('무료');
  const [confirmReset, setConfirmReset] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [goalData, premium, baselineList] = await Promise.all([
        repository.getGoal(activeUserKey),
        getFreshPremiumStatus(repository, activeUserKey),
        repository.getBaselines(activeUserKey),
      ]);
      setGoal(goalData);
      setBaselines(baselineList);
      setPremiumText(toPremiumStatusText(premium));
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
      showToast('초기화에 실패했어요. 다시 시도해요.');
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
        showToast(`구매 ${result.restored}건을 복원했어요.`);
        track('restore_result', { result: 'success', count: result.restored });
      } else {
        showToast('복원할 구매가 없어요.');
        track('restore_result', { result: 'empty', count: 0 });
      }
    } catch {
      showToast('복원에 실패했어요. 다시 시도해요.');
      track('restore_result', { result: 'fail', count: 0 });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <section className="screen">
      <h1>설정</h1>

      <div className="card">
        <h2>계정</h2>
        <p>현재 userKey: {activeUserKey}</p>
      </div>

      <div className="card">
        <h2>목표/기준</h2>
        <p>목표 유형: {goal?.goal_type === 'monthly_budget' ? '월 예산' : '주 n회 이하'}</p>
        <p className="muted">
          기준 버전 {baselines.length}개 (최근 적용일: {baselines.at(-1)?.effective_from ?? '없음'})
        </p>
        <Link to="/goal/setup" className="btn secondary">
          목표/기준 수정
        </Link>
      </div>

      <div className="card">
        <h2>프리미엄 상태</h2>
        <p>{premiumText}</p>
        <Link to="/premium?entry=settings" className="btn secondary">
          프리미엄 보기
        </Link>
        <Button
          color="light"
          variant="weak"
          onClick={handleRestore}
          disabled={restoring}
        >
          {restoring ? '복원 중...' : '구매 복원'}
        </Button>
      </div>

      <div className="card">
        <h2>데이터 초기화</h2>
        <p className="muted">기록이 모두 삭제돼요. 되돌릴 수 없어요.</p>
        <Button color="danger" onClick={handleReset}>
          {confirmReset ? '초기화하기' : '초기화 확인'}
        </Button>
        {confirmReset && (
          <Button color="light" variant="weak" onClick={() => setConfirmReset(false)}>
            취소
          </Button>
        )}
      </div>

      <div className="card">
        <h2>약관</h2>
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
