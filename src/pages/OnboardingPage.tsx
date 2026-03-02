import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { track } from '../infra/analytics';
import { useAppContext } from '../state/AppContext';

type Step = '1' | '2' | '3';

const STEP_CONTENT: Record<Step, { emoji: string; body: string[] }> = {
  '1': {
    emoji: '☕',
    body: [
      '하루 한 잔이',
      '한 달에 얼마인지 계산해봤어요?',
      '아메리카노 4,500원 × 22일',
      '= 99,000원',
      '1년이면 거의 120만 원이에요.',
    ],
  },
  '2': {
    emoji: '💰',
    body: [
      '커피를 끊으라는 앱이 아니에요.',
      '줄이는 만큼 돈이 쌓이는 걸',
      '눈으로 보여드리는 앱이에요.',
      '원탭으로 기록하면',
      '오늘 얼마 절감했는지 바로 알 수 있어요.',
    ],
  },
  '3': {
    emoji: '📊',
    body: [
      '목표 설정하고, 기록하고,',
      '한 달 후 내 지출 변화로 확인해요.',
      '"이번 달 커피 8번 줄여서',
      '36,000원 절감 예상"',
    ],
  },
};

export function OnboardingPage() {
  const { step } = useParams<{ step: Step }>();
  const navigate = useNavigate();
  const { onboardingCompleted, completeOnboarding, ensureDefaultsForCurrentUser } = useAppContext();
  const isValidStep = step === '1' || step === '2' || step === '3';

  useEffect(() => {
    if (!onboardingCompleted && isValidStep) {
      track('onboarding_view', { step: Number(step) });
    }
  }, [isValidStep, onboardingCompleted, step]);

  if (onboardingCompleted) {
    return <Navigate to="/today" replace />;
  }

  if (!isValidStep) {
    return <Navigate to="/onboarding/1" replace />;
  }

  const content = STEP_CONTENT[step];

  const handleNext = () => {
    track('onboarding_next', { step: Number(step) });
    navigate(`/onboarding/${Number(step) + 1}`);
  };

  const handleStart = async () => {
    await completeOnboarding();
    track('onboarding_cta_start');
    navigate('/login');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    await ensureDefaultsForCurrentUser();
    track('onboarding_skip');
    navigate('/today');
  };

  return (
    <section className="screen onboarding-screen">
      <p className="hero-emoji" aria-hidden="true">
        {content.emoji}
      </p>
      {content.body.map((line) => (
        <p key={line} className="hero-line">
          {line}
        </p>
      ))}

      <div className="actions">
        {step !== '3' && (
          <Button color="primary" onClick={handleNext}>
            다음
          </Button>
        )}
        {step === '3' && (
          <>
            <Button color="primary" onClick={handleStart}>
              챌린지 시작하기
            </Button>
            <Button color="light" variant="weak" onClick={handleSkip}>
              나중에
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
