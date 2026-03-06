import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <section className="screen">
      <h1>이용약관</h1>

      <div className="card">
        <p className="muted">최종 업데이트: 2026년 3월 6일</p>
        <p>
          커피 줄이기 챌린지는 사용자가 입력한 커피 기록과 기준 설정을 바탕으로 현재 소비와 절감 추정치를
          보여주는 기록형 서비스예요.
        </p>
      </div>

      <div className="card">
        <h2>서비스 이용</h2>
        <ul className="check-list">
          <li>기록과 절감액은 사용자가 직접 입력한 값 기준으로 계산돼요.</li>
          <li>이 서비스는 의료, 건강 상담, 진단이나 치료를 대신하지 않아요.</li>
          <li>절감액은 기록 기반 추정치이며 실제 지출과 다를 수 있어요.</li>
          <li>무료 기능만으로도 기록, 달력, 기본 요약을 계속 사용할 수 있어요.</li>
        </ul>
      </div>

      <div className="card">
        <h2>프리미엄 이용권</h2>
        <ul className="check-list">
          <li>프리미엄은 30일 또는 365일 이용권 형태의 기간제 소모성 상품으로 제공돼요.</li>
          <li>자동 갱신 구독은 제공하지 않아요.</li>
          <li>구매 복원은 미결 주문 재처리만 지원하며, 완료 주문 이력 복원은 지원하지 않아요.</li>
          <li>재설치하거나 기기를 변경한 경우 프리미엄 상태는 자동 복원되지 않을 수 있어요.</li>
        </ul>
      </div>

      <div className="card">
        <h2>데이터 보관과 책임</h2>
        <ul className="check-list">
          <li>기록 데이터는 동일 기기 저장소를 기준으로 보관돼요.</li>
          <li>사용자가 직접 데이터를 초기화하거나 앱을 삭제하면 복구되지 않을 수 있어요.</li>
          <li>서비스 운영상 필요한 범위에서 기능, 화면, 상품 구성이 변경될 수 있어요.</li>
        </ul>
      </div>

      <Link to="/settings" className="btn secondary">
        설정으로 돌아가기
      </Link>
    </section>
  );
}
