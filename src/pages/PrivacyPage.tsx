import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <section className="screen">
      <h1>개인정보처리방침</h1>
      <p>수집 항목: 토스 로그인 식별값(userKey)</p>
      <p>저장 위치: 앱인토스 네이티브 저장소 SDK 또는 로컬 저장소</p>
      <p>사용 목적: 사용자별 기록 분리와 앱 기능 제공</p>
      <Link to="/settings" className="btn secondary">
        설정으로 돌아가기
      </Link>
    </section>
  );
}
