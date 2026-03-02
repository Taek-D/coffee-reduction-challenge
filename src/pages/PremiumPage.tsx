import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  PREMIUM_PLAN_DEFINITIONS,
  PREMIUM_PLANS,
  toPremiumStatusText,
  type PremiumPlan,
} from '../domain/premium';
import { track } from '../infra/analytics';
import { loadPremiumProducts, purchasePremiumPlan, getFreshPremiumStatus } from '../infra/premiumService';
import { useAppContext } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { currentMonthKey } from '../shared/date';

export function PremiumPage() {
  const [searchParams] = useSearchParams();
  const entryPoint = searchParams.get('entry') ?? 'unknown';
  const navigate = useNavigate();
  const { activeUserKey, repository } = useAppContext();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<PremiumPlan | null>(null);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [statusText, setStatusText] = useState('무료');
  const currentMonth = currentMonthKey();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [products, premiumStatus] = await Promise.all([
        loadPremiumProducts(),
        getFreshPremiumStatus(repository, activeUserKey),
      ]);
      setProductMap(
        products.reduce<Record<string, string>>((acc, product) => {
          acc[product.sku] = product.displayAmount;
          return acc;
        }, {}),
      );
      setStatusText(toPremiumStatusText(premiumStatus));
      setLoading(false);
    };

    track('premium_view', { entry_point: entryPoint });
    void load();
  }, [activeUserKey, entryPoint, repository]);

  const plans = useMemo(
    () =>
      PREMIUM_PLANS.map((plan) => {
        const definition = PREMIUM_PLAN_DEFINITIONS[plan];
        return {
          ...definition,
          displayAmount: productMap[definition.sku] ?? definition.defaultDisplayAmount,
        };
      }),
    [productMap],
  );

  const handlePurchase = async (plan: PremiumPlan) => {
    setProcessingPlan(plan);
    track('purchase_click', { plan });
    try {
      const result = await purchasePremiumPlan({
        repository,
        userKey: activeUserKey,
        plan,
      });
      setStatusText(toPremiumStatusText(result.status));
      track('purchase_success', { plan, orderId: result.purchase.orderId });
      showToast(`${PREMIUM_PLAN_DEFINITIONS[plan].title}이 시작됐어요.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown';
      track('purchase_fail', { reason });
      if (reason === 'IAP_RUNTIME_REQUIRED') {
        showToast('결제는 앱인토스 런타임에서만 가능해요.');
      } else {
        showToast('결제에 실패했어요. 다시 시도해요.');
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <section className="screen">
        <div className="skeleton-box">불러오는 중이에요...</div>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>프리미엄</h1>
      <div className="card">
        <p>절감 기록을 더 자세히 볼 수 있어요.</p>
        <ul className="check-list">
          <li>월간/분기 고급 리포트</li>
          <li>PDF 저장</li>
          <li>대체 루틴 템플릿</li>
        </ul>
        <p className="muted">현재 상태: {statusText}</p>
        <p className="muted">기간이 끝나도 무료 기능은 계속 사용할 수 있어요.</p>
      </div>

      <div className="card">
        {plans.map((plan) => (
          <button
            key={plan.plan}
            type="button"
            className="btn primary full-width"
            onClick={() => handlePurchase(plan.plan)}
            disabled={processingPlan !== null}
          >
            {processingPlan === plan.plan
              ? '결제창을 여는 중...'
              : `${plan.title} 구매하기 (${plan.displayAmount})`}
          </button>
        ))}
        <button
          type="button"
          className="btn secondary full-width"
          onClick={() => {
            track('premium_dismiss');
            navigate('/today');
          }}
        >
          무료로 계속 쓰기
        </button>
      </div>

      <div className="actions horizontal">
        <Link to={`/report/monthly?month=${currentMonth}`} className="btn secondary">
          월간 리포트
        </Link>
        <Link to="/routine-templates" className="btn secondary">
          루틴 템플릿
        </Link>
      </div>
    </section>
  );
}
