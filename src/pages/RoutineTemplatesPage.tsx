import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isPremiumActive } from '../domain/premium';
import { track } from '../infra/analytics';
import { getFreshPremiumStatus } from '../infra/premiumService';
import { useAppContext } from '../state/AppContext';
import { currentMonthKey } from '../shared/date';

const ROUTINES = [
  {
    title: '물 먼저 마시기',
    description: '커피를 고르기 전에 물 한 컵을 먼저 마셔요.',
  },
  {
    title: '짧은 산책',
    description: '5분만 걸으면서 기분 전환 시간을 만들어요.',
  },
  {
    title: '허브티 선택',
    description: '따뜻한 음료가 필요할 때 허브티로 바꿔요.',
  },
  {
    title: '스트레칭 3분',
    description: '자리에서 간단히 몸을 풀고 다시 시작해요.',
  },
  {
    title: '호흡 루틴',
    description: '30초 동안 호흡을 정리하고 다음 행동을 정해요.',
  },
];

export function RoutineTemplatesPage() {
  const navigate = useNavigate();
  const { activeUserKey, repository } = useAppContext();
  const [loading, setLoading] = useState(true);
  const currentMonth = currentMonthKey();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const premium = await getFreshPremiumStatus(repository, activeUserKey);
      if (!isPremiumActive(premium)) {
        navigate('/premium?entry=routine_templates', { replace: true });
        return;
      }
      track('routine_view');
      setLoading(false);
    };

    void load();
  }, [activeUserKey, navigate, repository]);

  if (loading) {
    return (
      <section className="screen">
        <div className="skeleton-box">불러오는 중이에요...</div>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>대체 루틴 템플릿</h1>
      <p className="muted">기분 전환 아이디어를 보고, 내 기록 흐름에 맞게 골라 써요.</p>
      {ROUTINES.map((routine) => (
        <div key={routine.title} className="card">
          <h2>{routine.title}</h2>
          <p>{routine.description}</p>
          <p className="muted">체크용 카드로 참고해 보세요.</p>
        </div>
      ))}

      <div className="actions horizontal">
        <Link to="/today" className="btn secondary">
          오늘로 돌아가기
        </Link>
        <Link to={`/report/monthly?month=${currentMonth}`} className="btn secondary">
          월간 리포트
        </Link>
      </div>
    </section>
  );
}
