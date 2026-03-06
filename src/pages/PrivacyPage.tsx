import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <section className="screen">
      <h1>개인정보처리방침</h1>

      <div className="card">
        <p className="muted">최종 업데이트: 2026년 3월 6일</p>
        <p>
          커피 줄이기 챌린지는 별도 자체 서버에 개인정보를 저장하지 않고, 동일 기기 저장소를 기준으로 기록
          데이터를 관리해요.
        </p>
      </div>

      <div className="card">
        <h2>수집하는 정보</h2>
        <ul className="check-list">
          <li>사용자 식별값(userKey 또는 현재 기기용 식별값)</li>
          <li>커피 기록, 목표 설정, 기준 소비량, 프리미엄 상태</li>
          <li>앱 화면 진입, 버튼 클릭 등 서비스 운영에 필요한 최소 분석 이벤트</li>
        </ul>
      </div>

      <div className="card">
        <h2>이용 목적</h2>
        <ul className="check-list">
          <li>사용자별 기록 분리와 기록 조회</li>
          <li>절감 추정치 계산, 프리미엄 기능 제공, 미결 주문 처리</li>
          <li>오류 대응과 기본적인 사용성 개선</li>
        </ul>
      </div>

      <div className="card">
        <h2>보관 위치와 기간</h2>
        <ul className="check-list">
          <li>데이터는 Apps-in-Toss Storage SDK 또는 브라우저 fallback 저장소에 보관돼요.</li>
          <li>같은 기기 안에서만 유지되며, 앱 삭제나 데이터 초기화 시 함께 삭제될 수 있어요.</li>
          <li>재설치나 기기 변경 시 자동 복원은 지원하지 않아요.</li>
        </ul>
      </div>

      <div className="card">
        <h2>제공과 위탁</h2>
        <ul className="check-list">
          <li>앱 운영자는 별도 자체 서버로 기록 데이터를 전송하지 않아요.</li>
          <li>토스 로그인, 인앱결제, 저장소 기능은 Apps-in-Toss 플랫폼 기능을 통해 처리돼요.</li>
        </ul>
      </div>

      <Link to="/settings" className="btn secondary">
        설정으로 돌아가기
      </Link>
    </section>
  );
}
